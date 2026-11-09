<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\User\Interfaces\UserInterface;
use Grav\Framework\Acl\Permissions;
use Grav\Plugin\Api\Controllers\UsersController;
use Grav\Plugin\Api\Exceptions\ForbiddenException;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ServerRequestInterface;

/**
 * The /users/{username}/2fa routes check who may act before the target account
 * is loaded, so a refused caller gets the same 403 for a real username and a
 * missing one. The self paths also require api.access, which the auth
 * middleware does not enforce.
 */
#[CoversClass(UsersController::class)]
class UsersControllerTwoFactorGateTest extends TestCase
{
    private function controller(UserInterface ...$users): UsersController
    {
        $config = new Config([
            'plugins' => ['api' => [
                'route' => '/api',
                'version_prefix' => 'v1',
                'pagination' => ['default_per_page' => 20, 'max_per_page' => 100],
            ]],
        ]);

        $byName = [];
        foreach ($users as $u) {
            $byName[$u->username] = $u;
        }

        TestHelper::createMockGrav([
            'config'      => $config,
            'accounts'    => TestHelper::createMockAccounts($byName),
            'permissions' => new Permissions(),
        ]);

        return new UsersController(\Grav\Common\Grav::instance(), $config);
    }

    private function request(UserInterface $caller, string $target, array $body = []): ServerRequestInterface
    {
        return TestHelper::createMockRequest(
            method: 'POST',
            path: '/api/v1/users/' . $target . '/2fa',
            headers: ['Content-Type' => 'application/json'],
            body: json_encode($body),
            attributes: [
                'api_user'     => $caller,
                'json_body'    => $body,
                'route_params' => ['username' => $target],
            ],
        );
    }

    private function plainUser(string $name = 'alice'): UserInterface
    {
        return TestHelper::createMockUser($name, [
            'access' => ['api' => ['access' => true], 'site' => ['login' => true]],
        ]);
    }

    private function noApiAccessUser(string $name = 'visitor'): UserInterface
    {
        return TestHelper::createMockUser($name, [
            'access' => ['site' => ['login' => true]],
        ]);
    }

    /** @return array<string, array{string}> */
    public static function routes(): array
    {
        return [
            'generate' => ['generate2fa'],
            'enable'   => ['enable2fa'],
            'disable'  => ['disable2fa'],
        ];
    }

    #[Test]
    #[DataProvider('routes')]
    public function non_owner_gets_the_same_403_for_real_and_missing_usernames(string $method): void
    {
        $caller = $this->plainUser('alice');
        $real = $this->plainUser('bob');
        $c = $this->controller($caller, $real);

        foreach (['bob', 'no-such-user'] as $target) {
            try {
                $c->{$method}($this->request($caller, $target, ['code' => '123456']));
                $this->fail("{$method} on '{$target}' should be refused.");
            } catch (ForbiddenException $e) {
                $this->assertSame(403, $e->getStatusCode(), "{$method} on '{$target}'");
            }
        }
    }

    #[Test]
    #[DataProvider('routes')]
    public function self_service_requires_api_access(string $method): void
    {
        $caller = $this->noApiAccessUser('visitor');
        $c = $this->controller($caller);

        $this->expectException(ForbiddenException::class);
        $c->{$method}($this->request($caller, 'visitor', ['code' => '123456']));
    }
}
