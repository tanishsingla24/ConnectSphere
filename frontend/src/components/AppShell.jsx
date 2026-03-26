import React, { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Search, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // Default: respect system
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, setDark };
}

export default function AppShell({ children, pageTitle = 'Social' }) {
  const { user, logout } = useAuth();
  const { dark, setDark } = useDarkMode();

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const nav = useMemo(
    () => [
      { label: 'Feed', href: '/feed' },
      { label: 'Explore', href: '/explore' },
      { label: 'Connections', href: '/connections' },
      { label: 'Calls', href: '/calls' },
      { label: 'Profile', href: '/profile' },
    ],
    []
  );

  return (
    <div className="min-h-screen app-bg">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-2 hidden lg:block">
            <div className="glass-card p-4">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glass" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    InterestChat
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Social video platform
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {nav.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/'}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-2 text-sm transition ${
                        isActive
                          ? 'bg-white/60 text-slate-900 dark:bg-white/10 dark:text-white'
                          : 'text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <button
                onClick={logout}
                className="mt-6 w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Logout
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 lg:col-span-7">
            <div className="glass-card p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageTitle}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <header className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {pageTitle}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        Premium experience for your community.
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="rounded-xl border border-white/10 bg-white/10 p-2 text-slate-100 hover:bg-white/20">
                        <Search size={18} />
                      </button>
                      <button className="rounded-xl border border-white/10 bg-white/10 p-2 text-slate-100 hover:bg-white/20">
                        <Bell size={18} />
                      </button>
                      <button
                        onClick={() => setDark(!dark)}
                        className="rounded-xl border border-white/10 bg-white/10 p-2 text-slate-100 hover:bg-white/20"
                        aria-label="Toggle theme"
                      >
                        {dark ? <Sun size={18} /> : <Moon size={18} />}
                      </button>
                      <button className="rounded-xl border border-white/10 bg-white/10 p-2 text-slate-100 hover:bg-white/20">
                        <Settings size={18} />
                      </button>
                    </div>
                  </header>

                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Right panel */}
          <aside className="col-span-3 hidden xl:block">
            <div className="space-y-4">
              <div className="glass-card p-4">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Suggestions
                </div>
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  Connect with people who share your interests.
                </div>
                <div className="mt-4 space-y-3">
                  {['AI & Tech', 'Sports', 'Photography'].map((t) => (
                    <div
                      key={t}
                      className="rounded-xl border border-white/20 bg-white/50 p-3 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-200"
                    >
                      Trending: {t}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Profile
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user?.fullName || 'User'}
                    </div>
                    <div className="truncate text-xs text-slate-600 dark:text-slate-300">
                      Interests: {user?.interests?.[0] || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

