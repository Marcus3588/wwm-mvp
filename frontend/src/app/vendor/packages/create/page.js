'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function CreatePackagePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [form, setForm] = useState({
        title: '',
        short_description: '',
        category: 'party',
        base_price_cents: '',
        image: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!user) {
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const pkg = await api.packages.create({
                ...form,
                base_price_cents: parseInt(form.base_price_cents, 10) * 100, // convert GHS to pesewas
            });
            router.push(`/packages/${pkg.package?.slug || ''}`);
        } catch (err) {
            setError(err.message || 'Failed to create package');
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-16 px-4 min-h-[85vh]">
            <div className="max-w-2xl mx-auto rounded-2xl bg-black overflow-hidden shadow-2xl border border-luxury-gold-500/20">
                <div className="bg-gradient-to-r from-luxury-black via-luxury-charcoal to-luxury-black p-8 border-b border-luxury-gold-500/10">
                    <h1 className="font-serif text-3xl text-luxury-gold-400 mb-2">Create New Package</h1>
                    <p className="text-luxury-cream/70 text-sm">Offer a breathtaking new experience to your customers.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-8">
                    {error && <div className="p-4 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-luxury-cream/90 mb-2">Title</label>
                        <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-luxury-charcoal/50 border border-luxury-gold-500/20 rounded-xl text-white focus:border-luxury-gold-500 focus:bg-luxury-charcoal outline-none transition-all" placeholder="e.g. VIP Yacht Party Weekend" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-luxury-cream/90 mb-2">Short Description</label>
                        <textarea required rows={3} value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} className="w-full px-4 py-3 bg-luxury-charcoal/50 border border-luxury-gold-500/20 rounded-xl text-white focus:border-luxury-gold-500 focus:bg-luxury-charcoal outline-none resize-none transition-all" placeholder="Describe the experience in a few captivating sentences..." />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-luxury-cream/90 mb-2">Category</label>
                            <div className="relative">
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="appearance-none w-full px-4 py-3 bg-luxury-charcoal/50 border border-luxury-gold-500/20 rounded-xl text-white focus:border-luxury-gold-500 focus:bg-luxury-charcoal outline-none transition-all">
                                    <option value="party">Exclusive Party</option>
                                    <option value="date">Romantic Date</option>
                                    <option value="trip">Luxury Trip</option>
                                    <option value="birthday">Birthday Celebration</option>
                                    <option value="proposal">Proposal Package</option>
                                    <option value="celebration">Grand Celebration</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-luxury-gold-500">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-luxury-cream/90 mb-2">Base Price (GHS)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-luxury-gold-500/50">GH₵</span>
                                <input required type="number" min="0" value={form.base_price_cents} onChange={e => setForm({ ...form, base_price_cents: e.target.value })} className="w-full pl-12 pr-4 py-3 bg-luxury-charcoal/50 border border-luxury-gold-500/20 rounded-xl text-white focus:border-luxury-gold-500 focus:bg-luxury-charcoal outline-none transition-all" placeholder="e.g. 5000" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-luxury-cream/90 mb-2">Cover Image URL</label>
                        <input required type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full px-4 py-3 bg-luxury-charcoal/50 border border-luxury-gold-500/20 rounded-xl text-white focus:border-luxury-gold-500 focus:bg-luxury-charcoal outline-none transition-all" placeholder="https://images.unsplash.com/..." />
                        {form.image && (
                            <div className="mt-4 rounded-xl overflow-hidden h-40 relative shadow-inner">
                                <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} onLoad={(e) => { e.target.style.display = 'block' }} />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-luxury-gold-500/10">
                        <button type="submit" disabled={loading} className="w-full px-6 py-4 bg-gradient-to-r from-luxury-gold-500 to-luxury-gold-400 hover:to-luxury-gold-300 disabled:opacity-50 text-luxury-black font-semibold rounded-xl transition-all shadow-lg shadow-luxury-gold-500/20">
                            {loading ? 'Creating Experience...' : 'Create Experience'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
