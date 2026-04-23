'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

const statusStyles = {
  published: 'bg-green-500/20 text-green-400 border-green-500/30',
  draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  archived: 'bg-luxury-cream/10 text-luxury-cream/40 border-luxury-cream/20',
};

export default function VendorPackageList({ packages, onUpdate }) {
  const [loading, setLoading] = useState(null);

  const handleToggleStatus = async (pkg) => {
    setLoading(pkg.id);
    try {
      const nextStatus = pkg.status === 'published' ? 'draft' : 'published';
      await api.packages.update(pkg.id, { status: nextStatus });
      onUpdate(); // Refresh the list
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this experience? This action cannot be undone.')) return;
    
    setLoading(id);
    try {
      await api.packages.delete(id);
      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };

  if (!packages?.length) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-luxury-gold-500/10 rounded-3xl bg-luxury-charcoal/30">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-luxury-gold-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-luxury-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-serif text-xl text-white mb-2">No packages yet</h3>
        <p className="text-luxury-cream/50 text-sm mb-8 max-w-xs mx-auto">
          You haven't created any luxury experiences yet. Start your journey by offering something unique.
        </p>
        <Link href="/vendor/packages/create" className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-gold-500 hover:bg-luxury-gold-400 text-luxury-black font-semibold rounded-xl text-sm transition transition-all shadow-lg shadow-luxury-gold-500/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Create First Package
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {packages.map((pkg) => (
        <div key={pkg.id} className="bg-luxury-charcoal border border-luxury-gold-500/10 rounded-2xl p-4 overflow-hidden shadow-sm hover:border-luxury-gold-500/30 transition-all">
          <div className="flex items-center gap-4">
            {/* Image Preview */}
            <div className="w-24 h-20 rounded-xl overflow-hidden relative bg-black shrink-0">
              <Image 
                src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400'} 
                alt={pkg.title} 
                fill 
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-serif text-lg text-white truncate">{pkg.title}</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${statusStyles[pkg.status || 'draft']}`}>
                  {pkg.status || 'draft'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-luxury-cream/50">
                <span>📍 {pkg.location || 'Location TBD'}</span>
                <span>🏷️ {pkg.category}</span>
                <span>👥 {pkg.min_guests}-{pkg.max_guests || '∞'} guests</span>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-right">
                <p className="text-luxury-gold-400 font-semibold text-lg leading-none">
                  {(pkg.base_price_cents / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
                </p>
                <p className="text-[10px] text-luxury-cream/40 uppercase tracking-wider mt-1">Starting Price</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleToggleStatus(pkg)}
                  disabled={loading === pkg.id}
                  className={`p-2 rounded-lg transition border ${pkg.status === 'published' ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}
                  title={pkg.status === 'published' ? 'Deactivate' : 'Publish'}
                >
                  {loading === pkg.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : pkg.status === 'published' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
                <Link 
                  href={`/vendor/dashboard/packages/${pkg.id}/edit`}
                  className="p-2 rounded-lg border border-luxury-gold-500/30 text-luxury-gold-400 hover:bg-luxury-gold-500/10 transition"
                  title="Edit Experience"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </Link>
                <button 
                  onClick={() => handleDelete(pkg.id)}
                  className="p-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
