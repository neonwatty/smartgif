import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { useFAQSchema } from '../hooks/useFAQSchema';
import { SEO_CONFIG } from '../config/seoConfig';
import { FAQ_DATA } from '../lib/faqData';

interface DiscordToolCardProps {
  icon: string;
  name: string;
  description: string;
  link: string;
  specs: string;
  index: number;
}

function DiscordToolCard({ icon, name, description, link, specs, index }: DiscordToolCardProps) {
  return (
    <Link
      to={link}
      className={`
        group bg-gray-800/80 backdrop-blur-sm rounded-xl p-6
        border border-indigo-700/30 card-hover
        animate-on-load animate-fade-in-up
        hover:border-indigo-500/50
      `}
      style={{ animationDelay: `${200 + index * 100}ms` }}
    >
      <div className="text-4xl mb-3 animate-float" style={{ animationDelay: `${index * 200}ms` }}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors font-display">
        {name}
      </h3>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <div className="text-xs text-indigo-400 font-mono bg-indigo-900/30 rounded px-2 py-1 inline-block">
        {specs}
      </div>
    </Link>
  );
}

const DISCORD_TOOLS = [
  {
    icon: '😀',
    name: 'Discord Emoji GIF',
    description: "Resize and compress GIFs to meet Discord's strict emoji requirements. Auto-optimize to stay under 256KB.",
    link: '/resize-gif',
    specs: '128x128 - Max 256KB',
  },
  {
    icon: '🎨',
    name: 'Discord Sticker',
    description: 'Create animated stickers for your Discord server. Automatically resize to 320x320 under 512KB.',
    link: '/resize-gif',
    specs: '320x320 - Max 512KB',
  },
  {
    icon: '👤',
    name: 'Discord Avatar/PFP',
    description: 'Make an animated profile picture that loops perfectly. Displays at 128x128 on Discord.',
    link: '/resize-gif',
    specs: '128x128 - Max 10MB',
  },
  {
    icon: '🖼️',
    name: 'Discord Banner',
    description: 'Create an animated profile banner for Nitro users. Optimal size is 960x540 pixels.',
    link: '/resize-gif',
    specs: '960x540 - Max 10MB',
  },
  {
    icon: '🏠',
    name: 'Server Icon',
    description: 'Animated server icon for boosted servers. Recommended 512x512 for best quality.',
    link: '/resize-gif',
    specs: '512x512 - Max 10MB',
  },
  {
    icon: '🔄',
    name: 'Convert Video to GIF',
    description: 'Convert MP4 or WebM videos to GIF format optimized for Discord sharing.',
    link: '/convert',
    specs: 'Any size - Auto-optimize',
  },
];

const FAQ_ITEMS = FAQ_DATA.discord.faqs;

export function DiscordPage() {
  const seo = SEO_CONFIG.discord;
  const faqData = FAQ_DATA.discord;
  useSEO({ title: seo.title, description: seo.description, canonicalPath: seo.canonicalPath });
  useFAQSchema(faqData.pageId, faqData.faqs);

  return (
    <div className="animated-gradient grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
        {/* Hero Section - Discord themed */}
        <section className="text-center space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900/50 rounded-full text-indigo-300 text-sm mb-4 animate-on-load animate-fade-in-up">
            <span className="text-xl">🎮</span>
            <span>Discord GIF Tools</span>
          </div>

          <h1 className="animate-on-load animate-fade-in-up delay-100">
            <span className="block text-4xl md:text-5xl font-bold text-white glow-text font-display">
              Resize & Compress GIFs
            </span>
            <span className="block text-3xl md:text-4xl font-bold mt-2" style={{ color: '#5865F2' }}>
              for Discord
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto text-lg animate-on-load animate-fade-in-up delay-200">
            Create perfect Discord emojis, stickers, avatars, and banners.
            Automatically resize and compress GIFs to meet Discord's requirements.
            <span className="text-green-400 font-medium"> 100% free</span>,
            <span className="text-blue-400 font-medium"> 100% private</span>.
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-on-load animate-fade-in-up delay-300">
            <Link
              to="/resize-gif"
              className="px-8 py-4 text-white font-semibold rounded-lg transition-all animate-pulse-glow hover:scale-105"
              style={{ backgroundColor: '#5865F2' }}
            >
              Make Discord Emoji
            </Link>
            <a
              href="#tools"
              className="px-8 py-4 bg-gray-700/80 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all border border-gray-600 hover:scale-105"
            >
              View All Discord Tools
            </a>
          </div>
        </section>

        {/* Size Requirements Quick Reference */}
        <section className="animate-on-load animate-fade-in-scale delay-400">
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-6 border border-indigo-700/30 glow-box backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-4 text-center font-display">
              Discord GIF Size Requirements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              {[
                { name: 'Emoji', size: '256KB', dims: '128x128', icon: '😀' },
                { name: 'Sticker', size: '512KB', dims: '320x320', icon: '🎨' },
                { name: 'Avatar', size: '10MB', dims: '128x128', icon: '👤' },
                { name: 'Banner', size: '10MB', dims: '960x540', icon: '🖼️' },
                { name: 'Server Icon', size: '10MB', dims: '512x512', icon: '🏠' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-sm font-medium text-white">{item.name}</div>
                  <div className="text-xs text-indigo-400">{item.dims}</div>
                  <div className="text-xs text-gray-500">Max {item.size}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center font-display animate-on-load animate-fade-in-up delay-500">
            Discord GIF Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DISCORD_TOOLS.map((tool, index) => (
              <DiscordToolCard key={tool.name} {...tool} index={index} />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center font-display">
            How to Resize GIFs for Discord
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📁',
                title: '1. Upload Your GIF',
                desc: 'Drag & drop your GIF, or upload a video to convert. Supports MP4, WebM, and existing GIFs.',
              },
              {
                icon: '🎮',
                title: '2. Select Discord Preset',
                desc: 'Choose emoji, sticker, avatar, or banner. We auto-apply the correct size and compression.',
              },
              {
                icon: '⬇️',
                title: '3. Download & Use',
                desc: 'Get your Discord-ready GIF instantly. Upload directly to Discord - it will work!',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="text-center space-y-4 p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 card-hover animate-on-load animate-slide-in-left"
                style={{ animationDelay: `${600 + i * 150}ms` }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto glow-box"
                  style={{ background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.3), rgba(147, 51, 234, 0.3))' }}
                >
                  <span className="text-4xl animate-float" style={{ animationDelay: `${i * 300}ms` }}>
                    {step.icon}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white font-display">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Use SmartGIF for Discord */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center font-display">
            Why Use SmartGIF for Discord?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🎯', title: 'Auto-Compression', desc: 'Hits Discord limits exactly' },
              { icon: '🔒', title: '100% Private', desc: 'Files never leave your device' },
              { icon: '⚡', title: 'Instant Results', desc: 'No waiting for servers' },
              { icon: '🆓', title: 'Completely Free', desc: 'No signup or watermarks' },
              { icon: '📏', title: 'Exact Dimensions', desc: 'Pixel-perfect presets' },
              { icon: '🎨', title: 'Quality Control', desc: 'Adjustable compression' },
              { icon: '🔄', title: 'Video Support', desc: 'Convert MP4/WebM to GIF' },
              { icon: '📱', title: 'Works Anywhere', desc: 'Mobile & desktop friendly' },
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

        {/* FAQ Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white text-center font-display">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_ITEMS.map((faq, i) => (
              <details
                key={i}
                className="group bg-gray-800/60 rounded-xl border border-gray-700/50 overflow-hidden"
              >
                <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between text-white font-medium hover:bg-gray-700/30 transition-colors">
                  <span>{faq.question}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-400">{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold text-white font-display">Ready to Create Discord GIFs?</h2>
          <p className="text-gray-400 text-lg">
            No signup, no downloads, no watermarks. Start making Discord-ready GIFs now.
          </p>
          <Link
            to="/resize-gif"
            className="inline-block px-10 py-5 text-white font-semibold rounded-xl transition-all text-lg animate-pulse-glow hover:scale-105 shadow-lg"
            style={{
              backgroundColor: '#5865F2',
              boxShadow: '0 0 30px rgba(88, 101, 242, 0.4)',
            }}
          >
            Start Making Discord GIFs
          </Link>
        </section>
      </div>
    </div>
  );
}
