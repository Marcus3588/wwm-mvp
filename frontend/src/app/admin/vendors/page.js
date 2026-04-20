'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

function AdminVendorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams?.get('status') || '';
  const { user, profile } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin')) {
      router.push(profile ? '/' : '/login?redirect=/admin/vendors');
      return;
    }
    const load = async () => {
      try {
        const { vendors: v } = await api.admin.vendors(statusFilter || undefined);
        setVendors(v || []);
      } catch {
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile, router, statusFilter]);

  const handleApprove = async (id) => {
    try {
      await api.admin.approveVendor(id);
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, verification_status: 'approved' } : v)));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason (optional):');
    if (reason === null) return;
    try {
      await api.admin.rejectVendor(id, reason);
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, verification_status: 'rejected' } : v)));
    } catch (e) {
      alert(e.message);
    }
  };

  if (profile?.role !== 'admin' && !loading) return null;

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-luxury-cream/70 hover:text-luxury-gold-400 text-sm mb-6 inline-block">
          ← Back to Admin
        </Link>
        <h1 className="font-serif text-3xl text-white mb-8">Manage Vendors</h1>

        <div className="flex gap-2 mb-6">
          <Link
            href="/admin/vendors"
            className={`px-4 py-2 rounded ${!statusFilter ? 'bg-luxury-gold-500/20 border border-luxury-gold-500' : 'border border-luxury-gold-500/30'}`}
          >
            All
          </Link>
          <Link
            href="/admin/vendors?status=pending"
            className={`px-4 py-2 rounded ${statusFilter === 'pending' ? 'bg-luxury-gold-500/20 border border-luxury-gold-500' : 'border border-luxury-gold-500/30'}`}
          >
            Pending
          </Link>
          <Link
            href="/admin/vendors?status=approved"
            className={`px-4 py-2 rounded ${statusFilter === 'approved' ? 'bg-luxury-gold-500/20 border border-luxury-gold-500' : 'border border-luxury-gold-500/30'}`}
          >
            Approved
          </Link>
        </div>

        {loading ? (
          <p className="text-luxury-cream/70">Loading...</p>
        ) : vendors.length === 0 ? (
          <p className="text-luxury-cream/60">No vendors found.</p>
        ) : (
          <div className="space-y-4">
            {vendors.map((v) => (
              <div
                key={v.id}
                className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-lg text-white">{v.business_name}</h3>
                    <p className="text-sm text-luxury-cream/60">{v.business_description || '—'}</p>
                    <p className="text-sm text-luxury-cream/60 mt-2">
                      {v.full_name} • {v.email} • {v.phone || '—'}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                        v.verification_status === 'approved'
                          ? 'bg-luxury-gold-500/20 text-luxury-gold-400'
                          : v.verification_status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {v.verification_status}
                    </span>
                  </div>
                  {v.verification_status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(v.id)}
                        className="px-4 py-2 bg-luxury-gold-500 text-luxury-black text-sm font-medium rounded hover:bg-luxury-gold-400 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(v.id)}
                        className="px-4 py-2 border border-red-500/50 text-red-400 text-sm rounded hover:bg-red-500/10 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-16 px-4 text-center">
        <p className="text-luxury-cream/70">Loading...</p>
      </div>
    }>
      <AdminVendorsContent />
    </Suspense>
  );
}
