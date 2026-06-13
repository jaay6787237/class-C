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

if ($pdo) {
    try {
        $stmtSettings = $pdo->query("SELECT * FROM settings WHERE id = 1");
        $settings = $stmtSettings->fetch();
        if ($settings) {
            $jumlah_anggota = $settings['jumlah_anggota'];
            $jadwal_array = json_decode($settings['jadwal'], true) ?: [];
            $media_array = json_decode($settings['media'], true) ?: [];
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
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SISFO C '25 - Sistem Informasi Kelas C 2025</title>
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
    </style>
</head>
<body class="font-sans antialiased selection:bg-sky-500 selection:text-white min-h-screen flex flex-col">

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
                <div class="p-2.5 rounded-xl bg-gradient-to-br from-sky-450 to-sky-600 text-sky-400 border border-sky-500/30 shadow-lg shadow-sky-500/10">
                    <i data-lucide="graduation-cap" class="w-6 h-6"></i>
                </div>
                <div>
                    <span class="font-display font-bold text-xl md:text-2xl uppercase tracking-wider bg-gradient-to-r from-sky-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">SISFO C '25</span>
                    <span class="hidden md:inline-block ml-2 text-xs font-mono px-2 py-0.5 rounded bg-navy-800 border border-navy-700/60 text-sky-300">Sistem Informasi</span>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <a href="#jadwal" class="hidden md:inline-flex text-sm text-slate-300 hover:text-sky-400 font-medium transition-colors">Jadwal Kuliah</a>
                <a href="#mahasiswa" class="hidden md:inline-flex text-sm text-slate-300 hover:text-sky-400 font-medium transition-colors">Direktori Mahasiswa</a>
                <a href="#galeri" class="hidden md:inline-flex text-sm text-slate-300 hover:text-sky-400 font-medium transition-colors" >Galeri Kenangan</a>
                
                <?php if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true): ?>
                    <a href="/admin" class="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 border border-emerald-400/20">
                        <i data-lucide="layout-dashboard" class="w-4 h-4"></i> Panel Admin
                    </a>
                <?php else: ?>
                    <a href="/login" class="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-sky-300 hover:text-white font-medium text-sm px-5 py-2.5 rounded-xl border border-navy-700/80 transition-all hover:-translate-y-0.5">
                        <i data-lucide="lock" class="w-4 h-4"></i> Login Admin
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </header>

    <!-- Main Content Stage -->
    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <!-- Hero Section -->
        <section class="relative rounded-3xl overflow-hidden mb-16 py-14 px-8 md:px-16 bg-navy-900 border border-navy-800 glow-effect text-center md:text-left">
            <div class="absolute -right-20 -top-20 bg-sky-500/10 w-96 h-96 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -left-20 -bottom-20 bg-indigo-500/10 w-96 h-96 rounded-full blur-3xl pointer-events-none"></div>
            
            <div class="relative z-10 grid md:grid-cols-12 items-center gap-8 md:gap-12">
                <div class="md:col-span-8 flex flex-col gap-5">
                    <span class="inline-flex max-w-max bg-sky-500/10 text-sky-400 text-xs font-semibold font-mono tracking-wider uppercase px-3 py-1.5 rounded-full border border-sky-400/20">
                        Website Koridor Angkatan 2025
                    </span>
                    <h1 class="font-display font-extrabold text-3xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
                        Integrasi Informasi Kelas <span class="text-sky-400 relative">Sistem Informasi C</span>
                    </h1>
                    <p class="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
                        Mewadahi direktori data akademik, keanggotaan mahasiswa, serta mendokumentasikan setiap mozaik cerita perjalanan perkuliahan kita di Universitas.
                    </p>
                    <div class="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                        <a href="#mahasiswa" class="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-sm md:text-base px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] transform">
                            <i data-lucide="users" class="w-5 h-5"></i> Lihat Direktori
                        </a>
                        <a href="#jadwal" class="inline-flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white font-medium text-sm md:text-base px-6 py-3 rounded-xl border border-navy-700 transition-all">
                            Tanggal Kuliah <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </a>
                    </div>
                </div>
                
                <!-- Statistics Card Side -->
                <div class="md:col-span-4 w-full">
                    <div class="bg-navy-950/80 border border-navy-800 rounded-2xl p-6 flex flex-col gap-6 md:max-w-xs ml-auto shadow-inner shadow-navy-950/20">
                        <div class="text-center md:text-left">
                            <span class="text-slate-400 text-sm font-medium">Jumlah Anggota Terdaftar</span>
                            <div class="font-display font-extrabold text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-sky-400 to-indigo-400 mt-2">
                                <?php echo htmlspecialchars($jumlah_anggota); ?>
                            </div>
                            <span class="text-xs text-sky-400/80 font-mono block mt-1">Sistem Informasi Angkatan 2025</span>
                        </div>
                        
                        <div class="border-t border-navy-800 pt-5 flex items-center gap-3">
                            <div class="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-400/20">
                                <i data-lucide="database" class="w-5 h-5"></i>
                            </div>
                            <div class="text-left">
                                <span class="text-xs text-slate-400 block">Ketersediaan Cloud</span>
                                <span class="text-sm font-semibold text-white">Supabase PostgreSQL</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Jadwal Kuliah Section -->
        <section id="jadwal" class="mb-16 scroll-mt-24">
            <div class="flex items-center justify-between mb-8">
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
                        <div class="bg-navy-900 border border-navy-800/80 rounded-2xl p-6 hover:border-sky-500/30 transition-all duration-300 hover:shadow-lg shadow-sky-500/5 group flex flex-col justify-between">
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
            <div class="flex items-center justify-between mb-8">
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
                    <?php foreach ($anggotas_list as $agt): ?>
                        <div class="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden hover:border-sky-500/30 transition-all duration-300 hover:shadow-lg shadow-sky-500/5 group flex flex-col h-full">
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
            <div class="flex items-center justify-between mb-8">
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
                    <?php foreach ($media_array as $med): ?>
                        <div class="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden group flex flex-col">
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
                <p class="text-[11px] text-slate-600 mt-1">Dibangun tanpa framework dengan Native PHP ditenagai Supabase PostgreSQL & Vercel.</p>
            </div>
            <div class="flex items-center gap-4">
                <a href="#jadwal" class="hover:text-sky-400 transition-colors">Jadwal</a>
                <a href="#mahasiswa" class="hover:text-sky-400 transition-colors">Mahasiswa</a>
                <a href="#galeri" class="hover:text-sky-400 transition-colors">Galeri</a>
                <a href="/login" class="text-sky-500 hover:text-sky-400 transition-colors font-semibold">Gateway Admin</a>
            </div>
        </div>
    </footer>

    <!-- Initialize Lucide Icons -->
    <script>
        lucide.createIcons();
    </script>
</body>
</html>
