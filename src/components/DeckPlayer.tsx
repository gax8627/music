import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card, { Song } from './Card';
import { tracks as DEFAULT_TRACKS } from '../data/tracks';
import { PremiumShuffleIcon, PremiumLoopIcon } from './PremiumIcons';

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
  onShare?: (songId: string) => void;
}

// Calculate shortest signed circular offset in an infinite ring (no beginning, no end)
const getCircularDiff = (index: number, active: number, total: number): number => {
  if (total <= 0) return 0;
  let diff = (index - active) % total;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
};

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
  onShare,
}: DeckPlayerProps) {
  const [internalIndex, setInternalIndex] = useState(currentIndex);
  const [internalPlaying, setInternalPlaying] = useState(isPlaying);
  const [liveDrag, setLiveDrag] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  const activeIndex = onSelectSong !== undefined ? currentIndex : internalIndex;
  const activePlaying = onSelectSong !== undefined ? isPlaying : internalPlaying;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);
  const effectiveAudioRef = audioRef || internalAudioRef;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

      {/* Playback Mode Floating Glass Pill (Icon Only: Shuffle & Loop Forever) */}
      <div className="z-30 mb-2 sm:mb-4 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-lg p-1 rounded-full border border-white/15 shadow-xl select-none transition-all">
        {/* Shuffle Mode Toggle (Icon only) */}
        <button
          type="button"
          onClick={onToggleShuffle}
          title={isShuffle ? 'Shuffle Active' : 'Enable Shuffle'}
          aria-label="Toggle shuffle"
          className={`rounded-full p-2.5 transition-all cursor-pointer ${
            isShuffle
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105 ring-1 ring-blue-400'
              : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95'
          }`}
        >
          <PremiumShuffleIcon size={15} className={isShuffle ? 'animate-pulse' : ''} />
        </button>

        {/* Loop Forever Toggle (Icon only) */}
        <button
          type="button"
          onClick={onToggleLoopForever}
          title={isLoopForever ? 'Loop Forever Active (All 33 Songs)' : 'Loop Off'}
          aria-label="Toggle loop forever"
          className={`rounded-full p-2.5 transition-all cursor-pointer ${
            isLoopForever
              ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-500/30 scale-105 ring-1 ring-emerald-400'
              : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95'
          }`}
        >
          <PremiumLoopIcon size={15} />
        </button>
      </div>

      {/* Left Chevron Button */}
      <button
        type="button"
        onClick={handlePrevTrack}
        aria-label="Previous track"
        className="!absolute left-2 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Right Chevron Button */}
      <button
        type="button"
        onClick={handleNextTrack}
        aria-label="Next track"
        className="!absolute right-2 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Endless 3D Circular Cylinder Carousel Stage */}
      <div
        className="relative w-full h-[415px] sm:h-[455px] flex items-center justify-center overflow-visible touch-pan-y"
        style={{
          perspective: 1200,
          perspectiveOrigin: 'center center',
          transformStyle: 'preserve-3d',
        }}
      >
        {songs.map((song, index) => {
          const diff = getCircularDiff(index, activeIndex, songs.length);
          const absDiff = Math.abs(diff);

          // Render only cards visible in the circular arc
          const maxVisibleDiff = isMobile ? 2 : 3;
          if (absDiff > maxVisibleDiff + 1) return null;

          const isActive = diff === 0;
          const isCardPlaying = isActive && activePlaying;

          // 3D Circular Cylindrical Transformation
          const spacing = isMobile ? 190 : 275;
          const baseX = diff * spacing;
          const x = baseX + liveDrag * Math.max(0.2, 1 - absDiff * 0.22);

          const scale =
            diff === 0
              ? isCardPlaying
                ? 1.08
                : 1.02
              : isMobile
              ? Math.max(0.62, 0.84 - (absDiff - 1) * 0.18)
              : Math.max(0.55, 0.88 - (absDiff - 1) * 0.14);

          // Curve cards around the 3D cylinder
          const rotateY =
            diff === 0
              ? 0
              : diff > 0
              ? Math.min(54, -22 - (absDiff - 1) * 15)
              : Math.max(-54, 22 + (absDiff - 1) * 15);

          const z =
            diff === 0
              ? isCardPlaying
                ? 45
                : 15
              : -55 - (absDiff - 1) * 95;

          const opacity =
            diff === 0
              ? 1
              : absDiff === 1
              ? 0.85
              : absDiff === 2
              ? (isMobile ? 0.35 : 0.45)
              : absDiff === 3
              ? 0.15
              : 0;

          const zIndex = 30 - absDiff * 7;

          return (
            <motion.div
              key={song.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: isMobile ? -140 : -167,
                marginTop: isMobile ? -192 : -207,
                zIndex,
                transformStyle: 'preserve-3d',
              }}
              animate={{
                x,
                scale,
                rotateY,
                z,
                opacity,
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 26,
                mass: 0.8,
              }}
              drag={isActive ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDrag={(_e, info) => {
                setLiveDrag(info.offset.x);
              }}
              onDragEnd={(_e, info) => {
                setLiveDrag(0);
                const swipeDistance = info.offset.x;
                const swipeVelocity = info.velocity.x;

                if (swipeDistance < -40 || swipeVelocity < -250) {
                  handleNextTrack();
                } else if (swipeDistance > 40 || swipeVelocity > 250) {
                  handlePrevTrack();
                }
              }}
              onClick={() => {
                if (!isActive) {
                  playTrack(index, true);
                }
              }}
              className={`rounded-[32px] sm:rounded-[36px] cursor-pointer transition-shadow duration-300 ${
                isCardPlaying
                  ? 'shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6),0_0_35px_rgba(59,130,246,0.4)]'
                  : isActive
                  ? 'shadow-[0_15px_35px_-8px_rgba(0,0,0,0.45)]'
                  : 'shadow-[0_8px_25px_-6px_rgba(0,0,0,0.3)]'
              }`}
            >
              <Card
                song={song}
                isPlaying={isCardPlaying}
                isActive={isActive}
                isBackground={!isActive}
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
                onShare={onShare}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
