<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Services;

use Grav\Plugin\Api\Services\ExposureProbe;
use PHPUnit\Framework\TestCase;

class ExposureProbeTest extends TestCase
{
    private string $root;

    protected function setUp(): void
    {
        $this->root = sys_get_temp_dir() . '/grav-exposure-' . bin2hex(random_bytes(6));
        mkdir($this->root, 0700);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->root . '/*') as $file) { unlink($file); }
        rmdir($this->root);
    }

    public function testAllExtensionsAreAvailableAndConcurrentDashboardsReuseTokens(): void
    {
        $probes = ExposureProbe::create($this->root, 'custom user/data', 'https://example.com/subsite');
        self::assertSame(['dat', 'txt', 'zip', 'json'], array_column($probes, 'extension'));
        foreach ($probes as $probe) {
            self::assertTrue($probe['available']);
            self::assertSame($probe['token'], file_get_contents($this->root . '/grav-security-probe.' . $probe['extension']));
            self::assertStringStartsWith('https://example.com/subsite/custom%20user/data/', $probe['url']);
        }
        self::assertSame($probes, ExposureProbe::create($this->root, 'custom user/data', 'https://example.com/subsite'));
    }

    public function testExistingUnrelatedFilesAndSymlinksAreNotOverwritten(): void
    {
        file_put_contents($this->root . '/original', 'leave alone');
        symlink($this->root . '/original', $this->root . '/grav-security-probe.dat');
        file_put_contents($this->root . '/grav-security-probe.txt', 'other contents');
        $probes = ExposureProbe::create($this->root, 'backup', 'https://example.com');
        self::assertFalse($probes[0]['available']);
        self::assertFalse($probes[1]['available']);
        self::assertTrue($probes[2]['available']);
        self::assertSame('leave alone', file_get_contents($this->root . '/original'));
        self::assertSame('other contents', file_get_contents($this->root . '/grav-security-probe.txt'));
    }

    public function testExternalStorageHasNoPublicPathAndPrefixSiblingsAreExcluded(): void
    {
        self::assertNull(ExposureProbe::publicPath('/srv/site-backups', '/srv/site'));
        self::assertNull(ExposureProbe::publicPath('/srv/site/../private', '/srv/site'));
        self::assertSame('backup', ExposureProbe::publicPath('/srv/site/backup/', '/srv/site/'));
        self::assertSame('user/data', ExposureProbe::publicPath('/srv/site/user/data', '/srv/site'));
    }

    public function testUnavailableStorageIsReportedAsUnavailable(): void
    {
        file_put_contents($this->root . '/blocked', 'file');
        $probes = ExposureProbe::create($this->root . '/blocked/data', 'user/data', 'https://example.com');
        self::assertSame([false, false, false, false], array_column($probes, 'available'));
    }
}
