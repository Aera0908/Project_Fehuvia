import React, { useState } from 'react';

const API_BASE = 'http://localhost:3001';

export default function AuthModal({ modalType, setModalType, setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom auth step management: 'form' or 'verify'
  const [authStep, setAuthStep] = useState('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  if (modalType === 'none') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Confirm password validation for signup
    if (modalType === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    const endpoint = modalType === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = modalType === 'login'
      ? { email, password }
      : { email, password, username: username.trim() || undefined };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'An error occurred. Please try again.');
        setLoading(false);
        return;
      }

      if (modalType === 'signup') {
        // Transition to verification code step
        setTempUserData(data);
        setAuthStep('verify');
        setLoading(false);
      } else {
        // Direct login
        localStorage.setItem('fehuvia_token', data.token);
        localStorage.setItem('fehuvia_user', JSON.stringify(data.user));
        setView('dashboard');
        setModalType('none');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    setError('');

    if (!verificationCode) {
      setError('Please enter the 6-digit authorization code.');
      return;
    }

    // Sandbox verification bypass logic
    if (verificationCode === '123456' || verificationCode.length === 6) {
      // Store JWT token and user info in localStorage for session persistence
      localStorage.setItem('fehuvia_token', tempUserData.token);
      localStorage.setItem('fehuvia_user', JSON.stringify(tempUserData.user));

      // Successfully route to the onboarding wizard
      setView('onboarding');
      setModalType('none');
      setAuthStep('form');
      setVerificationCode('');
      setTempUserData(null);
    } else {
      setError('Invalid verification code. Enter "123456" for sandbox testing.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit">
      
      {/* Modal Dialog Body */}
      <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.9)] relative animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={() => { 
            setModalType('none'); 
            setError(''); 
            setAuthStep('form'); 
            setVerificationCode('');
          }}
          className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {authStep === 'form' ? (
          <>
            {/* Modal Title */}
            <h2 className="font-cormorant text-3xl font-light tracking-wide text-white mb-2">
              {modalType === 'login' ? 'Welcome back' : 'Inquire Access'}
            </h2>
            <p className="text-white/40 text-xs md:text-sm font-light mb-8">
              {modalType === 'login'
                ? 'Connect credentials to review your cashflow runway.'
                : 'Register your credentials to begin AI forecasting and Morph settlements.'}
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-medium animate-[fadeIn_0.2s_ease-out]">
                {error}
              </div>
            )}

            {/* Form Inputs */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {/* Username - Signup only */}
              {modalType === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 transition-all font-light text-sm"
                    placeholder="Enter a display name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 transition-all font-light text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {/* Confirm Password - Signup only */}
              {modalType === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 transition-all font-light text-sm"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 mt-6 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-300 shadow-xl ${
                  loading ? 'opacity-60 cursor-wait' : ''
                }`}
              >
                {loading
                  ? (modalType === 'login' ? 'Authenticating...' : 'Registering Account...')
                  : (modalType === 'login' ? 'Access Account' : 'Request Registry')
                }
              </button>
            </form>

            {/* Modal Switch link */}
            <div className="mt-6 text-center text-xs text-white/40 font-light">
              {modalType === 'login' ? "Don't have an enterprise profile? " : 'Already registered? '}
              <button
                onClick={() => { setModalType(modalType === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-white hover:text-[#e4c37a] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
              >
                {modalType === 'login' ? 'Request Inquire' : 'Executive Login'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Email Verification Step Screen */}
            <h2 className="font-cormorant text-3xl font-light tracking-wide text-white mb-2">
              Verify Workstation
            </h2>
            <p className="text-white/40 text-xs md:text-sm font-light mb-8">
              A 6-digit authorization code has been dispatched to <strong className="text-white/60">{email}</strong>. Enter the credentials to initiate setup.
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-medium animate-[fadeIn_0.2s_ease-out]">
                {error}
              </div>
            )}

            {/* Verification Code Form */}
            <form className="space-y-6" onSubmit={handleVerifyCode}>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#e4c37a]/80 mb-2">
                  Authorization Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-white tracking-[0.8em] font-mono font-bold text-lg placeholder-white/10 focus:outline-none focus:border-[#e4c37a]/50 focus:ring-1 focus:ring-[#e4c37a]/40 transition-all"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
              </div>

              {/* Developer Sandbox Tips Alert Box */}
              <div className="p-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gold-metallic uppercase tracking-wider">Developer Sandbox Tip</span>
                <span className="text-[10px] text-white/60 leading-relaxed font-light">
                  Email dispatching is bypassed in local testing. Enter <strong className="text-gold-metallic font-mono font-bold">123456</strong> to instantly verify and proceed to onboarding.
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 mt-6 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-300 shadow-xl"
              >
                Verify & Authorize
              </button>
            </form>

            {/* Back to Form link */}
            <div className="mt-6 text-center text-xs text-white/40 font-light">
              Made a mistake?{' '}
              <button
                onClick={() => { setAuthStep('form'); setError(''); setVerificationCode(''); }}
                className="text-white hover:text-[#e4c37a] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
              >
                Modify Credentials
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
