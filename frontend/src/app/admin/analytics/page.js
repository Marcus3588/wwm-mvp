'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin')) {
      router.push(profile ? '/' : '/login?redirect=/admin/analytics');
      return;
    }
    const load = async () => {
      try {
        const d = await api.admin.analytics();
        setData(d);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile, router]);

  if (profile?.role !== 'admin' && !loading) return null;

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-luxury-cream/70 hover:text-luxury-gold-400 text-sm mb-6 inline-block">
          ← Back to Admin
        </Link>
        <h1 className="font-serif text-3xl text-white mb-8">Analytics</h1>

        {loading ? (
          <p className="text-luxury-cream/70">Loading...</p>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <p className="text-luxury-cream/60 text-sm">Conversion Rate</p>
              <p className="text-2xl font-serif text-luxury-gold-400">{data.conversion_rate}%</p>
            </div>
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <p className="text-luxury-cream/60 text-sm">Booking Completion Rate</p>
              <p className="text-2xl font-serif text-luxury-gold-400">{data.booking_completion_rate}%</p>
            </div>
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <p className="text-luxury-cream/60 text-sm">Revenue</p>
              <p className="text-2xl font-serif text-luxury-gold-400">
                {((data.revenue_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
              </p>
            </div>
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <p className="text-luxury-cream/60 text-sm">Average Order Value</p>
              <p className="text-2xl font-serif text-luxury-gold-400">
                {((data.average_order_value_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
              </p>
            </div>
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <p className="text-luxury-cream/60 text-sm">Cancellations</p>
              <p className="text-2xl font-serif text-luxury-gold-400">{data.cancellations ?? 0}</p>
            </div>
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <p className="text-luxury-cream/60 text-sm">Active Vendors</p>
              <p className="text-2xl font-serif text-luxury-gold-400">{data.active_vendors ?? 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-luxury-cream/60">No analytics data.</p>
        )}
      </div>
    </div>
  );
}
