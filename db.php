<?php
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
