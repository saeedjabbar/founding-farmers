'use client';

import {
  type ChangeEvent,
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { resolveStrapiAssetUrl } from '@/lib/strapi/public';

interface VideoPlayerProps {
  src: string;
  type?: string;
  className?: string;
  poster?: string | null;
  title?: string;
  preload?: 'auto' | 'metadata' | 'none';
  size?: 'default' | 'compact';
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const floored = Math.floor(seconds);
  const minutes = Math.floor(floored / 60);
  const remainder = Math.floor(floored % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function inferVideoMimeType(url: string): string | undefined {
  const lower = url.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.m4v')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.ogv') || lower.endsWith('.ogg')) return 'video/ogg';
  if (lower.endsWith('.mkv')) return 'video/x-matroska';
  return undefined;
}

export function VideoPlayer({
  src,
  type,
  className,
  poster,
  title,
  preload = 'metadata',
  size = 'default',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const normalizedSrc = useMemo(() => resolveStrapiAssetUrl(src), [src]);
  const normalizedPoster = useMemo(() => {
    if (!poster) return undefined;
    const trimmed = poster.trim();
    if (!trimmed) return undefined;
    return resolveStrapiAssetUrl(trimmed);
  }, [poster]);
  const inferredType = useMemo(
    () => type ?? inferVideoMimeType(normalizedSrc),
    [type, normalizedSrc]
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);

  const isCompact = size === 'compact';
  const hasPlayableSource = Boolean(normalizedSrc) && !hasError;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      setIsReady(true);
      setHasError(false);
      setVolume(video.volume);
      setIsMuted(video.muted || video.volume === 0);

      if (Number.isFinite(video.videoWidth) && Number.isFinite(video.videoHeight)) {
        const width = Math.max(1, video.videoWidth);
        const height = Math.max(1, video.videoHeight);
        setAspectRatio(`${width} / ${height}`);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Number.isFinite(video.currentTime) ? video.currentTime : 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(Number.isFinite(video.duration) ? video.duration : 0);
    };

    const handleError = () => {
      const error = video.error;
      if (!video.currentSrc || !error) {
        return;
      }

      console.error('Video failed to load', {
        src: video.currentSrc,
        code: error.code,
        message: error.message,
      });

      setHasError(true);
      setIsReady(false);
      setIsPlaying(false);
      setAspectRatio(null);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted || video.volume === 0);
      if (video.volume > 0) {
        setPreviousVolume(video.volume);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('volumechange', handleVolumeChange);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.pause();
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!normalizedSrc) {
      video.removeAttribute('src');
      video.load();
      setHasError(true);
      setIsReady(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setAspectRatio(null);
      return;
    }

    setHasError(false);
    setIsPlaying(false);
    setIsReady(false);
    setCurrentTime(0);
    setDuration(0);
    setAspectRatio(null);

    video.pause();
    video.preload = preload;
    video.currentTime = 0;
    video.src = normalizedSrc;
    try {
      video.load();
    } catch (error) {
      console.error('Unable to load video source', error);
      setHasError(true);
    }
  }, [normalizedSrc, preload]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (!video) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, []);

  const progress = useMemo(() => {
    if (!duration || Number.isNaN(duration)) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video || !normalizedSrc || hasError) return;

    if (video.paused) {
      void video.play().catch((error) => {
        console.error('Video playback failed', error);
        setHasError(true);
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  };

  const handleSeek = (value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(value)) return;
    const clamped = duration ? Math.min(duration, Math.max(0, value)) : 0;
    video.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSeek(Number(event.target.value));
  };

  const handleVolumeSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const nextVolume = Number(event.target.value);
    video.volume = nextVolume;
    if (nextVolume === 0) {
      video.muted = true;
    } else {
      video.muted = false;
      setPreviousVolume(nextVolume);
    }
    setVolume(nextVolume);
    setIsMuted(video.muted);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted || video.volume === 0) {
      const restored = previousVolume > 0 ? previousVolume : 0.6;
      video.muted = false;
      video.volume = restored;
      setVolume(restored);
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleVideoKeyDown = (event: KeyboardEvent<HTMLVideoElement>) => {
    if (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Enter') {
      event.preventDefault();
      handleTogglePlay();
    }
  };

  const containerClasses = cn(
    'theme-border border rounded-3xl bg-[var(--theme-surface)]/80 backdrop-blur-sm shadow-sm w-full',
    isCompact ? 'p-3 gap-3' : 'p-4 gap-4',
    'flex flex-col',
    className
  );

  const controlsClasses = cn(
    'flex items-center gap-4 text-sm flex-wrap md:flex-nowrap',
    isCompact && 'gap-3 text-xs'
  );

  const timeClasses = cn(
    'theme-text-muted font-mono tracking-[0.08em]',
    isCompact ? 'text-[11px]' : 'text-xs'
  );

  return (
    <div className={containerClasses} data-video-player>
      {title && (
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] theme-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]" aria-hidden="true" />
          <span>{title}</span>
        </div>
      )}

      <div
        className="relative w-full overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-black"
        style={
          {
            aspectRatio: aspectRatio ?? '16 / 9',
          } as CSSProperties
        }
      >
        <video
          ref={videoRef}
          preload={preload}
          controls={false}
          playsInline
          poster={normalizedPoster}
          className="h-full w-full object-contain bg-black"
          onClick={handleTogglePlay}
          onKeyDown={handleVideoKeyDown}
          tabIndex={0}
          aria-label={title ? `${title} video` : 'Video player'}
        >
          {normalizedSrc && (
            <source src={normalizedSrc} {...(inferredType ? { type: inferredType } : {})} />
          )}
          Your browser does not support the video tag.
        </video>

        {!isPlaying && !hasError && normalizedSrc && (
          <button
            type="button"
            onClick={handleTogglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-150 hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            aria-label="Play video"
          >
            <Play className="h-12 w-12 text-white drop-shadow-lg" />
          </button>
        )}
      </div>

      <div className={controlsClasses}>
        <button
          type="button"
          onClick={handleTogglePlay}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border)]',
            'bg-[var(--theme-bg)] text-[var(--theme-accent)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]',
            isCompact && 'h-9 w-9',
            !hasPlayableSource ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:scale-[1.04]'
          )}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          disabled={!hasPlayableSource}
          aria-disabled={!hasPlayableSource}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
        </button>

        <div className="flex flex-1 flex-col gap-2 min-w-[160px]">
          <div className="flex items-center justify-between">
            <span className={timeClasses}>{formatTime(currentTime)}</span>
            <span className={timeClasses}>
              {isReady && duration ? formatTime(duration) : '0:00'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={Number.isFinite(currentTime) ? currentTime : 0}
            onChange={handleSliderChange}
            className="audio-slider w-full"
            aria-label="Seek through video"
            disabled={!isReady || !duration || hasError}
            style={
              {
                '--slider-progress': `${progress}%`,
              } as CSSProperties
            }
          />
        </div>

        <div
          className={cn(
            'flex items-center gap-2',
            isCompact && 'flex-wrap justify-end gap-y-2 w-full'
          )}
        >
          <button
            type="button"
            onClick={toggleMute}
            className={cn(
              'rounded-full border border-[var(--theme-border)] p-2 transition-colors duration-150 hover:border-[var(--theme-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]',
              isCompact && 'p-1.5 flex-shrink-0',
              hasError && 'opacity-40 cursor-not-allowed pointer-events-none'
            )}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            disabled={hasError}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeSliderChange}
            className={
              cn(
                'audio-slider',
                isCompact ? 'w-full max-w-[72px]' : 'w-20 md:w-24'
              )
            }
            aria-label="Adjust volume"
            disabled={hasError}
            style={
              {
                '--slider-progress': `${(isMuted ? 0 : volume) * 100}%`,
              } as CSSProperties
            }
          />
        </div>
      </div>

      {hasError && normalizedSrc && (
        <div className="mt-3 space-y-2 text-xs theme-text-muted">
          <p className="italic">
            Having trouble with the enhanced player. Loading the standard video controls instead.
          </p>
          <video
            controls
            preload={preload}
            className="w-full rounded-md border border-[var(--theme-border)] bg-black"
            poster={normalizedPoster}
          >
            <source src={normalizedSrc} {...(inferredType ? { type: inferredType } : {})} />
            Your browser does not support the video element.
          </video>
        </div>
      )}
    </div>
  );
}
