<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Grav;
use Grav\Plugin\Api\Controllers\WebhookController;
use Grav\Plugin\Api\Exceptions\ValidationException;
use Grav\Plugin\Api\Webhooks\WebhookDispatcher;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * A webhook's custom `headers` used to be merged AFTER the signing headers, so
 * its own config could replace X-Grav-Signature and receivers would trust a
 * forged value. The signing headers now always win, reserved names are
 * refused at create/update, and a non-array `events` is a 422 instead of a
 * TypeError 500.
 */
#[CoversClass(WebhookDispatcher::class)]
#[CoversClass(WebhookController::class)]
class WebhookHeadersTest extends TestCase
{
    protected function tearDown(): void
    {
        Grav::resetInstance();
    }

    #[Test]
    public function signing_headers_cannot_be_replaced_by_custom_headers(): void
    {
        $headers = WebhookDispatcher::deliveryHeaders(
            ['X-Grav-Signature' => 'forged', 'x-grav-event' => 'forged', 'X-Custom' => 'yes'],
            'real-sig',
            'page.created',
            'dlv_1',
        );

        self::assertSame('real-sig', $headers['X-Grav-Signature']);
        self::assertSame('page.created', $headers['X-Grav-Event']);
        self::assertSame('dlv_1', $headers['X-Grav-Delivery']);
        self::assertSame('yes', $headers['X-Custom']);
        // The lower-case copy is dropped, not sent alongside the real one.
        self::assertArrayNotHasKey('x-grav-event', $headers);
    }

    #[Test]
    public function custom_headers_may_still_override_content_type_and_user_agent(): void
    {
        $headers = WebhookDispatcher::deliveryHeaders(['User-Agent' => 'MyAgent'], 's', 'e', 'd');

        self::assertSame('MyAgent', $headers['User-Agent']);
        self::assertSame('application/json', $headers['Content-Type']);
    }

    #[Test]
    public function unsafe_stored_headers_are_dropped_at_send_time(): void
    {
        self::assertSame([], WebhookDispatcher::customHeaders('not-an-array'));
        self::assertSame(
            ['Ok' => '1'],
            WebhookDispatcher::customHeaders([
                'Ok' => 1,
                'Injected' => "a\r\nX-Grav-Signature: forged",
                "Bad\nName" => 'x',
                'Nested' => ['x'],
                0 => 'numeric-key',
            ]),
        );
    }

    #[Test]
    public function non_array_events_is_a_validation_error(): void
    {
        $this->expectException(ValidationException::class);
        $this->invoke('validateEvents', 'page.created');
    }

    #[Test]
    public function non_string_event_entry_is_a_validation_error(): void
    {
        $this->expectException(ValidationException::class);
        $this->invoke('validateEvents', [['page.created']]);
    }

    #[Test]
    public function valid_events_pass(): void
    {
        $this->invoke('validateEvents', ['page.created', '*']);
        $this->addToAssertionCount(1);
    }

    #[Test]
    public function reserved_custom_header_is_refused_in_any_case(): void
    {
        $this->expectException(ValidationException::class);
        $this->invoke('validateHeaders', ['x-GRAV-signature' => 'forged']);
    }

    #[Test]
    public function header_value_with_line_break_is_refused(): void
    {
        $this->expectException(ValidationException::class);
        $this->invoke('validateHeaders', ['X-Custom' => "a\r\nB: c"]);
    }

    #[Test]
    public function non_object_headers_is_refused(): void
    {
        $this->expectException(ValidationException::class);
        $this->invoke('validateHeaders', ['just', 'a', 'list']);
    }

    #[Test]
    public function ordinary_custom_headers_pass(): void
    {
        $this->invoke('validateHeaders', ['Authorization' => 'Bearer x', 'X-Custom' => 'y']);
        $this->invoke('validateHeaders', []);
        $this->addToAssertionCount(1);
    }

    private function invoke(string $method, mixed $arg): void
    {
        $controller = (new \ReflectionClass(WebhookController::class))->newInstanceWithoutConstructor();
        (new \ReflectionMethod($controller, $method))->invoke($controller, $arg);
    }
}
