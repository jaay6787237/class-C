// Complete, high-fidelity PHP source codes matching the production code on disk 1:1.
// These are visible in the "Native PHP Code Explorer" tab so users get fully working files.

export const PHP_SOURCES = {
  "vercel.json": `{
  "version": 2,
  "plugins": [],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.php"
    }
  ],
  "builds": [
    {
      "src": "api/index.php",
      "use": "vercel-php@0.7.3"
    }
  ]
}`,

  "api/index.php": `<?php
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
        echo "<a href=\"/\" style='color: #38bdf8; text-decoration: none;'>Kembali ke Dashboard</a>";
        echo "</div>";
        break;
}
`,

  "db.php": `<?php
/**
 * Database Central Connection for SISFO C '25
 * Using Supabase PostgreSQL Serverless connection.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Retrieve environment variables
$host = getenv('DB_HOST');
$port = getenv('DB_PORT') ?: '5432';
$dbname = getenv('DB_DATABASE');
$username = getenv('DB_USERNAME');
$password = getenv('DB_PASSWORD');

$pdo = null;
$db_error = null;

if (empty($host) || empty($dbname) || empty($username)) {
    $db_error = "Kredensial database Supabase belum dikonfigurasi di Environment Variables (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD).";
} else {
    try {
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        // Auto-create database tables if not existing (Stateless Cloud migration pattern)
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                jumlah_anggota INT DEFAULT 0,
                jadwal TEXT,
                media TEXT
            );
        ");

        // Add logo_url column to settings if not exists (Stateless database schema migration patterns)
        try {
            $pdo->exec("ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop';");
        } catch (Exception $col_err) {
            // Safe fallback if column already exists or driver doesn't support ADD COLUMN IF NOT EXISTS
        }

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS anggotas (
                id SERIAL PRIMARY KEY,
                nama VARCHAR(255) NOT NULL,
                foto TEXT,
                bio TEXT
            );
        ");

        // Seed initial values for setting with id = 1 if not exists
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM settings WHERE id = 1");
        $stmtCheck->execute();
        if ($stmtCheck->fetchColumn() == 0) {
            // Seed defaults: 0 members, empty JSON array for course schedules and media gallery
            $defaultJadwal = json_encode([
                ["hari" => "Senin", "matkul" => "Rekayasa Perangkat Lunak", "jam" => "08:00 - 10:30", "ruang" => "Lab Komputer 3", "dosen" => "Dr. Ir. Budi Santoso, M.T."],
                ["hari" => "Selasa", "matkul" => "Sistem Penunjang Keputusan", "jam" => "10:45 - 13:15", "ruang" => "Gedung C Ruang 204", "dosen" => "Rina Wijayanti, M.Kom."],
                ["hari" => "Rabu", "matkul" => "Keamanan Informasi & Jaringan", "jam" => "13:30 - 16:00", "ruang" => "Lab Komputer 1", "dosen" => "Andi Wijaya, S.T., M.Sc."]
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            $defaultMedia = json_encode([
                ["tipe" => "gambar", "url" => "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200", "keterangan" => "Belajar bersama untuk persiapan ujian rekayasa sistem digital."],
                ["tipe" => "gambar", "url" => "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200", "keterangan" => "Keseruan kumpul makrab angkatan Jurusan Sistem Informasi."],
                ["tipe" => "video", "url" => "https://www.w3schools.com/html/mov_bbb.mp4", "keterangan" => "Dokumentasi cuplikan video presentasi project akhir angkatan."]
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            $stmtInsert = $pdo->prepare("INSERT INTO settings (id, jumlah_anggota, jadwal, media) VALUES (1, 12, :jadwal, :media)");
            $stmtInsert->execute([
                ':jadwal' => $defaultJadwal,
                ':media' => $defaultMedia
            ]);

            // Seed initial anggotas as demo content
            $stmtAnggota = $pdo->prepare("INSERT INTO anggotas (nama, foto, bio) VALUES (:nama, :foto, :bio)");
            
            $demoAnggota = [
                ["Ahmad Fauzi", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400", "Pecinta kopi dan backend developer. Selalu tertarik pada optimasi query."],
                ["Siti Aminah", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400", "UI/UX Designer & Product Lead. Suka mendesain antarmuka dengan sentuhan estetik."],
                ["Budi Pratama", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400", "Fullstack developer magang yang hobi bermain catur dan tenis meja."]
            ];

            foreach ($demoAnggota as $da) {
                $stmtAnggota->execute([
                    ':nama' => $da[0],
                    ':foto' => $da[1],
                    ':bio' => $da[2]
                ]);
            }
        }

    } catch (PDOException $e) {
        $db_error = "Koneksi database PostgreSQL Supabase gagal: " . $e->getMessage();
    }
}
`,

  "index.php": `<?php
/**
 * Public Dashboard View for SISFO C '25
 * Styled using Tailwind CSS (Deep Navy Palette #060b13)
 */

require_once __DIR__ . '/db.php';

// Fetch settings
$jumlah_anggota = 0;
$jadwal_array = [];
$media_array = [];
$logo_url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop";

if ($pdo) {
    try {
        $stmtSettings = $pdo->query("SELECT * FROM settings WHERE id = 1");
        $settings = $stmtSettings->fetch();
        if ($settings) {
            $jumlah_anggota = $settings['jumlah_anggota'];
            $jadwal_array = json_decode($settings['jadwal'], true) ?: [];
            $media_array = json_decode($settings['media'], true) ?: [];
            $logo_url = isset($settings['logo_url']) && !empty($settings['logo_url']) ? $settings['logo_url'] : $logo_url;
        }

        // Fetch students list
        $stmtAnggotas = $pdo->query("SELECT * FROM anggotas ORDER BY id DESC");
        $anggotas_list = $stmtAnggotas->fetchAll() ?: [];
    } catch (PDOException $e) {
        $db_error = "Gagal mengambil data dari database: " . $e->getMessage();
    }
}

// Fallback to demo data if DB error occurred or tables aren't configured yet (to ensure preview always looks great)
if ($db_error) {
    $jumlah_anggota = 12;
    $logo_url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop";
    $jadwal_array = [
        ["hari" => "Senin", "matkul" => "Rekayasa Perangkat Lunak (Demo Mode)", "jam" => "08:00 - 10:30", "ruang" => "Lab Komputer 3", "dosen" => "Dr. Ir. Budi Santoso, M.T."],
        ["hari" => "Selasa", "matkul" => "Sistem Penunjang Keputusan", "jam" => "10:45 - 13:15", "ruang" => "Gedung C Ruang 204", "dosen" => "Rina Wijayanti, M.Kom."],
        ["hari" => "Rabu", "matkul" => "Keamanan Informasi & Jaringan", "jam" => "13:30 - 16:00", "ruang" => "Lab Komputer 1", "dosen" => "Andi Wijaya, S.T., M.Sc."]
    ];
    $media_array = [
        ["tipe" => "gambar", "url" => "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200", "keterangan" => "Belajar bersama untuk persiapan ujian rekayasa sistem digital."],
        ["tipe" => "gambar", "url" => "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200", "keterangan" => "Keseruan kumpul makrab angkatan Jurusan Sistem Informasi."],
        ["tipe" => "video", "url" => "https://www.w3schools.com/html/mov_bbb.mp4", "keterangan" => "Dokumentasi cuplikan video presentasi project akhir angkatan."]
    ];
    $anggotas_list = [
        ["id" => 1, "nama" => "Ahmad Fauzi", "foto" => "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400", "bio" => "Pecinta kopi and backend developer. Selalu tertarik pada optimasi query."],
        ["id" => 2, "nama" => "Siti Aminah", "foto" => "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400", "bio" => "UI/UX Designer & Product Lead. Suka mendesain antarmuka dengan sentuhan estetik."],
        ["id" => 3, "nama" => "Budi Pratama", "foto" => "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400", "bio" => "Fullstack developer magang yang hobi bermain catur dan tenis meja."]
    ];
}

// PHP ClassLogo SVG helper function to match React's perfectly!
function renderClassLogo($className = "w-6 h-6", $glow = true) {
    $effectClass = $glow ? "filter drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]" : "";
    return '
    <svg class="' . $className . ' ' . $effectClass . '" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="100,10 190,62 190,168 100,220 10,168 10,62" stroke="#38bdf8" stroke-width="12" stroke-linejoin="round" class="opacity-20" />
        <path d="M 100 35 L 165 72.5 L 165 105 L 100 67.5 L 58 92.5 L 58 120 L 100 95 L 142 120 L 142 147.5 L 100 122.5 L 35 85 L 100 47.5 Z" fill="#38bdf8" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round" />
        <path d="M 100 195 L 35 157.5 L 35 125 L 100 162.5 L 142 137.5 L 142 110 L 100 135 L 58 110 L 58 82.5 L 100 107.5 L 165 145 L 100 182.5 Z" fill="#38bdf8" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round" />
    </svg>';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SISFO C '25 - Sistem Informasi Kelas C 2025</title>
    <!-- Light Mode Checkpoint -->
    <script>
        if (localStorage.getItem('sisfo-theme') === 'light') {
            document.documentElement.classList.add('light');
        }
    </script>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Space Grotesk', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        navy: {
                            950: '#060b13',
                            900: '#0a1222',
                            800: '#0f1b32',
                            700: '#1e2d4a',
                            600: '#2d3f63',
                        }
                    }
                }
            }
        }
    </script>
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            background-color: #060b13;
            color: #f8fafc;
        }
        .glow-effect {
            box-shadow: 0 0 25px -5px rgba(56, 189, 248, 0.15);
        }

        /* Float Logo Floating Animation */
        @keyframes float-logo {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .float-animation {
            animation: float-logo 6s ease-in-out infinite;
        }

        /* Pulse Blur Background */
        @keyframes pulse-blur {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
        }
        .pulse-animation {
            animation: pulse-blur 3s ease-in-out infinite;
        }

        /* Floating background particles */
        @keyframes float-particle {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
            33% { transform: translateY(-30px) translateX(12px) rotate(120deg) scale(1.05); }
            66% { transform: translateY(-15px) translateX(20px) rotate(240deg) scale(0.98); }
        }
        .particle-hex {
            animation: float-particle var(--duration, 20s) ease-in-out infinite;
            animation-delay: var(--delay, 0s);
        }

        /* Smooth card glassmorphism hover transition classes */
        .glass-card {
            background-color: rgba(10, 18, 34, 0.45);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
            transform: translateY(-8px) scale(1.03);
            border-color: rgba(56, 189, 248, 0.45);
            background-color: rgba(15, 27, 50, 0.6);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 20px 40px -15px rgba(56, 189, 248, 0.3);
        }

        /* --- Welcome Animation Overlay Styles --- */
        #welcome-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #060b13;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.8s;
            will-change: opacity, transform;
        }
        #welcome-overlay.welcome-fade-out {
            opacity: 0;
            transform: scale(1.08);
            visibility: hidden;
            pointer-events: none;
        }
        .welcome-pulse {
            animation: welcome-glowing-pulse 2s infinite ease-in-out;
        }
        @keyframes welcome-glowing-pulse {
            0%, 100% {
                transform: scale(1);
                filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.4)) drop-shadow(0 0 30px rgba(56, 189, 248, 0.2));
            }
            50% {
                transform: scale(1.05);
                filter: drop-shadow(0 0 30px rgba(56, 189, 248, 0.8)) drop-shadow(0 0 60px rgba(56, 189, 248, 0.4));
            }
        }
        .text-tracking-expand {
            animation: tracking-expand 1.5s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
        }
        @keyframes tracking-expand {
            0% {
                letter-spacing: -0.5em;
                opacity: 0;
            }
            40% {
                opacity: 0.6;
            }
            100% {
                opacity: 1;
            }
        }

        /* --- Scroll Reveal Two-Way Styles --- */
        .scroll-reveal {
            opacity: 0;
            transform: translateY(40px) scale(0.96);
            transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: transform, opacity;
        }
        .scroll-reveal.reveal-up {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        .scroll-reveal.reveal-down {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        
        .stagger-1 { transition-delay: 50ms; }
        .stagger-2 { transition-delay: 100ms; }
        .stagger-3 { transition-delay: 150ms; }
        .stagger-4 { transition-delay: 200ms; }
        .stagger-5 { transition-delay: 250ms; }
        .stagger-6 { transition-delay: 300ms; }
        .stagger-7 { transition-delay: 350ms; }
        .stagger-8 { transition-delay: 400ms; }

        /* --- High Contrast Light Mode Overrides --- */
        html.light body {
            background-color: #f8fafc;
            color: #334155;
        }
        html.light header {
            background-color: rgba(255, 255, 255, 0.9) !important;
            border-color: #e2e8f0 !important;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        html.light header .font-display {
            background: linear-gradient(to right, #0284c7, #0369a1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        html.light header a {
            color: #475569 !important;
        }
        html.light header a:hover {
            color: #0284c7 !important;
        }
        html.light header .header-stat-val {
            color: #0f172a !important;
        }
        html.light header span.hidden.md\\:inline-block {
            background-color: #f1f5f9;
            border-color: #cbd5e1;
            color: #0284c7;
        }
        html.light main section {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        html.light main section h1 {
            color: #0f172a !important;
        }
        html.light main section p {
            color: #475569 !important;
        }
        html.light main section h2, html.light main section h3 {
            color: #0f172a !important;
        }
        html.light main section span.text-slate-500, html.light main section text-slate-400 {
            color: #64748b !important;
        }
        html.light .glass-card {
            background-color: rgba(255, 255, 255, 0.85) !important;
            border-color: #e2e8f0 !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        html.light .glass-card:hover {
            background-color: #ffffff !important;
            border-color: #38bdf8 !important;
            box-shadow: 0 20px 25px -5px rgba(56, 189, 248, 0.15);
        }
        html.light .glass-card h3 {
            color: #0f172a !important;
        }
        html.light .glass-card p {
            color: #475569 !important;
        }
        html.light .glass-card span {
            color: #64748b !important;
        }
        html.light footer {
            background-color: #f1f5f9 !important;
            border-color: #e2e8f0 !important;
        }
        html.light footer p {
            color: #64748b !important;
        }
        html.light footer a {
            color: #475569 !important;
        }
        html.light footer a:hover {
            color: #0284c7 !important;
        }
    </style>
</head>
<body class="font-sans antialiased selection:bg-sky-500 selection:text-white min-h-screen flex flex-col">

    <!-- Cyber Welcome Screen Overlay Loader -->
    <div id="welcome-overlay">
        <!-- Floating Ambient Glow Behind Loader -->
        <div class="absolute w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
            <div class="w-24 h-24 mb-6 welcome-pulse">
                <?php echo renderClassLogo("w-full h-full", true); ?>
            </div>
            <h2 class="font-display font-bold text-white text-xl uppercase tracking-widest text-tracking-expand">SISFO C '25</h2>
            <div class="w-48 h-1 bg-navy-900 rounded-full overflow-hidden mt-6 relative border border-navy-800">
                <div id="welcome-progress" class="w-0 h-full bg-gradient-to-r from-sky-400 to-indigo-505 bg-sky-400 rounded-full transition-all duration-75"></div>
            </div>
            <span id="welcome-status" class="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-3.5 block">MEMULAI DEKRIPSI KORIDOR...</span>
        </div>
    </div>

    <!-- Navigation Header -->
    <header class="border-b border-navy-850 bg-navy-950/80 sticky top-0 z-40 backdrop-blur-md transition-all">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <?php if (empty($logo_url) || strpos($logo_url, "unsplash.com/photo-1618005182384-a83a8bd57fbe") !== false): ?>
                    <a href="/" class="float-animation"><?php echo renderClassLogo("w-10 h-10", true); ?></a>
                <?php else: ?>
                    <div class="w-12 h-12 rounded-xl border border-sky-500/30 shadow-lg shadow-sky-500/10 overflow-hidden shrink-0 bg-navy-900 flex items-center justify-center">
                        <img src="<?php echo htmlspecialchars($logo_url); ?>" alt="Logo Kelas" class="w-full h-full object-cover">
                    </div>
                <?php endif; ?>
                <div>
                    <span class="font-display font-bold text-xl md:text-2xl uppercase tracking-wider bg-gradient-to-r from-sky-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">SISFO C '25</span>
                    <span class="hidden md:inline-block ml-2 text-xs font-mono px-2 py-0.5 rounded bg-navy-800 border border-navy-700/60 text-sky-300">Sistem Informasi</span>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <a href="#jadwal" class="hidden lg:inline-flex text-sm text-slate-300 hover:text-sky-400 font-medium transition-colors">Jadwal Kuliah</a>
                <a href="#mahasiswa" class="hidden lg:inline-flex text-sm text-slate-300 hover:text-sky-400 font-medium transition-colors">Direktori Mahasiswa</a>
                <a href="#galeri" class="hidden lg:inline-flex text-sm text-slate-300 hover:text-sky-400 font-medium transition-colors" >Galeri Kenangan</a>
                
                <!-- Class Statistics Container in Navigation header -->
                <div class="hidden sm:flex flex-col items-end border-r border-navy-800/80 pr-4 mr-1">
                    <span class="text-[9px] uppercase tracking-wider font-semibold text-slate-400">Class Statistics</span>
                    <div class="flex gap-3 mt-0.5 text-[11px] font-mono">
                        <div class="flex items-baseline gap-0.5">
                            <span class="font-bold text-white header-stat-val"><?php echo htmlspecialchars($jumlah_anggota); ?></span>
                            <span class="text-[9px] opacity-60">Anggota</span>
                        </div>
                        <div class="flex items-baseline gap-0.5">
                            <span class="font-bold text-white header-stat-val"><?php echo count($jadwal_array) * 4; ?></span>
                            <span class="text-[9px] opacity-60">SKS</span>
                        </div>
                        <div class="flex items-baseline gap-0.5">
                            <span class="font-bold text-white header-stat-val">3.82</span>
                            <span class="text-[9px] opacity-60">Avg GP</span>
                        </div>
                    </div>
                </div>

                <!-- Live Theme Toggle Button -->
                <button id="theme-toggle" class="p-2.5 rounded-xl border border-navy-700 bg-navy-800/85 hover:bg-navy-700 transition-all text-sky-400 cursor-pointer flex items-center justify-center shadow-lg" title="Ganti Tema">
                    <i id="theme-toggle-icon" data-lucide="sun" class="w-4 h-4 text-amber-400 font-bold"></i>
                </button>
                
                <?php if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true): ?>
                    <a href="/admin" class="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 border border-emerald-400/20">
                        <i data-lucide="layout-dashboard" class="w-4 h-4"></i> Panel Admin
                    </a>
                <?php else: ?>
                    <a href="/login" class="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-sky-300 hover:text-white font-medium text-sm px-5 py-2.5 rounded-xl border border-navy-700/80 transition-all transform hover:-translate-y-0.5">
                        <i data-lucide="lock" class="w-4 h-4"></i> Login Admin
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </header>

    <!-- Main Content Stage -->
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Hero Section -->
        <section class="relative rounded-3xl overflow-hidden mb-16 py-14 px-8 md:px-16 bg-navy-900 border border-navy-800 glow-effect text-center md:text-left scroll-reveal">
            <div class="absolute -right-20 -top-20 bg-sky-500/10 w-96 h-96 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -left-20 -bottom-20 bg-indigo-500/10 w-96 h-96 rounded-full blur-3xl pointer-events-none"></div>
            
            <!-- Ambient Floating Particles -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <?php for ($i = 0; $i < 6; $i++): 
                    $size = 100 + $i * 50;
                    $delay = $i * 1.5;
                    $duration = 22 + $i * 4;
                    $opacity = 0.02 + ($i % 3) * 0.01;
                    $top = 10 + $i * 14;
                    $left = 5 + ($i * 19) % 80;
                ?>
                    <div class="absolute flex items-center justify-center particle-hex" style="width: <?php echo $size; ?>px; height: <?php echo $size; ?>px; top: <?php echo $top; ?>%; left: <?php echo $left; ?>%; --duration: <?php echo $duration; ?>s; --delay: <?php echo $delay; ?>s; opacity: <?php echo $opacity; ?>;">
                        <svg viewBox="0 0 100 100" class="w-full h-full text-blue-400" fill="none" stroke="currentColor" stroke-width="1.5">
                            <polygon points="50,5 93,30 93,80 50,105 7,80 7,30" />
                        </svg>
                    </div>
                <?php endfor; ?>
            </div>

            <div class="relative z-10 grid md:grid-cols-12 items-center gap-8 md:gap-12">
                <div class="md:col-span-8 flex flex-col gap-5">
                    <span class="inline-flex max-w-max bg-sky-500/10 text-sky-450 border border-sky-500/20 text-xs font-bold font-mono tracking-wider uppercase px-3 py-1.5 rounded-full">
                        🔥 Website Koridor Angkatan 2025
                    </span>
                    <h1 class="font-sans font-extrabold text-3xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
                        Integrated Class Hub <span class="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">SISFO C '25</span>
                    </h1>
                    <p class="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl font-sans">
                        Mewadahi direktori data akademik, keanggotaan mahasiswa, serta mendokumentasikan setiap mozaik cerita perjalanan perkuliahan kita di UIN Raden Intan Lampung secara dinamis.
                    </p>
                    <div class="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                        <a href="#mahasiswa" class="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.03] transform">
                            <i data-lucide="users" class="w-5 h-5"></i> Direktori Anggota
                        </a>
                        <a href="#jadwal" class="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white font-semibold text-sm px-6 py-3 rounded-xl border border-navy-700 transition-all hover:scale-[1.03]">
                            Jadwal Kuliah <i data-lucide="arrow-right" class="w-4 h-4 text-sky-400"></i>
                        </a>
                    </div>
                </div>
                
                <!-- Statistics Card and Glow Logo Side -->
                <div class="md:col-span-4 w-full flex flex-col items-center justify-center">
                    <!-- Glowing Floating Logo Container -->
                    <div class="relative w-40 h-40 flex items-center justify-center mb-4 float-animation">
                        <div class="absolute inset-0 bg-sky-500/10 rounded-full blur-2xl pulse-animation"></div>
                        <?php if (empty($logo_url) || strpos($logo_url, "unsplash.com/photo-1618005182384-a83a8bd57fbe") !== false): ?>
                            <?php echo renderClassLogo("w-32 h-32 absolute z-10", true); ?>
                        <?php else: ?>
                            <div class="w-32 h-32 rounded-3xl overflow-hidden border-2 border-sky-500/30 shadow-lg shadow-sky-500/15 absolute z-10">
                                <img src="<?php echo htmlspecialchars($logo_url); ?>" alt="Class Logo" class="w-full h-full object-cover">
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="bg-navy-950/80 border border-navy-800/80 rounded-2xl p-5 w-full max-w-xs shadow-xl backdrop-blur-md flex flex-col gap-4 glass-card transition-all duration-300">
                        <div class="text-center pb-2 border-b border-navy-800/40">
                            <span class="text-[10px] text-sky-400 font-mono tracking-widest uppercase block">Statistik Akademik</span>
                            <span class="font-display font-extrabold text-[#38bdf8] text-sm tracking-wider">SISFO C '25 REGULAR</span>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                            <div class="text-center bg-navy-900/50 p-2 rounded-xl border border-navy-800/20">
                                <span class="text-[9px] text-slate-400 font-mono block uppercase">Anggota</span>
                                <span class="font-mono font-extrabold text-xl text-white block mt-1"><?php echo htmlspecialchars($jumlah_anggota); ?></span>
                            </div>
                            <div class="text-center bg-navy-900/50 p-2 rounded-xl border border-navy-800/20">
                                <span class="text-[9px] text-slate-400 font-mono block uppercase">SKS</span>
                                <span class="font-mono font-extrabold text-xl text-sky-400 block mt-1"><?php echo count($jadwal_array) * 4; ?></span>
                            </div>
                            <div class="text-center bg-navy-900/50 p-2 rounded-xl border border-navy-800/20">
                                <span class="text-[9px] text-slate-400 font-mono block uppercase">Avg GP</span>
                                <span class="font-mono font-extrabold text-xl text-indigo-400 block mt-1">3.82</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Jadwal Kuliah Section -->
        <section id="jadwal" class="mb-16 scroll-mt-24">
            <div class="flex items-center justify-between mb-8 scroll-reveal">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <i data-lucide="calendar" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 class="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">Jadwal Kuliah Mingguan</h2>
                        <p class="text-xs md:text-sm text-slate-450 mt-1 text-slate-400">Jadwal akademik terintegrasi secara dinamis.</p>
                    </div>
                </div>
                <span class="text-xs font-mono text-slate-500 hidden sm:inline">SISFO C '25 REGULAR</span>
            </div>
            
            <?php if (empty($jadwal_array)): ?>
                <div class="bg-navy-900 border border-navy-805 rounded-2xl p-12 text-center">
                    <i data-lucide="calendar-off" class="w-12 h-12 text-slate-500 mx-auto mb-4"></i>
                    <h3 class="text-lg font-semibold text-white">Belum Ada Jadwal</h3>
                    <p class="text-slate-400 mt-2 max-w-md mx-auto">Administrator belum merekam jadwal perkuliahan ke dalam konfigurasi settings kelas.</p>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($jadwal_array as $index => $jw): ?>
                        <div class="glass-card border border-navy-850 rounded-2xl p-6 group flex flex-col justify-between scroll-reveal stagger-<?php echo ($index % 8) + 1; ?>">
                            <div>
                                <div class="flex items-center justify-between mb-4 border-b border-navy-800/60 pb-3">
                                    <span class="inline-flex bg-sky-500/10 text-sky-400 text-xs font-bold font-mono uppercase px-3 py-1 rounded border border-sky-400/15">
                                        <?php echo htmlspecialchars($jw['hari'] ?? '-'); ?>
                                    </span>
                                    <span class="text-indigo-400 text-xs font-mono flex items-center gap-1">
                                        <i data-lucide="clock" class="w-3.5 h-3.5"></i> <?php echo htmlspecialchars($jw['jam'] ?? '-'); ?>
                                    </span>
                                </div>
                                <h3 class="font-display font-bold text-lg md:text-xl text-white group-hover:text-sky-305 transition-colors line-clamp-2">
                                    <?php echo htmlspecialchars($jw['matkul'] ?? '-'); ?>
                                </h3>
                                <p class="text-slate-400 text-sm mt-3 flex items-center gap-2">
                                    <i data-lucide="map-pin" class="w-4 h-4 text-sky-500/80 shrink-0"></i>
                                    <span>Ruang: <strong class="text-slate-300"><?php echo htmlspecialchars($jw['ruang'] ?? '-'); ?></strong></span>
                                </p>
                            </div>
                            <div class="mt-5 pt-4 border-t border-navy-800/50 flex items-center gap-2">
                                <div class="p-1 rounded bg-navy-800 text-sky-404 text-sky-400">
                                    <i data-lucide="user" class="w-4 h-4"></i>
                                </div>
                                <span class="text-xs text-slate-350 truncate max-w-full text-slate-400" title="<?php echo htmlspecialchars($jw['dosen'] ?? ''); ?>">
                                    <?php echo htmlspecialchars($jw['dosen'] ?? 'Dosen Belum Ditentukan'); ?>
                                </span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </section>

        <!-- Direktori Mahasiswa Section -->
        <section id="mahasiswa" class="mb-16 scroll-mt-24">
            <div class="flex items-center justify-between mb-8 scroll-reveal">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-550/20">
                        <i data-lucide="users" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 class="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">Direktori Mahasiswa Kelas</h2>
                        <p class="text-xs md:text-sm text-slate-400 mt-1">Daftar profil mahasiswa aktif dalam barisan Sistem Informasi C '25.</p>
                    </div>
                </div>
                <span class="text-xs font-mono text-slate-500 px-2 py-1 rounded bg-navy-900 border border-navy-800">
                    Total: <?php echo count($anggotas_list); ?> Profil
                </span>
            </div>
            
            <?php if (empty($anggotas_list)): ?>
                <div class="bg-navy-900 border border-navy-800 rounded-2xl p-12 text-center">
                    <i data-lucide="users-round" class="w-12 h-12 text-slate-500 mx-auto mb-4"></i>
                    <h3 class="text-lg font-semibold text-white">Database Mahasiswa Kosong</h3>
                    <p class="text-slate-400 mt-2 max-w-md mx-auto">Masuk ke Panel Admin untuk menginisialisasi atau mensinkronisasi data profil mahasiswa.</p>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <?php foreach ($anggotas_list as $index => $agt): ?>
                        <div class="glass-card border border-navy-850 rounded-2xl overflow-hidden group flex flex-col h-full scroll-reveal stagger-<?php echo ($index % 8) + 1; ?>">
                            <!-- Image container with strict external URL source -->
                            <div class="relative pt-[110%] w-full bg-navy-950 overflow-hidden shrink-0 border-b border-navy-800">
                                <?php if (!empty($agt['foto'])): ?>
                                    <img src="<?php echo htmlspecialchars($agt['foto']); ?>" referrerpolicy="no-referrer" alt="<?php echo htmlspecialchars($agt['nama']); ?>" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300';">
                                <?php else: ?>
                                    <div class="absolute inset-0 flex flex-col items-center justify-center bg-navy-850 text-slate-500">
                                        <i data-lucide="user" class="w-16 h-16 opacity-50 mb-2"></i>
                                        <span class="text-xs font-mono">No Image URL</span>
                                    </div>
                                <?php endif; ?>
                            </div>
                            <!-- Biodata details -->
                            <div class="p-5 flex-grow flex flex-col justify-between">
                                <div class="flex flex-col gap-2">
                                    <h3 class="font-display font-bold text-base md:text-lg text-white group-hover:text-sky-305 tracking-tight truncate" title="<?php echo htmlspecialchars($agt['nama']); ?>">
                                        <?php echo htmlspecialchars($agt['nama']); ?>
                                    </h3>
                                    <p class="text-xs text-slate-400 italic line-clamp-3 leading-relaxed">
                                        "<?php echo htmlspecialchars($agt['bio'] ?: 'Mahasiswa aktif Sistem Informasi Angkatan 2025.'); ?>"
                                    </p>
                                </div>
                                <div class="border-t border-navy-800 mt-4 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                    <span>ANAK KELAS C</span>
                                    <span class="text-sky-400">#ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </section>

        <!-- Galeri Kenangan Section -->
        <section id="galeri" class="mb-16 scroll-mt-24">
            <div class="flex items-center justify-between mb-8 scroll-reveal">
                <div class="flex items-center gap-3">
                    <div class="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <i data-lucide="images" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h2 class="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">Galeri Kenangan Angkatan</h2>
                        <p class="text-xs md:text-sm text-slate-400 mt-1">Mengabadikan kilas balik memori dan dokumentasi kelas kita.</p>
                    </div>
                </div>
                <span class="text-xs font-mono text-slate-500">MEMORIES ON EARTH</span>
            </div>
            
            <?php if (empty($media_array)): ?>
                <div class="bg-navy-900 border border-navy-800 rounded-2xl p-12 text-center">
                    <i data-lucide="film" class="w-12 h-12 text-slate-550 text-slate-500 mx-auto mb-4"></i>
                    <h3 class="text-lg font-semibold text-white">Album Belum Terisi</h3>
                    <p class="text-slate-400 mt-2 max-w-md mx-auto">Media album belum terisi. Tambahkan tautan foto/video kenangan kelas di menu admin.</p>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($media_array as $index => $med): ?>
                        <div class="glass-card border border-navy-850 rounded-2xl overflow-hidden group flex flex-col scroll-reveal stagger-<?php echo ($index % 8) + 1; ?>">
                            <div class="relative pt-[56.25%] w-full bg-navy-950 overflow-hidden shrink-0">
                                <?php if (($med['tipe'] ?? 'gambar') === 'video'): ?>
                                    <video controls class="absolute inset-0 w-full h-full object-cover">
                                        <source src="<?php echo htmlspecialchars($med['url']); ?>" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                <?php else: ?>
                                    <img src="<?php echo htmlspecialchars($med['url']); ?>" referrerpolicy="no-referrer" alt="Kenangan SISFO C" class="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600';">
                                    <div class="absolute top-3 left-3 bg-navy-950/80 border border-navy-700/60 backdrop-blur rounded px-2.5 py-1 text-[10px] font-mono font-bold text-sky-404 text-sky-400 tracking-wider">
                                        CAMERA MEMORY
                                    </div>
                                <?php endif; ?>
                            </div>
                            <div class="p-4 bg-navy-905 flex-grow border-t border-navy-850">
                                <p class="text-sm text-slate-300 leading-relaxed">
                                    <?php echo htmlspecialchars($med['keterangan'] ?? 'Tanpa penjelasan kenangan.'); ?>
                                </p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </section>

    </main>

    <!-- Page Footer -->
    <footer class="border-t border-navy-800/80 bg-navy-950 py-10 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left text-xs md:text-sm text-slate-500 font-mono">
            <div>
                <p>&copy; <?php echo date('Y'); ?> SISFO C '25. Sistem Informasi Kelas C 2025.</p>
            </div>
            <div class="flex items-center gap-4">
                <a href="#jadwal" class="hover:text-sky-400 transition-colors">Jadwal</a>
                <a href="#mahasiswa" class="hover:text-sky-400 transition-colors">Mahasiswa</a>
                <a href="#galeri" class="hover:text-sky-400 transition-colors">Galeri</a>
                <a href="/login" class="text-sky-500 hover:text-sky-400 transition-colors font-semibold">Gateway Admin</a>
            </div>
        </div>
    </footer>

    <!-- Initialize Lucide Icons & Page Animations -->
    <script>
        lucide.createIcons();

        // --- Theme Toggle Logic ---
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeToggleIcon = document.getElementById('theme-toggle-icon');

        function applyTheme(theme) {
            if (theme === 'light') {
                document.documentElement.classList.add('light');
                if (themeToggleIcon) {
                    themeToggleIcon.setAttribute('data-lucide', 'moon');
                    themeToggleIcon.className = 'w-4 h-4 text-slate-800 animate-pulse';
                }
                if (themeToggleBtn) {
                    themeToggleBtn.className = 'p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 cursor-pointer flex items-center justify-center shadow-lg';
                }
            } else {
                document.documentElement.classList.remove('light');
                if (themeToggleIcon) {
                    themeToggleIcon.setAttribute('data-lucide', 'sun');
                    themeToggleIcon.className = 'w-4 h-4 text-amber-400';
                }
                if (themeToggleBtn) {
                    themeToggleBtn.className = 'p-2.5 rounded-xl border border-navy-700 bg-navy-800/85 hover:bg-navy-700 transition-all text-sky-400 cursor-pointer flex items-center justify-center shadow-lg';
                }
            }
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

        // Initialize theme from storage
        let activeTheme = localStorage.getItem('sisfo-theme') || 'dark';
        applyTheme(activeTheme);

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
                localStorage.setItem('sisfo-theme', activeTheme);
                applyTheme(activeTheme);
            });
        }

        // --- 1. Cyber Welcome Screen Loader Logic ---
        function runWelcomeLoader() {
            const progress = document.getElementById('welcome-progress');
            const statusText = document.getElementById('welcome-status');
            const overlay = document.getElementById('welcome-overlay');
            
            // Fail-safe protection: If something stalls or fails elsewhere, ensure page opens after 3.5 seconds
            const safetyTimeout = setTimeout(() => {
                if (overlay && !overlay.classList.contains('welcome-fade-out')) {
                    clearInterval(loaderInterval);
                    overlay.classList.add('welcome-fade-out');
                    document.querySelectorAll('.scroll-reveal').forEach(el => {
                        revealObserver.observe(el);
                    });
                }
            }, 3500);

            const bootLogs = [
                { limit: 15, text: "DEKRIPSI INFRASTRUKTUR SISTEM..." },
                { limit: 35, text: "KONFIGURASI ENKAPSULASI TEMA KULIAH..." },
                { limit: 55, text: "MENGHUBUNGKAN DATABASE SUPABASE..." },
                { limit: 75, text: "SINKRONISASI DATA KELAS VERIFIED..." },
                { limit: 90, text: "MEMBANGUN MOZAIK CERITA MAHASISWA..." },
                { limit: 100, text: "SISTEM SIAP, SELAMAT DATANG DI SISFO C!" }
            ];

            let currentProgress = 0;
            const duration = 1200; // 1.2s loading sequence for punchy feel
            const stepTime = 15;
            const increment = (100 / (duration / stepTime));

            const loaderInterval = setInterval(() => {
                currentProgress += increment;
                if (currentProgress > 100) currentProgress = 100;
                
                if (progress) {
                    progress.style.width = currentProgress + '%';
                }

                const log = bootLogs.find(b => currentProgress <= b.limit) || bootLogs[bootLogs.length - 1];
                if (statusText && statusText.textContent !== log.text) {
                    statusText.textContent = log.text;
                }

                if (currentProgress >= 100) {
                    clearInterval(loaderInterval);
                    clearTimeout(safetyTimeout);
                    setTimeout(() => {
                        if (overlay) {
                            overlay.classList.add('welcome-fade-out');
                            
                            setTimeout(() => {
                                document.querySelectorAll('.scroll-reveal').forEach(el => {
                                    revealObserver.observe(el);
                                });
                            }, 450);
                        }
                    }, 200);
                }
            }, stepTime);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runWelcomeLoader);
        } else {
            runWelcomeLoader();
        }

        // --- 2. Live Two-Way Scroll Reveal Observer Logic ---
        let lastScrollY = window.scrollY;
        let scrollDirection = 'down';

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY) {
                scrollDirection = 'down';
            } else if (currentScrollY < lastScrollY) {
                scrollDirection = 'up';
            }
            lastScrollY = currentScrollY;
        }, { passive: true });

        const observerOptions = {
            root: null,
            rootMargin: '100px 0px 100px 0px',
            threshold: 0
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (scrollDirection === 'down') {
                        entry.target.classList.add('reveal-up');
                        entry.target.classList.remove('reveal-down');
                    } else {
                        entry.target.classList.add('reveal-down');
                        entry.target.classList.remove('reveal-up');
                    }
                } else {
                    entry.target.classList.remove('reveal-up', 'reveal-down');
                }
            });
        }, observerOptions);
    </script>
</body>
</html>
`,

  "login.php": `<?php
/**
 * Admin Gate Authentication for SISFO C '25
 * Validates credentials using safe getenv() values.
 */

require_once __DIR__ . '/db.php';

// If already logged in, bypass directly to admin panel
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header("Location: /admin");
    exit();
}

$error_message = null;

// Handle Auth Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username_input = $_POST['admin_username'] ?? '';
    $password_input = $_POST['admin_password'] ?? '';

    // Retrieve Admin Credentials from Environment Variables
    $admin_user = getenv('ADMIN_USERNAME') ?: 'admin';
    $admin_pass = getenv('ADMIN_PASSWORD') ?: 'password123';

    if ($username_input === $admin_user && $password_input === $admin_pass) {
        $_SESSION['admin_logged_in'] = true;
        
        // Log in successful, redirect to admin control center
        header("Location: /admin");
        exit();
    } else {
        $error_message = "Kombinasi Username atau Password Admin salah!";
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Administrator - SISFO C '25</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Space Grotesk', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        navy: {
                            950: '#060b13',
                            900: '#0a1222',
                            800: '#0f1b32',
                            700: '#1e2d4a',
                            600: '#2d3f63',
                        }
                    }
                }
            }
        }
    </script>
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        // Inline theme checkpoint to prevent light transition flashing
        if (localStorage.getItem('sisfo-theme') === 'light') {
            document.documentElement.classList.add('light');
        }
    </script>
    <style>
        body {
            background-color: #060b13;
            color: #f8fafc;
        }
        /* --- High Contrast Light Mode Overrides --- */
        html.light body {
            background-color: #f8fafc !important;
            color: #334155 !important;
        }
        html.light nav a {
            color: #475569 !important;
        }
        html.light nav a:hover {
            color: #0284c7 !important;
        }
        html.light main > div {
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
            box-shadow: 0 4px 20px -2px rgba(148, 163, 184, 0.1);
        }
        html.light h1 {
            color: #0f172a !important;
        }
        html.light label {
            color: #475569 !important;
        }
        html.light input {
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
            color: #0d1e3d !important;
        }
        html.light input:focus {
            border-color: #0284c7 !important;
        }
        html.light footer p {
            color: #64748b !important;
        }
    </style>
</head>
<body class="font-sans antialiased min-h-screen flex flex-col justify-between selection:bg-sky-500 selection:text-white">

    <nav class="max-w-7xl mx-auto px-4 w-full h-20 flex items-center justify-between shrink-0">
        <a href="/" class="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span class="text-sm font-medium">Kembali ke Dashboard</span>
        </a>
        <span class="text-xs font-mono text-slate-600">SISFO C '25 ADMIN SECURITY</span>
    </nav>

    <main class="flex-grow flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div class="absolute -right-16 -top-16 bg-sky-500/10 w-48 h-48 rounded-full blur-2xl pointer-events-none"></div>
            
            <div class="relative z-10 text-center mb-8">
                <div class="inline-flex p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4 shadow-lg shadow-sky-500/10">
                    <i data-lucide="shield-alert" class="w-8 h-8"></i>
                </div>
                <h1 class="font-display font-extrabold text-2xl text-white tracking-tight">Portal Administrator</h1>
                <p class="text-slate-400 text-xs md:text-sm mt-2 leading-relaxed">
                     khusus administrator pimpinan kelas untuk dapat mengedit preferensi akademik & direktori kelas.
                </p>
            </div>

            <!-- Error Banner -->
            <?php if ($error_message): ?>
                <div class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2 mb-6">
                    <i data-lucide="alert-circle" class="w-5 h-5 shrink-0 text-red-400"></i>
                    <span><?php echo htmlspecialchars($error_message); ?></span>
                </div>
            <?php endif; ?>

            <!-- Credentials Hint -->
            <div class="bg-sky-500/5 border border-sky-500/10 text-sky-400 p-4 rounded-xl text-xs flex flex-col gap-1.5 mb-6 leading-relaxed">
                <span class="font-bold flex items-center gap-1.5 text-sky-305">
                    <i data-lucide="info" class="w-4 h-4"></i> Catatan Kredensial:
                </span>
                <span>Username & Password diambil dari Vercel Environment Variables: <code class="bg-navy-950 px-1 py-0.5 rounded font-mono text-sky-300 text-[11px]">ADMIN_USERNAME</code> dan <code class="bg-navy-950 px-1 py-0.5 rounded font-mono text-sky-305 text-[11px]">ADMIN_PASSWORD</code>.</span>
                <span class="text-slate-450 font-mono text-[10px] mt-1 italic text-slate-400">*Jika unset, default kredensial web login: <span class="text-sky-305">admin</span> / <span class="text-sky-305">password123</span></span>
            </div>

            <form action="" method="POST" class="flex flex-col gap-5">
                <div>
                    <label for="admin_username" class="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Username Admin</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <i data-lucide="user" class="w-4 h-4"></i>
                        </span>
                        <input type="text" name="admin_username" id="admin_username" required placeholder="Contoh: admin" class="w-full bg-navy-950 border border-navy-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-sky-505 placeholder:text-slate-600 font-sans transition-all">
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-2">
                        <label for="admin_password" class="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Password Admin</label>
                    </div>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <i data-lucide="key" class="w-4 h-4"></i>
                        </span>
                        <input type="password" name="admin_password" id="admin_password" required placeholder="•••••••••" class="w-full bg-navy-950 border border-navy-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-sky-503 transition-all">
                    </div>
                </div>

                <button type="submit" class="w-full mt-2 bg-gradient-to-r from-sky-550 to-indigo-605 bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-sky-500/10 hover:shadow-sky-505/20 flex items-center justify-center gap-2 cursor-pointer">
                    <span>Masuk ke Panel Kontrol</span>
                    <i data-lucide="log-in" class="w-4 h-4"></i>
                </button>
            </form>
        </div>
    </main>

    <footer class="text-center py-6 shrink-0 text-slate-600 text-xs font-mono">
        <p>&copy; <?php echo date('Y'); ?> SISFO C '25. Secure Admin gateway.</p>
    </footer>

    <script>
        lucide.createIcons();
    </script>
</body>
</html>
`,

  "admin.php": `<?php
/**
 * Central Control Panel for SISFO C '25
 * Session-protected administrator zone.
 * Uses Form-Centric Data Packing via Javascript to POST packed JSON to PHP backend.
 */

require_once __DIR__ . '/db.php';

// Strict session check at the very top
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: /login");
    exit();
}

// Handle Sign Out Action
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $_SESSION['admin_logged_in'] = false;
    session_destroy();
    header("Location: /");
    exit();
}

$status_notification = null;
$error_message = null;

// Handle Form Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $jumlah_anggota = (int)($_POST['jumlah_anggota'] ?? 0);
    $logo_url = $_POST['logo_url'] ?? '';
    $jadwal_json = $_POST['jadwal_raw'] ?? '[]';
    $media_json = $_POST['media_raw'] ?? '[]';
    $anggota_json = $_POST['anggota_raw'] ?? '[]';

    if ($pdo) {
        try {
            $pdo->beginTransaction();

            // 1. Update settings row (id = 1)
            $stmtUpdateSettings = $pdo->prepare("UPDATE settings SET jumlah_anggota = :jumlah, jadwal = :jadwal, media = :media, logo_url = :logo WHERE id = 1");
            $stmtUpdateSettings->execute([
                ':jumlah' => $jumlah_anggota,
                ':jadwal' => $jadwal_json,
                ':media' => $media_json,
                ':logo' => $logo_url
            ]);

            // 2. Synchronize table anggotas
            $incoming_anggotas = json_decode($anggota_json, true) ?: [];
            $retained_ids = [];

            // Prepared statements
            $stmtInsertAnggota = $pdo->prepare("INSERT INTO anggotas (nama, foto, bio) VALUES (:nama, :foto, :bio) RETURNING id");
            $stmtUpdateAnggota = $pdo->prepare("UPDATE anggotas SET nama = :nama, foto = :foto, bio = :bio WHERE id = :id");

            foreach ($incoming_anggotas as $agt) {
                $agt_id = isset($agt['id']) ? trim($agt['id']) : '';
                $nama = trim($agt['nama'] ?? '');
                $foto = trim($agt['foto'] ?? '');
                $bio = trim($agt['bio'] ?? '');

                if (empty($nama)) {
                    continue; // Skip student record if name is blank
                }

                if (!empty($agt_id) && is_numeric($agt_id)) {
                    // Update existing student record
                    $stmtUpdateAnggota->execute([
                        ':nama' => $nama,
                        ':foto' => $foto,
                        ':bio' => $bio,
                        ':id' => $agt_id
                    ]);
                    $retained_ids[] = (int)$agt_id;
                } else {
                    // Insert new student record
                    $stmtInsertAnggota->execute([
                        ':nama' => $nama,
                        ':foto' => $foto,
                        ':bio' => $bio
                    ]);
                    $new_id = $stmtInsertAnggota->fetchColumn();
                    if ($new_id) {
                        $retained_ids[] = (int)$new_id;
                    }
                }
            }

            // Mass deletion of removed student records
            if (!empty($retained_ids)) {
                $placeholders = implode(',', array_fill(0, count($retained_ids), '?'));
                $stmtDelete = $pdo->prepare("DELETE FROM anggotas WHERE id NOT IN ($placeholders)");
                $stmtDelete->execute($retained_ids);
            } else {
                $pdo->exec("DELETE FROM anggotas");
            }

            $pdo->commit();
            header("Location: /admin?status=saved");
            exit();

        } catch (Exception $e) {
            $pdo->rollBack();
            $error_message = "Terjadi kesalahan sinkronisasi: " . $e->getMessage();
        }
    } else {
        $error_message = "Koneksi database tidak aktif. Penyimpanan dibatalkan.";
    }
}

// Read settings values
$jumlah_anggota = 0;
$jadwal_array = [];
$media_array = [];
$anggotas_list = [];
$logo_url = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop";

if ($pdo) {
    try {
        $stmtSettings = $pdo->query("SELECT * FROM settings WHERE id = 1");
        $settings = $stmtSettings->fetch();
        if ($settings) {
            $jumlah_anggota = $settings['jumlah_anggota'];
            $jadwal_array = json_decode($settings['jadwal'], true) ?: [];
            $media_array = json_decode($settings['media'], true) ?: [];
            $logo_url = isset($settings['logo_url']) && !empty($settings['logo_url']) ? $settings['logo_url'] : $logo_url;
        }

        // Fetch students lists
        $stmtAnggotas = $pdo->query("SELECT * FROM anggotas ORDER BY id ASC");
        $anggotas_list = $stmtAnggotas->fetchAll() ?: [];
    } catch (PDOException $e) {
        $error_message = "Gagal memproses pemuatan data: " . $e->getMessage();
    }
}

if (isset($_GET['status']) && $_GET['status'] === 'saved') {
    $status_notification = "Konfigurasi kelas dan koordinat direktori berhasil disimpan dan disinkronkan ke Supabase Cloud!";
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Kontrol Admin - SISFO C '25</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Space Grotesk', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        navy: {
                            950: '#060b13',
                            900: '#0a1222',
                            800: '#0f1b32',
                            700: '#1e2d4a',
                            600: '#2d3f63',
                        }
                    }
                }
            }
        }
    </script>
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        // Inline theme checkpoint to prevent light transition flashing
        if (localStorage.getItem('sisfo-theme') === 'light') {
            document.documentElement.classList.add('light');
        }
    </script>
    <style>
        body {
            background-color: #060b13;
            color: #f8fafc;
        }
        /* --- High Contrast Light Mode Overrides for Admin Control Panel --- */
        html.light body {
            background-color: #f8fafc !important;
            color: #334155 !important;
        }
        html.light header {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        html.light header h1 {
            color: #0f172a !important;
        }
        html.light header span.bg-indigo-500\\/20 {
            background-color: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
            color: #4f46e5 !important;
        }
        html.light header a {
            color: #475569 !important;
        }
        html.light header a:hover {
            color: #0284c7 !important;
        }
        html.light main section {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        html.light main section h2 {
            color: #0f172a !important;
        }
        html.light main section p {
            color: #475569 !important;
        }
        html.light label {
            color: #475569 !important;
        }
        html.light input, html.light select, html.light textarea {
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
            color: #0f172a !important;
        }
        html.light input:focus, html.light select:focus, html.light textarea:focus {
            border-color: #0284c7 !important;
            --tw-ring-color: #38bdf8 !important;
        }
        html.light .bg-navy-950, html.light .bg-navy-900 {
            background-color: #f8fafc !important;
        }
        html.light .border-navy-800 {
            border-color: #cbd5e1 !important;
        }
        html.light .text-slate-400 {
            color: #475569 !important;
        }
        html.light .text-slate-500 {
            color: #64748b !important;
        }
        html.light .table-container tr {
            border-color: #e2e8f0 !important;
        }
        html.light .table-container input {
            background-color: #f8fafc !important;
        }
        html.light .bg-navy-800\\/40 {
            background-color: #f1f5f9 !important;
            border-color: #e2e8f0 !important;
        }
    </style>
</head>
<body class="font-sans antialiased min-h-screen flex flex-col bg-navy-950 text-slate-100">

    <!-- Top Navigation Header -->
    <header class="border-b border-navy-800 bg-navy-900 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="p-2 rounded-xl bg-sky-500/10 text-sky-404 border border-sky-500/20">
                    <i data-lucide="shield-check" class="w-6 h-6"></i>
                </div>
                <div>
                    <h1 class="font-display font-bold text-lg md:text-xl text-white tracking-tight flex items-center gap-2">
                        Panel Kontrol Utama <span class="bg-indigo-500/20 border border-indigo-405 text-indigo-400 font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">ADMIN</span>
                    </h1>
                    <span class="text-xs text-slate-400">Pusat Data Terintegrasi SISFO C '25</span>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <a href="/" target="_blank" class="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-sky-300 transition-colors">
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Lihat Website
                </a>
                <a href="?action=logout" class="inline-flex items-center gap-2 bg-red-600/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white transition-all font-semibold text-xs px-4  py-2.5 rounded-xl">
                    <i data-lucide="log-out" class="w-4 h-4"></i> Keluar Sesi
                </a>
            </div>
        </div>
    </header>

    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- Status Alerts -->
        <?php if ($status_notification): ?>
            <div class="bg-emerald-500/10 border border-emerald-505 text-emerald-400 p-4 rounded-2xl text-xs md:text-sm flex items-center gap-3 mb-8 shadow-lg shadow-emerald-500/5">
                <i data-lucide="check-circle" class="w-6 h-6 text-emerald-400 shrink-0"></i>
                <span><?php echo htmlspecialchars($status_notification); ?></span>
            </div>
        <?php endif; ?>

        <?php if ($error_message): ?>
            <div class="bg-red-500/10 border border-red-505 text-red-400 p-4 rounded-2xl text-xs md:text-sm flex items-center gap-3 mb-8">
                <i data-lucide="alert-triangle" class="w-6 h-6 text-red-400 shrink-0"></i>
                <span><?php echo htmlspecialchars($error_message); ?></span>
            </div>
        <?php endif; ?>

        <!-- Form Form-Centric Dynamic Packing -->
        <form action="" method="POST" id="config-panel-form" class="flex flex-col gap-10">
            <!-- Hidden Fields for unpacked JSON string inputs -->
            <input type="hidden" name="jadwal_raw" id="jadwal_raw">
            <input type="hidden" name="media_raw" id="media_raw">
            <input type="hidden" name="anggota_raw" id="anggota_raw">

            <!-- Section 1: Standard Settings -->
            <section class="bg-navy-900 border border-navy-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-2 rounded-xl bg-sky-500/10 text-sky-404 border border-sky-405">
                        <i data-lucide="settings" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h2 class="font-display font-bold text-lg md:text-xl text-white">Metadata Dasar Kelas</h2>
                        <p class="text-xs text-slate-400 mt-0.5">Konfigurasi statistik dasar halaman depan portal.</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                    <div>
                        <label for="jumlah_anggota" class="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Jumlah Anggota Kelas</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550 font-bold">#</span>
                            <input type="number" name="jumlah_anggota" id="jumlah_anggota" value="<?php echo htmlspecialchars($jumlah_anggota); ?>" required class="w-full bg-navy-950 border border-navy-800 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-white focus:outline-none focus:border-sky-500">
                        </div>
                        <span class="text-[10px] text-slate-505 mt-1.5 block leading-normal font-sans">Mempengaruhi pencatatan jumlah statistik global di dashboard utama.</span>
                    </div>

                    <div>
                        <label for="logo_url" class="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Tautan Logo Kelas (URL Gambar)</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><i data-lucide="image" class="w-4 h-4 text-slate-505"></i></span>
                            <input type="url" name="logo_url" id="logo_url" value="<?php echo htmlspecialchars($logo_url); ?>" placeholder="Tinggalkan default untuk menggunakan logo hexagon bawaan" class="w-full bg-navy-950 border border-navy-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-sky-500 font-mono">
                        </div>
                        <span class="text-[10px] text-slate-505 mt-1.5 block leading-normal font-sans">URL gambar logo kelas SISFO C (HTTPS, rasio 1:1 direkomendasikan). Kosongkan untuk logo default.</span>
                    </div>
                </div>
            </section>

            <!-- Section 2: Jadwal Kuliah Dynamic Rows -->
            <section class="bg-navy-900 border border-navy-800 rounded-3xl p-6 md:p-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-xl bg-sky-500/10 text-sky-404 border border-sky-405">
                            <i data-lucide="calendar" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h2 class="font-display font-bold text-lg md:text-xl text-white">Modul Jadwal Kuliah</h2>
                            <p class="text-xs text-slate-400 mt-0.5 font-mono">Daftar agenda mata kuliah mingguan.</p>
                        </div>
                    </div>
                    <button type="button" id="btn-add-jadwal" class="inline-flex items-center gap-2 bg-sky-600/10 hover:bg-sky-605 border border-sky-500/20 text-sky-450 hover:text-white transition-all font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Matkul
                    </button>
                </div>

                <div id="jadwal-container" class="flex flex-col gap-4">
                    <!-- Dynamic Rows injected here via Javascript -->
                </div>
            </section>

            <!-- Section 3: Direktori Anggota Mahasiswa Dynamic Rows -->
            <section class="bg-navy-900 border border-navy-800 rounded-3xl p-6 md:p-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-404 border border-indigo-405">
                            <i data-lucide="users" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h2 class="font-display font-bold text-lg md:text-xl text-white">Sistem Direktori Mahasiswa</h2>
                            <p class="text-xs text-slate-400 mt-0.5 font-sans">Sikronisasi massal direktori database mahasiswa aktif.</p>
                        </div>
                    </div>
                    <button type="button" id="btn-add-anggota" class="inline-flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-604 border border-indigo-500/20 text-indigo-400 hover:text-white transition-all font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer font-sans">
                        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Mahasiswa
                    </button>
                </div>

                <div class="bg-sky-500/5 rounded-2xl p-4 border border-sky-505 text-xs text-sky-400 leading-relaxed mb-6 flex items-start gap-2.5">
                    <i data-lucide="shield-alert" class="w-5 h-5 shrink-0 text-sky-400"></i>
                    <div>
                        <span class="font-bold block mb-0.5 text-sky-300 font-sans">Batasan Lingkungan Serverless (Read-Only Stateless):</span>
                        Foto profil mahasiswa WAJIB menggunakan tautan URL gambar eksternal bertipe HTTPS (Misalnya dari Unsplash, hosting gambar publik, atau penyimpanan Cloud eksternal). Logika unggah/upload berkas dilarang karena sistem penyimpanan lokal Vercel bersifat stateless dan temporal.
                    </div>
                </div>

                <div id="mahasiswa-container" class="flex flex-col gap-4">
                    <!-- Dynamic Rows injected via JS -->
                </div>
            </section>

            <!-- Section 4: Galeri Kenangan Dynamic Rows -->
            <section class="bg-navy-900 border border-navy-800 rounded-3xl p-6 md:p-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-xl bg-violet-500/10 text-violet-404 border border-violet-450">
                            <i data-lucide="images" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h2 class="font-display font-bold text-lg md:text-xl text-white">Media Galeri Dokumentasi</h2>
                            <p class="text-xs text-slate-400 mt-0.5">Daftar media memori dokumentasi kelas (Foto/Video URL).</p>
                        </div>
                    </div>
                    <button type="button" id="btn-add-media" class="inline-flex items-center gap-2 bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 text-violet-400 hover:text-white transition-all font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Media
                    </button>
                </div>

                <div id="media-container" class="flex flex-col gap-4">
                    <!-- Dynamic Rows Injected via JS -->
                </div>
            </section>

            <!-- Sticky Save Banner Controls -->
            <div class="bg-navy-900 border border-navy-800 rounded-2xl p-4 sticky bottom-4 z-40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl shadow-navy-950/80">
                <div class="flex items-center gap-2 text-xs text-slate-400 font-mono text-center sm:text-left">
                    <div class="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse"></div>
                    <span>Data yang diubah diperbarui langsung di Supabase Cloud saat Anda meng-klik Simpan.</span>
                </div>
                <div class="flex items-center gap-3 w-full sm:w-auto shrink-0">
                    <a href="/" class="w-1/2 sm:w-auto text-center text-xs font-semibold text-slate-300 hover:text-white bg-navy-800 border border-navy-700 hover:bg-navy-750 px-5 py-3 rounded-xl transition-all">
                        Batalkan
                    </a>
                    <button type="submit" class="w-1/2 sm:w-auto bg-gradient-to-r from-sky-505 to-indigo-650 tracking-wide hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs md:text-sm px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-505/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2">
                        <i data-lucide="save" class="w-4 h-4"></i> Simpan & Sinkronkan
                    </button>
                </div>
            </div>

        </form>

    </main>

    <!-- Footer -->
    <footer class="text-center py-8 text-xs text-slate-650 border-t border-navy-800 bg-navy-950/50 mt-10">
        <p>&copy; <?php echo date('Y'); ?> SISFO C '25. Secure Admin Gateway. Managed by Supabase Cloud Engine.</p>
    </footer>

    <!-- Templates & JS processing -->
    <script>
        // Inject DB contents securely to JS scope
        const existingJadwal = <?php echo json_encode($jadwal_array); ?>;
        const existingAnggotas = <?php echo json_encode($anggotas_list); ?>;
        const existingMedia = <?php echo json_encode($media_array); ?>;

        const initAdminPanel = () => {
            const jadwalContainer = document.getElementById('jadwal-container');
            const mahasiswaContainer = document.getElementById('mahasiswa-container');
            const mediaContainer = document.getElementById('media-container');

            // Add Jadwal Row
            window.addJadwalRow = function(data = {}) {
                const rowId = 'jw-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
                const html = \`
                    <div id="\${rowId}" class="jadwal-row flex flex-col md:flex-row gap-3 bg-navy-950/50 border border-navy-850 p-4 rounded-xl relative group">
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 flex-grow">
                            <div>
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Hari</label>
                                <input type="text" class="input-jw-hari w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Senin" value="\${data.hari ?? ''}" required>
                            </div>
                            <div>
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Jam</label>
                                <input type="text" class="input-jw-jam w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="08:00 - 10:30" value="\${data.jam ?? ''}" required>
                            </div>
                            <div class="sm:col-span-1 md:col-span-1">
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Ruang</label>
                                <input type="text" class="input-jw-ruang w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Lab Komputer 3" value="\${data.ruang ?? ''}" required>
                            </div>
                            <div class="sm:col-span-2">
                                <label class="block text-[10px] font-mono font-bold text-slate-505 uppercase tracking-wider mb-1">Mata Kuliah</label>
                                <input type="text" class="input-jw-matkul w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Nama Mata Kuliah" value="\${data.matkul ?? ''}" required>
                            </div>
                            <div class="sm:col-span-2 md:col-span-5 mt-1">
                                <label class="block text-[10px] font-mono font-bold text-slate-505 uppercase tracking-wider mb-1">Dosen Pengampu</label>
                                <input type="text" class="input-jw-dosen w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Nama Lengkap Dosen, S.T., M.Kom." value="\${data.dosen ?? ''}" required>
                            </div>
                        </div>
                        <div class="flex items-end justify-end md:justify-start">
                            <button type="button" class="btn-remove-row p-2.5 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white border border-red-500/20 transition-all font-semibold hover:scale-105" onclick="this.closest('.jadwal-row').remove();">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                \`;
                jadwalContainer.insertAdjacentHTML('beforeend', html);
                lucide.createIcons();
            };

            // Add Anggota Row
            window.addAnggotaRow = function(data = {}) {
                const rowId = 'agt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
                const isNew = !data.id;
                const html = \`
                    <div id="\${rowId}" class="anggota-row flex flex-col md:flex-row gap-4 bg-navy-950/50 border border-navy-850 p-5 rounded-xl relative group">
                        <input type="hidden" class="input-agt-id" value="\${data.id ?? ''}">
                        
                        <div class="flex-grow flex flex-col sm:flex-row gap-4">
                            <div class="w-16 h-16 rounded-xl bg-navy-900 border border-navy-800 overflow-hidden flex items-center justify-center shrink-0" id="preview-\${rowId}">
                                \${data.foto ? \`<img src="\${data.foto}" referrerpolicy="no-referrer" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';">\` : \`<i data-lucide="user" class="w-6 h-6 text-slate-505"></i>\`}
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                                <div class="col-span-1">
                                    <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap \${isNew ? '<span class="text-orange-400 font-bold font-sans text-[9px] ml-1 bg-orange-405 px-1.5 py-0.5 rounded">*BARU</span>' : \`<span class="text-indigo-400 font-mono text-[9px] ml-1 bg-indigo-505 px-1.5 py-0.5 rounded">ID: \${data.id}</span>\`}</label>
                                    <input type="text" class="input-agt-nama w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold" placeholder="Nama Lengkap Mahasiswa" value="\${data.nama ?? ''}" required>
                                </div>
                                <div class="col-span-1">
                                    <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Tautan URL Foto Profil Profil (Strictly HTTP/S URL)</label>
                                    <input type="url" class="input-agt-foto w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="https://example.com/avatar.jpg" value="\${data.foto ?? ''}" oninput="updateFotoPreview(this, 'preview-\${rowId}')" required>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Bio Ringkas Slogan</label>
                                    <input type="text" class="input-agt-bio w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Pecinta algoritma / Mobile Developer angkatan." value="\${data.bio ?? ''}">
                                </div>
                            </div>
                        </div>

                        <div class="flex items-end justify-end md:justify-start">
                            <button type="button" class="btn-remove-row p-2.5 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white border border-red-500/20 transition-all font-semibold hover:scale-105" onclick="this.closest('.anggota-row').remove();">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                \`;
                mahasiswaContainer.insertAdjacentHTML('beforeend', html);
                lucide.createIcons();
            };

            // Image URL Live preview updating
            window.updateFotoPreview = function(input, placeholderId) {
                const box = document.getElementById(placeholderId);
                const val = input.value.trim();
                if (val && (val.startsWith('http://') || val.startsWith('https://'))) {
                    box.innerHTML = \`<img src="\${val}" referrerpolicy="no-referrer" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';">\`;
                } else {
                    box.innerHTML = \`<i data-lucide="user" class="w-6 h-6 text-slate-500"></i>\`;
                    lucide.createIcons();
                }
            };

            // Add Media Row
            window.addMediaRow = function(data = {}) {
                const rowId = 'med-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
                const isVideo = (data.tipe === 'video');
                const html = \`
                    <div id="\${rowId}" class="media-row flex flex-col md:flex-row gap-4 bg-navy-950/50 border border-navy-850 p-4 rounded-xl relative group">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 flex-grow">
                            <div class="md:col-span-2">
                                <label class="block text-[10px] font-mono font-bold text-slate-505 uppercase tracking-wider mb-1">Tipe Media</label>
                                <select class="select-med-tipe w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500 h-[38px] font-sans">
                                    <option value="gambar" \${!isVideo ? 'selected':''}>Gambar (JPG/PNG)</option>
                                    <option value="video" \${isVideo ? 'selected':''}>Video Content</option>
                                </select>
                            </div>
                            <div class="md:col-span-5">
                                <label class="block text-[10px] font-mono font-bold text-slate-505 uppercase tracking-wider mb-1">URL Sumber Berkas (Foto atau mp4 video)</label>
                                <input type="url" class="input-med-url w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="https://example.com/media.jpg" value="\${data.url ?? ''}" required>
                            </div>
                            <div class="md:col-span-5">
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Keterangan / Caption Keterangan Kenangan</label>
                                <input type="text" class="input-med-keterangan w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Suasana kelas menjelang project rekayasa" value="\${data.keterangan ?? ''}" required>
                            </div>
                        </div>
                        <div class="flex items-end justify-end md:justify-start">
                            <button type="button" class="btn-remove-row p-2.5 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white border border-red-500/20 transition-all font-semibold hover:scale-105" onclick="this.closest('.media-row').remove();">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                \`;
                mediaContainer.insertAdjacentHTML('beforeend', html);
                lucide.createIcons();
            };

            // Render existing database content from controller initialization
            existingJadwal.forEach(jw => addJadwalRow(jw));
            existingAnggotas.forEach(agt => addAnggotaRow(agt));
            existingMedia.forEach(med => addMediaRow(med));

            // Attach click listeners
            document.getElementById('btn-add-jadwal').addEventListener('click', () => addJadwalRow());
            document.getElementById('btn-add-anggota').addEventListener('click', () => addAnggotaRow());
            document.getElementById('btn-add-media').addEventListener('click', () => addMediaRow());

            // Validate image URL
            function isValidImageUrl(url) {
                if (!url) return false;
                const trimmed = url.trim();
                if (!/^https?:\\/\\//i.test(trimmed)) {
                    return false;
                }
                try {
                    const parsed = new URL(trimmed);
                    const lowercaseUrl = trimmed.toLowerCase();
                    const pathname = parsed.pathname.toLowerCase();
                    
                    const hasImageExtension = /\\.(jpg|jpeg|png|webp|gif|svg|bmp)(\\?|#|$)/i.test(pathname) || 
                                             /\\.(jpg|jpeg|png|webp|gif|svg|bmp)/i.test(lowercaseUrl);
                    
                    const isKnownImageHost = 
                      lowercaseUrl.includes("unsplash.com") || 
                      lowercaseUrl.includes("images.unsplash.com") ||
                      lowercaseUrl.includes("googleusercontent.com") ||
                      lowercaseUrl.includes("githubusercontent.com") ||
                      lowercaseUrl.includes("imgur.com") ||
                      lowercaseUrl.includes("cloudinary.com") ||
                      lowercaseUrl.includes("gravatar.com") ||
                      lowercaseUrl.includes("/photo-") ||
                      lowercaseUrl.includes("/avatar") ||
                      lowercaseUrl.includes("/img/") ||
                      lowercaseUrl.includes("image");

                    return hasImageExtension || isKnownImageHost;
                } catch (e) {
                    return false;
                }
            }

            // Form packing
            const form = document.getElementById('config-panel-form');
            form.addEventListener('submit', (e) => {
                const jadwalRows = document.querySelectorAll('.jadwal-row');
                const jadwalData = [];
                jadwalRows.forEach(row => {
                    const hari = row.querySelector('.input-jw-hari').value.trim();
                    const jam = row.querySelector('.input-jw-jam').value.trim();
                    const ruang = row.querySelector('.input-jw-ruang').value.trim();
                    const matkul = row.querySelector('.input-jw-matkul').value.trim();
                    const dosen = row.querySelector('.input-jw-dosen').value.trim();
                    if (hari || matkul) {
                        jadwalData.push({ hari, jam, ruang, matkul, dosen });
                    }
                });
                document.getElementById('jadwal_raw').value = JSON.stringify(jadwalData);

                const anggotaRows = document.querySelectorAll('.anggota-row');
                const anggotaData = [];
                let hasInvalidFoto = false;
                let firstInvalidInput = null;

                anggotaRows.forEach(row => {
                    const id = row.querySelector('.input-agt-id').value;
                    const nama = row.querySelector('.input-agt-nama').value.trim();
                    const fotoInput = row.querySelector('.input-agt-foto');
                    const foto = fotoInput.value.trim();
                    const bio = row.querySelector('.input-agt-bio').value.trim();
                    
                    if (nama) {
                        if (foto && !isValidImageUrl(foto)) {
                            hasInvalidFoto = true;
                            if (!firstInvalidInput) {
                                firstInvalidInput = fotoInput;
                            }
                            fotoInput.classList.add('border-red-500', 'bg-red-500/10', 'text-red-200');
                            fotoInput.classList.remove('border-navy-800');
                        } else {
                            fotoInput.classList.remove('border-red-500', 'bg-red-500/10', 'text-red-200');
                            fotoInput.classList.add('border-navy-800');
                        }
                        anggotaData.push({ id, nama, foto, bio });
                    }
                });

                if (hasInvalidFoto) {
                    e.preventDefault();
                    if (firstInvalidInput) {
                        firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstInvalidInput.focus();
                    }
                    alert("Gagal Menyimpan: Terdapat URL foto mahasiswa yang tidak valid format gambarnya.");
                    return;
                }

                document.getElementById('anggota_raw').value = JSON.stringify(anggotaData);

                const mediaRows = document.querySelectorAll('.media-row');
                const mediaData = [];
                mediaRows.forEach(row => {
                    const tipe = row.querySelector('.select-med-tipe').value;
                    const url = row.querySelector('.input-med-url').value.trim();
                    const keterangan = row.querySelector('.input-med-keterangan').value.trim();
                    if (url) {
                        mediaData.push({ tipe, url, keterangan });
                    }
                });
                document.getElementById('media_raw').value = JSON.stringify(mediaData);
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAdminPanel);
        } else {
            initAdminPanel();
        }
    </script>
</body>
</html>
`
};
