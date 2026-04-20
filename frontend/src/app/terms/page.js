import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-luxury-black text-luxury-cream pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-6">
                <nav className="mb-12">
                    <Link href="/" className="text-luxury-gold-400 hover:text-luxury-gold-300 transition flex items-center gap-2 text-sm font-medium uppercase tracking-widest">
                        <span className="text-xl">←</span> Back to Home
                    </Link>
                </nav>

                <header className="mb-16">
                    <h1 className="font-serif text-5xl md:text-6xl mb-6 text-white leading-tight">Terms of Service</h1>
                    <p className="text-luxury-cream/40 text-sm uppercase tracking-widest">Last Updated: March 12, 2026</p>
                </header>

                <div className="prose prose-invert prose-luxury max-w-none space-y-12 text-luxury-cream/70 leading-relaxed font-light">
                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using the Walk With Me (WWM) platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">2. Use of the Platform</h2>
                        <p>
                            You must be at least 18 years old to create an account and book experiences on WWM. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">3. Booking and Payments</h2>
                        <p>
                            Bookings are subject to availability and the specific terms provided by the Vendor. Payments are processed securely at the time of booking. Cancellation and refund policies vary by experience and are clearly displayed at the time of purchase.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">4. User Obligations</h2>
                        <p>
                            You agree to use WWM only for lawful purposes. You shall not engage in any activity that disrupts or interferes with the platform's functionality or our vendors' business.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">5. Limitation of Liability</h2>
                        <p>
                            WWM acts as a marketplace connecting customers and vendors. While we curate our premium partners, we are not liable for any direct or indirect damages arising from the experiences provided by third-party vendors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">6. Intellectual Property</h2>
                        <p>
                            All content on the WWM platform, including logos, designs, and text, is the property of Walk With Me and is protected by copyright and intellectual property laws in Ghana and internationally.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">7. Contact Us</h2>
                        <p>
                            For any questions regarding these terms, please contact our legal team at marcee3588@gmail.com.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
