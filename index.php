<?php
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
        ["id" => 1, "nama" => "Ahmad Fauzi", "foto" => "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400", "bio" => "Pecinta kopi dan backend developer. Selalu tertarik pada optimasi query."],
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

        /* Float Logo Floating Animation to mimic Framer motion */
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
        /* When scrolling down and revealing */
        .scroll-reveal.reveal-up {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        /* When scrolling up and revealing from top down */
        .scroll-reveal.reveal-down {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        
        /* Staggered Delay classes */
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
        html.light header span.hidden.md\:inline-block {
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
    <!-- Safeguard: Uncover page and hide loader if JavaScript is disabled/unavailable -->
    <noscript>
        <style>
            #welcome-overlay { display: none !important; }
            .scroll-reveal { opacity: 1 !important; transform: none !important; }
        </style>
    </noscript>
</head>
<body class="font-sans antialiased selection:bg-sky-500 selection:text-white min-h-screen flex flex-col">

    <!-- Glowing Cyberpunk Welcome Loader Screen -->
    <div id="welcome-overlay" class="flex flex-col items-center justify-center">
        <!-- Ambient glowing hexagons backdrops -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
            <div class="absolute bg-sky-500/10 w-[500px] h-[500px] rounded-full blur-3xl -top-40 -left-20"></div>
            <div class="absolute bg-indigo-500/15 w-[600px] h-[600px] rounded-full blur-3xl -bottom-40 -right-20"></div>
        </div>

        <div class="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
            <!-- Pulsing Hex Shield Class Logo -->
            <div class="welcome-pulse mb-8">
                <?php if (empty($logo_url) || strpos($logo_url, "unsplash.com/photo-1618005182384-a83a8bd57fbe") !== false): ?>
                    <?php echo renderClassLogo("w-32 h-32", true); ?>
                <?php else: ?>
                    <div class="w-32 h-32 rounded-3xl overflow-hidden border-2 border-sky-400 shadow-2xl">
                        <img src="<?php echo htmlspecialchars($logo_url); ?>" alt="Class Logo" class="w-full h-full object-cover">
                    </div>
                <?php endif; ?>
            </div>

            <!-- Letter Spacing Growing Header -->
            <h1 class="text-tracking-expand font-display font-black text-3xl md:text-4xl tracking-[0.15em] text-white uppercase bg-gradient-to-r from-sky-450 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
                SISFO C '25
            </h1>
            <p class="font-mono text-xs tracking-[0.25em] text-sky-400 uppercase opacity-80 mt-2">
                PORTAL CORRIDOR ANGKATAN
            </p>

            <!-- Custom Cyber Progress Bar -->
            <div class="w-64 h-1 bg-navy-800/80 rounded-full mt-10 overflow-hidden relative border border-navy-700/40">
                <div id="welcome-progress" class="h-full bg-gradient-to-r from-sky-450 via-sky-500 to-indigo-600 w-0 transition-all duration-300"></div>
            </div>

            <!-- Animated Status Text -->
            <div class="text-[10px] font-mono text-slate-500 mt-4 tracking-wider uppercase" id="welcome-status">
                Memulai integrasi sistem...
            </div>
        </div>
    </div>

    <!-- Database Warning Banner if DB Error exists -->
    <?php if ($db_error): ?>
    <div class="bg-amber-500/10 border-b border-amber-500/20 text-amber-400 py-3 px-4 text-center text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-2">
        <span class="flex items-center gap-1 font-semibold"><i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400"></i> Mode Demo Aktif:</span>
        <span><?php echo htmlspecialchars($db_error); ?></span>
    </div>
    <?php endif; ?>

    <!-- Navigation Header -->
    <header class="border-b border-navy-800/80 bg-navy-950/80 backdrop-blur sticky top-0 z-50 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <?php if (empty($logo_url) || strpos($logo_url, "unsplash.com/photo-1618005182384-a83a8bd57fbe") !== false): ?>
                    <div class="p-1 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-500/10 flex items-center justify-center">
                        <?php echo renderClassLogo("w-10 h-10", true); ?>
                    </div>
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
            
            <!-- Ambient Floating Particles (PHP version of React's FloatingHexagons) -->
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
                        <p class="text-xs md:text-sm text-slate-450 text-slate-450 mt-1 text-slate-400">Jadwal akademik terintegrasi secara dinamis.</p>
                    </div>
                </div>
                <span class="text-xs font-mono text-slate-500 hidden sm:inline">SISFO C '25 REGULAR</span>
            </div>
            
            <?php if (empty($jadwal_array)): ?>
                <div class="bg-navy-900 border border-navy-800 rounded-2xl p-12 text-center">
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
                                <h3 class="font-display font-bold text-lg md:text-xl text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                                    <?php echo htmlspecialchars($jw['matkul'] ?? '-'); ?>
                                </h3>
                                <p class="text-slate-400 text-sm mt-3 flex items-center gap-2">
                                    <i data-lucide="map-pin" class="w-4 h-4 text-sky-500/80 shrink-0"></i>
                                    <span>Ruang: <strong class="text-slate-300"><?php echo htmlspecialchars($jw['ruang'] ?? '-'); ?></strong></span>
                                </p>
                            </div>
                            <div class="mt-5 pt-4 border-t border-navy-800/50 flex items-center gap-2">
                                <div class="p-1 rounded bg-navy-800 text-sky-400">
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
                        <p class="text-xs md:text-sm text-slate-400 mt-1">Daftar profil mahasiswaaktif dalam barisan Sistem Informasi C '25.</p>
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
                                    <!-- Fallback avatar icon -->
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
                                    <p class="text-xs text-slate-430 text-slate-400 italic line-clamp-3 leading-relaxed">
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
                    <i data-lucide="film" class="w-12 h-12 text-slate-500 mx-auto mb-4"></i>
                    <h3 class="text-lg font-semibold text-white">Album Belum Terisi</h3>
                    <p class="text-slate-400 mt-2 max-w-md mx-auto">Media album belum terisi. Tambahkan tautan foto/video kenangan kelas di menu admin.</p>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($media_array as $index => $med): ?>
                        <div class="glass-card border border-navy-850 rounded-2xl overflow-hidden group flex flex-col scroll-reveal stagger-<?php echo ($index % 8) + 1; ?>">
                            <div class="relative pt-[56.25%] w-full bg-navy-950 overflow-hidden shrink-0">
                                <?php if (($med['tipe'] ?? 'gambar') === 'video'): ?>
                                    <!-- Video Embed / HTML5 Video player -->
                                    <video controls class="absolute inset-0 w-full h-full object-cover">
                                        <source src="<?php echo htmlspecialchars($med['url']); ?>" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                <?php else: ?>
                                    <!-- Image rendering referencing external string URLs -->
                                    <img src="<?php echo htmlspecialchars($med['url']); ?>" referrerpolicy="no-referrer" alt="Kenangan SISFO C" class="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600';">
                                    <div class="absolute top-3 left-3 bg-navy-950/80 border border-navy-700/60 backdrop-blur rounded px-2.5 py-1 text-[10px] font-mono font-bold text-sky-400 tracking-wider">
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

                // Update text based on current percentage range
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
                            
                            // DELAYED OBSERVER INITIALIZATION:
                            // We delay registering the elements to the IntersectionObserver by 450ms.
                            // This ensures elements within the initially visible fold (like the Hero area)
                            // are not triggered prematurely behind the dark coverage of the welcome overlay,
                            // allowing the user to experience a buttery-smooth entry fade-and-slide right as the page opens!
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
            rootMargin: '100px 0px 100px 0px', // Generous buffer allows pre-transition before viewport entry and avoids premature fade-outs
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
                    // Reset animations when scrolled out of view in either direction (allows two-way repeat play)
                    entry.target.classList.remove('reveal-up', 'reveal-down');
                }
            });
        }, observerOptions);

        // Register observer to scroll animated nodes
        // Handled dynamically inside Cyber Welcome overlay fade-out sequence above for maximum opening sensory impact!
    </script>
</body>
</html>
