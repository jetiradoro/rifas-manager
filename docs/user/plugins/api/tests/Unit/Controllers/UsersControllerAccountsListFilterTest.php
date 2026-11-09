<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\User\Interfaces\UserInterface;
use Grav\Framework\Acl\Permissions;
use Grav\Plugin\Api\Controllers\UsersController;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;
use RocketTheme\Toolbox\Event\Event;

/**
 * GET /users?filter=<tab> on the filesystem account store (no Flex). The
 * plugin tab used to be ignored there, so the tab listed every account.
 */
#[CoversClass(UsersController::class)]
class UsersControllerAccountsListFilterTest extends TestCase
{
    /** @var array<string, mixed>|null */
    private ?array $seen = null;

    private function controller(callable $listener): UsersController
    {
        $config = new Config([
            'plugins' => ['api' => [
                'route' => '/api',
                'version_prefix' => 'v1',
                'pagination' => ['default_per_page' => 20, 'max_per_page' => 100],
            ]],
        ]);

        $grav = TestHelper::createMockGrav([
            'config'      => $config,
            'permissions' => new Permissions(),
        ]);
        $grav->addListener('onApiUserListFilter', $listener);

        return new UsersController($grav, $config);
    }

    /** @return array<string, UserInterface> */
    private function users(): array
    {
        $out = [];
        foreach (['amy' => 'enabled', 'bob' => 'disabled', 'cat' => 'enabled'] as $name => $state) {
            $out[$name] = TestHelper::createMockUser($name, ['state' => $state]);
        }
        return $out;
    }

    /**
     * @param array<string, UserInterface> $users
     * @return array<string, UserInterface>
     */
    private function apply(UsersController $c, string $filter, array $users): array
    {
        $caller = TestHelper::createMockUser('admin', ['access' => ['api' => ['super' => true]]]);
        $request = TestHelper::createMockRequest(
            method: 'GET',
            path: '/api/v1/users',
            queryParams: ['filter' => $filter],
            attributes: ['api_user' => $caller],
        );

        $m = new ReflectionMethod($c, 'applyPluginListFilter');
        return $m->invoke($c, $request, $filter, $users);
    }

    #[Test]
    public function owning_plugin_narrows_the_list_with_the_flex_payload_keys(): void
    {
        $c = $this->controller(function (Event $event): void {
            $this->seen = $event->toArray();
            if ($event['filter'] !== 'active') {
                return;
            }
            $event['collection'] = $event['collection']->filter(
                static fn(UserInterface $u) => $u->get('state') === 'enabled',
            );
        });

        $result = $this->apply($c, 'active', $this->users());

        $this->assertSame(['amy', 'cat'], array_keys($result));
        $this->assertSame(['filter', 'collection', 'query', 'user'], array_keys($this->seen));
        $this->assertSame(['filter' => 'active'], $this->seen['query']);
    }

    #[Test]
    public function untouched_event_keeps_every_account(): void
    {
        $c = $this->controller(static function (Event $event): void {});

        $this->assertSame(['amy', 'bob', 'cat'], array_keys($this->apply($c, 'someone-elses-tab', $this->users())));
    }

    #[Test]
    public function a_plugin_cannot_add_accounts_or_reorder_the_list(): void
    {
        $c = $this->controller(static function (Event $event): void {
            $event['collection'] = [
                TestHelper::createMockUser('cat'),
                TestHelper::createMockUser('intruder'),
                TestHelper::createMockUser('amy'),
                'not-a-user',
            ];
        });

        $result = $this->apply($c, 'active', $this->users());

        $this->assertSame(['amy', 'cat'], array_keys($result));
    }
}
