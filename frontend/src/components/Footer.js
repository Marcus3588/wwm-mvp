import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-luxury-black mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-2xl text-white block mb-3">Walk With Me</Link>
            <p className="text-luxury-cream/50 text-sm leading-relaxed">
              Ghana's premier curator of luxury experiences. Unforgettable moments, flawlessly executed.
            </p>
          </div>

          {/* Experiences */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-3">
              {[
                { href: '/packages?category=date', label: 'Date Nights' },
                { href: '/packages?category=party', label: 'Parties' },
                { href: '/packages?category=birthday', label: 'Birthdays' },
                { href: '/packages?category=proposal', label: 'Proposals' },
                { href: '/packages?category=trip', label: 'Luxury Trips' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-luxury-cream/60 text-sm hover:text-luxury-gold-400 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Vendors</h4>
            <ul className="space-y-3">
              {[
                { href: '/vendor', label: 'Partner With Us' },
                { href: '/vendor/dashboard', label: 'Vendor Dashboard' },
                { href: '/vendor/packages/create', label: 'Create a Package' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-luxury-cream/60 text-sm hover:text-luxury-gold-400 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-3">
              {[
                { href: '/login', label: 'Sign In' },
                { href: '/login?register=1', label: 'Create Account' },
                { href: '/bookings', label: 'My Bookings' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-luxury-cream/60 text-sm hover:text-luxury-gold-400 transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-luxury-cream/30 text-xs">
            © {new Date().getFullYear()} Walk With Me. All rights reserved. Ghana.
          </p>
          <div className="flex gap-6 text-xs text-luxury-cream/30">
            <Link href="/privacy" className="hover:text-luxury-cream/60 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-luxury-cream/60 transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-luxury-cream/60 transition">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
