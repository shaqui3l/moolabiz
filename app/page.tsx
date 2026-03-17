import Link from "next/link";

const features = [
  {
    icon: "🤖",
    title: "24/7 AI Assistant",
    desc: "Never miss an order or inquiry. Your bot works while you sleep.",
  },
  {
    icon: "🌍",
    title: "African Languages",
    desc: "Responds in Zulu, Xhosa, Afrikaans, Sesotho & English automatically.",
  },
  {
    icon: "📦",
    title: "Order Management",
    desc: "Customers browse, order and pay – all via WhatsApp. No app needed.",
  },
  {
    icon: "📅",
    title: "Appointments",
    desc: "Automatic booking, confirmations and reminders for your clients.",
  },
  {
    icon: "💬",
    title: "Morning Reports",
    desc: "Wake up to a summary of overnight orders and revenue on WhatsApp.",
  },
  {
    icon: "📊",
    title: "Simple Dashboard",
    desc: "Track sales, customers and growth from any phone or browser.",
  },
];

const testimonials = [
  {
    name: "Zanele M.",
    business: "Hair Braiding – Soweto",
    quote:
      "Before MoolaBiz I missed bookings all the time. Now my bot handles everything while I braid!",
  },
  {
    name: "Sipho K.",
    business: "Spaza Shop – Khayelitsha",
    quote:
      "My customers order on WhatsApp in Xhosa. I just pack and deliver. Yoh, this thing is amazing!",
  },
  {
    name: "Fatima A.",
    business: "Catering – Durban",
    quote:
      "R149 a month? I make that back in one extra order. Best business decision I made.",
  },
];

const plans = [
  {
    name: "Basic",
    price: "R149",
    period: "/month",
    color: "border-brand-green",
    badge: null,
    features: [
      "24/7 WhatsApp bot",
      "AI language detection",
      "Order management",
      "Appointment booking",
      "Morning summary reports",
      "Up to 500 messages/month",
    ],
  },
  {
    name: "Growth",
    price: "R299",
    period: "/month",
    color: "border-brand-dark",
    badge: "Most Popular",
    features: [
      "Everything in Basic",
      "Payment integration",
      "Advanced analytics",
      "Unlimited messages",
      "Priority support",
      "Custom bot personality",
    ],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-xl font-bold text-brand-dark">MoolaBiz</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm text-gray-600">
          <a href="#features" className="hover:text-brand-dark transition-colors">Features</a>
          <a href="#pricing" className="hover:text-brand-dark transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-brand-dark transition-colors">Stories</a>
        </div>
        <a
          href="#pricing"
          className="bg-brand-green text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          Get Started
        </a>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-dark via-[#128C7E] to-brand-green text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-6">
            <span>🇿🇦</span> Built for South African informal traders
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Your Business on WhatsApp,{" "}
            <span className="text-brand-light">24/7 – No Sleep Needed</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            MoolaBiz gives spaza shops, hair braiders, caterers and every hustler
            a smart WhatsApp bot that takes orders, books appointments and answers
            customers — in their language — while you focus on your work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="bg-white text-brand-dark font-bold px-8 py-4 rounded-full text-lg hover:bg-brand-light transition-colors"
            >
              Start Free Trial →
            </a>
            <a
              href="https://wa.me/27000000000?text=Hi%2C%20I%20want%20to%20set%20up%20my%20MoolaBiz%20bot"
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full text-lg hover:bg-white/10 transition-colors"
            >
              💬 Chat on WhatsApp
            </a>
          </div>
          <p className="mt-6 text-white/70 text-sm">
            No app download needed · Setup in under 5 minutes · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Social proof strip ─────────────────────────────── */}
      <div className="bg-brand-light border-y border-brand-green/20 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-brand-dark font-semibold">
          <span>✅ 1,200+ businesses live</span>
          <span>✅ 50,000+ messages handled monthly</span>
          <span>✅ Works in 5 African languages</span>
          <span>✅ No tech skills needed</span>
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything your business needs on WhatsApp
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From spaza shops to salons — if you serve customers, MoolaBiz can
              automate it.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-14">
            Up and running in 3 steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "WhatsApp us",
                desc: "Send us a message to start your free setup. No forms, no tech knowledge needed.",
              },
              {
                step: "2",
                title: "Tell us about your business",
                desc: "Share your products, prices and hours – just type it naturally in WhatsApp.",
              },
              {
                step: "3",
                title: "Your bot goes live",
                desc: "Share your WhatsApp number and customers can start ordering immediately.",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-brand-green text-white text-2xl font-extrabold flex items-center justify-center mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section id="testimonials" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
            Real traders, real results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-brand-light rounded-2xl p-6 border border-brand-green/20"
              >
                <p className="text-gray-700 italic mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-brand-dark">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Honest pricing, no surprises
          </h2>
          <p className="text-gray-500 mb-14">
            Start free for 14 days. No credit card required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border-2 ${plan.color} p-8 shadow-sm`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-brand-dark">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 mb-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 text-left mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-brand-green mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`https://wa.me/27000000000?text=I%20want%20the%20${plan.name}%20plan`}
                  className="block w-full text-center bg-brand-green text-white font-bold py-3 rounded-full hover:bg-brand-dark transition-colors"
                >
                  Start Free Trial
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="bg-brand-dark text-white py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to grow your business?
        </h2>
        <p className="text-white/80 mb-8 max-w-xl mx-auto">
          Join over 1,200 traders already using MoolaBiz to earn more and work smarter.
        </p>
        <a
          href="https://wa.me/27000000000?text=Hi%2C%20I%20want%20to%20set%20up%20my%20MoolaBiz%20bot"
          className="inline-block bg-brand-green text-white font-bold px-10 py-4 rounded-full text-lg hover:bg-green-500 transition-colors"
        >
          💬 Start on WhatsApp Now
        </a>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">💰</span>
          <span className="font-semibold text-gray-600">MoolaBiz</span>
        </div>
        <p>© {new Date().getFullYear()} MoolaBiz. Built with ❤️ in South Africa.</p>
        <p className="mt-1">
          <a href="/dashboard" className="hover:underline">
            Business Login
          </a>
        </p>
      </footer>
    </div>
  );
}
