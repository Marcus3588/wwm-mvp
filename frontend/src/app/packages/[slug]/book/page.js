'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    event_date: '',
    event_time: '',
    event_location: '',
    guest_count: 1,
    customization_notes: '',
    package_tier_id: '',
    total_amount_cents: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/packages/' + params.slug + '/book');
      return;
    }
    const load = async () => {
      try {
        const { package: p } = await api.packages.get(params.slug);
        setPkg(p);
        setForm((f) => ({
          ...f,
          total_amount_cents: p.base_price_cents,
          package_tier_id: p.tiers?.[0]?.id || '',
        }));
      } catch (e) {
        setError('Failed to load package');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.slug, user, router]);

  const handleTierChange = (tierId) => {
    const tier = pkg?.tiers?.find((t) => t.id === tierId);
    setForm((f) => ({
      ...f,
      package_tier_id: tierId || '',
      total_amount_cents: tier ? tier.price_cents : pkg?.base_price_cents || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { booking } = await api.bookings.create({
        package_id: pkg.id,
        package_tier_id: form.package_tier_id || null,
        event_date: form.event_date,
        event_time: form.event_time || null,
        event_location: form.event_location || null,
        guest_count: form.guest_count,
        customization_notes: form.customization_notes || null,
        total_amount_cents: form.total_amount_cents,
      });
      const { authorization_url } = await api.bookings.initiatePayment(booking.id);
      window.location.href = authorization_url;
    } catch (e) {
      setError(e.message || 'Booking failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <p className="text-luxury-cream/70">Loading...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <p className="text-luxury-cream/70">Package not found</p>
        <button onClick={() => router.push('/packages')} className="mt-4 text-luxury-gold-400 hover:underline">
          Back to packages
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 max-w-[1120px] mx-auto px-4 sm:px-8">
      <div className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl text-white mb-2">Request to book</h1>
      </div>

      <div className="grid md:grid-cols-[1fr_400px] gap-12 lg:gap-20">
        {/* Left Column: Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/20 text-red-300 text-sm border border-red-500/30">{error}</div>
            )}

            <div className="pb-8 border-b border-luxury-gold-500/20">
              <h2 className="text-2xl text-white font-medium mb-6">Your selected experience</h2>

              {pkg.tiers?.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-white mb-2">Package Tier</label>
                  <select
                    value={form.package_tier_id}
                    onChange={(e) => handleTierChange(e.target.value)}
                    className="w-full px-4 py-3.5 bg-luxury-charcoal border border-luxury-gold-500/30 rounded-xl text-white focus:border-luxury-gold-500 focus:ring-1 focus:ring-luxury-gold-500 outline-none transition"
                  >
                    <option value="">Base Experience ({((pkg.base_price_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })})</option>
                    {pkg.tiers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {((t.price_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-white mb-2">Number of Guests</label>
                <div className="relative">
                  <input
                    type="number"
                    min={pkg.min_guests || 1}
                    max={pkg.max_guests || 50}
                    value={form.guest_count}
                    onChange={(e) => setForm((f) => ({ ...f, guest_count: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-luxury-charcoal border border-luxury-gold-500/30 rounded-xl text-white focus:border-luxury-gold-500 focus:ring-1 focus:ring-luxury-gold-500 outline-none transition"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-8 border-b border-luxury-gold-500/20">
              <h2 className="text-2xl text-white font-medium mb-6">When and where</h2>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={form.event_date}
                    onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3.5 bg-luxury-charcoal border border-luxury-gold-500/30 rounded-xl text-white focus:border-luxury-gold-500 focus:ring-1 focus:ring-luxury-gold-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Time</label>
                  <input
                    type="time"
                    value={form.event_time}
                    onChange={(e) => setForm((f) => ({ ...f, event_time: e.target.value }))}
                    className="w-full px-4 py-3.5 bg-luxury-charcoal border border-luxury-gold-500/30 rounded-xl text-white focus:border-luxury-gold-500 focus:ring-1 focus:ring-luxury-gold-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Location / Venue</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Where will the experience take place?"
                    value={form.event_location}
                    onChange={(e) => setForm((f) => ({ ...f, event_location: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-luxury-charcoal border border-luxury-gold-500/30 rounded-xl text-white placeholder-luxury-cream/40 focus:border-luxury-gold-500 focus:ring-1 focus:ring-luxury-gold-500 outline-none transition"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="pb-8 border-b border-luxury-gold-500/20">
              <h2 className="text-2xl text-white font-medium mb-6">Special Requests</h2>
              <textarea
                rows={4}
                placeholder="Any customization, dietary requirements or special requests?"
                value={form.customization_notes}
                onChange={(e) => setForm((f) => ({ ...f, customization_notes: e.target.value }))}
                className="w-full px-4 py-3.5 bg-luxury-charcoal border border-luxury-gold-500/30 rounded-xl text-white placeholder-luxury-cream/40 focus:border-luxury-gold-500 focus:ring-1 focus:ring-luxury-gold-500 outline-none resize-none transition"
              />
            </div>

            <div>
              <p className="text-xs text-luxury-cream/60 mb-6 leading-relaxed">
                By selecting the button below, I agree to the Host's House Rules, Ground rules for guests, Walk With Me's Rebooking and Refund Policy, and that Walk With Me can charge my payment method if I'm responsible for damage.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#e61e4d] to-[#d70466] hover:brightness-110 disabled:opacity-50 text-white font-semibold rounded-xl transition text-lg shadow-lg"
              >
                {submitting ? 'Confirming...' : 'Confirm and pay'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="relative">
          <div className="sticky top-24 bg-luxury-charcoal/50 border border-luxury-gold-500/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex gap-4 pb-6 border-b border-luxury-gold-500/20">
              {pkg.images?.[0] ? (
                <div className="w-28 h-24 rounded-lg overflow-hidden shrink-0 relative bg-black">
                  <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-28 h-24 rounded-lg bg-luxury-gold-500/10 shrink-0" />
              )}
              <div className="flex flex-col justify-center">
                <span className="text-xs uppercase text-luxury-cream/60 mb-1">{pkg.category} Experience</span>
                <h3 className="text-white font-medium leading-tight">{pkg.title}</h3>
                <div className="flex items-center gap-1 text-xs text-luxury-cream/60 mt-2">
                  <svg viewBox="0 0 32 32" className="w-3 h-3 fill-current"><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" /></svg>
                  <span>4.95 (120 reviews)</span>
                </div>
              </div>
            </div>

            <div className="py-6 border-b border-luxury-gold-500/20 space-y-4">
              <h3 className="text-xl text-white font-medium mb-2">Price details</h3>
              <div className="flex justify-between text-luxury-cream/90">
                <span>Experience base rate</span>
                <span>{((pkg.base_price_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}</span>
              </div>
              {form.package_tier_id && form.total_amount_cents > (pkg.base_price_cents || 0) && (
                <div className="flex justify-between text-luxury-cream/90">
                  <span>Tier Upgrade</span>
                  <span>{((form.total_amount_cents - (pkg.base_price_cents || 0)) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}</span>
                </div>
              )}
            </div>

            <div className="pt-6 flex justify-between font-semibold text-white text-lg">
              <span>Total (GHS)</span>
              <span>{(form.total_amount_cents / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
