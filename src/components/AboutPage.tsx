import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Sparkles, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp, 
  Bike, 
  Award, 
  Building2, 
  ArrowRight,
  MessageSquare,
  Users
} from 'lucide-react';
import { TabType } from './Navbar';

interface AboutPageProps {
  onNavigate: (tab: TabType) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const HAMDAN_WHATSAPP = '923036001701';
  const WHATSAPP_URL = `https://wa.me/${HAMDAN_WHATSAPP}?text=${encodeURIComponent('Hi Hamdan Mirza, I reviewed the goinfoEV platform and would like to connect!')}`;
  const HAMDAN_EMAIL = 'Hamdan7394@gmail.com';
  const ORINEX_EMAIL = 'info@orinexai.com';
  const ORINEX_URL = 'https://orinexai.com';

  const copyEmailToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="space-y-16 pb-12 animate-in fade-in duration-300">
      
      {/* ───────────────────────────────────────────────────────────
          HERO BANNER: MISSION & IDENTITY
      ──────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────
          HERO BANNER: MISSION & IDENTITY
      ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F5F8F6] border border-slate-200/90 text-[#071B2B] p-6 sm:p-10 lg:p-14 shadow-xs">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#16A36A]/12 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F0B429]/12 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#071B2B] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#16A36A]" />
            <span>Pakistan EV Intelligence Suite</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-[#071B2B]">
            Democratizing <span className="text-[#16A36A]">Electric Vehicle</span> Intelligence Across Pakistan
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            With petrol prices soaring and urban air quality deteriorating, Pakistan's two-wheeler commuter economy is ready for a historic transition. <strong>goinfoEV</strong> was created to eliminate guesswork, debunk range myths, and provide mathematical accuracy for every rider, student, family, and delivery worker.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <button
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A36A] hover:bg-[#138e5b] text-white font-extrabold transition-all shadow-xs cursor-pointer"
            >
              <span>Explore 38+ EV Fleet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#071B2B] border border-slate-300 font-extrabold transition-all shadow-xs cursor-pointer"
            >
              <span>Contact Hamdan Mirza</span>
            </a>
          </div>
        </div>

        {/* Quick Numbers Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-200/90 relative z-10">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-[#16A36A]">38+</div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">Electric Bike Models</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-blue-600">15</div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">Verified Brands</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-amber-600">100%</div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">Free Public Access</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-2xl sm:text-3xl font-black text-teal-600">NEPRA</div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">Dynamic Tariff Engines</div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          SECTION 2: LEAD CREATOR & TECH PARTNERSHIP
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            People & Technology
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            The Vision Behind goinfoEV
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Built with dedication for Pakistani consumers, gig-economy workers, and green mobility advocates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Hamdan Mirza Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">
                    HM
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Hamdan Mirza</h3>
                  <p className="text-xs font-semibold text-blue-600">Lead Designer, Developer & Founder</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Full-Stack Architect & Clean Tech Enthusiast</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                Hamdan Mirza conceptualized and engineered goinfoEV from the ground up to solve a fundamental problem in Pakistan: <span className="text-slate-900 font-semibold">a lack of transparent, trustworthy data regarding electric two-wheelers.</span> From designing the mathematical algorithms simulating battery degradation in 45°C summers to crafting the responsive user experience, Hamdan aims to spearhead sustainable mobility intelligence.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive Real-World Range Simulation Engine</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gig Economy Delivery Rider ROI Calculator (Bykea / Indrive / Foodpanda)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NEPRA Dynamic Peak & Off-Peak Electricity Cost Modeling</span>
                </div>
              </div>
            </div>

            {/* Direct Contacts */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.861.821 2.796.821h.005c3.179 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.768-5.773-5.768zm3.385 8.165c-.14.394-.716.748-1.026.797-.282.045-.648.077-2.083-.518-1.835-.761-3.003-2.617-3.094-2.738-.091-.121-.741-.986-.741-1.88 0-.895.469-1.336.636-1.517.167-.181.365-.227.487-.227.121 0 .243.002.349.007.112.005.263-.042.411.314.152.365.517 1.26.562 1.352.045.091.076.197.015.318-.061.121-.091.197-.182.303-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.011 1.258.697.621 1.285.813 1.468.904.182.091.289.076.395-.045.106-.121.456-.53.578-.712.121-.182.243-.152.41-.091.167.061 1.063.501 1.246.592.182.091.304.137.349.213.045.076.045.44-.095.834zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.98-1.385C8.423 21.503 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                <span>WhatsApp: +92 303 6001701</span>
              </a>

              <a
                href={`mailto:${HAMDAN_EMAIL}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{HAMDAN_EMAIL}</span>
              </a>
            </div>
          </div>

          {/* OrinexAI Partnership Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/20">
                    OAI
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">OrinexAI</h3>
                    <p className="text-xs font-semibold text-cyan-400">Artificial Intelligence & Technology Partner</p>
                    <p className="text-[11px] text-slate-400">orinexai.com</p>
                  </div>
                </div>

                <a
                  href={ORINEX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Visit OrinexAI Website"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                <strong>OrinexAI</strong> powers cutting-edge data models, artificial intelligence agents, and predictive computational engines. Through our collaboration with goinfoEV, OrinexAI supports machine learning frameworks that model real-world battery discharge profiles, solar output forecasts across provincial climate zones, and urban logistics optimization.
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Predictive Degradation Models for Extreme Heat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Solar PV Yield Algorithms for Punjab, Sindh & KPK</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Enterprise Fleet Analytics & Carbon Reduction Auditing</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <a
                href={`mailto:${ORINEX_EMAIL}`}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>info@orinexai.com</span>
              </a>

              <a
                href={ORINEX_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-cyan-400 hover:underline"
              >
                <span>Visit Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          SECTION 3: OUR SCIENTIFIC & COMPUTATIONAL METHODOLOGY
      ──────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Technical Integrity
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            How Our Calculators Work
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Unlike manufacturer claims that test bikes on flat treadmills at 20 km/h with 50kg riders, goinfoEV applies Pakistani reality benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">NEPRA Electricity Modeling</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We track official WAPDA, LESCO, K-Electric, and FESCO tariff notifications including Peak (5 PM – 11 PM) vs Off-Peak rates, Fuel Price Adjustments (FPA), and electricity slab increments.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Battery Chemistry Degradation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our battery algorithms differentiate between Lithium Iron Phosphate (LiFePO4 ~2000 cycles), Ternary NMC (~1000 cycles), and Graphene Lead-Acid (~400 cycles) with thermal degradation factors for 42°C+ summer heat.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-base">Pakistani Road & Load Realism</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              We apply dynamic drag coefficients for pillion riders, cargo delivery box wind resistance, broken asphalt, and frequent stop-and-go throttling typical of Lahore, Karachi, and Faisalabad traffic.
            </p>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          SECTION 4: CONTACT & COLLABORATION FORM
      ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 border border-blue-800/60 px-3 py-1 rounded-full">
            Get In Touch
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Have Feedback, an EV Spec Correction, or a Partnership Proposal?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Whether you are an EV dealership wanting your bikes benchmarked, a researcher analyzing green transport, or an enthusiast with ideas, we'd love to hear from you.
          </p>

          <div className="space-y-3 pt-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">WhatsApp Fast Response</div>
                <div className="text-slate-400">+92 303 6001701</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">Direct Emails</div>
                <div className="text-slate-400">Hamdan7394@gmail.com • info@orinexai.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Contact Form */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 p-5 sm:p-6 rounded-2xl">
          {formSubmitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Thank you for reaching out!</h4>
              <p className="text-xs text-slate-400">Your message has been logged. Hamdan Mirza will respond shortly via email/WhatsApp.</p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ali Ahmed"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Email or WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. yourname@gmail.com or +92 300 1234567"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Inquiry</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Model Spec Correction or Collaboration"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your suggestions, question, or message..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};
