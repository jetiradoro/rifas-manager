<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Services;

use Grav\Common\Grav;
use Grav\Plugin\Api\PermissionResolver;
use Grav\Plugin\Api\Services\DashboardLayoutResolver;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use RocketTheme\Toolbox\Event\Event;

#[CoversClass(DashboardLayoutResolver::class)]
class DashboardLayoutResolverTest extends TestCase
{
    protected function tearDown(): void
    {
        Grav::resetInstance();
    }

    #[Test]
    public function plugin_widgets_without_sizes_get_defaults_instead_of_crashing(): void
    {
        $resolver = $this->resolverWithPluginWidgets([
            ['id' => 'plugin.bare', 'label' => 'Bare'],
            ['id' => 'plugin.bad', 'sizes' => ['huge', 'xl'], 'defaultSize' => 'md'],
            ['id' => 'plugin.junk', 'sizes' => 'md', 'defaultSize' => 42],
        ]);

        $widgets = array_column($resolver->resolve(TestHelper::createMockUser('admin'), true)['widgets'], null, 'id');

        self::assertSame(['sm', 'md', 'lg'], $widgets['plugin.bare']['sizes']);
        self::assertSame('md', $widgets['plugin.bare']['defaultSize']);
        self::assertSame('md', $widgets['plugin.bare']['size']);

        self::assertSame(['xl'], $widgets['plugin.bad']['sizes']);
        self::assertSame('xl', $widgets['plugin.bad']['defaultSize']);
        self::assertSame('xl', $widgets['plugin.bad']['size']);

        self::assertSame(['sm', 'md', 'lg'], $widgets['plugin.junk']['sizes']);
        self::assertSame('md', $widgets['plugin.junk']['size']);
    }

    #[Test]
    public function a_missing_order_is_not_stored(): void
    {
        $resolver = $this->resolverWithPluginWidgets([]);

        $layout = $resolver->normalizeLayout(['widgets' => [
            ['id' => 'core.stats', 'size' => 'lg'],
            ['id' => 'core.backups', 'order' => 7],
        ]]);

        self::assertArrayNotHasKey('order', $layout['widgets'][0]);
        self::assertSame(7, $layout['widgets'][1]['order']);
    }

    #[Test]
    public function a_saved_entry_without_order_keeps_priority_ordering(): void
    {
        $resolver = $this->resolverWithPluginWidgets([]);
        $user = TestHelper::createMockUser('admin');
        // core.news-feed has the lowest core priority; resaving it without an
        // order used to store order 0 and jump it to the top.
        $resolver->saveUserLayout($user, ['widgets' => [['id' => 'core.news-feed', 'visible' => true]]]);

        $ids = array_column($resolver->resolve($user, true)['widgets'], 'id');

        self::assertSame('core.stats', $ids[0]);
        self::assertSame('core.news-feed', end($ids));
    }

    /**
     * @param array<int, array<string, mixed>> $widgets
     */
    private function resolverWithPluginWidgets(array $widgets): DashboardLayoutResolver
    {
        $grav = TestHelper::createMockGrav();
        $grav->addListener('onApiDashboardWidgets', static function (Event $event) use ($widgets): void {
            $event['widgets'] = $widgets;
        });

        return new DashboardLayoutResolver($grav, new PermissionResolver());
    }
}
