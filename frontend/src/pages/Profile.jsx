import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/AppShell';
import { authAPI } from '../services/api';

const ALL_INTERESTS = [
  'Gaming',
  'Sports',
  'Music',
  'Movies',
  'Reading',
  'Travel',
  'Cooking',
  'Art',
  'Technology',
  'Fitness',
  'Photography',
  'Dancing',
];

function InterestToggle({ value, checked, onChange }) {
  return (
    <label className="interest-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(value)}
      />
      {value}
    </label>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [interests, setInterests] = useState(user?.interests || []);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || '');
    setInterests(user.interests || []);
  }, [user]);

  const selectedCount = interests.length;

  const canSave = useMemo(() => {
    if (!fullName || fullName.trim().length < 2) return false;
    if (!Array.isArray(interests) || interests.length === 0) return false;
    return true;
  }, [fullName, interests]);

  const toggleInterest = (interest) => {
    setInterests((prev) => {
      if (prev.includes(interest)) return prev.filter((i) => i !== interest);
      return [...prev, interest];
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile({
        fullName: fullName.trim(),
        interests,
      });

      if (response?.success !== false) {
        updateUser(response.user);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell pageTitle="Profile">
      <div className="space-y-4">
        <div className="glass-card p-5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700" />
            <div className="min-w-0">
              <div className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">
                {user?.fullName || 'User'}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {user?.email || ''}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {selectedCount} interest{selectedCount === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="glass-card p-5">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Edit your profile
          </div>

          {error && <div className="error-message mt-4">{error}</div>}

          <div className="mt-4">
            <div className="form-group">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Interests</label>
              <div className="interests-grid">
                {ALL_INTERESTS.map((interest) => (
                  <InterestToggle
                    key={interest}
                    value={interest}
                    checked={interests.includes(interest)}
                    onChange={toggleInterest}
                  />
                ))}
              </div>
            </div>
          </div>

          <button className="submit-button" type="submit" disabled={!canSave || isLoading}>
            {isLoading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

