
export interface ColorPalette {
  name: string;
  primary: string;   // Tailwind class or Hex
  secondary: string; // Tailwind class or Hex
  accent: string;    // Tailwind class or Hex
  background: string; // Tailwind class or Hex
  border: string;    // Tailwind class or Hex
  isLight?: boolean;  // Flag for UI contrast
}

export interface RugConfig {
  width: number;
  height: number;
  palette: ColorPalette;
  complexity: number;
  styleName: string;
  hasMedallion: boolean;
  borderWidth: number;
  selectedMotifIds: string[];
  placementMode: 'uniform' | 'random' | 'tiled';
  // Manual overrides
  customColors: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
  };
  useCustomColors: boolean;
}

export interface RugCell {
  char: string;
  color: string; // CSS color or Tailwind class
}

export interface AIRugResponse {
  name: string;
  description: string;
  characters: {
    border: string;
    innerBorder: string;
    field: string;
    medallion: string;
    accent: string;
  };
}
