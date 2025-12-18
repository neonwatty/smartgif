import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>100% client-side. Your files never leave your browser.</p>
      </footer>
    </div>
  );
}
