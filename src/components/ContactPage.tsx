import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  User,
  Building,
  Check
} from 'lucide-react';
import { TabType } from './Navbar';

interface ContactPageProps {
  onNavigate: (tab: TabType) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [copied, setCopied] = useState(false);
  const [mailtoLink, setMailtoLink] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const PRIMARY_EMAIL = 'Hamdan7394@gmail.com';
  const SECONDARY_EMAIL = 'info@orinexai.com';
  const WHATSAPP_NUMBER = '+923036001701';
  const WHATSAPP_LINK = `https://wa.me/923036001701?text=${encodeURIComponent('Assalam-o-Alaikum Hamdan, I visited goinfoEV and would like to get in touch regarding EV Pakistan.')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    const generatedRef = 'EV-PK-' + Math.floor(100000 + Math.random() * 900000);
    
    // WhatsApp direct message text formatted with all form details
    const whatsappMessage = `*New EV Inquiry from goinfoEV Pakistan*
Reference: #${generatedRef}

*Name:* ${formData.name}
*Email:* ${formData.email}
*Phone:* ${formData.phone || 'Not provided'}
*Topic:* ${formData.subject}

*Message:*
${formData.message}

---
_Sent via goinfoEV Contact Form_`;

    const whatsappDirectUrl = `https://wa.me/923036001701?text=${encodeURIComponent(whatsappMessage)}`;

    const fallbackMailto = `mailto:${PRIMARY_EMAIL}?cc=${SECONDARY_EMAIL}&subject=${encodeURIComponent(
      `[goinfoEV Inquiry #${generatedRef}] ${formData.subject}`
    )}&body=${encodeURIComponent(
      `Hi Hamdan & Team,\n\nName: ${formData.name}\nPhone: ${formData.phone || 'N/A'}\nEmail: ${formData.email}\nReference: #${generatedRef}\n\nMessage:\n${formData.message}\n\n---\nSent via goinfoEV Pakistan Contact Portal`
    )}`;

    try {
      // Also log/save in background server
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(err => console.warn('Background server log:', err));

      setReferenceId(generatedRef);
      setMailtoLink(fallbackMailto);
      setSubmitted(true);

      // Directly open Hamdan's WhatsApp with full message prefilled!
      if (typeof window !== 'undefined') {
        const opened = window.open(whatsappDirectUrl, '_blank', 'noopener,noreferrer');
        // If popup was blocked or inside restricted iframe, fallback to direct location or user button
        if (!opened) {
          window.location.href = whatsappDirectUrl;
        }
      }
    } catch (err: any) {
      console.warn('Submission handler error:', err);
      setReferenceId(generatedRef);
      setMailtoLink(fallbackMailto);
      setSubmitted(true);
      if (typeof window !== 'undefined') {
        window.location.href = whatsappDirectUrl;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    if (referenceId) {
      navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300">
      
      {/* ───────────────────────────────────────────────────────────
          HERO BANNER
      ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Connect with the Team</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Get in Touch with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">goinfoEV</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Have questions about EV calculations, want your electric bike brand or dealership listed, or looking to collaborate on green mobility across Pakistan? We respond rapidly.
          </p>

          {/* Quick Contact Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Direct WhatsApp: +92 303 6001701</span>
            </a>
            <a
              href="mailto:Hamdan7394@gmail.com?subject=goinfoEV%20Inquiry"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Hamdan7394@gmail.com</span>
            </a>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────
          CONTACT INFORMATION & FORM GRID
      ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Direct Details & Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Hamdan Mirza - Creator */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                HM
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Hamdan Mirza</h3>
                <p className="text-xs text-slate-500 font-medium">Founder &amp; Full-Stack Architect</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Leading the algorithmic design, real-world data collection, and local consumer research for electric mobility in Pakistan.
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">+92 303 6001701</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">WhatsApp</span>
              </a>

              <a 
                href="mailto:Hamdan7394@gmail.com"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold truncate max-w-[200px]">Hamdan7394@gmail.com</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Email</span>
              </a>
            </div>
          </div>

          {/* Card 2: Tech Partner - OrinexAI */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                OX
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">OrinexAI</h3>
                <p className="text-xs text-slate-500 font-medium">Technology &amp; Cloud Platform Partner</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Providing enterprise infrastructure, high-throughput simulation engines, and intelligent computational models.
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <a 
                href="mailto:info@orinexai.com"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-cyan-600" />
                  <span className="font-semibold">info@orinexai.com</span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-full">Partner Support</span>
              </a>

              <a 
                href="https://orinexai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-slate-600" />
                  <span className="font-semibold">orinexai.com</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Card 3: Regional Coverage */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-3.5">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>National Operations Coverage</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our battery degradation and tariff engines natively cover utility grids and terrain across all major metropolitan hubs:
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">Lahore (LESCO)</span>
              <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">Karachi (K-Electric)</span>
              <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">Islamabad / Pindi (IESCO)</span>
              <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">Faisalabad (FESCO)</span>
              <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">Multan (MEPCO)</span>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Send Message Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Send Us a Message
                    </h3>
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Direct to Hamdan's WhatsApp (+92 303 6001701)</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Submit kartay hi aapka message seedha Hamdan ke official WhatsApp aur dono support inboxes par deliver ho jayega:
                  </p>
                  
                  {/* WhatsApp + Email Badges */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>WhatsApp: +92 303 6001701</span>
                      <span className="text-[9px] uppercase font-bold bg-emerald-200/80 text-emerald-900 px-1 py-0.2 rounded">Instant</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/70 text-blue-800 text-[11px] font-semibold">
                      <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>Hamdan7394@gmail.com</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-800 text-[11px] font-semibold">
                      <Mail className="w-3 h-3 text-indigo-600 shrink-0" />
                      <span>info@orinexai.com</span>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                    {submitError}
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Muhammad Ali"
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ali@gmail.com"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Phone or WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 0300 1234567"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Subject Topic */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="General Inquiry">General EV Inquiry</option>
                      <option value="EV Brand Listing">List My EV Brand / Showroom</option>
                      <option value="Calculator Feedback">Calculator / Mathematical Feedback</option>
                      <option value="Commercial / Gig Fleet">Commercial &amp; Gig Delivery Fleet</option>
                      <option value="Partnership / Media">Media &amp; Partnership Proposal</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Message Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry, vehicle model, dealership, or calculation suggestion..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Opening WhatsApp (+92 303 6001701)...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 fill-white" />
                      <span>Send Direct to WhatsApp (+92 303 6001701)</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Form submit karte hi pre-filled chat aapke WhatsApp par Hamdan (+92 303 6001701) ke sath khul jayegi.
                </p>
              </form>
            ) : (
              /* Success confirmation state */
              <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    ✓ Form Submitted &amp; WhatsApp Opened
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    Inquiry Sent to WhatsApp!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Shukriya <strong>{formData.name}</strong>. Aapka message direct Hamdan ke WhatsApp (+92 303 6001701) ke liye ready ho chuka hai.
                  </p>
                </div>

                {/* Direct WhatsApp Big Card */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2.5 shadow-sm">
                  <div className="text-xs font-bold text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Direct WhatsApp Dispatch:</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">+92 303 6001701</span>
                  </div>
                  
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Agar WhatsApp chat automatically open nahi hui, to neeche diye gaye green button par click karein taake message direct Hamdan ko send ho jaye:
                  </p>
                </div>

                {/* Reference ID badge */}
                <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs">
                  <span className="text-slate-500 font-medium">Tracking Code:</span>
                  <span className="font-mono font-bold text-blue-700">{referenceId}</span>
                  <button
                    onClick={handleCopyRef}
                    className="ml-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 cursor-pointer"
                  >
                    {copied ? <span className="text-emerald-600">Copied!</span> : 'Copy'}
                  </button>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/923036001701?text=${encodeURIComponent(
                      `*New EV Inquiry from goinfoEV*\nTracking: #${referenceId}\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Phone:* ${formData.phone || 'Not provided'}\n*Topic:* ${formData.subject}\n\n*Message:*\n${formData.message}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    <span>Open WhatsApp Chat with Hamdan</span>
                  </a>

                  {mailtoLink && (
                    <a
                      href={mailtoLink}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Send via Email Also</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer border border-slate-200"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────────
          FREQUENT TOPICS ACCORDION / HELP
      ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-100/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Need Quick Answers?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Check out our interactive knowledge base or jump straight into the calculators.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('content')}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <span>EV Buyer's Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('blogs')}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <span>Read Blogs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
