import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Student } from "../types";

interface StudentCardProps {
  agt: Student;
  index: number;
  key?: React.Key | null;
  theme?: "dark" | "light";
}

export function StudentCard({ agt, index, theme = "dark" }: StudentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize mouse coordinate values
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth springs for high performance physics-based feedback
  const springOptions = { damping: 22, stiffness: 260, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [0, 1], [15, -15]), springOptions);
  const rotateY = useSpring(useTransform(x, [0, 1], [-15, 15]), springOptions);

  // Gleam lighting effect position transforms
  const gleamX = useTransform(x, [0, 1], ["0%", "100%"]);
  const gleamY = useTransform(y, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized cursor coordinate values from 0.0 to 1.0 (relative to the cards box)
    const normalizedX = (event.clientX - rect.left) / width;
    const normalizedY = (event.clientY - rect.top) / height;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.04 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
      whileHover={{ 
        scale: 1.03,
      }}
      className={`relative flex flex-col h-full rounded-2xl border transition-all duration-300 ease-out cursor-pointer shadow-lg overflow-hidden group hover:shadow-2xl ${
        theme === "light"
          ? "bg-white/80 border-slate-200/80 hover:border-sky-500/45 hover:bg-slate-50/90 text-slate-750 hover:shadow-sky-500/15"
          : "bg-slate-950/45 border-sky-500/10 hover:border-sky-500/40 hover:bg-slate-900/40 hover:backdrop-blur-lg hover:shadow-sky-500/20"
      }`}
    >
      {/* Dynamic specular light reflection sheen */}
      <motion.div 
        style={{
          background: "radial-gradient(circle 80px at var(--x, 50%) var(--y, 50%), rgba(56, 189, 248, 0.15) 0%, transparent 80%)",
          left: gleamX,
          top: gleamY,
          transform: "translate(-50%, -50%)"
        }}
        className="absolute w-48 h-48 pointer-events-none rounded-full z-10 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* Floating 3D Avatar Area - Image on Top */}
      <div 
        style={{ transform: "translateZ(25px)" }}
        className={`relative aspect-[1/1.05] w-full overflow-hidden shrink-0 border-b transition-colors duration-300 ${
          theme === "light"
            ? "bg-slate-50 border-slate-200/80"
            : "bg-slate-950 border-sky-500/10"
        }`}
      >
        {agt.foto ? (
          <img 
            src={agt.foto} 
            referrerPolicy="no-referrer" 
            alt={agt.nama} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108" 
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300";
            }}
          />
        ) : (
          <div className={`absolute inset-0 flex flex-col items-center justify-center font-bold ${
            theme === "light" ? "text-sky-600 bg-slate-100" : "text-sky-400 bg-sky-950/20"
          }`}>
            <span className="text-2xl font-mono transition-transform duration-500 group-hover:scale-110">
              {agt.nama ? agt.nama.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "SI"}
            </span>
          </div>
        )}
      </div>

      {/* Structured Info Block with Depth offset */}
      <div 
        style={{ transform: "translateZ(15px)" }} 
        className="p-4.5 flex-grow flex flex-col justify-between z-10"
      >
        <div className="flex flex-col gap-2">
          <div 
            className={`text-sm sm:text-base font-bold truncate transition-colors duration-300 ${
              theme === "light" 
                ? "text-slate-800 group-hover:text-sky-600" 
                : "text-white group-hover:text-sky-300"
            }`}
            title={agt.nama}
          >
            {agt.nama || "Nama Mahasiswa"}
          </div>
          <div 
            className={`text-xs italic line-clamp-3 leading-relaxed transition-colors duration-300 ${
              theme === "light" ? "text-slate-500" : "text-slate-400"
            }`}
            title={agt.bio}
          >
            "{agt.bio || "Mahasiswa aktif Sistem Informasi Angkatan 2025."}"
          </div>
        </div>

        <div className={`border-t mt-4 pt-3 flex items-center justify-between text-[10px] font-mono tracking-wide ${
          theme === "light" ? "border-slate-100 text-slate-400" : "border-slate-900 text-slate-500"
        }`}>
          <span>ANAK KELAS C</span>
          <span className="text-sky-400">#ACTIVE</span>
        </div>
      </div>
    </motion.div>
  );
}
