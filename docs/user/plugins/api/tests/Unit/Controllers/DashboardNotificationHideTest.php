<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Plugin\Api\Controllers\DashboardController;
use Grav\Plugin\Api\Exceptions\ValidationException;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Yaml\Yaml;

/**
 * POST /dashboard/notifications/{id}/hide stored any ID it was given as a key
 * in the caller's status file. IDs are now limited to what a notification can
 * actually carry: getgrav.org numbers and plugin slugs.
 */
#[CoversClass(DashboardController::class)]
class DashboardNotificationHideTest extends TestCase
{
    private ?string $tmp = null;

    protected function setUp(): void
    {
        $this->tmp = sys_get_temp_dir() . '/grav-notifhide-' . bin2hex(random_bytes(4));
        mkdir($this->tmp . '/user/data/notifications', 0777, true);
    }

    protected function tearDown(): void
    {
        if ($this->tmp !== null) {
            foreach (glob($this->tmp . '/user/data/notifications/*') ?: [] as $f) {
                unlink($f);
            }
            rmdir($this->tmp . '/user/data/notifications');
            rmdir($this->tmp . '/user/data');
            rmdir($this->tmp . '/user');
            rmdir($this->tmp);
        }
        Grav::resetInstance();
    }

    #[Test]
    public function real_notification_ids_are_valid(): void
    {
        foreach (['201', 'login-lockout', 'api-support.welcome', 'some_id'] as $id) {
            self::assertTrue(DashboardController::isValidNotificationId($id), $id);
        }
    }

    #[Test]
    public function junk_ids_are_invalid(): void
    {
        foreach (['', '.hidden', '-x', 'a b', "a\nb", '../etc', "abc\n", str_repeat('a', 65)] as $id) {
            self::assertFalse(DashboardController::isValidNotificationId($id), var_export($id, true));
        }
        self::assertTrue(DashboardController::isValidNotificationId(str_repeat('a', 64)));
    }

    #[Test]
    public function invalid_id_is_422_and_writes_nothing(): void
    {
        try {
            $this->hide('a b');
            self::fail('Expected ValidationException');
        } catch (ValidationException) {
            self::assertFileDoesNotExist($this->statusFile());
        }
    }

    #[Test]
    public function valid_id_is_stored_and_hiding_again_is_still_204(): void
    {
        self::assertSame(204, $this->hide('login-lockout')->getStatusCode());
        self::assertSame(204, $this->hide('login-lockout')->getStatusCode());

        $stored = Yaml::parse((string) file_get_contents($this->statusFile()));
        self::assertSame(['login-lockout'], array_keys($stored));
    }

    private function statusFile(): string
    {
        return $this->tmp . '/user/data/notifications/root.yaml';
    }

    private function hide(string $id): \Psr\Http\Message\ResponseInterface
    {
        Grav::resetInstance();
        $grav = Grav::instance();
        $root = $this->tmp;
        $grav['locator'] = new class ($root) {
            public function __construct(private readonly string $root) {}

            public function findResource(string $uri, bool $absolute = true, bool $first = false): string|false
            {
                return str_starts_with($uri, 'user://') ? $this->root . '/user/' . substr($uri, 7) : false;
            }
        };

        $user = TestHelper::createMockUser('root', ['username' => 'root', 'access' => ['api' => ['super' => true]]]);
        $controller = new DashboardController($grav, new Config());

        return $controller->hideNotification(TestHelper::createMockRequest(
            'POST',
            '/dashboard/notifications/' . $id . '/hide',
            attributes: ['api_user' => $user, 'route_params' => ['id' => $id]],
        ));
    }
}
