<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Auth;

use Psr\Http\Message\ServerRequestInterface;

/**
 * CSRF check for writes authenticated by the session cookie alone.
 *
 * A key or a JWT travels in a header no other site can set, so those requests
 * prove themselves. A session cookie is attached by the browser to anything
 * sent to this host, including a form posted from somebody else's page, so a
 * cookie-authenticated write has to show it came from one of our own pages:
 *
 *   - `Origin` (or `Referer` when there is no Origin) names this host or an
 *     origin allowlisted in `cors.origins`. A browser sets both itself and a
 *     page cannot forge them, so a match is proof and a mismatch is refused.
 *   - With neither header present, the request must carry something an HTML
 *     form cannot send without a CORS preflight: a JSON content type or a
 *     custom header. Non-browser clients riding a cookie land here.
 *
 * Hosts are compared by name only. Cookies are not isolated by scheme or
 * port, and behind a proxy the scheme and port PHP sees are rarely the ones
 * the browser used, so comparing them would refuse honest requests and stop
 * nothing.
 */
final class SameOriginGuard
{
    private const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

    private const CUSTOM_HEADERS = ['X-Requested-With', 'X-API-Token', 'X-API-Key', 'X-HTTP-Method-Override'];

    /** @var array<string, true> */
    private array $hosts = [];

    /**
     * @param iterable<mixed> $trusted hostnames, origins or URLs this site answers on or allows
     */
    public function __construct(iterable $trusted)
    {
        foreach ($trusted as $value) {
            $host = self::hostOf(is_string($value) ? $value : '');
            if ($host !== null) {
                $this->hosts[$host] = true;
            }
        }
    }

    public function allows(ServerRequestInterface $request): bool
    {
        if (!in_array(strtoupper($request->getMethod()), self::WRITE_METHODS, true)) {
            return true;
        }

        foreach (['Origin', 'Referer'] as $header) {
            $value = trim($request->getHeaderLine($header));
            // A sandboxed or privacy-stripped page sends the literal "null".
            if ($value === '') {
                continue;
            }

            $host = $value === 'null' ? null : self::hostOf($value);

            return $host !== null && $this->trusts($request, $host);
        }

        return $this->formCannotSend($request);
    }

    private function trusts(ServerRequestInterface $request, string $host): bool
    {
        if (isset($this->hosts[$host])) {
            return true;
        }

        // The host this request was addressed to. A victim's browser fills it
        // in, so unlike a link we might email it is safe to take at its word.
        foreach ([$request->getUri()->getHost(), $request->getHeaderLine('Host')] as $own) {
            if (self::hostOf($own) === $host) {
                return true;
            }
        }

        return false;
    }

    private function formCannotSend(ServerRequestInterface $request): bool
    {
        foreach (self::CUSTOM_HEADERS as $header) {
            if ($request->getHeaderLine($header) !== '') {
                return true;
            }
        }

        $type = strtolower(trim(explode(';', $request->getHeaderLine('Content-Type'))[0]));

        return $type === 'application/json' || str_ends_with($type, '+json');
    }

    private static function hostOf(string $value): ?string
    {
        $value = trim($value);
        if ($value === '' || $value === '*') {
            return null;
        }

        $host = parse_url(str_contains($value, '://') ? $value : '//' . $value, PHP_URL_HOST);
        if (!is_string($host) || $host === '') {
            return null;
        }

        return strtolower(rtrim($host, '.'));
    }
}
