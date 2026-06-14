<?php
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

            // 1. Updatesettings row (id = 1)
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
        html.light header span.bg-indigo-500\/20 {
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
        html.light .bg-navy-800\/40 {
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
                <div class="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <i data-lucide="shield-check" class="w-6 h-6"></i>
                </div>
                <div>
                    <h1 class="font-display font-bold text-lg md:text-xl text-white tracking-tight flex items-center gap-2">
                        Panel Kontrol Utama <span class="bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">ADMIN</span>
                    </h1>
                    <span class="text-xs text-slate-400">Pusat Data Terintegrasi SISFO C '25</span>
                </div>
            </div>
            
            <div class="flex items-center gap-4">
                <a href="/" target="_blank" class="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-sky-300 transition-colors">
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Lihat Website
                </a>
                <a href="?action=logout" class="inline-flex items-center gap-2 bg-red-650/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white transition-all font-semibold text-xs px-4  py-2.5 rounded-xl">
                    <i data-lucide="log-out" class="w-4 h-4"></i> Keluar Sesi
                </a>
            </div>
        </div>
    </header>

    <main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- Status Alerts -->
        <?php if ($status_notification): ?>
            <div class="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-4 rounded-2xl text-xs md:text-sm flex items-center gap-3 mb-8 shadow-lg shadow-emerald-500/5">
                <i data-lucide="check-circle" class="w-6 h-6 text-emerald-400 shrink-0"></i>
                <span><?php echo htmlspecialchars($status_notification); ?></span>
            </div>
        <?php endif; ?>

        <?php if ($error_message): ?>
            <div class="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-2xl text-xs md:text-sm flex items-center gap-3 mb-8">
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
                    <div class="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-400/20">
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
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">#</span>
                            <input type="number" name="jumlah_anggota" id="jumlah_anggota" val="<?php echo htmlspecialchars($jumlah_anggota); ?>" value="<?php echo htmlspecialchars($jumlah_anggota); ?>" required class="w-full bg-navy-950 border border-navy-800 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-white focus:outline-none focus:border-sky-500">
                        </div>
                        <span class="text-[10px] text-slate-500 mt-1.5 block leading-normal font-sans">Mempengaruhi pencatatan jumlah statistik global di dashboard utama.</span>
                    </div>

                    <div>
                        <label for="logo_url" class="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Tautan Logo Kelas (URL Gambar)</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><i data-lucide="image" class="w-4 h-4 text-slate-500"></i></span>
                            <input type="url" name="logo_url" id="logo_url" value="<?php echo htmlspecialchars($logo_url); ?>" placeholder="Tinggalkan default untuk menggunakan logo hexagon bawaan" class="w-full bg-navy-950 border border-navy-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-sky-500 font-mono">
                        </div>
                        <span class="text-[10px] text-slate-500 mt-1.5 block leading-normal font-sans">URL gambar logo kelas SISFO C (HTTPS, rasio 1:1 direkomendasikan). Kosongkan untuk logo default.</span>
                    </div>
                </div>
            </section>

            <!-- Section 2: Jadwal Kuliah Dynamic Rows -->
            <section class="bg-navy-900 border border-navy-800 rounded-3xl p-6 md:p-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-400/20">
                            <i data-lucide="calendar" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h2 class="font-display font-bold text-lg md:text-xl text-white">Modul Jadwal Kuliah</h2>
                            <p class="text-xs text-slate-400 mt-0.5 font-mono">Daftar agenda mata kuliah mingguan.</p>
                        </div>
                    </div>
                    <button type="button" id="btn-add-jadwal" class="inline-flex items-center gap-2 bg-sky-600/10 hover:bg-sky-600 border border-sky-500/20 text-sky-405 text-sky-400 hover:text-white transition-all font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Matkul
                    </button>
                </div>

                <!-- Jadwal Container -->
                <div id="jadwal-container" class="flex flex-col gap-4">
                    <!-- Dynamic Rows injected here via Javascript -->
                </div>
            </section>

            <!-- Section 3: Direktori Anggota Mahasiswa Dynamic Rows -->
            <section class="bg-navy-900 border border-navy-800 rounded-3xl p-6 md:p-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-400/20">
                            <i data-lucide="users" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h2 class="font-display font-bold text-lg md:text-xl text-white">Sistem Direktori Mahasiswa</h2>
                            <p class="text-xs text-slate-400 mt-0.5">Sikronisasi massal direktori database mahasiswa aktif.</p>
                        </div>
                    </div>
                    <button type="button" id="btn-add-anggota" class="inline-flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white transition-all font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                        <i data-lucide="plus" class="w-4 h-4"></i> Tambah Mahasiswa
                    </button>
                </div>

                <div class="bg-sky-500/5 rounded-2xl p-4 border border-sky-500/10 text-xs text-sky-450 text-sky-400/90 leading-relaxed mb-6 flex items-start gap-2.5">
                    <i data-lucide="shield-alert" class="w-5 h-5 shrink-0"></i>
                    <div>
                        <span class="font-bold block mb-0.5 text-sky-300">Batasan Lingkungan Serverless (Read-Only Stateless):</span>
                        Foto profil mahasiswa WAJIB menggunakan tautan URL gambar eksternal bertipe HTTPS (Misalnya dari Unsplash, hosting gambar publik, atau penyimpanan Cloud eksternal). Logika unggah/upload berkas dilarang karena sistem penyimpanan lokal Vercel bersifat stateless dan temporal.
                    </div>
                </div>

                <!-- Anggota Container -->
                <div id="mahasiswa-container" class="flex flex-col gap-4">
                    <!-- Dynamic Rows injected via JS -->
                </div>
            </section>

            <!-- Section 4: Galeri Kenangan Dynamic Rows -->
            <section class="bg-navy-900 border border-navy-800 rounded-3xl p-6 md:p-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
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

                <!-- Media Container -->
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
                    <button type="submit" class="w-1/2 sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs md:text-sm px-6 py-3 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2">
                        <i data-lucide="save" class="w-4 h-4"></i> Simpan & Sinkronkan
                    </button>
                </div>
            </div>

        </form>

    </main>

    <!-- Footer -->
    <footer class="text-center py-8 text-xs text-slate-600 border-t border-navy-800 bg-navy-950/50 mt-10">
        <p>&copy; <?php echo date('Y'); ?> SISFO C '25. Secure Admin Gateway. Managed by Supabase Cloud Engine.</p>
    </footer>

    <!-- Templates & JS processing -->
    <script>
        // Inject DB contents from PHP securely to JS scope
        const existingJadwal = <?php echo json_encode($jadwal_array); ?>;
        const existingAnggotas = <?php echo json_encode($anggotas_list); ?>;
        const existingMedia = <?php echo json_encode($media_array); ?>;

        const initAdminPanel = () => {
            const jadwalContainer = document.getElementById('jadwal-container');
            const mahasiswaContainer = document.getElementById('mahasiswa-container');
            const mediaContainer = document.getElementById('media-container');

            // --- FUNCTION: Add Jadwal Row ---
            window.addJadwalRow = function(data = {}) {
                const rowId = 'jw-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
                const html = `
                    <div id="${rowId}" class="jadwal-row flex flex-col md:flex-row gap-3 bg-navy-950/50 border border-navy-850 p-4 rounded-xl relative group">
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 flex-grow">
                            <div>
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Hari</label>
                                <input type="text" class="input-jw-hari w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Senin" value="${data.hari ?? ''}" required>
                            </div>
                            <div>
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Jam</label>
                                <input type="text" class="input-jw-jam w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="08:00 - 10:30" value="${data.jam ?? ''}" required>
                            </div>
                            <div class="sm:col-span-1 md:col-span-1">
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Ruang</label>
                                <input type="text" class="input-jw-ruang w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-slate-350 text-white focus:outline-none focus:border-sky-500" placeholder="Lab Komputer 3" value="${data.ruang ?? ''}" required>
                            </div>
                            <div class="sm:col-span-2">
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Mata Kuliah</label>
                                <input type="text" class="input-jw-matkul w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Nama Mata Kuliah" value="${data.matkul ?? ''}" required>
                            </div>
                            <div class="sm:col-span-2 md:col-span-5 mt-1">
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Dosen Pengampu</label>
                                <input type="text" class="input-jw-dosen w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Nama Lengkap Dosen, S.T., M.Kom." value="${data.dosen ?? ''}" required>
                            </div>
                        </div>
                        <div class="flex items-end justify-end md:justify-start">
                            <button type="button" class="btn-remove-row p-2.5 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white border border-red-500/20 transition-all font-semibold hover:scale-105" onclick="this.closest('.jadwal-row').remove();">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                `;
                jadwalContainer.insertAdjacentHTML('beforeend', html);
                lucide.createIcons();
            };

            // --- FUNCTION: Add Anggota Row ---
            window.addAnggotaRow = function(data = {}) {
                const rowId = 'agt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
                const isNew = !data.id;
                const html = `
                    <div id="${rowId}" class="anggota-row flex flex-col md:flex-row gap-4 bg-navy-950/50 border border-navy-850 p-5 rounded-xl relative group">
                        <input type="hidden" class="input-agt-id" value="${data.id ?? ''}">
                        
                        <div class="flex-grow flex flex-col sm:flex-row gap-4">
                            <!-- Image URL Preview placeholder left -->
                            <div class="w-16 h-16 rounded-xl bg-navy-900 border border-navy-800 overflow-hidden flex items-center justify-center shrink-0" id="preview-${rowId}">
                                ${data.foto ? `<img src="${data.foto}" referrerpolicy="no-referrer" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';">` : `<i data-lucide="user" class="w-6 h-6 text-slate-500"></i>`}
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                                <div class="col-span-1">
                                    <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap ${isNew ? '<span class="text-orange-400 font-bold font-sans text-[9px] ml-1 bg-orange-400/10 px-1.5 py-0.5 rounded">*BARU</span>' : `<span class="text-indigo-400 font-mono text-[9px] ml-1 bg-indigo-500/10 px-1.5 py-0.5 rounded">ID: ${data.id}</span>`}</label>
                                    <input type="text" class="input-agt-nama w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold" placeholder="Nama Lengkap Mahasiswa" value="${data.nama ?? ''}" required>
                                </div>
                                <div class="col-span-1">
                                    <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Tautan URL Foto Profil Profil (Strictly HTTP/S URL)</label>
                                    <input type="url" class="input-agt-foto w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="https://example.com/avatar.jpg" value="${data.foto ?? ''}" oninput="updateFotoPreview(this, 'preview-${rowId}')" required>
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Bio Ringkas Slogan</label>
                                    <input type="text" class="input-agt-bio w-full bg-navy-900 border border-navy-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Pecinta algoritma / Mobile Developer angkatan." value="${data.bio ?? ''}">
                                </div>
                            </div>
                        </div>

                        <div class="flex items-end justify-end md:justify-start">
                            <button type="button" class="btn-remove-row p-2.5 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white border border-red-500/20 transition-all font-semibold hover:scale-105" onclick="this.closest('.anggota-row').remove();">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                `;
                mahasiswaContainer.insertAdjacentHTML('beforeend', html);
                lucide.createIcons();
            };

            // Image URL Live preview updating
            window.updateFotoPreview = function(input, placeholderId) {
                const box = document.getElementById(placeholderId);
                const val = input.value.trim();
                if (val && (val.startsWith('http://') || val.startsWith('https://'))) {
                    box.innerHTML = `<img src="${val}" referrerpolicy="no-referrer" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';">`;
                } else {
                    box.innerHTML = `<i data-lucide="user" class="w-6 h-6 text-slate-500"></i>`;
                    lucide.createIcons();
                }
            };

            // --- FUNCTION: Add Media Row ---
            window.addMediaRow = function(data = {}) {
                const rowId = 'med-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
                const isVideo = (data.tipe === 'video');
                const html = `
                    <div id="${rowId}" class="media-row flex flex-col md:flex-row gap-4 bg-navy-950/50 border border-navy-850 p-4 rounded-xl relative group">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 flex-grow">
                            <div class="md:col-span-2">
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Tipe Media</label>
                                <select class="select-med-tipe w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500 h-[38px] font-sans">
                                    <option value="gambar" ${!isVideo ? 'selected':''}>Gambar (JPG/PNG)</option>
                                    <option value="video" ${isVideo ? 'selected':''}>Video Content</option>
                                </select>
                            </div>
                            <div class="md:col-span-5">
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">URL Sumber Berkas (Foto atau mp4 video)</label>
                                <input type="url" class="input-med-url w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="https://example.com/media.jpg" value="${data.url ?? ''}" required>
                            </div>
                            <div class="md:col-span-5">
                                <label class="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Keterangan / Caption Keterangan Kenangan</label>
                                <input type="text" class="input-med-keterangan w-full bg-navy-900 border border-navy-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" placeholder="Suasana kelas menjelang project rekayasa" value="${data.keterangan ?? ''}" required>
                            </div>
                        </div>
                        <div class="flex items-end justify-end md:justify-start">
                            <button type="button" class="btn-remove-row p-2.5 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white border border-red-500/20 transition-all font-semibold hover:scale-105" onclick="this.closest('.media-row').remove();">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                `;
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

            // Client-side helper to validate image URL
            function isValidImageUrl(url) {
                if (!url) return false;
                const trimmed = url.trim();
                if (!/^https?:\/\//i.test(trimmed)) {
                    return false;
                }
                try {
                    const parsed = new URL(trimmed);
                    const lowercaseUrl = trimmed.toLowerCase();
                    const pathname = parsed.pathname.toLowerCase();
                    
                    const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|svg|bmp)(\?|#|$)/i.test(pathname) || 
                                             /\.(jpg|jpeg|png|webp|gif|svg|bmp)/i.test(lowercaseUrl);
                    
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

            // --- Form-Centric Dynamic Packaging Event Listener ---
            const form = document.getElementById('config-panel-form');
            form.addEventListener('submit', (e) => {
                // 1. Pack Jadwal
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

                // 2. Pack Anggota & Validate Foto
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
                    alert("Gagal Menyimpan: Terdapat URL foto mahasiswa yang tidak valid format gambarnya (harus berupa tautan HTTP/HTTPS dengan ekstensi gambar, atau link dari unsplash/hosting valid).");
                    return;
                }

                document.getElementById('anggota_raw').value = JSON.stringify(anggotaData);

                // 3. Pack Media
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
