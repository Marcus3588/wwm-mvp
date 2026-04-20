'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const statusLabels = {
  draft: 'Draft',
  pending_payment: 'Pending Payment',
  paid: 'Paid',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin')) {
      router.push(profile ? '/' : '/login?redirect=/admin/bookings');
      return;
    }
    const load = async () => {
      try {
        const { bookings: b } = await api.admin.bookings();
        setBookings(b || []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile, router]);

  if (profile?.role !== 'admin' && !loading) return null;

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="text-luxury-cream/70 hover:text-luxury-gold-400 text-sm mb-6 inline-block">
          ← Back to Admin
        </Link>
        <h1 className="font-serif text-3xl text-white mb-8">All Bookings</h1>

        {loading ? (
          <p className="text-luxury-cream/70">Loading...</p>
        ) : bookings.length === 0 ? (
          <p className="text-luxury-cream/60">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-luxury-gold-500/30">
                  <th className="py-3 text-luxury-cream/70 font-medium">Reference</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Package</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Customer</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Date</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Status</th>
                  <th className="py-3 text-luxury-cream/70 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-luxury-gold-500/10">
                    <td className="py-4 text-sm">{b.booking_reference}</td>
                    <td className="py-4">{b.package_title}</td>
                    <td className="py-4 text-sm">{b.customer_name}<br /><span className="text-luxury-cream/60">{b.customer_email}</span></td>
                    <td className="py-4 text-sm">{new Date(b.event_date).toLocaleDateString('en-GB')}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        ['paid','confirmed','completed'].includes(b.status) ? 'bg-luxury-gold-500/20' : 'bg-luxury-cream/10'
                      }`}>
                        {statusLabels[b.status] || b.status}
                      </span>
                    </td>
                    <td className="py-4 text-luxury-gold-400">
                      {((b.total_amount_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
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
