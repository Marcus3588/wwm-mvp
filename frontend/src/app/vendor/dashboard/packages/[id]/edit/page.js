'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function EditPackagePage() {
    const router = useRouter();
    const { id } = useParams();
    const { user } = useAuth();
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const res = await api.packages.get(id);
                const pkg = res.package;
                setForm({
                    title: pkg.title || '',
                    short_description: pkg.short_description || '',
                    long_description: pkg.long_description || '',
                    category: pkg.category || 'date',
                    base_price_cents: (pkg.base_price_cents / 100).toString(),
                    location: pkg.location || '',
                    image: pkg.images?.[0] || '',
                    duration_hours: pkg.duration_hours || '',
                    min_guests: pkg.min_guests || '1',
                    max_guests: pkg.max_guests || '',
                    status: pkg.status || 'draft'
                });
            } catch (err) {
                setError('Failed to load experience details.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.packages.update(id, {
                ...form,
                base_price_cents: parseInt(form.base_price_cents * 100, 10),
                duration_hours: form.duration_hours ? parseInt(form.duration_hours, 10) : null,
                min_guests: parseInt(form.min_guests, 10),
                max_guests: form.max_guests ? parseInt(form.max_guests, 10) : null,
                images: [form.image],
            });
            router.push('/vendor/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to update package');
            setSaving(false);
        }
    };

    if (loading) return <div className="pt-40 text-center text-luxury-gold-400 animate-pulse">Loading experience data...</div>;

    return (
        <div className="pt-24 pb-24 px-4 min-h-screen bg-luxury-black">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/vendor/dashboard" className="p-2 rounded-full bg-luxury-charcoal hover:bg-luxury-gold-500/10 text-luxury-cream/60 hover:text-luxury-gold-400 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <div>
                        <h1 className="font-serif text-3xl text-white">Edit experience</h1>
                        <p className="text-luxury-cream/50 text-sm">Refine and update your luxury package details.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">{error}</div>}

                    {/* Section 1: Basic Info */}
                    <div className="bg-luxury-charcoal/50 border border-luxury-gold-500/10 rounded-3xl p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Experience Title</label>
                            <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Short Tagline</label>
                            <input required type="text" value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Full Description</label>
                            <textarea required rows={5} value={form.long_description} onChange={e => setForm({ ...form, long_description: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition resize-none" />
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
                                    <input required type="number" value={form.base_price_cents} onChange={e => setForm({ ...form, base_price_cents: e.target.value })} className="w-full pl-14 pr-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Location / Venue</label>
                                <input required type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Duration (Hours)</label>
                                <input type="number" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Min Guests</label>
                                <input required type="number" value={form.min_guests} onChange={e => setForm({ ...form, min_guests: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Max Guests</label>
                                <input type="number" value={form.max_guests} onChange={e => setForm({ ...form, max_guests: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Media */}
                    <div className="bg-luxury-charcoal/50 border border-luxury-gold-500/10 rounded-3xl p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Cover Image URL</label>
                            <input required type="url" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition" />
                        </div>
                        {form.image && (
                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-luxury-gold-500/10">
                                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-luxury-cream/70 mb-2">Package Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-5 py-4 bg-black border border-luxury-gold-500/10 rounded-2xl text-white focus:border-luxury-gold-500 outline-none transition appearance-none capitalize">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <button type="submit" disabled={saving} className="sm:w-64 px-10 py-4 bg-luxury-gold-500 hover:bg-luxury-gold-400 disabled:opacity-50 text-luxury-black font-bold rounded-2xl transition shadow-xl shadow-luxury-gold-500/20 mt-auto">
                            {saving ? 'Saving...' : 'Update Experience'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
