<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Serializers;

use Grav\Common\GPM\Licenses;
use Grav\Plugin\Api\Serializers\PackageSerializer;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use RocketTheme\Toolbox\File\FileInterface;

/**
 * A package's top-level `name` / `description` come from its own
 * blueprints.yaml, where an author may equally write literal prose or a
 * translation key. The serializer takes an optional translator that resolves
 * keys and returns null for everything else, so literal text survives
 * untouched and an unresolvable key is served as authored rather than
 * humanized into a word (#39).
 */
#[CoversClass(PackageSerializer::class)]
class PackageSerializerTest extends TestCase
{
    /**
     * Translator standing in for TranslatesAdminLabels::resolveTranslationKey():
     * resolves known keys, returns null for anything else.
     */
    private function serializer(array $dictionary = []): PackageSerializer
    {
        return new PackageSerializer(
            static fn (string $value): ?string => $dictionary[$value] ?? null,
        );
    }

    private function package(array $props): object
    {
        return (object) $props;
    }

    #[Test]
    public function description_written_as_a_translation_key_is_translated(): void
    {
        $data = $this->serializer(['MYTHEME.DESCRIPTION' => 'A theme for Grav'])
            ->serialize($this->package(['slug' => 'mytheme', 'description' => 'MYTHEME.DESCRIPTION']));

        self::assertSame('A theme for Grav', $data['description']);
        self::assertSame("<p>A theme for Grav</p>", trim($data['description_html']));
    }

    #[Test]
    public function markdown_is_rendered_from_the_translated_text_not_the_key(): void
    {
        $data = $this->serializer(['MYTHEME.DESCRIPTION' => 'A **fast** theme for [Grav](https://getgrav.org)'])
            ->serialize($this->package(['slug' => 'mytheme', 'description' => 'MYTHEME.DESCRIPTION']));

        self::assertStringContainsString('<strong>fast</strong>', $data['description_html']);
        self::assertStringContainsString('href="https://getgrav.org"', $data['description_html']);
        self::assertStringNotContainsString('MYTHEME.DESCRIPTION', $data['description_html']);
    }

    #[Test]
    public function translated_description_is_still_rendered_in_parsedown_safe_mode(): void
    {
        $data = $this->serializer(['MYTHEME.DESCRIPTION' => 'Nice <script>alert(1)</script> theme'])
            ->serialize($this->package(['slug' => 'mytheme', 'description' => 'MYTHEME.DESCRIPTION']));

        self::assertStringNotContainsString('<script>', $data['description_html']);
        self::assertStringContainsString('&lt;script&gt;', $data['description_html']);
    }

    #[Test]
    public function a_literal_description_passes_through_unchanged(): void
    {
        $data = $this->serializer(['MYTHEME.DESCRIPTION' => 'should not be used'])
            ->serialize($this->package([
                'slug' => 'mytheme',
                'description' => 'A **fast** theme. FAST. SIMPLE.',
            ]));

        self::assertSame('A **fast** theme. FAST. SIMPLE.', $data['description']);
        self::assertStringContainsString('<strong>fast</strong>', $data['description_html']);
    }

    #[Test]
    public function an_unresolvable_key_is_served_as_authored(): void
    {
        // Nothing translates it — better the author's own value than a
        // humanized guess ("Description").
        $data = $this->serializer()
            ->serialize($this->package(['slug' => 'mytheme', 'description' => 'MYTHEME.DESCRIPTION']));

        self::assertSame('MYTHEME.DESCRIPTION', $data['description']);
        self::assertSame('<p>MYTHEME.DESCRIPTION</p>', trim($data['description_html']));
    }

    #[Test]
    public function name_written_as_a_translation_key_is_translated_too(): void
    {
        $data = $this->serializer(['MYTHEME.NAME' => 'My Theme'])
            ->serialize($this->package(['slug' => 'mytheme', 'name' => 'MYTHEME.NAME']));

        self::assertSame('My Theme', $data['name']);
    }

    #[Test]
    public function a_literal_name_passes_through_unchanged(): void
    {
        $data = $this->serializer(['MYTHEME.NAME' => 'should not be used'])
            ->serialize($this->package(['slug' => 'quark', 'name' => 'Quark']));

        self::assertSame('Quark', $data['name']);
    }

    #[Test]
    public function author_name_and_keywords_are_never_translated(): void
    {
        // Proper nouns and tag words: a translator must not be asked about them.
        $seen = [];
        $serializer = new PackageSerializer(
            static function (string $value) use (&$seen): ?string {
                $seen[] = $value;

                return null;
            },
        );

        $serializer->serialize($this->package([
            'slug' => 'mytheme',
            'name' => 'My Theme',
            'description' => 'A theme',
            'author' => (object) ['name' => 'AUTHOR.NAME', 'email' => 'a@b.test'],
            'keywords' => ['THEME.KEYWORD'],
        ]));

        // Description first (it is resolved before the payload is assembled,
        // so the markdown renders from the translation), then name. Nothing else.
        self::assertSame(['A theme', 'My Theme'], $seen);
    }

    #[Test]
    public function without_a_translator_every_value_is_served_verbatim(): void
    {
        $data = (new PackageSerializer())->serialize($this->package([
            'slug' => 'mytheme',
            'name' => 'MYTHEME.NAME',
            'description' => 'MYTHEME.DESCRIPTION',
        ]));

        self::assertSame('MYTHEME.NAME', $data['name']);
        self::assertSame('MYTHEME.DESCRIPTION', $data['description']);
    }

    #[Test]
    public function an_absent_description_stays_null(): void
    {
        $data = $this->serializer(['' => 'nope'])
            ->serialize($this->package(['slug' => 'mytheme']));

        self::assertNull($data['description']);
        self::assertNull($data['description_html']);
    }

    // ------------------------------------------------------------- licensing

    /**
     * Stand the licence file in for an in-memory one, so `licensed` can be
     * exercised without a Grav locator or anything on disk.
     *
     * @param array<string, string> $licenses slug => key
     */
    private function storedLicenses(array $licenses): void
    {
        $file = $this->createMock(FileInterface::class);
        $file->method('content')->willReturn(['licenses' => $licenses]);

        $property = new \ReflectionProperty(Licenses::class, 'file');
        $property->setValue(null, $file);
    }

    /**
     * The stand-in is a static on a core class, so it outlives the test that
     * set it. Put it back, or the next class to ask about a licence gets this
     * one's answer.
     */
    protected function tearDown(): void
    {
        (new \ReflectionProperty(Licenses::class, 'file'))->setValue(null, null);

        parent::tearDown();
    }

    #[Test]
    public function a_premium_package_with_its_own_key_is_licensed(): void
    {
        $this->storedLicenses(['kahunacart' => 'KC-AAAA-BBBB-CCCC-DDDD']);

        $data = (new PackageSerializer())->serialize($this->package([
            'slug' => 'kahunacart',
            'premium' => ['license_product' => 'kahunacart', 'checkout_url' => 'https://example.com/buy'],
        ]));

        self::assertTrue($data['premium']);
        self::assertTrue($data['licensed']);
    }

    /**
     * The case the admin got wrong: a package sold inside a wider licence, with
     * the customer's one key filed under the product they actually bought. It
     * is licensed, and the admin must offer Install rather than Buy.
     */
    #[Test]
    public function a_premium_package_covered_by_another_products_key_is_licensed(): void
    {
        $this->storedLicenses(['kahunacart' => 'KC-AAAA-BBBB-CCCC-DDDD']);

        $data = (new PackageSerializer())->serialize($this->package([
            'slug' => 'kahunacart-stripe',
            'premium' => ['license_product' => 'kahunacart'],
        ]));

        self::assertTrue($data['licensed']);
    }

    #[Test]
    public function a_premium_package_the_customer_has_not_bought_is_not_licensed(): void
    {
        $this->storedLicenses(['kahunacart' => 'KC-AAAA-BBBB-CCCC-DDDD']);

        $data = (new PackageSerializer())->serialize($this->package([
            'slug' => 'kahunacart-newsletters',
            'premium' => ['license_product' => 'kahunacart-newsletters'],
        ]));

        self::assertFalse($data['licensed']);
    }
}
