<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Common\Page\Interfaces\PageInterface;
use Grav\Plugin\Api\Controllers\PagesController;
use Grav\Plugin\Api\Exceptions\ValidationException;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

/**
 * Language-code input guards and the translation delete's children check.
 */
#[CoversClass(PagesController::class)]
class PagesControllerLanguageGuardsTest extends TestCase
{
    private string $pageDir;

    protected function setUp(): void
    {
        $this->pageDir = sys_get_temp_dir() . '/grav_api_lang_guard_' . bin2hex(random_bytes(4));
        mkdir($this->pageDir . '/child', 0777, true);
        file_put_contents($this->pageDir . '/default.en.md', "---\ntitle: X\n---\n");
    }

    protected function tearDown(): void
    {
        @unlink($this->pageDir . '/default.en.md');
        @rmdir($this->pageDir . '/child');
        @rmdir($this->pageDir);
        Grav::resetInstance();
    }

    private function createController(): PagesController
    {
        $config = new Config([
            'plugins' => ['api' => ['route' => '/api', 'version_prefix' => 'v1']],
        ]);
        $language = new class {
            public function enabled(): bool { return true; }
            public function validate(string $lang): bool { return in_array($lang, ['en', 'fr'], true); }
            public function getLanguages(): array { return ['en', 'fr']; }
            public function getDefault(): string { return 'en'; }
        };
        $locator = new class {
            public function findResource(string $uri, bool $absolute = false): string
            {
                return sys_get_temp_dir() . '/grav_api_lang_guard_test';
            }
        };
        $grav = TestHelper::createMockGrav(['config' => $config, 'language' => $language, 'locator' => $locator]);

        return new PagesController($grav, $config);
    }

    public static function nonStringCodes(): array
    {
        return [
            'json int' => [1],
            'query array' => [['en']],
            'null' => [null],
            'empty' => [''],
        ];
    }

    #[Test]
    #[\PHPUnit\Framework\Attributes\DataProvider('nonStringCodes')]
    public function non_string_language_codes_are_a_validation_error(mixed $code): void
    {
        $method = new ReflectionMethod(PagesController::class, 'validateLanguageCode');

        $this->expectException(ValidationException::class);
        $method->invoke($this->createController(), $code);
    }

    #[Test]
    public function valid_language_code_passes(): void
    {
        $method = new ReflectionMethod(PagesController::class, 'validateLanguageCode');
        $method->invoke($this->createController(), 'fr');
        $this->addToAssertionCount(1);
    }

    #[Test]
    public function deleting_the_only_translation_honours_children_false(): void
    {
        $children = new \ArrayIterator(['child']);
        $page = $this->createMock(TranslatablePageForLanguageGuardsTest::class);
        $page->method('translatedLanguages')->willReturn(['en' => '/x']);
        $page->method('path')->willReturn($this->pageDir);
        $page->method('children')->willReturn($children);

        $method = new ReflectionMethod(PagesController::class, 'deleteLanguageFile');

        try {
            $method->invoke($this->createController(), $page, 'en', false);
            self::fail('Expected a ValidationException for a page with children.');
        } catch (ValidationException) {
            // The folder and its children must still be there.
            self::assertDirectoryExists($this->pageDir . '/child');
            self::assertFileExists($this->pageDir . '/default.en.md');
        }
    }
}

/**
 * The test stubs' PageInterface doesn't declare translatedLanguages(), which
 * the real page classes carry; this adds it so the method can be mocked.
 */
abstract class TranslatablePageForLanguageGuardsTest implements PageInterface
{
    abstract public function translatedLanguages(): array;
}
