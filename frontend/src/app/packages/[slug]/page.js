import Link from 'next/link';
import Image from 'next/image';
import BookingButton from './BookingButton';

export default async function PackageDetailPage({ params }) {
  const slug = params?.slug;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/packages/${slug}`,
    { cache: 'no-store' }
  );
  const data = await res.json().catch(() => ({}));
  const pkg = data.package;

  if (!pkg) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <h1 className="text-2xl text-white mb-4">Package not found</h1>
        <Link href="/packages" className="text-luxury-gold-400 hover:underline">
          Back to packages
        </Link>
      </div>
    );
  }

  const inclusions = Array.isArray(pkg.inclusions)
    ? pkg.inclusions
    : typeof pkg.inclusions === 'object'
      ? Object.entries(pkg.inclusions)
      : [];
  const priceGHS = (pkg.base_price_cents || 0) / 100;

  return (
    <div className="pt-24 pb-24 max-w-[1120px] mx-auto px-4 sm:px-8">
      <Link href="/packages" className="inline-flex items-center text-luxury-cream/70 hover:text-luxury-gold-400 text-sm mb-6 font-medium transition">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Back to Experiences
      </Link>

      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-white mb-2">{pkg.title}</h1>
        <div className="flex items-center gap-4 text-sm text-luxury-cream/80">
          <span className="flex items-center gap-1 font-semibold text-white">
            <svg viewBox="0 0 32 32" className="w-4 h-4 fill-current"><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" /></svg>
            4.95
          </span>
          <span className="underline cursor-pointer">120 reviews</span>
          <span>·</span>
          <span className="capitalize underline cursor-pointer">{pkg.category} Experience</span>
        </div>
      </div>

      {/* Image Gallery Grid */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
          {pkg.images?.[0] ? (
            <div className="relative md:col-span-2 md:row-span-2 h-full bg-luxury-charcoal hover:opacity-90 transition cursor-pointer">
              <Image src={pkg.images[0]} alt={pkg.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          ) : <div className="md:col-span-2 md:row-span-2 bg-luxury-gold-500/10" />}

          {pkg.images?.[1] && (
            <div className="hidden md:block relative h-full bg-luxury-charcoal hover:opacity-90 transition cursor-pointer">
              <Image src={pkg.images[1]} alt={pkg.title} fill className="object-cover" sizes="25vw" />
            </div>
          )}
          {pkg.images?.[2] && (
            <div className="hidden md:block relative h-full bg-luxury-charcoal hover:opacity-90 transition cursor-pointer pt-[2px]">
              <Image src={pkg.images[2]} alt={pkg.title} fill className="object-cover" sizes="25vw" />
            </div>
          )}
          {pkg.images?.[3] ? (
            <div className="hidden md:block relative h-full bg-luxury-charcoal hover:opacity-90 transition cursor-pointer">
              <Image src={pkg.images[3]} alt={pkg.title} fill className="object-cover" sizes="25vw" />
            </div>
          ) : pkg.images?.[1] && <div className="hidden md:block h-full bg-luxury-gold-500/10" />}
          {pkg.images?.[4] ? (
            <div className="hidden md:block relative h-full bg-luxury-charcoal hover:opacity-90 transition cursor-pointer pt-[2px]">
              <Image src={pkg.images[4]} alt={pkg.title} fill className="object-cover" sizes="25vw" />
            </div>
          ) : pkg.images?.[2] && <div className="hidden md:block h-full bg-luxury-gold-500/10" />}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_380px] gap-16 relative">
        {/* Left Column: Details */}
        <div>
          <div className="pb-8 border-b border-luxury-gold-500/20 mb-8">
            <h2 className="text-2xl text-white font-medium mb-2">Curated by our top luxury partners</h2>
            <p className="text-luxury-cream/70">Unforgettable moments tailored strictly to your preferences.</p>
          </div>

          <div className="pb-8 border-b border-luxury-gold-500/20 mb-8 space-y-6">
            <div className="flex gap-4">
              <svg className="w-8 h-8 text-luxury-gold-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              <div>
                <h3 className="text-white font-medium text-lg">Premium Experience</h3>
                <p className="text-luxury-cream/70 text-sm mt-1">This package guarantees a premium touch with dedicated support.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <svg className="w-8 h-8 text-luxury-gold-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <div>
                <h3 className="text-white font-medium text-lg">Highly Flexible</h3>
                <p className="text-luxury-cream/70 text-sm mt-1">Free cancellation up to 48 hours before the event date.</p>
              </div>
            </div>
          </div>

          {pkg.long_description ? (
            <div className="mb-12">
              <h2 className="font-serif text-2xl text-white mb-4">About This Experience</h2>
              <p className="text-luxury-cream/80 leading-relaxed whitespace-pre-line text-lg">
                {pkg.long_description}
              </p>
            </div>
          ) : (
            <div className="mb-12">
              <h2 className="font-serif text-2xl text-white mb-4">About This Experience</h2>
              <p className="text-luxury-cream/80 leading-relaxed whitespace-pre-line text-lg">
                {pkg.short_description}. This experience invites you to step into a world of ultimate luxury and unforgettable moments. Everything is taken care of from start to finish, allowing you and your loved ones to completely immerse yourselves in the occasion.
              </p>
            </div>
          )}

          {inclusions.length > 0 && (
            <div className="pb-8 border-b border-luxury-gold-500/20 mb-8">
              <h2 className="font-serif text-2xl text-white mb-6">What&apos;s Included</h2>
              <ul className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                {inclusions.map((inc, i) => {
                  const item = typeof inc === 'object' && inc.item ? inc.item : inc[1] || inc;
                  return (
                    <li key={i} className="flex items-start gap-3 text-luxury-cream/80 text-lg">
                      <span className="text-luxury-gold-400 mt-1">✓</span> {item}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Booking Card */}
        <div className="relative">
          <div className="sticky top-24">
            <BookingButton packageData={pkg} />
          </div>
        </div>
      </div>
    </div>
  );
}
