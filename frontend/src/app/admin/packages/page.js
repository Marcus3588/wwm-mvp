'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminPackagesPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin')) {
      router.push(profile ? '/' : '/login?redirect=/admin/packages');
      return;
    }
    const load = async () => {
      try {
        const { packages: p } = await api.admin.packages();
        setPackages(p || []);
      } catch {
        setPackages([]);
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
        <h1 className="font-serif text-3xl text-white mb-8">Manage Packages</h1>

        {loading ? (
          <p className="text-luxury-cream/70">Loading...</p>
        ) : packages.length === 0 ? (
          <p className="text-luxury-cream/60">No packages. Run database seed.</p>
        ) : (
          <div className="space-y-4">
            {packages.map((p) => (
              <div
                key={p.id}
                className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-serif text-lg text-white">{p.title}</h3>
                  <p className="text-sm text-luxury-cream/60">{p.slug} • {p.category}</p>
                  <p className="text-luxury-gold-400 mt-2">
                    {((p.base_price_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                  </p>
                </div>
                <Link
                  href={`/packages/${p.slug}`}
                  className="text-sm text-luxury-gold-400 hover:underline"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
