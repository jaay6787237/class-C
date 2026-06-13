<?php
/**
 * Router Gate for Vercel Serverless hosting.
 * SISFO C '25 (Sistem Informasi Kelas C Angkatan 2025)
 */

$request_uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($request_uri, PHP_URL_PATH);

// Clean trailing slash (except for home path /)
if ($path !== '/' && substr($path, -1) === '/') {
    $path = rtrim($path, '/');
}

// Map path to local PHP files
switch ($path) {
    case '':
    case '/':
    case '/index.php':
    case '/index':
        require __DIR__ . '/../index.php';
        break;

    case '/login':
    case '/login.php':
        require __DIR__ . '/../login.php';
        break;

    case '/admin':
    case '/admin.php':
        require __DIR__ . '/../admin.php';
        break;

    default:
        // Set HTTP response 404
        http_response_code(404);
        echo "<div style='font-family: sans-serif; text-align: center; margin-top: 100px; color: #fff; background-color: #060b13; height: 100vh; padding: 20px;'>";
        echo "<h1 style='font-size: 4rem; margin-bottom: 10px;'>404</h1>";
        echo "<p style='font-size: 1.25rem; color: #94a3b8;'>Halaman Tidak Ditemukan - SISFO C '25</p>";
        echo "<a href='/' style='color: #38bdf8; text-decoration: none;'>Kembali ke Dashboard</a>";
        echo "</div>";
        break;
}
