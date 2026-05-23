import React from 'react';
import logo from '../assets/images/landscape-white-text.png';

export default function Navbar({
  isScrolled,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setModalType
}) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 font-outfit ${
        isScrolled
          ? 'border-[#e4c37a]/15 bg-[#0a0a0c]/40 backdrop-blur-2xl py-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)]'
          : 'border-transparent bg-transparent py-6'
      }`}
    >
      <nav className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-8 md:px-16">
        {/* Brand Logo */}
        <a href="#top" className="flex items-center group transition-transform duration-300 hover:scale-[1.02]">
          <img src={logo} alt="Fehuvia Logo" className="h-8 md:h-9 object-contain" />
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-12 text-sm font-medium tracking-wider uppercase">
          <a
            href="#vision"
            className="text-white/70 hover:text-[#e4c37a] hover:gold-glow transition-all duration-300 relative py-2 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#e4c37a] hover:after:w-full after:transition-all after:duration-300"
          >
            About
          </a>
          <a
            href="#workflow"
            className="text-white/70 hover:text-[#e4c37a] hover:gold-glow transition-all duration-300 relative py-2 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#e4c37a] hover:after:w-full after:transition-all after:duration-300"
          >
            Product
          </a>
          <a
            href="#features"
            className="text-white/70 hover:text-[#e4c37a] hover:gold-glow transition-all duration-300 relative py-2 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-[#e4c37a] hover:after:w-full after:transition-all after:duration-300"
          >
            Features
          </a>
          
          <button
            onClick={() => setModalType('signup')}
            className="relative overflow-hidden rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:border-[#e4c37a] hover:text-[#e4c37a] hover:box-gold-glow cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white/80 hover:text-[#e4c37a] transition-colors focus:outline-none cursor-pointer"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-[77px] left-0 right-0 md:hidden bg-[#0a0a0b]/98 backdrop-blur-3xl border-b border-white/5 z-40 p-8 flex flex-col space-y-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
          <a
            href="#vision"
            className="text-lg font-medium tracking-wide hover:text-[#e4c37a] transition-colors border-b border-white/5 pb-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </a>
          <a
            href="#workflow"
            className="text-lg font-medium tracking-wide hover:text-[#e4c37a] transition-colors border-b border-white/5 pb-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Product
          </a>
          <a
            href="#features"
            className="text-lg font-medium tracking-wide hover:text-[#e4c37a] transition-colors border-b border-white/5 pb-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </a>
          <button
            onClick={() => {
              setModalType('signup');
              setIsMobileMenuOpen(false);
            }}
            className="bg-gold-metallic text-black font-semibold rounded-full py-3.5 tracking-wider uppercase text-sm shadow-xl"
          >
            Get Started
          </button>
        </div>
      )}
    </header>
  );
}
