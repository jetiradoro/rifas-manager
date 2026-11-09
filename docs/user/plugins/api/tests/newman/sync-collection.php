<?php

/**
 * Brings grav-api.postman_collection.json up to date with openapi.yaml.
 *
 * openapi.yaml is the source of truth. The collection is also the Newman
 * suite, so its hand-written requests (and their test scripts) are never
 * touched: this only adds a request for every operation none of them already
 * calls. Added requests carry an `openapi:<operationId>` id, are rebuilt on
 * every run, and skip themselves when run.sh sets `newman_suite`, since many
 * of them change or delete things the suite depends on.
 *
 * Usage: php tests/newman/sync-collection.php   (or npm run postman:sync)
 */

declare(strict_types=1);

use Symfony\Component\Yaml\Yaml;

require __DIR__ . '/../bootstrap.php';

if (!class_exists(Yaml::class)) {
    fwrite(STDERR, "symfony/yaml not found. Run from inside a Grav install, or set GRAV_ROOT.\n");
    exit(1);
}

$root = dirname(__DIR__, 2);
$collectionFile = $root . '/grav-api.postman_collection.json';
$spec = Yaml::parseFile($root . '/openapi.yaml');
$collection = json_decode((string) file_get_contents($collectionFile), true, 512, JSON_THROW_ON_ERROR);

const GENERATED = 'openapi:';
const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

// Path parameters that map onto variables the collection already defines.
const PARAM_VARIABLES = [
    'route' => '{{page_route}}',
    'username' => '{{test_username}}',
    'lang' => '{{lang}}',
    'slug' => '{{package_slug}}',
    'id' => '{{webhook_id}}',
];

$resolve = static function (array $node) use ($spec): array {
    while (isset($node['$ref'])) {
        $node = array_reduce(
            explode('/', substr($node['$ref'], 2)),
            static fn ($carry, $key) => $carry[$key],
            $spec
        );
    }

    return $node;
};

/** A plausible value for a schema, preferring what the spec states. */
$sample = static function (array $schema, int $depth = 0) use (&$sample, $resolve) {
    $schema = $resolve($schema);
    foreach (['example', 'default'] as $key) {
        if (array_key_exists($key, $schema)) {
            return $schema[$key];
        }
    }
    if (isset($schema['enum'])) {
        return $schema['enum'][0];
    }
    foreach (['allOf', 'oneOf', 'anyOf'] as $key) {
        if (isset($schema[$key])) {
            if ($key !== 'allOf') {
                return $sample($schema[$key][0], $depth);
            }
            $merged = [];
            foreach ($schema[$key] as $part) {
                $value = $sample($part, $depth);
                if (is_array($value)) {
                    $merged += $value;
                }
            }

            return $merged;
        }
    }

    $type = $schema['type'] ?? (isset($schema['properties']) ? 'object' : 'string');

    return match ($type) {
        'object' => $depth > 3 ? new stdClass() : (object) array_map(
            static fn ($property) => $sample($property, $depth + 1),
            $schema['properties'] ?? []
        ),
        'array' => $depth > 3 ? [] : [$sample($schema['items'] ?? [], $depth + 1)],
        'integer', 'number' => 0,
        'boolean' => false,
        default => '',
    };
};

// Operations the hand-written requests already call, as "METHOD /path".
$covered = [];
$walk = static function (array $items) use (&$walk, &$covered): array {
    $kept = [];
    foreach ($items as $item) {
        if (isset($item['item'])) {
            $item['item'] = $walk($item['item']);
            $kept[] = $item;
            continue;
        }
        if (str_starts_with($item['id'] ?? '', GENERATED)) {
            continue;
        }
        $url = $item['request']['url'];
        $raw = is_array($url) ? $url['raw'] : $url;
        $path = strtok((string) preg_replace('#^\{\{base_url\}\}\{\{api_prefix\}\}#', '', $raw), '?');
        $covered[] = strtoupper($item['request']['method']) . ' ' . $path;
        $kept[] = $item;
    }

    return $kept;
};
$collection['item'] = $walk($collection['item']);

$isCovered = static function (string $method, string $path) use ($covered): bool {
    $pattern = '#^' . $method . ' ' . preg_replace('/\\\{[^}]+\\\}/', '[^/]+', preg_quote($path, '#')) . '$#';
    foreach ($covered as $op) {
        if (preg_match($pattern, $op)) {
            return true;
        }
    }

    return false;
};

$build = static function (string $path, string $method, array $op, array $shared) use ($resolve, $sample): array {
    $segments = [];
    $variables = [];
    foreach (explode('/', ltrim($path, '/')) as $segment) {
        if (preg_match('/^\{(\w+)\}$/', $segment, $m)) {
            $segments[] = ':' . $m[1];
            $variables[$m[1]] = ['key' => $m[1], 'value' => PARAM_VARIABLES[$m[1]] ?? ''];
        } else {
            $segments[] = $segment;
        }
    }

    $query = [];
    foreach (array_merge($shared, $op['parameters'] ?? []) as $param) {
        $param = $resolve($param);
        if ($param['in'] === 'path' && isset($variables[$param['name']])) {
            $variables[$param['name']]['description'] = $param['description'] ?? '';
        } elseif ($param['in'] === 'query') {
            $value = $sample($param['schema'] ?? []);
            $query[] = [
                'key' => $param['name'],
                'value' => match (true) {
                    is_bool($value) => $value ? 'true' : 'false',
                    is_scalar($value) => (string) $value,
                    default => '',
                },
                'description' => $param['description'] ?? '',
                'disabled' => !($param['required'] ?? false),
            ];
        }
    }

    $public = ($op['security'] ?? null) === [];
    $header = $public ? [] : [['key' => 'X-API-Key', 'value' => '{{api_key}}', 'description' => 'API Key authentication']];
    $header[] = ['key' => 'X-Grav-Environment', 'value' => '{{grav_environment}}', 'description' => 'Grav environment'];

    $body = null;
    $content = isset($op['requestBody']) ? $resolve($op['requestBody'])['content'] ?? [] : [];
    if (isset($content['application/json'])) {
        $media = $content['application/json'];
        $example = $media['example'] ?? (isset($media['examples']) ? $resolve(reset($media['examples']))['value'] ?? null : null);
        $example ??= $sample($media['schema'] ?? []);
        $header[] = ['key' => 'Content-Type', 'value' => 'application/json'];
        $body = [
            'mode' => 'raw',
            'raw' => str_replace('    ', '  ', (string) json_encode($example, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)),
            'options' => ['raw' => ['language' => 'json']],
        ];
    } elseif (isset($content['multipart/form-data'])) {
        $schema = $resolve($content['multipart/form-data']['schema'] ?? []);
        $formdata = [];
        foreach ($schema['properties'] ?? [] as $name => $property) {
            $property = $resolve($property);
            $isFile = ($property['format'] ?? '') === 'binary'
                || ($property['items']['format'] ?? '') === 'binary';
            $formdata[] = $isFile
                ? ['key' => $name, 'type' => 'file', 'src' => [], 'description' => $property['description'] ?? '']
                : ['key' => $name, 'type' => 'text', 'value' => '', 'description' => $property['description'] ?? ''];
        }
        $body = ['mode' => 'formdata', 'formdata' => $formdata];
    }

    $raw = '{{base_url}}{{api_prefix}}/' . implode('/', $segments);
    $enabled = array_filter($query, static fn ($q) => !$q['disabled']);
    if ($enabled) {
        $raw .= '?' . implode('&', array_map(static fn ($q) => $q['key'] . '=' . $q['value'], $enabled));
    }

    $request = [
        'method' => strtoupper($method),
        'header' => $header,
        'url' => array_filter([
            'raw' => $raw,
            'host' => ['{{base_url}}{{api_prefix}}'],
            'path' => $segments,
            'query' => $query,
            'variable' => array_values($variables),
        ]),
        'description' => trim(($op['description'] ?? '')
            . ($public && stripos($op['description'] ?? '', 'public') === false ? "\n\nPublic: no authentication required." : '')),
    ];
    if ($body !== null) {
        $request['body'] = $body;
    }

    return [
        'id' => GENERATED . ($op['operationId'] ?? strtolower($method) . $path),
        'name' => $op['summary'] ?? strtoupper($method) . ' ' . $path,
        'event' => [[
            'listen' => 'prerequest',
            'script' => ['type' => 'text/javascript', 'exec' => [
                '// Generated from openapi.yaml by tests/newman/sync-collection.php; the Newman suite skips it.',
                "if (pm.variables.get('newman_suite')) { pm.execution.skipRequest(); }",
            ]],
        ]],
        'request' => $request,
    ];
};

// Folders by name; new ones go before Teardown so it stays last.
$folderIndex = static function (string $name) use (&$collection): int {
    foreach ($collection['item'] as $i => $item) {
        if (isset($item['item']) && $item['name'] === $name) {
            return $i;
        }
    }
    $teardown = array_search('Teardown', array_column($collection['item'], 'name'), true);
    $at = $teardown === false ? count($collection['item']) : $teardown;
    array_splice($collection['item'], $at, 0, [['name' => $name, 'item' => []]]);

    return $at;
};

$added = 0;
foreach ($spec['paths'] as $path => $pathItem) {
    foreach (METHODS as $method) {
        if (!isset($pathItem[$method]) || $isCovered(strtoupper($method), $path)) {
            continue;
        }
        $op = $pathItem[$method];
        $folder = $folderIndex($op['tags'][0] ?? 'Other');
        $collection['item'][$folder]['item'][] = $build($path, $method, $op, $pathItem['parameters'] ?? []);
        $added++;
    }
}

// Two-space indent, matching how Postman exports it.
$json = json_encode($collection, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
$json = (string) preg_replace_callback('/^( {4})+/m', static fn ($m) => str_repeat('  ', strlen($m[0]) / 4), $json);
file_put_contents($collectionFile, $json . "\n");

printf("%d hand-written requests kept, %d generated from openapi.yaml\n", count($covered), $added);
