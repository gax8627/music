import { useState, useRef, useEffect, useCallback } from 'react';
import BoomerangVideoBg from './components/BoomerangVideoBg';
import Header from './components/Header';
import DeckPlayer from './components/DeckPlayer';
import SongList from './components/SongList';
import AudioVisualizer from './components/AudioVisualizer';
import MouseFollower from './components/MouseFollower';
import { tracks as ALL_TRACKS, Track } from './data/tracks';

const STORAGE_KEY = 'rg_music_real_play_counts';

export default function App() {
  // Initialize tracks with real persisted play counts from localStorage
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const counts: Record<string, number> = JSON.parse(saved);
        return ALL_TRACKS.map((t) => {
          const p = counts[t.id] ?? 0;
          return {
            ...t,
            plays: p,
            playsFormatted: `${p} ${p === 1 ? 'play' : 'plays'}`,
          };
        });
      }
    } catch {
      // ignore
    }
    return ALL_TRACKS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentIndex] || tracks[0];

  // Save and increment real play count in state and localStorage
  const incrementRealPlayCount = useCallback((index: number) => {
    setTracks((prev) => {
      const target = prev[index];
      if (!target) return prev;

      const newPlays = (target.plays || 0) + 1;
      const updated = prev.map((t, i) =>
        i === index
          ? {
              ...t,
              plays: newPlays,
              playsFormatted: `${newPlays} ${newPlays === 1 ? 'play' : 'plays'}`,
            }
          : t
      );

      // Persist to localStorage
      try {
        const counts: Record<string, number> = {};
        updated.forEach((t) => {
          counts[t.id] = t.plays || 0;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
      } catch {
        // ignore
      }

      return updated;
    });
  }, []);

  // Central audio controller
  const selectSong = useCallback(
    (index: number, shouldPlay = true) => {
      const target = tracks[index];
      if (!target) return;

      const isSameTrack = index === currentIndex;

      setCurrentIndex(index);
      const audio = audioRef.current;
      if (audio && target.src) {
        if (!audio.src.endsWith(target.src)) {
          audio.src = target.src;
          audio.load();
        }
        if (shouldPlay) {
          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              if (!isSameTrack || !isPlaying) {
                incrementRealPlayCount(index);
              }
            })
            .catch((err) => {
              console.warn('Playback interrupted:', err);
              setIsPlaying(false);
            });
        } else {
          audio.pause();
          setIsPlaying(false);
        }
      }
    },
    [tracks, currentIndex, isPlaying, incrementRealPlayCount]
  );

  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoopForever, setIsLoopForever] = useState(true);
  const historyRef = useRef<number[]>([0]);
  const playedInShuffleRef = useRef<Set<number>>(new Set([0]));

  useEffect(() => {
    if (audioRef.current && currentTrack?.src) {
      audioRef.current.src = currentTrack.src;
    }
  }, []);

  const getNextTrackIndex = useCallback((): number => {
    if (!isShuffle) {
      return (currentIndex + 1) % tracks.length;
    }

    // In Shuffle mode: ensure all tracks are played before repeating
    if (playedInShuffleRef.current.size >= tracks.length) {
      playedInShuffleRef.current.clear();
      playedInShuffleRef.current.add(currentIndex);
    }

    const availableIndices = tracks
      .map((_, i) => i)
      .filter((i) => !playedInShuffleRef.current.has(i) && i !== currentIndex);

    const pool = availableIndices.length > 0
      ? availableIndices
      : tracks.map((_, i) => i).filter((i) => i !== currentIndex);

    const chosen = pool[Math.floor(Math.random() * pool.length)] ?? 0;
    playedInShuffleRef.current.add(chosen);
    historyRef.current.push(chosen);
    return chosen;
  }, [isShuffle, currentIndex, tracks]);

  const handleNext = useCallback(
    (forcePlay = isPlaying) => {
      const nextIdx = getNextTrackIndex();
      selectSong(nextIdx, forcePlay);
    },
    [getNextTrackIndex, isPlaying, selectSong]
  );

  const handlePrev = useCallback(() => {
    if (isShuffle && historyRef.current.length > 1) {
      historyRef.current.pop(); // remove current
      const prevIdx = historyRef.current[historyRef.current.length - 1];
      selectSong(prevIdx, isPlaying);
    } else {
      const prevIdx = (currentIndex - 1 + tracks.length) % tracks.length;
      selectSong(prevIdx, isPlaying);
    }
  }, [isShuffle, currentIndex, tracks.length, isPlaying, selectSong]);

  // Global keyboard shortcuts (Left/Right arrows, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'BUTTON' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            audioRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                incrementRealPlayCount(currentIndex);
              })
              .catch(() => setIsPlaying(false));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isPlaying, currentIndex, incrementRealPlayCount]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black select-none text-white flex flex-col justify-between">
      {/* 1. Interactive Fluid Mouse Follower & Ambient Aura */}
      <MouseFollower isPlaying={isPlaying} />

      {/* 2. Fixed Boomerang Video Canvas Background (z-0) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BoomerangVideoBg />
        {/* Subtle dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      {/* Unified Master HTML5 Audio Engine with Continuous Loop Forever */}
      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={() => {
          if (isLoopForever) {
            handleNext(true);
          } else {
            setIsPlaying(false);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* 3. Top Header Navigation (z-20) */}
      <Header />

      {/* 4. Main Landing Stage (z-10) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start pt-24 sm:pt-28 pb-12 px-4 sm:px-6 md:px-8 w-full max-w-7xl mx-auto gap-6 sm:gap-7">
        {/* Side-by-Side Horizontal Carousel with Active Scale-Up */}
        <section className="w-full flex flex-col items-center">
          <DeckPlayer
            songs={tracks}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            onSelectSong={selectSong}
            audioRef={audioRef}
            isShuffle={isShuffle}
            onToggleShuffle={() => setIsShuffle((prev) => !prev)}
            isLoopForever={isLoopForever}
            onToggleLoopForever={() => setIsLoopForever((prev) => !prev)}
            onNext={() => handleNext(true)}
            onPrev={handlePrev}
          />
        </section>

        {/* Real-time Dynamic Audio Visualizer Spectrum */}
        <section className="w-full">
          <AudioVisualizer
            isPlaying={isPlaying}
            audioRef={audioRef}
            trackTitle={currentTrack?.title}
          />
        </section>

        {/* Chronological List of All 33 Songs */}
        <section className="w-full">
          <SongList
            songs={tracks}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            onSelectSong={selectSong}
            isShuffle={isShuffle}
            onToggleShuffle={() => setIsShuffle((prev) => !prev)}
            isLoopForever={isLoopForever}
            onToggleLoopForever={() => setIsLoopForever((prev) => !prev)}
          />
        </section>
      </main>

      {/* 5. Footer Note */}
      <footer className="relative z-10 py-4 text-center text-[11px] font-mono text-white/50 border-t border-white/10">
        RG Music Studio Archives · 33 Recordings · Continuous Loop Forever · Dynamic Audio Spectrum
      </footer>
    </div>
  );
}
