import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { callsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await callsAPI.history();
        if (cancelled) return;
        setCalls(response?.calls || []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Failed to load call history');
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderCallCard = (call) => {
    if (!user?._id) return null;
    const userId = String(user._id);
    const aId = call.participants?.userA?._id ? String(call.participants.userA._id) : null;
    const bId = call.participants?.userB?._id ? String(call.participants.userB._id) : null;

    const other =
      aId === userId ? call.participants.userB : aId ? call.participants.userA : null;

    if (!other) return null;

    const statusText =
      call.status === 'matched'
        ? 'Matched'
        : call.status === 'calling'
          ? 'Calling'
          : 'Ended';

    return (
      <div
        key={call.id}
        className="glass-card p-5 transition hover:bg-white/80 dark:hover:bg-white/10"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
              {other.fullName}
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Status: {statusText}
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
              {call.startedAt ? `Started: ${new Date(call.startedAt).toLocaleString()}` : 'Started: —'}
            </div>
            {call.endedAt && (
              <div className="text-xs text-slate-600 dark:text-slate-300">
                Ended: {new Date(call.endedAt).toLocaleString()}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/20 bg-white/50 px-3 py-2">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Common interests
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(call.commonInterests || []).slice(0, 3).map((i) => (
                <span
                  key={i}
                  className="rounded-full border border-white/20 bg-white/60 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200"
                >
                  {i}
                </span>
              ))}
              {(call.commonInterests || []).length > 3 && (
                <span className="text-[10px] text-slate-600 dark:text-slate-300">
                  +{(call.commonInterests || []).length - 3}
                </span>
              )}
              {(call.commonInterests || []).length === 0 && (
                <span className="text-[10px] text-slate-600 dark:text-slate-300">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell pageTitle="Feed">
      <div className="space-y-4">
        {error && <div className="error-banner">{error}</div>}

        <div className="glass-card p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recent calls
          </div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Your interest-based matches show up here.
          </div>
        </div>

        {isLoading && (
          <div className="glass-card p-5 text-sm text-slate-600 dark:text-slate-300">
            Loading call history...
          </div>
        )}

        {!isLoading && calls.length === 0 && (
          <div className="glass-card p-5 text-sm text-slate-600 dark:text-slate-300">
            No call history yet. Start a call from the Calls tab.
          </div>
        )}

        {!isLoading && calls.map(renderCallCard)}
      </div>
    </AppShell>
  );
}

