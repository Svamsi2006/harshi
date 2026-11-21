import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  HelpCircle,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../common/PageTransition';
import { BrandLogo } from '../common/BrandLogo';

export const AdminPinGate: React.FC = () => {
  const { user, unlockAdminPortal, logout, addToast } = useStore();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'verify' | 'forgot'>('verify');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Forgot PIN recovery fields
  const [petName, setPetName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pin.trim();
    if (!cleaned || cleaned.length < 4) {
      setError('Please enter your Admin Portal PIN.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || '',
          pin: cleaned,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok || !json?.unlockToken) {
        setError(
          typeof json?.error === 'string'
            ? json.error
            : 'Incorrect Admin PIN. Please try again.'
        );
        return;
      }
      unlockAdminPortal(String(json.unlockToken));
      addToast('Admin Portal Unlocked', 'Welcome to your studio dashboard.', 'success');
    } catch {
      setError('Could not verify PIN with the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) {
      setError('Please answer the security question (pet name).');
      return;
    }
    if (!/^\d{4,8}$/.test(newPin.trim())) {
      setError('New PIN must be 4 to 8 numeric digits.');
      return;
    }
    if (newPin.trim() !== confirmNewPin.trim()) {
      setError('New PIN and confirmation PIN do not match.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/pin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || '',
          petName: petName.trim(),
          newPin: newPin.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok || !json?.unlockToken) {
        setError(
          typeof json?.error === 'string'
            ? json.error
            : 'Recovery failed. Please verify your pet name answer.'
        );
        return;
      }
      unlockAdminPortal(String(json.unlockToken));
      addToast(
        'Admin PIN Reset',
        'Your new Admin PIN is saved and the portal is unlocked.',
        'success'
      );
    } catch {
      setError('Unable to reach server to reset PIN. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <PageTransition className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E7C7CC] rounded-3xl p-7 sm:p-8 shadow-warm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <BrandLogo to="/" size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#6D1836]/12 text-[#6D1836] text-xs font-semibold uppercase tracking-wider">
            <KeyRound className="w-3.5 h-3.5" />
            <span>{mode === 'verify' ? 'Admin Portal PIN' : 'Recover Admin PIN'}</span>
          </div>
          <h1 className="font-display text-2xl font-medium text-[#3E2F27]">
            {mode === 'verify' ? 'Enter Security PIN' : 'Forgot Your PIN?'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A655C]">
            {mode === 'verify'
              ? 'Verify your Admin PIN to open the Studio Dashboard.'
              : 'Answer your recovery security question to set a new Admin PIN.'}
          </p>
          {user?.email && (
            <p className="text-[11px] font-mono text-[#6D1836] bg-[#FFF9F5] border border-[#E7C7CC] rounded-lg px-2.5 py-1 inline-block">
              Signed in as {user.email}
            </p>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
            {error}
          </p>
        )}

        {mode === 'verify' ? (
          <form onSubmit={(e) => void handleVerifyPin(e)} className="space-y-4">
            <div>
              <label
                htmlFor="admin-portal-pin"
                className="block text-xs font-medium text-[#7A655C] mb-1.5"
              >
                Admin Security PIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7A655C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-portal-pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="Enter 4-digit PIN"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-center tracking-[0.45em] font-mono text-base text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A655C] hover:text-[#3E2F27]"
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors shadow-warm disabled:opacity-65"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin Portal</span>
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('forgot');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D1836] hover:text-[#541129]"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot PIN? Reset with Security Question</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={(e) => void handleResetPin(e)} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F8EFEA] border border-[#E7C7CC] space-y-1">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-[#6D1836]">
                Security Question
              </p>
              <p className="text-sm font-medium text-[#3E2F27]">What is your pet&apos;s name?</p>
            </div>

            <div>
              <label
                htmlFor="recovery-pet-name"
                className="block text-xs font-medium text-[#7A655C] mb-1.5"
              >
                Your Answer (Pet Name)
              </label>
              <input
                id="recovery-pet-name"
                type="text"
                autoFocus
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Enter pet name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="new-admin-pin"
                  className="block text-xs font-medium text-[#7A655C] mb-1.5"
                >
                  New PIN (4–8 digits)
                </label>
                <div className="relative">
                  <input
                    id="new-admin-pin"
                    type={showNewPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={8}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="••••"
                    className="w-full px-3.5 pr-9 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm font-mono tracking-widest text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A655C]"
                    aria-label={showNewPin ? 'Hide new PIN' : 'Show new PIN'}
                  >
                    {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirm-admin-pin"
                  className="block text-xs font-medium text-[#7A655C] mb-1.5"
                >
                  Confirm New PIN
                </label>
                <input
                  id="confirm-admin-pin"
                  type={showNewPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={8}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm font-mono tracking-widest text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors shadow-warm disabled:opacity-65"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting PIN...</span>
                </>
              ) : (
                <span>Verify &amp; Reset Admin PIN</span>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('verify');
                }}
                className="text-xs font-medium text-[#7A655C] hover:text-[#6D1836]"
              >
                ← Back to PIN Entry
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-[#E7C7CC] flex items-center justify-between text-xs">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[#7A655C] hover:text-[#6D1836]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 font-medium text-[#6D1836] hover:text-[#541129]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </PageTransition>
  );
};
