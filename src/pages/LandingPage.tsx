import { Link } from 'react-router-dom';

interface ToolCardProps {
  icon: string;
  name: string;
  description: string;
  link: string;
  features: string[];
  index: number;
}

function ToolCard({ icon, name, description, link, features, index }: ToolCardProps) {
  return (
    <Link
      to={link}
      className={`
        group bg-gray-800/80 backdrop-blur-sm rounded-xl p-6
        border border-gray-700/50 card-hover glow-box
        animate-on-load animate-fade-in-up
      `}
      style={{ animationDelay: `${200 + index * 100}ms` }}
    >
      <div className="text-4xl mb-3 animate-float" style={{ animationDelay: `${index * 200}ms` }}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors font-display">
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

const TOOLS = [
  {
    icon: '🔄',
    name: 'Convert to GIF',
    description: 'Convert PNG, JPG, WebP images and MP4/WebM videos to optimized GIFs.',
    link: '/convert',
    features: ['Images & videos', 'Target file size', 'Auto-optimization'],
  },
  {
    icon: '✂️',
    name: 'Crop',
    description: 'Precisely crop images and GIFs with aspect ratio presets or freeform selection.',
    link: '/crop-gif',
    features: ['PNG, JPG, GIF support', 'Aspect ratio lock', 'Auto-crop borders'],
  },
  {
    icon: '📐',
    name: 'Resize',
    description: 'Scale images and GIFs to exact dimensions with platform presets for Discord, Twitter, and more.',
    link: '/resize-gif',
    features: ['Platform presets', 'Quality control', 'Aspect ratio lock'],
  },
  {
    icon: '⏱️',
    name: 'Change Speed',
    description: 'Speed up or slow down GIFs and animations with precise timing controls.',
    link: '/change-gif-speed',
    features: ['Speed multiplier', 'Frame delay editor', 'Smooth playback'],
  },
  {
    icon: '↩️',
    name: 'Reverse',
    description: 'Play GIFs and animations backwards or create seamless boomerang loops.',
    link: '/reverse-gif',
    features: ['Reverse playback', 'Boomerang mode', 'Ping-pong loop'],
  },
  {
    icon: '🔃',
    name: 'Rotate & Flip',
    description: 'Rotate images and GIFs 90°/180°/270° or flip horizontally and vertically.',
    link: '/rotate-flip-gif',
    features: ['All image formats', 'Flip H/V', 'Arbitrary angle'],
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
    <div className="animated-gradient grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8">
          <h1 className="animate-on-load animate-fade-in-up">
            <span className="block text-5xl md:text-6xl font-bold gradient-text glow-text font-display">
              Smart GIF Tools
            </span>
            <span className="block text-2xl md:text-3xl font-normal text-gray-400 mt-3 delay-100 animate-on-load animate-fade-in-up">
              For Images, Videos & GIFs
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg delay-200 animate-on-load animate-fade-in-up">
            Convert images and videos to GIFs, or edit existing GIFs — crop, resize, speed up, reverse, rotate, and more.
            <span className="text-green-400 font-medium"> 100% free</span>,
            <span className="text-blue-400 font-medium"> 100% private</span>.
            Your files never leave your device.
          </p>
          <div className="flex flex-wrap justify-center gap-4 delay-300 animate-on-load animate-fade-in-up">
            <Link
              to="/convert"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all animate-pulse-glow hover:scale-105"
            >
              Start Converting
            </Link>
            <a
              href="#tools"
              className="px-8 py-4 bg-gray-700/80 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all border border-gray-600 hover:scale-105"
            >
              Explore Tools
            </a>
          </div>
        </section>

        {/* Privacy Banner */}
        <section className="delay-400 animate-on-load animate-fade-in-scale">
          <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 rounded-xl p-6 border border-green-700/30 glow-box backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
              <div className="text-5xl animate-float">🔒</div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-1 font-display">Your Privacy, Guaranteed</h2>
                <p className="text-gray-400">
                  All processing happens locally in your browser. No uploads, no servers, no data collection.
                  Works offline after first load.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center font-display delay-500 animate-on-load animate-fade-in-up">
            All the Tools You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {TOOLS.map((tool, index) => (
              <ToolCard key={tool.link} {...tool} index={index} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center font-display">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📁', title: '1. Upload', desc: 'Drag & drop your image, video, or GIF. Supports PNG, JPG, WebP, MP4, WebM.' },
              { icon: '🎨', title: '2. Edit', desc: 'Use our powerful tools to transform your GIF exactly how you want.' },
              { icon: '⬇️', title: '3. Download', desc: 'Get your optimized GIF instantly. No watermarks, no limits.' },
            ].map((step, i) => (
              <div
                key={i}
                className="text-center space-y-4 p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 card-hover animate-on-load animate-slide-in-left"
                style={{ animationDelay: `${600 + i * 150}ms` }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full flex items-center justify-center mx-auto glow-box">
                  <span className="text-4xl animate-float" style={{ animationDelay: `${i * 300}ms` }}>{step.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white font-display">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center font-display">Powerful Features</h2>
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
              <div
                key={i}
                className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 text-center border border-gray-700/50 card-hover animate-on-load animate-fade-in-scale"
                style={{ animationDelay: `${800 + i * 75}ms` }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-sm font-semibold text-white font-display">{feature.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold gradient-text font-display glow-text">Ready to Create Amazing GIFs?</h2>
          <p className="text-gray-400 text-lg">No signup, no downloads, no hassle. Just powerful image and GIF tools.</p>
          <Link
            to="/convert"
            className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all text-lg animate-pulse-glow hover:scale-105 shadow-lg shadow-blue-500/25"
          >
            Get Started Now
          </Link>
        </section>
      </div>
    </div>
  );
}
