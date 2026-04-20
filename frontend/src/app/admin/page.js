'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/admin');
      return;
    }
    if (profile && profile.role !== 'admin') {
      router.push('/');
      return;
    }
    const load = async () => {
      try {
        const data = await api.admin.dashboard();
        setStats(data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile, router]);

  if (loading || !profile) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <p className="text-luxury-cream/70">Loading...</p>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl text-white mb-2">Admin Dashboard</h1>
        <p className="text-luxury-cream/70 mb-8">Manage vendors, bookings, and payments</p>

        {stats?.analytics && (
          <div className="mb-12 p-6 bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20">
            <h2 className="font-serif text-xl text-white mb-4">Analytics (Last 90 days)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-luxury-cream/60">Conversion Rate</p>
                <p className="text-luxury-gold-400">{stats.analytics.conversion_rate}%</p>
              </div>
              <div>
                <p className="text-luxury-cream/60">Completion Rate</p>
                <p className="text-luxury-gold-400">{stats.analytics.booking_completion_rate}%</p>
              </div>
              <div>
                <p className="text-luxury-cream/60">Revenue</p>
                <p className="text-luxury-gold-400">
                  {((stats.analytics.revenue_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                </p>
              </div>
              <div>
                <p className="text-luxury-cream/60">Avg Order Value</p>
                <p className="text-luxury-gold-400">
                  {((stats.analytics.average_order_value_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                </p>
              </div>
            </div>
            <Link href="/admin/analytics" className="text-sm text-luxury-gold-400 hover:underline mt-4 inline-block">
              View full analytics →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
            <p className="text-luxury-cream/60 text-sm mb-1">Pending Vendors</p>
            <p className="text-2xl font-serif text-luxury-gold-400">
              {stats?.pending_vendors ?? 0}
            </p>
            <Link href="/admin/vendors?status=pending" className="text-sm text-luxury-gold-400 hover:underline mt-2 inline-block">
              Review →
            </Link>
          </div>
          <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
            <p className="text-luxury-cream/60 text-sm mb-1">Active Bookings</p>
            <p className="text-2xl font-serif text-luxury-gold-400">
              {stats?.active_bookings ?? 0}
            </p>
            <Link href="/admin/bookings" className="text-sm text-luxury-gold-400 hover:underline mt-2 inline-block">
              View →
            </Link>
          </div>
          <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
            <p className="text-luxury-cream/60 text-sm mb-1">Total Users</p>
            <p className="text-2xl font-serif text-luxury-gold-400">
              {stats?.total_users ?? 0}
            </p>
          </div>
          <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
            <p className="text-luxury-cream/60 text-sm mb-1">Payments on Hold</p>
            <p className="text-2xl font-serif text-luxury-gold-400">
              {stats?.payments_hold_amount_cents
                ? (stats.payments_hold_amount_cents / 100).toLocaleString('en-GH', {
                    style: 'currency',
                    currency: 'GHS',
                  })
                : '—'}
            </p>
            <p className="text-xs text-luxury-cream/50 mt-1">
              {stats?.payments_hold_count ?? 0} payment(s)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/vendors"
            className="px-6 py-3 border border-luxury-gold-500/50 text-luxury-gold-300 rounded hover:bg-luxury-gold-500/10 transition"
          >
            Manage Vendors
          </Link>
          <Link
            href="/admin/bookings"
            className="px-6 py-3 border border-luxury-gold-500/50 text-luxury-gold-300 rounded hover:bg-luxury-gold-500/10 transition"
          >
            View Bookings
          </Link>
          <Link
            href="/admin/packages"
            className="px-6 py-3 border border-luxury-gold-500/50 text-luxury-gold-300 rounded hover:bg-luxury-gold-500/10 transition"
          >
            Manage Packages
          </Link>
          <Link
            href="/admin/payments"
            className="px-6 py-3 border border-luxury-gold-500/50 text-luxury-gold-300 rounded hover:bg-luxury-gold-500/10 transition"
          >
            Payments
          </Link>
          <Link
            href="/admin/disputes"
            className="px-6 py-3 border border-luxury-gold-500/50 text-luxury-gold-300 rounded hover:bg-luxury-gold-500/10 transition"
          >
            Disputes
          </Link>
          <Link
            href="/admin/config"
            className="px-6 py-3 border border-luxury-gold-500/50 text-luxury-gold-300 rounded hover:bg-luxury-gold-500/10 transition"
          >
            Platform Config
          </Link>
        </div>
      </div>
    </div>
  );
}
