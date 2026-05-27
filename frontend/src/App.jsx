import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Product from './components/Product';
import Features from './components/Features';
import Roadmap from './components/Roadmap';
import Faq from './components/Faq';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import DashboardLayout from './components/dashboard/DashboardLayout';
import OnboardingWizard from './components/OnboardingWizard';
import ContentReader from './components/ContentReader';
import ArchitectureView from './components/ArchitectureView';
import DemoDisclaimer from './components/DemoDisclaimer';

function App() {
  // Navigation View Coordinator: 'landing', 'dashboard', 'reader', or 'architecture'
  const [view, setView] = useState('landing');
  const [activeDoc, setActiveDoc] = useState('core-concept');
  const [isAuthReady, setIsAuthReady] = useState(() => !localStorage.getItem('fehuvia_token'));
  
  const [modalType, setModalType] = useState('none');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Scroll event tracking for Navbar glassmorphism
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);

  // Session persistence: check for existing JWT on mount
  useEffect(() => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    // Validate the stored token against the backend
    fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3001'}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          // Token is valid — auto-login to dashboard
          setView('dashboard');
        } else {
          // Token expired or invalid — clear it
          localStorage.removeItem('fehuvia_token');
          localStorage.removeItem('fehuvia_user');
        }
        setIsAuthReady(true);
      })
      .catch(() => {
        // Network error — keep the cached session and allow the dashboard
        setIsAuthReady(true);
      });
  }, []);

  const sessionToken = localStorage.getItem('fehuvia_token');
  const activeView = sessionToken && view === 'landing' ? 'dashboard' : view;

  // Handle URL sync when user is on the landing page (logged out)
  useEffect(() => {
    if (activeView === 'landing' && window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  }, [activeView]);

  // Logout handler: clears session and returns to landing page
  const handleLogout = () => {
    localStorage.removeItem('fehuvia_token');
    localStorage.removeItem('fehuvia_user');
    setView('landing');
  };

  // Viewport intersection states for scrolling animations
  const heroRef = useRef(null);
  const visionRef = useRef(null);
  const productRef = useRef(null);
  const featuresRef = useRef(null);
  const footerRef = useRef(null);

  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isVisionVisible, setIsVisionVisible] = useState(false);
  const [isProductVisible, setIsProductVisible] = useState(false);
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    // Only run scroll listener and observers if we are in landing view
    if (activeView !== 'landing') {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsNavbarScrolled(true);
      } else {
        setIsNavbarScrolled(false);
      }
    };

    const observeSection = (targetRef, setVisible, threshold = 0.15, rootMargin = '0px 0px -10% 0px') => {
      const node = targetRef.current;

      if (!node) {
        return null;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(node);
      return observer;
    };

    const observers = [
      observeSection(heroRef, setIsHeroVisible, 0.2, '0px 0px -15% 0px'),
      observeSection(visionRef, setIsVisionVisible),
      observeSection(productRef, setIsProductVisible),
      observeSection(featuresRef, setIsFeaturesVisible),
      observeSection(footerRef, setIsFooterVisible, 0.1, '0px 0px -5% 0px'),
    ].filter(Boolean);

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeView]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-outfit">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Restoring session</p>
        </div>
      </div>
    );
  }

  // If in onboarding view, render the multi-step configuration wizard
  if (activeView === 'onboarding') {
    return <OnboardingWizard setView={setView} />;
  }

  // If in dashboard view, render the figma financial dashboard layout
  if (activeView === 'dashboard') {
    return <DashboardLayout setView={setView} handleLogout={handleLogout} />;
  }

  // If in content reader view, render the full-screen interactive document sheet
  if (activeView === 'reader') {
    return (
      <ContentReader
        activePage={activeDoc}
        onClose={() => setView('landing')}
        setView={setView}
      />
    );
  }

  // If in architecture view, render the interactive structural topology diagram
  if (activeView === 'architecture') {
    return (
      <ArchitectureView
        onClose={() => setView('landing')}
        setView={setView}
      />
    );
  }

  // Otherwise render the stark, premium matte-black and gold landing page
  return (
    <div className="min-h-screen text-white font-sans bg-black flex flex-col relative overflow-x-hidden snap-y snap-mandatory select-none">
      
      {/* 1. Navigation Header */}
      <Navbar
        isScrolled={isNavbarScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        setModalType={setModalType}
        setView={setView}
      />

      {/* 2. Hero Presentation Section */}
      <Hero
        heroRef={heroRef}
        isVisible={isHeroVisible}
        setModalType={setModalType}
        setView={setView}
      />

      {/* 3. About & Vision Section */}
      <About
        visionRef={visionRef}
        isVisionVisible={isVisionVisible}
      />

      {/* 4. Product Dashboard Preview Section */}
      <Product
        productRef={productRef}
        isVisible={isProductVisible}
      />

      {/* 5. Quantitative Technical Features Section */}
      <Features
        featuresRef={featuresRef}
        isVisible={isFeaturesVisible}
        setModalType={setModalType}
      />

      {/* 6. Roadmap Timeline Section */}
      <Roadmap />

      {/* 6.2. Institutional FAQ Section */}
      <Faq />

      {/* 6.5. Secure Operations Contact Section */}
      <Contact />

      {/* 7. Site Map Footer */}
      <Footer
        footerRef={footerRef}
        isVisible={isFooterVisible}
        onPageSelect={(pageKey) => {
          if (pageKey === 'architecture') {
            setView('architecture');
          } else {
            setActiveDoc(pageKey);
            setView('reader');
          }
        }}
      />

      {/* 8. Frosted Glass Authentication Modal Overlay */}
      <AuthModal
        modalType={modalType}
        setModalType={setModalType}
        setView={setView}
      />

      <DemoDisclaimer />

    </div>
  );
}

export default App;
