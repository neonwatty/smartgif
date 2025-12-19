// Platform-specific presets for common GIF dimensions and file size constraints

export type PresetCategory =
  | 'discord'
  | 'twitter'
  | 'instagram'
  | 'slack'
  | 'whatsapp'
  | 'telegram'
  | 'favicon';

export interface Preset {
  id: string;
  name: string;
  category: PresetCategory;
  width: number;
  height: number;
  maxFileSizeKB?: number;
  description: string;
  icon: string;
}

export interface PresetCategoryInfo {
  id: PresetCategory;
  name: string;
  icon: string;
  color: string;
}

export const PRESET_CATEGORIES: PresetCategoryInfo[] = [
  { id: 'discord', name: 'Discord', icon: '🎮', color: 'bg-indigo-600' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'bg-sky-500' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
  { id: 'slack', name: 'Slack', icon: '💬', color: 'bg-green-600' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱', color: 'bg-emerald-500' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: 'bg-blue-400' },
  { id: 'favicon', name: 'Favicon', icon: '🌐', color: 'bg-amber-500' },
];

export const PRESETS: Preset[] = [
  // Discord
  {
    id: 'discord-emoji',
    name: 'Emoji',
    category: 'discord',
    width: 128,
    height: 128,
    maxFileSizeKB: 256,
    description: 'Animated emoji for Discord servers',
    icon: '😀',
  },
  {
    id: 'discord-sticker',
    name: 'Sticker',
    category: 'discord',
    width: 320,
    height: 320,
    maxFileSizeKB: 512,
    description: 'Discord sticker size',
    icon: '🎨',
  },
  {
    id: 'discord-server-icon',
    name: 'Server Icon',
    category: 'discord',
    width: 512,
    height: 512,
    description: 'Animated server icon',
    icon: '🏠',
  },

  // Twitter/X
  {
    id: 'twitter-gif',
    name: 'GIF Post',
    category: 'twitter',
    width: 1280,
    height: 720,
    maxFileSizeKB: 15360,
    description: 'Optimal size for Twitter GIFs',
    icon: '🎬',
  },
  {
    id: 'twitter-profile',
    name: 'Profile',
    category: 'twitter',
    width: 400,
    height: 400,
    maxFileSizeKB: 2048,
    description: 'Animated profile picture',
    icon: '👤',
  },

  // Instagram
  {
    id: 'instagram-square',
    name: 'Square',
    category: 'instagram',
    width: 1080,
    height: 1080,
    description: 'Square post (1:1)',
    icon: '⬜',
  },
  {
    id: 'instagram-story',
    name: 'Story/Reel',
    category: 'instagram',
    width: 1080,
    height: 1920,
    description: 'Story or Reel (9:16)',
    icon: '📱',
  },
  {
    id: 'instagram-landscape',
    name: 'Landscape',
    category: 'instagram',
    width: 1080,
    height: 566,
    description: 'Landscape post (1.91:1)',
    icon: '🖼️',
  },

  // Slack
  {
    id: 'slack-emoji',
    name: 'Emoji',
    category: 'slack',
    width: 128,
    height: 128,
    maxFileSizeKB: 128,
    description: 'Custom Slack emoji',
    icon: '😊',
  },
  {
    id: 'slack-emoji-large',
    name: 'Emoji (Large)',
    category: 'slack',
    width: 256,
    height: 256,
    maxFileSizeKB: 256,
    description: 'Higher quality emoji',
    icon: '😎',
  },

  // WhatsApp
  {
    id: 'whatsapp-sticker',
    name: 'Sticker',
    category: 'whatsapp',
    width: 512,
    height: 512,
    maxFileSizeKB: 100,
    description: 'WhatsApp sticker (strict limit)',
    icon: '🔖',
  },

  // Telegram
  {
    id: 'telegram-sticker',
    name: 'Sticker',
    category: 'telegram',
    width: 512,
    height: 512,
    maxFileSizeKB: 256,
    description: 'Telegram animated sticker',
    icon: '✨',
  },

  // Favicons
  {
    id: 'favicon-16',
    name: '16×16',
    category: 'favicon',
    width: 16,
    height: 16,
    description: 'Browser tab icon',
    icon: '🔹',
  },
  {
    id: 'favicon-32',
    name: '32×32',
    category: 'favicon',
    width: 32,
    height: 32,
    description: 'High DPI browser tab',
    icon: '🔷',
  },
  {
    id: 'favicon-48',
    name: '48×48',
    category: 'favicon',
    width: 48,
    height: 48,
    description: 'Windows taskbar',
    icon: '🔶',
  },
  {
    id: 'favicon-180',
    name: '180×180',
    category: 'favicon',
    width: 180,
    height: 180,
    description: 'Apple Touch icon',
    icon: '🍎',
  },
];

// Helper functions
export function getPresetsByCategory(category: PresetCategory): Preset[] {
  return PRESETS.filter((p) => p.category === category);
}

export function getCategoryInfo(category: PresetCategory): PresetCategoryInfo | undefined {
  return PRESET_CATEGORIES.find((c) => c.id === category);
}

export function findPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}

export function getPopularPresets(): Preset[] {
  // Return most commonly used presets
  return [
    findPreset('discord-emoji')!,
    findPreset('slack-emoji')!,
    findPreset('whatsapp-sticker')!,
    findPreset('twitter-gif')!,
    findPreset('instagram-square')!,
  ];
}
