<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Common\User\Interfaces\UserInterface;
use Grav\Plugin\Api\Controllers\AuditController;
use Grav\Plugin\Api\Exceptions\DemoModeException;
use Grav\Plugin\Api\Exceptions\ForbiddenException;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * The audit routes go through the shared requireSuper(), so a scoped key needs
 * the same `admin.super` scope as every other super-only endpoint, and their
 * pagination links keep the filters the caller is looking at.
 */
class AuditControllerAccessTest extends TestCase
{
    protected function tearDown(): void
    {
        Grav::resetInstance();
    }

    #[Test]
    public function an_unscoped_super_credential_is_let_in(): void
    {
        $this->gate($this->super());
        $this->addToAssertionCount(1);
    }

    #[Test]
    public function a_key_scoped_to_admin_super_is_let_in_like_on_other_super_endpoints(): void
    {
        $this->gate($this->super(), ['admin.super']);
        $this->addToAssertionCount(1);
    }

    #[Test]
    public function a_key_scoped_to_the_old_api_super_name_is_refused(): void
    {
        $this->expectException(ForbiddenException::class);
        $this->gate($this->super(), ['api.super']);
    }

    #[Test]
    public function a_non_super_account_is_refused(): void
    {
        $this->expectException(ForbiddenException::class);
        $this->gate(TestHelper::createMockUser('bob', ['access' => ['api' => ['access' => true]]]));
    }

    #[Test]
    public function a_classic_admin_super_without_api_super_is_still_refused(): void
    {
        // requireSuper() alone would let this account in; the audit log stays api.super only.
        $this->expectException(ForbiddenException::class);
        $this->gate(TestHelper::createMockUser('classic', ['access' => ['admin' => ['super' => true], 'api' => ['access' => true]]]));
    }

    #[Test]
    public function a_demo_account_is_refused_with_a_read_appropriate_reason(): void
    {
        try {
            $this->gate(TestHelper::createMockUser('demo', [
                'access' => ['api' => ['super' => true, 'demo' => true]],
                'access.api.demo' => true,
            ]));
            $this->fail('Expected a DemoModeException.');
        } catch (DemoModeException $e) {
            $this->assertStringContainsString('audit trail', $e->getMessage());
        }
    }

    private function super(): UserInterface
    {
        return TestHelper::createMockUser('root', ['access' => ['api' => ['super' => true]]]);
    }

    /** @param array<int, string> $scopes */
    private function gate(UserInterface $user, array $scopes = []): void
    {
        $attributes = ['api_user' => $user];
        if ($scopes !== []) {
            $attributes['api_key_scopes'] = $scopes;
        }
        $this->invoke('requireAuditAccess', TestHelper::createMockRequest('GET', '/audit/events', attributes: $attributes));
    }

    private function invoke(string $method, mixed ...$args): mixed
    {
        Grav::resetInstance();
        $controller = new AuditController(Grav::instance(), new Config([]));

        return (new \ReflectionMethod($controller, $method))->invoke($controller, ...$args);
    }
}
