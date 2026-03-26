import React from 'react';
import AppShell from '../components/AppShell';

export default function Messages() {
  return (
    <AppShell pageTitle="Messages">
      <div className="space-y-4">
        <div className="glass-card p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Real-time messaging
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Next we will add Socket.IO chat threads, typing indicators, and
            media/voice messages.
          </div>
        </div>
      </div>
    </AppShell>
  );
}

