export const dynamic = 'force-dynamic';
import Link from 'next/link';
import PackageGrid from '@/components/PackageGrid';
import SearchBar from '@/components/SearchBar';

export default async function HomePage() {
  let packages = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/packages/featured`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    packages = data.packages || [];
  } catch (error) {
    console.error('Failed to fetch packages:', error);
  }

  return (
    <>
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1540541338287-41700607e5ce?w=1920")' }}
        >
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-gold-600/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-luxury-gold-400" />
            <span className="text-luxury-gold-300 text-sm tracking-wider uppercase">
              Ghana&apos;s Premier Experience Curator
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white mb-6 leading-tight">
            Curate Your
            <br />
            <span className="text-luxury-gold-400">Perfect Moment</span>
          </h1>
          <p className="text-luxury-cream text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            Luxury experiences crafted for life&apos;s finest occasions. From intimate dates to
            grand celebrations, we orchestrate moments that become memories.
          </p>

          <div className="w-full max-w-2xl mx-auto mb-10 z-20">
            <SearchBar />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/packages"
              className="px-8 py-4 bg-white hover:bg-gray-100 text-black font-semibold rounded-full transition text-lg shadow-xl"
            >
              Explore Experiences
            </Link>
            <Link
              href="/vendor"
              className="px-8 py-4 border-2 border-white/80 text-white hover:bg-white/10 rounded-full transition font-semibold"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section >

      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center text-white mb-4">
            Featured Experiences
          </h2>
          <p className="text-center text-luxury-cream/70 max-w-xl mx-auto mb-12">
            Hand-picked packages for your most memorable moments.
          </p>
          <PackageGrid packages={packages} />
          <div className="text-center mt-12">
            <Link
              href="/packages"
              className="inline-block px-6 py-3 border border-luxury-gold-500/50 text-luxury-gold-300 hover:bg-luxury-gold-500/10 rounded transition"
            >
              View All Experiences
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
