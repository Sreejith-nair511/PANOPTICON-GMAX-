'use client';

import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';

export interface VideoPlayerHandle {
  seek: (seconds: number) => void;
  play: () => void;
  pause: () => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
}

interface Detection {
  label: string;
  confidence: number;
  x: number; // 0-1 relative
  y: number;
  w: number;
  h: number;
  color: string;
}

interface VideoPlayerProps {
  src?: string;
  thumbnailUrl?: string;
  isActive: boolean;
  playing: boolean;
  currentTime: number;
  zoom?: number;
  showOverlays?: boolean;
  detections?: Detection[];
  cameraId?: string;
  cameraName?: string;
  duration?: number;
  onTimeUpdate?: (t: number) => void;
  onSelect?: () => void;
  className?: string;
}

const DEFAULT_DETECTIONS: Detection[] = [
  { label: 'Suspect α', confidence: 94, x: 0.28, y: 0.20, w: 0.18, h: 0.55, color: '#F59E0B' },
  { label: 'Suspect β', confidence: 88, x: 0.58, y: 0.25, w: 0.14, h: 0.48, color: '#FB923C' },
  { label: 'Backpack',  confidence: 96, x: 0.30, y: 0.58, w: 0.10, h: 0.18, color: '#22C55E' },
];

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(function VideoPlayer(
  {
    src,
    thumbnailUrl,
    isActive,
    playing,
    currentTime,
    zoom = 1,
    showOverlays = true,
    detections,
    cameraId,
    cameraName,
    duration = 1800,
    onTimeUpdate,
    onSelect,
    className,
  },
  ref
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const boxes = detections ?? (isActive && showOverlays ? DEFAULT_DETECTIONS : []);

  // Expose control handle
  useImperativeHandle(ref, () => ({
    seek: (s: number) => { if (videoRef.current) videoRef.current.currentTime = s; },
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    setPlaybackRate: (r: number) => { if (videoRef.current) videoRef.current.playbackRate = r; },
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
  }));

  // Sync play/pause from parent state
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (playing) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [playing, src]);

  // Sync seek from parent scrubber (only if diff > 0.5s to avoid fighting)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (Math.abs(v.currentTime - currentTime) > 0.5) {
      v.currentTime = currentTime;
    }
  }, [currentTime, src]);

  // Draw bounding boxes on canvas overlay
  const drawBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const { width: W, height: H } = container.getBoundingClientRect();
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (!showOverlays || boxes.length === 0) return;

    boxes.forEach(({ label, confidence, x, y, w, h, color }) => {
      const px = x * W, py = y * H, pw = w * W, ph = h * H;
      // Box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.strokeRect(px, py, pw, ph);
      ctx.shadowBlur = 0;
      // Label background
      const text = `${label} ${confidence}%`;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = color;
      ctx.fillRect(px - 1, py - 18, tw + 8, 16);
      // Label text
      ctx.fillStyle = '#000';
      ctx.fillText(text, px + 3, py - 5);
    });
  }, [boxes, showOverlays]);

  // Redraw on every animation frame when playing
  useEffect(() => {
    const loop = () => {
      drawBoxes();
      const v = videoRef.current;
      if (v && onTimeUpdate) onTimeUpdate(v.currentTime);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [drawBoxes, onTimeUpdate]);

  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative rounded-xl overflow-hidden bg-black cursor-pointer border-2 transition-all duration-150 group',
        isActive ? 'border-accent/60' : 'border-border/50 hover:border-border',
        className
      )}
    >
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
        }}
      />

      {/* Video element */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          muted
          playsInline
          preload="metadata"
          loop
        />
      ) : (
        <div className="w-full h-full min-h-[180px] relative">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={cameraName}
              className="w-full h-full object-cover"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
            />
          )}
          {/* Fake "video playing" shimmer */}
          {playing && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent animate-[shimmer_2s_infinite]" />
          )}
        </div>
      )}

      {/* Canvas overlay for detections */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* Camera HUD top-left */}
      <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5">
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            playing && isActive ? 'bg-danger animate-pulse' : 'bg-muted-foreground/60'
          )}
        />
        <span className="text-2xs font-mono text-white/80 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {cameraId ?? 'CAM'}
        </span>
      </div>

      {/* Active ring */}
      {isActive && (
        <div className="absolute inset-0 ring-2 ring-accent/60 ring-inset pointer-events-none rounded-xl z-30" />
      )}

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 z-30">
        <p className="text-2xs text-white/70 font-mono truncate">{cameraName}</p>
      </div>

      {/* Hover play overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
        <div className="w-10 h-10 rounded-full bg-accent/70 flex items-center justify-center backdrop-blur-sm">
          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
});
