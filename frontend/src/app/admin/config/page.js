'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function AdminConfigPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || (profile && profile.role !== 'admin')) {
      router.push(profile ? '/' : '/login?redirect=/admin/config');
      return;
    }
    const load = async () => {
      try {
        const { config: c } = await api.config.get();
        setConfig(c || {});
      } catch {
        setConfig({});
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, profile, router]);

  const handleSave = async (key, value) => {
    setSaving(true);
    try {
      await api.config.update(key, value);
      setConfig((prev) => ({ ...prev, [key]: value }));
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (profile?.role !== 'admin' && !loading) return null;

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-luxury-cream/70 hover:text-luxury-gold-400 text-sm mb-6 inline-block">
          ← Back to Admin
        </Link>
        <h1 className="font-serif text-3xl text-white mb-8">Platform Config</h1>

        {loading ? (
          <p className="text-luxury-cream/70">Loading...</p>
        ) : (
          <div className="space-y-6">
            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <h3 className="text-white mb-2">Commission (%)</h3>
              <p className="text-sm text-luxury-cream/60 mb-4">Platform commission on each booking</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  defaultValue={config?.commission?.percentage ?? 15}
                  className="flex-1 px-4 py-2 bg-luxury-black border border-luxury-gold-500/30 rounded text-white"
                  onBlur={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) handleSave('commission', { ...config?.commission, percentage: v });
                  }}
                />
                <span className="text-luxury-cream/60 py-2">%</span>
              </div>
            </div>

            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <h3 className="text-white mb-2">Service Fee (%)</h3>
              <p className="text-sm text-luxury-cream/60 mb-4">Additional service fee</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.5"
                  defaultValue={config?.service_fee?.percentage ?? 2.5}
                  className="flex-1 px-4 py-2 bg-luxury-black border border-luxury-gold-500/30 rounded text-white"
                  onBlur={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) handleSave('service_fee', { ...config?.service_fee, percentage: v });
                  }}
                />
                <span className="text-luxury-cream/60 py-2">%</span>
              </div>
            </div>

            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <h3 className="text-white mb-2">Cancellation Penalties</h3>
              <p className="text-sm text-luxury-cream/60 mb-4">% penalty: &lt;24h, &lt;48h, &lt;7 days</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <label className="text-luxury-cream/60">Within 24h</label>
                  <input
                    type="number"
                    defaultValue={config?.cancellation?.within_24h_penalty_pct ?? 100}
                    className="w-full px-2 py-1 mt-1 bg-luxury-black border border-luxury-gold-500/30 rounded text-white"
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v))
                        handleSave('cancellation', { ...config?.cancellation, within_24h_penalty_pct: v });
                    }}
                  />
                </div>
                <div>
                  <label className="text-luxury-cream/60">Within 48h</label>
                  <input
                    type="number"
                    defaultValue={config?.cancellation?.within_48h_penalty_pct ?? 50}
                    className="w-full px-2 py-1 mt-1 bg-luxury-black border border-luxury-gold-500/30 rounded text-white"
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v))
                        handleSave('cancellation', { ...config?.cancellation, within_48h_penalty_pct: v });
                    }}
                  />
                </div>
                <div>
                  <label className="text-luxury-cream/60">Within 7 days</label>
                  <input
                    type="number"
                    defaultValue={config?.cancellation?.within_7d_penalty_pct ?? 25}
                    className="w-full px-2 py-1 mt-1 bg-luxury-black border border-luxury-gold-500/30 rounded text-white"
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v))
                        handleSave('cancellation', { ...config?.cancellation, within_7d_penalty_pct: v });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 p-6">
              <h3 className="text-white mb-2">Buffer Minutes</h3>
              <p className="text-sm text-luxury-cream/60 mb-4">Time between vendor bookings (prevents double-book)</p>
              <input
                type="number"
                defaultValue={config?.buffer_minutes ?? 60}
                className="w-24 px-4 py-2 bg-luxury-black border border-luxury-gold-500/30 rounded text-white"
                onBlur={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) handleSave('buffer_minutes', v);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
