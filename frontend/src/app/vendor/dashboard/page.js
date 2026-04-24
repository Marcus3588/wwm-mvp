'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import VendorPackageList from '@/components/VendorPackageList';

const statusConfig = {
  paid: { label: 'Awaiting Confirmation', color: 'bg-amber-500/20 text-amber-300', dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', color: 'bg-green-500/20 text-green-400', dot: 'bg-green-400' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-300', dot: 'bg-blue-400' },
  completed: { label: 'Completed', color: 'bg-luxury-gold-500/20 text-luxury-gold-400', dot: 'bg-luxury-gold-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-300', dot: 'bg-red-400' },
};

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-luxury-charcoal border border-luxury-gold-500/20 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/10 flex items-center justify-center text-luxury-gold-400">
          {icon}
        </div>
        <span className="text-luxury-cream/60 text-sm font-medium">{label}</span>
      </div>
      <p className="font-serif text-3xl text-white mb-1">{value}</p>
      {sub && <p className="text-luxury-cream/40 text-xs">{sub}</p>}
    </div>
  );
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [vendorPackages, setVendorPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  const loadData = async () => {
    try {
      const vendorRes = await api.vendors.me();
      setVendor(vendorRes.vendor);
    } catch (err) {
      console.error('Vendor profile fetch failed:', err);
      if (process.env.NODE_ENV !== 'production') {
        setVendor({ business_name: 'Luxe Events (Mock)', verification_status: 'approved' });
      } else {
        setVendor(null);
      }
    }

    try {
      const [bookingsRes, packagesRes] = await Promise.all([
        api.bookings.vendor(),
        api.packages.vendorMe()
      ]);
      setBookings(bookingsRes.bookings || []);
      setVendorPackages(packagesRes.packages || []);
    } catch (err) {
      console.error('Dashboard data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || profile?.role !== 'VENDOR') {
      router.push('/login');
      return;
    }

    loadData();
  }, [user, profile, router]);

  const handleAccept = async (id) => {
    try {
      await api.bookings.accept(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
    } catch (e) { alert(e.message); }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-luxury-charcoal animate-pulse border border-luxury-gold-500/10" />)}
        </div>
      </div>
    );
  }

  const isApproved = vendor?.verification_status === 'approved';
  const isPending = vendor?.verification_status === 'pending';
  const totalEarned = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total_amount_cents || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'paid').length;

  if (!vendor) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-luxury-gold-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-luxury-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <h2 className="font-serif text-2xl text-white mb-2">Not a Vendor Yet</h2>
          <p className="text-luxury-cream/50 mb-6 text-sm">Apply to become a verified vendor and start listing experiences.</p>
          <Link href="/vendor" className="inline-block px-6 py-3 bg-luxury-gold-500 hover:bg-luxury-gold-400 text-luxury-black font-semibold rounded-xl transition">
            Apply Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="font-serif text-4xl text-white mb-1">Vendor Dashboard</h1>
            <div className="flex items-center gap-3">
              <p className="text-luxury-cream/60">{vendor.business_name}</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isApproved ? 'bg-green-500/20 text-green-400' :
                isPending ? 'bg-amber-500/20 text-amber-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-green-400' : isPending ? 'bg-amber-400' : 'bg-red-400'}`} />
                {vendor.verification_status}
              </span>
            </div>
          </div>
          {isApproved && (
            <Link href="/vendor/packages/create"
              className="inline-flex items-center gap-2 px-5 py-3 bg-luxury-gold-500 hover:bg-luxury-gold-400 text-luxury-black font-semibold rounded-xl transition shadow-lg shadow-luxury-gold-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              Create Package
            </Link>
          )}
        </div>

        {/* Pending Notice */}
        {isPending && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex gap-4 items-start mb-8">
            <svg className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="text-amber-300 font-medium text-sm">Application Under Review</p>
              <p className="text-amber-300/70 text-sm mt-0.5">Our team is reviewing your application. You'll be able to create packages once approved (usually 2–3 business days).</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            label="Total Bookings"
            value={bookings.length}
            sub="all time"
          />
          <StatCard
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
            label="Pending Action"
            value={pendingCount}
            sub="need confirmation"
          />
          <StatCard
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Completed"
            value={bookings.filter(b => b.status === 'completed').length}
            sub="events done"
          />
          <StatCard
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Total Earned"
            value={(totalEarned / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 })}
            sub="from completed events"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-luxury-gold-500/20 mb-6">
          {['bookings', 'packages'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium border-b-2 capitalize transition -mb-px ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-luxury-cream/50 hover:text-luxury-cream/80'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {bookings.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-luxury-gold-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-luxury-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="font-serif text-xl text-white mb-2">No bookings yet</h3>
                <p className="text-luxury-cream/50 text-sm">{isApproved ? 'Once customers book your packages, they\'ll appear here.' : 'Get approved and create packages to start receiving bookings.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => {
                  const sc = statusConfig[b.status] || { label: b.status, color: 'bg-gray-500/20 text-gray-300', dot: 'bg-gray-400' };
                  return (
                    <div key={b.id} className="bg-luxury-charcoal border border-luxury-gold-500/20 rounded-2xl p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-serif text-lg text-white">{b.package_title}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-luxury-cream/60">
                            <span>👤 {b.customer_name || 'Customer'} · {b.customer_email}</span>
                            <span>📅 {b.event_date ? new Date(b.event_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                            <span>👥 {b.guest_count || '—'} guests</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-luxury-gold-400 font-semibold text-lg">
                            {((b.total_amount_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                          </p>
                          {b.status === 'paid' && isApproved && (
                            <button onClick={() => handleAccept(b.id)}
                              className="mt-3 px-4 py-2 bg-luxury-gold-500 hover:bg-luxury-gold-400 text-luxury-black text-sm font-semibold rounded-lg transition">
                              Confirm Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="py-4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-luxury-cream/60 text-sm">Manage your listed experiences</p>
              {isApproved && (
                <Link href="/vendor/packages/create" className="inline-flex items-center gap-2 px-4 py-2 bg-luxury-gold-500/20 hover:bg-luxury-gold-500/30 text-luxury-gold-400 text-sm font-medium rounded-lg transition border border-luxury-gold-500/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  New Package
                </Link>
              )}
            </div>
            
            <VendorPackageList 
              packages={vendorPackages} 
              onUpdate={loadData}
            />
          </div>
        )}
      </div>
    </div>
  );
}
