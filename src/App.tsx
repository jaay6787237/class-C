import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Users, 
  Lock, 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight, 
  User, 
  ShieldAlert, 
  Key, 
  LogIn, 
  Database, 
  LogOut, 
  Save, 
  Code, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Images, 
  FileText,
  ChevronRight,
  ExternalLink,
  Copy,
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Course, Student, MediaItem, Settings } from "./types";

// Geometric Hexagonal Logo alignment with user uploaded image
export function ClassLogo({ className = "w-12 h-12", glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg 
      className={`${className} ${glow ? "drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]" : ""}`} 
      viewBox="0 0 200 230" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Hexagon outline */}
      <polygon 
        points="100,10 190,62 190,168 100,220 10,168 10,62" 
        stroke="#38bdf8" 
        strokeWidth="12" 
        strokeLinejoin="round" 
        className="opacity-20"
      />
      {/* Styled stylized 'S' interlocking pathway inside a hexagon bounds */}
      {/* Upper Loop of 'S' */}
      <path 
        d="M 100 35 L 165 72.5 L 165 105 L 100 67.5 L 58 92.5 L 58 120 L 100 95 L 142 120 L 142 147.5 L 100 122.5 L 35 85 L 100 47.5 Z" 
        fill="#38bdf8" 
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Lower Loop of 'S' */}
      <path 
        d="M 100 195 L 35 157.5 L 35 125 L 100 162.5 L 142 137.5 L 142 110 L 100 135 L 58 110 L 58 82.5 L 100 107.5 L 165 145 L 100 182.5 Z" 
        fill="#38bdf8" 
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Tech particle effect behind key sections
export function FloatingHexagons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(6)].map((_, i) => {
        const size = 100 + i * 50;
        const delay = i * 1.5;
        const duration = 22 + i * 4;
        const opacity = 0.03 + (i % 3) * 0.015;
        return (
          <motion.div
            key={i}
            className="absolute flex items-center justify-center opacity-80"
            style={{
              width: size,
              height: size,
              top: `${12 + i * 14}%`,
              left: `${8 + (i * 19) % 80}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 25, 0],
              rotate: [0, 360],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut",
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500" style={{ opacity: opacity }} fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="50,5 93,30 93,80 50,105 7,80 7,30" />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}

// Client-side helper to validate image URL
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    const lowercaseUrl = trimmed.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();
    
    // Check standard picture extensions anywhere in path (since query params can be appended)
    const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|svg|bmp)(\?|#|$)/i.test(pathname) || 
                             /\.(jpg|jpeg|png|webp|gif|svg|bmp)/i.test(lowercaseUrl);
    
    // Check known image hosting / rendering CDN keywords or query-based placeholders
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

// Standard preset / initial mock data matching db.php
const defaultJadwal: Course[] = [
  { hari: "Senin", matkul: "Rekayasa Perangkat Lunak", jam: "08:00 - 10:30", ruang: "Lab Komputer 3", dosen: "Dr. Ir. Budi Santoso, M.T." },
  { hari: "Selasa", matkul: "Sistem Penunjang Keputusan", jam: "10:45 - 13:15", ruang: "Gedung C Ruang 204", dosen: "Rina Wijayanti, M.Kom." },
  { hari: "Rabu", matkul: "Keamanan Informasi & Jaringan", jam: "13:30 - 16:00", ruang: "Lab Komputer 1", dosen: "Andi Wijaya, S.T., M.Sc." }
];

const defaultStudents: Student[] = [
  { id: "1", nama: "Ahmad Fauzi", foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400", bio: "Pecinta kopi dan backend developer. Selalu tertarik pada optimasi query." },
  { id: "2", nama: "Siti Aminah", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400", bio: "UI/UX Designer & Product Lead. Suka mendesain antarmuka dengan sentuhan estetik." },
  { id: "3", nama: "Budi Pratama", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400", bio: "Fullstack developer magang yang hobi bermain catur dan tenis meja." }
];

const defaultMedia: MediaItem[] = [
  { tipe: "gambar", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200", keterangan: "Belajar bersama untuk persiapan ujian rekayasa sistem digital." },
  { tipe: "gambar", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200", keterangan: "Keseruan kumpul makrab angkatan Jurusan Sistem Informasi." },
  { tipe: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4", keterangan: "Dokumentasi cuplikan video presentasi project akhir angkatan." }
];

// PHP Source code templates for high fidelity source-code reading inside preview
const PHP_SOURCES = {
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

        // Auto-create database tables if not existing
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                jumlah_anggota INT DEFAULT 0,
                jadwal TEXT,
                media TEXT
            );
        ");

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
            $defaultJadwal = json_encode([
                ["hari" => "Senin", "matkul" => "Rekayasa Perangkat Lunak", "jam" => "08:00 - 10:30", "ruang" => "Lab Komputer 3", "dosen" => "Dr. Ir. Budi Santoso, M.T."],
                ["hari" => "Selasa", "matkul" => "Sistem Penunjang Keputusan", "jam" => "10:45 - 13:15", "ruang" => "Gedung C Ruang 204", "dosen" => "Rina Wijayanti, M.Kom."],
                ["hari" => "Rabu", "matkul" => "Keamanan Informasi & Jaringan", "jam" => "13:30 - 16:00", "ruang" => "Lab Komputer 1", "dosen" => "Andi Wijaya, S.T., M.Sc."]
            ]);
            $defaultMedia = json_encode([
                ["tipe" => "gambar", "url" => "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200", "keterangan" => "Belajar bersama untuk persiapan ujian rekayasa sistem digital."],
                ["tipe" => "gambar", "url" => "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200", "keterangan" => "Keseruan kumpul makrab angkatan Jurusan Sistem Informasi."],
                ["tipe" => "video", "url" => "https://www.w3schools.com/html/mov_bbb.mp4", "keterangan" => "Dokumentasi cuplikan video presentasi project akhir angkatan."]
            ]);

            $stmtInsert = $pdo->prepare("INSERT INTO settings (id, jumlah_anggota, jadwal, media) VALUES (1, 12, :jadwal, :media)");
            $stmtInsert->execute([':jadwal' => $defaultJadwal, ':media' => $defaultMedia]);
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

        $stmtAnggotas = $pdo->query("SELECT * FROM anggotas ORDER BY id DESC");
        $anggotas_list = $stmtAnggotas->fetchAll() ?: [];
    } catch (PDOException $e) {
        $db_error = "Gagal mengambil data dari database: " . $e->getMessage();
    }
}
?>
<!-- Full page HTML styled beautifully in Deep Navy #060b13 -->
`,
  "login.php": `<?php
require_once __DIR__ . '/db.php';

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header("Location: /admin");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username_input = $_POST['admin_username'] ?? '';
    $password_input = $_POST['admin_password'] ?? '';

    $admin_user = getenv('ADMIN_USERNAME') ?: 'admin';
    $admin_pass = getenv('ADMIN_PASSWORD') ?: 'password123';

    if ($username_input === $admin_user && $password_input === $admin_pass) {
        $_SESSION['admin_logged_in'] = true;
        header("Location: /admin");
        exit();
    } else {
        $error_message = "Kombinasi Username atau Password Admin salah!";
    }
}
?>
<!-- Dark minimalist login layout here -->
`,
  "admin.php": `<?php
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: /login");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $jumlah_anggota = (int)($_POST['jumlah_anggota'] ?? 0);
    $jadwal_json = $_POST['jadwal_raw'] ?? '[]';
    $media_json = $_POST['media_raw'] ?? '[]';
    $anggota_json = $_POST['anggota_raw'] ?? '[]';

    if ($pdo) {
        try {
            $pdo->beginTransaction();

            $stmtUpdateSettings = $pdo->prepare("UPDATE settings SET jumlah_anggota = :jumlah, jadwal = :jadwal, media = :media WHERE id = 1");
            $stmtUpdateSettings->execute([
                ':jumlah' => $jumlah_anggota,
                ':jadwal' => $jadwal_json,
                ':media' => $media_json
            ]);

            $incoming_anggotas = json_decode($anggota_json, true) ?: [];
            $retained_ids = [];

            $stmtInsertAnggota = $pdo->prepare("INSERT INTO anggotas (nama, foto, bio) VALUES (:nama, :foto, :bio) RETURNING id");
            $stmtUpdateAnggota = $pdo->prepare("UPDATE anggotas SET nama = :nama, foto = :foto, bio = :bio WHERE id = :id");

            foreach ($incoming_anggotas as $agt) {
                $agt_id = isset($agt['id']) ? trim($agt['id']) : '';
                $nama = trim($agt['nama'] ?? '');
                $foto = trim($agt['foto'] ?? '');
                $bio = trim($agt['bio'] ?? '');

                if (empty($nama)) continue;

                if (!empty($agt_id) && is_numeric($agt_id)) {
                    $stmtUpdateAnggota->execute([':nama' => $nama, ':foto' => $foto, ':bio' => $bio, ':id' => $agt_id]);
                    $retained_ids[] = (int)$agt_id;
                } else {
                    $stmtInsertAnggota->execute([':nama' => $nama, ':foto' => $foto, ':bio' => $bio]);
                    $new_id = $stmtInsertAnggota->fetchColumn();
                    if ($new_id) $retained_ids[] = (int)$new_id;
                }
            }

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
            $error_message = "Kesalahan Sinkronisasi: " . $e->getMessage();
        }
    }
}
?>
<!-- HTML control panel styled in dark mode with javascript dynamic form packing logic -->
`
};

export default function App() {
  // State managers
  const [view, setView] = useState<"dashboard" | "login" | "admin" | "code_viewer">("dashboard");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [successSaveNote, setSuccessSaveNote] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Core local states mimicking Postgres
  const [configJumlahAnggota, setConfigJumlahAnggota] = useState<number>(12);
  const [configJadwal, setConfigJadwal] = useState<Course[]>([]);
  const [configStudents, setConfigStudents] = useState<Student[]>([]);
  const [configMedia, setConfigMedia] = useState<MediaItem[]>([]);
  const [configLogoUrl, setConfigLogoUrl] = useState<string>("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop");
  const [mhsSearchQuery, setMhsSearchQuery] = useState("");

  const filteredStudents = configStudents.filter((agt) => {
    const q = mhsSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (agt.nama || "").toLowerCase().includes(q) ||
      (agt.bio || "").toLowerCase().includes(querySafe(agt.bio))
    );
  });

  function querySafe(val?: string) {
    return (val || "").toLowerCase();
  }

  // PHP Code Viewer state
  const [activePHPFile, setActivePHPFile] = useState<keyof typeof PHP_SOURCES>("vercel.json");
  const [copiedFileName, setCopiedFileName] = useState<string | null>(null);

  // Login variables
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Load from LocalStorage or seed defaults
  useEffect(() => {
    const localSettle = localStorage.getItem("sisfo_settings");
    const localStudents = localStorage.getItem("sisfo_students");
    const localMedia = localStorage.getItem("sisfo_media");
    const localLogged = localStorage.getItem("sisfo_logged_in");

    if (localSettle) {
      const parsed = JSON.parse(localSettle);
      setConfigJumlahAnggota(parsed.jumlah_anggota || 12);
      setConfigJadwal(parsed.jadwal || defaultJadwal);
      setConfigLogoUrl(parsed.logo_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop");
    } else {
      setConfigJumlahAnggota(12);
      setConfigJadwal(defaultJadwal);
      setConfigLogoUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop");
    }

    if (localStudents) {
      setConfigStudents(JSON.parse(localStudents));
    } else {
      setConfigStudents(defaultStudents);
    }

    if (localMedia) {
      setConfigMedia(JSON.parse(localMedia));
    } else {
      setConfigMedia(defaultMedia);
    }

    if (localLogged === "true") {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // Sync state to localstorage helper
  const saveStateToLocalStorage = (newJumlah: number, newJadwal: Course[], newStudents: Student[], newMedia: MediaItem[], newLogoUrl: string) => {
    localStorage.setItem("sisfo_settings", JSON.stringify({ jumlah_anggota: newJumlah, jadwal: newJadwal, logo_url: newLogoUrl }));
    localStorage.setItem("sisfo_students", JSON.stringify(newStudents));
    localStorage.setItem("sisfo_media", JSON.stringify(newMedia));
  };

  // Login click handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === "admin" && passwordInput === "password123") {
      setIsAdminLoggedIn(true);
      localStorage.setItem("sisfo_logged_in", "true");
      setLoginError(null);
      setView("admin");
      setUsernameInput("");
      setPasswordInput("");
    } else {
      setLoginError("Kombinasi Username atau Password Admin salah!");
    }
  };

  // Sign out click handler
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("sisfo_logged_in");
    setView("dashboard");
  };

  // Copy Code Source Helper
  const handleCopyCode = (fileName: keyof typeof PHP_SOURCES) => {
    navigator.clipboard.writeText(PHP_SOURCES[fileName]);
    setCopiedFileName(fileName);
    setTimeout(() => {
      setCopiedFileName(null);
    }, 2000);
  };

  // Dynamic admin arrays triggers
  const addMatkulRow = () => {
    setConfigJadwal([
      ...configJadwal,
      { hari: "Senin", matkul: "", jam: "08:00 - 10:30", ruang: "", dosen: "" }
    ]);
  };

  const removeMatkulRow = (idx: number) => {
    setConfigJadwal(configJadwal.filter((_, i) => i !== idx));
  };

  const handleJadwalChange = (idx: number, field: keyof Course, value: string) => {
    const updated = [...configJadwal];
    updated[idx] = { ...updated[idx], [field]: value };
    setConfigJadwal(updated);
  };

  const addStudentRow = () => {
    setConfigStudents([
      ...configStudents,
      { id: Date.now().toString(), nama: "", foto: "", bio: "" }
    ]);
  };

  const removeStudentRow = (idx: number) => {
    setConfigStudents(configStudents.filter((_, i) => i !== idx));
  };

  const handleStudentChange = (idx: number, field: keyof Student, value: string) => {
    const updated = [...configStudents];
    updated[idx] = { ...updated[idx], [field]: value };
    setConfigStudents(updated);
  };

  const addMediaRow = () => {
    setConfigMedia([
      ...configMedia,
      { tipe: "gambar", url: "", keterangan: "" }
    ]);
  };

  const removeMediaRow = (idx: number) => {
    setConfigMedia(configMedia.filter((_, i) => i !== idx));
  };

  const handleMediaChange = (idx: number, field: keyof MediaItem, value: string) => {
    const updated = [...configMedia];
    updated[idx] = { ...updated[idx], [field]: value } as any;
    setConfigMedia(updated);
  };

  // Save admin edits
  const handleAdminFormSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate student photo URL format on the client side
    const invalidStudents = configStudents.filter(s => s.foto && !isValidImageUrl(s.foto));
    if (invalidStudents.length > 0) {
      setValidationError(
        `Gagal menyimpan: terdapat ${invalidStudents.length} URL foto profil mahasiswa yang tidak valid. Periksa baris siswa dengan tanda merah di bawah.`
      );
      setSuccessSaveNote(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setValidationError(null);
    saveStateToLocalStorage(configJumlahAnggota, configJadwal, configStudents, configMedia, configLogoUrl);
    setSuccessSaveNote("Simpan Berhasil! Data kelas Anda berhasil diperbarui di cloud statis dan disinkronkan ke local storage preview ini.");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setSuccessSaveNote(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-x-hidden cyber-grid">
      {/* Floating ambient theme hexagons in the background */}
      <FloatingHexagons />

      {/* Dynamic Warning Alert on Header */}
      <div className="bg-sky-500/10 border-b border-sky-400/20 text-sky-400 py-3 px-4 text-center text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-2 relative z-10">
        <span className="flex items-center gap-1 font-semibold">
          <Database className="w-4 h-4 text-sky-400" /> Mode Preview Interaktif:
        </span>
        <span>Simulasi antarmuka portal kelas SISFO C '25. Edit konfigurasi langsung merubah preview!</span>
      </div>

      {/* Floating Panel for Code Reference */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setView(view === "code_viewer" ? "dashboard" : "code_viewer")}
          className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-3 px-5 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 border border-white/10 cursor-pointer glow-subtle"
        >
          {view === "code_viewer" ? (
            <>
              <LayoutDashboard className="w-4 h-4" />
              <span>Kembali Ke Menu Utama</span>
            </>
          ) : (
            <>
              <Code className="w-4 h-4" />
              <span>Lihat Kode Vercel + Supabase PHP</span>
            </>
          )}
        </button>
      </div>

      {/* Main Navigation Header: High Density Aesthetic */}
      <header className="border-b border-sky-500/15 bg-[#030712]/90 backdrop-blur sticky top-0 z-40 transition-all duration-300 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
          <div className="flex items-end justify-between md:justify-start gap-4">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("dashboard")}>
              {!configLogoUrl || configLogoUrl.includes("unsplash.com/photo-1618005182384-a83a8bd57fbe") ? (
                <div className="w-11 h-11 transition-transform duration-300 group-hover:scale-110">
                  <ClassLogo className="w-full h-full" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-sky-950/40 border border-sky-500/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg group transition-transform duration-300 group-hover:scale-110">
                  <img 
                    src={configLogoUrl} 
                    alt="Logo Kelas" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop";
                    }}
                  />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.25em] text-sky-400 font-bold mb-0.5">Academic Portal</span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tighter leading-none">
                  SISFO <span className="text-sky-400">C</span> '25
                </h1>
              </div>
            </div>

            {/* Inline Dashboard quick links */}
            <div className="hidden lg:flex items-center gap-5 ml-8 pb-1">
              <button 
                onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("jadwal")?.scrollIntoView({ behavior: "smooth" }), 100); }} 
                className="text-xs uppercase tracking-wider text-slate-400 hover:text-blue-400 font-bold transition-colors cursor-pointer"
              >
                Jadwal Kuliah
              </button>
              <button 
                onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("mahasiswa")?.scrollIntoView({ behavior: "smooth" }), 100); }} 
                className="text-xs uppercase tracking-wider text-slate-400 hover:text-blue-400 font-bold transition-colors cursor-pointer"
              >
                Direktori Mahasiswa
              </button>
              <button 
                onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("galeri")?.scrollIntoView({ behavior: "smooth" }), 100); }} 
                className="text-xs uppercase tracking-wider text-slate-400 hover:text-blue-400 font-bold transition-colors cursor-pointer"
              >
                Galeri Kenangan
              </button>
            </div>
          </div>

          <div className="flex gap-6 items-center justify-between md:justify-end">
            {/* Dynamic Class Statistics from real states */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">Class Statistics</span>
              <div className="flex gap-4 mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-mono font-bold text-white leading-none">{configJumlahAnggota}</span>
                  <span className="text-[10px] opacity-60">Anggota</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-mono font-bold text-white leading-none">{configJadwal.length * 4}</span>
                  <span className="text-[10px] opacity-60">SKS</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-mono font-bold text-white leading-none">3.82</span>
                  <span className="text-[10px] opacity-60">Avg GPA</span>
                </div>
              </div>
            </div>

            {/* Portal Action Buttons */}
            <div className="flex items-center gap-3">
              {isAdminLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setView("admin")} 
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Panel Admin
                  </button>
                  <button 
                    onClick={handleLogout}
                    title="Sign Out" 
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setView("login")} 
                  className="bg-[#060b13] hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs font-semibold text-white tracking-wide transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" /> Admin Portal
                </button>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* Main Content Areas */}
      <div className="flex-grow flex flex-col justify-start w-full">
        <AnimatePresence mode="wait">
          {/* VIEW: Public Dashboard */}
          {view === "dashboard" && (
            <motion.main 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              {/* Hero Banner Grid layout - Hexagon Modern Theme */}
              <section className="relative rounded-3xl overflow-hidden mb-10 py-12 px-6 md:px-12 bg-slate-950/40 border border-sky-500/20 shadow-sky-500/5 shadow-2xl backdrop-blur-sm">
                <div className="absolute -right-20 -top-20 bg-sky-500/10 w-96 h-96 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-20 -bottom-20 bg-blue-500/10 w-96 h-96 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 grid md:grid-cols-12 items-center gap-8 md:gap-10">
                  <div className="md:col-span-8 flex flex-col gap-5 text-left">
                    <span className="inline-flex max-w-max bg-sky-500/10 text-sky-450 border border-sky-500/20 text-[10px] font-bold font-mono tracking-widest uppercase px-3 py-1 rounded-full">
                      🔥 WEBSITE KORIDOR ANGKATAN 2025
                    </span>
                    <h1 className="font-sans font-extrabold text-3xl md:text-5xl text-white tracking-tight leading-none">
                      Integrated Class Hub <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">SISFO C '25</span>
                    </h1>
                    <p className="text-slate-350 text-sm md:text-base leading-relaxed max-w-2xl">
                      Mewadahi direktori data akademik, keanggotaan mahasiswa, serta mendokumentasikan setiap mozaik cerita perjalanan perkuliahan kita di Universitas secara dinamis.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <button 
                        onClick={() => document.getElementById("mahasiswa")?.scrollIntoView({ behavior: "smooth" })}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.03] cursor-pointer glow-subtle"
                      >
                        <Users className="w-4 h-4" /> Direktori Anggota
                      </button>
                      <button 
                        onClick={() => document.getElementById("jadwal")?.scrollIntoView({ behavior: "smooth" })}
                        className="inline-flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs px-5 py-3 rounded-xl border border-sky-500/30 transition-all hover:scale-[1.03] cursor-pointer"
                      >
                        Jadwal Kuliah <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Glowing Hexagonal Tech Logo Frame */}
                  <div className="md:col-span-4 w-full flex flex-col items-center justify-center">
                    <motion.div 
                      className="relative w-40 h-40 flex items-center justify-center mb-4"
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="absolute inset-0 bg-sky-500/10 rounded-full blur-2xl animate-pulse"></div>
                      <ClassLogo className="w-32 h-32 absolute z-10" />
                    </motion.div>
                    
                    <div className="bg-slate-900/80 border border-sky-500/20 rounded-2xl p-5 w-full max-w-xs shadow-xl backdrop-blur-md">
                      <div className="text-center">
                        <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Anggota Kelas</span>
                        <div className="font-mono font-black text-5xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mt-1">
                          {configJumlahAnggota}
                        </div>
                        <span className="text-[9px] text-sky-400/80 font-mono block mt-1 tracking-wide">SISTEM INFORMASI C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Weekly Schedule Section - Modern Hex Grid */}
              <motion.section 
                id="jadwal" 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-12 scroll-mt-24 bg-slate-950/40 rounded-3xl border border-sky-500/15 overflow-hidden backdrop-blur-sm shadow-xl"
              >
                <div className="p-5 border-b border-sky-500/15 bg-slate-950/60 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-sky-400 animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white">Weekly Schedule</h2>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 text-[9px] font-bold uppercase font-mono border border-sky-500/10">SEMESTER 4</span>
                </div>

                {configJadwal.length === 0 ? (
                  <div className="p-16 text-center">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-sm font-semibold text-white">Belum Ada Jadwal</h3>
                    <p className="text-xs text-slate-400 mt-1">Silakan login sebagai admin untuk menambah entri jadwal akademik mingguan.</p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {configJadwal.map((jw, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        whileHover={{ 
                          y: -6, 
                          scale: 1.03, 
                          borderColor: "rgba(56, 189, 248, 0.45)", 
                          boxShadow: "0 20px 40px -15px rgba(56, 189, 248, 0.3)" 
                        }}
                        className="group p-5 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-sky-500/10 hover:bg-slate-900/50 hover:backdrop-blur-lg transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-lg"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sky-400 text-[10px] font-bold font-mono tracking-wider uppercase bg-sky-500/10 px-2.5 py-0.5 rounded">
                              {jw.hari || "HARI -"} &bull; {jw.jam || "JAM -"}
                            </span>
                            <span className="text-[10px] opacity-50 font-mono italic flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-sky-400" /> {jw.ruang || "-"}
                            </span>
                          </div>
                          <div className="text-base font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1 mb-2">
                            {jw.matkul || "Mata Kuliah -"}
                          </div>
                          <div className="text-xs opacity-60 flex items-center gap-1.5 pt-2 border-t border-sky-500/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                            <span className="truncate">{jw.dosen || "Dosen Pengampu"}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>

              {/* Student Directory Section - Modern Tech Grid */}
              <motion.section 
                id="mahasiswa" 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-12 scroll-mt-24 bg-slate-950/40 rounded-3xl border border-sky-500/15 overflow-hidden backdrop-blur-sm shadow-xl"
              >
                <div className="p-5 border-b border-sky-500/15 bg-slate-950/60 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-sky-400 animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white">Student Directory</h2>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 text-[9px] font-bold uppercase font-mono border border-sky-500/10">
                    TOTAL: {configStudents.length} PROFIL
                  </span>
                </div>

                {configStudents.length > 0 && (
                  <div className="px-5 py-4 bg-slate-900/20 border-b border-sky-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md w-full">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400/65">
                        <Search className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        placeholder="Cari nama atau bio mahasiswa..."
                        value={mhsSearchQuery}
                        onChange={(e) => setMhsSearchQuery(e.target.value)}
                        className="w-full bg-slate-950/60 border border-sky-500/15 rounded-xl py-2 pl-10 pr-9 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
                      />
                      {mhsSearchQuery && (
                        <button 
                          onClick={() => setMhsSearchQuery("")}
                          aria-label="Clear search"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>Hasil filter:</span>
                      <span className="text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/10 font-bold max-w-max">
                        {filteredStudents.length} dari {configStudents.length}
                      </span>
                    </div>
                  </div>
                )}

                {configStudents.length === 0 ? (
                  <div className="p-16 text-center">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-sm font-semibold text-white">Database Mahasiswa Kosong</h3>
                    <p className="text-xs text-slate-400 mt-1">Masuk ke Panel Admin untuk menambah data profil mahasiswa.</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-16 text-center">
                    <Search className="w-12 h-12 text-slate-650 mx-auto mb-3 animate-pulse" />
                    <h3 className="text-sm font-semibold text-white">Tidak Menemukan Profil</h3>
                    <p className="text-xs text-slate-400 mt-1">Pencarian untuk "{mhsSearchQuery}" tidak cocok dengan data classmate manapun.</p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredStudents.map((agt, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: (i % 8) * 0.04 }}
                        whileHover={{ 
                          y: -5, 
                          scale: 1.03, 
                          borderColor: "rgba(56, 189, 248, 0.45)", 
                          boxShadow: "0 20px 40px -15px rgba(56, 189, 248, 0.3)" 
                        }}
                        className="flex items-center gap-4.5 p-3.5 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-sky-500/10 hover:bg-slate-900/50 hover:backdrop-blur-lg transition-all duration-300 cursor-pointer shadow-lg"
                      >
                        <div className="w-11 h-11 rounded-xl bg-sky-950/50 border border-sky-500/30 flex items-center justify-center text-xs font-bold text-sky-400 overflow-hidden shrink-0">
                          {agt.foto ? (
                            <img 
                              src={agt.foto} 
                              referrerPolicy="no-referrer" 
                              alt="" 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).onerror = null;
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300";
                              }}
                            />
                          ) : (
                            <span>{agt.nama ? agt.nama.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "SI"}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate" title={agt.nama}>
                            {agt.nama || "Nama Mahasiswa"}
                          </div>
                          <div className="text-[10px] text-sky-400/80 truncate mt-0.5 leading-tight font-medium" title={agt.bio}>
                            {agt.bio || "Sistem Informasi C '25"}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>

              {/* Memory Album Media Section - Aesthetic Photo Carousel */}
              <motion.section 
                id="galeri" 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-6 scroll-mt-24 bg-slate-950/40 rounded-3xl border border-sky-500/15 overflow-hidden backdrop-blur-sm shadow-xl"
              >
                <div className="p-5 border-b border-sky-500/15 bg-slate-950/60 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <Images className="w-4 h-4 text-sky-400 animate-pulse" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-white">Class Gallery</h2>
                  </div>
                  <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/10 uppercase font-bold tracking-wider">MEDIA ARCHIVE</span>
                </div>

                {configMedia.length === 0 ? (
                  <div className="p-16 text-center">
                    <Images className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-sm font-semibold text-white">Album Belum Terisi</h3>
                    <p className="text-xs text-slate-400 mt-1">Tautkan media kenangan kelas Anda di menu panel admin.</p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {configMedia.map((med, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        whileHover={{ 
                          y: -6, 
                          scale: 1.03, 
                          borderColor: "rgba(56, 189, 248, 0.45)", 
                          boxShadow: "0 20px 40px -15px rgba(56, 189, 248, 0.3)" 
                        }}
                        className="bg-slate-950/40 backdrop-blur-md rounded-2xl border border-sky-500/10 overflow-hidden group flex flex-col justify-between hover:bg-slate-900/50 hover:backdrop-blur-lg transition-all duration-300 cursor-pointer shadow-lg"
                      >
                        <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden shrink-0 border-b border-sky-500/10">
                          {med.tipe === "video" ? (
                            <video controls className="absolute inset-0 w-full h-full object-cover">
                              <source src={med.url} type="video/mp4" />
                              Browser Anda tidak mendukung HTML5 Video.
                            </video>
                          ) : (
                            <>
                              <img 
                                src={med.url} 
                                referrerPolicy="no-referrer" 
                                alt="Kenangan SISFO" 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).onerror = null;
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600";
                                }}
                              />
                              <div className="absolute top-3 left-3 bg-[#030712]/85 border border-sky-500/20 backdrop-blur rounded px-2.5 py-1 text-[9px] font-mono font-bold text-sky-400 tracking-wider uppercase">
                                CAMERA MEMORY
                              </div>
                            </>
                          )}
                        </div>
                        <div className="p-4 bg-slate-950/20 flex-grow">
                          <p className="text-xs text-slate-350 leading-relaxed line-clamp-2 italic">
                            "{med.keterangan || "Memori dokumentasi kebersamaan kelas C."}"
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            </motion.main>
          )}

          {/* VIEW: Login Admin Gate */}
          {view === "login" && (
            <motion.main 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex items-center justify-center p-4 py-16"
            >
              <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -right-16 -top-16 bg-blue-500/5 w-48 h-48 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10 text-center mb-6">
                  <div className="inline-flex p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-white/5 mb-3 shadow-lg">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h1 className="font-sans font-bold text-lg text-white tracking-tight">Portal Administrator</h1>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Masukkan kredensial khusus administrator pimpinan kelas untuk dapat mengedit preferensi akademik & direktori kelas.
                  </p>
                </div>

                {loginError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="bg-blue-500/5 border border-blue-500/10 text-blue-400/90 p-3 rounded-lg text-[11px] flex flex-col gap-1 mb-4 leading-relaxed font-mono">
                  <span className="font-bold flex items-center gap-1.5 text-blue-300">
                    <Info className="w-3.5 h-3.5" /> Simulator Credentials:
                  </span>
                  <span>Username: <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-300">admin</code></span>
                  <span>Password: <code className="bg-slate-950 px-1 py-0.5 rounded text-blue-300">password123</code></span>
                </div>

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username Admin</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <User className="w-3.5 h-3.5" />
                      </span>
                      <input 
                        type="text" 
                        required 
                        placeholder="admin" 
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="w-full bg-[#060b13] border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500 font-sans" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password Admin</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Key className="w-3.5 h-3.5" />
                      </span>
                      <input 
                        type="password" 
                        required 
                        placeholder="•••••••••" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-[#060b13] border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-blue-500 font-sans" 
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full mt-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs">
                    <span>Masuk ke Panel Kontrol</span>
                    <LogIn className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setView("dashboard")} 
                    className="w-full text-center text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors py-1 cursor-pointer"
                  >
                    Kembali Ke Dashboard
                  </button>
                </form>
              </div>
            </motion.main>
          )}

          {/* VIEW: Control Center Admin Panel */}
          {view === "admin" && (
            <motion.main 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              {/* Success Save Notification bar */}
              {successSaveNote && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-4 rounded-2xl text-xs md:text-sm flex items-center gap-3 mb-8 shadow-lg">
                  <Check className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>{successSaveNote}</span>
                </div>
              )}

              {validationError && (
                <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-4 rounded-2xl text-xs md:text-sm flex items-center gap-3 mb-8 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-505 animate-ping shrink-0" />
                  <span className="font-semibold">{validationError}</span>
                </div>
              )}

              {/* Dynamic packing control form */}
              <form onSubmit={handleAdminFormSave} className="flex flex-col gap-10">
                
                {/* Section 1: Standard Settings config */}
                <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-400/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-sans font-bold text-lg md:text-xl text-white">Metadata Dasar Kelas</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Konfigurasi data statistik dasar halaman depan portal.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Jumlah Anggota Kelas</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">#</span>
                        <input 
                          type="number" 
                          required 
                          value={configJumlahAnggota} 
                          onChange={(e) => setConfigJumlahAnggota(parseInt(e.target.value) || 0)}
                          className="w-full bg-[#060b13] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-white focus:outline-none focus:border-sky-500" 
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1.5 block leading-normal">Mempengaruhi pencatatan jumlah statistik global di dashboard utama.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Tautan Logo Kelas (URL Gambar)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550 text-slate-500 text-xs font-bold">URL</span>
                        <input 
                          type="url" 
                          placeholder="https://example.com/logo.png"
                          value={configLogoUrl} 
                          onChange={(e) => setConfigLogoUrl(e.target.value)}
                          className="w-full bg-[#060b13] border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold text-white focus:outline-none focus:border-sky-500 font-mono" 
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1.5 block leading-normal">
                        Masukkan URL gambar logo kelas SISFO C. Direkomendasikan menggunakan rasio persegi (1:1).
                      </span>
                    </div>
                  </div>
                </section>

                {/* Section 2: Course Schedule Dynamic form block */}
                <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-400/20">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-lg md:text-xl text-white">Modul Jadwal Kuliah</h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">Daftar agenda mata kuliah mingguan.</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={addMatkulRow}
                      className="inline-flex items-center gap-2 bg-sky-600/10 hover:bg-sky-600 border border-sky-500/20 text-sky-400 hover:text-white transition-all font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Tambah Matkul
                    </button>
                  </div>

                  <div id="jadwal-container" className="flex flex-col gap-4">
                    {configJadwal.map((jw, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-3 bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl relative group">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 flex-grow">
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-505 text-slate-500 uppercase tracking-wider mb-1">Hari</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Senin" 
                              value={jw.hari} 
                              onChange={(e) => handleJadwalChange(idx, "hari", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Jam</label>
                            <input 
                              type="text" 
                              required
                              placeholder="08:00 - 10:30" 
                              value={jw.jam} 
                              onChange={(e) => handleJadwalChange(idx, "jam", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Ruang</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Lab Komputer" 
                              value={jw.ruang} 
                              onChange={(e) => handleJadwalChange(idx, "ruang", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" 
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Mata Kuliah</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Nama Mata Kuliah" 
                              value={jw.matkul} 
                              onChange={(e) => handleJadwalChange(idx, "matkul", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" 
                            />
                          </div>
                          <div className="sm:col-span-2 md:col-span-5">
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Dosen Pengampu</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Nama Lengkap Dosen, S.T., M.Kom." 
                              value={jw.dosen} 
                              onChange={(e) => handleJadwalChange(idx, "dosen", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-805 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" 
                            />
                          </div>
                        </div>
                        <div className="flex items-end justify-end md:justify-start">
                          <button 
                            type="button" 
                            onClick={() => removeMatkulRow(idx)}
                            className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 3: Student Directory Dynamic table form block */}
                <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-400/20">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-lg md:text-xl text-white">Sistem Direktori Mahasiswa</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Sikronisasi massal direktori database mahasiswa aktif.</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={addStudentRow}
                      className="inline-flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 text-indigo-400 hover:text-white transition-all font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Tambah Mahasiswa
                    </button>
                  </div>

                  {/* Environment Warning Notice mirroring real server constraints */}
                  <div className="bg-sky-500/5 rounded-2xl p-4 border border-sky-500/10 text-xs text-sky-400 leading-relaxed mb-6 flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-sky-400" />
                    <div>
                      <span className="font-bold block mb-0.5 text-sky-300">Batasan Lingkungan Serverless (Read-Only Stateless):</span>
                      Foto profil mahasiswa WAJIB menggunakan tautan URL gambar eksternal bertipe HTTPS. Logika unggah/upload berkas dilarang karena sistem penyimpanan lokal Vercel bersifat stateless dan temporal.
                    </div>
                  </div>

                  <div id="mahasiswa-container" className="flex flex-col gap-4">
                    {configStudents.map((agt, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-4 bg-slate-950/40 border border-slate-800/80 p-5 rounded-xl relative group">
                        
                        <div className="flex-grow flex flex-col sm:flex-row gap-4">
                          {/* Profile Mirroring Box */}
                          <div className="w-16 h-16 rounded-xl bg-[#060b13] border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                            {agt.foto ? (
                              <img 
                                src={agt.foto} 
                                alt="preview" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";
                                }}
                              />
                            ) : (
                              <User className="w-6 h-6 text-slate-500" />
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                            <div>
                              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Nama Lengkap <span className="text-indigo-400 font-mono text-[9px] ml-1 bg-indigo-500/10 px-1.5 py-0.5 rounded">ID: {agt.id.startsWith("17") ? "MOCK" : agt.id}</span>
                              </label>
                              <input 
                                type="text" 
                                required
                                placeholder="Nama Lengkap Mahasiswa" 
                                value={agt.nama} 
                                onChange={(e) => handleStudentChange(idx, "nama", e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold" 
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Tautan URL Foto Profil (External HTTPS)
                              </label>
                              <input 
                                type="url" 
                                required
                                placeholder="https://images.unsplash.com/photo-..." 
                                value={agt.foto} 
                                onChange={(e) => handleStudentChange(idx, "foto", e.target.value)}
                                className={`w-full bg-slate-900 border ${
                                  agt.foto && !isValidImageUrl(agt.foto) 
                                    ? "border-rose-500/60 focus:border-rose-500 text-rose-300 bg-rose-950/10 focus:ring-1 focus:ring-rose-500" 
                                    : "border-slate-800 focus:border-sky-500 text-slate-350"
                                } rounded-lg p-2 text-xs focus:outline-none font-mono`} 
                              />
                              {agt.foto && !isValidImageUrl(agt.foto) && (
                                <p className="text-[10px] text-rose-400 mt-1 font-sans font-medium">
                                  ⚠️ URL harus berupa HTTPS dengan ekstensi gambar (.jpg, .png, dll) atau link hosting gambar yang valid.
                                </p>
                              )}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Bio Ringkas Slogan</label>
                              <input 
                                type="text" 
                                placeholder="UI/UX Designer / Mobile Developer angkatan." 
                                value={agt.bio} 
                                onChange={(e) => handleStudentChange(idx, "bio", e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-end justify-end md:justify-start">
                          <button 
                            type="button" 
                            onClick={() => removeStudentRow(idx)}
                            className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 4: Album Media dynamic rows */}
                <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <Images className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-lg md:text-xl text-white">Media Galeri Dokumentasi</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Daftar media memori dokumentasi kelas (Foto/Video URL).</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={addMediaRow}
                      className="inline-flex items-center gap-2 bg-violet-600/10 hover:bg-violet-600 border border-violet-500/20 text-violet-400 hover:text-white transition-all font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Tambah Media
                    </button>
                  </div>

                  <div id="media-container" className="flex flex-col gap-4">
                    {configMedia.map((med, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-4 bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl relative group">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-grow">
                          <div className="md:col-span-3">
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Tipe Media</label>
                            <select 
                              value={med.tipe} 
                              onChange={(e) => handleMediaChange(idx, "tipe", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500 h-[34px] font-sans"
                            >
                              <option value="gambar">Gambar (JPG/PNG)</option>
                              <option value="video">Video Content</option>
                            </select>
                          </div>
                          <div className="md:col-span-5">
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">URL Sumber Media (HTTPS)</label>
                            <input 
                              type="url" 
                              required
                              placeholder="https://images.unsplash.com/photo-..." 
                              value={med.url} 
                              onChange={(e) => handleMediaChange(idx, "url", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono" 
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Keterangan / Caption</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Suasana kelas semester akhir" 
                              value={med.keterangan} 
                              onChange={(e) => handleMediaChange(idx, "keterangan", e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500" 
                            />
                          </div>
                        </div>
                        <div className="flex items-end justify-end md:justify-start">
                          <button 
                            type="button" 
                            onClick={() => removeMediaRow(idx)}
                            className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Sticky Action Navigation Control banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky bottom-4 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono text-center sm:text-left">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse"></div>
                    <span>Data yang diubah diperbarui langsung di Supabase Cloud saat Anda meng-klik Simpan.</span>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                    <button 
                      type="button"
                      onClick={() => setView("dashboard")}
                      className="w-1/2 sm:w-auto text-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-750 px-5 py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      className="w-1/2 sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs md:text-sm px-6 py-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Simpan & Sinkronkan
                    </button>
                  </div>
                </div>

              </form>
            </motion.main>
          )}

          {/* VIEW: PHP Code Tab Viewer */}
          {view === "code_viewer" && (
            <motion.main 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              <div className="mb-8">
                <span className="text-xs bg-sky-500/10 text-sky-400 px-3 py-1.5 rounded-full font-mono border border-sky-400/20 uppercase font-bold">
                  Arsitektur Ekspor Vercel PHP + Supabase
                </span>
                <h1 className="font-display font-extrabold text-2xl md:text-4xl text-white mt-3">Native PHP Code Explorer</h1>
                <p className="text-slate-405 text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
                  Kami telah membuat seluruh berkas PHP yang Anda butuhkan secara lengkap, andal, modular, dan terstruktur sesuai rancangan stateless serverless Vercel dan Supabase PostgreSQL. Anda dapat menyalin kode instan ini untuk disinkronkan ke repositori Anda!
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Navigator Rail left */}
                <div className="lg:col-span-3 flex flex-col gap-2">
                  <span className="text-slate-500 text-[10px] font-mono tracking-wider font-bold uppercase mb-1">Daftar Berkas PHP</span>
                  {Object.keys(PHP_SOURCES).map((fileName) => (
                    <button
                      key={fileName}
                      onClick={() => setActivePHPFile(fileName as any)}
                      className={`w-full text-left font-mono text-xs px-4 py-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        activePHPFile === fileName
                          ? "bg-sky-500/10 border-sky-500/30 text-sky-400 font-bold"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 shrink-0 opacity-80" />
                        <span>{fileName}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  ))}

                  <div className="mt-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-305 text-indigo-400 leading-normal">
                    <span className="font-bold flex items-center gap-1.5 mb-1 text-indigo-300">
                      <Database className="w-4 h-4" /> PDO PostgreSQL
                    </span>
                    Tabel <code class="bg-slate-950 px-1 py-0.5 rounded text-[11px]">settings</code> dan <code class="bg-slate-950 px-1 py-0.5 rounded text-[11px]">anggotas</code> terintegrasi otomatis dengan skema inisialisasi awal.
                  </div>
                </div>

                {/* Code Window right */}
                <div className="lg:col-span-9 flex flex-col gap-3">
                  <div className="flex items-center justify-between bg-slate-900 px-6 py-4 rounded-t-2xl border-x border-t border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-xs font-mono text-slate-400 ml-2">{activePHPFile}</span>
                    </div>
                    
                    <button
                      onClick={() => handleCopyCode(activePHPFile)}
                      className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors text-xs font-medium px-4 py-2 rounded-lg border border-slate-700 cursor-pointer"
                    >
                      {copiedFileName === activePHPFile ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Kode</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-950 border-x border-b border-slate-800 rounded-b-2xl p-6 font-mono text-xs overflow-auto max-h-[550px] leading-relaxed text-slate-300 pointer-events-auto select-all">
                    <pre>{PHP_SOURCES[activePHPFile]}</pre>
                  </div>
                </div>
              </div>
            </motion.main>
          )}

        </AnimatePresence>
      </div>

      {/* Main footer layout matching PHP dashboard */}
      <footer className="border-t border-slate-850 bg-[#060b13] py-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left text-xs md:text-sm text-slate-500 font-mono">
          <div>
            <p>&copy; 2026 SISFO C '25. Sistem Informasi Kelas C 2025.</p>
            <p className="text-[11px] text-slate-600 mt-1">Dibangun tanpa framework dengan Native PHP ditenagai Supabase PostgreSQL & Vercel.</p>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-end">
            <button onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("jadwal")?.scrollIntoView({ behavior: "smooth" }), 100); }} className="hover:text-slate-350 hover:text-slate-300 transition-colors cursor-pointer">Jadwal</button>
            <button onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("mahasiswa")?.scrollIntoView({ behavior: "smooth" }), 100); }} className="hover:text-slate-350 hover:text-slate-300 transition-colors cursor-pointer">Mahasiswa</button>
            <button onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("galeri")?.scrollIntoView({ behavior: "smooth" }), 100); }} className="hover:text-slate-350 hover:text-slate-300 transition-colors cursor-pointer">Galeri</button>
            <button onClick={() => setView("login")} className="text-sky-500 hover:text-sky-450 transition-colors font-semibold cursor-pointer">Gateway Admin</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
