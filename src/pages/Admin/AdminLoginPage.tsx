import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShieldAlert, Lock, Mail, KeyRound } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';
import { BrandLogo } from '../../components/common/BrandLogo';

export const AdminLoginPage: React.FC = () => {
  const { loginWithCredentials, loginAsDemoOwner, user, isAdmin, logout } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('owner@varniksatelier.studio');
  const [password, setPassword] = useState('owner123');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter admin credentials.');
      return;
    }
    const res = loginWithCredentials(email, password);
    if (!res.ok) {
      setError(res.error || 'Authentication failed.');
      return;
    }
    if (res.user?.role !== 'owner') {
      setError('This account does not have Studio Owner admin permissions.');
      return;
    }
    navigate('/admin');
  };

  const handleDemoOwner = () => {
    loginAsDemoOwner();
    navigate('/admin');
  };

  return (
    <PageTransition className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E7C7CC] rounded-3xl p-8 shadow-warm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-2">
            <BrandLogo to="/" size="lg" />
          </div>
          <span className="inline-block px-3 py-1 rounded-md bg-[#6D1836]/15 text-[#6D1836] text-xs font-semibold uppercase tracking-wider">
            Owner Admin Portal
          </span>
          <h1 className="font-display text-2xl font-medium text-[#3E2F27]">Studio Management</h1>
          <p className="text-sm text-[#7A655C]">
            Secure single-owner dashboard for inventory, products, and orders.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F8EFEA]/70 border border-[#E7C7CC] text-xs text-[#7A655C] flex items-start gap-2.5">
          <KeyRound className="w-4 h-4 text-[#6D1836] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[#3E2F27]">Studio Owner Credentials</p>
            <p className="mt-0.5">
              Email: <span className="font-mono text-[#3E2F27]">owner@varniksatelier.studio</span>
            </p>
            <p>
              Password: <span className="font-mono text-[#3E2F27]">owner123</span>
            </p>
          </div>
        </div>

        {user && user.role !== 'owner' && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#6D1836]/10 border border-[#6D1836]/30 text-xs text-[#6D1836]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Customer Account Active</p>
              <p className="mt-0.5">
                You are currently signed in as a customer. Sign in with the owner credentials above
                to switch to the Admin Dashboard.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-xs text-[#6D1836] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-xs font-medium text-[#7A655C] mb-1.5">
              Owner Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A655C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-medium text-[#7A655C] mb-1.5">
              Owner Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A655C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors shadow-warm"
          >
            Access Admin Dashboard
          </button>
        </form>

        <div className="pt-4 border-t border-[#E7C7CC] space-y-3">
          <button
            type="button"
            onClick={handleDemoOwner}
            className="w-full py-2.5 px-4 rounded-xl bg-[#F8EFEA] hover:bg-[#E7C7CC] text-xs font-medium text-[#3E2F27] inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6D1836]" />
            <span>Quick Login as Studio Owner</span>
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                if (user && user.role !== 'owner') logout();
                navigate('/');
              }}
              className="text-xs text-[#7A655C] hover:text-[#6D1836]"
            >
              ← Return to Storefront
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
