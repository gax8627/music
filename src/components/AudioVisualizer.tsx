import { useEffect, useRef } from 'react';
import { Activity, Radio } from 'lucide-react';

export interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  trackTitle?: string;
  className?: string;
}

export default function AudioVisualizer({
  isPlaying,
  trackTitle = '',
  className = '',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Visualizer render loop using harmonic frequency simulation
  // This completely decouples the visualizer from AudioContext / createMediaElementSource,
  // ensuring the HTML5 <audio> element remains on iOS's native hardware AVFoundation pipeline
  // so playback never stops when the iPhone screen is locked.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 48;
    const simBars = Array.from({ length: barCount }, () => 0.08);

    let phase = 0;
    let settlingFrames = 0;
    const maxSettlingFrames = 40;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      phase += isPlaying ? 0.08 : 0.01;

      // Draw subtle background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 10; y < height; y += 14) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      const totalGap = 3;
      const barWidth = Math.max(2, (width - barCount * totalGap) / barCount);

      // Create gradient for bars
      const grad = ctx.createLinearGradient(0, height, 0, 0);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.85)'); // Blue
      grad.addColorStop(0.55, 'rgba(96, 165, 250, 0.95)'); // Light Blue
      grad.addColorStop(0.85, 'rgba(167, 139, 250, 0.95)'); // Purple
      grad.addColorStop(1, 'rgba(244, 114, 182, 1)'); // Pink peak

      let isStillMoving = isPlaying;

      for (let i = 0; i < barCount; i++) {
        let targetHeight = 0.08;

        if (isPlaying) {
          // Pure harmonic wave spectrum simulation
          const wave1 = Math.sin(phase + i * 0.28) * 0.35 + 0.45;
          const wave2 = Math.cos(phase * 1.5 + i * 0.45) * 0.25;
          const wave3 = Math.sin(phase * 0.6 + i * 0.12) * 0.2;
          targetHeight = Math.max(0.12, Math.min(0.96, wave1 + wave2 + wave3));
        }

        // Smooth interpolation
        const diff = targetHeight - simBars[i];
        simBars[i] += diff * 0.25;
        if (!isPlaying && Math.abs(diff) > 0.005) {
          isStillMoving = true;
        }

        const h = simBars[i] * (height - 8);
        const x = i * (barWidth + totalGap);
        const y = height - h;

        // Draw bar
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, [3, 3, 0, 0]);
        ctx.fill();

        // Peak cap highlight
        if (isPlaying && simBars[i] > 0.3) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(x, Math.max(0, y - 2.5), barWidth, 1.5);
        }
      }

      if (isPlaying || (isStillMoving && settlingFrames < maxSettlingFrames)) {
        if (!isPlaying) settlingFrames++;
        animFrameIdRef.current = requestAnimationFrame(render);
      } else {
        animFrameIdRef.current = null;
      }
    };

    render();

    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div
      className={`w-full max-w-5xl mx-auto liquid-glass rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col gap-2 shadow-xl select-none ${className}`}
    >
      {/* Visualizer Status Bar */}
      <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-blue-400 font-mono font-medium tracking-wider text-[11px]">
            <Radio
              size={13}
              className={isPlaying ? 'animate-pulse text-blue-400' : 'text-white/40'}
            />
            <span className="uppercase">{isPlaying ? 'Audio Reactive Spectrum' : 'Studio Analyzer (Standby)'}</span>
          </div>

          {trackTitle && isPlaying && (
            <span className="hidden sm:inline text-white/50 text-[11px] font-mono truncate max-w-xs">
              · {trackTitle}
            </span>
          )}
        </div>

        {/* Studio Specs */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-white/60">
          <span className="flex items-center gap-1">
            <Activity size={11} className={isPlaying ? 'text-emerald-400' : 'text-white/30'} />
            <span>{isPlaying ? '48.0 kHz · 24-Bit' : 'Idle'}</span>
          </span>
          <span className="hidden sm:inline text-white/40">48 Bands</span>
        </div>
      </div>

      {/* Canvas Spectrum Display */}
      <div className="w-full h-16 sm:h-20 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={80}
          className="w-full h-full object-fill rounded-lg"
        />
      </div>

      {/* Frequency scale markers */}
      <div className="flex justify-between items-center text-[9px] font-mono text-white/40 pt-0.5 px-1">
        <span>20 Hz</span>
        <span className="hidden sm:inline">80 Hz</span>
        <span>250 Hz</span>
        <span>1 kHz</span>
        <span className="hidden sm:inline">4 kHz</span>
        <span>8 kHz</span>
        <span className="hidden sm:inline">16 kHz</span>
        <span>24 kHz</span>
      </div>
    </div>
  );
}
