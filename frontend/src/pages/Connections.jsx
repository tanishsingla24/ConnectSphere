import React from 'react';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';

export default function Connections() {
  const { user } = useAuth();

  return (
    <AppShell pageTitle="Connections">
      <div className="space-y-4">
        <div className="glass-card p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Interest-based discovery
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Your “connections” are created through interest-based matches
            during calls. Next we will add explicit follow/connect requests
            like LinkedIn.
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Your interests
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(user?.interests || []).map((i) => (
              <span
                key={i}
                className="rounded-full border border-white/20 bg-white/50 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200"
              >
                {i}
              </span>
            ))}
            {(user?.interests || []).length === 0 && (
              <span className="text-xs text-slate-600 dark:text-slate-300">
                No interests yet.
              </span>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

