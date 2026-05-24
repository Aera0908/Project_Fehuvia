import React, { useState } from 'react';
import { Mail, Shield, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Treasury Operations',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate premium encrypted secure transmission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <section
      id="contact"
      className="relative z-10 px-8 md:px-16 py-28 min-h-screen snap-start flex items-center justify-center bg-[#050507] overflow-hidden font-outfit"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(228, 195, 122, 0.08), rgba(0, 0, 0, 0.96)), radial-gradient(circle at top right, rgba(228, 195, 122, 0.08), transparent 35%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.03), transparent 25%)',
      }}
    >
      <div className="max-w-[1400px] mx-auto w-full relative z-10">

        {/* Dynamic Dual Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* Left Column: Context & Secure Channels */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold tracking-[0.3em] uppercase block mb-3 drop-shadow-[0_0_10px_rgba(228,195,122,0.3)]">
                Secure Channels
              </span>
              <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-light leading-tight tracking-tight text-white">
                Connect with our <span className="italic text-gold-metallic">treasury desk</span>.
              </h2>
              <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-[#e4c37a] to-transparent my-6" />
              <p className="text-white/55 leading-relaxed text-base font-light">
                Fehuvia runs an elite, highly responsive operations desk. Reach out to coordinate custom liquidity trials, institutional API access, or general partnership opportunities.
              </p>
            </div>

            {/* Information Cards */}
            <div className="space-y-6">

              <div className="plate-black-metallic shape-asymmetric-3 p-5 flex items-start gap-4 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="w-10 h-10 rounded-xl border border-[#e4c37a]/20 bg-[#e4c37a]/5 flex items-center justify-center text-[#e4c37a] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-1">Direct Secure Mail</h4>
                  <a href="mailto:ops@fehuvia.com" className="text-sm font-semibold text-white hover:text-[#e4c37a] transition-colors">
                    ops@fehuvia.com
                  </a>
                </div>
              </div>

              <div className="plate-black-metallic shape-asymmetric-3 p-5 flex items-start gap-4 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="w-10 h-10 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-emerald-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-1">Cryptographic Operations</h4>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    fehuvia.eth • morph-mainnet
                  </span>
                </div>
              </div>

              <div className="plate-black-metallic shape-asymmetric-3 p-5 flex items-start gap-4 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                <div className="w-10 h-10 rounded-xl border border-sky-500/20 bg-sky-500/5 flex items-center justify-center text-sky-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-1">Operations Hub</h4>
                  <span className="text-sm font-semibold text-white">
                    Metro Manila, Philippines
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7 w-full">
            {!isSubmitted ? (
              <form
                onSubmit={handleSubmit}
                className="plate-black-metallic shape-asymmetric-3 p-8 md:p-10 border border-white/10 relative overflow-hidden flex flex-col gap-6"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(228,195,122,0.03),transparent_35%)] pointer-events-none" />

                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Inquire Securely
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-xs uppercase tracking-wider text-white/40 font-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      placeholder="e.g. Alexander Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-all duration-300 focus:outline-none focus:border-[#e4c37a]/50 focus:bg-white/5 focus:shadow-[0_0_15px_rgba(228,195,122,0.05)]"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs uppercase tracking-wider text-white/40 font-semibold">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="alexander@firm.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-all duration-300 focus:outline-none focus:border-[#e4c37a]/50 focus:bg-white/5 focus:shadow-[0_0_15px_rgba(228,195,122,0.05)]"
                    />
                  </div>
                </div>

                {/* Dropdown Selector */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-xs uppercase tracking-wider text-white/40 font-semibold">
                    Inquiry Subject
                  </label>
                  <div className="relative">
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-[#e4c37a]/50 focus:bg-[#0a0a0c] appearance-none cursor-pointer"
                    >
                      <option className="bg-[#0e0e11] text-white" value="Treasury Operations">Custom Treasury Integration</option>
                      <option className="bg-[#0e0e11] text-white" value="Partnerships">Institutional Partnership</option>
                      <option className="bg-[#0e0e11] text-white" value="Developer API">Developer & API Access</option>
                      <option className="bg-[#0e0e11] text-white" value="General Inquiry">General Operational Inquiry</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-xs uppercase tracking-wider text-white/40 font-semibold">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows="4"
                    placeholder="Provide details on your treasury requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 transition-all duration-300 focus:outline-none focus:border-[#e4c37a]/50 focus:bg-white/5 focus:shadow-[0_0_15px_rgba(228,195,122,0.05)] resize-none"
                  />
                </div>

                {/* Secure Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 relative overflow-hidden rounded-xl bg-gold-metallic text-black font-semibold py-3.5 tracking-wider uppercase text-xs shadow-xl hover:box-gold-glow transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Encrypting Transmission...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Secure Dispatch Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div
                className="plate-black-metallic shape-asymmetric-3 p-8 md:p-12 border border-white/10 relative overflow-hidden flex flex-col items-center text-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-[fadeIn_0.5s_ease-out]"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#e4c37a]/10 border border-[#e4c37a]/30 flex items-center justify-center text-[#e4c37a] mb-2 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight font-outfit">
                    Transmission Authenticated
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed mt-3 max-w-md font-light">
                    Your inquiry from <span className="font-bold underline text-[#e4c37a]">{formData.email}</span> has been securely dispatched. Our treasury operations desk will review and initiate contact shortly.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormData({ name: '', email: '', subject: 'Treasury Operations', message: '' });
                    setIsSubmitted(false);
                  }}
                  className="mt-4 bg-gold-metallic text-black font-semibold rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:box-gold-glow transition-all duration-300 cursor-pointer"
                >
                  New Transmission
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
