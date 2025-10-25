'use client';

import { useEffect, useState } from 'react';
import { TimelineMarker } from '@/components/TimelineMarker';
import { StorySection } from '@/components/StorySection';
import { SourceCard } from '@/components/SourceCard';
import { SiteHeader } from '@/components/SiteHeader';
import type { Theme } from '@/lib/themes';
import { themes } from '@/lib/themes';

type TimelineSource = {
  title: string;
  summary: string;
  type: 'pdf' | 'photo' | 'audio' | 'document';
  content?: string;
  url?: string;
};

type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  body: string;
  sources: TimelineSource[];
};

const timelineData: TimelineEvent[] = [
  {
    id: 'event-1',
    date: 'June 5, 2025',
    title: 'The Letter',
    body: 'On June 5, 2025, the man received a letter. It arrived in a plain envelope, no return address, postmarked from a city he had never visited. The paper inside was thick, expensive—the kind that suggested this was no ordinary correspondence.',
    sources: [
      {
        title: 'The Original Letter',
        summary: 'Handwritten on cream-colored stationery',
        type: 'document',
        content: 'A handwritten letter on high-quality paper stock, dated June 5, 2025. The penmanship is deliberate and formal.',
        url: '#',
      },
    ],
  },
  {
    id: 'event-2',
    date: 'June 12, 2025',
    title: 'The Search Begins',
    body: 'Seven days later, his investigation had begun in earnest. He spent hours in the public library, combing through old records and newspaper archives. The letter had mentioned a name—one that seemed to echo through decades of local history.',
    sources: [
      {
        title: 'City Archives, 1985',
        summary: 'The old reading room where it all started',
        type: 'photo',
        content: 'Photograph of the city archives reading room, showing rows of filing cabinets and microfilm readers from the 1980s.',
        url: '#',
      },
    ],
  },
  {
    id: 'event-3',
    date: 'July 3, 2025',
    title: 'A Discovery',
    body: 'Nearly a month into his search, he found it. Buried in a box of miscellaneous documents from 1952, there was a photograph. The faces were unfamiliar, but the location was unmistakable—it was the same house mentioned in the letter.',
    sources: [
      {
        title: 'Photograph from 1952',
        summary: 'Three figures standing before the house',
        type: 'photo',
        content: 'Black and white photograph showing three individuals in front of a two-story house. The photo is slightly faded but remarkably well-preserved.',
        url: '#',
      },
    ],
  },
  {
    id: 'event-4',
    date: 'August 15, 2025',
    title: 'The Interview',
    body: 'By mid-August, he had tracked down one of the people who might know the truth. She was elderly now, her memory occasionally foggy, but when he showed her the photograph, her eyes lit up with recognition. "I remember that day," she said quietly.',
    sources: [
      {
        title: 'Audio Recording',
        summary: 'Interview transcript, August 15, 2025',
        type: 'audio',
        content: 'A 45-minute interview recorded on digital audio. The subject speaks slowly but clearly about events from over seventy years ago.',
        url: '#',
      },
    ],
  },
  {
    id: 'event-5',
    date: 'September 1, 2025',
    title: 'The Truth Emerges',
    body: "The story she told changed everything. What he thought was a simple mystery revealed itself to be part of a much larger narrative—one that had been carefully hidden for seventy years. The letter wasn't just a message; it was a confession.",
    sources: [
      {
        title: 'The Second Letter',
        summary: 'Written in 1986, never sent',
        type: 'document',
        content: 'A second letter, found among the subject\'s personal effects. This one was never mailed, but it corroborates the key details of the story.',
        url: '#',
      },
      {
        title: 'The House, Present Day',
        summary: 'As it stands now, unchanged',
        type: 'photo',
        content: 'Modern photograph of the same house from the 1952 photo. The structure remains remarkably similar.',
        url: '#',
      },
      {
        title: 'Handwritten Note',
        summary: 'Found tucked inside the second letter',
        type: 'document',
        content: 'A small note card with additional context and names of other potential witnesses.',
        url: '#',
      },
    ],
  },
];

const storyMeta = {
  author: 'Jane Doe',
  publishedOn: {
    display: 'September 20, 2025',
    value: '2025-09-20',
  },
};

export default function TimelinePage() {
  const [activeSection, setActiveSection] = useState<string>('event-1');
  const [currentTheme, setCurrentTheme] = useState<Theme>('archiveLight');

  useEffect(() => {
    const handleScroll = () => {
      const sections = timelineData
        .map((event) => {
          const element = document.getElementById(event.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            return {
              id: event.id,
              top: Math.abs(rect.top - 200),
            };
          }
          return null;
        })
        .filter(Boolean) as { id: string; top: number }[];

      const closest = sections.sort((a, b) => a.top - b.top)[0];
      if (closest) {
        setActiveSection(closest.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`min-h-screen theme-bg ${themes[currentTheme].className}`}>
      <SiteHeader currentTheme={currentTheme} onThemeChange={setCurrentTheme} />

      <div className="theme-surface theme-border border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <h2 className="theme-text-primary text-lg mb-4">The Letter That Changed Everything</h2>
          <p className="theme-text-secondary max-w-3xl leading-relaxed">
            Sometimes the most profound mysteries arrive in the simplest packages. This is the story of one man's search for truth, told chronologically through the documents, photographs, and moments that defined his journey.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm theme-text-muted md:flex-row md:items-center md:gap-6">
            <span>
              By <span className="theme-text-primary">{storyMeta.author}</span>
            </span>
            <span>
              Published On{' '}
              <time dateTime={storyMeta.publishedOn.value}>{storyMeta.publishedOn.display}</time>
            </span>
          </div>
        </div>
      </div>

      <div className="hidden md:block theme-bg theme-border border-b">
        <div className="max-w-7xl mx-auto px-8 py-3">
          <div className="grid grid-cols-[15%_60%_25%] gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider theme-text-muted">Timeline (Data-Driven)</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider theme-text-muted">Story Text</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider theme-text-muted">Source Records (Expandable)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="space-y-12 md:space-y-20">
          {timelineData.map((event) => (
            <div key={event.id} className="flex flex-col md:grid md:grid-cols-[15%_60%_25%] gap-4 md:gap-4 md:items-start">
              <div className="md:pt-1">
                <TimelineMarker
                  date={event.date}
                  isActive={activeSection === event.id}
                  onClick={() => scrollToSection(event.id)}
                />
              </div>

              <div>
                <StorySection
                  id={event.id}
                  date={event.date}
                  title={event.title}
                  body={event.body}
                />
              </div>

              <div className="space-y-3 mt-4 md:mt-0">
                {event.sources.map((source, index) => (
                  <SourceCard
                    key={`${event.id}-${source.title}-${index}`}
                    title={source.title}
                    summary={source.summary}
                    type={source.type}
                    content={source.content}
                    url={source.url}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:grid md:grid-cols-[15%_60%_25%] gap-4 items-start mt-12 md:mt-20 pt-12 md:pt-20 theme-border border-t">
          <div className="hidden md:block" />
          <div className="hidden md:block" />
          <div className="w-full">
            <div className="theme-border theme-surface border rounded-lg shadow-sm p-4">
              <h4 className="text-sm theme-text-primary mb-3">Summary</h4>
              <ul className="space-y-2 text-xs theme-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="theme-accent mt-0.5">•</span>
                  <span>Five key events spanning four months</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="theme-accent mt-0.5">•</span>
                  <span>Multiple primary sources verified</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="theme-accent mt-0.5">•</span>
                  <span>Investigation concluded with confession</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="theme-border border-t" style={{ backgroundColor: 'var(--theme-bg)', opacity: 0.95 }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <h3 className="text-sm theme-text-primary mb-2">Developer Notes</h3>
          <p className="text-xs theme-text-secondary mb-3">
            Data Model: Each row corresponds to one record with fields:
          </p>
          <ul className="text-xs theme-text-secondary space-y-1 font-mono">
            <li>• date (string) - Event date</li>
            <li>• title (string) - Story headline</li>
            <li>• body_text (string) - Narrative paragraph</li>
            <li>• source_title (string) - Source card title</li>
            <li>• source_summary (string) - Source card summary line</li>
            <li>• source_type (pdf | photo | audio | document) - Type of source</li>
            <li>• source_url (string) - Link to full source</li>
            <li>• source_content (string) - Expandable content description</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
