import React, { useState } from 'react'
import logo from './assets/images/landscape-white-text.png'
import heroImg from './assets/images/hero-runestone.png'
import bgImg from './assets/images/metallic-black-background.jpeg'

function App() {
  const [modalType, setModalType] = useState('none') // 'none', 'login', 'signup'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div 
      className="min-h-screen text-white font-sans bg-black flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Navbar */}
      <nav className="relative z-50 flex justify-between items-center px-8 md:px-16 py-6 w-full">
        <div className="flex items-center">
          <img src={logo} alt="Fehuvia Logo" className="h-8 md:h-10 object-contain" />
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-10 items-center text-sm md:text-base font-medium">
          <a href="#" className="hover:text-gray-300 transition-colors">About</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Product</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Features</a>
          <button 
            onClick={() => setModalType('signup')}
            className="border border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition-all duration-300"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Burger Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white hover:text-[#39FF14] transition-colors"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[88px] left-0 right-0 bg-[#121212]/95 backdrop-blur-3xl border-b border-white/10 z-40 p-8 flex flex-col space-y-6 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
          <a href="#" className="text-lg font-medium hover:text-[#39FF14] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a href="#" className="text-lg font-medium hover:text-[#39FF14] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Product</a>
          <a href="#" className="text-lg font-medium hover:text-[#39FF14] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
          <button 
            onClick={() => {
              setModalType('signup')
              setIsMobileMenuOpen(false)
            }}
            className="border border-white text-white rounded-full px-6 py-3 hover:bg-white hover:text-black transition-all duration-300 w-full font-medium"
          >
            Get Started
          </button>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 pb-16">
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Column - Image (Hidden on Mobile) */}
          <div className="hidden md:flex relative justify-center items-center">
            <img 
              src={heroImg} 
              alt="Fehuvia Runestone" 
              className="w-full max-w-2xl lg:max-w-3xl object-contain z-10 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)] drop-shadow-[0_0_50px_rgba(218,165,32,0.15)] blur-[0.5px] animate-[fadeIn_1.5s_ease-out]"
              style={{ imageRendering: 'high-quality' }}
            />
          </div>

          {/* Right Column - Content (Centered on Mobile) */}
          <div className="flex flex-col space-y-6 md:space-y-8 pl-0 md:pl-10 items-center md:items-start text-center md:text-left mt-10 md:mt-0">
            
            <div className="flex items-center space-x-3 justify-center md:justify-start animate-[fadeIn_0.8s_ease-out_both] [animation-delay:200ms]">
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gray-600/80 backdrop-blur shadow-inner"></div>
              <p className="text-[#39FF14] text-[10px] md:text-sm font-bold tracking-[0.15em] uppercase">
                AUTOMATE TREASURY & LIQUIDITY MANAGEMENT
              </p>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-[72px] font-semibold leading-[1.15] md:leading-[1.1] tracking-tight animate-[fadeIn_0.8s_ease-out_both] [animation-delay:400ms]">
              SME cashflow<br/>predicted. Invoices<br/>settled instantly.
            </h1>
            
            <p className="text-gray-300 text-base md:text-xl max-w-2xl leading-relaxed font-light mx-auto md:mx-0 animate-[fadeIn_0.8s_ease-out_both] [animation-delay:600ms]">
              Forecast your 30-day runway with an AI Co-Pilot and settle B2B invoices instantly via Morph network stablecoins. No banking delays, just constant liquidity.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2 md:pt-4 justify-center md:justify-start animate-[fadeIn_0.8s_ease-out_both] [animation-delay:800ms]">
              <button 
                onClick={() => setModalType('signup')}
                className="bg-[#8b8d96]/80 hover:bg-[#8b8d96] text-white font-medium rounded-full px-6 py-3 md:px-8 md:py-3.5 transition-all duration-300 shadow-lg backdrop-blur-md"
              >
                Get Started
              </button>
              <button 
                onClick={() => setModalType('login')}
                className="border border-white hover:bg-white/10 text-white font-medium rounded-full px-6 py-3 md:px-8 md:py-3.5 transition-all duration-300 backdrop-blur-sm"
              >
                Log in
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Modal Overlay */}
      {modalType !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
          {/* Modal Container */}
          <div className="bg-gradient-to-br from-[#1c1c1e]/70 to-black/70 backdrop-blur-3xl border border-white/20 rounded-2xl w-full max-w-md p-8 shadow-[0_16px_40px_rgba(0,0,0,0.8)] relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setModalType('none')}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <h2 className="text-3xl font-semibold mb-2">
              {modalType === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              {modalType === 'login' 
                ? 'Enter your credentials to access your treasury.' 
                : 'Join Fehuvia to automate your cashflow.'}
            </p>

            {/* Form */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition-all"
                  placeholder="name@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input 
                  type="password" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14] transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button className="w-full bg-white text-black font-semibold rounded-lg px-4 py-3 mt-4 hover:bg-gray-200 transition-colors">
                {modalType === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-sm text-gray-400">
              {modalType === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setModalType(modalType === 'login' ? 'signup' : 'login')}
                className="text-white hover:text-[#39FF14] font-medium transition-colors"
              >
                {modalType === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default App
