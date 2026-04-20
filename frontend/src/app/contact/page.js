'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
    const [status, setStatus] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('success');
    };

    return (
        <div className="min-h-screen bg-luxury-black text-luxury-cream pt-32 pb-24">
            <div className="max-w-6xl mx-auto px-6">
                <header className="mb-20 text-center">
                    <h1 className="font-serif text-5xl md:text-7xl mb-6 text-white leading-tight">Get in Touch</h1>
                    <p className="text-luxury-cream/50 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                        Have a question about an experience or want to partner with us? Our concierge team is here to assist you.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Contact Form */}
                    <div className="bg-white/5 p-10 rounded-3xl border border-white/10 backdrop-blur-sm">
                        {status === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <div className="w-16 h-16 bg-luxury-gold-400/20 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-3xl text-luxury-gold-400">✓</span>
                                </div>
                                <h3 className="text-2xl font-serif text-white mb-2">Message Received</h3>
                                <p className="text-luxury-cream/50">We'll get back to you within 24 hours.</p>
                                <button
                                    onClick={() => setStatus(null)}
                                    className="mt-8 text-luxury-gold-400 hover:text-luxury-gold-300 underline underline-offset-8"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-luxury-cream/40 mb-2">FullName</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:border-luxury-gold-400 outline-none transition"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-luxury-cream/40 mb-2">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:border-luxury-gold-400 outline-none transition"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-luxury-cream/40 mb-2">Subject</label>
                                    <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white focus:border-luxury-gold-400 outline-none transition appearance-none">
                                        <option>General Inquiry</option>
                                        <option>Booking Support</option>
                                        <option>Partnership/Vendor Request</option>
                                        <option>Feedback</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-luxury-cream/40 mb-2">Your Message</label>
                                    <textarea
                                        required
                                        rows="5"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 focus:border-luxury-gold-400 outline-none transition resize-none"
                                        placeholder="How can we help?"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-luxury-gold-500 hover:bg-luxury-gold-400 text-black font-bold py-5 rounded-xl transition shadow-xl shadow-luxury-gold-500/10 uppercase tracking-widest text-sm"
                                >
                                    Send Experience Request
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div>
                            <h3 className="text-xs uppercase tracking-[0.3em] text-luxury-gold-400 mb-8 font-bold">Concierge Details</h3>
                            <div className="space-y-8">
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 flex-shrink-0">
                                        <span className="text-xl">✉</span>
                                    </div>
                                    <div>
                                        <p className="text-luxury-cream/40 text-xs uppercase tracking-widest mb-1">Direct Email</p>
                                        <a href="mailto:marcee3588@gmail.com" className="text-white text-xl hover:text-luxury-gold-400 transition">marcee3588@gmail.com</a>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 flex-shrink-0">
                                        <span className="text-xl">✆</span>
                                    </div>
                                    <div>
                                        <p className="text-luxury-cream/40 text-xs uppercase tracking-widest mb-1">WhatsApp & Call</p>
                                        <a href="tel:+233245053588" className="text-white text-xl hover:text-luxury-gold-400 transition">+233 24 505 3588</a>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 flex-shrink-0">
                                        <span className="text-xl">⚲</span>
                                    </div>
                                    <div>
                                        <p className="text-luxury-cream/40 text-xs uppercase tracking-widest mb-1">Our Location</p>
                                        <p className="text-white text-xl leading-relaxed">
                                            Kojo Thompson Ave<br />
                                            Accra, Ghana
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-l-2 border-luxury-gold-500 bg-white/5 rounded-r-3xl">
                            <h4 className="text-white font-serif text-xl mb-3 font-semibold italic">"Walk with us through Ghana's most exclusive landscapes. We handle the details, you live the moment."</h4>
                            <p className="text-luxury-cream/40 text-sm">— The WWM Concierge Team</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
