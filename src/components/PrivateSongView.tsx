import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Headphones,
  Calendar,
  Lock,
  ArrowLeft,
  Volume2,
  VolumeX,
  Disc3,
  Check,
} from 'lucide-react';
import { Song } from './Card';
import AudioVisualizer from './AudioVisualizer';
import { PremiumShuffleIcon, PremiumLoopIcon, PremiumShareIcon } from './PremiumIcons';
import { formatTime, TOTAL_SONGS, TOTAL_DURATION_LABEL } from '../data/tracks';
import CardVisualizerCover, { VinylCenterLabel } from './CardVisualizerCover';

export interface PrivateSongViewProps {
  song: Song;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onExitPrivateView: () => void;
  onShare: (songId: string) => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isShuffle?: boolean;
  onToggleShuffle?: () => void;
  isLoopForever?: boolean;
  onToggleLoopForever?: () => void;
  copiedToast?: boolean;
}

export const PrivateSongView: React.FC<PrivateSongViewProps> = ({
  song,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onExitPrivateView,
  onShare,
  audioRef,
  isShuffle = true,
  onToggleShuffle,
  isLoopForever = true,
  onToggleLoopForever,
  copiedToast = false,
}) => {
  const parseDuration = (d: number | string | undefined): number => {
    if (typeof d === 'number') return d;
    if (typeof d === 'string') {
      const parsed = parseFloat(d);
      return isNaN(parsed) ? 180 : parsed;
    }
    return 180;
  };

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(() => parseDuration(song.duration));
  const [isMuted, setIsMuted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Sync duration on song prop change
  useEffect(() => {
    setDuration(parseDuration(song.duration));
  }, [song.duration]);

  // Sync with audio element playback time
  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateTime);
    };
  }, [audioRef, song]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef?.current;
    if (!audio || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pos * duration;
    setCurrentTime(audio.currentTime);
  };

  const toggleMute = () => {
    const audio = audioRef?.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const handleShareClick = () => {
    onShare(song.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const playCount = typeof song.plays === 'number' ? song.plays : 0;
  const playLabel = `${playCount} ${playCount === 1 ? 'play' : 'plays'}`;

  return (
    <div className="relative z-10 flex-1 flex flex-col items-center justify-between w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 select-none gap-6 sm:gap-8">
      {/* Top Private Navigation & Access Bar */}
      <div className="w-full flex items-center justify-between gap-3 border-b border-white/10 pb-4">
        {/* Left: Back to Full Catalog */}
        <button
          type="button"
          onClick={onExitPrivateView}
          className="liquid-glass rounded-xl px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-medium text-white/90 hover:text-white flex items-center gap-1.5 sm:gap-2 hover:bg-white/15 transition-all cursor-pointer group shadow-lg"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform shrink-0" />
          <span className="hidden sm:inline">Explore All {TOTAL_SONGS} Songs ({TOTAL_DURATION_LABEL})</span>
          <span className="sm:hidden">All {TOTAL_SONGS} Songs</span>
        </button>

        {/* Center: Private Access Badge */}
        <div className="hidden md:flex items-center gap-2 liquid-glass rounded-full px-4 py-1 text-xs text-white/80">
          <Lock size={12} className="text-blue-400" />
          <span className="font-mono text-[11px] tracking-wide uppercase">
            Private VIP Audition · Track #{song.id}
          </span>
        </div>

        {/* Right: Share Track Button */}
        <button
          type="button"
          onClick={handleShareClick}
          className={`rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-lg shrink-0 ${
            isCopied || copiedToast
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-emerald-500/30 scale-105'
              : 'bg-white text-zinc-900 hover:bg-zinc-100 hover:scale-105 active:scale-95'
          }`}
        >
          {isCopied || copiedToast ? (
            <>
              <Check size={14} />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <PremiumShareIcon size={14} />
              <span className="hidden sm:inline">Share Song</span>
              <span className="sm:hidden">Share</span>
            </>
          )}
        </button>
      </div>

      {/* Main Private Showcase Card */}
      <div className="w-full liquid-glass rounded-2xl sm:rounded-[32px] p-4 sm:p-8 md:p-10 shadow-2xl flex flex-col items-center gap-5 sm:gap-6 border border-white/20 relative overflow-hidden">
        {/* Ambient background glow matching song gradient */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none blur-3xl -z-10"
          style={{
            background: `radial-gradient(circle at center, ${song.bgGradient || '#3B82F6'}, transparent 70%)`,
          }}
        />

        {/* Center Section: Album Jacket + Sliding 33 RPM Vinyl */}
        <div className="relative flex items-center justify-center my-1 sm:my-2">
          <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
            {/* Sliding Spinning Vinyl Record */}
            <motion.div
              className="absolute top-0 right-0 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full bg-zinc-950 shadow-2xl flex items-center justify-center pointer-events-none"
              initial={false}
              animate={{
                x: isPlaying ? 36 : 0,
                opacity: isPlaying ? 1 : 0.3,
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ zIndex: 0 }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center relative"
                style={{ animation: isPlaying ? 'spin 4s linear infinite' : 'none' }}
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-3 rounded-full border border-zinc-800/80" />
                <div className="absolute inset-6 rounded-full border border-zinc-800/60" />
                <div className="absolute inset-9 rounded-full border border-zinc-800/50" />
                <div className="absolute inset-12 rounded-full border border-zinc-800/40" />
                <div className="absolute inset-16 rounded-full border border-zinc-800/30" />

                {/* Center Record Label */}
                <VinylCenterLabel trackNumber={song.id} size="lg" />
              </div>
            </motion.div>

            {/* Front Album Jacket Generative Visualizer Cover */}
            <CardVisualizerCover
              isPlaying={isPlaying}
              trackNumber={song.id}
              bgGradient={song.bgGradient}
              title={song.title}
              size="lg"
            />
          </div>
        </div>

        {/* Metadata: Badges, Title, Artist */}
        <div className="flex flex-col items-center text-center gap-2 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="inline-flex items-center text-xs font-bold tracking-wider uppercase text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30 shadow-sm">
              Demo
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-white/80 bg-white/10 px-3 py-1 rounded-full">
              <Headphones size={13} className="text-blue-400" />
              <span>{playLabel}</span>
            </span>
            {song.createdDate && (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60 bg-white/5 px-3 py-1 rounded-full">
                <Calendar size={13} />
                <span>Recorded: {song.createdDate}</span>
              </span>
            )}
            <span className="inline-flex items-center text-xs font-mono text-white/50 bg-white/5 px-3 py-1 rounded-full">
              180g Wax Master
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-display text-white tracking-tight leading-tight mt-1">
            {song.title}
          </h1>

          <p className="text-sm sm:text-base font-medium text-white/70">
            {song.artist || 'RG Music'} · Studio Live Recording
          </p>
        </div>

        {/* Scrubber & Progress Bar */}
        <div className="w-full max-w-2xl flex flex-col gap-1.5 px-2">
          <div
            onClick={handleSeek}
            className="group relative w-full h-3 flex items-center cursor-pointer"
          >
            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden relative group-hover:h-2 transition-all">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Scrubber thumb */}
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-lg border border-blue-600 scale-0 group-hover:scale-100 transition-transform -translate-x-1/2 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Time Displays */}
          <div className="flex justify-between items-center text-xs font-mono text-white/60 px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
          </div>
        </div>

        {/* Master Playback Controls */}
        <div className="flex items-center justify-between w-full max-w-xl pt-2">
          {/* Left: Shuffle Mode Toggle */}
          <button
            type="button"
            onClick={onToggleShuffle}
            aria-label={isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
            title={isShuffle ? 'Shuffle is ON (Click to turn off)' : 'Shuffle is OFF (Click to turn on)'}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
              isShuffle
                ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.45)] ring-1 ring-white scale-105'
                : 'bg-white/5 text-white/40 ring-1 ring-white/15 hover:text-white/70 hover:bg-white/10'
            }`}
          >
            <PremiumShuffleIcon size={16} className={isShuffle ? 'animate-pulse' : 'opacity-40'} />
            <span className={`text-[9px] font-bold font-mono tracking-wider leading-none ${isShuffle ? 'text-zinc-900' : 'text-white/40'}`}>
              {isShuffle ? 'ON' : 'OFF'}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                isShuffle ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-white/20'
              }`}
            />
          </button>

          {/* Center: Previous, Large Play/Pause, Next */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous track"
              className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer active:scale-95"
            >
              <SkipBack size={22} fill="currentColor" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
                isPlaying
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/50 scale-105'
                  : 'bg-white hover:bg-zinc-100 text-zinc-950 hover:scale-105 shadow-white/20'
              }`}
            >
              {isPlaying ? (
                <Pause size={26} fill="currentColor" />
              ) : (
                <Play size={26} fill="currentColor" className="ml-1" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              aria-label="Next track"
              className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer active:scale-95"
            >
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>

          {/* Right: Loop Forever Toggle & Mute */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleLoopForever}
              aria-label={isLoopForever ? 'Loop is ON' : 'Loop is OFF'}
              title={isLoopForever ? `Loop is ON (All ${TOTAL_SONGS} Songs)` : 'Loop is OFF'}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                isLoopForever
                  ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.45)] ring-1 ring-white scale-105'
                  : 'bg-white/5 text-white/40 ring-1 ring-white/15 hover:text-white/70 hover:bg-white/10'
              }`}
            >
              <PremiumLoopIcon size={16} className={isLoopForever ? '' : 'opacity-40'} />
              <span className={`text-[9px] font-bold font-mono tracking-wider leading-none ${isLoopForever ? 'text-zinc-900' : 'text-white/40'}`}>
                {isLoopForever ? 'ON' : 'OFF'}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isLoopForever ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-white/20'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        {/* Dynamic Frequency Spectrum Visualizer */}
        <div className="w-full max-w-2xl mt-2">
          <AudioVisualizer
            isPlaying={isPlaying}
            audioRef={audioRef}
            trackTitle={song.title}
          />
        </div>

        {/* Private Share Footer Banner */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-white/60">
          <div className="flex items-center gap-2 font-mono">
            <Disc3 size={14} className="text-blue-400" />
            <span>Private Recording · Direct URL Link Access Enabled</span>
          </div>

          <button
            type="button"
            onClick={handleShareClick}
            className="flex items-center gap-1.5 text-blue-300 hover:text-blue-200 transition-colors cursor-pointer font-medium"
          >
            <PremiumShareIcon size={13} />
            <span>Copy Private Audition Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateSongView;
