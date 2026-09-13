import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Headphones, Calendar } from 'lucide-react';
import Waveform from './Waveform';
import { formatTime } from '../data/tracks';

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number | string;
  durationFormatted?: string;
  createdDate?: string;
  createdDateISO?: string;
  plays?: number;
  playsFormatted?: string;
  bgGradient?: string;
  headerText?: string;
  subText?: string;
  src?: string;
  edition?: string;
  currentTime?: string | number;
}

export interface CardProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  index?: number;
  isBackground?: boolean;
  isActive?: boolean;
  className?: string;
}

export default function Card({
  song,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  isBackground = false,
  isActive = false,
  className = '',
}: CardProps) {
  const isExpanded = isPlaying || isActive;
  const playCount = typeof song.plays === 'number' ? song.plays : 0;
  const playLabel = `${playCount} ${playCount === 1 ? 'play' : 'plays'}`;

  return (
    <div
      onClick={() => {
        if (!isBackground) {
          onTogglePlay();
        }
      }}
      className={`relative w-[280px] sm:w-[320px] md:w-[340px] h-[385px] sm:h-[415px] flex-shrink-0 bg-white/95 rounded-[28px] overflow-hidden flex flex-col justify-between p-5 sm:p-6 border border-white/80 transition-all duration-300 select-none ${
        isExpanded
          ? 'scale-105 sm:scale-[1.08] ring-2 ring-blue-600/80 shadow-[0_25px_60px_-10px_rgba(29,78,216,0.35)] z-20 opacity-100'
          : 'scale-95 sm:scale-100 opacity-80 hover:opacity-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 z-10'
      } ${
        isBackground
          ? 'brightness-95 grayscale-[0.2] pointer-events-none shadow-none'
          : 'cursor-pointer'
      } ${className}`}
    >
      {/* Dynamic Background subtle gradient */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none transition-colors duration-500"
        style={{
          background: `linear-gradient(135deg, ${song.bgGradient || '#dbeafe'}, #ffffff 70%)`,
        }}
      />
      <div className="absolute inset-0 rounded-[28px] pointer-events-none ring-1 ring-black/5" />

      {/* Top Section: Album Artwork + Sliding Vinyl Record */}
      <div className="relative z-10 flex items-center justify-center pt-1 pb-1">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
          {/* Vinyl Record (hidden behind album jacket when not playing, slides out when playing) */}
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-zinc-950 shadow-2xl flex items-center justify-center pointer-events-none"
            initial={false}
            animate={{
              x: isPlaying ? 30 : 0,
              opacity: isPlaying ? 1 : 0,
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ zIndex: 0 }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center relative"
              style={{ animation: isPlaying ? 'spin 4s linear infinite' : 'none' }}
            >
              {/* Concentric Grooves */}
              <div className="absolute inset-2 rounded-full border border-zinc-800/80" />
              <div className="absolute inset-4 rounded-full border border-zinc-800/60" />
              <div className="absolute inset-6 rounded-full border border-zinc-800/50" />
              <div className="absolute inset-8 rounded-full border border-zinc-800/40" />
              <div className="absolute inset-10 rounded-full border border-zinc-800/30" />

              {/* Center Record Label */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-zinc-700/80 shadow-inner relative flex items-center justify-center">
                <img
                  src={song.cover}
                  alt=""
                  className="w-full h-full object-cover select-none"
                />
                <div className="absolute w-3 h-3 rounded-full bg-zinc-950 border border-white/60 shadow-inner" />
              </div>
            </div>
          </motion.div>

          {/* Front Album Jacket Cover */}
          <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/10 bg-zinc-100 flex-shrink-0">
            <img
              src={song.cover}
              alt={song.title}
              className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Middle Section: Tag ("Demo"), Prominent Song Name, and Artist */}
      <div className="relative z-10 flex flex-col min-w-0 mt-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          {/* Demo Tag */}
          <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 shadow-sm">
            Demo
          </span>

          {/* Real Play Count */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-600 font-semibold">
            <Headphones size={13} className="text-blue-600" />
            <span>{playLabel}</span>
          </span>
        </div>

        {/* Prominently displayed Song Name */}
        <h2
          className="text-lg sm:text-xl font-bold font-display text-zinc-900 truncate leading-tight"
          title={song.title}
        >
          {song.title}
        </h2>

        {/* Artist & Real Creation Date */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs font-medium text-zinc-500 truncate">
            {song.artist || 'RG Music'}
          </p>
          {song.createdDate && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
              <Calendar size={11} />
              {song.createdDate}
            </span>
          )}
        </div>
      </div>

      {/* Embedded Animated Waveform Visualizer & Duration */}
      <div className="relative z-10 flex items-center gap-3 bg-zinc-50/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-zinc-200/60 mt-1.5">
        <div className="flex-1 h-5 flex items-center overflow-hidden">
          <Waveform isPlaying={isPlaying} />
        </div>
        <span className="text-[11px] font-mono text-zinc-500 shrink-0 font-medium">
          {song.durationFormatted ||
            (typeof song.duration === 'number'
              ? formatTime(song.duration)
              : song.duration) ||
            '02:54'}
        </span>
      </div>

      {/* Mini Player Controls */}
      <div className="relative z-10 flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
        <span className="text-[11px] font-mono text-zinc-400 font-semibold tracking-wider uppercase">
          180g Wax · Demo
        </span>

        {/* Previous, Play/Pause toggle, Next */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev?.();
            }}
            aria-label="Previous track"
            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all cursor-pointer active:scale-95"
          >
            <SkipBack size={17} fill="currentColor" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 scale-105'
                : 'bg-zinc-900 hover:bg-black text-white hover:scale-105 shadow-zinc-900/20'
            }`}
          >
            {isPlaying ? (
              <Pause size={17} fill="currentColor" />
            ) : (
              <Play size={17} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            aria-label="Next track"
            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-all cursor-pointer active:scale-95"
          >
            <SkipForward size={17} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
