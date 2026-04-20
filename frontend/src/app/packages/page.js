import PackageGrid from '@/components/PackageGrid';

export default async function PackagesPage({ searchParams }) {
  const category = searchParams?.category || '';
  const query = searchParams?.q || '';

  let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/packages?`;
  if (category) url += `category=${category}&`;
  if (query) url += `q=${encodeURIComponent(query)}&`;

  const res = await fetch(url.slice(0, -1), { cache: 'no-store' });
  const data = await res.json().catch(() => ({ packages: [] }));
  const packages = data.packages || [];

  const categories = [
    { slug: '', label: 'All Experiences', icon: '✨' },
    { slug: 'date', label: 'Dates', icon: '🥂' },
    { slug: 'party', label: 'Parties', icon: '🎉' },
    { slug: 'birthday', label: 'Birthdays', icon: '🎂' },
    { slug: 'proposal', label: 'Proposals', icon: '💍' },
    { slug: 'trip', label: 'Trips', icon: '✈️' },
    { slug: 'celebration', label: 'Celebrations', icon: '🎊' },
  ];

  return (
    <div className="pt-24 pb-16">
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-30 bg-black/80 backdrop-blur-md border-b border-luxury-gold-500/20 mb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex overflow-x-auto hide-scrollbar gap-8 py-4">
          {categories.map((c) => {
            const isActive = (!category && !c.slug) || category === c.slug;
            return (
              <a
                key={c.slug}
                href={c.slug ? `/packages?category=${c.slug}` : '/packages'}
                className={`flex flex-col items-center gap-2 min-w-max transition pb-2 border-b-2 ${isActive
                    ? 'border-luxury-gold-400 text-luxury-gold-400'
                    : 'border-transparent text-luxury-cream/60 hover:text-luxury-cream hover:border-luxury-cream/30'
                  }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-medium tracking-wide">{c.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {query && (
          <h1 className="text-2xl text-white mb-6">
            Search results for <span className="text-luxury-gold-400">&quot;{query}&quot;</span>
          </h1>
        )}
        <PackageGrid packages={packages} />
      </div>
    </div>
  );
}
