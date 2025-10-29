'use client';

import clsx from 'clsx';
import type { VideoEmbed } from '@/lib/strapi/types';

interface VideoEmbedProps {
  embed: VideoEmbed;
  className?: string;
}

const PROVIDER_ALLOW_MAP: Record<VideoEmbed['provider'], string> = {
  youtube: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  vimeo: 'autoplay; fullscreen; picture-in-picture',
  other: 'autoplay; fullscreen; picture-in-picture',
};

const ASPECT_RATIO_MAP: Record<VideoEmbed['aspectRatio'], string> = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '9:16': '9 / 16',
};

export function VideoEmbedPlayer({ embed, className }: VideoEmbedProps) {
  const aspectRatio = ASPECT_RATIO_MAP[embed.aspectRatio] ?? ASPECT_RATIO_MAP['16:9'];
  const allow = embed.iframe.allow ?? PROVIDER_ALLOW_MAP[embed.provider];
  const referrerPolicy = embed.iframe.referrerPolicy ?? 'strict-origin-when-cross-origin';
  const title = embed.title ?? 'Embedded video';
  const loading = embed.iframe.loading ?? 'lazy';
  const allowFullScreen = embed.iframe.allowFullScreen;

  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden rounded-md border border-[var(--theme-border)] bg-black',
        className
      )}
      style={{ aspectRatio }}
    >
      <iframe
        src={embed.iframe.src}
        title={title}
        allow={allow}
        referrerPolicy={referrerPolicy}
        loading={loading}
        allowFullScreen={allowFullScreen}
        className="w-full h-full"
      />
    </div>
  );
}

export default VideoEmbedPlayer;
