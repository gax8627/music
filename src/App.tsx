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
const THUMBS_KEY = 'rg_music_thumbs_up';

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

  // Thumbs-up counts — persisted to localStorage, shared across Card and SongList
  const [thumbsUpCounts, setThumbsUpCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(THUMBS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleThumbsUp = useCallback((songId: string) => {
    setThumbsUpCounts((prev) => {
      const next = { ...prev, [songId]: (prev[songId] ?? 0) + 1 };
      try { localStorage.setItem(THUMBS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = tracks[currentIndex] || tracks[0];

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const tracksRef = useRef(tracks);
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Central audio controller — synchronous src assignment to guarantee continuous auto-play on locked iPhone
  const selectSong = useCallback(
    (index: number, shouldPlay = true) => {
      const target = tracksRef.current[index];
      if (!target) return;

      const isSameTrack = index === currentIndexRef.current;
      currentIndexRef.current = index;
      setCurrentIndex(index);

      const audio = audioRef.current;
      if (!audio || !target.src) return;

      // Compare by URL pathname to avoid any endsWith false matches.
      // audio.src is always absolute (browser-resolved); target.src is root-relative.
      const currentPath = (() => { try { return new URL(audio.src).pathname; } catch { return audio.src; } })();
      if (currentPath !== target.src) {
        audio.src = target.src;
      }

      // Synchronously update iOS Lock Screen / Control Center info immediately
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: target.title,
            artist: target.artist || 'RG Music',
            album: target.album || 'RG Music Studio Archives',
            artwork: [
              {
                src: `${window.location.origin}/artwork-512.png`,
                sizes: '512x512',
                type: 'image/png',
              },
            ],
          });
          navigator.mediaSession.playbackState = shouldPlay ? 'playing' : 'paused';
        } catch {}
      }

      if (shouldPlay) {
        // Synchronous play call within the onended event loop allows iOS Safari
        // to maintain its background audio session when the screen is locked.
        audio
          .play()
          .then(() => {
            const wasPlaying = isPlayingRef.current;
            setIsPlaying(true);
            if (!isSameTrack || !wasPlaying) {
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
    },
    [incrementRealPlayCount]
  );

  const [isShuffle, setIsShuffle] = useState(true);
  const [isLoopForever, setIsLoopForever] = useState(true);
  const historyRef = useRef<number[]>([currentIndex]);
  const playedInShuffleRef = useRef<Set<number>>(new Set([currentIndex]));

  // Load initial track and attempt automatic playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.src) return;

    const initPath = (() => { try { return new URL(audio.src).pathname; } catch { return audio.src; } })();
    if (initPath !== currentTrack.src) {
      audio.src = currentTrack.src;
    }

    const attemptPlay = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            incrementRealPlayCount(currentIndexRef.current);
          })
          .catch(() => {
            // Browser requires a user gesture — unlock on first interaction
            let unlocked = false;
            const unlockAutoplay = () => {
              if (unlocked) return;
              unlocked = true;
              window.removeEventListener('pointerdown', unlockAutoplay);
              window.removeEventListener('keydown', unlockAutoplay);
              window.removeEventListener('touchstart', unlockAutoplay);

              if (audioRef.current && !isPlayingRef.current) {
                audioRef.current
                  .play()
                  .then(() => {
                    setIsPlaying(true);
                    incrementRealPlayCount(currentIndexRef.current);
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

    attemptPlay();
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

  // Shuffle mode toggle: toggle between ON and OFF
  const handleToggleShuffle = useCallback(() => {
    const next = !isShuffle;
    setIsShuffle(next);
    if (next) {
      // If turning shuffle ON, pick a random track and start playing
      const currentIdx = currentIndexRef.current;
      const currentTracks = tracksRef.current;
      const availableIndices = currentTracks
        .map((_, i) => i)
        .filter((i) => i !== currentIdx);
      const chosen =
        availableIndices[Math.floor(Math.random() * availableIndices.length)] ?? 0;
      playedInShuffleRef.current.clear();
      playedInShuffleRef.current.add(chosen);
      historyRef.current = [currentIdx, chosen];
      selectSong(chosen, true);
    }
  }, [isShuffle, selectSong]);

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
        if (isPrivateView) {
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
          }
        } else {
          handlePrev();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isPrivateView) {
          if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 5);
          }
        } else {
          handleNext();
        }
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
  }, [handleNext, handlePrev, isPlaying, currentIndex, incrementRealPlayCount, isPrivateView]);

  // Media Session API: Powers iOS Lock Screen & Control Center, Apple Watch, AirPods, and Android media notification
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || 'RG Music',
        album: currentTrack.album || 'RG Music Studio Archives',
        artwork: [
          {
            src: `${window.location.origin}/artwork-512.png`,
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        selectSong(currentIndex, true);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        selectSong(currentIndex, false);
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (isPrivateView) {
          if (audio) {
            audio.currentTime = 0;
          }
        } else {
          handlePrev();
        }
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (isPrivateView) {
          if (audio) {
            audio.currentTime = 0;
          }
        } else {
          handleNext(true);
        }
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && audio && !isNaN(details.seekTime)) {
          audio.currentTime = details.seekTime;
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (audio) {
          audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 10));
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (audio) {
          audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (details.seekOffset || 10));
        }
      });
    } catch (e) {
      console.warn('MediaSession handler warning:', e);
    }
  }, [currentTrack, currentIndex, handleNext, handlePrev, selectSong, isPrivateView]);

  // Synchronize playbackState with iOS lock screen
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {}
  }, [isPlaying]);

  // Synchronize position state (progress bar & duration) with iOS lock screen scrubber
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    const audio = audioRef.current;
    if (!audio) return;

    const updatePosition = () => {
      if (
        'setPositionState' in navigator.mediaSession &&
        audio.duration &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: Math.min(Math.max(0, audio.currentTime), audio.duration),
          });
        } catch {}
      }
    };

    audio.addEventListener('timeupdate', updatePosition);
    audio.addEventListener('durationchange', updatePosition);
    return () => {
      audio.removeEventListener('timeupdate', updatePosition);
      audio.removeEventListener('durationchange', updatePosition);
    };
  }, []);

  // Preload next upcoming track so iOS Safari has bytes buffered in cache ahead of time
  useEffect(() => {
    const nextIdx = (currentIndex + 1) % ALL_TRACKS.length;
    const nextTrack = ALL_TRACKS[nextIdx];
    if (nextTrack?.src) {
      // Warm up Safari network cache without interrupting current audio
      if (typeof fetch !== 'undefined') {
        fetch(nextTrack.src, { mode: 'no-cors' }).catch(() => {});
      }
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'prefetch';
      preloadLink.href = nextTrack.src;
      document.head.appendChild(preloadLink);
      return () => {
        if (document.head.contains(preloadLink)) {
          document.head.removeChild(preloadLink);
        }
      };
    }
  }, [currentIndex]);

  // On mount: decode ?s=<token> share links asynchronously.
  // Old ?song= sequential IDs are intentionally no longer accepted.
  useEffect(() => {
    const allIds = ALL_TRACKS.map((t) => t.id);

    const handleUrlRouting = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareToken = params.get('s');

      if (shareToken) {
        const songId = await decodeShareToken(shareToken, allIds);
        if (songId !== null) {
          const foundIdx = ALL_TRACKS.findIndex((t) => t.id === songId);
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
        const foundIdx = ALL_TRACKS.findIndex((t) => t.id === hashId);
        if (foundIdx !== -1) {
          setCurrentIndex(foundIdx);
          setIsPrivateView(true);
        }
      }
    };

    handleUrlRouting();
  }, []);

  // Keep URL updated when navigating tracks while in private view (async token generation)
  useEffect(() => {
    if (isPrivateView && currentTrack) {
      buildShareUrl(currentTrack.id, currentTrack.title).then((url) => {
        const newSearch = '?s=' + url.split('?s=')[1];
        if (window.location.search !== newSearch) {
          window.history.replaceState(null, '', url);
        }
      });
    }
  }, [isPrivateView, currentTrack]);

  // Share song: generate token URL (with readable slug) and copy to clipboard
  const handleShare = useCallback((songId: string) => {
    const triggerToast = () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      setCopiedToast(true);
      toastTimeoutRef.current = setTimeout(() => setCopiedToast(false), 2500);
    };

    const track = tracksRef.current.find((t) => t.id === songId);
    const title = track?.title ?? songId;

    buildShareUrl(songId, title).then((shareUrl) => {
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
  }, [tracks]);

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

      {/* Unified Master HTML5 Audio Engine — playsInline and preload=auto power seamless locked iPhone background playback */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
        onEnded={() => {
          if (isPrivateView) {
            // In shared view, never advance to other songs: repeat current song or stop
            if (isLoopForever && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            } else {
              setIsPlaying(false);
            }
          } else {
            if (isLoopForever) {
              handleNext(true);
            } else {
              setIsPlaying(false);
            }
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* 3. Top Header Navigation (z-20) */}
      <Header isPrivateView={isPrivateView} />

      {/* 4. Stage: Either Dedicated Isolated Single-Track Private View OR Full Main Stage */}
      {isPrivateView && currentTrack ? (
        <PrivateSongView
          song={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={() => selectSong(currentIndex, !isPlaying)}
          onShare={handleShare}
          audioRef={audioRef}
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
              thumbsUpCounts={thumbsUpCounts}
              onThumbsUp={handleThumbsUp}
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

          {/* Chronological List of All 31 Songs */}
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
              thumbsUpCounts={thumbsUpCounts}
              onThumbsUp={handleThumbsUp}
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
        {isPrivateView
          ? 'RG Music Studio Archives · Lossless Wax Master · Exclusive Audition'
          : `RG Music Studio Archives · ${TOTAL_SONGS} Recordings · ${TOTAL_DURATION_LABEL} Total Runtime · Lossless Wax Master`}
      </footer>
    </div>
  );
}
