<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\Grav;
use Grav\Common\User\Interfaces\UserInterface;
use Grav\Common\Yaml;
use Grav\Plugin\Api\Controllers\TranslationsEditorController;
use Grav\Plugin\Api\Exceptions\ValidationException;
use Grav\Plugin\Api\Tests\Unit\Services\I18nFakeCache;
use Grav\Plugin\Api\Tests\Unit\Services\I18nFakeConfig;
use Grav\Plugin\Api\Tests\Unit\Services\I18nFakeLanguage;
use Grav\Plugin\Api\Tests\Unit\Services\I18nFakeLanguages;
use Grav\Plugin\Api\Tests\Unit\Services\I18nFakeLocator;
use Grav\Plugin\Api\Tests\Unit\Services\I18nFakeSetup;
use Grav\Plugin\Api\Tests\Unit\Services\I18nTestFixture;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Bad input to the translation editor has to come back as a 422 the site owner
 * can act on, never a 500, and never as a misleading reason.
 */
class TranslationsEditorControllerErrorsTest extends TestCase
{
    private string $tmp = '';

    protected function setUp(): void
    {
        $this->tmp = sys_get_temp_dir() . '/grav-i18nctl-' . bin2hex(random_bytes(4));
        foreach (['system/languages', 'user/languages', 'user/config/plugins', 'user/plugins', 'user/themes', 'cache/compiled/languages'] as $dir) {
            mkdir($this->tmp . '/' . $dir, 0777, true);
        }
        $this->shipTheme(['THEME_QUARK' => ['NAV' => 'Primary'], 'PLUGIN_LOGIN' => ['BTN' => 'Sign in']]);
    }

    protected function tearDown(): void
    {
        I18nTestFixture::rrmdir($this->tmp);
        Grav::resetInstance();
    }

    #[Test]
    public function reading_overrides_for_a_bad_language_code_is_a_422(): void
    {
        $this->expectException(ValidationException::class);
        $this->controller()->showOverrides($this->request(['lang' => '../../config']));
    }

    #[Test]
    public function a_patch_whose_set_is_a_list_is_a_422(): void
    {
        $this->expectException(ValidationException::class);
        $this->controller()->patchOverrides($this->request(['lang' => 'en'], ['set' => ['one', 'two']]));
    }

    #[Test]
    public function a_numeric_key_inside_a_set_object_is_skipped_not_fatal(): void
    {
        $response = $this->controller()->patchOverrides(
            $this->request(['lang' => 'en'], ['set' => ['THEME_QUARK.NAV' => 'Main menu', 5 => 'stray']])
        );

        $body = json_decode((string) $response->getBody(), true);
        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame(['THEME_QUARK.NAV'], array_column($body['data']['rows'], 'key'));
    }

    #[Test]
    public function a_scoped_save_with_an_out_of_scope_key_names_the_key_not_a_parse_error(): void
    {
        try {
            $this->controller()->replaceOverrides($this->request(['lang' => 'en'], [
                'yaml' => "PLUGIN_LOGIN:\n  BTN: sneaky\n",
                'namespace' => 'THEME_QUARK',
            ]));
            $this->fail('Expected a ValidationException.');
        } catch (ValidationException $e) {
            $this->assertStringNotContainsString('could not be parsed', $e->getMessage());
            $this->assertStringContainsString('PLUGIN_LOGIN.BTN', $e->getMessage());
        }
    }

    #[Test]
    public function importing_a_config_with_a_bad_language_code_is_a_422_and_writes_nothing(): void
    {
        $controller = $this->controller([
            'en' => ['THEME_QUARK' => ['NAV' => 'Main menu']],
            'english' => ['THEME_QUARK' => ['NAV' => 'Main menu']],
        ]);

        try {
            $controller->import($this->request());
            $this->fail('Expected a ValidationException.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('english', $e->getMessage());
        }

        $this->assertFileDoesNotExist($this->tmp . '/user/languages/en.yaml', 'no language is written before the bad one is found');
    }

    #[Test]
    public function the_import_status_hides_the_config_path_from_demo_accounts(): void
    {
        $configured = ['en' => ['THEME_QUARK' => ['NAV' => 'Main menu']]];

        $demo = $this->controller($configured)->importStatus($this->request([], [], $this->user(demo: true)));
        $normal = $this->controller($configured)->importStatus($this->request());

        $this->assertSame('(hidden in demo mode)', json_decode((string) $demo->getBody(), true)['data']['config_path']);
        $this->assertStringEndsWith(
            '/plugins/translation-strings.yaml',
            json_decode((string) $normal->getBody(), true)['data']['config_path']
        );
    }

    /** @param array<mixed>|null $configured translation-strings `languages` config */
    private function controller(?array $configured = null): TranslationsEditorController
    {
        Grav::resetInstance();
        $grav = Grav::instance();
        $grav['locator'] = new I18nFakeLocator($this->tmp);
        $grav['config'] = new I18nFakeConfig(['translation-strings' => true], 'quark', [
            'system.languages.default_lang' => 'en',
            'plugins.translation-strings.languages' => $configured,
        ]);
        $grav['cache'] = new I18nFakeCache();
        $grav['setup'] = new I18nFakeSetup('localhost');
        $grav['language'] = new I18nFakeLanguage('en');
        $grav['languages'] = new I18nFakeLanguages();

        return new TranslationsEditorController($grav, new Config([]));
    }

    /**
     * @param array<string, string> $route
     * @param array<mixed>          $body
     */
    private function request(array $route = [], array $body = [], ?UserInterface $user = null): ServerRequestInterface
    {
        return TestHelper::createMockRequest('POST', '/i18n', attributes: [
            'api_user' => $user ?? $this->user(),
            'route_params' => $route,
            'json_body' => $body,
        ]);
    }

    private function user(bool $demo = false): UserInterface
    {
        // The mock's get() is a flat lookup, so the demo flag isDemoUser() reads
        // needs its own dotted key alongside the nested access map.
        return TestHelper::createMockUser('root', [
            'access' => ['api' => ['super' => true, 'demo' => $demo]],
            'access.api.demo' => $demo,
        ]);
    }

    /** @param array<mixed> $data */
    private function shipTheme(array $data): void
    {
        $dir = $this->tmp . '/user/themes/quark/languages';
        mkdir($dir, 0777, true);
        file_put_contents("{$dir}/en.yaml", Yaml::dump($data));
        file_put_contents(dirname($dir) . '/blueprints.yaml', "name: Quark\n");
    }
}
