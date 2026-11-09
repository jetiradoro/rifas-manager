<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Auth;

use Grav\Plugin\Api\Auth\SameOriginGuard;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * A write riding on the session cookie has to show it came from this site.
 * The mock request is addressed to `localhost`.
 */
#[CoversClass(SameOriginGuard::class)]
class SameOriginGuardTest extends TestCase
{
    #[Test]
    public function reads_are_never_asked(): void
    {
        $guard = new SameOriginGuard([]);

        self::assertTrue($guard->allows(TestHelper::createMockRequest('GET', '/', ['Origin' => 'https://evil.example'])));
    }

    #[Test]
    public function a_form_posted_from_another_site_is_refused(): void
    {
        $request = TestHelper::createMockRequest('POST', '/', [
            'Origin' => 'https://evil.example',
            'Content-Type' => 'application/x-www-form-urlencoded',
        ]);

        self::assertFalse((new SameOriginGuard([]))->allows($request));
    }

    #[Test]
    public function another_site_is_refused_even_with_json_and_a_custom_header(): void
    {
        $request = TestHelper::createMockRequest('POST', '/', [
            'Origin' => 'https://evil.example',
            'Content-Type' => 'application/json',
            'X-Requested-With' => 'XMLHttpRequest',
        ]);

        self::assertFalse((new SameOriginGuard([]))->allows($request));
    }

    #[Test]
    public function a_sibling_subdomain_is_another_site(): void
    {
        $request = TestHelper::createMockRequest('DELETE', '/', ['Origin' => 'https://demo.localhost']);

        self::assertFalse((new SameOriginGuard([]))->allows($request));
    }

    #[Test]
    public function our_own_page_passes_whatever_it_sends(): void
    {
        $guard = new SameOriginGuard([]);

        // A bodyless DELETE and a multipart upload carry no JSON content type.
        self::assertTrue($guard->allows(TestHelper::createMockRequest('DELETE', '/', ['Origin' => 'https://localhost'])));
        self::assertTrue($guard->allows(TestHelper::createMockRequest('POST', '/', [
            'Origin' => 'https://LOCALHOST:8443',
            'Content-Type' => 'multipart/form-data; boundary=x',
        ])));
    }

    #[Test]
    public function scheme_and_port_do_not_matter_behind_a_proxy(): void
    {
        $request = TestHelper::createMockRequest('POST', '/', ['Origin' => 'http://localhost:8080']);

        self::assertTrue((new SameOriginGuard([]))->allows($request));
    }

    #[Test]
    public function the_referer_stands_in_when_there_is_no_origin(): void
    {
        $guard = new SameOriginGuard([]);

        self::assertTrue($guard->allows(TestHelper::createMockRequest('POST', '/', ['Referer' => 'https://localhost/admin/pages'])));
        self::assertFalse($guard->allows(TestHelper::createMockRequest('POST', '/', ['Referer' => 'https://evil.example/localhost'])));
    }

    #[Test]
    public function configured_hosts_and_cors_origins_are_trusted(): void
    {
        $guard = new SameOriginGuard(['https://www.shop.example/base', '', '*', 'https://app.example.com']);

        self::assertTrue($guard->allows(TestHelper::createMockRequest('POST', '/', ['Origin' => 'https://www.shop.example'])));
        self::assertTrue($guard->allows(TestHelper::createMockRequest('PATCH', '/', ['Origin' => 'https://app.example.com'])));
        self::assertFalse($guard->allows(TestHelper::createMockRequest('PATCH', '/', ['Origin' => 'https://other.example.com'])));
    }

    #[Test]
    public function an_opaque_origin_is_refused(): void
    {
        $request = TestHelper::createMockRequest('POST', '/', ['Origin' => 'null', 'Content-Type' => 'application/json']);

        self::assertFalse((new SameOriginGuard([]))->allows($request));
    }

    #[Test]
    public function with_no_origin_at_all_it_must_be_something_a_form_cannot_send(): void
    {
        $guard = new SameOriginGuard([]);

        self::assertFalse($guard->allows(TestHelper::createMockRequest('POST', '/')));
        self::assertFalse($guard->allows(TestHelper::createMockRequest('POST', '/', ['Content-Type' => 'text/plain'])));
        self::assertTrue($guard->allows(TestHelper::createMockRequest('POST', '/', ['Content-Type' => 'application/json; charset=utf-8'])));
        self::assertTrue($guard->allows(TestHelper::createMockRequest('POST', '/', ['Content-Type' => 'application/merge-patch+json'])));
        self::assertTrue($guard->allows(TestHelper::createMockRequest('DELETE', '/', ['X-Requested-With' => 'XMLHttpRequest'])));
        // An expired token still proves the sender could set a header.
        self::assertTrue($guard->allows(TestHelper::createMockRequest('DELETE', '/', ['X-API-Token' => 'expired'])));
    }
}
