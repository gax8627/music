import { useState, useMemo } from 'react';
import { Play, Pause, Search, ThumbsUp, Headphones, Calendar, ArrowUpDown } from 'lucide-react';
import { Song } from './Card';
import { PremiumShuffleIcon, PremiumLoopIcon, PremiumShareIcon } from './PremiumIcons';
import CardVisualizerCover from './CardVisualizerCover';

export interface SongListProps {
  songs: Song[];
  currentIndex: number;
  isPlaying: boolean;
  onSelectSong: (index: number, shouldPlay?: boolean) => void;
  className?: string;
  isShuffle?: boolean;
  onToggleShuffle?: () => void;
  isLoopForever?: boolean;
  onToggleLoopForever?: () => void;
  onShare?: (songId: string) => void;
  thumbsUpCounts?: Record<string, number>;
  onThumbsUp?: (songId: string) => void;
}

export default function SongList({
  songs,
  currentIndex,
  isPlaying,
  onSelectSong,
  className = '',
  isShuffle = false,
  onToggleShuffle,
  isLoopForever = true,
  onToggleLoopForever,
  onShare,
  thumbsUpCounts = {},
  onThumbsUp,
}: SongListProps) {
  type SortMode = 'oldest' | 'newest' | 'most-played';
  const [sortMode, setSortMode] = useState<SortMode>('oldest');

  const cycleSortMode = () => {
    setSortMode((prev) => {
      if (prev === 'oldest') return 'newest';
      if (prev === 'newest') return 'most-played';
      return 'oldest';
    });
  };

  const sortLabel: Record<SortMode, string> = {
    oldest: 'Oldest First',
    newest: 'Newest First',
    'most-played': 'Most Played',
  };

  const [searchQuery, setSearchQuery] = useState('');

  const totalDurationLabel = useMemo(() => {
    const totalSecs = songs.reduce(
      (acc, s) =>
        acc + (typeof s.duration === 'number' ? s.duration : parseFloat(String(s.duration)) || 0),
      0
    );
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  }, [songs]);

  const stripAccents = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const processedSongs = useMemo(() => {
    let list = songs.map((song, originalIdx) => ({ song, originalIdx }));

    if (sortMode === 'newest') {
      list = [...list].reverse();
    } else if (sortMode === 'most-played') {
      list = [...list].sort((a, b) => {
        const pa = typeof a.song.plays === 'number' ? a.song.plays : 0;
        const pb = typeof b.song.plays === 'number' ? b.song.plays : 0;
        return pb - pa;
      });
    }

    const q = stripAccents(searchQuery.trim());
    if (!q) return list;

    return list.filter(
      ({ song }) =>
        stripAccents(song.title).includes(q) ||
        stripAccents(song.artist).includes(q) ||
        (song.createdDate && stripAccents(song.createdDate).includes(q))
    );
  }, [songs, searchQuery, sortMode]);

  return (
    <div
      className={`w-full max-w-5xl mx-auto liquid-glass rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-3.5 select-none ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600/90 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight flex items-center flex-wrap gap-1.5 sm:gap-2">
              <span>All Recordings</span>
              <span className="text-[11px] sm:text-xs font-normal text-white/80 bg-white/15 px-2 sm:px-2.5 py-0.5 rounded-full border border-white/10 font-mono">
                {songs.length} tracks · {totalDurationLabel}
              </span>
            </h3>
            <p className="text-xs text-white/70">
              Chronological studio catalog from May 2026 to Sept 2026
            </p>
          </div>
        </div>

        {/* Controls: Shuffle, Loop, Sort Toggle + Search */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
          {/* Shuffle Mode Toggle (Luxury Monochrome Icon) */}
          <button
            type="button"
            onClick={onToggleShuffle}
            aria-label="Toggle shuffle"
            className={`rounded-xl p-2.5 transition-all cursor-pointer shrink-0 ${
              isShuffle
                ? 'bg-white text-zinc-950 shadow-[0_0_16px_rgba(255,255,255,0.4)] ring-1 ring-white scale-105'
                : 'liquid-glass text-white/60 hover:text-white hover:bg-white/15 active:scale-95'
            }`}
            title={isShuffle ? 'Shuffle Active (Plays automatically)' : 'Shuffle music'}
          >
            <PremiumShuffleIcon size={14} className={isShuffle ? 'animate-pulse' : ''} />
          </button>

          {/* Loop Forever Toggle (Luxury Monochrome Icon) */}
          <button
            type="button"
            onClick={onToggleLoopForever}
            aria-label="Toggle loop all"
            className={`rounded-xl p-2.5 transition-all cursor-pointer shrink-0 ${
              isLoopForever
                ? 'bg-white text-zinc-950 shadow-[0_0_16px_rgba(255,255,255,0.4)] ring-1 ring-white scale-105'
                : 'liquid-glass text-white/60 hover:text-white hover:bg-white/15 active:scale-95'
            }`}
            title={isLoopForever ? 'Loop Active (All 32 Songs)' : 'Toggle continuous loop'}
          >
            <PremiumLoopIcon size={14} />
          </button>

          {/* Sort order toggle — cycles: Oldest → Newest → Most Played */}
          <button
            type="button"
            onClick={cycleSortMode}
            aria-label="Change sort order"
            className={`liquid-glass rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              sortMode === 'most-played'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                : 'text-white hover:bg-white/15'
            }`}
            title="Cycle sort: Oldest → Newest → Most Played"
          >
            <ArrowUpDown size={13} />
            <span className="hidden sm:inline">{sortLabel[sortMode]}</span>
          </button>

          {/* Quick Search */}
          <div className="relative w-full sm:w-56">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 33 tracks..."
              aria-label="Search 33 tracks"
              className="w-full bg-white/10 text-white placeholder-white/40 text-xs rounded-xl pl-8 pr-3 py-2 border border-white/10 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Song List Items Container with Custom Glass Scrollbar */}
      <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-thin">
        {processedSongs.length === 0 ? (
          <div className="text-center py-8 text-white/50 text-xs font-mono">
            No tracks found matching "{searchQuery}"
          </div>
        ) : (
          processedSongs.map(({ song, originalIdx }) => {
            const isActive = originalIdx === currentIndex;
            const isSongPlaying = isActive && isPlaying;
            const thumbsCount = thumbsUpCounts[song.id] ?? 0;
            const playCount = typeof song.plays === 'number' ? song.plays : 0;
            const playLabel = `${playCount} ${playCount === 1 ? 'play' : 'plays'}`;

            return (
              <div
                key={song.id}
                onClick={() => onSelectSong(originalIdx, true)}
                className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white/20 border border-blue-400/40 shadow-lg shadow-black/10'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                {/* Left side: Track #, Play Button, Cover & Titles */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* Play Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSong(originalIdx, !isSongPlaying);
                    }}
                    aria-label={isSongPlaying ? 'Pause track' : 'Play track'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                        : 'bg-white/10 group-hover:bg-white text-white group-hover:text-zinc-900'
                    }`}
                  >
                    {isSongPlaying ? (
                      <Pause size={13} fill="currentColor" />
                    ) : (
                      <Play size={13} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  <span className="text-xs font-mono text-white/40 w-5 shrink-0 hidden sm:inline">
                    {String(originalIdx + 1).padStart(2, '0')}
                  </span>

                  {/* Mini Visualizer Cover Thumbnail (Replaces Stock Image) */}
                  <CardVisualizerCover
                    isPlaying={isActive && isPlaying}
                    trackNumber={originalIdx + 1}
                    bgGradient={song.bgGradient}
                    title={song.title}
                    size="sm"
                  />

                  {/* Song Title, Artist & Creation Date */}
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold truncate leading-tight ${
                          isActive
                            ? 'text-blue-300 font-bold'
                            : 'text-white group-hover:text-white'
                        }`}
                      >
                        {song.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/70 shrink-0">
                        Demo
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-white/60 truncate">
                        {song.artist || 'RG Music'}
                      </p>
                      {song.createdDate && (
                        <span className="text-[10px] font-mono text-white/40 hidden sm:inline">
                          · {song.createdDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Real Play Count, Duration & Like */}
                <div className="flex items-center gap-2 sm:gap-5 shrink-0">
                  {/* Real Play Count */}
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono text-white/70">
                    <Headphones size={12} className="text-blue-400 shrink-0" />
                    <span className="hidden sm:inline">{playLabel}</span>
                    <span className="sm:hidden">{playCount}</span>
                  </div>

                  {/* Duration */}
                  <span className="text-[11px] sm:text-xs font-mono text-white/60 w-10 sm:w-12 text-right">
                    {song.durationFormatted || '02:54'}
                  </span>

                  {/* Share button */}
                  {onShare && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(song.id);
                      }}
                      aria-label="Share song"
                      title="Share private link"
                      className="p-1 sm:p-1.5 text-white/40 hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      <PremiumShareIcon size={13} />
                    </button>
                  )}

                  {/* Thumbs Up + Count */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onThumbsUp?.(song.id);
                    }}
                    aria-label="Thumbs up"
                    title="Like this track"
                    className={`flex items-center gap-1 p-1 sm:p-1.5 rounded-lg transition-all cursor-pointer group/thumb ${
                      thumbsCount > 0
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-white/30 hover:text-blue-400'
                    }`}
                  >
                    <ThumbsUp
                      size={13}
                      className={`transition-transform group-hover/thumb:scale-110 active:scale-95 ${thumbsCount > 0 ? 'fill-blue-400' : ''}`}
                    />
                    {thumbsCount > 0 && (
                      <span className="text-[11px] font-mono font-semibold leading-none">
                        {thumbsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
