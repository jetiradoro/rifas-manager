<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Plugin\Api\Controllers\AbstractApiController;
use Grav\Plugin\Api\Controllers\TranslatesAdminLabels;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

#[CoversClass(TranslatesAdminLabels::class)]
class TranslatesAdminLabelsTest extends TestCase
{
    private string $admin2Languages;

    protected function setUp(): void
    {
        $this->admin2Languages = sys_get_temp_dir() . '/api-admin2-languages-' . bin2hex(random_bytes(4));
        mkdir($this->admin2Languages, 0777, true);

        foreach (['en-US', 'es-ES', 'es-MX', 'ru-RU'] as $locale) {
            file_put_contents($this->admin2Languages . '/' . $locale . '.yaml', "ICU: []\n");
        }
    }

    protected function tearDown(): void
    {
        foreach (glob($this->admin2Languages . '/*.yaml') ?: [] as $file) {
            unlink($file);
        }
        if (is_dir($this->admin2Languages)) {
            rmdir($this->admin2Languages);
        }
    }

    #[Test]
    public function regioned_admin_language_falls_back_to_short_plugin_language_before_english(): void
    {
        $controller = $this->controller();

        self::assertSame(['ru-RU', 'ru', 'en', 'en-US'], $controller->languageChain('ru-RU'));
    }

    #[Test]
    public function requested_region_stays_first_before_sibling_region_variants(): void
    {
        $controller = $this->controller();

        self::assertSame(['es-MX', 'es', 'es-ES', 'en', 'en-US'], $controller->languageChain('es-MX'));
    }

    #[Test]
    public function bare_admin_language_still_reaches_regioned_admin2_dictionary(): void
    {
        $controller = $this->controller();

        self::assertSame(['en', 'en-US'], $controller->languageChain('en'));
    }

    #[Test]
    public function a_package_description_written_as_a_key_resolves_from_the_dictionary(): void
    {
        $controller = $this->controller(['MYTHEME.DESCRIPTION' => 'A theme for Grav']);

        self::assertSame('A theme for Grav', $controller->resolveKey('MYTHEME.DESCRIPTION'));
    }

    #[Test]
    public function the_icu_namespace_is_tried_before_the_flat_key(): void
    {
        $controller = $this->controller([
            'ICU.MYTHEME.DESCRIPTION' => 'From admin2',
            'MYTHEME.DESCRIPTION' => 'From the plugin',
        ]);

        self::assertSame('From admin2', $controller->resolveKey('MYTHEME.DESCRIPTION'));
    }

    #[Test]
    public function an_untranslated_key_comes_back_null_rather_than_humanized(): void
    {
        // translateLabel() would answer "Description" here, from its humanizer.
        // A package description has to keep whatever its author wrote (#39).
        $controller = $this->controller();

        self::assertNull($controller->resolveKey('MY_THEME.DESCRIPTION'));
    }

    #[Test]
    public function authored_prose_is_never_treated_as_a_key(): void
    {
        $controller = $this->controller(['FAST. SIMPLE. SECURE.' => 'should not be used']);

        self::assertNull($controller->resolveKey('A fast, simple theme.'));
        // All caps with dots, but prose: translateLabel()'s looser test matches
        // this one, the package-field test must not.
        self::assertNull($controller->resolveKey('FAST. SIMPLE. SECURE.'));
        // No dot at all.
        self::assertNull($controller->resolveKey('MYTHEME'));
    }

    #[Test]
    public function a_key_landing_on_a_nested_namespace_is_skipped(): void
    {
        $controller = $this->controller(['MYTHEME.DESCRIPTION' => ['SHORT' => 'A theme']]);

        self::assertNull($controller->resolveKey('MYTHEME.DESCRIPTION'));
    }

    private function controller(array $dictionary = []): TranslatesAdminLabelsProbeController
    {
        $grav = new Grav();
        $grav['locator'] = new TranslatesAdminLabelsTestLocator($this->admin2Languages);
        $grav['language'] = new TranslatesAdminLabelsTestLanguage($dictionary);

        return new TranslatesAdminLabelsProbeController($grav, new Config([]));
    }
}

final class TranslatesAdminLabelsProbeController extends AbstractApiController
{
    use TranslatesAdminLabels;

    /**
     * @return array<int, string>
     */
    public function languageChain(string $lang): array
    {
        return $this->expandLanguageChain($lang);
    }

    public function resolveKey(string $value): ?string
    {
        return $this->resolveTranslationKey($value);
    }
}

/**
 * Stands in for Grav's Language service: returns the key itself when it has no
 * translation, which is what `Language::translate()` does.
 */
final class TranslatesAdminLabelsTestLanguage
{
    public function __construct(private readonly array $dictionary) {}

    public function translate(string $key, ?array $languages = null, bool $arraySupport = false): mixed
    {
        return $this->dictionary[$key] ?? $key;
    }

    public function getLanguage(): string
    {
        return 'en';
    }
}

final class TranslatesAdminLabelsTestLocator
{
    public function __construct(private readonly string $admin2Languages) {}

    public function findResource(string $uri, bool $absolute = true, bool $create = false): ?string
    {
        return $uri === 'plugins://admin2/languages' ? $this->admin2Languages : null;
    }
}
