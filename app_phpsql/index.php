<?php
/**
 * JabarOOH - Dashboard Performa Reklame Jawa Barat
 * Universal Production Entry Point (PHP 8.4+ Resilient Host)
 */
session_start();

// Determine dynamic base path for subfolder deployments (e.g. localhost/app_phpsql/ or domain.com/)
$scriptName = $_SERVER['SCRIPT_NAME'];
$basePath = rtrim(dirname($scriptName), '/\\') . '/';
if ($basePath === '//') $basePath = '/';

// Security Headers
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");
header("X-XSS-Protection: 1; mode=block");

// Find current CSS & JS bundle in assets/
$assetsDir = __DIR__ . '/assets';
$cssFiles = glob($assetsDir . '/*.css');
$jsFiles = glob($assetsDir . '/*.js');

$cssTag = '';
if (!empty($cssFiles)) {
    $mainCss = basename(end($cssFiles));
    $cssTag = '<link rel="stylesheet" crossorigin href="' . $basePath . 'assets/' . $mainCss . '">';
}

$jsTag = '';
if (!empty($jsFiles)) {
    $mainJs = basename(end($jsFiles));
    $jsTag = '<script type="module" crossorigin src="' . $basePath . 'assets/' . $mainJs . '"></script>';
}
?>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <base href="<?= htmlspecialchars($basePath) ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JabarOOH - Dashboard Performa Reklame Jawa Barat (Localhost & Production)</title>
    <meta name="description" content="Dashboard Analisis Performa & Pengukuran Media Luar Ruang (OOH/DOOH) Jawa Barat" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" />
    <?= $cssTag ?>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
    <div id="root"></div>
    <?= $jsTag ?>
  </body>
</html>
