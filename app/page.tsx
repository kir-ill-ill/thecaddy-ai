'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Vote,
  Lock,
  Sparkles,
  Users,
  DollarSign,
  MapPin,
  CloudSun,
  Camera,
  ChevronDown,
  Menu,
  X,
  Check,
  Star,
} from 'lucide-react';
import Logo from '@/components/Logo';

/* ------------------------------------------------------------------ */
/*  Intersection Observer hook for scroll-triggered animations         */
/* ------------------------------------------------------------------ */
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                 */
/* ------------------------------------------------------------------ */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-forest/10 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left group"
      >
        <span className="font-semibold text-gray-900 text-base sm:text-lg pr-4 group-hover:text-forest transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-forest shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}
      >
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing Card                                                       */
/* ------------------------------------------------------------------ */
function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  featured,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-8 flex flex-col h-full transition-shadow duration-300 ${
        featured
          ? 'bg-forest text-white shadow-2xl ring-2 ring-gold scale-[1.02]'
          : 'bg-white text-gray-900 shadow-lg border border-gray-100 hover:shadow-xl'
      }`}
    >
      {featured && (
        <span className="inline-block self-start bg-gold text-forest text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
          Most Popular
        </span>
      )}
      <h3 className={`font-display text-2xl mb-2 ${featured ? 'text-sand' : 'text-forest'}`}>
        {name}
      </h3>
      <div className="mb-6">
        <span className={`text-4xl font-bold ${featured ? 'text-white' : 'text-gray-900'}`}>
          {price}
        </span>
        <span className={`text-sm ml-1 ${featured ? 'text-sand/70' : 'text-gray-500'}`}>
          {period}
        </span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check
              className={`w-5 h-5 shrink-0 mt-0.5 ${featured ? 'text-gold' : 'text-forest'}`}
            />
            <span className={`text-sm ${featured ? 'text-sand/90' : 'text-gray-600'}`}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/trip"
        className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
          featured
            ? 'bg-gold text-forest hover:bg-gold-light'
            : 'bg-forest text-white hover:bg-forest-light'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

/* ================================================================== */
/*  MAIN PAGE COMPONENT                                                */
/* ================================================================== */
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Sticky nav scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Smooth scroll for anchor links */
  const scrollTo = useCallback((id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  /* Section observers */
  const problem = useInView();
  const howItWorks = useInView();
  const features = useInView();
  const social = useInView();
  const pricing = useInView();
  const faq = useInView();
  const finalCta = useInView();

  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-sand-light text-gray-900">
      {/* ============================================================ */}
      {/*  1. NAVIGATION                                               */}
      {/* ============================================================ */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
            <Logo size="md" showText className="text-forest" />
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              ['How It Works', 'how-it-works'],
              ['Features', 'features'],
              ['Pricing', 'pricing'],
              ['Demo', ''],
            ].map(([label, id]) =>
              id ? (
                <button
                  key={label}
                  onClick={() => scrollTo(id)}
                  className="text-sm font-medium text-gray-700 hover:text-forest transition-colors"
                >
                  {label}
                </button>
              ) : (
                <Link
                  key={label}
                  href="/demo-mobile"
                  className="text-sm font-medium text-gray-700 hover:text-forest transition-colors"
                >
                  {label}
                </Link>
              )
            )}
            <Link
              href="/trip"
              className="bg-gold text-forest text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-gold-light transition-colors shadow-sm"
            >
              Start Planning
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-forest"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              {[
                ['How It Works', 'how-it-works'],
                ['Features', 'features'],
                ['Pricing', 'pricing'],
              ].map(([label, id]) => (
                <button
                  key={label}
                  onClick={() => scrollTo(id)}
                  className="block w-full text-left text-base font-medium text-gray-700 py-2 hover:text-forest"
                >
                  {label}
                </button>
              ))}
              <Link
                href="/demo-mobile"
                className="block text-base font-medium text-gray-700 py-2 hover:text-forest"
                onClick={() => setMobileMenuOpen(false)}
              >
                Demo
              </Link>
              <Link
                href="/trip"
                className="block text-center bg-gold text-forest font-bold py-3 rounded-lg mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Planning
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ============================================================ */}
      {/*  2. HERO                                                     */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-28">
        {/* Background pattern -- CSS-only golf-course inspired gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-forest/[0.03] via-transparent to-sand-light" />
          {/* Fairway stripes */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #1A4D2E 0px, #1A4D2E 120px, transparent 120px, transparent 240px)',
            }}
          />
          {/* Decorative circles */}
          <div className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-gold/[0.06] blur-3xl" />
          <div className="absolute bottom-10 left-[5%] w-96 h-96 rounded-full bg-forest/[0.04] blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-gray-900 leading-[1.1] mb-6">
            I planned a legendary golf weekend{' '}
            <span className="text-forest">in&nbsp;12&nbsp;minutes.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            TheCaddy.ai turns your group text chaos into a locked-in trip.
            AI&#8209;powered&nbsp;planning, group&nbsp;voting, and cost&nbsp;splitting
            &mdash;&nbsp;all&nbsp;in&nbsp;one&nbsp;place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/trip"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold text-forest font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:bg-gold-light hover:shadow-xl transition-all duration-200"
            >
              Plan Your Trip &mdash; Free
            </Link>
            <Link
              href="/demo-mobile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-forest font-semibold text-lg hover:underline underline-offset-4"
            >
              Watch the Demo &rarr;
            </Link>
          </div>

          <p className="text-sm text-gray-500 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>No credit card required</span>
            <span className="hidden sm:inline text-gray-300">&bull;</span>
            {/* TODO: Update with real stat */}
            <span>2,500+ trips planned</span>
            <span className="hidden sm:inline text-gray-300">&bull;</span>
            <span>Free for your first trip</span>
          </p>
        </div>

        {/* CSS-only golf course illustration */}
        <div className="mt-16 max-w-3xl mx-auto px-4" aria-hidden="true">
          <div className="relative h-32 sm:h-44 rounded-2xl overflow-hidden bg-gradient-to-r from-forest via-forest-light to-forest shadow-xl">
            {/* Rolling hills */}
            <div className="absolute bottom-0 inset-x-0">
              <svg viewBox="0 0 1200 120" className="w-full" preserveAspectRatio="none">
                <path
                  d="M0 80 Q200 20 400 60 Q600 100 800 50 Q1000 0 1200 40 L1200 120 L0 120Z"
                  className="fill-[#2A6B42]"
                />
                <path
                  d="M0 90 Q300 50 500 80 Q700 110 900 70 Q1100 30 1200 60 L1200 120 L0 120Z"
                  className="fill-[#347D50]"
                />
              </svg>
            </div>
            {/* Flag */}
            <div className="absolute bottom-[52px] sm:bottom-[72px] left-[60%]">
              <div className="w-0.5 h-12 sm:h-16 bg-white/80" />
              <div className="absolute top-0 left-0.5 w-4 sm:w-5 h-3 sm:h-4 bg-gold rounded-sm" />
            </div>
            {/* Sun */}
            <div className="absolute top-4 sm:top-6 right-8 sm:right-16 w-10 sm:w-14 h-10 sm:h-14 rounded-full bg-gold/40 blur-sm" />
            <div className="absolute top-5 sm:top-7 right-9 sm:right-[68px] w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-gold/60" />
            {/* Sand trap */}
            <div className="absolute bottom-3 right-[20%] w-16 sm:w-24 h-4 sm:h-6 rounded-full bg-sand/50 blur-[1px]" />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  3. THE PROBLEM                                              */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28 bg-white" ref={problem.ref}>
        <div
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${
            problem.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
            Sound familiar?
          </h2>
          <p className="text-gray-500 mb-14 text-lg">Every golf trip starts with good intentions.</p>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-10 text-left">
            {[
              {
                icon: <MessageSquare className="w-7 h-7" />,
                text: 'The group text with 47 unread messages about which course to play.',
              },
              {
                icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>,
                text: 'The spreadsheet that one guy made and nobody looks at.',
              },
              {
                icon: <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
                text: 'The trip that "we should really plan soon" for the third year in a row.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-sand/40 rounded-2xl p-6 sm:p-8 border border-sand-dark/30 transition-all duration-700 ${
                  problem.isInView
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(i + 1) * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-forest/10 text-forest flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-14 text-xl sm:text-2xl font-display text-forest">
            TheCaddy.ai fixes this in one conversation.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  4. HOW IT WORKS                                             */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-sand-light" ref={howItWorks.ref}>
        <div
          className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
            howItWorks.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
              Three steps. Zero headaches.
            </h2>
            <p className="text-gray-500 text-lg">From idea to tee time in minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                icon: <MessageSquare className="w-8 h-8" />,
                title: 'Tell The Caddy about your trip',
                desc: 'Describe your destination, dates, group size, and budget in plain English. The AI handles the rest.',
              },
              {
                step: '02',
                icon: <Vote className="w-8 h-8" />,
                title: 'Your group votes',
                desc: 'Share a link. Everyone swipes yes or no on options. No app downloads, no sign-ups required.',
              },
              {
                step: '03',
                icon: <Lock className="w-8 h-8" />,
                title: 'Lock it in',
                desc: 'Book tee times, split costs, and collect dues. The trip is planned before anyone changes their mind.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative transition-all duration-700 ${
                  howItWorks.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(i + 1) * 150}ms` }}
              >
                {/* Connector line on desktop */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 -right-6 lg:-right-8 w-12 lg:w-16 border-t-2 border-dashed border-forest/20" />
                )}
                <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow h-full border border-gray-100">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-forest text-gold flex items-center justify-center shadow-md">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-display text-forest/15">{item.step}</span>
                  </div>
                  <h3 className="font-display text-xl text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  5. FEATURES GRID                                            */}
      {/* ============================================================ */}
      <section id="features" className="py-20 sm:py-28 bg-white" ref={features.ref}>
        <div
          className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
            features.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
              Everything your trip needs
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From the first idea to the last putt, The Caddy has you covered.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI Trip Planning',
                desc: 'Describe your dream trip in plain English. Get three curated options with real courses, real prices, and full itineraries.',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Group Voting',
                desc: 'Tinder-style swipe voting your group will actually use. No app downloads. Just send a link.',
              },
              {
                icon: <DollarSign className="w-6 h-6" />,
                title: 'Cost Splitting',
                desc: 'Collect dues without chasing Venmo requests. Everyone pays their share through one clean link.',
              },
              {
                icon: <MapPin className="w-6 h-6" />,
                title: 'Smart Matching',
                desc: 'Real courses, real prices, real availability. Matched to your group\'s budget and skill level.',
              },
              {
                icon: <CloudSun className="w-6 h-6" />,
                title: 'Weather Forecasting',
                desc: 'Know the forecast before you book. Plan around the weather, not the other way around.',
              },
              {
                icon: <Camera className="w-6 h-6" />,
                title: 'Trip Recap',
                desc: 'Scores, photos, and bragging rights after the round. A shareable memory page for the group.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`group bg-sand-light rounded-2xl p-6 sm:p-8 border border-sand-dark/20 hover:border-forest/20 hover:shadow-md transition-all duration-500 ${
                  features.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(i + 1) * 80}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-forest text-gold flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-display text-lg text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  6. SOCIAL PROOF                                             */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28 bg-forest text-white" ref={social.ref}>
        <div
          className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
            social.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Testimonials */}
          {/* TODO: Replace these placeholder testimonials with real user quotes */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                quote: 'I used to spend two weeks coordinating our annual trip. TheCaddy had it locked in before lunch.',
                name: 'Dave R.',
                role: 'Annual trip organizer, 12 players',
              },
              {
                quote: 'The swipe voting was genius. Everyone actually responded for once instead of ignoring the group text.',
                name: 'Mike T.',
                role: 'Scottsdale trip, 8 players',
              },
              {
                quote: 'Cost splitting alone is worth it. No more chasing guys for Venmo. Everyone paid before tee time.',
                name: 'Chris L.',
                role: 'Pinehurst trip, 6 players',
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`bg-white/[0.07] backdrop-blur-sm rounded-2xl p-8 border border-white/10 transition-all duration-700 ${
                  social.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(i + 1) * 150}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-sand/90 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-sand/60 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          {/* TODO: These stats are aspirational -- update with real metrics when available */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { value: '2,500+', label: 'Trips Planned' },
              { value: '12 min', label: 'Avg Planning Time' },
              { value: '98%', label: 'Group Satisfaction' },
            ].map((stat, i) => (
              <div key={i} className="text-center py-6">
                <p className="text-3xl sm:text-4xl font-display text-gold mb-1">{stat.value}</p>
                <p className="text-sand/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  7. PRICING                                                  */}
      {/* ============================================================ */}
      <section id="pricing" className="py-20 sm:py-28 bg-sand-light" ref={pricing.ref}>
        <div
          className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
            pricing.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4">
              Simple pricing for every foursome
            </h2>
            <p className="text-gray-500 text-lg">Start free. Upgrade when your crew demands more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            <PricingCard
              name="Free"
              price="$0"
              period="forever"
              features={[
                '1 trip plan per month',
                '3 AI-generated options',
                'Group voting link',
                'Basic course info',
              ]}
              cta="Get Started"
            />
            <PricingCard
              name="Pro"
              price="$9.99"
              period="/mo"
              featured
              features={[
                'Unlimited trips',
                'Real-time group voting',
                'Cost splitting + payment collection',
                'Weather forecasts',
                'Tee time availability check',
                'Email/SMS group notifications',
              ]}
              cta="Start Free Trial"
            />
            <PricingCard
              name="Captain"
              price="$19.99"
              period="/mo"
              features={[
                'Everything in Pro',
                'AI phone booking for old-school courses',
                'Multi-round trip planning',
                'Custom branded trip pages',
                'Post-trip scorecard + photos',
                'Priority support',
              ]}
              cta="Start Free Trial"
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  8. FAQ                                                      */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28 bg-white" ref={faq.ref}>
        <div
          className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
            faq.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl text-gray-900 mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="bg-sand-light rounded-2xl p-6 sm:p-10 border border-sand-dark/30">
            <FAQItem
              question="How does the AI know about golf courses?"
              answer="We maintain a curated database of top golf destinations across the US, including course details, pricing tiers, and quality ratings. The AI combines this data with your preferences to recommend the best options for your group."
            />
            <FAQItem
              question="What if a course doesn't have online booking?"
              answer="Our Captain tier includes AI-assisted phone booking for courses that don't offer online tee time reservations. We'll handle the old-school logistics so you don't have to."
            />
            <FAQItem
              question="Do my group members need to create accounts?"
              answer="No. Voting is completely account-free. Just share the link and your group can swipe through options on their phone. Only the trip organizer needs an account."
            />
            <FAQItem
              question="How does cost splitting work?"
              answer="Once the trip is locked in, you set each person's share and we generate individual payment links. Everyone pays through Stripe — secure, simple, and you never have to chase anyone down."
            />
            <FAQItem
              question="Can I use this for corporate outings?"
              answer="Absolutely. Our Captain and Enterprise tiers are built for corporate golf events, with custom branding, bulk booking, and expense-ready receipts."
            />
            <FAQItem
              question="What if I need to change the plan after voting?"
              answer="Plans aren't set in stone until you lock them. You can regenerate options, adjust the budget, or re-open voting at any point during the planning process."
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  9. FINAL CTA                                                */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28 bg-forest relative overflow-hidden" ref={finalCta.ref}>
        {/* Background accents */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold/[0.05] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div
          className={`relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${
            finalCta.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-6 leading-tight">
            Your next golf trip is{' '}
            <span className="text-gold">12&nbsp;minutes</span> away.
          </h2>
          <p className="text-sand/70 text-lg mb-10 max-w-xl mx-auto">
            Stop planning in group texts. Start planning with The Caddy.
          </p>
          <Link
            href="/trip"
            className="inline-flex items-center gap-2 bg-gold text-forest font-bold text-lg px-10 py-4 rounded-xl shadow-xl hover:bg-gold-light hover:shadow-2xl transition-all duration-200"
          >
            Start Planning &mdash; Free
          </Link>
          <p className="mt-6 text-sand/50 text-sm">No credit card required</p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  10. FOOTER                                                  */}
      {/* ============================================================ */}
      <footer className="bg-forest-dark text-sand/80 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Logo size="md" showText className="text-sand" />
              </div>
              <p className="text-sm text-sand/50 leading-relaxed max-w-xs">
                AI-powered golf trip planning. From the first idea to the first tee.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-sand text-sm uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2">
                {[
                  ['How It Works', '#how-it-works'],
                  ['Features', '#features'],
                  ['Pricing', '#pricing'],
                  ['Demo', '/demo-mobile'],
                ].map(([label, href]) => (
                  <li key={label}>
                    {href.startsWith('#') ? (
                      <button
                        onClick={() => scrollTo(href.slice(1))}
                        className="text-sm text-sand/60 hover:text-gold transition-colors"
                      >
                        {label}
                      </button>
                    ) : (
                      <Link href={href} className="text-sm text-sand/60 hover:text-gold transition-colors">
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sand text-sm uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2">
                {/* TODO: Create these pages */}
                {['About', 'Blog', 'Contact'].map((label) => (
                  <li key={label}>
                    <span className="text-sm text-sand/60 cursor-default">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sand text-sm uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2">
                {/* TODO: Create these pages */}
                {['Privacy Policy', 'Terms of Service'].map((label) => (
                  <li key={label}>
                    <span className="text-sm text-sand/60 cursor-default">{label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-sand/40">
                <a href="mailto:hello@thecaddy.ai" className="hover:text-gold transition-colors">
                  hello@thecaddy.ai
                </a>
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-sand/40">&copy; 2026 TheCaddy.ai. All rights reserved.</p>
            {/* Social links -- TODO: add real URLs */}
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'LinkedIn'].map((platform) => (
                <span
                  key={platform}
                  className="text-xs text-sand/40 hover:text-gold transition-colors cursor-default"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
