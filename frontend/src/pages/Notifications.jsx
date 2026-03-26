import React from 'react';
import AppShell from '../components/AppShell';

export default function Notifications() {
  return (
    <AppShell pageTitle="Notifications">
      <div className="space-y-4">
        <div className="glass-card p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No notifications yet
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            When you add likes, comments, and call invites, notifications will
            appear here in real time.
          </div>
        </div>
      </div>
    </AppShell>
  );
}

