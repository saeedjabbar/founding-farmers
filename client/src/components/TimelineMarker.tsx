import { motion } from 'motion/react';

interface TimelineMarkerProps {
  date: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function TimelineMarker({ date, isActive, onClick }: TimelineMarkerProps) {
  return (
    <div className="relative flex items-start pt-1 timeline-marker">
      {/* Vertical line - hidden on mobile, shown on desktop */}
      <div className="hidden md:block absolute left-3 top-0 bottom-0 w-px theme-marker-line" />
      
      {/* Date marker */}
      <button
        type="button"
        onClick={onClick}
        className="relative z-10 group flex items-center gap-3 cursor-pointer"
      >
        <motion.div
          whileHover={{ scale: 1.2 }}
          className={`w-2 h-2 rounded-full transition-colors ${
            isActive ? 'theme-marker-active' : 'theme-marker-inactive'
          }`}
          style={isActive ? {} : { opacity: 0.6 }}
        />
        <span className="text-xs theme-text-muted whitespace-nowrap">{date}</span>
      </button>
    </div>
  );
}
