<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Config\Setup;
use Grav\Common\Grav;
use Grav\Plugin\Api\Controllers\ConfigController;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * POST /config/{scope}/revert with `reset: true` on a layer that has no file
 * changes nothing, yet it fired onApiConfigUpdated (and so a `config.updated`
 * webhook and an audit entry). It now fires only when something on disk
 * changed, and says which via `meta.reverted`.
 */
#[CoversClass(ConfigController::class)]
class ConfigControllerRevertNoopTest extends TestCase
{
    private ?string $tmp = null;
    private ?string $savedSetupEnv = null;

    protected function setUp(): void
    {
        $this->tmp = sys_get_temp_dir() . '/grav-revert-' . bin2hex(random_bytes(4));
        mkdir($this->tmp . '/system/config', 0777, true);
        mkdir($this->tmp . '/user/config', 0777, true);
        file_put_contents($this->tmp . '/system/config/site.yaml', "title: Grav\n");
        $this->savedSetupEnv = Setup::$environment;
        Setup::$environment = null;
    }

    protected function tearDown(): void
    {
        Setup::$environment = $this->savedSetupEnv;
        if ($this->tmp !== null) {
            foreach (new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($this->tmp, \FilesystemIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::CHILD_FIRST,
            ) as $file) {
                $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
            }
            rmdir($this->tmp);
        }
        Grav::resetInstance();
    }

    #[Test]
    public function reset_with_no_layer_file_fires_no_event(): void
    {
        [$controller, $grav] = $this->controller();

        $response = $controller->revert($this->request(['reset' => true]));

        self::assertSame(200, $response->getStatusCode());
        self::assertSame([], $this->fired($grav));
        self::assertFalse($this->body($response)['meta']['reverted']);
    }

    #[Test]
    public function reverting_a_key_the_layer_does_not_override_fires_no_event(): void
    {
        file_put_contents($this->tmp . '/user/config/site.yaml', "title: Mine\n");
        [$controller, $grav] = $this->controller();

        $response = $controller->revert($this->request(['keys' => ['author.name']]));

        self::assertSame([], $this->fired($grav));
        self::assertFalse($this->body($response)['meta']['reverted']);
        self::assertFileExists($this->tmp . '/user/config/site.yaml');
    }

    #[Test]
    public function reset_that_removes_a_file_fires_the_event(): void
    {
        file_put_contents($this->tmp . '/user/config/site.yaml', "title: Mine\n");
        [$controller, $grav] = $this->controller();

        $response = $controller->revert($this->request(['reset' => true]));

        self::assertSame(['onApiConfigUpdated'], $this->fired($grav));
        self::assertTrue($this->body($response)['meta']['reverted']);
        self::assertFileDoesNotExist($this->tmp . '/user/config/site.yaml');
    }

    /**
     * @return array{ConfigController, Grav}
     */
    private function controller(): array
    {
        Grav::resetInstance();
        $grav = Grav::instance();
        $root = $this->tmp;
        $grav['locator'] = new class ($root) {
            public function __construct(private readonly string $root) {}

            public function findResource(string $uri, bool $absolute = true, bool $first = false): string|false
            {
                $map = [
                    'user://config' => $this->root . '/user/config',
                    'system://config' => $this->root . '/system/config',
                    'user://' => $this->root . '/user',
                ];
                foreach ($map as $prefix => $base) {
                    if ($uri === $prefix) {
                        return is_dir($base) || $first ? $base : false;
                    }
                    if (str_starts_with($uri, $prefix)) {
                        $sub = ltrim(substr($uri, strlen($prefix)), '/');
                        $full = $base . ($sub !== '' ? '/' . $sub : '');
                        return file_exists($full) ? $full : false;
                    }
                }
                return false;
            }

            // Blueprint loading probes streams; there are no blueprints here,
            // so the response is simply not masked.
            public function isStream(string $uri): bool
            {
                return false;
            }

            /** @return array<int, string> */
            public function findResources(string $uri, bool $absolute = true, bool $all = false): array
            {
                return [];
            }
        };
        $grav['cache'] = new class {
            public function clearCache(string $remove = 'standard'): array
            {
                return [];
            }
        };
        $grav['plugins'] = new class {
            public mixed $formFieldTypes = null;
        };

        $config = new Config(['site' => ['title' => 'Grav']]);
        $grav['config'] = $config;

        return [new ConfigController($grav, $config), $grav];
    }

    /**
     * @param array<string, mixed> $body
     */
    private function request(array $body): \Psr\Http\Message\ServerRequestInterface
    {
        return TestHelper::createMockRequest(
            'POST',
            '/config/site/revert',
            headers: ['X-Config-Environment' => ''],
            attributes: [
                'json_body' => $body,
                'api_user' => TestHelper::createMockUser('root', ['access' => ['api' => ['super' => true]]]),
                'route_params' => ['scope' => 'site'],
            ],
        );
    }

    /**
     * Names of the events the test Grav recorded.
     *
     * @return array<int, string>
     */
    private function fired(Grav $grav): array
    {
        return array_column($grav->getFiredEvents(), 'name');
    }

    /**
     * @return array<string, mixed>
     */
    private function body(\Psr\Http\Message\ResponseInterface $response): array
    {
        return json_decode((string) $response->getBody(), true);
    }
}
