import React from 'react';
import logo from '../assets/images/landscape-white-text.png';

export default function Footer({ footerRef, isVisible, onPageSelect }) {
  const handleLinkClick = (e, pageId) => {
    e.preventDefault();
    if (onPageSelect) {
      onPageSelect(pageId);
    }
  };

  return (
    <footer ref={footerRef} className="relative z-10 border-t border-white/5 bg-[#030304] px-8 md:px-16 py-20 snap-start font-outfit">

      {/* Grid columns */}
      <div className={`max-w-350 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 w-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

        {/* Brand block (Span 2) */}
        <div className={`md:col-span-2 flex flex-col items-start space-y-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <img src={logo} alt="Fehuvia" className="h-8 object-contain opacity-80" />
          <p className="text-xs text-white/40 max-w-sm leading-relaxed font-light">
            Algorithmic cashflow co-pilot forecasting liquidity paths and settling B2B invoices natively with cryptographic layer-2 finality on Morph.
          </p>
        </div>

        {/* Directory Column 1: System */}
        <div className={`flex flex-col space-y-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[#e4c37a]/80">System Navigation</h4>
          <div className="flex flex-col space-y-2.5 text-xs text-white/55 font-light">
            <a href="#vision" onClick={(e) => handleLinkClick(e, 'core-concept')} className="hover:text-[#e4c37a] transition-colors">Core Concept</a>
            <a href="#workflow" onClick={(e) => handleLinkClick(e, 'cfo-dashboard')} className="hover:text-[#e4c37a] transition-colors">CFO Dashboard</a>
            <a href="#features" onClick={(e) => handleLinkClick(e, 'protocol-specs')} className="hover:text-[#e4c37a] transition-colors">Protocol Specs</a>
            <a href="#architecture" onClick={(e) => handleLinkClick(e, 'architecture')} className="hover:text-[#e4c37a] transition-colors">System Architecture</a>
          </div>
        </div>

        {/* Directory Column 2: Resources */}
        <div className={`flex flex-col space-y-4 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[#e4c37a]/80">Resources</h4>
          <div className="flex flex-col space-y-2.5 text-xs text-white/55 font-light">
            <a href="#" onClick={(e) => handleLinkClick(e, 'documentation')} className="hover:text-[#e4c37a] transition-colors">Documentation</a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'developer-portal')} className="hover:text-[#e4c37a] transition-colors">Developer Portal</a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'smart-contracts')} className="hover:text-[#e4c37a] transition-colors">Smart Contracts</a>
            <a href="#" onClick={(e) => handleLinkClick(e, 'morph-explorer')} className="hover:text-[#e4c37a] transition-colors">Morph L2 Explorer</a>
          </div>
        </div>

        {/* Directory Column 3: Corporate */}
        <div className={`flex flex-col space-y-4 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-[#e4c37a]/80">Corporate</h4>
          <div className="flex flex-col space-y-2.5 text-xs text-white/55 font-light">
            <button type="button" disabled className="cursor-not-allowed text-white/20 transition-colors text-left">
              Security Audit
            </button>
            <button type="button" disabled className="cursor-not-allowed text-white/20 transition-colors text-left">
              Risk Parameters
            </button>
            <a href="#" onClick={(e) => handleLinkClick(e, 'terms-carriage')} className="hover:text-[#e4c37a] transition-colors">Terms of Carriage</a>
          </div>
        </div>

      </div>

      {/* Sub-footer details */}
      <div className={`max-w-350 mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col items-center justify-between gap-4 md:flex-row text-[10px] text-white/30 tracking-widest uppercase transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p>&copy; {new Date().getFullYear()} GEC5 - Fehuvia. All rights reserved on Morph Testnet.</p>
        <div className="flex space-x-6">
          <a href="#" onClick={(e) => handleLinkClick(e, 'privacy-charter')} className="hover:text-[#e4c37a] transition-colors">Privacy Charter</a>
          <a href="#" onClick={(e) => handleLinkClick(e, 'risk-warning')} className="hover:text-[#e4c37a] transition-colors">Risk Warning</a>
        </div>
      </div>

    </footer>
  );
}
