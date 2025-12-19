import { NavLink } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Convert', icon: '🔄' },
  { path: '/crop-gif', label: 'Crop', icon: '✂️' },
  { path: '/resize-gif', label: 'Resize', icon: '📐' },
  { path: '/change-gif-speed', label: 'Speed', icon: '⏱️' },
  { path: '/reverse-gif', label: 'Reverse', icon: '↩️' },
  { path: '/rotate-flip-gif', label: 'Rotate', icon: '🔃' },
  { path: '/gif-to-frames', label: 'Split', icon: '📑' },
];

export function Navigation() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="text-xl font-bold text-white">
            SmartGIF
          </NavLink>

          <div className="flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
