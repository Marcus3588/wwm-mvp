'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ConfirmContent() {
  const searchParams = useSearchParams();
  const ref = searchParams?.get('reference') || searchParams?.get('ref') || '';
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!ref) {
      setStatus('error');
      return;
    }
    const verify = async () => {
      try {
        const res = await api.payments.verify(ref);
        setStatus(res.success ? 'success' : 'error');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [ref]);

  return (
    <div className="pt-24 pb-16 px-4 min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="font-serif text-2xl text-white mb-2">Confirming your payment...</h1>
            <p className="text-luxury-cream/70">Please wait.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-luxury-gold-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-luxury-gold-400">✓</span>
            </div>
            <h1 className="font-serif text-2xl text-white mb-2">Payment Successful</h1>
            <p className="text-luxury-cream/70 mb-8">
              Your booking has been confirmed. You will receive an email shortly.
            </p>
            <Link
              href="/bookings"
              className="inline-block px-8 py-3 bg-luxury-gold-500 text-luxury-black font-medium rounded hover:bg-luxury-gold-400 transition"
            >
              View My Bookings
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-red-400">!</span>
            </div>
            <h1 className="font-serif text-2xl text-white mb-2">Payment Verification Failed</h1>
            <p className="text-luxury-cream/70 mb-8">
              We could not verify your payment. If you were charged, please contact support.
            </p>
            <Link
              href="/bookings"
              className="inline-block px-8 py-3 border border-luxury-gold-500/50 text-luxury-gold-300 rounded hover:bg-luxury-gold-500/10 transition"
            >
              View My Bookings
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
