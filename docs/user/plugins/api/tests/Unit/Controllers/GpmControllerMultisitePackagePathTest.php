<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Framework\Acl\Permissions;
use Grav\Plugin\Api\Controllers\GpmController;
use Grav\Plugin\Api\Exceptions\ValidationException;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ServerRequestInterface;
use RocketTheme\Toolbox\ResourceLocator\UniformResourceLocator;

#[CoversClass(GpmController::class)]
class GpmControllerMultisitePackagePathTest extends TestCase
{
    private string $tempDir;
    private string $environmentDir;
    private string $sharedDir;

    protected function setUp(): void
    {
        $this->tempDir = sys_get_temp_dir() . '/grav_api_gpm_multisite_' . uniqid();
        $this->environmentDir = $this->tempDir . '/environment';
        $this->sharedDir = $this->tempDir . '/shared';

        mkdir($this->tempDir . '/cache', 0775, true);
        $this->writePackage('environment', 'plugins', 'environment-plugin', 'environment-field', 'environment plugin');
        $this->writePackage('environment', 'themes', 'environment-theme', 'environment-theme-field', 'environment theme');
        $this->writePackage('shared', 'plugins', 'shared-plugin', 'shared-field', 'shared plugin');
        $this->writePackage('shared', 'themes', 'shared-theme', 'shared-theme-field', 'shared theme');
    }

    protected function tearDown(): void
    {
        $this->removeTree($this->tempDir);
    }

    #[Test]
    public function a_plugin_in_the_active_multisite_environment_is_served(): void
    {
        $controller = $this->controller(new GpmMultisitePackagePathTestLocator(
            $this->environmentDir,
            $this->sharedDir,
            true,
        ));

        $response = $controller->customFieldScript($this->request(
            '/api/v1/gpm/plugins/environment-plugin/field/environment-field',
            'environment-plugin',
            'environment-field',
        ));

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('environment plugin', (string) $response->getBody());
    }

    #[Test]
    public function a_theme_in_the_active_multisite_environment_is_served(): void
    {
        $controller = $this->controller(new GpmMultisitePackagePathTestLocator(
            $this->environmentDir,
            $this->sharedDir,
            true,
        ));

        $response = $controller->customFieldScript($this->request(
            '/api/v1/gpm/themes/environment-theme/field/environment-theme-field',
            'environment-theme',
            'environment-theme-field',
        ));

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('environment theme', (string) $response->getBody());
    }

    #[Test]
    public function custom_field_bundle_serves_plugin_and_theme_components_from_the_environment(): void
    {
        $controller = $this->controller(new GpmMultisitePackagePathTestLocator(
            $this->environmentDir,
            $this->sharedDir,
            true,
        ));

        $pluginResponse = $controller->customFieldBundle($this->request(
            '/api/v1/gpm/plugins/environment-plugin/fields',
            'environment-plugin',
        ));
        $themeResponse = $controller->customFieldBundle($this->request(
            '/api/v1/gpm/themes/environment-theme/fields',
            'environment-theme',
        ));

        $this->assertSame(
            ['environment-field' => 'environment plugin'],
            json_decode((string) $pluginResponse->getBody(), true),
        );
        $this->assertSame(
            ['environment-theme-field' => 'environment theme'],
            json_decode((string) $themeResponse->getBody(), true),
        );
    }

    #[Test]
    public function packages_only_in_the_shared_path_are_still_served(): void
    {
        $controller = $this->controller(new GpmMultisitePackagePathTestLocator(
            $this->environmentDir,
            $this->sharedDir,
            true,
        ));

        $pluginResponse = $controller->customFieldScript($this->request(
            '/api/v1/gpm/plugins/shared-plugin/field/shared-field',
            'shared-plugin',
            'shared-field',
        ));
        $themeResponse = $controller->customFieldScript($this->request(
            '/api/v1/gpm/themes/shared-theme/field/shared-theme-field',
            'shared-theme',
            'shared-theme-field',
        ));

        $this->assertSame('shared plugin', (string) $pluginResponse->getBody());
        $this->assertSame('shared theme', (string) $themeResponse->getBody());
    }

    #[Test]
    public function a_single_site_locator_still_uses_the_standard_user_package_fallback(): void
    {
        $controller = $this->controller(new GpmMultisitePackagePathTestLocator(
            $this->environmentDir,
            $this->sharedDir,
            false,
        ));

        $response = $controller->customFieldScript($this->request(
            '/api/v1/gpm/plugins/shared-plugin/field/shared-field',
            'shared-plugin',
            'shared-field',
        ));

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('shared plugin', (string) $response->getBody());
    }

    #[Test]
    #[DataProvider('invalidPackageSlugs')]
    public function invalid_package_slugs_are_rejected(string $slug): void
    {
        $controller = $this->controller(new GpmMultisitePackagePathTestLocator(
            $this->environmentDir,
            $this->sharedDir,
            true,
        ));

        $this->expectException(ValidationException::class);
        $controller->customFieldScript($this->request(
            '/api/v1/gpm/plugins/' . $slug . '/field/environment-field',
            $slug,
            'environment-field',
        ));
    }

    /** @return array<string, array{string}> */
    public static function invalidPackageSlugs(): array
    {
        return [
            'empty' => [''],
            'dot' => ['.'],
            'dot-dot' => ['..'],
            'slash' => ['nested/plugin'],
            'backslash' => ['nested\\plugin'],
            'nul' => ["nested\0plugin"],
        ];
    }

    #[Test]
    #[DataProvider('overlappingPackages')]
    public function environment_package_takes_precedence_over_the_same_shared_package(
        string $type,
        bool $realLocator,
    ): void {
        if ($realLocator && !class_exists(UniformResourceLocator::class)) {
            self::markTestSkipped('Set GRAV_ROOT to test with Grav\'s resource locator.');
        }

        $this->writePackage('environment', $type, 'overlapping', 'example', 'environment component');
        $this->writePackage('shared', $type, 'overlapping', 'example', 'shared component');

        if ($realLocator) {
            $locator = new UniformResourceLocator($this->tempDir);
            $locator->addPath('cache', '', 'cache');
            $locator->addPath('user', '', 'shared');
            $locator->addPath($type, '', ['environment/' . $type, 'user://' . $type]);
        } else {
            $locator = new GpmMultisitePackagePathTestLocator(
                $this->environmentDir,
                $this->sharedDir,
                true,
            );
        }
        $controller = $this->controller($locator);

        $script = $controller->customFieldScript($this->request(
            '/api/v1/gpm/' . $type . '/overlapping/field/example',
            'overlapping',
            'example',
        ));
        $bundle = $controller->customFieldBundle($this->request(
            '/api/v1/gpm/' . $type . '/overlapping/fields',
            'overlapping',
        ));

        self::assertSame(200, $script->getStatusCode());
        self::assertSame('environment component', (string) $script->getBody());
        self::assertSame(200, $bundle->getStatusCode());
        self::assertSame(
            ['example' => 'environment component'],
            json_decode((string) $bundle->getBody(), true),
        );
    }

    /** @return array<string, array{string, bool}> */
    public static function overlappingPackages(): array
    {
        return [
            'plugin with test locator' => ['plugins', false],
            'theme with test locator' => ['themes', false],
            'plugin with Grav locator' => ['plugins', true],
            'theme with Grav locator' => ['themes', true],
        ];
    }

    private function controller(object $locator): GpmController
    {
        $config = new Config([
            'plugins' => ['api' => ['route' => '/api', 'version_prefix' => 'v1']],
        ]);

        TestHelper::createMockGrav([
            'config' => $config,
            'locator' => $locator,
            'permissions' => new Permissions(),
        ]);

        return new GpmController(\Grav\Common\Grav::instance(), $config);
    }

    private function request(string $path, string $slug, ?string $fieldType = null): ServerRequestInterface
    {
        $attributes = [
            'api_user' => TestHelper::createMockUser('auditor', [
                'access' => ['api' => ['access' => true]],
            ]),
            'route_params' => ['slug' => $slug],
        ];
        if ($fieldType !== null) {
            $attributes['route_params']['type'] = $fieldType;
        }

        return TestHelper::createMockRequest(
            method: 'GET',
            path: $path,
            attributes: $attributes,
        );
    }

    private function writePackage(
        string $location,
        string $type,
        string $slug,
        string $fieldType,
        string $contents,
    ): void {
        $root = $location === 'environment' ? $this->environmentDir : $this->sharedDir;
        $directory = $root . '/' . $type . '/' . $slug . '/admin-next/fields';
        mkdir($directory, 0775, true);
        file_put_contents($directory . '/' . $fieldType . '.js', $contents);
    }

    private function removeTree(string $path): void
    {
        if (is_file($path) || is_link($path)) {
            unlink($path);
            return;
        }
        if (!is_dir($path)) {
            return;
        }
        foreach (scandir($path) ?: [] as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            $this->removeTree($path . '/' . $item);
        }
        rmdir($path);
    }
}

final class GpmMultisitePackagePathTestLocator
{
    public function __construct(
        private readonly string $environment,
        private readonly string $shared,
        private readonly bool $streamResolutionEnabled,
    ) {}

    public function findResource(string $uri, bool $absolute = false, bool $createDir = false): string|false
    {
        if (str_starts_with($uri, 'cache://')) {
            return dirname($this->environment) . '/cache';
        }

        foreach (['plugins', 'themes'] as $type) {
            $stream = $type . '://';
            if (str_starts_with($uri, $stream)) {
                if (!$this->streamResolutionEnabled) {
                    return false;
                }

                $slug = substr($uri, strlen($stream));
                $environmentPath = $this->environment . '/' . $type . '/' . $slug;
                if (is_dir($environmentPath)) {
                    return $environmentPath;
                }

                $sharedPath = $this->shared . '/' . $type . '/' . $slug;
                return is_dir($sharedPath) ? $sharedPath : false;
            }
        }

        if (str_starts_with($uri, 'user://')) {
            $path = $this->shared . '/' . ltrim(substr($uri, strlen('user://')), '/');

            return is_dir($path) || is_file($path) ? $path : false;
        }

        return false;
    }
}
