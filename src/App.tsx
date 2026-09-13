import { useState, useRef, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import BoomerangVideoBg from './components/BoomerangVideoBg';
import Header from './components/Header';
import DeckPlayer from './components/DeckPlayer';
import SongList from './components/SongList';
import AudioVisualizer from './components/AudioVisualizer';
import MouseFollower from './components/MouseFollower';
import PrivateSongView from './components/PrivateSongView';
import { tracks as ALL_TRACKS, Track, TOTAL_SONGS, TOTAL_DURATION_LABEL } from './data/tracks';

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
  const [isPrivateView, setIsPrivateView] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

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

  // Toggle shuffle mode: automatically picks a random track and starts playback immediately
  const handleToggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const nextState = !prev;
      // When turning ON or clicking shuffle: immediately select a different random song and play automatically!
      const availableIndices = tracks
        .map((_, i) => i)
        .filter((i) => i !== currentIndex);
      const chosen =
        availableIndices[Math.floor(Math.random() * availableIndices.length)] ?? 0;
      playedInShuffleRef.current.clear();
      playedInShuffleRef.current.add(chosen);
      historyRef.current = [currentIndex, chosen];

      // Auto play the shuffled track immediately!
      selectSong(chosen, true);

      return nextState;
    });
  }, [tracks, currentIndex, selectSong]);

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

  // Check URL for ?song=ID or #song-ID on mount or navigation
  useEffect(() => {
    const handleUrlRouting = () => {
      const params = new URLSearchParams(window.location.search);
      const songParam = params.get('song');
      if (songParam) {
        const foundIdx = tracks.findIndex(
          (t) => t.id === songParam || t.id === String(songParam)
        );
        if (foundIdx !== -1) {
          setCurrentIndex(foundIdx);
          setIsPrivateView(true);
          return;
        }
      }
      if (window.location.hash.startsWith('#song-')) {
        const hashId = window.location.hash.replace('#song-', '');
        const foundIdx = tracks.findIndex((t) => t.id === hashId);
        if (foundIdx !== -1) {
          setCurrentIndex(foundIdx);
          setIsPrivateView(true);
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, [tracks]);

  // Keep URL updated when navigating tracks while in private view
  useEffect(() => {
    if (isPrivateView && currentTrack) {
      const targetQuery = `?song=${currentTrack.id}`;
      if (window.location.search !== targetQuery) {
        const newUrl = `${window.location.origin}${window.location.pathname}${targetQuery}`;
        window.history.replaceState(null, '', newUrl);
      }
    }
  }, [isPrivateView, currentTrack]);

  // Share song: copy link to private audition page and trigger toast
  const handleShare = useCallback((songId: string) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?song=${songId}`;

    const triggerToast = () => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => triggerToast())
        .catch(() => {
          fallbackCopy(shareUrl);
          triggerToast();
        });
    } else {
      fallbackCopy(shareUrl);
      triggerToast();
    }
  }, []);

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (e) {
      console.error('Failed to copy share link:', e);
    }
  };

  // Exit private view and return to full landing page
  const exitPrivateView = useCallback(() => {
    setIsPrivateView(false);
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState(null, '', cleanUrl);
  }, []);

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

      {/* 4. Stage: Either Dedicated Private VIP Page OR Full 33-Song Main Stage */}
      {isPrivateView && currentTrack ? (
        <PrivateSongView
          song={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={() => selectSong(currentIndex, !isPlaying)}
          onNext={() => handleNext(true)}
          onPrev={handlePrev}
          onExitPrivateView={exitPrivateView}
          onShare={handleShare}
          audioRef={audioRef}
          isShuffle={isShuffle}
          onToggleShuffle={handleToggleShuffle}
          isLoopForever={isLoopForever}
          onToggleLoopForever={() => setIsLoopForever((prev) => !prev)}
          copiedToast={copiedToast}
        />
      ) : (
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
              onToggleShuffle={handleToggleShuffle}
              isLoopForever={isLoopForever}
              onToggleLoopForever={() => setIsLoopForever((prev) => !prev)}
              onNext={() => handleNext(true)}
              onPrev={handlePrev}
              onShare={handleShare}
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
              onToggleShuffle={handleToggleShuffle}
              isLoopForever={isLoopForever}
              onToggleLoopForever={() => setIsLoopForever((prev) => !prev)}
              onShare={handleShare}
            />
          </section>
        </main>
      )}

      {/* Floating Copied Toast Alert */}
      {copiedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-950/95 text-white border border-emerald-500/50 shadow-[0_10px_35px_rgba(16,185,129,0.3)] px-5 py-3 rounded-2xl backdrop-blur-md animate-fade-up">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0">
            <Check size={14} strokeWidth={3} />
          </span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white tracking-wide">
              Private Audition Link Copied!
            </span>
            <span className="text-[11px] text-zinc-300 font-mono">
              Direct VIP link ready to share
            </span>
          </div>
        </div>
      )}

      {/* 5. Footer Note */}
      <footer className="relative z-10 py-4 text-center text-[11px] font-mono text-white/50 border-t border-white/10">
        RG Music Studio Archives · {TOTAL_SONGS} Recordings · {TOTAL_DURATION_LABEL} Total Runtime · Lossless Wax Master
      </footer>
    </div>
  );
}
