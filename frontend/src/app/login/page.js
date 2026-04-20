'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegister = searchParams?.get('register') === '1';
  const redirect = searchParams?.get('redirect') || '/';

  const { signIn, register, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    router.push(redirect);
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
        await api.auth.register({ role, full_name: fullName });
      } else {
        await signIn(email, password);
      }
      router.push(redirect);
    } catch (e) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl text-white mb-2 text-center">
          {isRegister ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="text-luxury-cream/70 text-center mb-8">
          {isRegister
            ? 'Join Walk With Me to book luxury experiences'
            : 'Welcome back to Walk With Me'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-500/20 text-red-300 text-sm">{error}</div>
          )}

          {isRegister && (
            <div>
              <label className="block text-sm text-luxury-cream/80 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-luxury-charcoal border border-luxury-gold-500/30 rounded text-white focus:border-luxury-gold-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-luxury-cream/80 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-luxury-charcoal border border-luxury-gold-500/30 rounded text-white focus:border-luxury-gold-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-luxury-cream/80 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="w-full px-4 py-3 bg-luxury-charcoal border border-luxury-gold-500/30 rounded text-white focus:border-luxury-gold-500 outline-none"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm text-luxury-cream/80 mb-1">I want to</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-luxury-charcoal border border-luxury-gold-500/30 rounded text-white focus:border-luxury-gold-500 outline-none"
              >
                <option value="customer">Book experiences</option>
                <option value="vendor">Partner as a vendor</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-luxury-gold-500 hover:bg-luxury-gold-400 disabled:opacity-50 text-luxury-black font-medium rounded transition"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-luxury-cream/60 mt-6 text-sm">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <Link href={`/login${redirect && redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-luxury-gold-400 hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <Link href={`/login?register=1${redirect && redirect !== '/' ? `&redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-luxury-gold-400 hover:underline">
                Create one
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-16 px-4 min-h-[80vh] flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
