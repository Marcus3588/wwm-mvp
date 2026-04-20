'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin')) {
      router.push(profile ? '/' : '/login?redirect=/admin/payments');
      return;
    }
    const load = async () => {
      try {
        const { payments: p } = await api.admin.payments();
        setPayments(p || []);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile, router]);

  const handleRelease = async (id) => {
    if (!confirm('Release this payment to vendor?')) return;
    try {
      await api.admin.releasePayment(id);
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'released' } : p)));
    } catch (e) {
      alert(e.message);
    }
  };

  if (profile?.role !== 'admin' && !loading) return null;

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="text-luxury-cream/70 hover:text-luxury-gold-400 text-sm mb-6 inline-block">
          ← Back to Admin
        </Link>
        <h1 className="font-serif text-3xl text-white mb-8">Payments</h1>

        {loading ? (
          <p className="text-luxury-cream/70">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="text-luxury-cream/60">No payments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-luxury-gold-500/30">
                  <th className="py-3 text-luxury-cream/70 font-medium">Reference</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Amount</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Commission</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Vendor Payout</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Status</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-luxury-gold-500/10">
                    <td className="py-4 text-sm">{p.booking_reference}</td>
                    <td className="py-4">
                      {((p.amount_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                    </td>
                    <td className="py-4 text-sm">
                      {((p.platform_commission_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                    </td>
                    <td className="py-4 text-sm">
                      {((p.vendor_payout_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.status === 'released' ? 'bg-luxury-gold-500/20' : 'bg-amber-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {p.status === 'success' && (
                        <button
                          onClick={() => handleRelease(p.id)}
                          className="text-sm text-luxury-gold-400 hover:underline"
                        >
                          Release to Vendor
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
