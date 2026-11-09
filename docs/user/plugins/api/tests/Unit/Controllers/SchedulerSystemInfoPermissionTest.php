<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Plugin\Api\Controllers\SchedulerController;
use Grav\Plugin\Api\Exceptions\ForbiddenException;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * GET /systeminfo reports PHP, disk and plugin data, so it is gated by
 * api.system.read like GET /system/info, not by the scheduler permission its
 * controller otherwise uses. Driven through API-key scopes on a super account,
 * which exercise the exact permission name without a full ACL bootstrap.
 */
#[CoversClass(SchedulerController::class)]
class SchedulerSystemInfoPermissionTest extends TestCase
{
    protected function tearDown(): void
    {
        Grav::resetInstance();
    }

    #[Test]
    public function scheduler_read_alone_is_refused(): void
    {
        $this->expectException(ForbiddenException::class);
        $this->systemInfo(['api.scheduler.read']);
    }

    #[Test]
    public function system_read_is_enough(): void
    {
        $response = $this->systemInfo(['api.system.read']);

        self::assertSame(200, $response->getStatusCode());
    }

    /**
     * @param array<int, string> $scopes
     */
    private function systemInfo(array $scopes): \Psr\Http\Message\ResponseInterface
    {
        $grav = TestHelper::createMockGrav([
            'plugins' => new class {
                /** @return array<string, mixed> */
                public function all(): array
                {
                    return [];
                }
            },
        ]);
        $controller = new SchedulerController($grav, new Config());

        return $controller->systemInfo(TestHelper::createMockRequest('GET', '/systeminfo', attributes: [
            'api_user' => TestHelper::createMockUser('root', ['access' => ['api' => ['super' => true]]]),
            'api_key_scopes' => $scopes,
        ]));
    }
}
