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
  isShuffle = true,
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
  const [isSmallScreen, setIsSmallScreen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 380 : false
  );

  const activeIndex = onSelectSong !== undefined ? currentIndex : internalIndex;
  const activePlaying = onSelectSong !== undefined ? isPlaying : internalPlaying;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);
  const effectiveAudioRef = audioRef || internalAudioRef;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsSmallScreen(window.innerWidth < 380);
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

  // Comprehensive Wheel & Trackpad Gesture Engine
  const lastWheelTime = useRef(0);
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Trackpad horizontal swipe
      if (absX > 15 && absX > absY * 0.9 && now - lastWheelTime.current > 300) {
        lastWheelTime.current = now;
        if (deltaX > 0) {
          handleNextTrack();
        } else {
          handlePrevTrack();
        }
        return;
      }

      // Mouse wheel vertical scroll over carousel cards
      if (absY > 25 && now - lastWheelTime.current > 320) {
        lastWheelTime.current = now;
        if (deltaY > 0) {
          handleNextTrack();
        } else {
          handlePrevTrack();
        }
      }
    },
    [handleNextTrack, handlePrevTrack]
  );

  // Touch Swipe Engine for fingers on mobile, tablet & touchscreens
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isTouching = useRef(false);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isTouching.current = true;
    isHorizontalSwipe.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouching.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipe.current = Math.abs(deltaX) >= Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipe.current) {
      setLiveDrag(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (!isTouching.current) return;
    isTouching.current = false;
    const drag = liveDrag;
    setLiveDrag(0);

    if (isHorizontalSwipe.current) {
      if (drag < -35) {
        handleNextTrack();
      } else if (drag > 35) {
        handlePrevTrack();
      }
    }
    isHorizontalSwipe.current = null;
  };

  // Mouse Drag Engine for desktop / laptop
  const mouseStartX = useRef(0);
  const isMouseDown = useRef(false);
  const hasMovedMouse = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    if (e.button !== 0) return; // primary left click only

    mouseStartX.current = e.clientX;
    isMouseDown.current = true;
    hasMovedMouse.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;
    const deltaX = e.clientX - mouseStartX.current;
    if (Math.abs(deltaX) > 5) {
      hasMovedMouse.current = true;
      setLiveDrag(deltaX);
    }
  };

  const handleMouseUp = () => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    const drag = liveDrag;
    setLiveDrag(0);

    if (hasMovedMouse.current) {
      if (drag < -35) {
        handleNextTrack();
      } else if (drag > 35) {
        handlePrevTrack();
      }
    }

    setTimeout(() => {
      hasMovedMouse.current = false;
    }, 50);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={`relative w-full overflow-hidden flex flex-col items-center justify-center py-2 select-none ${className}`}
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

      {/* Playback Mode Floating Glass Pill (Luxury Monochrome Icons) */}
      <div className="z-30 mb-2 sm:mb-4 flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur-xl p-1.5 rounded-full border border-white/15 shadow-2xl select-none transition-all">
        {/* Shuffle Mode Toggle */}
        <button
          type="button"
          onClick={onToggleShuffle}
          title={isShuffle ? 'Shuffle Active (Plays automatically)' : 'Shuffle Music'}
          aria-label="Toggle shuffle"
          className={`rounded-full p-2.5 transition-all cursor-pointer ${
            isShuffle
              ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.45)] ring-1 ring-white scale-105'
              : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'
          }`}
        >
          <PremiumShuffleIcon size={16} className={isShuffle ? 'animate-pulse' : ''} />
        </button>

        {/* Loop Forever Toggle */}
        <button
          type="button"
          onClick={onToggleLoopForever}
          title={isLoopForever ? `Loop Active (All ${songs.length} Songs)` : 'Loop Off'}
          aria-label="Toggle loop forever"
          className={`rounded-full p-2.5 transition-all cursor-pointer ${
            isLoopForever
              ? 'bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.45)] ring-1 ring-white scale-105'
              : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-95'
          }`}
        >
          <PremiumLoopIcon size={16} />
        </button>
      </div>

      {/* Left Chevron Button */}
      <button
        type="button"
        onClick={handlePrevTrack}
        aria-label="Previous track"
        className="!absolute left-1 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      {/* Right Chevron Button */}
      <button
        type="button"
        onClick={handleNextTrack}
        aria-label="Next track"
        className="!absolute right-1 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-lg border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      {/* Endless 3D Circular Cylinder Carousel Stage with Full Touch & Mouse Drag */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-[400px] sm:h-[455px] flex items-center justify-center overflow-visible select-none cursor-grab active:cursor-grabbing touch-pan-y"
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
          const spacing = isSmallScreen ? 165 : isMobile ? 185 : 275;
          const baseX = diff * spacing;
          const x = baseX + liveDrag * Math.max(0.2, 1 - absDiff * 0.22);

          const scale =
            diff === 0
              ? isCardPlaying
                ? isMobile ? 1.03 : 1.07
                : 1.0
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

          const cardHalfW = isMobile ? 135 : 167;
          const cardHalfH = isMobile ? 188 : 207;

          return (
            <motion.div
              key={song.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: -cardHalfW,
                marginTop: -cardHalfH,
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
              onClick={() => {
                if (hasMovedMouse.current) return;
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
                  if (hasMovedMouse.current) return;
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
