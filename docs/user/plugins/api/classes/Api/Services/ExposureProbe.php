<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Services;

/** Harmless sentinels tested by the browser, through the site's actual web server. */
final class ExposureProbe
{
    /** Return a public directory relative to the web root, or null for external storage. */
    public static function publicPath(string $directory, string $webroot): ?string
    {
        $directory = self::normalize($directory);
        $webroot = rtrim(self::normalize($webroot), '/');
        if (!str_starts_with($directory, $webroot . '/')) {
            return null;
        }

        return substr($directory, strlen($webroot) + 1);
    }

    private static function normalize(string $path): string
    {
        $parts = [];
        foreach (explode('/', str_replace('\\', '/', $path)) as $part) {
            if ($part === '..') {
                array_pop($parts);
            } elseif ($part !== '' && $part !== '.') {
                $parts[] = $part;
            }
        }
        return '/' . implode('/', $parts);
    }

    /** @return array<int,array{location:string,extension:string,url:string,token:string,available:bool}> */
    public static function create(string $directory, string $publicPath, string $rootUrl): array
    {
        if (!is_dir($directory)) {
            @mkdir($directory, 0770, true);
        }

        $probes = [];
        foreach (['dat', 'txt', 'zip', 'json'] as $extension) {
            $filename = 'grav-security-probe.' . $extension;
            $file = rtrim($directory, '/\\') . '/' . $filename;
            $token = '';

            // Never overwrite an existing file or follow a sentinel symlink. Exclusive
            // creation also lets concurrent dashboards reuse the same stable token.
            if (!is_link($file)) {
                if (!file_exists($file)) {
                    $handle = @fopen($file, 'x');
                    if ($handle !== false) {
                        fwrite($handle, bin2hex(random_bytes(16)));
                        fclose($handle);
                    }
                }
                $contents = is_file($file) ? @file_get_contents($file, false, null, 0, 128) : false;
                if (is_string($contents) && preg_match('/^[a-f0-9]{32,64}$/D', trim($contents))) {
                    $token = trim($contents);
                }
            }

            $path = implode('/', array_map('rawurlencode', explode('/', trim($publicPath, '/'))));
            $probes[] = [
                'location' => $publicPath,
                'extension' => $extension,
                'url' => rtrim($rootUrl, '/') . '/' . $path . '/' . $filename,
                'token' => $token,
                'available' => $token !== '',
            ];
        }

        return $probes;
    }
}
