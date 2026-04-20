import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-luxury-black text-luxury-cream pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-6">
                <nav className="mb-12">
                    <Link href="/" className="text-luxury-gold-400 hover:text-luxury-gold-300 transition flex items-center gap-2 text-sm font-medium uppercase tracking-widest">
                        <span className="text-xl">←</span> Back to Home
                    </Link>
                </nav>

                <header className="mb-16">
                    <h1 className="font-serif text-5xl md:text-6xl mb-6 text-white leading-tight">Privacy Policy</h1>
                    <p className="text-luxury-cream/40 text-sm uppercase tracking-widest">Last Updated: March 12, 2026</p>
                </header>

                <div className="prose prose-invert prose-luxury max-w-none space-y-12 text-luxury-cream/70 leading-relaxed font-light">
                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">1. Introduction</h2>
                        <p>
                            At Walk With Me (WWM), we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform to discover and book luxury experiences in Ghana.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">2. Data We Collect</h2>
                        <p>We collect information that you provide directly to us, including:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Contact information (name, email address, phone number)</li>
                            <li>Booking details and history</li>
                            <li>Payment information (processed securely through our payment partners)</li>
                            <li>Communications with vendors and our support team</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">3. How We Use Your Data</h2>
                        <p>Your data is used to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Facilitate bookings and reservations</li>
                            <li>Process payments and prevent fraud</li>
                            <li>Provide customer support and resolve disputes</li>
                            <li>Send transaction updates and marketing communications (with your consent)</li>
                            <li>Improve our services and user experience</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">4. Sharing Your Information</h2>
                        <p>
                            We share your contact details with Vendors only after a booking is confirmed to facilitate the execution of your experience. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">5. Your Rights</h2>
                        <p>
                            You have the right to access, correct, or delete your personal data. You can manage your account settings or contact us directly at marcee3588@gmail.com for any privacy-related inquiries.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">6. Changes to This Policy</h2>
                        <p>
                            We may update this policy periodically. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
