'use client';

import {
  type ChangeEvent,
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/components/ui/utils';

interface AudioPlayerProps {
  src: string;
  type?: string;
  title?: string;
  className?: string;
  size?: 'default' | 'compact';
  preload?: 'auto' | 'metadata' | 'none';
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const floored = Math.floor(seconds);
  const minutes = Math.floor(floored / 60);
  const remainder = Math.floor(floored % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function inferMimeType(url: string): string | undefined {
  const lower = url.toLowerCase();
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.ogg') || lower.endsWith('.oga')) return 'audio/ogg';
  if (lower.endsWith('.aac')) return 'audio/aac';
  if (lower.endsWith('.m4a')) return 'audio/mp4';
  if (lower.endsWith('.flac')) return 'audio/flac';
  if (lower.endsWith('.webm')) return 'audio/webm';
  return undefined;
}

function resolveStrapiUrl(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const publicBase =
    process.env.NEXT_PUBLIC_STRAPI_URL ??
    (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:1337`
      : '');

  if (!publicBase) {
    return trimmed;
  }

  try {
    return new URL(trimmed, publicBase).toString();
  } catch {
    const base = publicBase.endsWith('/') ? publicBase.slice(0, -1) : publicBase;
    const relative = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return `${base}/${relative}`;
  }
}

export function AudioPlayer({
  src,
  type,
  title,
  className,
  size = 'default',
  preload = 'metadata',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const normalizedSrc = useMemo(() => resolveStrapiUrl(src), [src]);
  const inferredType = useMemo(() => type ?? inferMimeType(normalizedSrc), [type, normalizedSrc]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [hasError, setHasError] = useState(false);

  const isCompact = size === 'compact';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setIsReady(true);
      setHasError(false);
      setVolume(audio.volume);
      setIsMuted(audio.muted || audio.volume === 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const handleError = () => {
      const error = audio.error;
      if (!audio.currentSrc || !error) {
        return;
      }

      console.error('Audio failed to load', {
        src: audio.currentSrc,
        code: error.code,
        message: error.message,
      });

      setHasError(true);
      setIsReady(false);
      setIsPlaying(false);
    };

    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted || audio.volume === 0);
      if (audio.volume > 0) {
        setPreviousVolume(audio.volume);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('volumechange', handleVolumeChange);

    if (audio.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!normalizedSrc) {
      audio.removeAttribute('src');
      audio.load();
      setHasError(true);
      setIsPlaying(false);
      setIsReady(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    setHasError(false);
    setIsPlaying(false);
    setIsReady(false);
    setCurrentTime(0);
    setDuration(0);

    audio.pause();
    audio.preload = preload;
    audio.currentTime = 0;
    audio.src = normalizedSrc;
    try {
      audio.load();
    } catch (error) {
      console.error('Unable to load audio source', error);
      setHasError(true);
    }
  }, [normalizedSrc, preload]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  const progress = useMemo(() => {
    if (!duration || Number.isNaN(duration)) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !normalizedSrc || hasError) return;

    if (audio.paused) {
      void audio.play().catch((error) => {
        console.error('Audio playback failed', error);
        setHasError(true);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(value)) return;
    const clamped = duration ? Math.min(duration, Math.max(0, value)) : 0;
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSeek(Number(event.target.value));
  };

  const handleVolumeSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextVolume = Number(event.target.value);
    audio.volume = nextVolume;
    if (nextVolume === 0) {
      audio.muted = true;
    } else {
      audio.muted = false;
      setPreviousVolume(nextVolume);
    }
    setVolume(nextVolume);
    setIsMuted(audio.muted);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.muted || audio.volume === 0) {
      const restored = previousVolume > 0 ? previousVolume : 0.6;
      audio.muted = false;
      audio.volume = restored;
      setVolume(restored);
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const containerClasses = cn(
    'theme-border border rounded-3xl bg-[var(--theme-surface)]/80 backdrop-blur-sm shadow-sm w-full',
    isCompact ? 'px-3 py-2 gap-3' : 'px-4 py-3 gap-4',
    'flex flex-col',
    className
  );

  const controlsClasses = cn(
    'flex items-center',
    isCompact ? 'gap-3 text-xs' : 'gap-4 text-sm'
  );

  const timeClasses = cn(
    'theme-text-muted font-mono tracking-[0.08em]',
    isCompact ? 'text-[11px]' : 'text-xs'
  );

  return (
    <div className={containerClasses} data-audio-player>
      {title && (
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] theme-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]" aria-hidden="true" />
          <span>{title}</span>
        </div>
      )}

      <div className={controlsClasses}>
        <button
          type="button"
          onClick={handleTogglePlay}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border)]',
            'bg-[var(--theme-bg)] text-[var(--theme-accent)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]',
            isCompact && 'h-9 w-9',
            hasError ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:scale-[1.04]'
          )}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          disabled={hasError}
          aria-disabled={hasError}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
        </button>

        <div className="flex flex-1 flex-col gap-2">
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
            aria-label="Seek through audio"
            disabled={!isReady || !duration || hasError}
            style={
              {
                '--slider-progress': `${progress}%`,
              } as CSSProperties
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className={cn(
              'rounded-full border border-[var(--theme-border)] p-2 transition-colors duration-150 hover:border-[var(--theme-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-bg)]',
              isCompact && 'p-1.5',
              hasError && 'opacity-40 cursor-not-allowed pointer-events-none'
            )}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
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
            className="audio-slider w-20 md:w-24"
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
        <div className="mt-3 space-y-2">
          <p className="text-xs theme-text-muted italic">
            Having trouble with the enhanced player. Loading the standard audio controls instead.
          </p>
          <audio
            controls
            preload={preload}
            className="w-full rounded-md border border-[var(--theme-border)] bg-[var(--theme-surface)]"
            src={normalizedSrc}
          >
            <source src={normalizedSrc} {...(inferredType ? { type: inferredType } : {})} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <audio ref={audioRef} preload={preload} className="hidden" />
    </div>
  );
}
