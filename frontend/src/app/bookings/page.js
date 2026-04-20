'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-300', dot: 'bg-gray-400' },
  pending_payment: { label: 'Awaiting Payment', color: 'bg-amber-500/20 text-amber-300', dot: 'bg-amber-400' },
  paid: { label: 'Paid — Awaiting Vendor', color: 'bg-blue-500/20 text-blue-300', dot: 'bg-blue-400' },
  confirmed: { label: 'Confirmed', color: 'bg-green-500/20 text-green-400', dot: 'bg-green-400' },
  in_progress: { label: 'In Progress', color: 'bg-purple-500/20 text-purple-300', dot: 'bg-purple-400' },
  completed: { label: 'Completed', color: 'bg-luxury-gold-500/20 text-luxury-gold-400', dot: 'bg-luxury-gold-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-300', dot: 'bg-red-400' },
};

function BookingCard({ b }) {
  const status = statusConfig[b.status] || { label: b.status, color: 'bg-gray-500/20 text-gray-300', dot: 'bg-gray-400' };
  const images = b.package_images || [];
  const mainImage = images[0] || null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Link href={`/bookings/${b.id}`} className="group block bg-luxury-charcoal border border-luxury-gold-500/20 hover:border-luxury-gold-400/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-luxury-gold-500/10 hover:-translate-y-0.5">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-52 h-48 sm:h-auto shrink-0 bg-luxury-gold-500/5">
          {mainImage ? (
            <img src={mainImage} alt={b.package_title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-luxury-gold-500/30">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}
          {/* Category Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-luxury-cream/90 font-medium capitalize">
            {b.category || 'Experience'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-serif text-xl text-white leading-tight group-hover:text-luxury-gold-300 transition-colors">{b.package_title || 'Experience Booking'}</h3>
              <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-luxury-cream/60 mb-4">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-luxury-gold-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {formatDate(b.event_date)}
              </span>
              {b.event_location && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-luxury-gold-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {b.event_location}
                </span>
              )}
              {b.guest_count && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-luxury-gold-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  {b.guest_count} {b.guest_count === 1 ? 'guest' : 'guests'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-luxury-gold-500/10">
            <div>
              <p className="text-luxury-gold-400 font-semibold text-lg">
                {((b.total_amount_cents || 0) / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
              </p>
              {b.booking_reference && (
                <p className="text-xs text-luxury-cream/40 mt-0.5">Ref: {b.booking_reference}</p>
              )}
            </div>
            <span className="flex items-center gap-1 text-luxury-gold-400 text-sm font-medium group-hover:gap-2 transition-all">
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/bookings');
      return;
    }
    const load = async () => {
      try {
        const { bookings: b } = await api.bookings.my();
        setBookings(b || []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, router]);

  const upcomingBookings = bookings.filter(b => ['draft', 'pending_payment', 'paid', 'confirmed', 'in_progress'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled', 'refunded'].includes(b.status));
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="pt-24 pb-24 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-2">Bookings</h1>
          <p className="text-luxury-cream/60">Track, manage, and review your experiences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-luxury-gold-500/20 mb-8">
          {[
            { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
            { id: 'past', label: 'Past', count: pastBookings.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-base font-medium border-b-2 transition -mb-px ${activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-luxury-cream/50 hover:text-luxury-cream/80'
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-luxury-gold-500/20 text-luxury-gold-400">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-luxury-charcoal animate-pulse border border-luxury-gold-500/10" />
            ))}
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-luxury-gold-500/10 flex items-center justify-center">
              {activeTab === 'upcoming' ? (
                <svg className="w-10 h-10 text-luxury-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ) : (
                <svg className="w-10 h-10 text-luxury-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              )}
            </div>
            <h2 className="font-serif text-2xl text-white mb-3">
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </h2>
            <p className="text-luxury-cream/50 max-w-sm mx-auto mb-8 leading-relaxed">
              {activeTab === 'upcoming'
                ? 'Explore curated luxury experiences and make your first reservation.'
                : 'Your completed and cancelled experiences will appear here.'}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition"
              >
                Explore Experiences
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {displayedBookings.map(b => (
              <BookingCard key={b.id} b={b} />
            ))}
          </div>
        )}

        {/* CTA Banner */}
        {!loading && (
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-luxury-gold-600/20 to-luxury-gold-500/10 border border-luxury-gold-500/30 p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div>
              <h3 className="font-serif text-xl text-white mb-1">Plan your next experience</h3>
              <p className="text-luxury-cream/60 text-sm">Handpicked luxury moments for the discerning few.</p>
            </div>
            <Link
              href="/packages"
              className="shrink-0 px-6 py-3 bg-luxury-gold-500 hover:bg-luxury-gold-400 text-luxury-black font-semibold rounded-full transition text-sm"
            >
              Browse Experiences
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
