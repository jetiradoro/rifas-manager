<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Common\User\Interfaces\UserInterface;
use Grav\Framework\Acl\Permissions;
use Grav\Plugin\Api\Controllers\AbstractApiController;
use Grav\Plugin\Api\Exceptions\ForbiddenException;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Regression for GHSA-m2rq-76vx-vv4j: requireSuper() checked `admin.super`
 * through the inheriting resolver, so a stored scalar `admin: true` walked up
 * to satisfy it. Super must be granted by its exact key, while ordinary
 * permissions keep inheriting from their parent.
 */
#[CoversClass(AbstractApiController::class)]
class ExplicitSuperGrantTest extends TestCase
{
    protected function tearDown(): void
    {
        Grav::resetInstance();
    }

    /**
     * @return array<string, array{0: array<string, mixed>}>
     */
    public static function scalarParentGrants(): array
    {
        return [
            'admin: true'   => [['api' => ['access' => true], 'admin' => true]],
            'admin: 1'      => [['api' => ['access' => true], 'admin' => 1]],
            "admin: 'true'" => [['api' => ['access' => true], 'admin' => 'true']],
            'api: true'     => [['api' => true]],
        ];
    }

    /**
     * @param array<string, mixed> $access
     */
    #[Test]
    #[DataProvider('scalarParentGrants')]
    public function a_scalar_parent_grant_does_not_satisfy_require_super(array $access): void
    {
        $this->expectException(ForbiddenException::class);

        $this->requireSuper(['access' => $access]);
    }

    #[Test]
    public function a_scalar_parent_grant_in_a_group_does_not_satisfy_require_super(): void
    {
        $this->expectException(ForbiddenException::class);

        $this->requireSuper(
            ['access' => ['api' => ['access' => true]], 'groups' => ['managers']],
            ['managers' => ['access' => ['admin' => true]]],
        );
    }

    #[Test]
    public function an_explicit_admin_super_grant_satisfies_require_super(): void
    {
        $this->requireSuper(['access' => ['api' => ['access' => true], 'admin' => ['super' => true]]]);

        $this->addToAssertionCount(1);
    }

    #[Test]
    public function an_explicit_api_super_grant_satisfies_require_super(): void
    {
        $this->requireSuper(['access' => ['api' => ['super' => true]]]);

        $this->addToAssertionCount(1);
    }

    #[Test]
    public function an_explicit_super_grant_from_a_group_satisfies_require_super(): void
    {
        $this->requireSuper(
            ['access' => [], 'groups' => ['admins']],
            ['admins' => ['access' => ['api' => ['access' => true], 'admin' => ['super' => true]]]],
        );

        $this->addToAssertionCount(1);
    }

    #[Test]
    public function ordinary_permissions_still_inherit_from_a_scalar_parent(): void
    {
        $controller = $this->controller();
        $user = TestHelper::createMockUser('editor', ['access' => ['api' => true]]);

        self::assertTrue($controller->has($user, 'api.pages.write'));
        self::assertFalse($controller->has($user, 'api.super'));
        self::assertFalse($controller->has($user, 'admin.super'));
    }

    /**
     * @param array<string, mixed> $userData
     * @param array<string, mixed> $groups
     */
    private function requireSuper(array $userData, array $groups = []): void
    {
        $user = TestHelper::createMockUser('someone', $userData);

        $this->controller($groups)->callRequireSuper(TestHelper::createMockRequest(
            method: 'POST',
            path: '/api/v1/system/config',
            attributes: ['api_user' => $user],
        ));
    }

    /**
     * @param array<string, mixed> $groups
     */
    private function controller(array $groups = []): SuperGrantProbeController
    {
        $config = new Config(['groups' => $groups]);
        TestHelper::createMockGrav(['config' => $config, 'permissions' => new Permissions()]);

        return new SuperGrantProbeController(Grav::instance(), $config);
    }
}

final class SuperGrantProbeController extends AbstractApiController
{
    public function callRequireSuper(\Psr\Http\Message\ServerRequestInterface $request): void
    {
        $this->requireSuper($request);
    }

    public function has(UserInterface $user, string $permission): bool
    {
        return $this->hasPermission($user, $permission);
    }
}
