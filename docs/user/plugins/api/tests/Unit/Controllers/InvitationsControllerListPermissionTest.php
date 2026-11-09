<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Framework\Acl\Permissions;
use Grav\Plugin\Api\Controllers\InvitationsController;
use Grav\Plugin\Api\Exceptions\ForbiddenException;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ServerRequestInterface;

/**
 * The invite list returns each record's token, and the token alone accepts the
 * invite with the access it was issued with. Listing therefore needs the same
 * api.users.write that creating, resending and revoking do.
 */
#[CoversClass(InvitationsController::class)]
class InvitationsControllerListPermissionTest extends TestCase
{
    protected function tearDown(): void
    {
        Grav::resetInstance();
    }

    #[Test]
    public function a_read_only_user_cannot_list_invitations(): void
    {
        $user = TestHelper::createMockUser('reader', [
            'access' => ['api' => ['access' => true, 'users' => ['read' => true]]],
        ]);
        $config = new Config(['plugins' => ['api' => ['route' => '/api', 'version_prefix' => 'v1']]]);
        TestHelper::createMockGrav([
            'config' => $config,
            'permissions' => new Permissions(),
            'accounts' => TestHelper::createMockAccounts(['reader' => $user]),
        ]);
        $controller = new InvitationsController(Grav::instance(), $config);

        $request = $this->createMock(ServerRequestInterface::class);
        $request->method('getAttribute')->willReturnCallback(
            static fn (string $name, $default = null) => $name === 'api_user' ? $user : $default
        );

        $this->expectException(ForbiddenException::class);
        $controller->index($request);
    }
}
