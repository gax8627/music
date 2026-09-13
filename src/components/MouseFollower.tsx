import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function MouseFollower({ isPlaying = false }: { isPlaying?: boolean }) {
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Smooth spring physics for fluid cursor tracking
  const springConfig = { damping: 28, stiffness: 320, mass: 0.5 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  // Slower spring for ambient ambient light halo
  const haloConfig = { damping: 40, stiffness: 120, mass: 1.2 };
  const haloX = useSpring(-200, haloConfig);
  const haloY = useSpring(-200, haloConfig);

  useEffect(() => {
    // Only enable on pointer-capable devices
    if (window.matchMedia('(hover: none)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      haloX.set(e.clientX);
      haloY.set(e.clientY);

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('button') ||
          target.closest('a') ||
          target.closest('[role="button"]') ||
          target.closest('.cursor-pointer'))
      ) {
        setIsHoveringClickable(true);
      } else {
        setIsHoveringClickable(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, haloX, haloY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* 1. Large Ambient Studio Glow Halo */}
      <motion.div
        className="fixed top-0 left-0 w-80 h-80 -ml-40 -mt-40 rounded-full blur-3xl pointer-events-none mix-blend-screen"
        style={{
          x: haloX,
          y: haloY,
          background: isPlaying
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(99, 102, 241, 0.12) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 70%)',
        }}
        animate={{
          scale: isPlaying ? [1, 1.12, 1] : 1,
        }}
        transition={{
          repeat: isPlaying ? Infinity : 0,
          duration: 2.2,
          ease: 'easeInOut',
        }}
      />

      {/* 2. Interactive Magnetic Ring Positioner */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none flex items-center justify-center backdrop-blur-sm"
          animate={{
            width: isHoveringClickable ? 48 : 28,
            height: isHoveringClickable ? 48 : 28,
            borderColor: isHoveringClickable
              ? 'rgba(96, 165, 250, 0.9)'
              : 'rgba(255, 255, 255, 0.4)',
            backgroundColor: isHoveringClickable
              ? 'rgba(59, 130, 246, 0.12)'
              : 'rgba(255, 255, 255, 0.04)',
          }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        >
          {/* Subtle center dot */}
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"
            animate={{
              scale: isHoveringClickable ? 1.5 : 1,
              backgroundColor: isHoveringClickable ? '#60A5FA' : '#FFFFFF',
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
