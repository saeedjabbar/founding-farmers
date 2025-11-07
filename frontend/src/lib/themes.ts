export type Theme = 'archiveLight' | 'archiveDark' | 'nasaLight' | 'nasaDark' | 'functionalistLight' | 'functionalistDark' | 'reportLight' | 'reportDark' | 'nasaPrint1Light' | 'nasaPrint1Dark' | 'nasaPrint1RedLight' | 'nasaPrint1RedDark' | 'nasaPrint2Light' | 'nasaPrint2Dark' | 'pitchDeckLight' | 'pitchDeckDark' | 'studioLight' | 'studioDark' | 'atelierLight' | 'atelierDark' | 'editorialLight' | 'editorialDark' | 'editorialRedLight' | 'editorialRedDark' | 'investigationLight' | 'investigationDark';

export interface ThemeConfig {
  name: string;
  description: string;
  className: string;
}

export interface ThemeColors {
  bg: string;
  text: string;
  accent: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  archiveLight: {
    name: 'Archive Light',
    description: 'Clean, crisp light mode for reading',
    className: 'theme-archive-light',
  },
  archiveDark: {
    name: 'Archive Dark',
    description: 'Easy on the eyes dark mode',
    className: 'theme-archive-dark',
  },
  nasaLight: {
    name: 'NASA Light',
    description: 'Mid-century technical report style',
    className: 'theme-nasa-light',
  },
  nasaDark: {
    name: 'NASA Dark',
    description: 'Dark technical report style',
    className: 'theme-nasa-dark',
  },
  nasaPrint1Light: {
    name: 'NASA Print 1 Light',
    description: '1960s Technical Note cover style',
    className: 'theme-nasa-print-1-light',
  },
  nasaPrint1Dark: {
    name: 'NASA Print 1 Dark',
    description: 'Technical Note inverted dark mode',
    className: 'theme-nasa-print-1-dark',
  },
  nasaPrint1RedLight: {
    name: 'NASA Print 1 Red Light',
    description: '1960s Technical Note with red accents',
    className: 'theme-nasa-print-1-red-light',
  },
  nasaPrint1RedDark: {
    name: 'NASA Print 1 Red Dark',
    description: 'Technical Note dark mode with red accents',
    className: 'theme-nasa-print-1-red-dark',
  },
  nasaPrint2Light: {
    name: 'NASA Print 2 Light',
    description: 'Engineering document form style',
    className: 'theme-nasa-print-2-light',
  },
  nasaPrint2Dark: {
    name: 'NASA Print 2 Dark',
    description: 'Engineering document dark mode',
    className: 'theme-nasa-print-2-dark',
  },
  functionalistLight: {
    name: 'Functionalist Light',
    description: 'Pure minimalist light design',
    className: 'theme-functionalist-light',
  },
  functionalistDark: {
    name: 'Functionalist Dark',
    description: 'Pure minimalist dark design',
    className: 'theme-functionalist-dark',
  },
  reportLight: {
    name: 'Report Light',
    description: 'Classic printed report style',
    className: 'theme-report-light',
  },
  reportDark: {
    name: 'Report Dark',
    description: 'Dark printed report style',
    className: 'theme-report-dark',
  },
  pitchDeckLight: {
    name: 'Pitch Deck Light',
    description: 'Bold presentation style with red accents',
    className: 'theme-pitch-deck-light',
  },
  pitchDeckDark: {
    name: 'Pitch Deck Dark',
    description: 'Dark presentation mode with red accents',
    className: 'theme-pitch-deck-dark',
  },
  studioLight: {
    name: 'Studio Light',
    description: 'Minimal beige aesthetic with serif typography',
    className: 'theme-studio-light',
  },
  studioDark: {
    name: 'Studio Dark',
    description: 'Dark minimal with warm undertones',
    className: 'theme-studio-dark',
  },
  atelierLight: {
    name: 'Atelier Light',
    description: 'Clean modernist grey palette',
    className: 'theme-atelier-light',
  },
  atelierDark: {
    name: 'Atelier Dark',
    description: 'Dark modernist workspace',
    className: 'theme-atelier-dark',
  },
  editorialLight: {
    name: 'Editorial Light',
    description: 'Classic Garamond typography for editorial text',
    className: 'theme-editorial-light',
  },
  editorialDark: {
    name: 'Editorial Dark',
    description: 'Dark mode with classic editorial serif',
    className: 'theme-editorial-dark',
  },
  editorialRedLight: {
    name: 'Editorial Red Light',
    description: 'Classic editorial with red accents',
    className: 'theme-editorial-red-light',
  },
  editorialRedDark: {
    name: 'Editorial Red Dark',
    description: 'Dark editorial with red accents',
    className: 'theme-editorial-red-dark',
  },
  investigationLight: {
    name: 'Investigation Light',
    description: 'Technical sans-serif meta, justified serif story, monospace sources',
    className: 'theme-investigation-light',
  },
  investigationDark: {
    name: 'Investigation Dark',
    description: 'Dark investigation theme with mixed typography',
    className: 'theme-investigation-dark',
  },
};

export const themeColors: Record<Theme, ThemeColors> = {
  archiveLight: {
    bg: '#f8f8f8',
    text: '#1a1a1a',
    accent: '#404040',
  },
  archiveDark: {
    bg: '#1c1c1c',
    text: '#e5e5e5',
    accent: '#d4d4d4',
  },
  nasaLight: {
    bg: '#f5f3ed',
    text: '#1a1a1a',
    accent: '#1e5a8e',
  },
  nasaDark: {
    bg: '#1a1a1a',
    text: '#e5e5e5',
    accent: '#5fa3d0',
  },
  nasaPrint1Light: {
    bg: '#fdfdfb',
    text: '#000000',
    accent: '#000000',
  },
  nasaPrint1Dark: {
    bg: '#0a0a0a',
    text: '#f5f5f5',
    accent: '#f5f5f5',
  },
  nasaPrint1RedLight: {
    bg: '#fdfdfb',
    text: '#000000',
    accent: '#c41e3a',
  },
  nasaPrint1RedDark: {
    bg: '#0a0a0a',
    text: '#f5f5f5',
    accent: '#ff4d6a',
  },
  nasaPrint2Light: {
    bg: '#ffffff',
    text: '#000000',
    accent: '#000000',
  },
  nasaPrint2Dark: {
    bg: '#0d0d0d',
    text: '#f0f0f0',
    accent: '#f0f0f0',
  },
  functionalistLight: {
    bg: '#ffffff',
    text: '#1f1f1f',
    accent: '#2f2f2f',
  },
  functionalistDark: {
    bg: '#141414',
    text: '#e8e8e8',
    accent: '#d6d6d6',
  },
  reportLight: {
    bg: '#fcfcfc',
    text: '#1a1a1a',
    accent: '#3d3d3d',
  },
  reportDark: {
    bg: '#1b1b1b',
    text: '#e3e3e3',
    accent: '#c9c9c9',
  },
  pitchDeckLight: {
    bg: '#e8e4d8',
    text: '#1a1a1a',
    accent: '#c41e3a',
  },
  pitchDeckDark: {
    bg: '#1a1614',
    text: '#e8e4d8',
    accent: '#ff4d6a',
  },
  studioLight: {
    bg: '#f5f3f0',
    text: '#1a1a1a',
    accent: '#4a4a4a',
  },
  studioDark: {
    bg: '#1c1a18',
    text: '#f5f3f0',
    accent: '#b8b6b3',
  },
  atelierLight: {
    bg: '#f8f8f8',
    text: '#1a1a1a',
    accent: '#6a6a6a',
  },
  atelierDark: {
    bg: '#1a1a1a',
    text: '#f8f8f8',
    accent: '#a8a8a8',
  },
  editorialLight: {
    bg: '#f4f3f0',
    text: '#1a1a1a',
    accent: '#4a4a4a',
  },
  editorialDark: {
    bg: '#1a1814',
    text: '#f4f3f0',
    accent: '#b8b6b0',
  },
  editorialRedLight: {
    bg: '#f8f8f8',
    text: '#1a1a1a',
    accent: '#c41e3a',
  },
  editorialRedDark: {
    bg: '#1c1c1c',
    text: '#e5e5e5',
    accent: '#ff4d6a',
  },
  investigationLight: {
    bg: '#f5f3f0',
    text: '#1a1a1a',
    accent: '#2a2a2a',
  },
  investigationDark: {
    bg: '#1a1814',
    text: '#f5f3f0',
    accent: '#d8d6d0',
  },
};
