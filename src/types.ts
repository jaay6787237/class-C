export interface Course {
  hari: string;
  matkul: string;
  jam: string;
  ruang: string;
  dosen: string;
}

export interface Student {
  id: string; // empty/string for newly created, numeric string for synced
  nama: string;
  foto: string;
  bio: string;
}

export interface MediaItem {
  tipe: 'gambar' | 'video';
  url: string;
  keterangan: string;
}

export interface Settings {
  jumlah_anggota: number;
  jadwal: Course[];
  media: MediaItem[];
}
