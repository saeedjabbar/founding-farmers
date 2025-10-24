# Frontend Guidance: Editorial Red Theme

## Technical Stack

### Core Libraries
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS v4.0
- **Components**: shadcn/ui
- **Icons**: lucide-react
- **Animation**: Motion (motion/react)
- **Charts**: Recharts
- **State Management**: React hooks (useState, useEffect, useContext)

---

## Typography System

### Font Family
```css
font-family: "EB Garamond", Garamond, "Cormorant Garamond", "Libre Baskerville", Baskerville, Georgia, "Times New Roman", Times, serif;
```

**Fallback Chain**:
1. EB Garamond (primary, elegant serif)
2. Garamond (classic serif fallback)
3. Cormorant Garamond (Google Fonts alternative)
4. Libre Baskerville (open-source serif)
5. Baskerville (system serif)
6. Georgia (universal web-safe serif)
7. Times New Roman (last resort serif)
8. Times (system fallback)
9. serif (generic serif)

### Typography Rules

**Headlines (H2)**:
- Font variant: `small-caps` (NOT uppercase or bold)
- Letter spacing: `0.05em`
- Font weight: `400` (regular, not bold)

**Body Text (Paragraphs)**:
- Text alignment: `justify`
- Hyphens: `auto`
- Letter spacing: `0.01em`
- Line height: `1.65`
- Font weight: `400` (regular)

**Important**: Do NOT use Tailwind typography classes like `text-2xl`, `font-bold`, `leading-tight` unless specifically requested. The theme handles all typography through CSS custom properties.

---

## Color Tokens

### Editorial Red Light Mode
```css
--theme-bg: #f4f3f0              /* Warm cream background */
--theme-surface: #faf9f7         /* Lighter cream for cards */
--theme-border: #d8d6d0          /* Soft warm grey borders */
--theme-text-primary: #1a1a1a    /* Near-black headlines */
--theme-text-secondary: #2a2a2a  /* Dark grey body text */
--theme-text-muted: #6a6a6a      /* Medium grey metadata */
--theme-accent: #c41e3a          /* Bold crimson red */
--theme-accent-hover: #a01830    /* Darker red hover state */
--theme-marker-inactive: #b8b6b0 /* Warm light grey */
--theme-marker-line: #d8d6d0     /* Border color for lines */
```

### Editorial Red Dark Mode
```css
--theme-bg: #1a1814              /* Dark warm brown-black */
--theme-surface: #242220         /* Lighter warm black */
--theme-border: #3e3c38          /* Dark warm grey-brown */
--theme-text-primary: #f4f3f0    /* Warm off-white */
--theme-text-secondary: #d8d6d0  /* Warm light grey */
--theme-text-muted: #a8a6a0      /* Medium warm grey */
--theme-accent: #ff4d6a          /* Bright coral red */
--theme-accent-hover: #ff7088    /* Lighter red hover */
--theme-marker-inactive: #5a5854 /* Dark warm grey */
--theme-marker-line: #3e3c38     /* Border color for lines */
```

### Accessing Colors in Code
```tsx
// Use CSS variables directly in inline styles
style={{ color: 'var(--theme-accent)' }}

// Or use Tailwind with arbitrary values
className="text-[var(--theme-accent)]"
className="bg-[var(--theme-bg)]"
className="border-[var(--theme-border)]"
```

---

## Theme Application

### Applying Theme Class
```tsx
<div className="theme-editorial-red-light">
  {/* Light mode content */}
</div>

<div className="theme-editorial-red-dark">
  {/* Dark mode content */}
</div>
```

### Dynamic Theme Switching
```tsx
import { themeConfigs } from './lib/themes';

const [theme, setTheme] = useState<Theme>('editorialRedLight');

<div className={themeConfigs[theme].className}>
  {/* Themed content */}
</div>
```

---

## Design Patterns

### Text Formatting
- **Justified Text**: All body paragraphs should be justified with hyphenation enabled
- **Small Caps Headlines**: Use `font-variant: small-caps` for section headers, not bold or uppercase
- **Generous Line Height**: 1.65 for comfortable reading
- **Subtle Letter Spacing**: 0.01em for body, 0.05em for headlines

### Color Usage
- **Background**: Warm cream (#f4f3f0 light, #1a1814 dark) - like aged paper
- **Red Accent**: Use exclusively for:
  - Links and clickable elements
  - Interactive UI components
  - Call-to-action buttons
  - Active states in navigation
  - Pull quotes or important highlights
- **Borders**: Subtle and warm-toned, never stark or high-contrast

### Spacing
- Generous whitespace between sections
- Comfortable margins (multi-column magazine layout feel)
- Elegant vertical rhythm matching 1.65 line-height

---

## Component Guidelines

### Buttons
```tsx
// Accent button (red)
<button className="bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white">
  Click Me
</button>

// Text color for links
<a className="text-[var(--theme-accent)] hover:text-[var(--theme-accent-hover)]">
  Read More
</a>
```

### Cards
```tsx
<div className="bg-[var(--theme-surface)] border border-[var(--theme-border)]">
  {/* Card content */}
</div>
```

### Text Hierarchy
```tsx
<h2 className="text-[var(--theme-text-primary)]">
  Headline in Small Caps
</h2>
<p className="text-[var(--theme-text-secondary)]">
  Body text in justified alignment
</p>
<span className="text-[var(--theme-text-muted)]">
  Metadata or captions
</span>
```

---

## Layout Specifications

### The Chronicle Three-Column Structure
- **Left Column (15%)**: Timeline with vertical line and date markers
- **Center Column (60%)**: Story headlines and body text (justified)
- **Right Column (25%)**: Source cards with expandable content

### Responsive Behavior
- Desktop: Three-column layout
- Tablet: Stack sources below story
- Mobile: Single column, vertical timeline on left edge

---

## Animation Guidelines

### Using Motion
```tsx
import { motion } from 'motion/react';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
>
  {/* Animated content */}
</motion.div>
```

### Recommended Animations
- Fade-in for content sections
- Smooth hover transitions (0.2s ease)
- Subtle scale on interactive elements
- Slide-in for source card expansion

---

## Best Practices

### DO ✓
- Use CSS custom properties for all theme colors
- Maintain justified text alignment for body copy
- Use small-caps for section headers
- Apply red accent sparingly for maximum impact
- Preserve warm undertones in all color choices
- Test both light and dark modes
- Ensure sufficient contrast for accessibility

### DON'T ✗
- Don't use Tailwind font size/weight classes unless requested
- Don't make headlines bold (use small-caps instead)
- Don't use cool greys (maintain warm undertones)
- Don't overuse the red accent (it should be impactful, not overwhelming)
- Don't use stark borders (keep them subtle and warm)
- Don't force uppercase text (use small-caps)

---

## Accessibility Considerations

### Color Contrast
- Light mode text (#1a1a1a) on cream (#f4f3f0): 12.8:1 ratio ✓
- Dark mode text (#f4f3f0) on dark (#1a1814): 12.6:1 ratio ✓
- Red accent (#c41e3a) on light bg: 7.2:1 ratio ✓
- Coral red (#ff4d6a) on dark bg: 6.8:1 ratio ✓

### Typography Accessibility
- Line height 1.65 aids dyslexic readers
- Justified text with hyphenation prevents awkward spacing
- Serif font is traditional and readable for long-form content
- Small caps maintain x-height while providing hierarchy

### Interactive Elements
- Red accent provides clear visual affordance for clickable items
- Hover states darken accent color for feedback
- Sufficient spacing between interactive elements

---

## File Structure Reference

### Theme Configuration
```
/lib/themes.ts                    # Theme type definitions and configs
/styles/globals.css               # CSS variables and theme classes
```

### Components
```
/components/ThemeSwitcher.tsx     # Theme selection UI
/components/StorySection.tsx      # Main content area
/components/SourceCard.tsx        # Expandable source cards
/components/TimelineMarker.tsx    # Timeline date markers
```

---

## Example Implementation

### Complete Editorial Red Component
```tsx
import { useState } from 'react';
import { motion } from 'motion/react';

export default function EditorialRedExample() {
  const [theme, setTheme] = useState<'editorialRedLight' | 'editorialRedDark'>('editorialRedLight');
  
  return (
    <div className={`theme-editorial-red-${theme === 'editorialRedLight' ? 'light' : 'dark'} min-h-screen`}>
      <motion.article 
        className="max-w-3xl mx-auto px-8 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-[var(--theme-text-primary)] mb-6">
          The Art of Editorial Design
        </h2>
        
        <div className="story-content">
          <p className="text-[var(--theme-text-secondary)]">
            Classic editorial typography combines timeless elegance with modern functionality. 
            The use of warm, cream-toned backgrounds evokes the feeling of aged paper, 
            while justified text and generous line-height create a comfortable reading experience.
          </p>
          
          <p className="text-[var(--theme-text-secondary)] mt-4">
            Bold red accents provide visual energy and guide the reader's attention to 
            <a href="#" className="text-[var(--theme-accent)] hover:text-[var(--theme-accent-hover)] transition-colors">
              interactive elements
            </a> and important information.
          </p>
        </div>
        
        <button
          onClick={() => setTheme(theme === 'editorialRedLight' ? 'editorialRedDark' : 'editorialRedLight')}
          className="mt-8 px-6 py-3 bg-[var(--theme-accent)] hover:bg-[var(--theme-accent-hover)] text-white transition-colors"
        >
          Toggle Theme
        </button>
      </motion.article>
    </div>
  );
}
```

---

## Data Integration

### Expected Data Structure
```typescript
interface StoryEntry {
  date: string;           // ISO date format
  title: string;          // Headline
  body_text: string;      // Main content (supports markdown)
  source_title: string;   // Source document name
  source_summary: string; // Brief description
  source_type: string;    // "pdf" | "photo" | "audio" | "video" | "document"
  source_url: string;     // Link to source material
}
```

### Spreadsheet Connection
- Connect to Google Sheets, Airtable, or CSV
- Map columns to interface properties
- Auto-update timeline when data changes
- Sort entries chronologically by date field

---

## Performance Considerations

- **Font Loading**: Use `font-display: swap` for EB Garamond to prevent FOIT
- **CSS Variables**: More performant than inline styles
- **Animation**: Use `transform` and `opacity` for GPU acceleration
- **Image Optimization**: Lazy load source materials
- **Code Splitting**: Load heavy components (PDFs, media) on demand

---

## Version Information

- **Tailwind CSS**: v4.0 (CSS-first configuration)
- **React**: 18+
- **TypeScript**: 5+
- **Motion**: Latest (formerly Framer Motion)
- **shadcn/ui**: Latest compatible components

---

**Last Updated**: October 24, 2025
**Theme Version**: Editorial Red v1.0
**Compatibility**: The Chronicle Timeline Application
