<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Framework\Acl\Permissions;
use Grav\Plugin\Api\Controllers\ContextPanelController;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ServerRequestInterface;
use RocketTheme\Toolbox\Event\Event;

/**
 * /context-panels honors each panel's `authorize`, strips it from the output
 * and sorts by priority, the same way floating widgets and editor buttons do.
 */
#[CoversClass(ContextPanelController::class)]
class ContextPanelControllerTest extends TestCase
{
    protected function tearDown(): void
    {
        Grav::resetInstance();
    }

    #[Test]
    public function panels_are_filtered_by_authorize_stripped_and_sorted(): void
    {
        $user = TestHelper::createMockUser('editor', [
            'access' => ['api' => ['access' => true, 'pages' => ['read' => true]]],
        ]);

        $config = new Config(['plugins' => ['api' => ['route' => '/api', 'version_prefix' => 'v1']]]);
        $grav = TestHelper::createMockGrav([
            'config' => $config,
            'permissions' => new Permissions(),
        ]);
        $grav->addListener('onApiContextPanels', static function (Event $event): void {
            $event['panels'] = [
                ['id' => 'low', 'priority' => 1],
                ['id' => 'secret', 'priority' => 50, 'authorize' => 'api.system.write'],
                ['id' => 'high', 'priority' => 20, 'authorize' => 'api.pages.read'],
                ['id' => 'any-of', 'priority' => 20, 'authorize' => ['api.system.write', 'api.pages.read']],
                ['id' => 'none'],
            ];
        });

        $controller = new ContextPanelController(Grav::instance(), $config);

        $request = $this->createMock(ServerRequestInterface::class);
        $request->method('getAttribute')->willReturnCallback(
            static fn (string $name, $default = null) => $name === 'api_user' ? $user : $default
        );

        $body = json_decode((string) $controller->items($request)->getBody(), true);
        $panels = $body['data'];

        self::assertSame(['high', 'any-of', 'low', 'none'], array_column($panels, 'id'));
        foreach ($panels as $panel) {
            self::assertArrayNotHasKey('authorize', $panel);
        }
    }
}
