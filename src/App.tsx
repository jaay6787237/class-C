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
  X,
  Sun,
  Moon,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Course, Student, MediaItem, Settings } from "./types";
import { StudentCard } from "./components/StudentCard";
import { PHP_SOURCES } from "./phpSources";
import { 
  isSupabaseConfigured,
  fetchSettingsCloud,
  saveSettingsCloud,
  fetchStudentsCloud,
  saveStudentsCloud,
  fetchMediaCloud,
  saveMediaCloud
} from "./lib/supabase";

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
export function FloatingHexagons({ theme = "dark" }: { theme?: string }) {
  const isLight = theme === "light";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(6)].map((_, i) => {
        const size = 100 + i * 50;
        const delay = i * 1.5;
        const duration = 22 + i * 4;
        const opacity = isLight ? 0.02 + (i % 3) * 0.009 : 0.03 + (i % 3) * 0.015;
        const strokeColor = isLight ? "rgba(14, 165, 233, 0.4)" : "currentColor";
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
            <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500" style={{ opacity: opacity, color: strokeColor }} fill="none" stroke="currentColor" strokeWidth="1.5">
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

// PHP Source code templates imported from modular src/phpSources.ts for 100% feature parity with production files on disk!

export default function App() {
  // Cyber Welcome screen states
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeProgress, setWelcomeProgress] = useState(0);
  const [welcomeStatus, setWelcomeStatus] = useState("DEKRIPSI INFRASTRUKTUR SISTEM...");

  // State managers
  const [view, setView] = useState<"dashboard" | "login" | "admin" | "code_viewer">("dashboard");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("sisfo-theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("sisfo-theme", theme);
  }, [theme]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [successSaveNote, setSuccessSaveNote] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCloudLoading, setIsCloudLoading] = useState(false);
  const [cloudLoadError, setCloudLoadError] = useState<string | null>(null);
  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState(false);
  const [supabaseSyncError, setSupabaseSyncError] = useState<string | null>(null);

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

  // Cyber Welcome Screen Loader Timeline Simulation
  useEffect(() => {
    const bootLogs = [
      { limit: 15, text: "DEKRIPSI INFRASTRUKTUR SISTEM..." },
      { limit: 35, text: "KONFIGURASI ENKAPSULASI TEMA KULIAH..." },
      { limit: 55, text: "MENGHUBUNGKAN DATABASE SUPABASE..." },
      { limit: 75, text: "SINKRONISASI DATA KELAS VERIFIED..." },
      { limit: 90, text: "MEMBANGUN MOZAIK CERITA MAHASISWA..." },
      { limit: 100, text: "SISTEM SIAP, SELAMAT DATANG DI SISFO C!" }
    ];

    const duration = 1200; // 1.2 seconds total sequence duration
    const stepTime = 15;
    const increment = 100 / (duration / stepTime);

    const loaderInterval = setInterval(() => {
      setWelcomeProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(loaderInterval);
          setTimeout(() => {
            setShowWelcome(false);
          }, 350);
          return 100;
        }

        const log = bootLogs.find(b => next <= b.limit) || bootLogs[bootLogs.length - 1];
        setWelcomeStatus(log.text);
        return next;
      });
    }, stepTime);

    return () => clearInterval(loaderInterval);
  }, []);

  // Load from LocalStorage or seed defaults & sync with Supabase if configured
  useEffect(() => {
    let initialJumlah = 12;
    let initialJadwal = defaultJadwal;
    let initialStudents = defaultStudents;
    let initialMedia = defaultMedia;
    let initialLogo = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop";

    // 1. Initial Load from LocalStorage immediately for instant UI
    try {
      const localSettle = localStorage.getItem("sisfo_settings");
      const localStudents = localStorage.getItem("sisfo_students");
      const localMedia = localStorage.getItem("sisfo_media");
      const localLogged = localStorage.getItem("sisfo_logged_in");

      if (localSettle) {
        const parsed = JSON.parse(localSettle);
        initialJumlah = parsed.jumlah_anggota || 12;
        initialJadwal = parsed.jadwal || defaultJadwal;
        initialLogo = parsed.logo_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop";
        setConfigJumlahAnggota(initialJumlah);
        setConfigJadwal(initialJadwal);
        setConfigLogoUrl(initialLogo);
      } else {
        setConfigJumlahAnggota(12);
        setConfigJadwal(defaultJadwal);
        setConfigLogoUrl(initialLogo);
      }

      if (localStudents) {
        initialStudents = JSON.parse(localStudents);
        setConfigStudents(initialStudents);
      } else {
        setConfigStudents(defaultStudents);
      }

      if (localMedia) {
        initialMedia = JSON.parse(localMedia);
        setConfigMedia(initialMedia);
      } else {
        setConfigMedia(defaultMedia);
      }

      if (localLogged === "true") {
        setIsAdminLoggedIn(true);
      }
    } catch (error) {
      console.error("Gagal memuat konfigurasi dari LocalStorage, memulihkan defaults:", error);
      setConfigJumlahAnggota(12);
      setConfigJadwal(defaultJadwal);
      setConfigStudents(defaultStudents);
      setConfigMedia(defaultMedia);
      setConfigLogoUrl(initialLogo);
    }

    // 2. If Supabase is configured, fetch the most fresh data from Supabase Cloud
    const loadFromSupabaseCloud = async () => {
      if (!isSupabaseConfigured) return;
      setIsCloudLoading(true);
      setCloudLoadError(null);
      try {
        const cloudSettings = await fetchSettingsCloud();
        const cloudStudents = await fetchStudentsCloud();
        const cloudMedia = await fetchMediaCloud();

        let updatedJumlah = initialJumlah;
        let updatedLogoUrl = initialLogo;
        let updatedJadwal = initialJadwal;
        let updatedStudents = initialStudents;
        let updatedMedia = initialMedia;

        if (cloudSettings) {
          setConfigJumlahAnggota(cloudSettings.jumlah_anggota);
          setConfigLogoUrl(cloudSettings.logo_url);
          setConfigJadwal(cloudSettings.jadwal);
          updatedJumlah = cloudSettings.jumlah_anggota;
          updatedLogoUrl = cloudSettings.logo_url;
          updatedJadwal = cloudSettings.jadwal;
        }

        if (cloudStudents && cloudStudents.length > 0) {
          setConfigStudents(cloudStudents);
          updatedStudents = cloudStudents;
        }

        if (cloudMedia && cloudMedia.length > 0) {
          setConfigMedia(cloudMedia);
          updatedMedia = cloudMedia;
        }

        // Cache the fresh cloud data in local storage
        localStorage.setItem("sisfo_settings", JSON.stringify({ jumlah_anggota: updatedJumlah, jadwal: updatedJadwal, logo_url: updatedLogoUrl }));
        localStorage.setItem("sisfo_students", JSON.stringify(updatedStudents));
        localStorage.setItem("sisfo_media", JSON.stringify(updatedMedia));
      } catch (err: any) {
        console.error("Gagal memuat data dari Supabase Cloud:", err);
        setCloudLoadError(err.message || "Gagal sinkronisasi data dari Supabase Cloud");
      } finally {
        setIsCloudLoading(false);
      }
    };

    loadFromSupabaseCloud();
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
  const handleAdminFormSave = async (e: React.FormEvent) => {
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
    setIsSyncingWithSupabase(true);
    setSupabaseSyncError(null);

    // Save state to LocalStorage (works immediately)
    saveStateToLocalStorage(configJumlahAnggota, configJadwal, configStudents, configMedia, configLogoUrl);

    try {
      if (isSupabaseConfigured) {
        await saveSettingsCloud(configJumlahAnggota, configLogoUrl, configJadwal);
        await saveStudentsCloud(configStudents);
        await saveMediaCloud(configMedia);
        setSuccessSaveNote("Simpan Berhasil! Data kelas Anda telah berhasil disinkronkan langsung ke database Supabase Cloud dan local storage browser.");
      } else {
        setSuccessSaveNote("Simpan Berhasil! Data kelas Anda berhasil didelegasikan ke local storage (Konfigurasi Supabase belum aktif).");
      }
    } catch (err: any) {
      console.error(err);
      setSupabaseSyncError(`Gagal sinkronisasi Supabase: ${err.message || err}. Harap pastikan tabel-tabel sisfo telah dibuat di database Supabase Anda.`);
      setSuccessSaveNote("Tersimpan Lokal: Gagal sinkronisasi data awan. Data tersimpan di web local storage browser Anda.");
    } finally {
      setIsSyncingWithSupabase(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setSuccessSaveNote(null);
      }, 8000);
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors duration-300 ${
      theme === "light"
        ? "bg-slate-50 text-slate-700"
        : "bg-[#030712] text-slate-300 cyber-grid"
    }`}>
      {/* Cyberpunk Welcome Overlay Loader */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#060b13] z-[9999] flex flex-col items-center justify-center select-none"
          >
            {/* Ambient background blur blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
              <div className="absolute bg-sky-500/10 w-[500px] h-[500px] rounded-full blur-3xl -top-40 -left-20"></div>
              <div className="absolute bg-indigo-500/15 w-[600px] h-[600px] rounded-full blur-3xl -bottom-40 -right-20"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
              {/* Pulsing Hex Shield Logo */}
              <motion.div 
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-8 drop-shadow-[0_0_20px_rgba(56,189,248,0.55)] animate-pulse"
              >
                {!configLogoUrl || configLogoUrl.includes("unsplash.com/photo-1618005182384-a83a8bd57fbe") ? (
                  <ClassLogo className="w-32 h-32" />
                ) : (
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-sky-400 shadow-2xl">
                    <img src={configLogoUrl} alt="Class Logo" className="w-full h-full object-cover" />
                  </div>
                )}
              </motion.div>

              {/* Spacing Expandable Class Title */}
              <motion.h1 
                initial={{ letterSpacing: "-0.2em", opacity: 0 }}
                animate={{ letterSpacing: "0.15em", opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="font-display font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-indigo-400 uppercase tracking-widest"
              >
                SISFO C '25
              </motion.h1>
              <p className="font-mono text-[10px] tracking-[0.25em] text-sky-400 uppercase opacity-80 mt-2">
                PORTAL CORRIDOR ANGKATAN
              </p>

              {/* Progress track */}
              <div className="w-64 h-1 bg-slate-900/80 rounded-full mt-10 overflow-hidden relative border border-slate-800/40">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${welcomeProgress}%` }}
                ></div>
              </div>

              {/* Loading subtext log */}
              <div className="text-[10px] font-mono text-slate-500 mt-4 tracking-wider uppercase">
                {welcomeStatus}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating ambient theme hexagons in the background */}
      <FloatingHexagons theme={theme} />

      {/* Dynamic Warning Alert on Header */}
      <div className={`border-b py-3 px-4 text-center text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-2 relative z-10 transition-colors duration-300 ${
        theme === "light"
          ? "bg-sky-50/80 border-sky-100 text-sky-700/90"
          : "bg-sky-500/10 border-sky-400/20 text-sky-400"
      }`}>
        <span className="flex items-center gap-1 font-semibold">
          <Database className={`w-4 h-4 ${theme === "light" ? "text-sky-600" : "text-sky-400"}`} /> Mode Preview Interaktif:
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
      <header className={`border-b sticky top-0 z-40 transition-all duration-300 backdrop-blur-md relative ${
        theme === "light"
          ? "border-slate-200 bg-white/90 text-slate-800 shadow-sm"
          : "border-sky-500/15 bg-[#030712]/90 text-slate-350"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
          <div className="flex items-end justify-between md:justify-start gap-4">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("dashboard")}>
              {!configLogoUrl || configLogoUrl.includes("unsplash.com/photo-1618005182384-a83a8bd57fbe") ? (
                <div className="w-11 h-11 transition-transform duration-300 group-hover:scale-110">
                  <ClassLogo className="w-full h-full" />
                </div>
              ) : (
                <div className={`w-11 h-11 rounded-xl border overflow-hidden flex items-center justify-center shrink-0 shadow-lg group transition-transform duration-300 group-hover:scale-110 ${
                  theme === "light" ? "bg-slate-100 border-slate-250" : "bg-sky-950/40 border-sky-500/20"
                }`}>
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
                <span className={`text-[9px] uppercase tracking-[0.25em] font-bold mb-0.5 transition-colors duration-300 ${
                  theme === "light" ? "text-sky-600" : "text-sky-400"
                }`}>Academic Portal</span>
                <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tighter leading-none transition-colors duration-300 ${
                  theme === "light" ? "text-slate-900" : "text-white"
                }`}>
                  SISFO <span className="text-sky-500 font-black">C</span> '25
                </h1>
              </div>
            </div>

            {/* Inline Dashboard quick links */}
            <div className="hidden lg:flex items-center gap-5 ml-8 pb-1">
              <button 
                onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("jadwal")?.scrollIntoView({ behavior: "smooth" }), 100); }} 
                className={`text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                  theme === "light" ? "text-slate-500 hover:text-sky-600" : "text-slate-400 hover:text-blue-400"
                }`}
              >
                Jadwal Kuliah
              </button>
              <button 
                onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("mahasiswa")?.scrollIntoView({ behavior: "smooth" }), 100); }} 
                className={`text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                  theme === "light" ? "text-slate-500 hover:text-sky-600" : "text-slate-400 hover:text-blue-400"
                }`}
              >
                Direktori Mahasiswa
              </button>
              <button 
                onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("galeri")?.scrollIntoView({ behavior: "smooth" }), 100); }} 
                className={`text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                  theme === "light" ? "text-slate-500 hover:text-sky-600" : "text-slate-400 hover:text-blue-400"
                }`}
              >
                Galeri Kenangan
              </button>
            </div>
          </div>

          <div className="flex gap-6 items-center justify-between md:justify-end">
            {/* Dynamic Class Statistics from real states */}
            <div className="hidden sm:flex flex-col items-end">
              <span className={`text-[10px] uppercase tracking-wider font-semibold transition-colors duration-300 ${
                theme === "light" ? "text-slate-400" : "opacity-50 text-slate-450"
              }`}>Class Statistics</span>
              <div className="flex gap-4 mt-1">
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-mono font-bold leading-none transition-colors duration-300 ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}>{configJumlahAnggota}</span>
                  <span className="text-[10px] opacity-60">Anggota</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-mono font-bold leading-none transition-colors duration-300 ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}>{configJadwal.length * 4}</span>
                  <span className="text-[10px] opacity-60">SKS</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-mono font-bold leading-none transition-colors duration-300 ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}>3.82</span>
                  <span className="text-[10px] opacity-60">Avg GPA</span>
                </div>
              </div>
            </div>

            {/* Portal Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Modern Theme Light/Dark Mode Switcher */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-350 text-slate-800"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                }`}
                title={theme === "light" ? "Nyalakan Mode Gelap" : "Nyalakan Mode Terang"}
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4 text-slate-800 animate-pulse" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                )}
              </button>

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
                  className={`border px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                    theme === "light"
                      ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-800"
                      : "bg-[#060b13] hover:bg-white/10 border-white/10 text-white"
                  }`}
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
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              {/* Hero Banner Grid layout - Hexagon Modern Theme */}
              <section className={`relative rounded-3xl overflow-hidden mb-10 py-12 px-6 md:px-12 transition-all duration-300 backdrop-blur-sm ${
                theme === "light"
                  ? "bg-gradient-to-br from-white to-sky-50/45 border border-slate-200/80 shadow-md shadow-slate-200/20 text-slate-800"
                  : "bg-slate-950/40 border border-sky-500/20 shadow-sky-500/5 shadow-2xl"
              }`}>
                <div className="absolute -right-20 -top-20 bg-sky-500/10 w-96 h-96 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-20 -bottom-20 bg-blue-500/10 w-96 h-96 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 grid md:grid-cols-12 items-center gap-8 md:gap-10">
                  <div className="md:col-span-8 flex flex-col gap-5 text-left">
                    <span className={`inline-flex max-w-max text-[10px] font-bold font-mono tracking-widest uppercase px-3 py-1 rounded-full transition-colors duration-300 ${
                      theme === "light"
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    }`}>
                      🔥 WEBSITE KORIDOR ANGKATAN 2025
                    </span>
                    <h1 className={`font-sans font-extrabold text-3xl md:text-5xl tracking-tight leading-none transition-colors duration-300 ${
                      theme === "light" ? "text-slate-900" : "text-white"
                    }`}>
                      Integrated Class Hub <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">SISFO C '25</span>
                    </h1>
                    <p className={`text-sm md:text-base leading-relaxed max-w-2xl transition-colors duration-300 ${
                      theme === "light" ? "text-slate-600" : "text-slate-350"
                    }`}>
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
                        className={`inline-flex items-center gap-1.5 font-semibold text-xs px-5 py-3 rounded-xl border transition-all hover:scale-[1.03] cursor-pointer ${
                          theme === "light"
                            ? "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-705"
                            : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-sky-500/30"
                        }`}
                      >
                        Jadwal Kuliah <ArrowRight className="w-3.5 h-3.5 text-sky-500" />
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
                    
                    <div className={`rounded-2xl p-5 w-full max-w-xs transition-all duration-300 ${
                      theme === "light"
                        ? "bg-white border border-slate-200 shadow-md text-slate-800"
                        : "bg-slate-900/80 border border-sky-500/20 shadow-xl backdrop-blur-md"
                    }`}>
                      <div className="text-center">
                        <span className={`text-[10px] font-mono uppercase tracking-wider block ${
                          theme === "light" ? "text-slate-450" : "text-slate-400"
                        }`}>Anggota Kelas</span>
                        <div className={`font-mono font-black text-5xl mt-1 text-transparent bg-clip-text ${
                          theme === "light"
                            ? "bg-gradient-to-r from-sky-600 to-indigo-600"
                            : "bg-gradient-to-r from-sky-400 to-cyan-300"
                        }`}>
                          {configJumlahAnggota}
                        </div>
                        <span className={`text-[9px] font-mono block mt-1 tracking-wide ${
                          theme === "light" ? "text-sky-650 font-bold" : "text-sky-400/80"
                        }`}>SISTEM INFORMASI C</span>
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
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`mb-12 scroll-mt-24 transition-all duration-300 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl ${
                  theme === "light"
                    ? "bg-white border border-slate-200/85 shadow-slate-200/30"
                    : "bg-slate-950/40 border border-sky-500/15"
                }`}
              >
                <div className={`p-5 border-b flex justify-between items-center transition-colors duration-300 ${
                  theme === "light"
                    ? "border-slate-200 bg-slate-50/70"
                    : "border-sky-500/15 bg-slate-950/60"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Calendar className={`w-4 h-4 animate-pulse ${theme === "light" ? "text-sky-600" : "text-sky-400"}`} />
                    <h2 className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                      theme === "light" ? "text-slate-800" : "text-white"
                    }`}>Weekly Schedule</h2>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase font-mono border transition-all duration-305 ${
                    theme === "light"
                      ? "bg-sky-50 text-sky-600 border-sky-200"
                      : "bg-sky-500/10 text-sky-400 border-sky-500/10"
                  }`}>SEMESTER 4</span>
                </div>

                {configJadwal.length === 0 ? (
                  <div className="p-16 text-center">
                    <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className={`text-sm font-semibold transition-colors duration-300 ${theme === "light" ? "text-slate-800" : "text-white"}`}>Belum Ada Jadwal</h3>
                    <p className={`text-xs mt-1 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Silakan login sebagai admin untuk menambah entri jadwal akademik mingguan.</p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {configJadwal.map((jw, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        whileHover={{ 
                          y: -6, 
                          scale: 1.03, 
                        }}
                        className={`group p-5 transition-colors duration-300 flex flex-col justify-between cursor-pointer rounded-2xl border shadow-md hover:shadow-xl ${
                          theme === "light"
                            ? "bg-white border-slate-200 hover:border-sky-500/45 hover:bg-slate-50/50 hover:shadow-sky-500/15"
                            : "bg-slate-950/40 backdrop-blur-md border-sky-500/10 hover:border-sky-500/40 hover:bg-slate-900/50 hover:backdrop-blur-lg hover:shadow-sky-500/20"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className={`text-[10px] font-bold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded transition-all duration-305 ${
                              theme === "light"
                                ? "bg-sky-50 text-sky-600"
                                : "bg-sky-500/10 text-sky-400"
                            }`}>
                              {jw.hari || "HARI -"} &bull; {jw.jam || "JAM -"}
                            </span>
                            <span className={`text-[10px] font-mono italic flex items-center gap-1 transition-colors duration-305 ${
                              theme === "light" ? "text-slate-400" : "opacity-50 text-slate-300"
                            }`}>
                              <MapPin className={`w-3 h-3 ${theme === "light" ? "text-sky-600" : "text-sky-400"}`} /> {jw.ruang || "-"}
                            </span>
                          </div>
                          <div className={`text-base font-bold transition-colors line-clamp-1 mb-2 ${
                            theme === "light"
                              ? "text-slate-800 group-hover:text-sky-600"
                              : "text-white group-hover:text-sky-400"
                          }`}>
                            {jw.matkul || "Mata Kuliah -"}
                          </div>
                          <div className={`text-xs flex items-center gap-1.5 pt-2 border-t transition-colors duration-305 ${
                            theme === "light" ? "border-slate-150 text-slate-500" : "border-sky-500/5 opacity-60"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${theme === "light" ? "bg-sky-500" : "bg-sky-400"}`}></span>
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
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`mb-12 scroll-mt-24 transition-all duration-300 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl ${
                  theme === "light"
                    ? "bg-white border border-slate-200/85 shadow-slate-200/30"
                    : "bg-slate-950/40 border border-sky-500/15"
                }`}
              >
                <div className={`p-5 border-b flex justify-between items-center transition-colors duration-300 ${
                  theme === "light"
                    ? "border-slate-200 bg-slate-50/70"
                    : "border-sky-500/15 bg-slate-950/60"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Users className={`w-4 h-4 animate-pulse ${theme === "light" ? "text-sky-600" : "text-sky-400"}`} />
                    <h2 className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                      theme === "light" ? "text-slate-800" : "text-white"
                    }`}>Student Directory</h2>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase font-mono border transition-all duration-305 ${
                    theme === "light"
                      ? "bg-sky-50 text-sky-600 border-sky-200"
                      : "bg-sky-500/10 text-sky-400 border-sky-500/10"
                  }`}>
                    TOTAL: {configStudents.length} PROFIL
                  </span>
                </div>

                {configStudents.length > 0 && (
                  <div className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                    theme === "light" ? "bg-slate-50/40 border-slate-205" : "bg-slate-900/20 border-sky-500/10"
                  }`}>
                    <div className="relative flex-1 max-w-md w-full">
                      <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        theme === "light" ? "text-sky-600/70" : "text-sky-400/65"
                      }`}>
                        <Search className="w-4 h-4" />
                      </span>
                      <input 
                        type="text" 
                        placeholder="Cari nama atau bio mahasiswa..."
                        value={mhsSearchQuery}
                        onChange={(e) => setMhsSearchQuery(e.target.value)}
                        className={`w-full border rounded-xl py-2 pl-10 pr-9 text-xs font-semibold focus:outline-none focus:ring-1 transition-all font-sans ${
                          theme === "light"
                            ? "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-sky-500"
                            : "bg-slate-950/60 border-sky-500/15 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500"
                        }`}
                      />
                      {mhsSearchQuery && (
                        <button 
                          onClick={() => setMhsSearchQuery("")}
                          aria-label="Clear search"
                          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer ${
                            theme === "light" ? "text-slate-400 hover:text-slate-800" : "text-slate-500 hover:text-white"
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 text-[10px] font-mono ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>
                      <span>Hasil filter:</span>
                      <span className={`px-2.5 py-0.5 rounded border font-bold max-w-max transition-colors duration-350 ${
                        theme === "light"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "text-sky-400 bg-sky-500/10 border-sky-500/10"
                      }`}>
                        {filteredStudents.length} dari {configStudents.length}
                      </span>
                    </div>
                  </div>
                )}

                {configStudents.length === 0 ? (
                  <div className="p-16 text-center">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className={`text-sm font-semibold transition-colors duration-305 ${theme === "light" ? "text-slate-800" : "text-white"}`}>Database Mahasiswa Kosong</h3>
                    <p className={`text-xs mt-1 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Masuk ke Panel Admin untuk menambah data profil mahasiswa.</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-16 text-center">
                    <Search className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
                    <h3 className={`text-sm font-semibold transition-colors duration-305 ${theme === "light" ? "text-slate-800" : "text-white"}`}>Tidak Menemukan Profil</h3>
                    <p className={`text-xs mt-1 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Pencarian untuk "{mhsSearchQuery}" tidak cocok dengan data classmate manapun.</p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                    {filteredStudents.map((agt, i) => (
                      <StudentCard key={i} agt={agt} index={i} theme={theme} />
                    ))}
                  </div>
                )}
              </motion.section>

              {/* Memory Album Media Section - Aesthetic Photo Carousel */}
              <motion.section 
                id="galeri" 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={`mb-6 scroll-mt-24 transition-all duration-300 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl ${
                  theme === "light"
                    ? "bg-white border border-slate-200/85 shadow-slate-200/30"
                    : "bg-slate-950/40 border border-sky-500/15"
                }`}
              >
                <div className={`p-5 border-b flex justify-between items-center transition-colors duration-300 ${
                  theme === "light"
                    ? "border-slate-200 bg-slate-50/70"
                    : "border-sky-500/15 bg-slate-950/60"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Images className={`w-4 h-4 animate-pulse ${theme === "light" ? "text-sky-600" : "text-sky-400"}`} />
                    <h2 className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                      theme === "light" ? "text-slate-800" : "text-white"
                    }`}>Class Gallery</h2>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase font-mono border transition-all duration-305 ${
                    theme === "light"
                      ? "bg-sky-50 text-sky-600 border-sky-200"
                      : "bg-sky-500/10 text-sky-400 border-sky-500/10"
                  }`}>MEDIA ARCHIVE</span>
                </div>

                {configMedia.length === 0 ? (
                  <div className="p-16 text-center">
                    <Images className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className={`text-sm font-semibold transition-colors duration-305 ${theme === "light" ? "text-slate-800" : "text-white"}`}>Album Belum Terisi</h3>
                    <p className={`text-xs mt-1 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Tautkan media kenangan kelas Anda di menu panel admin.</p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {configMedia.map((med, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 35 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.7, delay: idx * 0.08, ease: [0.21, 1.02, 0.43, 1.01] }}
                        whileHover={{ 
                          y: -6, 
                          scale: 1.03, 
                        }}
                        onClick={() => {
                          if (med.url) {
                            window.open(med.url, "_blank", "noopener,noreferrer");
                          }
                        }}
                        className={`overflow-hidden group flex flex-col justify-between transition-colors duration-300 cursor-pointer rounded-2xl border shadow-md hover:shadow-xl ${
                          theme === "light"
                            ? "bg-white border-slate-200 hover:border-sky-500/45 hover:bg-slate-50/50 hover:shadow-sky-500/15"
                            : "bg-slate-950/40 backdrop-blur-md border-sky-500/10 hover:border-sky-500/40 hover:bg-slate-900/50 hover:backdrop-blur-lg hover:shadow-sky-500/20"
                        }`}
                      >
                        <div className={`relative aspect-[16/9] w-full bg-slate-950 overflow-hidden shrink-0 border-b ${
                          theme === "light" ? "border-slate-100" : "border-sky-500/10"
                        }`}>
                          {med.tipe === "video" ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-4 select-none">
                              {/* Glowing background gradient inside video card */}
                              <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-slate-950 to-slate-950 pointer-events-none" />
                              <div className="relative p-3 rounded-full bg-violet-600/15 text-violet-400 border border-violet-500/20 group-hover:bg-violet-600 group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all duration-300 mb-2">
                                <Video className="w-5 h-5 animate-pulse" />
                              </div>
                              <span className="relative text-[9px] font-mono font-bold text-violet-400 tracking-wider uppercase mb-1">
                                VIDEO MEMORY
                              </span>
                              <span className="relative text-[9px] text-slate-400 text-center line-clamp-1 max-w-[85%] font-mono">
                                {med.url.replace(/^https?:\/\/(www\.)?/, "")}
                              </span>
                              
                              <div className="absolute top-2.5 right-2.5 bg-violet-500/10 border border-violet-500/20 rounded px-1.5 py-0.5 text-[8px] font-mono font-bold text-violet-400 tracking-wider flex items-center gap-1">
                                <ExternalLink className="w-2.5 h-2.5" /> BUKA TAUTAN
                              </div>
                            </div>
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
                        <div className={`p-4 flex-grow transition-colors duration-300 ${
                          theme === "light" ? "bg-slate-50/30" : "bg-slate-950/20"
                        }`}>
                          <p className={`text-xs leading-relaxed line-clamp-2 italic ${
                            theme === "light" ? "text-slate-600 font-medium" : "text-slate-350"
                          }`}>
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
              key="login"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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

              {/* Supabase Connectivity Status Card */}
              <div className={`p-6 rounded-3xl border mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 ${
                isSupabaseConfigured 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                  : "bg-amber-500/5 border-amber-500/20 text-amber-300"
              }`}>
                <div className="flex-grow w-full">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border shrink-0 ${
                      isSupabaseConfigured
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-white text-base">
                        {isSupabaseConfigured 
                          ? "Status: Terhubung ke Supabase Cloud (Live)" 
                          : "Status: Menjalankan Local Sandbox"}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {isSupabaseConfigured
                          ? "Data akademik, jadwal, mahasiswa, dan galeri tersinkronisasi dua arah ke Supabase Cloud."
                          : "Kunci Supabase belum dipasang. Silakan gunakan local preview atau ikuti panduan di bawah untuk menyambungkan database awan."}
                      </p>
                    </div>
                  </div>
                  
                  {!isSupabaseConfigured && (
                    <div className="mt-4 p-4 bg-[#060b13] border border-slate-800 rounded-2xl text-slate-300 text-xs font-sans space-y-3">
                      <p className="font-bold text-amber-400 flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-400 shrink-0" />
                        Panduan Menghubungkan Supabase Cloud secara Live:
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-slate-400 pl-1 leading-relaxed">
                        <li>Buka proyek <strong>Supabase</strong> Anda, lalu navigasikan ke <strong>Project Settings &gt; API</strong>.</li>
                        <li>Ambil <strong>Project URL</strong> dan masukkan ke AI Studio sebagai secret <code>VITE_SUPABASE_URL</code>.</li>
                        <li>Ambil <strong>anon public API Key</strong> dan masukkan ke AI Studio sebagai secret <code>VITE_SUPABASE_ANON_KEY</code>.</li>
                        <li>
                          Buka tab <strong>SQL Editor</strong> di Supabase Anda, buat kueri baru (New Query), masukkan kode SQL berikut untuk membuat tabel-tabel, lalu klik <strong>Run</strong>:
                          <pre className="mt-2 bg-slate-950 p-3.5 rounded-xl font-mono text-[10px] text-emerald-400 overflow-x-auto border border-slate-850 select-all leading-normal whitespace-pre block max-h-48 overflow-y-auto">
{`-- 1. Tabel untuk metadata dasar
create table if not exists public.sisfo_settings (
  id text primary key,
  jumlah_anggota integer default 12,
  logo_url text,
  jadwal jsonb
);

-- 2. Tabel untuk profil mahasiswa
create table if not exists public.sisfo_students (
  id text primary key,
  nama text not null,
  foto text,
  bio text
);

-- 3. Tabel untuk galeri media
create table if not exists public.sisfo_media (
  id uuid default gen_random_uuid() primary key,
  tipe text not null,
  url text not null,
  keterangan text
);`}
                          </pre>
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

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
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky bottom-4 z-30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
                  <div className="flex flex-col gap-1 text-xs text-slate-400 font-sans text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? "bg-emerald-400 animate-pulse" : "bg-orange-400"}`}></div>
                      <span className="font-mono text-[11px] font-semibold">
                        {isSupabaseConfigured 
                          ? "SINKRONISASI SUPABASE CLOUD AKTIF" 
                          : "SINKRONISASI BROWSER LOCAL STORAGE (SUPABASE BELUM AKTIF)"}
                      </span>
                    </div>
                    {supabaseSyncError && (
                      <p className="text-red-400 text-[11px] leading-tight mt-0.5 max-w-xl">{supabaseSyncError}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                    <button 
                      type="button"
                      onClick={() => setView("dashboard")}
                      disabled={isSyncingWithSupabase}
                      className="w-1/2 md:w-auto text-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:bg-slate-750 px-5 py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSyncingWithSupabase}
                      className="w-1/2 md:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs md:text-sm px-6 py-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-80"
                    >
                      {isSyncingWithSupabase ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Menyinkronkan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> 
                          <span>{isSupabaseConfigured ? "Simpan ke Supabase" : "Simpan Lokal"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            </motion.main>
          )}

          {/* VIEW: PHP Code Tab Viewer */}
          {view === "code_viewer" && (
            <motion.main 
              key="code_viewer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              <div className="mb-8">
                <span className={`text-xs px-3 py-1.5 rounded-full font-mono border uppercase font-bold transition-all duration-300 ${
                  theme === "light"
                    ? "bg-sky-50 text-sky-700 border-sky-200"
                    : "bg-sky-500/10 text-sky-400 border-sky-400/20"
                }`}>
                  Arsitektur Ekspor Vercel PHP + Supabase
                </span>
                <h1 className={`font-display font-extrabold text-2xl md:text-4xl mt-3 transition-colors duration-300 ${
                  theme === "light" ? "text-slate-900" : "text-white"
                }`}>Native PHP Code Explorer</h1>
                <p className={`text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed transition-colors duration-300 ${
                  theme === "light" ? "text-slate-600" : "text-slate-400"
                }`}>
                  Kami telah membuat seluruh berkas PHP yang Anda butuhkan secara lengkap, andal, modular, dan terstruktur sesuai rancangan stateless serverless Vercel dan Supabase PostgreSQL. Anda dapat menyalin kode instan ini untuk disinkronkan ke repositori Anda!
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Navigator Rail left */}
                <div className="lg:col-span-3 flex flex-col gap-2">
                  <span className={`text-[10px] font-mono tracking-wider font-bold uppercase mb-1 transition-colors ${
                    theme === "light" ? "text-slate-400" : "text-slate-500"
                  }`}>Daftar Berkas PHP</span>
                  {Object.keys(PHP_SOURCES).map((fileName) => (
                    <button
                      key={fileName}
                      onClick={() => setActivePHPFile(fileName as any)}
                      className={`w-full text-left font-mono text-xs px-4 py-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        activePHPFile === fileName
                          ? theme === "light"
                            ? "bg-sky-50 border-sky-300 text-sky-700 font-bold"
                            : "bg-sky-500/10 border-sky-500/30 text-sky-400 font-bold"
                          : theme === "light"
                            ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
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

                  <div className={`mt-4 p-4 rounded-2xl border text-xs leading-normal transition-all duration-300 ${
                    theme === "light"
                      ? "bg-indigo-50/50 border-indigo-100 text-indigo-900"
                      : "bg-indigo-500/5 border-indigo-500/10 text-indigo-400"
                  }`}>
                    <span className={`font-bold flex items-center gap-1.5 mb-1 ${
                      theme === "light" ? "text-indigo-600" : "text-indigo-400"
                    }`}>
                      <Database className="w-4 h-4" /> PDO PostgreSQL
                    </span>
                    Tabel <code className={`px-1 py-0.5 rounded text-[11px] ${theme === "light" ? "bg-slate-200/60 text-slate-800" : "bg-slate-950 text-amber-200"}`}>settings</code> dan <code className={`px-1 py-0.5 rounded text-[11px] ${theme === "light" ? "bg-slate-200/60 text-slate-800" : "bg-slate-950 text-amber-200"}`}>anggotas</code> terintegrasi otomatis dengan skema inisialisasi awal.
                  </div>
                </div>

                {/* Code Window right */}
                <div className="lg:col-span-9 flex flex-col gap-3">
                  <div className={`flex items-center justify-between px-6 py-4 rounded-t-2xl border-x border-t transition-all duration-300 ${
                    theme === "light"
                      ? "bg-slate-50 border-slate-205"
                      : "bg-slate-900 border-slate-800"
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className={`text-xs font-mono ml-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{activePHPFile}</span>
                    </div>
                    
                    <button
                      onClick={() => handleCopyCode(activePHPFile)}
                      className={`inline-flex items-center gap-2 transition-colors text-xs font-medium px-4 py-2 rounded-lg border cursor-pointer ${
                        theme === "light"
                          ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700"
                      }`}
                    >
                      {copiedFileName === activePHPFile ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin Kode</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className={`border-x border-b rounded-b-2xl p-6 font-mono text-xs overflow-auto max-h-[550px] leading-relaxed pointer-events-auto select-all transition-all duration-305 ${
                    theme === "light"
                      ? "bg-slate-900 border-slate-205 text-slate-100"
                      : "bg-slate-950 border-slate-800 text-slate-350"
                  }`}>
                    <pre>{PHP_SOURCES[activePHPFile]}</pre>
                  </div>
                </div>
              </div>
            </motion.main>
          )}

        </AnimatePresence>
      </div>

      {/* Main footer layout matching PHP dashboard */}
      <footer className={`border-t py-10 shrink-0 transition-colors duration-300 ${
        theme === "light"
          ? "border-slate-200 bg-slate-50"
          : "border-slate-850 bg-[#060b13]"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left text-xs md:text-sm text-slate-500 font-mono">
          <div>
            <p>&copy; 2026 SISFO C '25. Sistem Informasi Kelas C 2025.</p>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-end">
            <button onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("jadwal")?.scrollIntoView({ behavior: "smooth" }), 100); }} className={`transition-colors cursor-pointer ${theme === "light" ? "hover:text-slate-800 text-slate-500" : "hover:text-slate-300 text-slate-500"}`}>Jadwal</button>
            <button onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("mahasiswa")?.scrollIntoView({ behavior: "smooth" }), 100); }} className={`transition-colors cursor-pointer ${theme === "light" ? "hover:text-slate-800 text-slate-500" : "hover:text-slate-300 text-slate-500"}`}>Mahasiswa</button>
            <button onClick={() => { setView("dashboard"); setTimeout(() => document.getElementById("galeri")?.scrollIntoView({ behavior: "smooth" }), 100); }} className={`transition-colors cursor-pointer ${theme === "light" ? "hover:text-slate-800 text-slate-500" : "hover:text-slate-300 text-slate-500"}`}>Galeri</button>
            <button onClick={() => setView("login")} className="text-sky-600 hover:text-sky-500 transition-colors font-semibold cursor-pointer">Gateway Admin</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
