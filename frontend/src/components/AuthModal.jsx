import React from 'react';

export default function AuthModal({ modalType, setModalType, setView }) {
  if (modalType === 'none') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setView('dashboard');
    setModalType('none');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit">
      
      {/* Modal Dialog Body */}
      <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.9)] relative animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={() => setModalType('none')}
          className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Title */}
        <h2 className="font-cormorant text-3xl font-light tracking-wide text-white mb-2">
          {modalType === 'login' ? 'Welcome back' : 'Inquire Access'}
        </h2>
        <p className="text-white/40 text-xs md:text-sm font-light mb-8">
          {modalType === 'login'
            ? 'Connect credentials to review your cashflow runway.'
            : 'Register your credentials to begin AI forecasting and Morph settlements.'}
        </p>

        {/* Form Inputs */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 transition-all font-light text-sm"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 transition-all font-light text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {modalType === 'signup' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">
                Settlement Stablecoin Wallet
              </label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 transition-all font-light text-sm font-mono"
                placeholder="0x..."
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 mt-6 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-300 shadow-xl"
          >
            {modalType === 'login' ? 'Access Account' : 'Request Registry'}
          </button>
        </form>

        {/* Modal Switch link */}
        <div className="mt-6 text-center text-xs text-white/40 font-light">
          {modalType === 'login' ? "Don't have an enterprise profile? " : 'Already registered? '}
          <button
            onClick={() => setModalType(modalType === 'login' ? 'signup' : 'login')}
            className="text-white hover:text-[#e4c37a] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
          >
            {modalType === 'login' ? 'Request Inquire' : 'Executive Login'}
          </button>
        </div>

      </div>
    </div>
  );
}
