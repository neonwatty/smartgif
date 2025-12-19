import { Link } from 'react-router-dom';

interface ToolCardProps {
  icon: string;
  name: string;
  description: string;
  link: string;
  features: string[];
}

function ToolCard({ icon, name, description, link, features }: ToolCardProps) {
  return (
    <Link
      to={link}
      className="group bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
        {name}
      </h3>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <ul className="text-xs text-gray-500 space-y-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-1">
            <span className="text-green-500">✓</span> {feature}
          </li>
        ))}
      </ul>
    </Link>
  );
}

const TOOLS: ToolCardProps[] = [
  {
    icon: '🔄',
    name: 'Convert to GIF',
    description: 'Convert videos and images to optimized GIFs with precise file size control.',
    link: '/convert',
    features: ['MP4, WebM, WebP support', 'Target file size', 'Auto-optimization'],
  },
  {
    icon: '✂️',
    name: 'Crop GIF',
    description: 'Precisely crop your GIFs with aspect ratio presets or freeform selection.',
    link: '/crop-gif',
    features: ['Aspect ratio lock', 'Auto-crop borders', 'Visual guides'],
  },
  {
    icon: '📐',
    name: 'Resize GIF',
    description: 'Scale GIFs to exact dimensions with platform presets for Discord, Twitter, and more.',
    link: '/resize-gif',
    features: ['Platform presets', 'Quality control', 'Aspect ratio lock'],
  },
  {
    icon: '⏱️',
    name: 'Change Speed',
    description: 'Speed up or slow down your GIFs with precise timing controls.',
    link: '/change-gif-speed',
    features: ['Speed multiplier', 'Frame delay editor', 'Smooth playback'],
  },
  {
    icon: '↩️',
    name: 'Reverse GIF',
    description: 'Play your GIF backwards or create seamless boomerang loops.',
    link: '/reverse-gif',
    features: ['Reverse playback', 'Boomerang mode', 'Ping-pong loop'],
  },
  {
    icon: '🔃',
    name: 'Rotate & Flip',
    description: 'Rotate 90°/180°/270° or flip horizontally and vertically.',
    link: '/rotate-flip-gif',
    features: ['90° rotations', 'Flip H/V', 'Arbitrary angle'],
  },
  {
    icon: '📑',
    name: 'Split to Frames',
    description: 'Extract all frames from a GIF as individual PNG images.',
    link: '/gif-to-frames',
    features: ['PNG export', 'ZIP download', 'Frame selection'],
  },
];

export function LandingPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Smart GIF Tools
          <span className="block text-2xl md:text-3xl font-normal text-gray-400 mt-2">
            That Run in Your Browser
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Convert, crop, resize, speed up, reverse, rotate, and split GIFs —
          <span className="text-green-400 font-medium"> 100% free</span>,
          <span className="text-blue-400 font-medium"> 100% private</span>.
          Your files never leave your device.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/convert"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Start Converting
          </Link>
          <a
            href="#tools"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Explore Tools
          </a>
        </div>
      </section>

      {/* Privacy Banner */}
      <section className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl p-6 border border-green-800/50">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
          <div className="text-4xl">🔒</div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Your Privacy, Guaranteed</h2>
            <p className="text-gray-400">
              All processing happens locally in your browser. No uploads, no servers, no data collection.
              Works offline after first load.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">All the GIF Tools You Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.link} {...tool} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-white text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">📁</span>
            </div>
            <h3 className="text-lg font-semibold text-white">1. Upload</h3>
            <p className="text-gray-400 text-sm">
              Drag & drop or click to upload your GIF, video, or image file.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">🎨</span>
            </div>
            <h3 className="text-lg font-semibold text-white">2. Edit</h3>
            <p className="text-gray-400 text-sm">
              Use our powerful tools to transform your GIF exactly how you want.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⬇️</span>
            </div>
            <h3 className="text-lg font-semibold text-white">3. Download</h3>
            <p className="text-gray-400 text-sm">
              Get your optimized GIF instantly. No watermarks, no limits.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Powerful Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🎯', title: 'Target File Size', desc: 'Auto-optimize to exact KB' },
            { icon: '🎬', title: 'Video Support', desc: 'MP4, WebM, WebP input' },
            { icon: '📱', title: 'Platform Presets', desc: 'Discord, Twitter, Instagram' },
            { icon: '🖼️', title: 'High Quality', desc: 'Dithering & color control' },
            { icon: '🔒', title: '100% Private', desc: 'No uploads to servers' },
            { icon: '⚡', title: 'Fast Processing', desc: 'Optimized algorithms' },
            { icon: '📦', title: 'Batch Export', desc: 'ZIP download for frames' },
            { icon: '🆓', title: 'Completely Free', desc: 'No signup required' },
          ].map((feature, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold text-white">Ready to Create Amazing GIFs?</h2>
        <p className="text-gray-400">No signup, no downloads, no hassle. Just powerful GIF tools.</p>
        <Link
          to="/convert"
          className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
        >
          Get Started Now
        </Link>
      </section>
    </div>
  );
}
