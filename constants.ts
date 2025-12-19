
import { ColorPalette } from './types';

export const PALETTES: ColorPalette[] = [
  {
    name: "Shiraz Garden",
    primary: "text-red-600",
    secondary: "text-emerald-500",
    accent: "text-amber-400",
    background: "bg-[#1a0505]",
    border: "border-red-950"
  },
  {
    name: "Pearl White",
    primary: "text-slate-800",
    secondary: "text-blue-700",
    accent: "text-rose-600",
    background: "bg-slate-50",
    border: "border-slate-300",
    isLight: true
  },
  {
    name: "Berber Canvas",
    primary: "text-slate-900",
    secondary: "text-blue-600",
    accent: "text-orange-500",
    background: "bg-[#fcf8f0]",
    border: "border-stone-300",
    isLight: true
  },
  {
    name: "High Atlas",
    primary: "text-stone-800",
    secondary: "text-rose-500",
    accent: "text-emerald-600",
    background: "bg-[#f4f1ea]",
    border: "border-stone-200",
    isLight: true
  },
  {
    name: "Royal Saffron",
    primary: "text-amber-900",
    secondary: "text-red-800",
    accent: "text-indigo-800",
    background: "bg-amber-100",
    border: "border-amber-300",
    isLight: true
  },
  {
    name: "Lapis Sky",
    primary: "text-white",
    secondary: "text-cyan-200",
    accent: "text-yellow-300",
    background: "bg-blue-600",
    border: "border-blue-800"
  },
  {
    name: "Tabriz Royal",
    primary: "text-blue-500",
    secondary: "text-yellow-500",
    accent: "text-rose-500",
    background: "bg-[#050a1a]",
    border: "border-blue-900"
  }
];

export const RUG_STYLES = [
  "Persian Masterpiece",
  "Berber Tribal (Nomadic)",
  "Intricate Multi-Border",
  "Bird & Bloom",
  "Sacred Geometry",
  "Medallion Centerpiece",
  "Floral Garden"
];

export const MOTIFS = [
  { id: 'floral', label: 'Floral', chars: ['❀', '✿', '✾', '❃', '❁'] },
  { id: 'bird', label: 'Bird', chars: ['v', 'y', 'w', 'Y', 'M'] },
  { id: 'sun', label: 'Sun', chars: ['☼', '☀', '✹', '✺'] },
  { id: 'heart', label: 'Heart', chars: ['♥', '♡', '❣'] },
  { id: 'star', label: 'Star', chars: ['★', '☆', '✧', '✦'] },
  { id: 'bunny', label: 'Bunny', chars: ['(Y)', '🐰'] },
  { id: 'geometric', label: 'Sigils', chars: ['╬', '╫', '╪', '╫'] },
  { id: 'diamond', label: 'Stacked Diamonds', chars: ['◆', '◇', '◈', '◊'] }
];

export const PLACEMENT_MODES = [
  { id: 'uniform', label: 'Uniform' },
  { id: 'random', label: 'Random Mix' },
  { id: 'tiled', label: 'Rectangular Tiling' }
];
