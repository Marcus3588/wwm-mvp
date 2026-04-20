'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const steps = ['Account', 'Business', 'Banking', 'Review'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < current ? 'bg-luxury-gold-500 text-luxury-black' :
                i === current ? 'bg-luxury-gold-500 text-luxury-black ring-4 ring-luxury-gold-500/30' :
                  'bg-luxury-charcoal text-luxury-cream/40 border border-luxury-gold-500/20'
              }`}>
              {i < current ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
              ) : i + 1}
            </div>
            <span className={`text-xs mt-1.5 font-medium ${i === current ? 'text-luxury-gold-400' : 'text-luxury-cream/40'}`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-px mx-2 mb-5 transition-all ${i < current ? 'bg-luxury-gold-500' : 'bg-luxury-gold-500/20'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function VendorApplyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(user ? 1 : 0);
  const [form, setForm] = useState({
    business_name: '',
    business_description: '',
    services_offered: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.vendors.apply({
        ...form,
        services_offered: form.services_offered.split(',').map(s => s.trim()).filter(Boolean),
      });
      setSuccess(true);
    } catch (e) {
      setError(e.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-luxury-gold-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-luxury-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="font-serif text-3xl text-white mb-3">Application Submitted!</h1>
          <p className="text-luxury-cream/60 leading-relaxed mb-10">
            Thank you for applying to partner with us. Our team will review your application and get back to you within 2–3 business days.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="px-6 py-3 border border-luxury-gold-500/40 text-luxury-cream/80 hover:text-white hover:border-luxury-gold-400 rounded-xl text-sm font-medium transition">
              Go Home
            </Link>
            <Link href="/vendor/dashboard" className="px-6 py-3 bg-luxury-gold-500 hover:bg-luxury-gold-400 text-luxury-black font-semibold rounded-xl text-sm transition">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3.5 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-luxury-gold-500/70 focus:ring-2 focus:ring-luxury-gold-500/20 outline-none transition text-sm";
  const labelClass = "block text-sm font-medium text-luxury-cream/80 mb-2";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-luxury-gold-400 text-xs font-medium mb-5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            Become a Verified Vendor
          </div>
          <h1 className="font-serif text-4xl text-white mb-3">Partner With Us</h1>
          <p className="text-luxury-cream/50 leading-relaxed max-w-sm mx-auto">
            Join Ghana's premier luxury experience marketplace and grow your business with us.
          </p>
        </div>

        <StepIndicator current={step} />

        {/* Step 0: Not Logged In */}
        {step === 0 && (
          <div className="bg-luxury-charcoal border border-luxury-gold-500/20 rounded-2xl p-8 text-center">
            <svg className="w-12 h-12 text-luxury-gold-400/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <h2 className="font-serif text-xl text-white mb-2">Sign In to Continue</h2>
            <p className="text-luxury-cream/50 text-sm mb-6">You need an account to apply as a vendor</p>
            <div className="flex gap-3 justify-center">
              <Link href="/login?redirect=/vendor" className="px-5 py-2.5 border border-luxury-gold-500/30 text-luxury-cream/80 hover:text-white rounded-xl text-sm font-medium transition">
                Sign In
              </Link>
              <Link href="/login?register=1&redirect=/vendor" className="px-5 py-2.5 bg-luxury-gold-500 hover:bg-luxury-gold-400 text-luxury-black font-semibold rounded-xl text-sm transition">
                Create Account
              </Link>
            </div>
          </div>
        )}

        {/* Step 1: Business Info */}
        {step === 1 && (
          <div className="bg-luxury-charcoal border border-luxury-gold-500/20 rounded-2xl p-8">
            <h2 className="font-serif text-xl text-white mb-6">Tell us about your business</h2>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Business / Brand Name *</label>
                <input type="text" required value={form.business_name} onChange={update('business_name')} placeholder="e.g. Luxe Events Ghana" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>What do you offer?</label>
                <textarea rows={3} value={form.business_description} onChange={update('business_description')} placeholder="e.g. We provide luxury private dining, decor, and entertainment for premium occasions." className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Services (comma-separated)</label>
                <input type="text" value={form.services_offered} onChange={update('services_offered')} placeholder="e.g. Catering, Decor, DJ, Transportation" className={inputClass} />
              </div>
            </div>
            <button
              onClick={() => { if (!form.business_name.trim()) { setError('Business name is required'); return; } setError(''); setStep(2); }}
              className="mt-8 w-full py-3.5 bg-luxury-gold-500 hover:bg-luxury-gold-400 text-luxury-black font-semibold rounded-xl transition"
            >
              Continue →
            </button>
            {error && <p className="mt-3 text-red-400 text-sm text-center">{error}</p>}
          </div>
        )}

        {/* Step 2: Banking */}
        {step === 2 && (
          <div className="bg-luxury-charcoal border border-luxury-gold-500/20 rounded-2xl p-8">
            <h2 className="font-serif text-xl text-white mb-2">Payment Details</h2>
            <p className="text-luxury-cream/50 text-sm mb-6">Your earnings will be sent to this account after each confirmed event.</p>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Bank Name</label>
                <input type="text" value={form.bank_name} onChange={update('bank_name')} placeholder="e.g. GCB Bank, Ecobank" className={inputClass} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Account Number</label>
                  <input type="text" value={form.bank_account_number} onChange={update('bank_account_number')} placeholder="0123456789" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Account Name</label>
                  <input type="text" value={form.bank_account_name} onChange={update('bank_account_name')} placeholder="As on bank records" className={inputClass} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 border border-white/10 text-luxury-cream/70 hover:text-white rounded-xl text-sm font-medium transition">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3.5 bg-luxury-gold-500 hover:bg-luxury-gold-400 text-luxury-black font-semibold rounded-xl transition">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <div className="bg-luxury-charcoal border border-luxury-gold-500/20 rounded-2xl p-8">
              <h2 className="font-serif text-xl text-white mb-6">Review your application</h2>
              <div className="space-y-4 text-sm">
                {[
                  { label: 'Business Name', value: form.business_name },
                  { label: 'Description', value: form.business_description || '—' },
                  { label: 'Services', value: form.services_offered || '—' },
                  { label: 'Bank', value: form.bank_name || '—' },
                  { label: 'Account Number', value: form.bank_account_number || '—' },
                  { label: 'Account Name', value: form.bank_account_name || '—' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-start gap-4 py-3 border-b border-white/5">
                    <span className="text-luxury-cream/50 shrink-0">{row.label}</span>
                    <span className="text-white text-right">{row.value}</span>
                  </div>
                ))}
              </div>

              {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3.5 border border-white/10 text-luxury-cream/70 hover:text-white rounded-xl text-sm font-medium transition">
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-luxury-gold-500 hover:bg-luxury-gold-400 disabled:opacity-60 text-luxury-black font-semibold rounded-xl transition">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
