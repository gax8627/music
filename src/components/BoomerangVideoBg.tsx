import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface BoomerangVideoBgProps {
  src?: string;
  className?: string;
}

const DEFAULT_VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4';

export const BoomerangVideoBg: React.FC<BoomerangVideoBgProps> = ({
  src = DEFAULT_VIDEO_SRC,
  className,
}) => {
  const [isBoomerang, setIsBoomerang] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Storage for captured off-screen canvas frames
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  // Animation and callback IDs for proper cleanup
  const rafCaptureIdRef = useRef<number | null>(null);
  const rafPlaybackIdRef = useRef<number | null>(null);
  const rvfcIdRef = useRef<number | null>(null);

  // Status flags
  const isCapturingRef = useRef<boolean>(false);
  const isCompletedRef = useRef<boolean>(false);
  const fallbackTriggeredRef = useRef<boolean>(false);

  // Graceful fallback to looping native video element
  const triggerFallback = useCallback(() => {
    if (fallbackTriggeredRef.current) return;
    fallbackTriggeredRef.current = true;
    isCapturingRef.current = false;

    // Clean up any ongoing frame callbacks
    if (rvfcIdRef.current !== null && videoRef.current) {
      if (typeof videoRef.current.cancelVideoFrameCallback === 'function') {
        videoRef.current.cancelVideoFrameCallback(rvfcIdRef.current);
      }
      rvfcIdRef.current = null;
    }
    if (rafCaptureIdRef.current !== null) {
      cancelAnimationFrame(rafCaptureIdRef.current);
      rafCaptureIdRef.current = null;
    }

    setIsBoomerang(false);

    const video = videoRef.current;
    if (video) {
      video.loop = true;
      video.playbackRate = 0.5;
      video.play().catch(() => {
        // Suppress autoplay errors in fallback
      });
    }
  }, []);

  // Helper to capture a single frame into an off-screen canvas (max width 960px, proportional aspect ratio)
  const captureCurrentFrame = useCallback(
    (video: HTMLVideoElement) => {
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      if (vWidth === 0 || vHeight === 0) return;

      const maxWidth = 960;
      const scale = vWidth > maxWidth ? maxWidth / vWidth : 1;
      const targetWidth = Math.round(vWidth * scale);
      const targetHeight = Math.round(vHeight * scale);

      try {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = targetWidth;
        offscreenCanvas.height = targetHeight;
        const ctx = offscreenCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          framesRef.current.push(offscreenCanvas);
        }
      } catch (err) {
        console.warn('[BoomerangVideoBg] Error capturing frame:', err);
        triggerFallback();
      }
    },
    [triggerFallback]
  );

  // Transition to boomerang canvas mode once video ends or duration is reached
  const handleVideoEnded = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    isCapturingRef.current = false;

    // Clean up any capture loops
    if (rvfcIdRef.current !== null && videoRef.current) {
      if (typeof videoRef.current.cancelVideoFrameCallback === 'function') {
        videoRef.current.cancelVideoFrameCallback(rvfcIdRef.current);
      }
      rvfcIdRef.current = null;
    }
    if (rafCaptureIdRef.current !== null) {
      cancelAnimationFrame(rafCaptureIdRef.current);
      rafCaptureIdRef.current = null;
    }

    // Fallback if no frames were captured
    if (framesRef.current.length === 0) {
      triggerFallback();
      return;
    }

    // Pause video to free resources and display boomerang canvas
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsBoomerang(true);
  }, [triggerFallback]);

  // Video capture initiation (RVFC with rAF fallback)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    isCompletedRef.current = false;
    isCapturingRef.current = false;
    fallbackTriggeredRef.current = false;
    framesRef.current = [];

    const hasRVFC =
      typeof HTMLVideoElement !== 'undefined' &&
      'requestVideoFrameCallback' in HTMLVideoElement.prototype;

    const startCapture = () => {
      if (isCapturingRef.current || isCompletedRef.current) return;
      isCapturingRef.current = true;

      if (hasRVFC && typeof video.requestVideoFrameCallback === 'function') {
        const onFrame = () => {
          if (!isCapturingRef.current) return;
          captureCurrentFrame(video);
          if (!video.ended && !video.paused) {
            rvfcIdRef.current = video.requestVideoFrameCallback(onFrame);
          }
        };
        rvfcIdRef.current = video.requestVideoFrameCallback(onFrame);
      } else {
        // Fallback to requestAnimationFrame
        let lastCapturedTime = -1;
        const onFrame = () => {
          if (!isCapturingRef.current) return;
          if (!video.paused && !video.ended) {
            if (video.currentTime !== lastCapturedTime && video.readyState >= 2) {
              lastCapturedTime = video.currentTime;
              captureCurrentFrame(video);
            }
            rafCaptureIdRef.current = requestAnimationFrame(onFrame);
          }
        };
        rafCaptureIdRef.current = requestAnimationFrame(onFrame);
      }
    };

    const onPlay = () => {
      startCapture();
    };

    const onTimeUpdate = () => {
      if (video.duration > 0 && video.currentTime >= video.duration) {
        handleVideoEnded();
      }
    };

    const onEnded = () => {
      handleVideoEnded();
    };

    const onError = () => {
      triggerFallback();
    };

    const onPauseOrWaiting = () => {
      isCapturingRef.current = false;
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPauseOrWaiting);
    video.addEventListener('waiting', onPauseOrWaiting);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    // Kick off slow-motion playback & capture
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playbackRate = 0.5; // Way slower, cinematic ambient motion

    // On iOS WebKit, actively playing video elements can trigger a media session interruption
    // when the phone locks. Pause the background video whenever the page is hidden.
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!video.paused) {
          video.pause();
        }
      } else {
        if (!isCompletedRef.current && !isBoomerang && video.paused) {
          video.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (video.readyState >= 2 && !video.paused) {
      startCapture();
    } else {
      video.play().catch(() => {
        // Autoplay may be deferred until user interaction or loadedmetadata
      });
    }

    return () => {
      isCapturingRef.current = false;
      isCompletedRef.current = true;

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPauseOrWaiting);
      video.removeEventListener('waiting', onPauseOrWaiting);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);

      if (rvfcIdRef.current !== null) {
        if (typeof video.cancelVideoFrameCallback === 'function') {
          video.cancelVideoFrameCallback(rvfcIdRef.current);
        }
        rvfcIdRef.current = null;
      }
      if (rafCaptureIdRef.current !== null) {
        cancelAnimationFrame(rafCaptureIdRef.current);
        rafCaptureIdRef.current = null;
      }
      video.pause();
    };
  }, [src, captureCurrentFrame, handleVideoEnded, triggerFallback, isBoomerang]);

  // Boomerang slow-motion ping-pong playback loop (10fps for ethereal dreaminess)
  useEffect(() => {
    if (!isBoomerang) return;

    const canvas = canvasRef.current;
    const frames = framesRef.current;
    if (!canvas || frames.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match captured frame size
    canvas.width = frames[0].width;
    canvas.height = frames[0].height;

    let currentIndex = 0;
    let direction = 1; // 1 = forward, -1 = backward
    let lastTimestamp = performance.now();
    const TARGET_FPS = 10; // Way slower, serene ambient loop (~10fps)
    const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~100ms per frame (~38s full cycle)

    // Render initial frame immediately
    ctx.drawImage(frames[0], 0, 0);

    const loop = (now: DOMHighResTimeStamp) => {
      rafPlaybackIdRef.current = requestAnimationFrame(loop);

      const elapsed = now - lastTimestamp;
      if (elapsed >= FRAME_INTERVAL) {
        // Maintain steady 30fps timing without drift
        lastTimestamp = elapsed > 200 ? now : now - (elapsed % FRAME_INTERVAL);

        // Ping-pong sequence: 0 -> 1 -> ... -> N-1 -> N-2 -> ... -> 0 -> 1...
        if (frames.length > 1) {
          currentIndex += direction;
          if (currentIndex >= frames.length - 1) {
            currentIndex = frames.length - 1;
            direction = -1;
          } else if (currentIndex <= 0) {
            currentIndex = 0;
            direction = 1;
          }
        }

        const currentFrame = frames[currentIndex];
        if (currentFrame) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(currentFrame, 0, 0);
        }
      }
    };

    rafPlaybackIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafPlaybackIdRef.current !== null) {
        cancelAnimationFrame(rafPlaybackIdRef.current);
        rafPlaybackIdRef.current = null;
      }
    };
  }, [isBoomerang]);

  // Global unmount cleanup
  useEffect(() => {
    return () => {
      if (rafCaptureIdRef.current !== null) {
        cancelAnimationFrame(rafCaptureIdRef.current);
      }
      if (rafPlaybackIdRef.current !== null) {
        cancelAnimationFrame(rafPlaybackIdRef.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      framesRef.current.forEach((frame) => {
        frame.width = 0;
        frame.height = 0;
      });
      framesRef.current = [];
    };
  }, []);

  const containerClasses = [
    'absolute inset-0 z-0 scale-[1.08] origin-center overflow-hidden pointer-events-none',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        autoPlay
        crossOrigin="anonymous"
        disablePictureInPicture
        disableRemotePlayback
        className={`w-full h-full object-cover ${isBoomerang ? 'hidden' : 'block'}`}
      />
      {isBoomerang && (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default BoomerangVideoBg;
