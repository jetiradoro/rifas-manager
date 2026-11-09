<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Services;

use Grav\Common\Config\Config;
use Grav\Plugin\Api\Exceptions\ValidationException;

/**
 * Builds a structured password policy from Grav's single `system.pwd_regex`
 * string. Admin-next uses the result to render a live rule checklist and
 * strength meter without baking assumptions into the UI.
 *
 * Source of truth order:
 *   1. system.pwd_rules (optional, admin-supplied list of labeled rules)
 *   2. Heuristic parse of system.pwd_regex (handles the common lookahead form)
 *   3. Opaque fallback — one generic "must match policy" rule
 *
 * The combined regex is always returned unchanged for server-side validation.
 *
 * With no pwd_regex set, the API still refuses passwords shorter than
 * FALLBACK_MIN_LENGTH (see assertValid()), so build() reports that floor as
 * the policy instead of an empty one. The client checklist then matches what
 * the server will accept.
 */
class PasswordPolicyService
{
    /** Minimum length enforced when `system.pwd_regex` is empty. */
    public const FALLBACK_MIN_LENGTH = 8;

    public static function build(Config $config): array
    {
        $regex = (string) $config->get('system.pwd_regex', '');

        $rules = self::configuredRules($config);
        if ($rules === null) {
            $rules = $regex === '' ? [self::lengthRule(self::FALLBACK_MIN_LENGTH)] : self::parseRules($regex);
        }

        return [
            'regex' => $regex,
            'min_length' => $regex === '' ? self::FALLBACK_MIN_LENGTH : self::extractMinLength($regex),
            'rules' => $rules,
        ];
    }

    /**
     * Enforce the password policy on a new password: the full `system.pwd_regex`
     * when one is set, otherwise the FALLBACK_MIN_LENGTH floor. One check shared
     * by setup, invite-accept, password reset and user create/update, so no
     * path that sets a password can skip the policy the others apply.
     *
     * @throws ValidationException (422) naming the `password` field
     */
    public static function assertValid(Config $config, string $password, string $field = 'password'): void
    {
        $regex = (string) $config->get('system.pwd_regex', '');

        if ($regex !== '') {
            // Anchored and UTF-8 aware like core's blueprint `pattern` rule, so
            // the regex admin-classic applies to the account form means the same
            // here. The group keeps a top-level `|` inside the anchors. An invalid
            // regex makes preg_match() return false, which fails closed.
            if (!@preg_match('`^(?:' . $regex . ')$`u', $password)) {
                throw new ValidationException(
                    'Password does not meet the required policy.',
                    [['field' => $field, 'message' => 'Password does not meet the required policy.']],
                );
            }
            return;
        }

        if (mb_strlen($password) < self::FALLBACK_MIN_LENGTH) {
            throw new ValidationException(
                'Password is too short.',
                [['field' => $field, 'message' => sprintf('Password must be at least %d characters.', self::FALLBACK_MIN_LENGTH)]],
            );
        }
    }

    /**
     * @return array{id:string,label:string,pattern:string}
     */
    private static function lengthRule(int $min): array
    {
        return [
            'id' => 'length',
            'label' => sprintf('At least %d characters', $min),
            'pattern' => '.{' . $min . ',}',
        ];
    }

    /**
     * @return list<array{id:string,label:string,pattern:string}>|null
     */
    private static function configuredRules(Config $config): ?array
    {
        $raw = $config->get('system.pwd_rules');
        if (!is_array($raw) || $raw === []) {
            return null;
        }

        $out = [];
        foreach ($raw as $i => $entry) {
            if (!is_array($entry)) continue;
            $pattern = (string) ($entry['pattern'] ?? '');
            $label = (string) ($entry['label'] ?? '');
            if ($pattern === '' || $label === '') continue;
            $out[] = [
                'id' => (string) ($entry['id'] ?? ('rule_' . $i)),
                'label' => $label,
                'pattern' => $pattern,
            ];
        }

        return $out === [] ? null : $out;
    }

    /**
     * Heuristic parse of the common lookahead form used by Grav's default
     * pwd_regex: `(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}`.
     *
     * @return list<array{id:string,label:string,pattern:string}>
     */
    private static function parseRules(string $regex): array
    {
        $rules = [];

        $min = self::extractMinLength($regex);
        if ($min > 0) {
            $rules[] = self::lengthRule($min);
        }

        $lookaheads = [];
        if (preg_match_all('/\(\?=([^)]+)\)/', $regex, $m)) {
            $lookaheads = $m[1];
        }

        $seen = [];
        foreach ($lookaheads as $inner) {
            $rule = self::classifyLookahead($inner);
            if ($rule === null) continue;
            if (isset($seen[$rule['id']])) continue;
            $seen[$rule['id']] = true;
            $rules[] = $rule;
        }

        if ($rules === []) {
            $rules[] = [
                'id' => 'policy',
                'label' => 'Must match the configured password policy',
                'pattern' => $regex !== '' ? $regex : '.+',
            ];
        }

        return $rules;
    }

    /**
     * @return array{id:string,label:string,pattern:string}|null
     */
    private static function classifyLookahead(string $inner): ?array
    {
        // Strip the `.*` prefix that typically precedes the character class.
        $body = preg_replace('/^\.\*/', '', $inner) ?? $inner;

        // Digit: \d or [0-9]
        if ($body === '\\d' || preg_match('/^\[0-9\]$/', $body)) {
            return ['id' => 'digit', 'label' => 'At least one number', 'pattern' => '\\d'];
        }

        if ($body === '[a-z]') {
            return ['id' => 'lowercase', 'label' => 'At least one lowercase letter', 'pattern' => '[a-z]'];
        }

        if ($body === '[A-Z]') {
            return ['id' => 'uppercase', 'label' => 'At least one uppercase letter', 'pattern' => '[A-Z]'];
        }

        // Special char — a handful of common forms
        $specialForms = ['\\W', '[^\\w]', '[^a-zA-Z0-9]', '[^\\w\\s]'];
        if (in_array($body, $specialForms, true) || preg_match('/^\[[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?`~\s]+\]$/', $body)) {
            return ['id' => 'symbol', 'label' => 'At least one symbol', 'pattern' => '[^a-zA-Z0-9]'];
        }

        return null;
    }

    private static function extractMinLength(string $regex): int
    {
        if (preg_match('/\.\{(\d+),?\d*\}/', $regex, $m)) {
            return (int) $m[1];
        }
        return 0;
    }
}
