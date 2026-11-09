<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit;

use FastRoute\DataGenerator\GroupCountBased;
use FastRoute\RouteCollector;
use FastRoute\RouteParser\Std;
use Grav\Plugin\Api\ApiRouter;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Yaml\Yaml;

/**
 * openapi.yaml is the source of truth the Postman collection is generated
 * from, so every core route has to be in it and nothing may be left behind
 * after a route is removed. Plugin routes (onApiRegisterRoutes) belong to
 * their own plugins and are not checked here.
 */
#[CoversNothing]
final class OpenApiCoverageTest extends TestCase
{
    /** @return list<string> "METHOD /path" with every placeholder collapsed to {} */
    private static function routerOperations(): array
    {
        $collector = new class (new Std(), new GroupCountBased()) extends RouteCollector {
            /** @var list<string> */
            public array $seen = [];

            public function addRoute($httpMethod, $route, $handler): void
            {
                foreach ((array) $httpMethod as $method) {
                    $this->seen[] = $method . ' ' . OpenApiCoverageTest::normalize($route);
                }
            }
        };

        $router = (new \ReflectionClass(ApiRouter::class))->newInstanceWithoutConstructor();
        (new \ReflectionMethod(ApiRouter::class, 'registerCoreRoutes'))->invoke($router, $collector);

        return array_values(array_unique($collector->seen));
    }

    /** @return list<string> */
    private static function specOperations(): array
    {
        $spec = Yaml::parseFile(\dirname(__DIR__, 2) . '/openapi.yaml');
        $ops = [];
        foreach ($spec['paths'] as $path => $item) {
            foreach (array_keys($item) as $method) {
                if (\in_array($method, ['get', 'post', 'put', 'patch', 'delete'], true)) {
                    $ops[] = strtoupper($method) . ' ' . self::normalize($path);
                }
            }
        }

        return $ops;
    }

    public static function normalize(string $path): string
    {
        // FastRoute placeholders may carry a regex ({route:.+}), OpenAPI ones never do.
        return (string) preg_replace('/\{[^}]+\}/', '{}', $path);
    }

    protected function setUp(): void
    {
        if (!class_exists(Yaml::class)) {
            self::markTestSkipped('symfony/yaml comes from Grav core, which is not available.');
        }
    }

    #[Test]
    public function every_core_route_is_documented(): void
    {
        $missing = array_values(array_diff(self::routerOperations(), self::specOperations()));
        sort($missing);

        self::assertSame([], $missing, 'Routes missing from openapi.yaml');
    }

    #[Test]
    public function the_spec_documents_no_removed_routes(): void
    {
        $stale = array_values(array_diff(self::specOperations(), self::routerOperations()));
        sort($stale);

        self::assertSame([], $stale, 'openapi.yaml documents routes the router no longer has');
    }
}
