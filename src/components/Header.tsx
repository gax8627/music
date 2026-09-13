import { TOTAL_SONGS, TOTAL_DURATION_LABEL } from '../data/tracks';

export interface HeaderProps {
  totalSongs?: number;
  totalTime?: string;
  cartCount?: number;
  onCartClick?: () => void;
}

export const Header = ({
  totalSongs = TOTAL_SONGS,
  totalTime = TOTAL_DURATION_LABEL,
}: HeaderProps = {}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-8 md:px-12 py-3.5 sm:py-6 flex items-center justify-between">
      {/* Left: Rebranded RG Music Logo */}
      <a
        href="#"
        className="text-base sm:text-lg md:text-xl tracking-tight text-white font-bold flex items-center gap-2 select-none"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-white"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.8" />
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" strokeOpacity="0.25" />
          <path
            d="M7.5 12a4.5 4.5 0 0 1 4.5-4.5"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16.5 12a4.5 4.5 0 0 1-4.5 4.5"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2.5" fill="#3B82F6" />
          <circle cx="12" cy="12" r="0.8" fill="#0B0F19" />
        </svg>
        <span>RG Music</span>
      </a>

      {/* Right: Studio Status & Total Songs / Time Badge */}
      <div className="flex items-center gap-2 liquid-glass rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs text-white/90 select-none shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-mono tracking-wide font-medium">
          {totalSongs} Songs · {totalTime}
        </span>
      </div>
    </header>
  );
};

export default Header;
