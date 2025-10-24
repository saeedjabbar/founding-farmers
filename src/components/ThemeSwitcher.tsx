import { useState, useRef, useEffect } from 'react';
import { Theme, themes, themeColors } from '../lib/themes';
import { ChevronDown } from 'lucide-react';

interface ThemeSwitcherProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentThemeConfig = themes[currentTheme];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleThemeSelect = (theme: Theme) => {
    onThemeChange(theme);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs theme-text-muted uppercase tracking-wider">Style:</span>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 theme-surface theme-border border rounded-lg hover:opacity-80 transition-opacity min-w-[160px] justify-between"
        >
          <span className="text-xs theme-text-primary">{currentThemeConfig.name}</span>
          <ChevronDown className={`w-3.5 h-3.5 theme-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div 
            className="absolute top-full right-0 mt-2 w-80 rounded-lg border shadow-xl z-50 overflow-hidden"
            style={{ 
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <div className="p-3">
              <div className="text-xs theme-text-muted uppercase tracking-wider mb-3">
                Select Theme
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                {(Object.keys(themes) as Theme[]).map((themeKey) => {
                  const theme = themes[themeKey];
                  const colors = themeColors[themeKey];
                  const isActive = currentTheme === themeKey;
                  
                  return (
                    <button
                      key={themeKey}
                      onClick={() => handleThemeSelect(themeKey)}
                      className="flex items-center gap-3 p-2 rounded-lg border transition-all text-left"
                      style={{
                        borderColor: isActive ? 'var(--theme-accent)' : 'transparent',
                        borderWidth: isActive ? '2px' : '1px',
                        backgroundColor: 'var(--theme-surface)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = 'var(--theme-border)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {/* Color preview */}
                      <div className="flex gap-1 shrink-0">
                        <div 
                          className="w-6 h-6 rounded border border-black/10" 
                          style={{ backgroundColor: colors.bg }}
                        />
                        <div 
                          className="w-6 h-6 rounded border border-black/10" 
                          style={{ backgroundColor: colors.text }}
                        />
                        <div 
                          className="w-6 h-6 rounded border border-black/10" 
                          style={{ backgroundColor: colors.accent }}
                        />
                      </div>
                      
                      {/* Theme info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs theme-text-primary truncate">
                          {theme.name}
                        </div>
                        <div className="text-[10px] theme-text-muted truncate">
                          {theme.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
