export interface FAQItem {
  question: string;
  answer: string;
}

export interface PageFAQData {
  pageId: string;
  faqs: FAQItem[];
}

export const FAQ_DATA: Record<string, PageFAQData> = {
  landing: {
    pageId: 'landing',
    faqs: [
      {
        question: 'Is SmartGIF really free?',
        answer: 'Yes, SmartGIF is 100% free with no hidden costs, no watermarks on your GIFs, no signup required, and no usage limits. All tools are available immediately without creating an account.',
      },
      {
        question: 'Is SmartGIF safe and private?',
        answer: 'Absolutely. SmartGIF runs entirely in your browser - your files are never uploaded to any server. All processing happens locally on your device, making it completely private. The tool even works offline after initial load.',
      },
      {
        question: 'What file types does SmartGIF support?',
        answer: 'SmartGIF accepts PNG, JPEG, WebP, and GIF images, plus MP4 and WebM videos. You can convert any of these to optimized GIF format with precise control over size and quality.',
      },
      {
        question: 'Does SmartGIF work on mobile?',
        answer: 'Yes, SmartGIF works on any device with a modern web browser including phones and tablets. The responsive interface adapts to your screen size for comfortable use on any device.',
      },
      {
        question: 'How do I make a GIF under a specific file size?',
        answer: 'Use the Convert tool with "Auto" mode enabled and set your target size in KB. SmartGIF automatically optimizes dimensions, colors, and frame rate to meet your size requirement. Perfect for Discord emojis (256KB), stickers (512KB), and more.',
      },
    ],
  },
  convert: {
    pageId: 'convert',
    faqs: [
      {
        question: 'How do I convert a video to GIF?',
        answer: 'Upload your MP4, WebM, or other video file to SmartGIF, set your desired size settings, and click Convert. The entire conversion happens in your browser - no upload to servers required. Your video is processed locally for complete privacy.',
      },
      {
        question: 'What video formats can I convert to GIF?',
        answer: 'SmartGIF supports MP4, WebM, and animated WebP video formats. You can also convert static images (PNG, JPG, WebP) and combine them into an animated GIF. All processing is done client-side in your browser.',
      },
      {
        question: 'How do I compress a GIF to a specific file size?',
        answer: 'Use the "Auto" mode and set your target file size in KB. SmartGIF will automatically optimize the GIF dimensions, colors, and frame rate to hit your target size while maintaining the best possible quality. Perfect for Discord, Slack, or other platforms with size limits.',
      },
      {
        question: 'Is the GIF converter free to use?',
        answer: 'Yes, SmartGIF is 100% free with no watermarks, no signup required, and no usage limits. The tool runs entirely in your browser, so your files are never uploaded to any server.',
      },
      {
        question: 'Can I convert video to GIF offline?',
        answer: 'Yes! Once you load SmartGIF in your browser, it works completely offline. All video-to-GIF conversion is done locally using your device\'s processing power. Your files never leave your computer.',
      },
    ],
  },
  crop: {
    pageId: 'crop',
    faqs: [
      {
        question: 'How do I crop an animated GIF?',
        answer: 'Upload your GIF to SmartGIF\'s crop tool, then drag the selection handles to define your crop area. The tool crops all frames consistently, preserving animation timing. You can use preset aspect ratios or crop freeform.',
      },
      {
        question: 'Can I crop a GIF to a specific aspect ratio?',
        answer: 'Yes, SmartGIF includes aspect ratio presets like 1:1 (square), 16:9 (widescreen), and 9:16 (vertical). Select your preferred ratio before cropping to maintain consistent proportions. This is perfect for creating platform-specific content.',
      },
      {
        question: 'How do I remove borders from a GIF?',
        answer: 'Use SmartGIF\'s crop tool to select only the content area, excluding the unwanted borders. The visual preview shows exactly what will be kept, so you can precisely trim any black bars or unwanted edges from your animation.',
      },
      {
        question: 'Does cropping affect GIF file size?',
        answer: 'Yes, cropping removes pixels which typically reduces file size. A smaller crop area means fewer pixels per frame, resulting in a smaller output file. This is a great way to reduce GIF size while keeping the important content.',
      },
      {
        question: 'Is the cropped GIF quality the same as the original?',
        answer: 'Yes, SmartGIF performs lossless cropping - the pixels in your crop area maintain their original quality. No recompression artifacts are added during the crop operation.',
      },
    ],
  },
  resize: {
    pageId: 'resize',
    faqs: [
      {
        question: 'How do I resize a GIF without losing quality?',
        answer: 'Upload your GIF to SmartGIF and use the resize tool to set your desired dimensions. The tool uses high-quality scaling algorithms and lets you control color depth and dithering to maintain visual quality. Keep the aspect ratio locked to prevent distortion.',
      },
      {
        question: 'What is the Discord emoji size limit?',
        answer: 'Discord animated emojis must be 128x128 pixels and under 256KB. Use SmartGIF\'s Discord Emoji preset to automatically resize your GIF to these exact specifications. The tool will optimize file size while keeping your animation smooth.',
      },
      {
        question: 'How do I compress a GIF for Discord under 256KB?',
        answer: 'Use SmartGIF\'s Discord Emoji preset which automatically sets the size to 128x128 and targets under 256KB. The auto-optimizer will adjust quality settings to hit the file size limit while preserving as much animation quality as possible.',
      },
      {
        question: 'How do I make a Discord sticker from a GIF?',
        answer: 'Discord stickers must be 320x320 pixels and under 512KB. Select the Discord Sticker preset in SmartGIF, upload your GIF, and it will automatically resize and optimize to meet Discord\'s sticker requirements.',
      },
      {
        question: 'Can I resize multiple GIFs at once?',
        answer: 'Currently SmartGIF processes one GIF at a time to ensure optimal quality for each file. However, processing is fast since everything runs locally in your browser with no upload time.',
      },
    ],
  },
  speed: {
    pageId: 'speed',
    faqs: [
      {
        question: 'How do I speed up a GIF?',
        answer: 'Upload your GIF to SmartGIF\'s speed tool and use the speed multiplier slider. Values above 1x speed up the animation (2x plays twice as fast), while values below 1x slow it down. The preview updates in real-time so you can find the perfect speed.',
      },
      {
        question: 'How do I slow down a GIF without losing frames?',
        answer: 'SmartGIF adjusts frame delay timing rather than removing frames, so slowing down a GIF preserves all original frames. Use the speed slider to set values below 1x - for example, 0.5x makes the animation play at half speed.',
      },
      {
        question: 'Can I change the frame rate of a GIF?',
        answer: 'Yes, the speed tool effectively changes the playback frame rate by adjusting frame delays. Speeding up increases the effective FPS while slowing down decreases it. All original frames are preserved in the output.',
      },
      {
        question: 'What speed multiplier should I use for smooth GIFs?',
        answer: 'For most GIFs, staying between 0.25x and 4x provides smooth results. Very slow speeds (below 0.25x) can look choppy, while very fast speeds (above 4x) may cause frames to blend together. Preview your changes before downloading.',
      },
      {
        question: 'Does changing GIF speed affect file size?',
        answer: 'Changing speed has minimal impact on file size since all frames are preserved. The only change is the delay timing between frames, which requires negligible additional data.',
      },
    ],
  },
  reverse: {
    pageId: 'reverse',
    faqs: [
      {
        question: 'How do I reverse a GIF animation?',
        answer: 'Upload your GIF to SmartGIF\'s reverse tool and select "Reverse" mode. This plays your animation backwards from end to start. Click Download to save the reversed GIF. All processing happens in your browser privately.',
      },
      {
        question: 'What is a boomerang GIF?',
        answer: 'A boomerang GIF plays forward then backward in a continuous loop, creating a back-and-forth effect. In SmartGIF, select "Boomerang" mode to automatically create this effect from any GIF or video clip.',
      },
      {
        question: 'How do I make a boomerang effect from a video?',
        answer: 'Upload your video to SmartGIF, and the tool will convert it to frames. Select "Boomerang" mode to create the forward-backward loop effect. The resulting GIF will seamlessly play forward then reverse endlessly.',
      },
      {
        question: 'Does reversing a GIF change the file size?',
        answer: 'A simple reverse maintains the same file size since it uses the same frames in opposite order. Boomerang mode approximately doubles the file size because it duplicates frames to create the forward-backward loop.',
      },
      {
        question: 'Can I create a ping-pong loop from a GIF?',
        answer: 'Yes, the Boomerang mode creates a ping-pong (forward-backward) loop. This is perfect for creating seamless animations where the end connects back to the beginning smoothly.',
      },
    ],
  },
  rotate: {
    pageId: 'rotate',
    faqs: [
      {
        question: 'How do I rotate a GIF 90 degrees?',
        answer: 'Upload your GIF to SmartGIF\'s rotate tool and click the 90 degree rotation button. You can rotate clockwise or counterclockwise in 90 degree increments, or rotate 180 degrees to flip upside down. All frames rotate consistently.',
      },
      {
        question: 'Can I flip a GIF horizontally or vertically?',
        answer: 'Yes, SmartGIF supports both horizontal flip (mirror) and vertical flip. Use the flip buttons to instantly mirror your GIF. This is useful for correcting selfie-mode recordings or creating mirror effects.',
      },
      {
        question: 'How do I rotate a GIF to any angle?',
        answer: 'SmartGIF supports arbitrary angle rotation. Use the angle slider to rotate your GIF to any degree between 0 and 360. The preview updates in real-time as you adjust the rotation.',
      },
      {
        question: 'Does rotating a GIF affect quality?',
        answer: 'Rotations of 90, 180, and 270 degrees are lossless since pixels are simply repositioned. Arbitrary angle rotations require resampling which can slightly affect quality, but SmartGIF uses high-quality interpolation to minimize artifacts.',
      },
      {
        question: 'Can I rotate a video before converting to GIF?',
        answer: 'Yes, SmartGIF accepts videos (MP4, WebM) and lets you rotate them before or after conversion. Upload your video, apply rotation, and download as an optimized GIF all in one workflow.',
      },
    ],
  },
  effects: {
    pageId: 'effects',
    faqs: [
      {
        question: 'What effects can I add to a GIF?',
        answer: 'SmartGIF offers 9 effects: Grayscale, Sepia, Invert, Blur, Brightness, Contrast, Saturation, Hue Rotate, and Sharpen. You can adjust intensity with sliders and combine multiple effects for unique looks.',
      },
      {
        question: 'How do I make a GIF black and white?',
        answer: 'Upload your GIF and apply the Grayscale effect at 100% intensity. This converts all colors to shades of gray. You can also partially desaturate by using a lower Saturation value for a muted color look.',
      },
      {
        question: 'Can I add a vintage filter to my GIF?',
        answer: 'Yes, use the Vintage preset or combine Sepia, reduced Saturation, and adjusted Contrast to create a retro film look. SmartGIF\'s live preview lets you see changes instantly as you adjust effect settings.',
      },
      {
        question: 'Do effects increase GIF file size?',
        answer: 'Effects that reduce colors (like Grayscale or Sepia) can actually decrease file size due to better compression. Effects like Blur may slightly increase size. The impact varies based on your source content.',
      },
      {
        question: 'Can I undo effects after applying them?',
        answer: 'Yes, simply reset the effect sliders to their default values. Since SmartGIF processes non-destructively, you can always return to the original by resetting all effects before downloading.',
      },
    ],
  },
  split: {
    pageId: 'split',
    faqs: [
      {
        question: 'How do I extract frames from a GIF?',
        answer: 'Upload your GIF to SmartGIF\'s split tool. It automatically extracts all frames and displays them as thumbnails. You can download individual frames as PNG images or download all frames at once in a ZIP file.',
      },
      {
        question: 'What format are extracted frames saved as?',
        answer: 'Frames are extracted as high-quality PNG images, which preserves transparency if present in the original GIF. PNG is a lossless format, so extracted frames maintain full quality.',
      },
      {
        question: 'Can I select which frames to download?',
        answer: 'Yes, you can click individual frames to download them one at a time, or use the Download All button to get every frame in a ZIP archive. This is useful when you only need specific moments from an animation.',
      },
      {
        question: 'How many frames can I extract from a GIF?',
        answer: 'SmartGIF can handle GIFs with hundreds of frames. All processing happens in your browser, so extraction speed depends on your device. Large GIFs may take a moment to process but will complete fully.',
      },
      {
        question: 'Can I extract frames from a video?',
        answer: 'Yes, upload an MP4, WebM, or other video format. SmartGIF will extract frames from the video which you can then download as PNG images. This is great for creating thumbnails or capturing specific video moments.',
      },
    ],
  },
  discord: {
    pageId: 'discord',
    faqs: [
      {
        question: "What are Discord's emoji size limits?",
        answer: 'Discord animated emojis must be 256KB or smaller and display at 128x128 pixels. SmartGIF automatically resizes and compresses your GIF to meet these requirements.',
      },
      {
        question: 'How do I make a GIF under 256KB for Discord?',
        answer: "Use our Discord Emoji tool which automatically compresses your GIF. If it's still too large, try reducing the number of frames, using fewer colors, or making the animation shorter.",
      },
      {
        question: 'What size should Discord stickers be?',
        answer: 'Discord stickers must be exactly 320x320 pixels and under 512KB. Our Discord Sticker tool handles this automatically.',
      },
      {
        question: 'Can I use animated GIFs as my Discord profile picture?',
        answer: 'Yes! Discord supports animated avatars. They display at 128x128 pixels and can be up to 10MB. Use our Avatar/PFP tool for perfect sizing.',
      },
      {
        question: 'Do I need Nitro for animated Discord banners?',
        answer: 'Yes, Discord Nitro is required for animated profile banners. The optimal size is 960x540 pixels with a 10MB limit.',
      },
    ],
  },
};
