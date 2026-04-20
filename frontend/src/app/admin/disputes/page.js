'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminDisputesPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin')) {
      router.push(profile ? '/' : '/login?redirect=/admin/disputes');
      return;
    }
    const load = async () => {
      try {
        const { disputes: d } = await api.disputes.list();
        setDisputes(d || []);
      } catch {
        setDisputes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile, router]);

  const handleResolve = async (id) => {
    const notes = prompt('Resolution notes:');
    if (notes === null) return;
    try {
      await api.disputes.resolve(id, notes);
      setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'resolved' } : d)));
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
        <h1 className="font-serif text-3xl text-white mb-8">Disputes</h1>

        {loading ? (
          <p className="text-luxury-cream/70">Loading...</p>
        ) : disputes.length === 0 ? (
          <p className="text-luxury-cream/60">No disputes.</p>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-luxury-cream/60">Booking {d.booking_reference}</p>
                    <p className="text-white mt-2">{d.reason}</p>
                    <p className="text-sm text-luxury-cream/50 mt-2">Raised by: {d.raised_by_email}</p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                      d.status === 'resolved' ? 'bg-luxury-gold-500/20' : 'bg-amber-500/20'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  {d.status === 'open' && (
                    <button
                      onClick={() => handleResolve(d.id)}
                      className="px-4 py-2 bg-luxury-gold-500 text-luxury-black text-sm font-medium rounded hover:bg-luxury-gold-400 transition"
                    >
                      Resolve
                    </button>
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
