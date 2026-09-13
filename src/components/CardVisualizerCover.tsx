import React from 'react';
import { motion } from 'framer-motion';

export type VisualizerArchetype =
  | 'spectrum'
  | 'radial-orbit'
  | 'analog-sine'
  | 'matrix-led'
  | 'bilateral-wave'
  | 'horizon-flux'
  | 'sound-iris'
  | 'quantum-vortex';

export interface VisualizerConfig {
  archetype: VisualizerArchetype;
  label: string;
  gradientClass: string;
  glowColor: string;
  accentColor: string;
  barCount?: number;
  ringCount?: number;
  waveCount?: number;
  segments?: number;
}

// 32 Bespoke Visualizer Configurations -- One for every single track in the catalog
export const TRACK_VISUALIZER_CONFIGS: Record<number, VisualizerConfig> = {
  1: {
    archetype: 'spectrum',
    label: 'SPECTRUM EQ',
    gradientClass: 'from-cyan-400 via-blue-500 to-indigo-600',
    glowColor: '#06b6d4',
    accentColor: '#38bdf8',
    barCount: 13,
  },
  2: {
    archetype: 'radial-orbit',
    label: 'RADIAL PULSE',
    gradientClass: 'from-fuchsia-400 via-purple-500 to-indigo-600',
    glowColor: '#d946ef',
    accentColor: '#e879f9',
    ringCount: 3,
  },
  3: {
    archetype: 'analog-sine',
    label: 'ANALOG SINE',
    gradientClass: 'from-rose-400 via-pink-500 to-amber-500',
    glowColor: '#f43f5e',
    accentColor: '#fb7185',
    waveCount: 3,
  },
  4: {
    archetype: 'matrix-led',
    label: 'MATRIX LED',
    gradientClass: 'from-amber-400 via-orange-500 to-yellow-500',
    glowColor: '#f59e0b',
    accentColor: '#fbbf24',
    barCount: 8,
    segments: 6,
  },
  5: {
    archetype: 'bilateral-wave',
    label: 'BILATERAL FLUX',
    gradientClass: 'from-emerald-400 via-teal-500 to-cyan-500',
    glowColor: '#10b981',
    accentColor: '#34d399',
    barCount: 15,
  },
  6: {
    archetype: 'horizon-flux',
    label: 'HORIZON PEAKS',
    gradientClass: 'from-purple-400 via-indigo-500 to-blue-600',
    glowColor: '#a855f7',
    accentColor: '#c084fc',
    waveCount: 3,
  },
  7: {
    archetype: 'sound-iris',
    label: 'SONIC APERTURE',
    gradientClass: 'from-indigo-400 via-blue-500 to-sky-400',
    glowColor: '#6366f1',
    accentColor: '#818cf8',
  },
  8: {
    archetype: 'quantum-vortex',
    label: 'QUANTUM VORTEX',
    gradientClass: 'from-violet-400 via-purple-600 to-fuchsia-500',
    glowColor: '#8b5cf6',
    accentColor: '#a78bfa',
  },
  9: {
    archetype: 'spectrum',
    label: 'SPECTRUM EQ',
    gradientClass: 'from-pink-400 via-rose-500 to-purple-600',
    glowColor: '#ec4899',
    accentColor: '#f472b6',
    barCount: 11,
  },
  10: {
    archetype: 'radial-orbit',
    label: 'RADIAL PULSE',
    gradientClass: 'from-yellow-400 via-amber-500 to-orange-500',
    glowColor: '#eab308',
    accentColor: '#fde047',
    ringCount: 4,
  },
  11: {
    archetype: 'analog-sine',
    label: 'ANALOG SINE',
    gradientClass: 'from-teal-300 via-cyan-500 to-blue-600',
    glowColor: '#14b8a6',
    accentColor: '#2dd4bf',
    waveCount: 2,
  },
  12: {
    archetype: 'matrix-led',
    label: 'MATRIX LED',
    gradientClass: 'from-orange-400 via-red-500 to-amber-500',
    glowColor: '#f97316',
    accentColor: '#fb923c',
    barCount: 9,
    segments: 5,
  },
  13: {
    archetype: 'bilateral-wave',
    label: 'BILATERAL FLUX',
    gradientClass: 'from-slate-200 via-sky-400 to-indigo-500',
    glowColor: '#94a3b8',
    accentColor: '#cbd5e1',
    barCount: 17,
  },
  14: {
    archetype: 'horizon-flux',
    label: 'HORIZON PEAKS',
    gradientClass: 'from-sky-400 via-blue-600 to-indigo-700',
    glowColor: '#0284c7',
    accentColor: '#38bdf8',
    waveCount: 4,
  },
  15: {
    archetype: 'sound-iris',
    label: 'SONIC APERTURE',
    gradientClass: 'from-fuchsia-400 via-purple-600 to-pink-500',
    glowColor: '#c084fc',
    accentColor: '#e879f9',
  },
  16: {
    archetype: 'quantum-vortex',
    label: 'QUANTUM VORTEX',
    gradientClass: 'from-red-400 via-rose-600 to-pink-500',
    glowColor: '#e11d48',
    accentColor: '#fb7185',
  },
  17: {
    archetype: 'spectrum',
    label: 'SPECTRUM EQ',
    gradientClass: 'from-cyan-300 via-teal-500 to-blue-600',
    glowColor: '#0891b2',
    accentColor: '#22d3ee',
    barCount: 15,
  },
  18: {
    archetype: 'radial-orbit',
    label: 'RADIAL PULSE',
    gradientClass: 'from-amber-400 via-orange-600 to-red-500',
    glowColor: '#b45309',
    accentColor: '#f59e0b',
    ringCount: 3,
  },
  19: {
    archetype: 'analog-sine',
    label: 'ANALOG SINE',
    gradientClass: 'from-emerald-300 via-green-500 to-teal-600',
    glowColor: '#059669',
    accentColor: '#34d399',
    waveCount: 3,
  },
  20: {
    archetype: 'matrix-led',
    label: 'MATRIX LED',
    gradientClass: 'from-purple-400 via-violet-600 to-indigo-700',
    glowColor: '#7e22ce',
    accentColor: '#a855f7',
    barCount: 8,
    segments: 7,
  },
  21: {
    archetype: 'bilateral-wave',
    label: 'BILATERAL FLUX',
    gradientClass: 'from-blue-300 via-indigo-500 to-slate-800',
    glowColor: '#6366f1',
    accentColor: '#818cf8',
    barCount: 19,
  },
  22: {
    archetype: 'horizon-flux',
    label: 'HORIZON PEAKS',
    gradientClass: 'from-violet-400 via-fuchsia-600 to-indigo-700',
    glowColor: '#9333ea',
    accentColor: '#c084fc',
    waveCount: 3,
  },
  23: {
    archetype: 'sound-iris',
    label: 'SONIC APERTURE',
    gradientClass: 'from-rose-400 via-amber-400 to-pink-500',
    glowColor: '#f43f5e',
    accentColor: '#fb7185',
  },
  24: {
    archetype: 'quantum-vortex',
    label: 'QUANTUM VORTEX',
    gradientClass: 'from-lime-400 via-emerald-500 to-teal-600',
    glowColor: '#84cc16',
    accentColor: '#a3e635',
  },
  25: {
    archetype: 'spectrum',
    label: 'SPECTRUM EQ',
    gradientClass: 'from-teal-300 via-cyan-500 to-sky-600',
    glowColor: '#06b6d4',
    accentColor: '#67e8f9',
    barCount: 14,
  },
  26: {
    archetype: 'radial-orbit',
    label: 'RADIAL PULSE',
    gradientClass: 'from-amber-300 via-yellow-500 to-orange-600',
    glowColor: '#d97706',
    accentColor: '#fde047',
    ringCount: 4,
  },
  27: {
    archetype: 'analog-sine',
    label: 'ANALOG SINE',
    gradientClass: 'from-slate-300 via-blue-400 to-indigo-600',
    glowColor: '#64748b',
    accentColor: '#94a3b8',
    waveCount: 2,
  },
  28: {
    archetype: 'matrix-led',
    label: 'MATRIX LED',
    gradientClass: 'from-blue-400 via-indigo-600 to-violet-700',
    glowColor: '#2563eb',
    accentColor: '#60a5fa',
    barCount: 9,
    segments: 6,
  },
  29: {
    archetype: 'bilateral-wave',
    label: 'BILATERAL FLUX',
    gradientClass: 'from-fuchsia-400 via-pink-600 to-purple-800',
    glowColor: '#86198f',
    accentColor: '#e879f9',
    barCount: 16,
  },
  30: {
    archetype: 'horizon-flux',
    label: 'HORIZON PEAKS',
    gradientClass: 'from-rose-500 via-red-600 to-amber-500',
    glowColor: '#be123c',
    accentColor: '#f43f5e',
    waveCount: 4,
  },
  31: {
    archetype: 'sound-iris',
    label: 'SONIC APERTURE',
    gradientClass: 'from-cyan-400 via-blue-600 to-indigo-800',
    glowColor: '#0369a1',
    accentColor: '#38bdf8',
  },
  32: {
    archetype: 'quantum-vortex',
    label: 'QUANTUM VORTEX',
    gradientClass: 'from-yellow-400 via-amber-600 to-orange-700',
    glowColor: '#ca8a04',
    accentColor: '#facc15',
  },
};

export function getVisualizerConfig(trackNumber: number | string): VisualizerConfig {
  const num = parseInt(String(trackNumber), 10);
  if (!isNaN(num) && TRACK_VISUALIZER_CONFIGS[num]) {
    return TRACK_VISUALIZER_CONFIGS[num];
  }
  // Deterministic fallback based on string hash
  const str = String(trackNumber);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
  }
  const fallbackId = (Math.abs(hash) % 32) + 1;
  return TRACK_VISUALIZER_CONFIGS[fallbackId] || TRACK_VISUALIZER_CONFIGS[1];
}

export interface CardVisualizerCoverProps {
  isPlaying: boolean;
  trackNumber: number | string;
  bgGradient?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ---------------------------------------------------------------------------
// ARCHETYPE 1: SPECTRUM EQ (Studio Equalizer Bars)
// ---------------------------------------------------------------------------
const SpectrumEqVisualizer: React.FC<{
  isPlaying: boolean;
  config: VisualizerConfig;
  size: 'sm' | 'md' | 'lg';
}> = ({ isPlaying, config, size }) => {
  const barCount = size === 'sm' ? 5 : size === 'lg' ? 16 : config.barCount || 12;

  const bars = Array.from({ length: barCount }).map((_, i) => {
    const ratio = i / (barCount - 1);
    const curve = Math.sin(ratio * Math.PI);
    const min = Math.max(12, Math.round(curve * 30 + 15));
    const max = Math.min(100, Math.round(curve * 65 + 35));
    const speed = 0.35 + ((i * 7) % 5) * 0.05;
    const delay = ((i * 3) % 7) * 0.04;
    return { min, max, speed, delay };
  });

  return (
    <div className="relative w-full h-full flex items-end justify-center gap-1 sm:gap-1.5 px-1 pb-1">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className={`flex-1 rounded-full bg-gradient-to-t ${config.gradientClass} shadow-sm`}
          style={{
            maxWidth: size === 'sm' ? 3 : size === 'lg' ? 8 : 6,
          }}
          animate={{
            height: isPlaying
              ? [`${bar.min}%`, `${bar.max}%`, `${bar.min + 12}%`]
              : `${bar.min + 10}%`,
          }}
          transition={{
            duration: bar.speed,
            delay: bar.delay,
            repeat: isPlaying ? Infinity : 0,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ARCHETYPE 2: RADIAL ORBIT (Concentric Sonar Rings & Orbiting Sound Nodes)
// ---------------------------------------------------------------------------
const RadialOrbitVisualizer: React.FC<{
  isPlaying: boolean;
  config: VisualizerConfig;
  size: 'sm' | 'md' | 'lg';
}> = ({ isPlaying, config, size }) => {
  const ringCount = size === 'sm' ? 2 : size === 'lg' ? 4 : config.ringCount || 3;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Central Pulsing Audio Core */}
      <motion.div
        className={`rounded-full bg-gradient-to-tr ${config.gradientClass} shadow-lg relative z-10 flex items-center justify-center`}
        style={{
          width: size === 'sm' ? 10 : size === 'lg' ? 36 : 24,
          height: size === 'sm' ? 10 : size === 'lg' ? 36 : 24,
          boxShadow: `0 0 15px ${config.glowColor}`,
        }}
        animate={{
          scale: isPlaying ? [0.9, 1.25, 0.95] : 1,
        }}
        transition={{
          duration: 1.2,
          repeat: isPlaying ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white shadow" />
      </motion.div>

      {/* Concentric Sonar Pulse Rings */}
      {Array.from({ length: ringCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-current pointer-events-none"
          style={{
            color: config.accentColor,
            width: size === 'sm' ? (i + 1) * 14 : size === 'lg' ? (i + 1) * 44 + 20 : (i + 1) * 28 + 14,
            height: size === 'sm' ? (i + 1) * 14 : size === 'lg' ? (i + 1) * 44 + 20 : (i + 1) * 28 + 14,
          }}
          animate={{
            scale: isPlaying ? [1, 1.15, 0.98] : 1,
            opacity: isPlaying ? [0.3, 0.8, 0.2] : 0.35 - i * 0.08,
          }}
          transition={{
            duration: 1.5 + i * 0.4,
            delay: i * 0.25,
            repeat: isPlaying ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Orbiting Satellite Particle */}
      {size !== 'sm' && (
        <motion.div
          className="absolute w-full h-full flex items-center justify-center pointer-events-none"
          animate={{ rotate: isPlaying ? 360 : 45 }}
          transition={{
            duration: 5,
            repeat: isPlaying ? Infinity : 0,
            ease: 'linear',
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full bg-white shadow-md absolute"
            style={{
              top: size === 'lg' ? '18%' : '14%',
              boxShadow: `0 0 10px ${config.glowColor}`,
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ARCHETYPE 3: ANALOG SINE (Flowing Phosphor Oscilloscope Waves)
// ---------------------------------------------------------------------------
const AnalogSineVisualizer: React.FC<{
  isPlaying: boolean;
  config: VisualizerConfig;
  size: 'sm' | 'md' | 'lg';
}> = ({ isPlaying, config, size }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center px-1">
      {size !== 'sm' && (
        <div className="absolute inset-2 border border-white/5 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-white/10" />
          <div className="absolute h-full w-px bg-white/10" />
        </div>
      )}

      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`grad-${config.glowColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={config.glowColor} stopOpacity="0.3" />
            <stop offset="50%" stopColor={config.accentColor} stopOpacity="1" />
            <stop offset="100%" stopColor={config.glowColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        <motion.path
          d={
            isPlaying
              ? 'M 0 25 Q 12 5, 25 25 T 50 25 T 75 25 T 100 25'
              : 'M 0 25 Q 15 15, 30 25 T 60 25 T 85 25 T 100 25'
          }
          fill="none"
          stroke={`url(#grad-${config.glowColor.replace('#', '')})`}
          strokeWidth={size === 'lg' ? '3' : '2'}
          strokeLinecap="round"
          animate={
            isPlaying
              ? {
                  d: [
                    'M 0 25 Q 12 5, 25 25 T 50 25 T 75 25 T 100 25',
                    'M 0 25 Q 12 45, 25 25 T 50 25 T 75 25 T 100 25',
                    'M 0 25 Q 12 10, 25 25 T 50 25 T 75 25 T 100 25',
                  ],
                }
              : {}
          }
          transition={{
            duration: 1.4,
            repeat: isPlaying ? Infinity : 0,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />

        {size !== 'sm' && (
          <motion.path
            d="M 0 25 Q 18 38, 35 25 T 70 25 T 100 25"
            fill="none"
            stroke={config.glowColor}
            strokeOpacity="0.6"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            animate={
              isPlaying
                ? {
                    d: [
                      'M 0 25 Q 18 38, 35 25 T 70 25 T 100 25',
                      'M 0 25 Q 18 12, 35 25 T 70 25 T 100 25',
                      'M 0 25 Q 18 35, 35 25 T 70 25 T 100 25',
                    ],
                  }
                : {}
            }
            transition={{
              duration: 1.8,
              repeat: isPlaying ? Infinity : 0,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
          />
        )}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ARCHETYPE 4: MATRIX LED (Digital Rack-Mount Segmented LED Meters)
// ---------------------------------------------------------------------------
const MatrixLedVisualizer: React.FC<{
  isPlaying: boolean;
  config: VisualizerConfig;
  size: 'sm' | 'md' | 'lg';
}> = ({ isPlaying, config, size }) => {
  const colCount = size === 'sm' ? 4 : size === 'lg' ? 10 : config.barCount || 8;
  const segCount = size === 'sm' ? 4 : size === 'lg' ? 8 : config.segments || 6;

  const cols = Array.from({ length: colCount }).map((_, colIdx) => {
    const activeSegs = Math.max(1, Math.round(Math.sin((colIdx / colCount) * Math.PI) * (segCount - 1) + 1));
    return { colIdx, activeSegs };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center gap-1 sm:gap-1.5 px-2">
      {cols.map(({ colIdx, activeSegs }) => (
        <div key={colIdx} className="flex-1 flex flex-col-reverse justify-center gap-1 h-full max-w-[9px]">
          {Array.from({ length: segCount }).map((_, segIdx) => {
            const isLit = segIdx < activeSegs;
            return (
              <motion.div
                key={segIdx}
                className="w-full h-1.5 sm:h-2 rounded-sm"
                style={{
                  backgroundColor: isLit ? config.accentColor : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isLit && isPlaying ? `0 0 6px ${config.glowColor}` : 'none',
                }}
                animate={
                  isPlaying
                    ? {
                        opacity: isLit ? [0.4, 1, 0.6] : 0.1,
                      }
                    : {
                        opacity: isLit ? 0.7 : 0.1,
                      }
                }
                transition={{
                  duration: 0.3 + (colIdx % 3) * 0.15,
                  delay: (colIdx * 0.05) + (segIdx * 0.02),
                  repeat: isPlaying ? Infinity : 0,
                  repeatType: 'reverse',
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ARCHETYPE 5: BILATERAL WAVE (SoundCloud / DAW Center-Origin Mirror Bars)
// ---------------------------------------------------------------------------
const BilateralWaveVisualizer: React.FC<{
  isPlaying: boolean;
  config: VisualizerConfig;
  size: 'sm' | 'md' | 'lg';
}> = ({ isPlaying, config, size }) => {
  const barCount = size === 'sm' ? 6 : size === 'lg' ? 18 : config.barCount || 14;

  const bars = Array.from({ length: barCount }).map((_, i) => {
    const ratio = i / (barCount - 1);
    const wave = Math.sin(ratio * Math.PI * 1.5);
    const baseH = Math.max(15, Math.round(Math.abs(wave) * 40 + 15));
    return {
      min: baseH,
      max: Math.min(95, baseH + 45),
      speed: 0.35 + (i % 4) * 0.08,
      delay: (i % 5) * 0.05,
    };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center gap-0.5 sm:gap-1 px-1">
      <div className="absolute inset-x-2 h-px bg-white/15 pointer-events-none" />

      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className={`flex-1 rounded-full bg-gradient-to-b ${config.gradientClass} shadow-sm`}
          style={{
            maxWidth: size === 'sm' ? 2.5 : size === 'lg' ? 6 : 5,
          }}
          animate={{
            height: isPlaying
              ? [`${bar.min}%`, `${bar.max}%`, `${bar.min + 10}%`]
              : `${bar.min}%`,
          }}
          transition={{
            duration: bar.speed,
            delay: bar.delay,
            repeat: isPlaying ? Infinity : 0,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// ARCHETYPE 6: HORIZON FLUX (Layered Topographic Frequency Horizon Peaks)
// ---------------------------------------------------------------------------
const HorizonFluxVisualizer: React.FC<{
  isPlaying: boolean;
  config: VisualizerConfig;
  size: 'sm' | 'md' | 'lg';
}> = ({ isPlaying, config, size }) => {
  return (
    <div className="relative w-full h-full flex items-end justify-center overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 120 60"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`flux-${config.glowColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={config.accentColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={config.glowColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <motion.path
          d="M 0 60 L 0 35 Q 30 15, 60 30 T 120 20 L 120 60 Z"
          fill={config.glowColor}
          fillOpacity="0.25"
          animate={
            isPlaying
              ? {
                  d: [
                    'M 0 60 L 0 35 Q 30 15, 60 30 T 120 20 L 120 60 Z',
                    'M 0 60 L 0 25 Q 30 35, 60 15 T 120 30 L 120 60 Z',
                    'M 0 60 L 0 35 Q 30 15, 60 30 T 120 20 L 120 60 Z',
                  ],
                }
              : {}
          }
          transition={{ duration: 2.2, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
        />

        <motion.path
          d="M 0 60 L 0 42 Q 25 22, 55 35 T 120 25 L 120 60 Z"
          fill={`url(#flux-${config.glowColor.replace('#', '')})`}
          stroke={config.accentColor}
          strokeWidth={size === 'lg' ? '2' : '1.5'}
          animate={
            isPlaying
              ? {
                  d: [
                    'M 0 60 L 0 42 Q 25 22, 55 35 T 120 25 L 120 60 Z',
                    'M 0 60 L 0 28 Q 25 40, 55 18 T 120 38 L 120 60 Z',
                    'M 0 60 L 0 42 Q 25 22, 55 35 T 120 25 L 120 60 Z',
                  ],
                }
              : {}
          }
          transition={{ duration: 1.6, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ARCHETYPE 7: SONIC IRIS (Sacred Geometric Sound Aperture & Mandala)
// ---------------------------------------------------------------------------
const SonicIrisVisualizer: React.FC<{
  isPlaying: boolean;
  config: VisualizerConfig;
  size: 'sm' | 'md' | 'lg';
}> = ({ isPlaying, config, size }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="absolute rounded-2xl border pointer-events-none"
        style={{
          borderColor: config.glowColor,
          width: size === 'sm' ? 24 : size === 'lg' ? 90 : 56,
          height: size === 'sm' ? 24 : size === 'lg' ? 90 : 56,
          opacity: 0.45,
        }}
        animate={{
          rotate: isPlaying ? 360 : 45,
          scale: isPlaying ? [1, 1.15, 0.95] : 1,
        }}
        transition={{
          rotate: { duration: 8, repeat: isPlaying ? Infinity : 0, ease: 'linear' },
          scale: { duration: 1.4, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        }}
      />

      <motion.div
        className="absolute rounded-xl border border-dashed pointer-events-none"
        style={{
          borderColor: config.accentColor,
          width: size === 'sm' ? 16 : size === 'lg' ? 62 : 38,
          height: size === 'sm' ? 16 : size === 'lg' ? 62 : 38,
          opacity: 0.65,
        }}
        animate={{
          rotate: isPlaying ? -360 : 0,
          scale: isPlaying ? [1.1, 0.9, 1.1] : 1,
        }}
        transition={{
          rotate: { duration: 6, repeat: isPlaying ? Infinity : 0, ease: 'linear' },
          scale: { duration: 1.1, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' },
        }}
      />

      <motion.div
        className={`rounded-full bg-gradient-to-tr ${config.gradientClass} shadow-md flex items-center justify-center`}
        style={{
          width: size === 'sm' ? 8 : size === 'lg' ? 26 : 16,
          height: size === 'sm' ? 8 : size === 'lg' ? 26 : 16,
          boxShadow: `0 0 12px ${config.glowColor}`,
        }}
        animate={{
          scale: isPlaying ? [0.85, 1.3, 0.85] : 1,
        }}
        transition={{
          duration: 0.9,
          repeat: isPlaying ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// ARCHETYPE 8: QUANTUM VORTEX (Orbiting Constellation Nodes & Singularity)
// ---------------------------------------------------------------------------
const QuantumVortexVisualizer: React.FC<{
  isPlaying: boolean;
  config: VisualizerConfig;
  size: 'sm' | 'md' | 'lg';
}> = ({ isPlaying, config, size }) => {
  const nodeCount = size === 'sm' ? 3 : size === 'lg' ? 6 : 4;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className={`rounded-full bg-gradient-to-r ${config.gradientClass} relative z-10`}
        style={{
          width: size === 'sm' ? 8 : size === 'lg' ? 28 : 18,
          height: size === 'sm' ? 8 : size === 'lg' ? 28 : 18,
          boxShadow: `0 0 14px ${config.glowColor}`,
        }}
        animate={{
          scale: isPlaying ? [1, 1.4, 1] : 1,
        }}
        transition={{
          duration: 1.1,
          repeat: isPlaying ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-full h-full flex items-center justify-center pointer-events-none"
        animate={{
          rotate: isPlaying ? 360 : 0,
        }}
        transition={{
          duration: 7,
          repeat: isPlaying ? Infinity : 0,
          ease: 'linear',
        }}
      >
        {Array.from({ length: nodeCount }).map((_, i) => {
          const angle = (i / nodeCount) * Math.PI * 2;
          const radius = size === 'sm' ? 12 : size === 'lg' ? 48 : 30;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={i}
              className="absolute rounded-full shadow-sm"
              style={{
                width: size === 'sm' ? 3 : size === 'lg' ? 8 : 5,
                height: size === 'sm' ? 3 : size === 'lg' ? 8 : 5,
                backgroundColor: config.accentColor,
                boxShadow: `0 0 8px ${config.glowColor}`,
                transform: `translate(${x}px, ${y}px)`,
              }}
              animate={{
                scale: isPlaying ? [1, 1.4, 0.8] : 1,
                opacity: isPlaying ? [0.6, 1, 0.5] : 0.7,
              }}
              transition={{
                duration: 1.2 + i * 0.2,
                repeat: isPlaying ? Infinity : 0,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// MASTER COMPONENT: CardVisualizerCover
// ---------------------------------------------------------------------------
export const CardVisualizerCover: React.FC<CardVisualizerCoverProps> = ({
  isPlaying,
  trackNumber,
  bgGradient,
  title = '',
  size = 'md',
  className = '',
}) => {
  const formattedTrack = String(trackNumber).padStart(2, '0');
  const config = getVisualizerConfig(trackNumber);
  const effectiveGradient = bgGradient || config.glowColor;

  const renderVisualizerCore = () => {
    switch (config.archetype) {
      case 'radial-orbit':
        return <RadialOrbitVisualizer isPlaying={isPlaying} config={config} size={size} />;
      case 'analog-sine':
        return <AnalogSineVisualizer isPlaying={isPlaying} config={config} size={size} />;
      case 'matrix-led':
        return <MatrixLedVisualizer isPlaying={isPlaying} config={config} size={size} />;
      case 'bilateral-wave':
        return <BilateralWaveVisualizer isPlaying={isPlaying} config={config} size={size} />;
      case 'horizon-flux':
        return <HorizonFluxVisualizer isPlaying={isPlaying} config={config} size={size} />;
      case 'sound-iris':
        return <SonicIrisVisualizer isPlaying={isPlaying} config={config} size={size} />;
      case 'quantum-vortex':
        return <QuantumVortexVisualizer isPlaying={isPlaying} config={config} size={size} />;
      case 'spectrum':
      default:
        return <SpectrumEqVisualizer isPlaying={isPlaying} config={config} size={size} />;
    }
  };

  if (size === 'sm') {
    return (
      <div
        title={`${title} (${config.label})`}
        className={`w-10 h-10 rounded-lg bg-zinc-950 border border-white/20 shadow-sm relative overflow-hidden flex items-center justify-center p-1 select-none flex-shrink-0 ${className}`}
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: `radial-gradient(circle at center, ${config.glowColor}, transparent 80%)` }}
        />
        {renderVisualizerCore()}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div
        title={`${title} · ${config.label}`}
        className={`relative z-10 w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20 bg-zinc-950 flex-shrink-0 flex flex-col justify-between p-4 sm:p-5 select-none ${className}`}
      >
        <div
          className="absolute inset-0 opacity-45 pointer-events-none blur-2xl"
          style={{
            background: `radial-gradient(circle at center, ${effectiveGradient}, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/70 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-widest font-bold text-white/95 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              TRK #{formattedTrack}
            </span>
            <span
              className="font-mono text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border"
              style={{
                color: config.accentColor,
                borderColor: `${config.glowColor}55`,
                backgroundColor: `${config.glowColor}22`,
              }}
            >
              {config.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
              }`}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
              {isPlaying ? 'AUDIO LIVE' : 'STUDIO MASTER'}
            </span>
          </div>
        </div>

        <div className="relative z-10 w-full h-24 sm:h-28 flex items-center justify-center px-1">
          {renderVisualizerCore()}
        </div>

        <div className="relative z-10 flex items-center justify-between w-full border-t border-white/10 pt-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-white/80 truncate max-w-[130px]">
            {title ? title : 'RG MUSIC'}
          </span>
          <span className="font-mono text-[9px] text-white/50 tracking-wider">
            33 ⅓ RPM · 180G WAX
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      title={`${title} · ${config.label}`}
      className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/10 bg-zinc-950 flex-shrink-0 flex flex-col justify-between p-3 select-none transition-transform duration-500 hover:scale-105 ${className}`}
    >
      <div
        className="absolute inset-0 opacity-40 pointer-events-none blur-lg"
        style={{
          background: `radial-gradient(circle at top center, ${effectiveGradient}, transparent 75%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/60 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="font-mono text-[9px] uppercase tracking-widest font-bold text-white/95 bg-white/10 border border-white/15 px-2 py-0.5 rounded-full backdrop-blur-sm">
          TRK {formattedTrack}
        </span>
        <span
          className="font-mono text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full border backdrop-blur-sm"
          style={{
            color: config.accentColor,
            borderColor: `${config.glowColor}44`,
            backgroundColor: `${config.glowColor}20`,
          }}
        >
          {config.label}
        </span>
      </div>

      <div className="relative z-10 w-full h-16 sm:h-18 flex items-center justify-center px-0.5">
        {renderVisualizerCore()}
      </div>

      <div className="relative z-10 flex items-center justify-between w-full border-t border-white/10 pt-1.5">
        <span className="font-mono text-[8px] tracking-[0.2em] uppercase font-bold text-white/70 truncate max-w-[85px]">
          {title ? title : 'RG MUSIC'}
        </span>
        <span className="font-mono text-[8px] text-white/40">
          33 RPM
        </span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// VINYL CENTER RECORD LABEL (Color-Coordinated with the song's visualizer)
// ---------------------------------------------------------------------------
export interface VinylCenterLabelProps {
  trackNumber: number | string;
  size?: 'sm' | 'md' | 'lg';
}

export const VinylCenterLabel: React.FC<VinylCenterLabelProps> = ({
  trackNumber,
  size = 'md',
}) => {
  const formatted = String(trackNumber).padStart(2, '0');
  const config = getVisualizerConfig(trackNumber);

  if (size === 'lg') {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-zinc-700/80 shadow-inner relative flex flex-col items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-950 select-none p-1">
        <div
          className="absolute inset-1 rounded-full border opacity-50 pointer-events-none"
          style={{ borderColor: config.glowColor }}
        />
        <span className="font-mono text-[7px] tracking-widest text-zinc-400 uppercase font-bold">
          RG MUSIC
        </span>
        <span
          className="font-mono text-[11px] font-bold tracking-wider my-0.5"
          style={{ color: config.accentColor }}
        >
          #{formatted}
        </span>
        <span className="font-mono text-[6px] tracking-wider text-zinc-500">
          33 ⅓ RPM
        </span>
        <div className="absolute w-4 h-4 rounded-full bg-zinc-950 border border-white/60 shadow-inner" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-zinc-700/80 shadow-inner relative flex flex-col items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-950 select-none p-0.5">
      <div
        className="absolute inset-1 rounded-full border opacity-50 pointer-events-none"
        style={{ borderColor: config.glowColor }}
      />
      <span className="font-mono text-[6px] tracking-widest text-zinc-400 uppercase font-bold">
        RG
      </span>
      <span
        className="font-mono text-[9px] font-bold tracking-wider my-0.5"
        style={{ color: config.accentColor }}
      >
        #{formatted}
      </span>
      <span className="font-mono text-[5px] text-zinc-500">
        33 RPM
      </span>
      <div className="absolute w-3 h-3 rounded-full bg-zinc-950 border border-white/60 shadow-inner" />
    </div>
  );
};

export default CardVisualizerCover;
