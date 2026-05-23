import React from 'react';
import heroImg from '../assets/images/hero-runestone.png';
import bgImg from '../assets/images/metallic-black-background.jpeg';

export default function Hero({ heroRef, setModalType, setView }) {
  return (
    <main
      id="top"
      ref={heroRef}
      className="relative z-10 flex flex-col justify-center px-8 md:px-16 pt-[100px] pb-24 min-h-[100svh] snap-start font-outfit"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)), url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Decorative Top and Bottom Shadows */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        
        {/* Left Side: signature Runestone with Floating Visual Elements */}
        <div className="hidden md:flex relative justify-center items-center h-full min-h-[450px]">
          {/* Subtle Glowing Background Aura */}
          <div className="absolute w-[350px] h-[350px] rounded-full bg-[#bf953f] opacity-[0.06] blur-[90px] pointer-events-none" />
          
          <img
            src={heroImg}
            alt="Fehuvia Runestone"
            className="w-full max-w-lg lg:max-w-xl object-contain z-10 drop-shadow-[0_0_50px_rgba(218,165,32,0.1)] animate-float-gentle"
            style={{ imageRendering: 'high-quality' }}
          />

          {/* Floating Context Card 1: Black Metallic Plate + Diagonal Chiseled Corners */}
          <div className="absolute -top-4 -right-2 plate-black-metallic shape-asymmetric-3 p-5 shadow-2xl z-20 flex items-center space-x-3.5 max-w-[240px] animate-float-gentle delay-700">
            <div className="h-9 w-9 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] text-[#e4c37a]/60 uppercase tracking-widest font-semibold font-outfit">Morph Settlement</p>
              <p className="text-sm font-bold text-white tracking-wider">USDC Paid T+0</p>
            </div>
          </div>

          {/* Floating Context Card 2: Gold Metallic Plate + Asymmetric Wedge Cuts */}
          <div className="absolute bottom-6 -left-6 plate-gold-metallic shape-asymmetric-4 p-5 shadow-2xl z-20 flex items-center space-x-3.5 max-w-[260px] animate-float-gentle-reverse">
            <div className="h-9 w-9 shrink-0 rounded-full bg-black/10 border border-black/20 flex items-center justify-center pulse-gold-dot">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h25a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-[9px] text-black/50 uppercase tracking-widest font-semibold font-outfit">AI Treasury Co-Pilot</p>
              <p className="text-sm font-black text-black tracking-wider">Runway Secured</p>
            </div>
          </div>
        </div>

        {/* Right Side: Title, Subtitle, and CTAs */}
        <div className="flex flex-col space-y-8 pl-0 md:pl-10 items-center md:items-start text-center md:text-left mt-6 md:mt-0 animate-fadeIn">
          
          <div className="flex items-center space-x-3">
            <div className="h-1.5 w-1.5 rounded-full bg-[#bf953f] animate-pulse" />
            <p className="text-[#e4c37a] text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase font-outfit">
              AUTOMATE LIQUIDITY & B2B OPERATIONS
            </p>
          </div>

          {/* Premium Dual Typography Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-left">
            <span className="font-cormorant text-5xl sm:text-6xl lg:text-7xl font-light italic block text-silver-metallic mb-1">
              Predictive Cashflow.
            </span>
            <span className="font-outfit font-extrabold text-gold-metallic tracking-tight uppercase text-3xl sm:text-4xl lg:text-5xl block">
              Instant B2B Settlements.
            </span>
          </h1>

          <p className="text-white/70 text-base md:text-lg max-w-xl leading-relaxed font-light mx-auto md:mx-0 font-outfit">
            Forecast your global 30-day runway with an AI treasury co-pilot and settle B2B invoice obligations instantly using stablecoins on the Morph network. Bypass traditional bank clearing delays.
          </p>

          {/* Luxury Action Buttons */}
          <div className="flex flex-wrap gap-5 pt-3 justify-center md:justify-start w-full">
            <button
              onClick={() => setModalType('signup')}
              className="bg-gold-metallic text-black font-bold uppercase tracking-wider text-xs rounded-full px-8 py-4 transition-all duration-300 shadow-[0_4px_25px_rgba(228,195,122,0.25)] hover:shadow-[0_8px_35px_rgba(228,195,122,0.45)] transform hover:-translate-y-0.5 cursor-pointer font-outfit"
            >
              Access Treasury
            </button>
            <button
              onClick={() => setModalType('login')}
              className="border border-white/25 hover:border-white text-white font-bold uppercase tracking-wider text-xs rounded-full px-8 py-4 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm transform hover:-translate-y-0.5 cursor-pointer font-outfit"
            >
              Executive Login
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
