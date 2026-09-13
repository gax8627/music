import React from 'react';
import { motion } from 'framer-motion';

export interface CardVisualizerCoverProps {
  isPlaying: boolean;
  trackNumber: number | string;
  bgGradient?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Pre-calculated bar configurations for organic frequency simulation
const BARS_MD = [
  { min: 15, max: 75, speed: 0.45, delay: 0.05 },
  { min: 20, max: 95, speed: 0.38, delay: 0.12 },
  { min: 10, max: 60, speed: 0.52, delay: 0.08 },
  { min: 25, max: 100, speed: 0.42, delay: 0.20 },
  { min: 30, max: 85, speed: 0.35, delay: 0.03 },
  { min: 18, max: 90, speed: 0.48, delay: 0.15 },
  { min: 22, max: 70, speed: 0.55, delay: 0.25 },
  { min: 28, max: 98, speed: 0.40, delay: 0.10 },
  { min: 15, max: 80, speed: 0.46, delay: 0.18 },
  { min: 32, max: 92, speed: 0.37, delay: 0.07 },
  { min: 12, max: 65, speed: 0.50, delay: 0.22 },
  { min: 20, max: 85, speed: 0.44, delay: 0.14 },
];

const BARS_LG = [
  { min: 12, max: 65, speed: 0.42, delay: 0.02 },
  { min: 18, max: 82, speed: 0.36, delay: 0.08 },
  { min: 25, max: 95, speed: 0.48, delay: 0.15 },
  { min: 15, max: 70, speed: 0.52, delay: 0.05 },
  { min: 30, max: 100, speed: 0.39, delay: 0.22 },
  { min: 22, max: 88, speed: 0.45, delay: 0.12 },
  { min: 14, max: 60, speed: 0.55, delay: 0.28 },
  { min: 28, max: 92, speed: 0.41, delay: 0.07 },
  { min: 35, max: 98, speed: 0.37, delay: 0.18 },
  { min: 20, max: 80, speed: 0.47, delay: 0.11 },
  { min: 16, max: 72, speed: 0.50, delay: 0.25 },
  { min: 32, max: 96, speed: 0.43, delay: 0.04 },
  { min: 24, max: 85, speed: 0.46, delay: 0.16 },
  { min: 18, max: 68, speed: 0.53, delay: 0.21 },
  { min: 26, max: 90, speed: 0.38, delay: 0.09 },
  { min: 15, max: 75, speed: 0.49, delay: 0.14 },
];

export const CardVisualizerCover: React.FC<CardVisualizerCoverProps> = ({
  isPlaying,
  trackNumber,
  bgGradient = '#3B82F6',
  title = '',
  size = 'md',
  className = '',
}) => {
  const formattedTrack = String(trackNumber).padStart(2, '0');

  // Small size: 40x40 thumbnail for song list
  if (size === 'sm') {
    return (
      <div
        title={title}
        className={`w-10 h-10 rounded-lg bg-zinc-950 border border-white/20 shadow-sm relative overflow-hidden flex items-end justify-center gap-0.5 p-1 select-none ${className}`}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: `radial-gradient(circle at top, ${bgGradient}, transparent 80%)` }}
        />
        {[0.4, 0.7, 0.5, 0.8, 0.35].map((h, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-gradient-to-t from-blue-500 to-indigo-300"
            animate={{
              height: isPlaying ? [`${h * 25}%`, `${h * 100}%`, `${h * 40}%`] : `${h * 40}%`,
            }}
            transition={{
              duration: 0.4 + i * 0.1,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  }

  // Large size: VIP Private View cover
  if (size === 'lg') {
    return (
      <div
        title={title}
        className={`relative z-10 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 bg-zinc-950 flex-shrink-0 flex flex-col justify-between p-4 sm:p-5 select-none ${className}`}
      >
        {/* Ambient Gradient Glow */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none blur-xl"
          style={{
            background: `radial-gradient(circle at center, ${bgGradient}, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/60 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-white/90 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            TRK #{formattedTrack}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
              }`}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
              {isPlaying ? 'AUDIO LIVE' : 'STUDIO MASTER'}
            </span>
          </div>
        </div>

        {/* Center Dynamic Equalizer Spectrum */}
        <div className="relative z-10 w-full h-24 sm:h-28 flex items-end justify-center gap-1 sm:gap-1.5 px-1">
          {BARS_LG.map((bar, i) => (
            <motion.div
              key={i}
              className="flex-1 max-w-[8px] rounded-full bg-gradient-to-t from-blue-600 via-indigo-400 to-white shadow-sm"
              animate={{
                height: isPlaying ? [`${bar.min}%`, `${bar.max}%`, `${bar.min + 15}%`] : `${bar.min + 10}%`,
              }}
              transition={{
                duration: bar.speed,
                delay: bar.delay,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 flex items-center justify-between w-full border-t border-white/10 pt-2">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase font-bold text-white/70 truncate max-w-[120px]">
            {title ? title : 'RG MUSIC'}
          </span>
          <span className="font-mono text-[10px] text-white/50">
            33 ⅓ RPM · 180G WAX
          </span>
        </div>
      </div>
    );
  }

  // Default Medium size: Carousel Card cover (128x128 to 144x144px)
  return (
    <div
      title={title}
      className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/10 bg-zinc-950 flex-shrink-0 flex flex-col justify-between p-3 select-none transition-transform duration-500 hover:scale-105 ${className}`}
    >
      {/* Ambient Gradient Glow */}
      <div
        className="absolute inset-0 opacity-35 pointer-events-none blur-lg"
        style={{
          background: `radial-gradient(circle at top center, ${bgGradient}, transparent 75%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/60 pointer-events-none" />

      {/* Top Row: Track Number & Status Dot */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-white/90 bg-white/10 border border-white/15 px-2 py-0.5 rounded-full backdrop-blur-sm">
          TRK {formattedTrack}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
          }`}
        />
      </div>

      {/* Center Dynamic Equalizer Visualizer Spectrum */}
      <div className="relative z-10 w-full h-16 sm:h-18 flex items-end justify-center gap-1 sm:gap-1.5 px-0.5">
        {BARS_MD.map((bar, i) => (
          <motion.div
            key={i}
            className="flex-1 max-w-[7px] rounded-full bg-gradient-to-t from-blue-500 via-indigo-300 to-white shadow-sm"
            animate={{
              height: isPlaying ? [`${bar.min}%`, `${bar.max}%`, `${bar.min + 12}%`] : `${bar.min + 8}%`,
            }}
            transition={{
              duration: bar.speed,
              delay: bar.delay,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Bottom Row: Audiophile Stamp */}
      <div className="relative z-10 flex items-center justify-between w-full border-t border-white/10 pt-1.5">
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase font-bold text-white/70">
          RG MUSIC
        </span>
        <span className="font-mono text-[8px] text-white/40">
          33 RPM
        </span>
      </div>
    </div>
  );
};

// Center Vinyl Record Label (Replaces stock image on the spinning vinyl record disc)
export interface VinylCenterLabelProps {
  trackNumber: number | string;
  size?: 'sm' | 'md' | 'lg';
}

export const VinylCenterLabel: React.FC<VinylCenterLabelProps> = ({
  trackNumber,
  size = 'md',
}) => {
  const formatted = String(trackNumber).padStart(2, '0');

  if (size === 'lg') {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-zinc-700/80 shadow-inner relative flex flex-col items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-950 select-none p-1">
        <div className="absolute inset-1 rounded-full border border-zinc-600/40 pointer-events-none" />
        <span className="font-mono text-[7px] tracking-widest text-zinc-400 uppercase font-bold">
          RG MUSIC
        </span>
        <span className="font-mono text-[11px] font-bold text-white tracking-wider my-0.5">
          #{formatted}
        </span>
        <span className="font-mono text-[6px] tracking-wider text-zinc-500">
          33 ⅓ RPM
        </span>
        <div className="absolute w-4 h-4 rounded-full bg-zinc-950 border border-white/60 shadow-inner" />
      </div>
    );
  }

  // Medium (Card) size
  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-zinc-700/80 shadow-inner relative flex flex-col items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-950 select-none p-0.5">
      <div className="absolute inset-1 rounded-full border border-zinc-600/40 pointer-events-none" />
      <span className="font-mono text-[6px] tracking-widest text-zinc-400 uppercase font-bold">
        RG
      </span>
      <span className="font-mono text-[9px] font-bold text-white tracking-wider my-0.5">
        #{formatted}
      </span>
      <span className="font-mono text-[5px] text-zinc-500">
        33 RPM
      </span>
      <div className="absolute w-3 h-3 rounded-full bg-zinc-950 border border-white/60 shadow-inner" />
    </div>
  );
};

export default CardVisualizerCover;
