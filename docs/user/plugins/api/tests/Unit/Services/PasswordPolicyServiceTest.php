<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Services;

use Grav\Common\Config\Config;
use Grav\Plugin\Api\Exceptions\ValidationException;
use Grav\Plugin\Api\Services\PasswordPolicyService;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * The policy GET /auth/password-policy reports must be the policy the API
 * enforces. With no pwd_regex the endpoint used to say `min_length: 0` and a
 * `.+` rule while setup and invite-accept refused anything under 8 characters.
 */
#[CoversClass(PasswordPolicyService::class)]
class PasswordPolicyServiceTest extends TestCase
{
    private const DEFAULT_REGEX = '(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}';

    private function config(string $regex): Config
    {
        return new Config(['system' => ['pwd_regex' => $regex]]);
    }

    private function assertRejected(Config $config, string $password): void
    {
        try {
            PasswordPolicyService::assertValid($config, $password);
            $this->fail("Password '{$password}' should have been rejected.");
        } catch (ValidationException $e) {
            $this->assertSame(422, $e->getStatusCode());
            $this->assertSame('password', $e->getValidationErrors()[0]['field']);
        }
    }

    #[Test]
    public function empty_regex_reports_the_enforced_minimum_length(): void
    {
        $policy = PasswordPolicyService::build($this->config(''));

        $this->assertSame('', $policy['regex']);
        $this->assertSame(8, $policy['min_length']);
        $this->assertSame(
            [['id' => 'length', 'label' => 'At least 8 characters', 'pattern' => '.{8,}']],
            $policy['rules'],
        );
    }

    #[Test]
    public function configured_regex_is_still_parsed(): void
    {
        $policy = PasswordPolicyService::build($this->config(self::DEFAULT_REGEX));

        $this->assertSame(self::DEFAULT_REGEX, $policy['regex']);
        $this->assertSame(8, $policy['min_length']);
        $this->assertSame(['length', 'digit', 'lowercase', 'uppercase'], array_column($policy['rules'], 'id'));
    }

    #[Test]
    public function empty_regex_enforces_eight_characters(): void
    {
        $config = $this->config('');

        $this->assertRejected($config, 'short');
        $this->assertRejected($config, '1234567');
        PasswordPolicyService::assertValid($config, '12345678');
        $this->addToAssertionCount(1);
    }

    #[Test]
    public function configured_regex_is_enforced_in_full(): void
    {
        $config = $this->config(self::DEFAULT_REGEX);

        $this->assertRejected($config, 'alllowercase1');
        $this->assertRejected($config, 'Sh0rt');
        PasswordPolicyService::assertValid($config, 'Passw0rdOk');
        $this->addToAssertionCount(1);
    }

    #[Test]
    public function regex_is_anchored_across_alternation(): void
    {
        // Without the group, `^a|b$` would accept any string containing a `b`
        // at the end.
        $this->assertRejected($this->config('abc|xyz'), 'zzzzxyz');
        PasswordPolicyService::assertValid($this->config('abc|xyz'), 'xyz');
        $this->addToAssertionCount(1);
    }

    #[Test]
    public function invalid_regex_fails_closed(): void
    {
        $this->assertRejected($this->config('(unclosed'), 'Anything123');
    }
}
