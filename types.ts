export interface StyleOption {
  id: string;
  name: string;
  prompt: string;
  thumbnail: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
  groundingLinks?: { title: string; url: string }[];
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  EDITOR = 'EDITOR',
}

export interface ImageContext {
  original: string; // Base64
  generated: string | null; // Base64
}

export const STYLES: StyleOption[] = [
  {
    id: 'modern',
    name: 'Mid-Century Modern',
    prompt: 'Mid-Century Modern interior design style, teak wood, organic curves, clean lines',
    thumbnail: 'https://picsum.photos/id/1/200/200',
  },
  {
    id: 'scandi',
    name: 'Scandinavian',
    prompt: 'Scandinavian interior design style, bright, airy, white walls, light wood, minimalist',
    thumbnail: 'https://picsum.photos/id/2/200/200',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    prompt: 'Industrial loft interior design style, exposed brick, metal accents, leather furniture',
    thumbnail: 'https://picsum.photos/id/3/200/200',
  },
  {
    id: 'boho',
    name: 'Bohemian',
    prompt: 'Bohemian interior design style, plants, patterns, textures, eclectic, warm colors',
    thumbnail: 'https://picsum.photos/id/4/200/200',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    prompt: 'Ultra minimalist interior design style, monochrome, clutter-free, functional',
    thumbnail: 'https://picsum.photos/id/5/200/200',
  },
  {
    id: 'art_deco',
    name: 'Art Deco',
    prompt: 'Art Deco interior design style, geometric patterns, gold accents, velvet, luxury',
    thumbnail: 'https://picsum.photos/id/6/200/200',
  },
  {
    id: 'coastal',
    name: 'Coastal Breeze',
    prompt: 'Coastal interior design style, beach house vibe, light blues, whites, natural textures, airy, nautical accents',
    thumbnail: 'https://picsum.photos/id/7/200/200',
  },
  {
    id: 'farmhouse',
    name: 'Modern Farmhouse',
    prompt: 'Modern Farmhouse interior design style, rustic wood beams, neutral palette, cozy, shiplap, vintage accents',
    thumbnail: 'https://picsum.photos/id/8/200/200',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    prompt: 'Cyberpunk interior design style, neon lights, futuristic, high-tech, dark aesthetic, purple and blue glow',
    thumbnail: 'https://picsum.photos/id/9/200/200',
  },
];