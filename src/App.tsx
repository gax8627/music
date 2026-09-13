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
import { buildShareUrl, decodeShareToken } from './lib/shareToken';

const STORAGE_KEY = 'rg_music_real_play_counts';
const LAST_LOADED_KEY = 'rg_music_last_loaded_song_id';

// Helper to pick a random track on page load that is DIFFERENT from the previous visit.
// Note: token-based share links (?s=...) are resolved asynchronously in a useEffect below.
function getInitialRandomTrackIndex(tracksList: Track[]): number {
  if (typeof window === 'undefined' || tracksList.length === 0) return 0;
  try {
    // Pick a random track DIFFERENT from the last loaded one
    const lastId = localStorage.getItem(LAST_LOADED_KEY);
    const pool = tracksList
      .map((_, i) => i)
      .filter((i) => tracksList[i].id !== lastId);

    const candidates = pool.length > 0 ? pool : tracksList.map((_, i) => i);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;

    const chosenTrack = tracksList[chosen];
    if (chosenTrack) {
      localStorage.setItem(LAST_LOADED_KEY, chosenTrack.id);
    }
    return chosen;
  } catch {
    return Math.floor(Math.random() * tracksList.length);
  }
}

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

  const [currentIndex, setCurrentIndex] = useState<number>(() =>
    getInitialRandomTrackIndex(ALL_TRACKS)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPrivateView, setIsPrivateView] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // ?s= uses token-based routing; legacy ?song= is no longer accepted
      return Boolean(params.get('s')) || window.location.hash.startsWith('#song-');
    }
    return false;
  });
  const [copiedToast, setCopiedToast] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Holds the current blob: URL so we can revoke it when switching tracks
  const blobUrlRef = useRef<string | null>(null);

  const currentTrack = tracks[currentIndex] || tracks[0];

  // Fetch a track's src, create a blob URL, and set it on the audio element.
  // This prevents the raw /audio/ path from appearing in the audio element's src attribute
  // and removes the browser's native "Save Audio As" context menu option.
  const loadBlobUrl = useCallback(
    async (src: string, audio: HTMLAudioElement): Promise<boolean> => {
      try {
        const resp = await fetch(src, {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const blob = await resp.blob();
        const newBlobUrl = URL.createObjectURL(blob);

        // Revoke previous blob URL to free memory
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = newBlobUrl;
        audio.src = newBlobUrl;
        audio.load();
        return true;
      } catch (err) {
        console.warn('Blob load failed, falling back to direct src:', err);
        audio.src = src;
        audio.load();
        return false;
      }
    },
    []
  );

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

  // Central audio controller — loads via blob URL to prevent direct file access
  const selectSong = useCallback(
    (index: number, shouldPlay = true) => {
      const target = tracks[index];
      if (!target) return;

      const isSameTrack = index === currentIndex;
      setCurrentIndex(index);

      const audio = audioRef.current;
      if (!audio || !target.src) return;

      // Check if this is the same track already loaded (blob URL is already set)
      const alreadyLoaded =
        audio.src &&
        audio.src.startsWith('blob:') &&
        isSameTrack;

      const doPlay = () => {
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
      };

      if (alreadyLoaded) {
        doPlay();
      } else {
        loadBlobUrl(target.src, audio).then(() => doPlay());
      }
    },
    [tracks, currentIndex, isPlaying, incrementRealPlayCount, loadBlobUrl]
  );

  const [isShuffle, setIsShuffle] = useState(true);
  const [isLoopForever, setIsLoopForever] = useState(true);
  const historyRef = useRef<number[]>([currentIndex]);
  const playedInShuffleRef = useRef<Set<number>>(new Set([currentIndex]));

  // Load initial track via blob URL and attempt autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.src) return;

    const attemptPlay = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            incrementRealPlayCount(currentIndex);
          })
          .catch(() => {
            // Browser requires a user gesture — unlock on first interaction
            const unlockAutoplay = () => {
              if (audioRef.current && !isPlaying) {
                audioRef.current
                  .play()
                  .then(() => {
                    setIsPlaying(true);
                    incrementRealPlayCount(currentIndex);
                  })
                  .catch(() => {});
              }
            };
            window.addEventListener('pointerdown', unlockAutoplay, { once: true });
            window.addEventListener('keydown', unlockAutoplay, { once: true });
            window.addEventListener('touchstart', unlockAutoplay, { once: true });
          });
      }
    };

    // Load via blob URL first, then play
    loadBlobUrl(currentTrack.src, audio).then(() => attemptPlay());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Shuffle mode: automatically picks a random track and starts playback immediately
  const handleToggleShuffle = useCallback(() => {
    const availableIndices = tracks
      .map((_, i) => i)
      .filter((i) => i !== currentIndex);
    const chosen =
      availableIndices[Math.floor(Math.random() * availableIndices.length)] ?? 0;
    playedInShuffleRef.current.clear();
    playedInShuffleRef.current.add(chosen);
    historyRef.current = [currentIndex, chosen];

    setIsShuffle(true);
    selectSong(chosen, true);
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

  // On mount: decode ?s=<token> share links asynchronously.
  // Old ?song= sequential IDs are intentionally no longer accepted.
  useEffect(() => {
    const allIds = tracks.map((t) => t.id);

    const handleUrlRouting = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareToken = params.get('s');

      if (shareToken) {
        const songId = await decodeShareToken(shareToken, allIds);
        if (songId !== null) {
          const foundIdx = tracks.findIndex((t) => t.id === songId);
          if (foundIdx !== -1) {
            setCurrentIndex(foundIdx);
            setIsPrivateView(true);
            return;
          }
        }
        // Invalid token — clear the bad URL and stay on main page
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }

      // Legacy #song- hash support (kept for backwards compat with old bookmark-style links)
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
    // Note: popstate is not needed since we use pushState, not hash navigation
  }, [tracks]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep URL updated when navigating tracks while in private view (async token generation)
  useEffect(() => {
    if (isPrivateView && currentTrack) {
      buildShareUrl(currentTrack.id).then((url) => {
        const newSearch = '?s=' + url.split('?s=')[1];
        if (window.location.search !== newSearch) {
          window.history.replaceState(null, '', url);
        }
      });
    }
  }, [isPrivateView, currentTrack]);

  // Share song: generate token URL and copy to clipboard
  const handleShare = useCallback((songId: string) => {
    const triggerToast = () => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    };

    buildShareUrl(songId).then((shareUrl) => {
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
    });
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

      {/* Unified Master HTML5 Audio Engine — controlsList blocks native download UI */}
      {/* Audio src is always a blob: URL so the /audio/ path is never exposed in the DOM */}
      <audio
        ref={audioRef}
        preload="metadata"
        controlsList="nodownload nofullscreen noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
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
