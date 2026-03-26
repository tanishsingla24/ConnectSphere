import React from 'react';
import AppShell from '../components/AppShell';

export default function Explore() {
  return (
    <AppShell pageTitle="Explore">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/50 p-4 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">
          Search and discovery will be implemented next. For now, use Calls
          for interest-based matching.
        </div>
      </div>
    </AppShell>
  );
}

