'use client';

import { Suspense } from 'react';
import ConfirmContent from './ConfirmContent';

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 pb-16 px-4 min-h-[60vh] flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
