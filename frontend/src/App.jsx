import React, { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Product from './components/Product';
import Features from './components/Features';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import DashboardLayout from './components/dashboard/DashboardLayout';
import ContentReader from './components/ContentReader';
import ArchitectureView from './components/ArchitectureView';

function App() {
  // Navigation View Coordinator: 'landing', 'dashboard', 'reader', or 'architecture'
  const [view, setView] = useState('landing');
  const [activeDoc, setActiveDoc] = useState('core-concept');
  
  const [modalType, setModalType] = useState('none');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Scroll event tracking for Navbar glassmorphism
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);

  // Viewport intersection states for scrolling animations
  const heroRef = useRef(null);
  const visionRef = useRef(null);
  const [isVisionVisible, setIsVisionVisible] = useState(false);

  useEffect(() => {
    // Only run scroll listener and observers if we are in landing view
    if (view !== 'landing') return;

    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsNavbarScrolled(true);
      } else {
        setIsNavbarScrolled(false);
      }
    };

    const visionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisionVisible(true);
      },
      { threshold: 0.15 }
    );

    if (visionRef.current) {
      visionObserver.observe(visionRef.current);
    }

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      visionObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [view]);

  // If in dashboard view, render the figma financial dashboard layout
  if (view === 'dashboard') {
    return <DashboardLayout setView={setView} />;
  }

  // If in content reader view, render the full-screen interactive document sheet
  if (view === 'reader') {
    return (
      <ContentReader
        activePage={activeDoc}
        onClose={() => setView('landing')}
        setView={setView}
      />
    );
  }

  // If in architecture view, render the interactive structural topology diagram
  if (view === 'architecture') {
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
        setModalType={setModalType}
        setView={setView}
      />

      {/* 3. About & Vision Section */}
      <About
        visionRef={visionRef}
        isVisionVisible={isVisionVisible}
      />

      {/* 4. Product Dashboard Preview Section */}
      <Product />

      {/* 5. Quantitative Technical Features Section */}
      <Features
        setModalType={setModalType}
      />

      {/* 6. Site Map Footer */}
      <Footer onPageSelect={(pageKey) => {
        if (pageKey === 'architecture') {
          setView('architecture');
        } else {
          setActiveDoc(pageKey);
          setView('reader');
        }
      }} />

      {/* 7. Frosted Glass Authentication Modal Overlay */}
      <AuthModal
        modalType={modalType}
        setModalType={setModalType}
        setView={setView}
      />

    </div>
  );
}

export default App;
