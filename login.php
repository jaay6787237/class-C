<?php
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

    <!-- Top layout padding or warning -->
    <nav class="max-w-7xl mx-auto px-4 w-full h-20 flex items-center justify-between shrink-0">
        <a href="/" class="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span class="text-sm font-medium">Kembali ke Dashboard</span>
        </a>
        <span class="text-xs font-mono text-slate-600">SISFO C '25 ADMIN SECURITY</span>
    </nav>

    <!-- Center Card -->
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

            <!-- Credentials Hint (helps client understand how credentials work) -->
            <div class="bg-sky-500/5 border border-sky-500/10 text-sky-400/90 p-4 rounded-xl text-xs flex flex-col gap-1.5 mb-6 leading-relaxed">
                <span class="font-bold flex items-center gap-1.5 text-sky-300">
                    <i data-lucide="info" class="w-4 h-4"></i> Catatan Kredensial:
                </span>
                <span>Username & Password diambil dari Vercel Environment Variables: <code class="bg-navy-950 px-1 py-0.5 rounded font-mono text-sky-300 text-[11px]">ADMIN_USERNAME</code> dan <code class="bg-navy-950 px-1 py-0.5 rounded font-mono text-sky-300 text-[11px]">ADMIN_PASSWORD</code>.</span>
                <span class="text-slate-400 font-mono text-[10px] mt-1 italic">*Jika unset, default kredensial web login: <span class="text-sky-300">admin</span> / <span class="text-sky-300">password123</span></span>
            </div>

            <!-- Login Form -->
            <form action="" method="POST" class="flex flex-col gap-5">
                <div>
                    <label for="admin_username" class="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Username Admin</label>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 text-slate-400">
                            <i data-lucide="user" class="w-4 h-4"></i>
                        </span>
                        <input type="text" name="admin_username" id="admin_username" required placeholder="Contoh: admin" class="w-full bg-navy-950 border border-navy-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-600 font-sans transition-all">
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
                        <input type="password" name="admin_password" id="admin_password" required placeholder="•••••••••" class="w-full bg-navy-950 border border-navy-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-600 transition-all">
                    </div>
                </div>

                <button type="submit" class="w-full mt-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer">
                    <span>Masuk ke Panel Kontrol</span>
                    <i data-lucide="log-in" class="w-4 h-4"></i>
                </button>
            </form>
        </div>
    </main>

    <!-- Footer Space -->
    <footer class="text-center py-6 shrink-0 text-slate-600 text-xs font-mono">
        <p>&copy; <?php echo date('Y'); ?> SISFO C '25. Secure Admin gateway.</p>
    </footer>

    <!-- Initialize Lucide Icons -->
    <script>
        lucide.createIcons();
    </script>
</body>
</html>
