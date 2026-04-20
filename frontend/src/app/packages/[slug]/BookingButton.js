'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function BookingButton({ packageData }) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleBook = () => {
    if (!user) {
      router.push(`/login?redirect=/packages/${packageData.slug}/book`);
      return;
    }
    if (!profile) {
      router.push('/login?register=1');
      return;
    }
    router.push(`/packages/${packageData.slug}/book`);
  };

  const priceGHS = (packageData.base_price_cents || 0) / 100;

  return (
    <div className="bg-luxury-charcoal border border-luxury-gold-500/20 p-6 rounded-2xl shadow-2xl">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-2xl font-semibold text-white">
            {priceGHS.toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
          </span>
          <span className="text-luxury-cream/70 text-base ml-1">minimum</span>
        </div>
      </div>

      <div className="border border-luxury-gold-500/30 rounded-xl mb-4 overflow-hidden">
        <div className="flex border-b border-luxury-gold-500/30">
          <div className="p-3 flex-1 border-r border-luxury-gold-500/30">
            <label className="block text-[10px] font-bold uppercase text-white/90">Guests</label>
            <div className="text-luxury-cream/80 text-sm mt-0.5">2 guests</div>
          </div>
          <div className="p-3 flex-1">
            <label className="block text-[10px] font-bold uppercase text-white/90">Date</label>
            <div className="text-luxury-cream/80 text-sm mt-0.5">Select a date</div>
          </div>
        </div>
      </div>

      <button
        onClick={handleBook}
        className="w-full py-3.5 bg-gradient-to-r from-[#e61e4d] to-[#d70466] hover:brightness-110 text-white font-semibold rounded-lg transition text-lg"
      >
        Reserve
      </button>

      <p className="text-center text-luxury-cream/60 text-sm mt-4">
        You won&apos;t be charged yet
      </p>

      {packageData.tiers?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-luxury-gold-500/20">
          <h4 className="text-sm font-medium text-white mb-3">Available Upgrades</h4>
          <div className="space-y-3">
            {packageData.tiers.map((t) => (
              <div key={t.id} className="flex justify-between items-center text-sm">
                <span className="text-luxury-cream/80 underline decoration-luxury-cream/30 cursor-pointer">{t.name}</span>
                <span className="text-white">
                  {((t.price_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
