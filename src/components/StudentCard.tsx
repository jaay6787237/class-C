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
        scale: 1.04,
        borderColor: theme === "light" ? "rgba(14, 165, 233, 0.45)" : "rgba(56, 189, 248, 0.45)", 
        boxShadow: theme === "light"
          ? "0 10px 25px -5px rgba(14, 165, 233, 0.15)"
          : "0 20px 48px -15px rgba(56, 189, 248, 0.35)" 
      }}
      className={`relative flex items-center gap-4.5 p-3.5 backdrop-blur-md rounded-2xl border transition-all duration-300 ease-out cursor-pointer shadow-lg overflow-hidden group ${
        theme === "light"
          ? "bg-white/80 border-slate-200/80 hover:bg-slate-50/90 text-slate-750"
          : "bg-slate-950/45 border-sky-500/10 hover:bg-slate-900/40 hover:backdrop-blur-lg"
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

      {/* Floating 3D Avatar Area */}
      <div 
        style={{ transform: "translateZ(25px)" }}
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 shadow-inner group-hover:border-sky-450 transition-colors duration-300 ${
          theme === "light"
            ? "bg-slate-100 border border-slate-200 text-sky-600"
            : "bg-sky-950/50 border border-sky-500/30 text-sky-400"
        }`}
      >
        {agt.foto ? (
          <img 
            src={agt.foto} 
            referrerPolicy="no-referrer" 
            alt={agt.nama} 
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-115" 
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300";
            }}
          />
        ) : (
          <span className="transition-transform duration-500 group-hover:scale-110">
            {agt.nama ? agt.nama.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "SI"}
          </span>
        )}
      </div>

      {/* Structured Info Block with Depth offset */}
      <div 
        style={{ transform: "translateZ(15px)" }} 
        className="min-w-0 flex-1 z-10"
      >
        <div 
          className={`text-sm font-bold truncate transition-colors duration-300 ${
            theme === "light" 
              ? "text-slate-800 group-hover:text-sky-600" 
              : "text-white group-hover:text-sky-300"
          }`}
          title={agt.nama}
        >
          {agt.nama || "Nama Mahasiswa"}
        </div>
        <div 
          className={`text-[10px] truncate mt-0.5 leading-tight font-medium font-mono tracking-wide ${
            theme === "light" ? "text-slate-500" : "text-sky-400/80"
          }`}
          title={agt.bio}
        >
          {agt.bio || "Sistem Informasi C '25"}
        </div>
      </div>
    </motion.div>
  );
}
