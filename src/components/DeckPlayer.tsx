import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shuffle, Repeat } from 'lucide-react';
import Card, { Song } from './Card';
import { tracks as DEFAULT_TRACKS } from '../data/tracks';

export const SONGS: Song[] = DEFAULT_TRACKS;

export interface DeckPlayerProps {
  className?: string;
  songs?: Song[];
  currentIndex?: number;
  isPlaying?: boolean;
  onSelectSong?: (index: number, shouldPlay?: boolean) => void;
  onTrackChange?: (song: Song) => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isShuffle?: boolean;
  onToggleShuffle?: () => void;
  isLoopForever?: boolean;
  onToggleLoopForever?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function DeckPlayer({
  className = '',
  songs = SONGS,
  currentIndex = 0,
  isPlaying = false,
  onSelectSong,
  onTrackChange,
  audioRef,
  isShuffle = false,
  onToggleShuffle,
  isLoopForever = true,
  onToggleLoopForever,
  onNext,
  onPrev,
}: DeckPlayerProps) {
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  const [internalPlaying, setInternalPlaying] = useState(isPlaying);
  const [translateX, setTranslateX] = useState(0);

  const activeIndex = onSelectSong !== undefined ? currentIndex : internalIndex;
  const activePlaying = onSelectSong !== undefined ? isPlaying : internalPlaying;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);
  const effectiveAudioRef = audioRef || internalAudioRef;

  const dragX = useMotionValue(0);

  // Recalculate horizontal center position for active card
  const updateCenterPosition = useCallback(() => {
    const container = containerRef.current;
    const card = cardRefs.current[activeIndex];
    if (!container || !card) return;

    const containerCenter = container.offsetWidth / 2;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const targetX = containerCenter - cardCenter;
    setTranslateX(targetX);
    dragX.set(0);
  }, [activeIndex, dragX]);

  useLayoutEffect(() => {
    updateCenterPosition();
  }, [updateCenterPosition]);

  useEffect(() => {
    const handleResize = () => updateCenterPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCenterPosition]);

  // Audio Playback synchronization
  const playTrack = useCallback(
    (index: number, shouldPlay = true) => {
      const targetSong = songs[index];
      if (!targetSong) return;

      if (onSelectSong) {
        onSelectSong(index, shouldPlay);
      } else {
        setInternalIndex(index);
        const audio = effectiveAudioRef.current;
        if (audio && targetSong.src) {
          if (!audio.src.endsWith(targetSong.src)) {
            audio.src = targetSong.src;
            audio.load();
          }
          if (shouldPlay) {
            audio
              .play()
              .then(() => setInternalPlaying(true))
              .catch(() => setInternalPlaying(false));
          } else {
            audio.pause();
            setInternalPlaying(false);
          }
        }
      }
      onTrackChange?.(targetSong);
    },
    [songs, onSelectSong, effectiveAudioRef, onTrackChange]
  );

  const togglePlay = useCallback(() => {
    playTrack(activeIndex, !activePlaying);
  }, [activeIndex, activePlaying, playTrack]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % songs.length;
    playTrack(nextIdx, activePlaying);
  }, [activeIndex, songs.length, activePlaying, playTrack]);

  const handlePrev = useCallback(() => {
    const prevIdx = (activeIndex - 1 + songs.length) % songs.length;
    playTrack(prevIdx, activePlaying);
  }, [activeIndex, songs.length, activePlaying, playTrack]);

  const handleNextTrack = useCallback(() => {
    if (onNext) {
      onNext();
    } else {
      handleNext();
    }
  }, [onNext, handleNext]);

  const handlePrevTrack = useCallback(() => {
    if (onPrev) {
      onPrev();
    } else {
      handlePrev();
    }
  }, [onPrev, handlePrev]);

  // Trackpad / Mouse horizontal wheel support with cooldown and dominant horizontal check
  const lastWheelTime = useRef(0);
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // Dominant horizontal axis and 350ms throttle to prevent macOS trackpad inertial skipping
      if (absX > 30 && absX > absY * 1.5 && now - lastWheelTime.current > 350) {
        lastWheelTime.current = now;
        if (e.deltaX > 0) {
          handleNextTrack();
        } else {
          handlePrevTrack();
        }
      }
    },
    [handleNextTrack, handlePrevTrack]
  );

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={`relative w-full overflow-hidden flex flex-col items-center justify-center py-2 select-none touch-pan-y ${className}`}
    >
      {/* Fallback Internal Audio Element if no external audio ref provided */}
      {!audioRef && (
        <audio
          ref={internalAudioRef}
          preload="metadata"
          onEnded={handleNextTrack}
          onPlay={() => setInternalPlaying(true)}
          onPause={() => setInternalPlaying(false)}
        />
      )}

      {/* Playback Mode Floating Glass Pill (Shuffle & Loop Forever) */}
      <div className="z-30 mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3 bg-black/40 hover:bg-black/60 backdrop-blur-lg px-3.5 sm:px-4 py-1.5 rounded-full border border-white/15 shadow-xl select-none transition-all">
        {/* Shuffle Mode Toggle */}
        <button
          type="button"
          onClick={onToggleShuffle}
          title={isShuffle ? "Shuffle Active (Click to disable)" : "Shuffle Off (Click to enable)"}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            isShuffle
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-1 ring-blue-400 font-semibold"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Shuffle size={13} className={isShuffle ? "animate-pulse" : ""} />
          <span>Shuffle</span>
        </button>

        <div className="h-3 w-px bg-white/20" />

        {/* Loop Forever Toggle */}
        <button
          type="button"
          onClick={onToggleLoopForever}
          title={isLoopForever ? "Loop Forever Active (Continuous infinite playback of all songs)" : "Loop Off"}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
            isLoopForever
              ? "bg-emerald-600/90 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400 font-semibold"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          <Repeat size={13} />
          <span>Loop Forever</span>
          <span className="text-[10px] font-mono opacity-80">(All 33)</span>
        </button>

        <div className="h-3 w-px bg-white/20 hidden sm:block" />

        <span className="text-[10px] font-mono text-white/50 hidden sm:inline">
          {isShuffle ? "Random Mix" : isLoopForever ? "Looping All 33" : "Sequential"}
        </span>
      </div>

      {/* Floating Glass Navigation Previous Arrow (Anchored on Left) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handlePrevTrack();
        }}
        aria-label="Previous track"
        className="!absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Floating Glass Navigation Next Arrow (Anchored on Right) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNextTrack();
        }}
        aria-label="Next track"
        className="!absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Side-by-Side Horizontal Cards Carousel Track with full Drag & Swipe */}
      <div className="w-full flex items-center justify-start overflow-visible py-4">
        <motion.div
          className="relative flex items-center gap-6 sm:gap-8 px-12 sm:px-16 cursor-grab active:cursor-grabbing"
          animate={{ x: translateX }}
          transition={{
            type: 'spring',
            stiffness: 240,
            damping: 26,
            mass: 0.8,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragEnd={(_e, info) => {
            const swipeDistance = info.offset.x;
            const swipeVelocity = info.velocity.x;

            if (swipeDistance < -40 || swipeVelocity < -300) {
              handleNextTrack();
            } else if (swipeDistance > 40 || swipeVelocity > 300) {
              handlePrevTrack();
            } else {
              updateCenterPosition();
            }
          }}
        >
          {songs.map((song, index) => {
            const isActive = index === activeIndex;
            const isCardPlaying = isActive && activePlaying;

            return (
              <motion.div
                key={song.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                onClick={() => {
                  if (!isActive) {
                    playTrack(index, true);
                  }
                }}
                animate={{
                  scale: isCardPlaying ? 1.08 : isActive ? 1.02 : 0.92,
                  opacity: isActive ? 1 : 0.75,
                  y: isCardPlaying ? -6 : isActive ? -2 : 4,
                }}
                whileHover={{
                  scale: isCardPlaying ? 1.1 : isActive ? 1.04 : 0.96,
                  opacity: isActive ? 1 : 0.92,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 24,
                }}
                className={`flex-shrink-0 cursor-pointer transition-shadow duration-300 rounded-[28px] ${
                  isCardPlaying
                    ? 'z-30 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6),0_0_30px_rgba(59,130,246,0.35)]'
                    : isActive
                    ? 'z-20 shadow-[0_15px_35px_-8px_rgba(0,0,0,0.4)]'
                    : 'z-10 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.25)]'
                }`}
              >
                <Card
                  song={song}
                  isPlaying={isCardPlaying}
                  isActive={isActive}
                  isBackground={false}
                  index={index}
                  onTogglePlay={() => {
                    if (isActive) {
                      togglePlay();
                    } else {
                      playTrack(index, true);
                    }
                  }}
                  onNext={handleNextTrack}
                  onPrev={handlePrevTrack}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
