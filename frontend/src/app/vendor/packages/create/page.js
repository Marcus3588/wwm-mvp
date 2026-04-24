'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

export default function CreatePackagePage() {
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const [form, setForm] = useState({
        title: '',
        short_description: '',
        long_description: '',
        category: 'date',
        base_price_cents: '',
        location: '',
        image: '',
        duration_hours: '',
        min_guests: '1',
        max_guests: '',
        status: 'draft'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (authLoading) return <div className="pt-40 text-center animate-pulse text-luxury-gold-400">Verifying permissions...</div>;

    if (!user || profile?.role !== 'vendor') {
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
                base_price_cents: parseInt(form.base_price_cents, 10) * 100,
                duration_hours: form.duration_hours ? parseInt(form.duration_hours, 10) : null,
                min_guests: parseInt(form.min_guests, 10),
                max_guests: form.max_guests ? parseInt(form.max_guests, 10) : null,
                images: [form.image],
            });
            router.push('/vendor/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to create package');
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 pb-24 px-4 min-h-screen bg-luxury-black">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/vendor/dashboard" className="p-2 rounded-full bg-luxury-charcoal hover:bg-luxury-gold-500/10 text-luxury-cream/60 hover:text-luxury-gold-400 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h1 className="font-serif text-3xl text-white">Create New experience</h1>
                        <p className="text-luxury-cream/50 text-sm">Fill in the details to list your luxury package.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}

                    {/* Section 1: Basic Info */}
                    <div className="bg-luxury-charcoal/50 border border-luxury-gold-500/10 rounded-3xl p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Experience Title</label>
                            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" placeholder="e.g. Private Rooftop Dinner under the Stars" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Short Tagline</label>
                            <input required type="text" value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" placeholder="A one-sentence captivating summary..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Full Description</label>
                            <textarea required rows={5} value={form.long_description} onChange={e => setForm({ ...form, long_description: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition resize-none" placeholder="Provide a detailed itinerary and what makes this experience special..." />
                        </div>
                    </div>

                    {/* Section 2: Logistics & Pricing */}
                    <div className="bg-luxury-charcoal/50 border border-luxury-gold-500/10 rounded-3xl p-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition appearance-none">
                                    <option value="date">Romantic Date</option>
                                    <option value="party">Exclusive Party</option>
                                    <option value="trip">Luxury Trip</option>
                                    <option value="birthday">Birthday Celebration</option>
                                    <option value="proposal">Proposal Package</option>
                                    <option value="celebration">Grand Celebration</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Base Price (GHS)</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-4 text-luxury-gold-500/50">GH₵</span>
                                    <input required type="number" value={form.base_price_cents} onChange={e => setForm({ ...form, base_price_cents: e.target.value })} className="w-full pl-14 pr-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" placeholder="5000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Location / Venue</label>
                                <input required type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" placeholder="e.g. Labadi Beach Hotel, Accra" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Duration (Hours)</label>
                                <input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" placeholder="e.g. 4" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Min Guests</label>
                                <input required type="number" value={form.min_guests} onChange={e => setForm({ ...form, min_guests: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Max Guests</label>
                                <input type="number" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" placeholder="Leave blank for no limit" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Media */}
                    <div className="bg-luxury-charcoal/50 border border-luxury-gold-500/10 rounded-3xl p-8">
                        <ImageUpload 
                            label="Experience Cover Photo"
                            value={form.image}
                            onChange={(url) => setForm({ ...form, image: url })}
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Initial Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition appearance-none capitalize">
                                <option value="draft">Save as Draft</option>
                                <option value="published">Publish Immediately</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="sm:w-64 px-10 py-4 bg-luxury-gold-500 hover:bg-luxury-gold-400 disabled:opacity-50 text-luxury-black font-bold rounded-2xl transition shadow-xl shadow-luxury-gold-500/20 mt-auto">
                            {loading ? 'Creating...' : 'Create Experience'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
