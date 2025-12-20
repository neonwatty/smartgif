export interface PageSEO {
  title: string;
  description: string;
  h1Title: string;
  h1Description: string;
  canonicalPath: string;
}

export const SEO_CONFIG: Record<string, PageSEO> = {
  landing: {
    title: 'SmartGIF - Free GIF Converter & Editor | No Upload Required',
    description: 'Free online GIF tools - convert, resize, crop, compress GIFs for Discord. 100% private, no upload to servers. Works offline in your browser.',
    h1Title: 'Smart GIF Tools',
    h1Description: 'For Images, Videos & GIFs',
    canonicalPath: '/',
  },
  convert: {
    title: 'MP4 to GIF Converter Online Free | No Watermark - SmartGIF',
    description: 'Convert MP4, WebM, video to GIF online free. No watermark, no upload. Target exact file size for Discord. 100% private browser processing.',
    h1Title: 'Convert to GIF',
    h1Description: 'Upload PNG, JPEG, WebP, GIF, MP4, or WebM - Convert to optimized GIF',
    canonicalPath: '/convert',
  },
  crop: {
    title: 'Crop GIF Online Free | No Upload Required - SmartGIF',
    description: 'Crop GIF images online free. No upload to servers, 100% private. Aspect ratio presets for Discord, social media. Works in your browser.',
    h1Title: 'Crop GIF',
    h1Description: 'Upload PNG, JPEG, WebP, GIF, MP4, or WebM - Crop and export as GIF',
    canonicalPath: '/crop-gif',
  },
  resize: {
    title: 'Resize GIF for Discord Emoji | Free, No Quality Loss',
    description: 'Resize GIF to 256KB for Discord emoji, compress to 512KB. No quality loss, no upload. Free online GIF resizer with platform presets.',
    h1Title: 'Resize GIF',
    h1Description: 'Resize for Discord emoji, compress without quality loss',
    canonicalPath: '/resize-gif',
  },
  speed: {
    title: 'Change GIF Speed Online Free | Speed Up or Slow Down',
    description: 'Speed up or slow down GIF animations online free. No upload, 100% private. Precise frame timing controls. Works entirely in your browser.',
    h1Title: 'Change GIF Speed',
    h1Description: 'Speed up, slow down, or adjust frame timing',
    canonicalPath: '/change-gif-speed',
  },
  reverse: {
    title: 'Reverse GIF Online Free | Boomerang Effect - SmartGIF',
    description: 'Reverse GIF animation online free. Create boomerang loops, play backwards. No upload required, 100% private browser processing.',
    h1Title: 'Reverse GIF',
    h1Description: 'Play backwards or create seamless boomerang loops',
    canonicalPath: '/reverse-gif',
  },
  rotate: {
    title: 'Rotate & Flip GIF Online Free | 90, 180, 270 Degrees',
    description: 'Rotate GIF 90, 180, 270 degrees or flip horizontally/vertically. Free online tool, no upload. 100% private processing in browser.',
    h1Title: 'Rotate & Flip GIF',
    h1Description: 'Rotate any angle or flip horizontally/vertically',
    canonicalPath: '/rotate-flip-gif',
  },
  effects: {
    title: 'GIF Effects & Filters Online Free | Grayscale, Sepia',
    description: 'Apply effects to GIF - grayscale, sepia, blur, brightness, contrast. Free online, no upload. 100% private browser processing.',
    h1Title: 'Effects & Filters',
    h1Description: 'Apply grayscale, sepia, blur, brightness, contrast, and more',
    canonicalPath: '/effects',
  },
  split: {
    title: 'GIF to Frames | Extract PNG Images Online Free',
    description: 'Split GIF into individual PNG frames online free. Bulk download as ZIP. No upload, 100% private. Extract all frames from any GIF.',
    h1Title: 'GIF to Frames',
    h1Description: 'Extract all frames as individual PNG images',
    canonicalPath: '/gif-to-frames',
  },
  discord: {
    title: 'Discord GIF Tools - Resize & Compress for Emoji, Stickers & Avatars | SmartGIF',
    description: 'Free Discord GIF tools. Resize GIFs for Discord emoji (256KB, 128x128), stickers (512KB, 320x320), avatars, banners. No upload needed.',
    h1Title: 'Discord GIF Tools',
    h1Description: 'Resize & Compress GIFs for Discord',
    canonicalPath: '/discord',
  },
};
