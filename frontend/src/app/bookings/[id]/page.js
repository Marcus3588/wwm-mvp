'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const statusLabels = {
  draft: 'Draft',
  pending_payment: 'Awaiting Payment',
  paid: 'Paid',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/bookings/' + params.id);
      return;
    }
    const load = async () => {
      try {
        const { booking: b } = await api.bookings.get(params.id);
        setBooking(b);
      } catch {
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, params.id, router]);

  const handleCancel = async () => {
    const reason = prompt('Cancellation reason (optional):');
    if (reason === null) return;
    setSubmitting(true);
    try {
      await api.bookings.cancel(params.id, reason);
      setBooking((b) => (b ? { ...b, status: 'cancelled' } : null));
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = async () => {
    if (!booking?.vendor_id || rating < 1 || rating > 5) return;
    setSubmitting(true);
    try {
      await api.ratings.add({
        booking_id: params.id,
        vendor_id: booking.vendor_id,
        rating,
        comment: ratingComment,
      });
      setRating(0);
      setRatingComment('');
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispute = async () => {
    const reason = prompt('Describe the issue:');
    if (!reason) return;
    try {
      await api.disputes.create({ booking_id: params.id, reason });
      alert('Dispute submitted. Our team will review shortly.');
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading || !profile) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <p className="text-luxury-cream/70">Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <p className="text-luxury-cream/70">Booking not found</p>
        <Link href="/bookings" className="text-luxury-gold-400 hover:underline mt-4 inline-block">
          Back to bookings
        </Link>
      </div>
    );
  }

  const canCancel = ['draft', 'pending_payment', 'paid', 'confirmed'].includes(booking.status);
  const canRate = booking.status === 'completed' && booking.vendor_id;

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/bookings" className="text-luxury-cream/70 hover:text-luxury-gold-400 text-sm mb-6 inline-block">
          ← Back to bookings
        </Link>

        <div className="bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20 overflow-hidden">
          {booking.package_images?.[0] && (
            <div className="aspect-video relative">
              <Image src={booking.package_images[0]} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="p-6">
            <h1 className="font-serif text-2xl text-white mb-2">{booking.package_title}</h1>
            <p className="text-sm text-luxury-cream/60 mb-4">
              {booking.booking_reference} • {new Date(booking.event_date).toLocaleDateString('en-GB', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <span
              className={`inline-block px-2 py-1 rounded text-xs mb-4 ${
                ['paid', 'confirmed', 'completed'].includes(booking.status)
                  ? 'bg-luxury-gold-500/20 text-luxury-gold-400'
                  : 'bg-luxury-cream/10 text-luxury-cream/70'
              }`}
            >
              {statusLabels[booking.status] || booking.status}
            </span>
            <p className="text-luxury-gold-400 text-lg">
              {((booking.total_amount_cents || 0) / 100).toLocaleString('en-GH', {
                style: 'currency',
                currency: 'GHS',
              })}
            </p>
          </div>
        </div>

        {canCancel && (
          <div className="mt-6">
            <button
              onClick={handleCancel}
              disabled={submitting}
              className="px-6 py-2 border border-red-500/50 text-red-400 rounded hover:bg-red-500/10 transition disabled:opacity-50"
            >
              Cancel Booking
            </button>
          </div>
        )}

        {canRate && (
          <div className="mt-6 p-6 bg-luxury-charcoal rounded-lg border border-luxury-gold-500/20">
            <h3 className="text-white mb-2">Rate this experience</h3>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`w-10 h-10 rounded border ${
                    rating >= n ? 'bg-luxury-gold-500 text-luxury-black border-luxury-gold-500' : 'border-luxury-gold-500/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Your review (optional)"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              className="w-full px-4 py-2 bg-luxury-black border border-luxury-gold-500/30 rounded text-white mb-4 resize-none"
              rows={3}
            />
            <button
              onClick={handleRate}
              disabled={submitting || rating < 1}
              className="px-6 py-2 bg-luxury-gold-500 text-luxury-black font-medium rounded hover:bg-luxury-gold-400 transition disabled:opacity-50"
            >
              Submit Rating
            </button>
          </div>
        )}

        {['paid', 'confirmed', 'in_progress', 'completed'].includes(booking.status) && (
          <div className="mt-6">
            <button
              onClick={handleDispute}
              className="text-sm text-luxury-cream/60 hover:text-luxury-gold-400 transition"
            >
              Report an issue / Open dispute
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
