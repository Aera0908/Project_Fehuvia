import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ethers } from 'ethers';
import { Sidebar } from './Sidebar';
import { CashflowPrediction } from './CashflowPrediction';
import { AICopilot } from './AICopilot';
import { InvoiceManagement } from './InvoiceManagement';
import { CashFlowView } from './CashFlowView';
import { InvoicesView } from './InvoicesView';
import { AnalyticsView } from './AnalyticsView';
import { ProfileView } from './ProfileView';
import { NotificationsView } from './NotificationsView';
import { HelpView } from './HelpView';
import { BridgeView } from './BridgeView';
import { TransactionsView } from './TransactionsView';
import DemoDisclaimer from '../DemoDisclaimer';
import BrankasLinkModal from '../BrankasLinkModal';
import { BankLogo } from '../BankLogo';
import { Bell, User, HelpCircle, FileText, TrendingUp, Clock, X, Check, ShieldAlert, Sparkles, CreditCard, Wallet, ArrowRight, Landmark, ShieldCheck, Calendar, Layers, CheckCircle2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { getFriendlyError, getErrorBadge } from '../../utils/errorMessages';

export default function DashboardLayout({ setView, handleLogout }) {
  // Client-side SPA routing helper to parse path and return page state
  const getPageFromPath = () => {
    const path = window.location.pathname; // e.g. '/bridge' or '/cash-flow'
    const cleanPath = path.replace(/^\//, '').toLowerCase();
    
    if (cleanPath === 'cash-flow') return 'Cash Flow';
    
    const pages = ['dashboard', 'invoices', 'transactions', 'treasury', 'bridge', 'analytics', 'profile', 'notifications', 'help'];
    const match = pages.find(p => p === cleanPath);
    if (match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    }
    return 'Dashboard';
  };

  // Navigation page routing state initialized from URL path
  const [currentPage, setCurrentPage] = useState(() => getPageFromPath());

  // Listen to popstate (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser URL path when page state changes
  useEffect(() => {
    const cleanPath = currentPage.toLowerCase() === 'dashboard' ? '/' : `/${currentPage.toLowerCase().replace(' ', '-')}`;
    if (window.location.pathname !== cleanPath) {
      window.history.pushState({}, '', cleanPath);
    }
  }, [currentPage]);

  // Header scroll glassmorph state with hysteresis to prevent layout bounce
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const mainRef = useRef(null);

  // Reset scroll position and restore header when current page changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setIsHeaderScrolled(false);
  }, [currentPage]);

  const handleMainScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const scrollHeight = e.target.scrollHeight;
    const clientHeight = e.target.clientHeight;

    // Only collapse if the page has enough scrollable content to support collapsing
    // without triggering a layout scroll-reset bounce (collapsible elements height is ~150px)
    const canCollapse = (scrollHeight - clientHeight) > 200;

    if (canCollapse && !isHeaderScrolled && scrollTop > 50) {
      setIsHeaderScrolled(true);
    } else if (isHeaderScrolled && scrollTop < 10) {
      setIsHeaderScrolled(false);
    }
  };

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

  // Traditional bank balance (represented in Philippine Pesos)
  const [balance, setBalance] = useState(() => {
    try {
      const stored = localStorage.getItem('fehuvia_user');
      return stored ? Number(JSON.parse(stored).balance || 0) : 0;
    } catch {
      return 0;
    }
  });

  // On-Chain MetaMask stablecoin balance (represented in USDC)
  const [walletUSDCBalance, setWalletUSDCBalance] = useState(0);

  // Dynamic USD to PHP exchange rate (real-life authoritative rate loaded from backend API)
  const [exchangeRate, setExchangeRate] = useState(58.30);

  // Computed B2B corporate portfolio value in Pesos (₱ PHP = Traditional Bank + Web3 Wallet * exchangeRate conversion rate)
  const portfolioValue = balance + (walletUSDCBalance * exchangeRate);

  // Bank Connection State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedBankToLink, setSelectedBankToLink] = useState(null);
  const [bankLinked, setBankLinked] = useState(() => {
    try {
      const stored = localStorage.getItem('fehuvia_user');
      return stored ? !!JSON.parse(stored).bankLinked : false;
    } catch {
      return false;
    }
  });
  const [bankName, setBankName] = useState(() => {
    try {
      const stored = localStorage.getItem('fehuvia_user');
      return stored ? (JSON.parse(stored).bankName || '') : '';
    } catch {
      return '';
    }
  });

  // Invoices list state (initially loaded from DB)
  const [invoices, setInvoices] = useState([]);

  // B2B fiat-to-stablecoin dynamic conversion modal state
  const [conversionModal, setConversionModal] = useState({
    isOpen: false,
    invoice: null
  });

  // Direct on-chain USDC settlement confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    invoice: null
  });

  // AI predictions co-pilot cache
  const [predictions, setPredictions] = useState(null);
  const [runway, setRunway] = useState(45);
  const [trend, setTrend] = useState('stable');
  // Prefilled B2B settlement conversions redirection state
  const [prefilledBridgeInvoice, setPrefilledBridgeInvoice] = useState(null);
  
  // Active dashboard time sort filter
  const [dashboardTimeframe, setDashboardTimeframe] = useState('30 Days');
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Live gas fee telemetry state
  const [gasTelemetry, setGasTelemetry] = useState({
    gasPriceGwei: 1.50,
    ethPriceUsd: 3450,
    loading: false
  });

  const fetchLiveGasTelemetry = async () => {
    setGasTelemetry(prev => ({ ...prev, loading: true }));
    try {
      let liveGasPriceGwei = 1.50;
      let liveEthPrice = 3450;

      // 1. Fetch live ETH-USD price from public API
      try {
        const rateRes = await fetch('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD');
        const rateData = await rateRes.json();
        if (rateData && rateData.USD) {
          liveEthPrice = Number(rateData.USD);
        }
      } catch (e) {
        console.warn('Failed to fetch live ETH price, using fallback:', e);
      }

      // 2. Fetch live gas price from Morph RPC using ethers
      try {
        if (window.ethereum) {
          const tempProvider = new ethers.BrowserProvider(window.ethereum);
          const feeData = await tempProvider.getFeeData();
          if (feeData && feeData.gasPrice) {
            liveGasPriceGwei = Number(ethers.formatUnits(feeData.gasPrice, 'gwei'));
          }
        } else {
          const rpcUrl = "https://rpc-hoodi.morph.network";
          const tempProvider = new ethers.JsonRpcProvider(rpcUrl);
          const feeData = await tempProvider.getFeeData();
          if (feeData && feeData.gasPrice) {
            liveGasPriceGwei = Number(ethers.formatUnits(feeData.gasPrice, 'gwei'));
          }
        }
      } catch (err) {
        try {
          const rpcUrl = "https://rpc-hoodi.morph.network";
          const tempProvider = new ethers.JsonRpcProvider(rpcUrl);
          const feeData = await tempProvider.getFeeData();
          if (feeData && feeData.gasPrice) {
            liveGasPriceGwei = Number(ethers.formatUnits(feeData.gasPrice, 'gwei'));
          }
        } catch (rpcErr) {
          console.warn('Failed to fetch gas price via RPC, using fallback:', rpcErr);
        }
      }

      setGasTelemetry({
        gasPriceGwei: parseFloat(liveGasPriceGwei.toFixed(3)),
        ethPriceUsd: liveEthPrice,
        loading: false
      });
    } catch (err) {
      console.error('Failed to run dynamic gas telemetry fetch:', err);
      setGasTelemetry(prev => ({ ...prev, loading: false }));
    }
  };

  // User Profile
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('fehuvia_user');
      return stored ? JSON.parse(stored) : { email: 'admin@fehuvia.com' };
    } catch {
      return { email: 'admin@fehuvia.com' };
    }
  });

  const fetchProfile = async () => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUserProfile(data.user);
          localStorage.setItem('fehuvia_user', JSON.stringify(data.user));
          if (data.user.balance !== undefined) setBalance(Number(data.user.balance));
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleUpdateAutomationLevel = async (level) => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          automationLevel: level,
          riskProfile: userProfile.riskProfile || 'balanced',
          walletAddress: userProfile.walletAddress
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = {
          ...userProfile,
          automationLevel: level
        };
        setUserProfile(updatedUser);
        localStorage.setItem('fehuvia_user', JSON.stringify(updatedUser));
        
        setToast({
          show: true,
          message: `Automation mode updated to ${level === 'manual' ? 'Full Manual' : level === 'auto' ? 'Fully Auto' : 'Co-Pilot'}!`,
          txHash: 'Settings Saved'
        });
      }
    } catch (err) {
      console.error('Failed to update automation level settings:', err);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rates`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates && data.rates.PHP) {
          setExchangeRate(Number(data.rates.PHP));
        }
      }
    } catch (err) {
      console.error('Error fetching exchange rates:', err);
    }
  };

  const fetchInvoices = async () => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(inv => ({
          id: inv.id,
          supplier: inv.supplier,
          amount: Number(inv.amount),
          dueDate: inv.dueDate,
          aiAction: {
            status: inv.aiStatus,
            message: inv.aiStatus === 'safe' ? 'Safe to Pay' : inv.aiStatus === 'delay' ? 'Delay 5 Days' : 'Review Required',
            reason: inv.aiReason
          },
          settled: inv.status === 'settled',
          scheduled: inv.status === 'scheduled',
          loading: false,
          txHash: inv.txHash,
          supplierWallet: inv.supplierWallet,
          hasFehuviaAccount: !!inv.hasFehuviaAccount
        }));
        setInvoices(mapped);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchPredictions = async () => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/cashflow/prediction`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPredictions(data);
        if (data.predicted_runway) setRunway(data.predicted_runway);
        if (data.cash_flow_trend) setTrend(data.cash_flow_trend);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
    }
  };

  const fetchPayments = async () => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchRates();
    fetchInvoices();
    fetchPredictions();
    fetchPayments();
    fetchLiveGasTelemetry();

    const gasInterval = setInterval(fetchLiveGasTelemetry, 30000);
    return () => clearInterval(gasInterval);
  }, []);

  // Trigger general loading simulation on mount to let skeletons shimmer beautifully!
  useEffect(() => {
    const timer = setTimeout(() => {
      setDashboardLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Settled Payments Log State (initially loaded from backend database)
  const [payments, setPayments] = useState([]);

  // Translucent Toast Notifications State
  const [toast, setToast] = useState({ show: false, message: '', txHash: '' });

  // Logout confirmation modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Dynamic Fiat-to-USDC Liquidity Bridge Modal State
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [bridgeInvoice, setBridgeInvoice] = useState(null);
  const [bridgeStep, setBridgeStep] = useState(0); // 0: idle, 1: debiting, 2: swapping, 3: minting, 4: complete
  const [bridgeStatus, setBridgeStatus] = useState('');


  // Dynamic Manual Review Checklist Modal State
  const [reviewModal, setReviewModal] = useState({ isOpen: false, invoice: null });
  const [checkedItems, setCheckedItems] = useState({ whitelist: false, procurement: false, limits: false, runway: false });

  // Dynamic L2-to-Bank Off-ramp Bridge Modal State
  const [showOffRampModal, setShowOffRampModal] = useState(false);
  const [offRampInvoice, setOffRampInvoice] = useState(null);
  const [offRampStep, setOffRampStep] = useState(0); // 0: idle, 1: lock, 2: swap, 3: disburse, 4: complete
  const [offRampStatus, setOffRampStatus] = useState('');

  // Dynamic Calendar Postpone Modal State
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, invoice: null });
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // EVM Wallet Modal states
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState([]);

  // Check and list installed wallets dynamically (installed first)
  const checkInstalledWallets = () => {
    const isMetaMask = !!(window.ethereum && window.ethereum.isMetaMask);
    const isCoinbase = !!(window.coinbaseWalletExtension || (window.ethereum && window.ethereum.isCoinbaseWallet));
    const isOKX = !!window.okxwallet;
    const isRainbow = !!(window.ethereum && window.ethereum.isRainbow);

    const walletList = [
      { id: 'metamask', name: 'MetaMask', isInstalled: isMetaMask, installUrl: 'https://metamask.io/download/' },
      { id: 'coinbase', name: 'Coinbase Wallet', isInstalled: isCoinbase, installUrl: 'https://www.coinbase.com/wallet' },
      { id: 'okx', name: 'OKX Wallet', isInstalled: isOKX, installUrl: 'https://www.okx.com/web3' },
      { id: 'rainbow', name: 'Rainbow', isInstalled: isRainbow, installUrl: 'https://rainbow.me/' },
      { id: 'walletconnect', name: 'WalletConnect', isInstalled: false, installUrl: 'https://walletconnect.com/' }
    ];

    // Sort: installed wallets first!
    const sorted = walletList.sort((a, b) => (b.isInstalled ? 1 : 0) - (a.isInstalled ? 1 : 0));
    setDetectedWallets(sorted);
  };

  useEffect(() => {
    checkInstalledWallets();
  }, [isWalletModalOpen]);

  const renderWalletLogo = (id) => {
    const urls = {
      metamask: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/metaMaskWallet/metaMaskWallet.svg',
      coinbase: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/coinbaseWallet/coinbaseWallet.svg',
      okx: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/okxWallet/okxWallet.svg',
      rainbow: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/rainbowWallet/rainbowWallet.svg',
      walletconnect: 'https://raw.githubusercontent.com/rainbow-me/rainbowkit/main/packages/rainbowkit/src/wallets/walletConnectors/walletConnectWallet/walletConnectWallet.svg'
    };

    if (urls[id]) {
      return (
        <img 
          src={urls[id]} 
          alt={`${id} logo`} 
          className="w-7 h-7 object-contain" 
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }
    return <Wallet className="w-5 h-5 text-white" />;
  };

  // Dynamic notifications state - Seeded for admin demo, empty for new user profiles
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('fehuvia_user');
      const user = stored ? JSON.parse(stored) : {};
      if (user.email && user.email.toLowerCase() === 'admin@fehuvia.com') {
        return [
          {
            id: 'notif-1',
            title: 'Morph Transaction Cleared',
            message: 'Invoice INV-001 ($125,000) successfully settled T+0 via Morph L2 testnet.',
            time: '10 mins ago',
            read: false,
            type: 'success',
            meta: 'Tx: 0x4f12d8a5...e712a'
          },
          {
            id: 'notif-2',
            title: 'Liquidity Runway Alert',
            message: 'Runway is projected to drop below 30 days next month. AI optimization active.',
            time: '2 hours ago',
            read: false,
            type: 'warning',
            meta: 'AI Copilot Recommendation'
          },
          {
            id: 'notif-3',
            title: 'New Invoice Uploaded',
            message: 'Tech Solutions Inc uploaded a new invoice of $210,000 for AI validation.',
            time: '1 day ago',
            read: true,
            type: 'info',
            meta: 'Supplier Tech Solutions'
          },
          {
            id: 'notif-4',
            title: 'Optimization Path Approved',
            message: 'Runway optimization path applied successfully. Average settlement speed improved.',
            time: '2 days ago',
            read: true,
            type: 'success',
            meta: 'Morph Gas Paid'
          }
        ];
      }
    } catch (e) {
      console.error('Error seeding notifications:', e);
    }
    return [];
  });

  const [activeCoachStep, setActiveCoachStep] = useState(0);
  const [showCoach, _setShowCoach] = useState(false);
  const setShowCoach = (val) => {
    // Coach mark is disabled for now
  };
  const [coachCoords, setCoachCoords] = useState(null);

  const coachSteps = [
    {
      target: 'coach-runway-chart',
      title: 'SME Cash Runway Predictor',
      description: 'Your treasury central nervous system. Analyzes B2B invoice schedules and database ledgers to project a rolling 30-day cash buffer and warn you of upcoming cash bottlenecks.'
    },
    {
      target: 'coach-copilot-sidebar',
      title: 'AI Treasury Copilot',
      description: 'Your automated CFO assistant. Evaluates cash levels and critical payroll windows to supply immediate, mathematically sound advice on whether to capture early payment yields or conserve liquidity.'
    },
    {
      target: 'coach-payables-ledger',
      title: 'Web3 On-Chain Settlements',
      description: 'The execution layer. Facilitates direct traditional bank fiat debits and routes dynamic stablecoin settlements with T+0 event-listening logs executed live on the Morph L2 network.'
    },
    {
      target: 'coach-cashflow-view',
      title: 'Cash Flow Forecasts',
      description: 'Visualizes historical cash flow metrics and projected balances based on planned inflow schedules. Calibrates operating thresholds dynamically to safeguard corporate liquidity.'
    },
    {
      target: 'coach-invoices-view',
      title: 'Corporate Invoice Ledger',
      description: 'View your uploaded invoice database, upload new ones for automatic AI OCR scanning, and execute one-click early settlement stablecoin payments.'
    },
    {
      target: 'coach-payments-view',
      title: 'Settled Payments Registry',
      description: 'The secure transaction history workspace. Logs immutable proof-of-payment receipts, complete with live block event transaction hashes executed on the Morph L2 testnet.'
    },
    {
      target: 'coach-analytics-view',
      title: 'Real-Time Advanced Analytics',
      description: 'Analyzes portfolio ratios, average B2B settlement latency stats, dynamic stablecoin interest yields, and outstanding payables structures to guide corporate operations.'
    },
    {
      target: 'coach-profile-view',
      title: 'Workstation Connections & Settings',
      description: 'Securely link traditional local bank accounts via Brankas Secure APIs, pair EVM wallets, configure AI risk profiles (Defensive, Balanced, Aggressive), and manage workstation parameters.'
    }
  ];

  // Trigger Coach Mark tutorial ONLY for newly created accounts
  // Checks: account created within the last 24 hours AND coach not already viewed
  useEffect(() => {
    const viewed = localStorage.getItem('fehuvia_coach_viewed');
    if (viewed) return;
    if (!userProfile.createdAt) return;

    let createdTimeStr = userProfile.createdAt;
    if (createdTimeStr && typeof createdTimeStr === 'string' && !createdTimeStr.endsWith('Z') && !createdTimeStr.includes('+') && !createdTimeStr.includes('-')) {
      createdTimeStr = createdTimeStr.replace(' ', 'T') + 'Z';
    }

    const createdTime = new Date(createdTimeStr).getTime();
    const now = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const isNewAccount = (now - createdTime) < twentyFourHoursMs;

    if (isNewAccount && userProfile.email !== 'admin@fehuvia.com') {
      setShowCoach(true);
    }
  }, [userProfile.createdAt]);

  // Programmatically switch active dashboard page based on active tour step
  useEffect(() => {
    if (!showCoach) return;
    
    // Step index mappings:
    // Steps 0, 1, 2 are on the Dashboard
    if (activeCoachStep <= 2) {
      setCurrentPage('Dashboard');
    } else if (activeCoachStep === 3) {
      setCurrentPage('Cash Flow');
    } else if (activeCoachStep === 4) {
      setCurrentPage('Invoices');
    } else if (activeCoachStep === 5) {
      setCurrentPage('Payments');
    } else if (activeCoachStep === 6) {
      setCurrentPage('Analytics');
    } else if (activeCoachStep === 7) {
      setCurrentPage('Profile');
    }
  }, [activeCoachStep, showCoach]);

  // Update spotlight coordinates on step change
  useEffect(() => {
    if (!showCoach) return;
    const step = coachSteps[activeCoachStep];
    
    const updateCoords = () => {
      const el = document.getElementById(step.target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = el.getBoundingClientRect();
        setCoachCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateCoords();
    const timer = setTimeout(updateCoords, 600);
    window.addEventListener('resize', updateCoords);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateCoords);
    };
  }, [activeCoachStep, showCoach, currentPage]);

  const getCardStyle = () => {
    if (!coachCoords) {
      return {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '420px'
      };
    }
    
    const cardWidth = 420;
    const cardHeight = 240;
    const gap = 24;
    
    const highlightBottom = coachCoords.top + coachCoords.height;
    
    // Check if there is enough space below the highlight in the viewport
    const spaceBelow = window.innerHeight - (highlightBottom - window.scrollY);
    const spaceAbove = coachCoords.top - window.scrollY;
    
    let top, left;
    
    if (spaceBelow > cardHeight + gap) {
      // Place below the highlight
      top = highlightBottom + gap;
    } else if (spaceAbove > cardHeight + gap) {
      // Place above the highlight
      top = coachCoords.top - cardHeight - gap;
    } else {
      // Fallback: place in fixed bottom-right if it doesn't fit vertically
      return {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '420px'
      };
    }
    
    // Center horizontally relative to the highlight, keeping it within screen bounds
    const highlightCenter = coachCoords.left + coachCoords.width / 2;
    left = highlightCenter - cardWidth / 2;
    
    const minLeft = 16;
    const maxLeft = window.innerWidth - cardWidth - 16;
    left = Math.max(minLeft, Math.min(maxLeft, left));
    
    return {
      position: 'absolute',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`
    };
  };

  const handleFinishCoach = () => {
    localStorage.setItem('fehuvia_coach_viewed', 'true');
    setShowCoach(false);
  };

  // Wire skipped-settings notification checker inside useEffect on profile load
  useEffect(() => {
    if (!userProfile.email) return;

    // Check if they skipped onboarding settings
    const isNewUser = userProfile.email !== 'admin@fehuvia.com';
    const hasSkipped = !userProfile.automationLevel || !userProfile.riskProfile || 
                      (userProfile.automationLevel === 'semi' && userProfile.riskProfile === 'balanced' && !localStorage.getItem('fehuvia_onboarding_completed'));

    if (hasSkipped && isNewUser) {
      const skipNotifId = 'notif-skipped-config';
      setNotifications(prev => {
        if (prev.some(n => n.id === skipNotifId)) return prev;
        return [
          {
            id: skipNotifId,
            title: '⚠️ Setup Incomplete: Preferences Skipped',
            message: 'You skipped configuring your AI Autopilot and Risk Parameter settings. Tap here to configure them in your Profile settings.',
            time: 'Just now',
            read: false,
            type: 'warning',
            meta: 'Setup Required'
          },
          ...prev
        ];
      });
    } else {
      setNotifications(prev => prev.filter(n => n.id !== 'notif-skipped-config'));
    }
  }, [userProfile]);

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch live on-chain stablecoin balance of connected MetaMask wallet
  const fetchWalletUSDCBalance = async (addressOverride = null, retries = 3) => {
    const address = addressOverride || userProfile.walletAddress;
    if (!window.ethereum) {
      if (retries > 0) {
        setTimeout(() => fetchWalletUSDCBalance(addressOverride, retries - 1), 300);
        return;
      }
      setWalletUSDCBalance(0);
      return;
    }

    if (!address || !ethers.isAddress(address)) {
      setWalletUSDCBalance(0);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const USDC_ADDRESS = import.meta.env.VITE_USDC_CONTRACT_ADDRESS || "0xD8FCA101505D9F698485B22dCC79dF2Ec7a24660";
      const ERC20_ABI = ["function balanceOf(address account) view returns (uint256)"];
      const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
      const bal = await usdc.balanceOf(address);
      setWalletUSDCBalance(Number(ethers.formatUnits(bal, 6)));
    } catch (err) {
      console.error("Failed to fetch on-chain USDC balance:", err);
      setWalletUSDCBalance(0);
    }
  };

  // Wire automatic wallet balance checking and gas faucet drip inside mount hook
  useEffect(() => {
    if (userProfile.walletAddress) {
      fetchWalletUSDCBalance();
      
      const token = localStorage.getItem('fehuvia_token');
      const address = userProfile.walletAddress;
      
      if (token && address && !address.startsWith('0xdemo') && ethers.isAddress(address)) {
        fetch(`${API_BASE}/api/faucet/drip`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ walletAddress: address })
        }).then(res => res.json()).then(data => {
          if (data && data.dripped) {
            setToast({
              show: true,
              message: `💧 Faucet Drip: Funded your wallet with 0.002 ETH gas!`,
              txHash: `${data.txHash.substring(0, 10)}...`
            });
          }
        }).catch(err => {
          console.warn("Gas faucet drip warning:", err);
        });
      }
    }
  }, [userProfile.walletAddress]);

  // Real-time active account connection auto-detection on mount
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts && accounts.length > 0) {
            const activeAddress = accounts[0];
            if (userProfile.walletAddress !== activeAddress) {
              console.log("🦊 Auto-detected active MetaMask account on mount:", activeAddress);
              
              const token = localStorage.getItem('fehuvia_token');
              if (token) {
                fetch(`${API_BASE}/api/auth/wallet`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ walletAddress: activeAddress })
                }).catch(err => console.warn("Failed to auto-persist active wallet address on mount:", err));
              }

              setUserProfile(prev => {
                const updated = { ...prev, walletAddress: activeAddress };
                localStorage.setItem('fehuvia_user', JSON.stringify(updated));
                return updated;
              });

              fetchWalletUSDCBalance(activeAddress);
            }
          }
        })
        .catch(err => console.warn("Error checking MetaMask accounts on mount:", err));
    }
  }, []);

  // Web3 listeners for real-time account switching and chain changing
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        const activeAddress = accounts[0];
        if (userProfile.walletAddress !== activeAddress) {
          console.log("🦊 MetaMask accountsChanged event fired:", activeAddress);
          
          const token = localStorage.getItem('fehuvia_token');
          if (token) {
            fetch(`${API_BASE}/api/auth/wallet`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ walletAddress: activeAddress })
            }).catch(err => console.warn("Failed to persist wallet address on accountsChanged:", err));
          }

          setUserProfile(prev => {
            const updated = { ...prev, walletAddress: activeAddress };
            localStorage.setItem('fehuvia_user', JSON.stringify(updated));
            return updated;
          });

          fetchWalletUSDCBalance(activeAddress);
          
          setToast({
            show: true,
            message: `Switched wallet account to: ${activeAddress.substring(0, 6)}...${activeAddress.substring(38)}`,
            txHash: 'Account Switched'
          });
        }
      } else {
        handleDisconnectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [userProfile.walletAddress]);

  // Handle MetaMask/EVM Wallet Connection
  const handleConnectWallet = async (walletId = 'metamask') => {
    if (walletId === 'walletconnect') {
      setToast({
        show: true,
        message: 'WalletConnect integration is only available in production mainnet.',
        txHash: 'EVM Rail'
      });
      return;
    }

    let providerSource = window.ethereum;
    if (walletId === 'metamask') {
      if (window.ethereum?.providers) {
        providerSource = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
      } else if (window.ethereum?.isMetaMask) {
        providerSource = window.ethereum;
      }
    } else if (walletId === 'okx' && window.okxwallet) {
      providerSource = window.okxwallet;
    } else if (walletId === 'coinbase' && window.coinbaseWalletExtension) {
      providerSource = window.coinbaseWalletExtension;
    }

    if (!providerSource) {
      setToast({
        show: true,
        message: 'The selected EVM wallet extension is not installed in your browser.',
        txHash: 'Extension Required'
      });
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(providerSource);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // Request network switch to Morph L2 Testnet (2910)
      const initialChainIdHex = await providerSource.request({ method: 'eth_chainId' });
      let chainId = Number(initialChainIdHex);

      if (chainId !== 2910 && chainId !== 2818) {
        // Automatically request network switch to Morph Testnet (Chain ID: 2910, hex: 0xb5e)
        try {
          await providerSource.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xb5e' }],
          });
          // Re-fetch network details after switch approval
          const hexChainId = await providerSource.request({ method: 'eth_chainId' });
          chainId = Number(hexChainId);
        } catch (switchError) {
          // If the network is not added to the user's wallet, request to add it!
          if (switchError.code === 4902 || switchError.message?.toLowerCase().includes('unrecognized')) {
            try {
              await providerSource.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xb5e',
                  chainName: 'Morph Testnet',
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://rpc-hoodi.morph.network'],
                  blockExplorerUrls: ['https://explorer-testnet.morph.network']
                }],
              });
              // Re-fetch network details after add
              const hexChainId = await providerSource.request({ method: 'eth_chainId' });
              chainId = Number(hexChainId);
            } catch (addError) {
              console.error('Failed to add Morph Testnet chain:', addError);
            }
          } else {
            console.error('Failed to switch Morph Testnet chain:', switchError);
          }
        }
      }

      // Re-verify after switch attempt
      if (chainId !== 2910 && chainId !== 2818) {
        setToast({
          show: true,
          message: 'Please switch your wallet to Morph Testnet (Chain ID: 2910) to continue.',
          txHash: 'Network Switch'
        });
        return;
      }

      // Persist the connected wallet address to the backend database
      const token = localStorage.getItem('fehuvia_token');
      if (token) {
        try {
          const apiRes = await fetch(`${API_BASE}/api/auth/wallet`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ walletAddress: address })
          });
          if (!apiRes.ok) {
            console.error('Failed to persist wallet address to database');
          } else {
            console.log('✅ Connected wallet successfully persisted to database');
          }
        } catch (apiErr) {
          console.error('API Error persisting wallet address:', apiErr);
        }
      }

      // Update userProfile state locally and persistently
      setUserProfile(prev => {
        const updated = { ...prev, walletAddress: address };
        localStorage.setItem('fehuvia_user', JSON.stringify(updated));
        return updated;
      });
      fetchWalletUSDCBalance(address);
      setIsWalletModalOpen(false); // Close selection modal on success

      // Trigger backend gas dispenser faucet to drip gas to this address if it lacks gas!
      if (token) {
        fetch(`${API_BASE}/api/faucet/drip`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ walletAddress: address })
        }).then(res => res.json()).then(data => {
          if (data && data.dripped) {
            setToast({
              show: true,
              message: `💧 Faucet Drip: Received 0.002 ETH testnet gas!`,
              txHash: `${data.txHash.substring(0, 10)}...`
            });
          }
        }).catch(err => {
          console.warn("Gas faucet drip warning:", err);
        });
      }

      setToast({
        show: true,
        message: `Wallet connected: ${address.substring(0, 6)}...${address.substring(38)}`,
        txHash: 'Web3 Ready'
      });
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setToast({
        show: true,
        message: getFriendlyError(err, 'wallet'),
        txHash: getErrorBadge('wallet')
      });
    }
  };

  // Handle Wallet Disconnection
  const handleDisconnectWallet = () => {
    setUserProfile(prev => {
      const updated = { ...prev };
      delete updated.walletAddress;
      localStorage.setItem('fehuvia_user', JSON.stringify(updated));
      return updated;
    });
    setWalletUSDCBalance(0);

    setToast({
      show: true,
      message: 'Wallet disconnected from workstation.',
      txHash: 'Web3 Off'
    });
  };

  // Handle Philippine Bank linking success via simulated Brankas API
  const handleLinkBankSuccess = async ({ bankName, bankId, balance: linkedBalance }) => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/link-bank`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bankName, bankId, balance: linkedBalance })
      });

      if (!res.ok) throw new Error("Failed to link bank account in database.");

      const data = await res.json();
      
      // Update local storage session
      const storedUser = JSON.parse(localStorage.getItem('fehuvia_user') || '{}');
      const updatedUser = {
        ...storedUser,
        bankLinked: data.user.bankLinked,
        bankName: data.user.bankName,
        balance: data.user.balance,
        linkedBanks: data.user.linkedBanks
      };
      localStorage.setItem('fehuvia_user', JSON.stringify(updatedUser));

      setUserProfile(updatedUser);
      setBankLinked(data.user.bankLinked);
      setBankName(data.user.bankName);
      setBalance(Number(data.user.balance));
      setSelectedBankToLink(null);
      setIsBankModalOpen(false);

      setToast({
        show: true,
        message: `Successfully linked your ${bankName} account via Brankas!`,
        txHash: 'API Connected'
      });
    } catch (err) {
      console.error('Bank link failed:', err);
      setToast({
        show: true,
        message: getFriendlyError(err, 'bank'),
        txHash: getErrorBadge('bank')
      });
    }
  };

  // Handle individual bank unlinking
  const handleUnlinkBank = async (bankId) => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/unlink-bank`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bankId })
      });

      if (!res.ok) throw new Error("Failed to unlink bank account.");

      const data = await res.json();

      // Update local storage session
      const storedUser = JSON.parse(localStorage.getItem('fehuvia_user') || '{}');
      const updatedUser = {
        ...storedUser,
        bankLinked: data.user.bankLinked,
        bankName: data.user.bankName,
        balance: data.user.balance,
        linkedBanks: data.user.linkedBanks
      };
      localStorage.setItem('fehuvia_user', JSON.stringify(updatedUser));

      setUserProfile(updatedUser);
      setBankLinked(data.user.bankLinked);
      setBankName(data.user.bankName);
      setBalance(Number(data.user.balance));

      setToast({
        show: true,
        message: `Disconnected bank account successfully.`,
        txHash: 'API Unlinked'
      });
    } catch (err) {
      console.error('Bank unlink failed:', err);
      setToast({
        show: true,
        message: 'Bank account was not disconnected. Please check your connection and try again.',
        txHash: getErrorBadge('bank')
      });
    }
  };

  // Handle on-demand pristine demo data reset
  const handleResetDemoState = async () => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-demo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        // Refresh on-chain wallet balance after reset
        fetchWalletUSDCBalance();
        
        // Refresh profile state and invoice ledgers
        await fetchProfile();
        await fetchInvoices();
        
        setToast({
          show: true,
          message: 'Workstation successfully restored to pristine presentation settings.',
          txHash: 'Demo Refreshed'
        });
      } else {
        throw new Error('Failed to reset presentation database state.');
      }
    } catch (err) {
      console.error('Demo reset failed:', err);
      setToast({
        show: true,
        message: 'Could not restore demo state. Please check your connection and try again.',
        txHash: 'Reset Failed'
      });
    }
  };

  // Handle traditional banking disconnection (reset all)
  const handleDisconnectBank = async () => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/disconnect-bank`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to disconnect bank account.");

      const data = await res.json();

      // Update local storage session
      const storedUser = JSON.parse(localStorage.getItem('fehuvia_user') || '{}');
      const updatedUser = {
        ...storedUser,
        bankLinked: false,
        bankName: '',
        balance: 0.00,
        linkedBanks: data.user.linkedBanks
      };
      localStorage.setItem('fehuvia_user', JSON.stringify(updatedUser));

      setUserProfile(updatedUser);
      setBankLinked(false);
      setBankName('');
      setBalance(0.00);

      setToast({
        show: true,
        message: 'All bank linkages disconnected successfully.',
        txHash: 'API Off'
      });
    } catch (err) {
      console.error('Bank disconnect failed:', err);
      setToast({
        show: true,
        message: 'Could not remove bank linkage. Please check your connection and try again.',
        txHash: getErrorBadge('bank')
      });
    }
  };

  // Handle single invoice settlement via live Ethers.js Smart Contracts
  const handleSettle = async (id) => {
    const targetInvoice = invoices.find(inv => inv.id === id);
    if (!targetInvoice) return;

    // Check if the user's active walletUSDCBalance is sufficient for direct settlement
    const hasEnoughUSDC = walletUSDCBalance >= parseFloat(targetInvoice.amount);

    if (hasEnoughUSDC) {
      setConfirmModal({
        isOpen: true,
        invoice: targetInvoice
      });
    } else if (bankLinked) {
      setConversionModal({
        isOpen: true,
        invoice: targetInvoice
      });
    } else {
      executeSettlement(id);
    }
  };

  const handleExecuteBridge = () => {
    setBridgeStep(1);
    setBridgeStatus('Debiting ₱' + (bridgeInvoice.amount * exchangeRate).toLocaleString(undefined, {minimumFractionDigits:2}) + ' PHP from GCash Business Wallet via Brankas Secure APIs...');
    
    setTimeout(() => {
      setBridgeStep(2);
      setBridgeStatus('Routing stablecoins through StraitsX Liquidity Pool swap system...');
    }, 1200);

    setTimeout(() => {
      setBridgeStep(3);
      setBridgeStatus('Minting $' + bridgeInvoice.amount.toLocaleString() + ' USDC into Morph L2 Key (0xdemo7970C5...)...');
    }, 2400);

    setTimeout(() => {
      setBridgeStep(4);
      setBridgeStatus('Bridge complete! $' + bridgeInvoice.amount.toLocaleString() + ' USDC successfully credited to your wallet key.');
      
      // Update GCash Pesos balance (debit equivalent fiat)
      const debitedPHP = bridgeInvoice.amount * exchangeRate;
      setBalance(prev => Math.max(0, prev - debitedPHP));
      
      // Credit USDC stablecoins to wallet balance
      setWalletUSDCBalance(prev => prev + bridgeInvoice.amount);
      
      setToast({
        show: true,
        message: `Inbound Bridge: Successfully converted ₱${debitedPHP.toLocaleString(undefined, {maximumFractionDigits:0})} to $${bridgeInvoice.amount.toLocaleString()} USDC via GCash!`,
        txHash: 'StraitsX Bridge'
      });
    }, 3600);
  };

  const handleExecuteOffRamp = () => {
    setOffRampStep(1);
    setOffRampStatus('Initializing secure L2 stablecoin lock-up to off-ramp gateway pool (StraitsX)...');

    setTimeout(() => {
      setOffRampStep(2);
      setOffRampStatus('Exchanging stablecoins for local PHP fiat in liquidity pool registers at live rate...');
    }, 1200);

    setTimeout(() => {
      setOffRampStep(3);
      setOffRampStatus(`Dispatching real-time PESONet/InstaPay payout to ${offRampInvoice.supplierWallet} via Brankas Secure APIs...`);
    }, 2400);

    setTimeout(() => {
      setOffRampStep(4);
      setOffRampStatus(`Payout successful! Supplier's bank account successfully credited. Obligations cleared.`);
      
      // Perform actual settlement database sync now!
      confirmOffRampSettlement(offRampInvoice.id);
    }, 3600);
  };

  const confirmOffRampSettlement = async (id) => {
    try {
      const token = localStorage.getItem('fehuvia_token');
      const mockTx = '0xmockofframp' + Buffer.from(id).toString('hex').substring(0, 16) + Math.floor(Math.random() * 100);

      const res = await fetch(`${API_BASE}/api/invoices/${id}/settle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txHash: mockTx })
      });

      if (!res.ok) throw new Error('Off-ramp settlement database sync failed');

      setInvoices(prev => prev.map(inv => {
        if (inv.id === id) {
          setToast({
            show: true,
            message: `Off-Ramp successful: disbursed $${inv.amount.toLocaleString()} USDC to ${inv.supplierWallet}!`,
            txHash: `${mockTx.substring(0, 12)}...`
          });

          setNotifications(prevNotif => [
            {
              id: `notif-${Date.now()}`,
              title: 'L2-to-Bank Off-Ramp Cleared',
              message: `Invoice ${inv.id} cleared. Stablecoins successfully off-ramped to ${inv.supplierWallet}.`,
              time: 'Just now',
              read: false,
              type: 'success',
              meta: `Tx: ${mockTx.substring(0, 12)}...`
            },
            ...prevNotif
          ]);

          return { ...inv, loading: false, settled: true, txHash: mockTx };
        }
        return inv;
      }));

      // Deduct USDC balance for the buyer
      setWalletUSDCBalance(prev => Math.max(0, prev - offRampInvoice.amount));

      // Sync workstation states
      fetchProfile();
      fetchInvoices();
      fetchPredictions();
      fetchPayments();
    } catch (err) {
      console.error('Off-ramp settlement sync error:', err);
      setToast({
        show: true,
        message: 'Off-ramp was processed on-chain, but the ledger could not sync. Refresh to verify status.',
        txHash: 'Ledger Sync'
      });
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: false } : inv));
    }
  };

  const executeSettlement = async (id) => {
    const targetInvoice = invoices.find(inv => inv.id === id);
    if (!targetInvoice) return;

    // 1. Set specific invoice to loading state
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: true } : inv));

    if (userProfile.email === 'demo@fehuvia.com') {
      // Presentation demo account: check if they have enough USDC balance!
      if (walletUSDCBalance < targetInvoice.amount) {
        // Insufficient USDC stablecoins! Redirect to Treasury Bridge!
        setPrefilledBridgeInvoice(targetInvoice);
        setToast({
          show: true,
          message: `⚠️ Insufficient USDC. Redirecting to Treasury Bridge...`,
          txHash: 'Redirecting'
        });
        setCurrentPage('Bridge');
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: false } : inv));
        return;
      }

      // 2. Check if the supplier destination is a standard crypto address
      const isCryptoDestination = targetInvoice.supplierWallet && targetInvoice.supplierWallet.startsWith('0x');

      if (!isCryptoDestination) {
        // Supplier uses a traditional bank account! Open the interactive L2-to-Bank Off-ramp Bridge!
        setOffRampInvoice(targetInvoice);
        setOffRampStep(0);
        setShowOffRampModal(true);
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: false } : inv));
        return;
      }

      // Both Demo and Production accounts fall through to trigger actual MetaMask transactions on Morph L2 Testnet!
    }

    const token = localStorage.getItem('fehuvia_token');
    if (!token) {
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: false } : inv));
      return;
    }

    // 2. Validate MetaMask injection
    if (!window.ethereum) {
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: false } : inv));
      setToast({
        show: true,
        message: 'MetaMask is required to complete this B2B stablecoin settlement.',
        txHash: 'Wallet Required'
      });
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Automatically sync wallet address if it doesn't match or is a demo address
      if (!userProfile.walletAddress || userProfile.walletAddress.startsWith('0xdemo') || userProfile.walletAddress.toLowerCase() !== userAddress.toLowerCase()) {
        const token = localStorage.getItem('fehuvia_token');
        if (token) {
          try {
            await fetch(`${API_BASE}/api/auth/wallet`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ walletAddress: userAddress })
            });
          } catch (err) {
            console.warn("Failed to auto-update wallet address on backend during settlement:", err);
          }
        }
        setUserProfile(prev => {
          const updated = { ...prev, walletAddress: userAddress };
          localStorage.setItem('fehuvia_user', JSON.stringify(updated));
          return updated;
        });
      }

      // Deployed contract addresses in our sandbox
      const USDC_ADDRESS = import.meta.env.VITE_USDC_CONTRACT_ADDRESS || "0xD8FCA101505D9F698485B22dCC79dF2Ec7a24660";
      const SETTLEMENT_ADDRESS = import.meta.env.VITE_SETTLEMENT_CONTRACT_ADDRESS || "0xFc2Cc77640Ba5dEccD22BA0045a698b504871d95";

      // ABIs
      const ERC20_ABI = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function balanceOf(address account) view returns (uint256)",
        "function mint(address to, uint256 amount) returns (bool)"
      ];

      const SETTLEMENT_ABI = [
        "function settleInvoice(string invoiceId, address supplier, uint256 amount) external"
      ];

      const amountDecimals = ethers.parseUnits(targetInvoice.amount.toString(), 6);
      const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
      const settlement = new ethers.Contract(SETTLEMENT_ADDRESS, SETTLEMENT_ABI, signer);

      // Faucet Auto-Mint: If buyer lacks enough mUSDC, automatically mint 50k tokens!
      const balanceOnChain = await usdc.balanceOf(userAddress);
      if (balanceOnChain < amountDecimals) {
        setToast({
          show: true,
          message: 'Zero mUSDC detected. Executing faucet minting transaction in MetaMask...',
          txHash: 'USDC Faucet'
        });
        const mintTx = await usdc.mint(userAddress, ethers.parseUnits("50000", 6));
        await mintTx.wait();
      }

      // Allowance Approval Check
      const currentAllowance = await usdc.allowance(userAddress, SETTLEMENT_ADDRESS);
      if (currentAllowance < amountDecimals) {
        setToast({
          show: true,
          message: 'USDC allowance approval required. Confirm transaction in MetaMask...',
          txHash: 'Approval Request'
        });
        const approveTx = await usdc.approve(SETTLEMENT_ADDRESS, ethers.parseUnits("1000000", 6));
        await approveTx.wait();
      }

      // Invoice Settlement Transaction
      setToast({
        show: true,
        message: `Settling ${targetInvoice.id} ($${targetInvoice.amount.toLocaleString()}) via B2BSettlement contract...`,
        txHash: 'Signing Invoice'
      });

      // Fetch the latest live wallet address of the supplier from the database right before signing to avoid stale client-side caches
      let supplierWallet = targetInvoice.supplierWallet || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
      try {
        const checkRes = await fetch(`${API_BASE}/api/suppliers/check?name=${encodeURIComponent(targetInvoice.supplier)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.exists && checkData.walletAddress) {
            supplierWallet = checkData.walletAddress;
            console.log(`🎯 Dynamically resolved latest live supplier wallet address from database: ${supplierWallet}`);
          }
        }
      } catch (err) {
        console.warn("Failed to dynamically check latest supplier wallet address from backend:", err);
      }

      const settleTx = await settlement.settleInvoice(targetInvoice.id, supplierWallet, amountDecimals);
      const receipt = await settleTx.wait();
      const txHash = receipt.hash;

      // 3. Database synchronization call
      const res = await fetch(`${API_BASE}/api/invoices/${id}/settle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txHash })
      });

      if (!res.ok) {
        throw new Error('Database settlement sync failed.');
      }

      setInvoices(prev => prev.map(inv => {
        if (inv.id === id) {
          // Adjust top-level available balances and total portfolio values
          setBalance(prevBal => Math.max(0, prevBal - inv.amount));

          // Trigger toast
          setToast({
            show: true,
            message: `Invoice ${inv.id} ($${inv.amount.toLocaleString()}) successfully settled on-chain via MetaMask!`,
            txHash: `${txHash.substring(0, 10)}...${txHash.substring(56)}`
          });

          // Append to dynamic notifications
          setNotifications(prev => [
            {
              id: `notif-${Date.now()}`,
              title: 'Morph Transaction Cleared',
              message: `Invoice ${inv.id} ($${inv.amount.toLocaleString()}) successfully settled on-chain via MetaMask!`,
              time: 'Just now',
              read: false,
              type: 'success',
              meta: `Tx: ${txHash.substring(0, 10)}...${txHash.substring(56)}`
            },
            ...prev
          ]);

          return { ...inv, loading: false, settled: true, txHash: txHash };
        }
        return inv;
      }));

      // Background refresh of AI forecasts, user balances, exchange rates, and settled payments
      fetchPredictions();
      fetchProfile();
      fetchInvoices();
      fetchRates();
      fetchPayments();

    } catch (err) {
      console.error('Error settling invoice on-chain:', err);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: false } : inv));
      
      setToast({
        show: true,
        message: getFriendlyError(err, 'settlement'),
        txHash: getErrorBadge('settlement')
      });
    }
  };

  // Handle invoice postpone scheduling
  const handleSchedule = (id) => {
    const targetInvoice = invoices.find(inv => inv.id === id);
    if (!targetInvoice) return;

    const today = new Date();
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());

    // Calculate dynamic optimal date (5 days after original due date)
    let optDate = new Date(targetInvoice.dueDate);
    if (isNaN(optDate.getTime())) {
      optDate = new Date();
    }
    optDate.setDate(optDate.getDate() + 5);
    const optimalDateStr = optDate.toISOString().substring(0, 10);

    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (optimalDateStr < todayString) {
      setSelectedScheduleDate(todayString);
    } else {
      setSelectedScheduleDate(optimalDateStr);
    }

    setScheduleModal({
      isOpen: true,
      invoice: targetInvoice
    });
  };

  const handlePrevMonth = () => {
    const today = new Date();
    if (calendarYear < today.getFullYear() || (calendarYear === today.getFullYear() && calendarMonth <= today.getMonth())) {
      return;
    }
    setCalendarMonth(prev => {
      if (prev === 0) {
        setCalendarYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => {
      if (prev === 11) {
        setCalendarYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const executeScheduling = async (id, dateStr) => {
    try {
      const token = localStorage.getItem('fehuvia_token');
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/invoices/${id}/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scheduledDate: dateStr
        })
      });

      if (res.ok) {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, scheduled: true, dueDate: dateStr } : inv));
        
        setToast({
          show: true,
          message: `Invoice ${id} successfully postponed to ${dateStr}.`,
          txHash: 'Calendar Postpone Updated'
        });

        setScheduleModal({ isOpen: false, invoice: null });
        fetchPredictions();
        fetchInvoices();
      } else {
        throw new Error('Failed to update scheduled date.');
      }
    } catch (err) {
      console.error('Error postponing invoice:', err);
      setToast({
        show: true,
        message: getFriendlyError(err, 'schedule'),
        txHash: getErrorBadge('schedule')
      });
    }
  };

  const renderCalendar = (invoice) => {
    if (!invoice) return null;
    
    const year = calendarYear;
    const monthIndex = calendarMonth;

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const firstDayIndex = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const isPrevDisabled = (year < today.getFullYear()) || (year === today.getFullYear() && monthIndex <= today.getMonth());

    const cells = [];
    // Blank padding days
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ type: 'empty', id: `empty-${i}` });
    }
    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const origDueDate = new Date(invoice.dueDate);
      const optDate = new Date(origDueDate);
      optDate.setDate(optDate.getDate() + 5);
      const optimalString = optDate.toISOString().substring(0, 10);
      
      const isOptimal = dateString === optimalString;
      const isOriginalDue = dateString === invoice.dueDate;
      const isPast = dateString < todayString;
      
      cells.push({
        type: 'day',
        day,
        dateString,
        isOptimal,
        isOriginalDue,
        isPast
      });
    }

    return (
      <div className="space-y-4">
        {/* Month Navigation Title with Centered Navigation Buttons */}
        <div className="flex items-center justify-between relative mb-2">
          {/* Left Spacer to perfectly balance the right-side badge and keep the center aligned */}
          <div className="w-20 hidden xs:block"></div>
          
          <div className="flex items-center gap-3 mx-auto">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={isPrevDisabled}
              className="p-1.5 rounded-lg border border-[#2C2C2C] bg-[#0a0a0c] hover:bg-[#161618] text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-white uppercase tracking-wider min-w-[120px] text-center">{months[monthIndex]} {year}</span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-[#2C2C2C] bg-[#0a0a0c] hover:bg-[#161618] text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right badge container with balanced width */}
          <div className="w-20 flex justify-end shrink-0">
            {userProfile.automationLevel === 'semi' && (
              <div className="flex items-center gap-1 text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider animate-pulse bg-[#D4AF37]/5 px-2 py-1 rounded-full border border-[#D4AF37]/15">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]"></span>
                <span>AI Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Days of Week headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell, idx) => {
            if (cell.type === 'empty') {
              return <div key={cell.id} className="aspect-square"></div>;
            }

            const isSelected = selectedScheduleDate === cell.dateString;
            const showOptimalHighlight = userProfile.automationLevel === 'semi' && cell.isOptimal;

            return (
              <button
                key={idx}
                type="button"
                disabled={cell.isPast}
                onClick={() => setSelectedScheduleDate(cell.dateString)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer border transition-all ${
                  cell.isPast
                    ? 'bg-[#0a0a0c]/30 border-[#1b1b1d] text-white/20 cursor-not-allowed'
                    : isSelected
                    ? 'bg-gold-metallic border-gold-metallic text-black font-extrabold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : showOptimalHighlight
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] font-bold shadow-[inset_0_0_8px_rgba(212,175,55,0.25)] hover:bg-[#D4AF37]/25'
                    : cell.isOriginalDue
                    ? 'bg-white/5 border-white/20 text-white/90 hover:bg-white/10'
                    : 'bg-[#0a0a0c] border-[#2C2C2C] text-white/50 hover:bg-[#161618] hover:text-white'
                }`}
              >
                <span className="text-xs">{cell.day}</span>
                {cell.isOriginalDue && !isSelected && !cell.isPast && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white/40"></span>
                )}
                {showOptimalHighlight && !isSelected && !cell.isPast && (
                  <span className="absolute bottom-1 text-[7px] font-black text-[#D4AF37] uppercase tracking-[0.05em] leading-none scale-75">OPT</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Handle invoice manual review
  const handleReview = (id) => {
    const targetInvoice = invoices.find(inv => inv.id === id);
    if (!targetInvoice) return;

    setCheckedItems({
      whitelist: false,
      procurement: false,
      limits: false,
      runway: false
    });
    
    setReviewModal({
      isOpen: true,
      invoice: targetInvoice
    });
  };

  // Handle invoice uploading to live Express API
  const handleUploadInvoice = async (newInv) => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supplier: newInv.supplier,
          amount: newInv.amount,
          dueDate: newInv.dueDate,
          aiStatus: newInv.status
        })
      });

      if (!res.ok) {
        throw new Error('Invoice upload failed.');
      }

      const created = await res.json();
      
      setInvoices(prev => [
        ...prev,
        {
          id: created.id,
          supplier: created.supplier,
          amount: Number(created.amount),
          dueDate: created.dueDate,
          aiAction: {
            status: created.aiStatus,
            message: created.aiStatus === 'safe' ? 'Safe to Pay' : created.aiStatus === 'delay' ? 'Delay 5 Days' : 'Review Required',
            reason: created.aiReason
          },
          settled: created.status === 'settled',
          scheduled: created.status === 'scheduled',
          loading: false,
          txHash: created.txHash,
          supplierWallet: created.supplierWallet
        }
      ]);

      setToast({
        show: true,
        message: `Invoice ${created.id} uploaded successfully. AI safety analysis completed.`,
        txHash: 'Upload Registered'
      });

      // Append to dynamic notifications
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: 'New Invoice Uploaded',
          message: `Invoice ${created.id} uploaded successfully. AI safety analysis completed.`,
          time: 'Just now',
          read: false,
          type: 'info',
          meta: `Supplier: ${created.supplier}`
        },
        ...prev
      ]);

      // Refresh the runway predictions
      fetchPredictions();

    } catch (err) {
      console.error('Error uploading invoice:', err);
      setToast({
        show: true,
        message: getFriendlyError(err, 'upload'),
        txHash: getErrorBadge('upload')
      });
    }
  };

  // Derived metrics counters
  const activeInvoices = invoices.filter(inv => !inv.settled);
  const pendingCount = activeInvoices.length;
  const pendingTotal = activeInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const userEmail = userProfile.email || 'admin@fehuvia.com';
  const businessName = userProfile.username || userEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' Corp';

  return (
    <div className="dark h-screen bg-[#070708] flex relative overflow-hidden font-outfit text-white">
      
      {/* 1. Dashboard Sidebar Panel */}
      <Sidebar setView={setView} currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={() => setShowLogoutConfirm(true)} />

      {/* 2. Main Workstation Space - styled with premium Figma beveled solid borders */}
      <main 
        ref={mainRef}
        onScroll={handleMainScroll}
        className="flex-1 overflow-auto relative"
        style={{
          border: '4px solid #2C2C2C',
          background: 'linear-gradient(145deg, #0a0a0c 0%, #070708 50%, #040405 100%)',
          boxShadow: `
            inset 0 2px 2px rgba(255, 255, 255, 0.015),
            inset 0 -2px 4px rgba(0, 0, 0, 0.7),
            inset 2px 0 2px rgba(0, 0, 0, 0.4),
            inset -2px 0 2px rgba(255, 255, 255, 0.01)
          `
        }}>
        
        {/* Dynamic Translucent Morph Toast alert */}
        {toast.show && (() => {
          const type = toast.type || (
            (toast.txHash?.toLowerCase().includes('failed') || 
             toast.txHash?.toLowerCase().includes('error') || 
             toast.message?.toLowerCase().includes('could not') ||
             toast.message?.toLowerCase().includes('fail') ||
             toast.message?.toLowerCase().includes('reject')) ? 'error' : 'success'
          );
          
          let title = toast.title || 'Notification';
          let borderClass = 'border-emerald-500/35';
          let iconBgClass = 'bg-emerald-500/10 border border-emerald-500/30';
          let iconColorClass = 'text-emerald-400';
          let badgeClass = 'text-emerald-400 bg-emerald-950/20 border border-emerald-500/20';
          let IconComponent = Check;

          if (type === 'error') {
            title = toast.title || 'Transaction Failed';
            borderClass = 'border-red-500/35';
            iconBgClass = 'bg-red-500/10 border border-red-500/30';
            iconColorClass = 'text-red-400';
            badgeClass = 'text-red-400 bg-red-950/20 border border-red-500/20';
            IconComponent = X;
          } else if (type === 'warning') {
            title = toast.title || 'Warning Alert';
            borderClass = 'border-amber-500/35';
            iconBgClass = 'bg-amber-500/10 border border-amber-500/30';
            iconColorClass = 'text-amber-400';
            badgeClass = 'text-amber-400 bg-amber-950/20 border border-amber-500/20';
            IconComponent = ShieldAlert;
          } else if (type === 'info') {
            title = toast.title || 'System Information';
            borderClass = 'border-sky-500/35';
            iconBgClass = 'bg-sky-500/10 border border-sky-500/30';
            iconColorClass = 'text-sky-400';
            badgeClass = 'text-sky-400 bg-sky-950/20 border border-sky-500/20';
            IconComponent = Info;
          } else if (type === 'disabled') {
            title = toast.title || 'Feature Locked';
            borderClass = 'border-zinc-500/35';
            iconBgClass = 'bg-zinc-500/10 border border-zinc-500/30';
            iconColorClass = 'text-zinc-400';
            badgeClass = 'text-zinc-400 bg-zinc-950/20 border border-zinc-500/20';
            IconComponent = ShieldAlert;
          } else {
            title = toast.title || 'Morph Transaction Cleared';
          }

          return (
            <div className={`fixed bottom-6 right-6 z-50 p-4 w-96 rounded-xl border ${borderClass} bg-[#0d0d0f]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-[fadeIn_0.3s_ease-out] flex gap-3.5 items-start`}>
              <div className={`h-8 w-8 shrink-0 rounded-full ${iconBgClass} flex items-center justify-center`}>
                <IconComponent className={`w-4 h-4 ${iconColorClass}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white uppercase tracking-wider">{title}</p>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">{toast.message}</p>
                {toast.txHash && (
                  <p className={`text-[9px] font-mono ${badgeClass} mt-2 rounded px-1.5 py-0.5 inline-block`}>
                    Tx: {toast.txHash}
                  </p>
                )}
              </div>
              <button
                onClick={() => setToast({ show: false, message: '', txHash: '' })}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })()}

        {/* WORKSTATION BLURRED WRAPPER CONTAINER */}
        <div className={`transition-all duration-700 flex flex-col min-h-full ${!userProfile.walletAddress ? 'blur-md pointer-events-none select-none' : ''}`}>

        {/* Workspace Header — collapses on scroll via CSS only (no mount/unmount) */}
        <header className={`px-4 sm:px-8 sticky top-0 z-10 transition-all duration-300 border-b ${
          isHeaderScrolled 
            ? 'py-2 bg-[#0a0a0b]/40 backdrop-blur-2xl border-[#e4c37a]/15' 
            : 'py-4 sm:py-5 bg-[#0a0a0b]/80 border-[#2C2C2C] backdrop-blur-md'
        }`}
                style={{
                  boxShadow: isHeaderScrolled ? '0 4px 30px rgba(0, 0, 0, 0.4)' : '0 1px 0 rgba(255, 255, 255, 0.01)',
                }}>
          <div className="flex items-center justify-between gap-4">
            
            {/* Header values */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              
              {/* Business Brand Block */}
              <div className="cursor-pointer text-left mr-1 sm:mr-2" onClick={() => setCurrentPage('Profile')}>
                <div className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-6 opacity-100 mb-1'}`}>
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.12em] whitespace-nowrap">SME Account</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.12em] hidden sm:inline transition-all duration-300 ${isHeaderScrolled ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>SME</span>
                  <span className={`font-black text-white leading-tight transition-all duration-300 tracking-wide ${isHeaderScrolled ? 'text-sm' : 'text-base sm:text-lg'}`}>
                    {businessName}
                  </span>
                </div>
              </div>

              <div className={`w-px bg-[#2C2C2C] hidden sm:block transition-all duration-300 ${isHeaderScrolled ? 'h-5' : 'h-10'}`}></div>

              {/* Portfolio Value */}
              <div className="cursor-pointer" onClick={() => setCurrentPage('Dashboard')}>
                {/* Label row — collapses via max-height + opacity */}
                <div className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-6 opacity-100 mb-1'}`}>
                  <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider whitespace-nowrap">Portfolio Value</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#6a6a6a] cursor-help shrink-0 hidden xs:inline" />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Compact label visible only when collapsed */}
                  <span className={`text-[9px] font-bold text-[#6a6a6a] uppercase tracking-wider hidden sm:inline transition-all duration-300 ${isHeaderScrolled ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>Portfolio</span>
                  <span className={`font-black text-white leading-tight transition-all duration-300 ${isHeaderScrolled ? 'text-sm' : 'text-lg sm:text-2xl'}`}>
                    ₱{portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {/* Growth badge — collapses */}
                  <span className={`text-[10px] font-bold tracking-wide text-gold-metallic ml-1 whitespace-nowrap hidden xs:inline transition-all duration-300 ${isHeaderScrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                    +₱19,160,848 (12.5%)
                  </span>
                </div>
              </div>

              <div className={`w-px bg-[#2C2C2C] hidden sm:block transition-all duration-300 ${isHeaderScrolled ? 'h-5' : 'h-10'}`}></div>

              {/* Available balance (Philippine Pesos Bank balance) */}
              <div className="cursor-pointer" onClick={() => setCurrentPage('Dashboard')}>
                <div className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-6 opacity-100 mb-1'}`}>
                  <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider whitespace-nowrap">Bank Treasury</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#6a6a6a] cursor-help shrink-0 hidden xs:inline" />
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`text-[9px] font-bold text-[#6a6a6a] uppercase tracking-wider hidden sm:inline transition-all duration-300 ${isHeaderScrolled ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>PHP</span>
                  <span className={`font-black text-white leading-tight transition-all duration-300 ${isHeaderScrolled ? 'text-sm' : 'text-lg sm:text-2xl'}`}>
                    ₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* On-Chain USDC Balance */}
              <div className={`w-px bg-[#2C2C2C] hidden sm:block transition-all duration-300 ${isHeaderScrolled ? 'h-5' : 'h-10'}`}></div>
              <div className="cursor-pointer" onClick={() => setCurrentPage('Profile')}>
                <div className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-6 opacity-100 mb-1'}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${userProfile.walletAddress ? 'text-emerald-400' : 'text-white/30'}`}>
                    {userProfile.walletAddress ? 'On-Chain USDC' : 'USDC Disconnected'}
                  </span>
                  {userProfile.walletAddress && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:inline transition-all duration-300 ${userProfile.walletAddress ? 'text-emerald-400' : 'text-white/30'} ${isHeaderScrolled ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
                    USDC
                  </span>
                  <span className={`font-black leading-tight transition-all duration-300 ${userProfile.walletAddress ? 'text-emerald-400 font-mono' : 'text-white/20'} ${isHeaderScrolled ? 'text-sm' : 'text-lg sm:text-2xl'}`}>
                    {userProfile.walletAddress ? `$${walletUSDCBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$ --.--'}
                  </span>
                </div>
              </div>

              {/* Inline metrics — fade in when collapsed */}
              <div className={`items-center gap-5 transition-all duration-300 hidden lg:flex ${isHeaderScrolled ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                <div className="w-px h-5 bg-[#2C2C2C] shrink-0"></div>
                <div className="flex items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setCurrentPage('Invoices')}>
                  <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-white">{pendingCount}</span>
                  <span className="text-[9px] text-[#6a6a6a]">pending</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setCurrentPage('Analytics')}>
                  <TrendingUp className="w-3.5 h-3.5 text-[#4ade80]" />
                  <span className="text-xs font-bold text-white">94%</span>
                </div>
                <div className="flex items-center gap-1.5 cursor-pointer shrink-0" onClick={() => setCurrentPage('Cash Flow')}>
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-white">1.2d</span>
                </div>
              </div>

            </div>

            {/* Profile block */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative" ref={dropdownRef}>

              {/* Connect Wallet Header Button (only shown if not connected) */}
              {!userProfile.walletAddress && (
                <button
                  onClick={handleConnectWallet}
                  className={`flex items-center gap-1.5 border border-[#D4AF37]/45 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/12 hover:border-[#D4AF37]/70 active:scale-95 transition-all text-gold-metallic rounded-xl font-bold uppercase tracking-wider text-[10px] cursor-pointer ${
                    isHeaderScrolled ? 'px-2.5 py-1.5' : 'px-3.5 py-2 sm:py-2.5'
                  }`}
                  style={{
                    boxShadow: '0 2px 10px rgba(212, 175, 55, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Connect Wallet</span>
                </button>
              )}
              
              {/* Help Button trigger */}
              <button
                onClick={() => setCurrentPage('Help')}
                className={`hover:bg-[#161618]/60 rounded-xl border border-transparent hover:border-[#2C2C2C] transition-all relative cursor-pointer ${
                  currentPage === 'Help' ? 'bg-[#161618] border-[#2C2C2C]' : ''
                } ${isHeaderScrolled ? 'p-1.5' : 'p-2 sm:p-2.5'}`}
                title="Help Center"
              >
                <HelpCircle className={`text-[#a1a1a1] transition-all duration-300 ${isHeaderScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </button>

              {/* Bell notifications Button */}
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className={`hover:bg-[#161618] rounded-xl border border-transparent hover:border-[#2C2C2C] transition-all relative cursor-pointer ${
                  showNotificationsDropdown 
                    ? 'bg-[#161618] border-[#2C2C2C]' 
                    : ''
                } ${isHeaderScrolled ? 'p-1.5' : 'p-2 sm:p-2.5'}`}
              >
                <Bell className={`text-[#a1a1a1] transition-all duration-300 ${isHeaderScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#D4AF37] rounded-full ring-2 ring-[#0a0a0b]"></span>
                )}
              </button>

              {/* Glassmorphic Dropdown Panel */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-2xl border border-[#2C2C2C] bg-[#0a0a0c]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out] flex flex-col font-outfit text-white"
                     style={{
                       boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), 0 25px 60px -15px rgba(0, 0, 0, 0.9)'
                     }}>
                  
                  {/* Dropdown Header */}
                  <div className="px-5 py-4 border-b border-[#2C2C2C] flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Notifications</h3>
                      <p className="text-[10px] text-[#6a6a6a] mt-0.5">{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        }}
                        className="text-[10px] font-bold text-gold-metallic hover:text-white transition-colors cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Dropdown List */}
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-[#1b1b1d]">
                    {notifications.length === 0 ? (
                      <div className="py-12 px-5 text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-[#101012] border border-[#2C2C2C] flex items-center justify-center mb-3">
                          <Bell className="w-4 h-4 text-[#6a6a6a]" />
                        </div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">All caught up!</p>
                        <p className="text-[10px] text-[#6a6a6a] mt-1">No recent transaction notifications.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 4).map(notif => {
                        const isSuccess = notif.type === 'success';
                        const isWarning = notif.type === 'warning';
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                              setShowNotificationsDropdown(false);
                              if (notif.id === 'notif-skipped-config') {
                                setCurrentPage('Profile');
                              } else {
                                setCurrentPage('Notifications');
                              }
                            }}
                            className={`p-4 flex gap-3 hover:bg-[#161618]/60 transition-colors cursor-pointer text-left ${
                              notif.read ? 'opacity-65' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg border shrink-0 flex items-center justify-center mt-0.5 ${
                              isSuccess 
                                ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                                : isWarning 
                                ? 'bg-amber-950/20 border-amber-500/20 text-amber-400'
                                : 'bg-blue-950/15 border-blue-500/20 text-blue-400'
                            }`}>
                              {isSuccess && <CreditCard className="w-3.5 h-3.5" />}
                              {isWarning && <ShieldAlert className="w-3.5 h-3.5" />}
                              {!isSuccess && !isWarning && <Sparkles className="w-3.5 h-3.5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-xs font-bold truncate ${notif.read ? 'text-white/70' : 'text-white'}`}>{notif.title}</p>
                                <span className="text-[9px] text-[#6a6a6a] whitespace-nowrap">{notif.time}</span>
                              </div>
                              <p className="text-[10px] text-white/50 leading-relaxed mt-1 line-clamp-2">{notif.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <button
                    onClick={() => {
                      setShowNotificationsDropdown(false);
                      setCurrentPage('Notifications');
                    }}
                    className="w-full py-3 text-xs font-bold text-center border-t border-[#2C2C2C] bg-[#0c0c0e] hover:bg-[#161618] transition-colors text-white cursor-pointer"
                  >
                    View All Notifications
                  </button>

                </div>
              )}
              
              <div
                onClick={() => setCurrentPage('Profile')}
                className={`flex items-center gap-2 hover:bg-[#161618] rounded-xl border border-transparent hover:border-[#2C2C2C] transition-all cursor-pointer ${isHeaderScrolled ? 'px-2 py-1.5' : 'px-3 py-2'}`}
              >
                <div className={`rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isHeaderScrolled ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 h-9'}`}
                     style={{
                       background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                       boxShadow: '0 2px 8px rgba(212, 175, 55, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.3)'
                     }}>
                  <User className={`text-[#0a0a0a] transition-all duration-300 ${isHeaderScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 h-5'}`} />
                </div>
                {/* Name — collapses via CSS */}
                <div className={`text-left hidden sm:block overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-w-0 opacity-0' : 'max-w-[220px] opacity-100'}`}>
                  <p className="text-sm font-bold text-white leading-none mb-0.5 whitespace-nowrap truncate" title={businessName}>
                    {businessName}
                  </p>
                  <p className="text-[10px] text-[#a1a1a1] leading-none whitespace-nowrap flex items-center gap-1 truncate" title={userProfile.walletAddress || userProfile.email}>
                    {userProfile.walletAddress ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[9px] font-mono text-emerald-400">{userProfile.walletAddress.substring(0, 6)}...{userProfile.walletAddress.substring(38)}</span>
                      </>
                    ) : (
                      userProfile.email
                    )}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Metrics sub-bar — collapses via CSS height, always in DOM */}
        <div className={`px-4 sm:px-8 border-b border-[#2C2C2C] overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-h-0 py-0 opacity-0 border-transparent' : 'max-h-36 sm:max-h-24 py-4 sm:py-5 opacity-100'}`}
             style={{
               boxShadow: isHeaderScrolled ? 'none' : '0 1px 0 rgba(255, 255, 255, 0.01)'
             }}>
          <div className="grid grid-cols-3 gap-3 md:flex md:items-center md:gap-8">
            
            {/* Stat: Pending payables */}
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 cursor-pointer text-center sm:text-left" onClick={() => setCurrentPage('Invoices')}>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border border-[#2C2C2C] shrink-0"
                   style={{
                     background: 'linear-gradient(145deg, #101012 0%, #070709 100%)',
                     boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), inset 0 -1px 1px rgba(0, 0, 0, 0.4)'
                   }}>
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] sm:text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider truncate">Pending</p>
                <p className="text-xs sm:text-base font-bold text-white leading-tight truncate">
                  {pendingCount} <span className="text-[9px] sm:text-xs text-[#6a6a6a] font-normal hidden xs:inline">(${pendingTotal.toLocaleString()})</span>
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-[#2C2C2C] hidden md:block"></div>

            {/* Stat: AI Runway */}
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 cursor-pointer text-center sm:text-left" onClick={() => setCurrentPage('Analytics')}>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border border-[#2C2C2C] shrink-0"
                   style={{
                     background: 'linear-gradient(145deg, #101012 0%, #070709 100%)',
                     boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), inset 0 -1px 1px rgba(0, 0, 0, 0.4)'
                   }}>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#4ade80]" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] sm:text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider truncate">AI Runway</p>
                <p className="text-xs sm:text-base font-bold text-white leading-tight truncate">
                  {invoices.length > 0 ? `${runway} Days` : '0 Days'} {invoices.length > 0 && <span className="text-[9px] sm:text-xs text-[#4ade80] font-semibold uppercase tracking-wider hidden xs:inline">{trend.toUpperCase()}</span>}
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-[#2C2C2C] hidden md:block"></div>

            {/* Stat: settlement latency */}
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 cursor-pointer text-center sm:text-left" onClick={() => setCurrentPage('Cash Flow')}>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border border-[#2C2C2C] shrink-0"
                   style={{
                     background: 'linear-gradient(145deg, #101012 0%, #070709 100%)',
                     boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), inset 0 -1px 1px rgba(0, 0, 0, 0.4)'
                   }}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] sm:text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider truncate">Settled</p>
                <p className="text-xs sm:text-base font-bold text-white leading-tight truncate">
                  {payments.length > 0 ? '1.2d' : '0.0d'} {payments.length > 0 && <span className="text-[9px] sm:text-xs text-gold-metallic font-semibold hidden xs:inline">-24%</span>}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Workspace Panels Grid */}
        <div className="p-4 sm:p-8 pb-24 sm:pb-8 space-y-8">
          
          {currentPage === 'Dashboard' && (
            <>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <h2 className="text-xs text-[#6a6a6a] uppercase tracking-[0.2em] font-bold">Financial Overview</h2>
                  
                  <button
                    onClick={() => setCurrentPage('Transactions')}
                    className="px-3.5 py-1.5 rounded-lg border border-[#2C2C2C]/80 bg-[#101012] hover:bg-[#161618] hover:border-[#D4AF37]/30 text-[#a1a1a1] hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-lg"
                    style={{ textShadow: '0 1px 1px rgba(0, 0, 0, 0.4)' }}
                  >
                    <Clock className="w-3.5 h-3.5 text-gold-metallic animate-spin" style={{ animationDuration: '4s' }} />
                    <span>View Transaction History Ledger</span>
                  </button>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-[#0a0a0c] border border-[#2C2C2C] rounded-lg p-1">
                  {['Today', 'Week', '30 Days', 'All Time'].map((tf) => {
                    const isActive = dashboardTimeframe === tf;
                    return (
                      <button
                        key={tf}
                        onClick={() => setDashboardTimeframe(tf)}
                        className={`px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? 'text-white rounded-md border border-[#2C2C2C] bg-[#161618]' 
                            : 'text-[#6a6a6a] hover:text-white font-medium'
                        }`}
                        style={isActive ? {
                          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), inset 0 -1px 1px rgba(0, 0, 0, 0.5)'
                        } : {}}
                      >
                        {tf}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Forecast Area Chart + AI Recommendations Grid */}
              {dashboardLoading ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Forecast Area Chart Skeleton */}
                    <div className="lg:col-span-2 plate-black-metallic p-6 border border-[#2C2C2C] h-[340px] animate-pulse relative overflow-hidden flex flex-col justify-between"
                         style={{ background: 'linear-gradient(145deg, #0d0d0d 0%, #080808 100%)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)' }}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="h-4 w-40 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                          <div className="h-3 w-64 bg-[#161618] border border-[#2C2C2C] rounded-md opacity-60"></div>
                        </div>
                        <div className="h-7 w-20 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                      </div>
                      <div className="h-36 w-full bg-[#161618]/40 border border-[#2C2C2C]/50 rounded-xl relative overflow-hidden flex items-end p-2 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className="flex-1 bg-[#2C2C2C]/30 border border-[#2C2C2C]/40 rounded-t-md" style={{ height: `${20 + Math.sin(i) * 50}%` }}></div>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <div className="h-3 w-16 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                        <div className="h-3 w-16 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                        <div className="h-3 w-16 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                      </div>
                    </div>

                    {/* AI Copilot Sidebar Skeleton */}
                    <div className="bg-[#0d0d0f] border border-[#2C2C2C] rounded-xl overflow-hidden p-6 h-[340px] animate-pulse flex flex-col justify-between"
                         style={{ background: 'linear-gradient(145deg, #0d0d0d 0%, #080808 100%)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2C2C2C]/20 border border-[#2C2C2C]/50 flex items-center justify-center shrink-0"></div>
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 w-32 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                          <div className="h-3 w-24 bg-[#161618] border border-[#2C2C2C] rounded-md opacity-60"></div>
                        </div>
                      </div>
                      <div className="space-y-3 flex-1 mt-5">
                        {Array.from({ length: 3 }).map((_, idx) => {
                          const colors = idx === 0 
                            ? 'border-emerald-500/10 bg-emerald-950/5' 
                            : idx === 1 
                            ? 'border-red-500/10 bg-red-950/5' 
                            : 'border-blue-500/10 bg-blue-950/5';
                          return (
                            <div key={idx} className={`p-3 rounded-lg border ${colors} flex gap-3 items-center`}>
                              <div className="w-8 h-8 rounded-lg bg-[#161618]/50 border border-[#2C2C2C]/40 shrink-0"></div>
                              <div className="space-y-2 flex-1">
                                <div className="h-2.5 w-16 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                                <div className="h-2 w-full bg-[#161618] border border-[#2C2C2C] rounded-md opacity-70"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Payables Ledger Table Panel Skeleton */}
                  <div className="plate-black-metallic p-6 border border-[#2C2C2C] space-y-5 animate-pulse"
                       style={{ background: 'linear-gradient(145deg, #0d0d0d 0%, #080808 100%)', boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)' }}>
                    <div className="flex justify-between items-center border-b border-[#2C2C2C] pb-4">
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                        <div className="h-3 w-72 bg-[#161618] border border-[#2C2C2C] rounded-md opacity-60"></div>
                      </div>
                      <div className="h-8 w-28 bg-[#161618] border border-[#2C2C2C] rounded-full"></div>
                    </div>
                    
                    <div className="space-y-3.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-[#2C2C2C]/40 bg-[#0c0c0e]/30 gap-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-9 h-9 rounded-xl bg-[#161618]/50 border border-[#2C2C2C]/40 flex items-center justify-center shrink-0"></div>
                            <div className="space-y-2 flex-1">
                              <div className="h-3 w-32 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                              <div className="h-2.5 w-20 bg-[#161618] border border-[#2C2C2C] rounded-md opacity-60"></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                            <div className="h-3.5 w-16 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                            <div className="h-5 w-24 bg-[#161618] border border-[#2C2C2C] rounded-md"></div>
                            <div className="h-8 w-24 bg-[#161618] border border-[#2C2C2C] rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div id="coach-runway-chart" className="lg:col-span-2">
                      <CashflowPrediction predictions={predictions} balance={balance} timeframe={dashboardTimeframe} />
                    </div>
                    <div id="coach-copilot-sidebar">
                      <AICopilot predictions={predictions} />
                    </div>
                  </div>

                  {/* Payables Ledger Table Panel */}
                  <div id="coach-payables-ledger" className="space-y-4">
                    <InvoiceManagement
                      invoices={[
                        ...invoices.filter(inv => inv.status !== 'settled'),
                        ...invoices.filter(inv => inv.status === 'settled')
                      ].slice(0, 5)}
                      handleSettle={handleSettle}
                      handleSchedule={handleSchedule}
                      handleReview={handleReview}
                      automationLevel={userProfile.automationLevel}
                    />
                    
                    {/* See All Invoices Navigation Button */}
                    <div className="flex justify-end pr-2">
                      <button
                        onClick={() => setCurrentPage('Invoices')}
                        className="px-5 py-2.5 rounded-lg border border-[#2C2C2C] bg-[#0c0c0e]/60 hover:bg-[#161618] hover:border-[#D4AF37]/30 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-md"
                      >
                        <span>See All Invoices</span>
                        <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {currentPage === 'Cash Flow' && (
            <div id="coach-cashflow-view" className="animate-fadeIn">
              <CashFlowView predictions={predictions} runway={runway} />
            </div>
          )}

          {currentPage === 'Invoices' && (
            <div id="coach-invoices-view" className="animate-fadeIn">
              <InvoicesView
                invoices={invoices}
                handleSettle={handleSettle}
                handleSchedule={handleSchedule}
                handleUploadInvoice={handleUploadInvoice}
                handleReview={handleReview}
                automationLevel={userProfile.automationLevel}
              />
            </div>
          )}


          {currentPage === 'Transactions' && (
            <div id="coach-transactions-view" className="animate-fadeIn">
              <TransactionsView API_BASE={API_BASE} setToast={setToast} />
            </div>
          )}

          {currentPage === 'Treasury' && (
            <div id="coach-treasury-view" className="space-y-6 animate-fadeIn text-left animate-[slideIn_0.3s_ease-out]">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2C2C2C] pb-5">
                <div>
                  <h1 className="font-cormorant text-2xl sm:text-3xl text-white font-light tracking-wide flex items-center gap-2.5">
                    <Landmark className="w-7 h-7 text-[#D4AF37] shrink-0 animate-pulse" />
                    <span>Open Finance Treasury</span>
                  </h1>
                  <p className="text-[#6a6a6a] text-xs font-light mt-1.5 leading-relaxed">
                    Securely monitor and manage your Philippine Peso commercial accounts and e-wallet balances.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Brankas Secure Open Finance API</span>
                </div>
              </div>

              {/* Aggregator Card Grid */}
              <div className="glass-panel-gold rounded-3xl p-6 border border-[#D4AF37]/10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-cormorant text-2xl font-light tracking-wide text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gold-metallic" />
                      Consolidated Treasury Ledger
                    </h3>
                    <p className="text-white/40 text-xs font-light mt-1">
                      Aggregated Peso operating balances loaded across verified Southeast Asia commercial gateways.
                    </p>
                  </div>
                  <div className="bg-[#0a0a0c] border border-[#2C2C2C] rounded-2xl px-6 py-4 flex flex-col items-start sm:items-end justify-center">
                    <span className="text-[9px] uppercase tracking-widest text-[#6a6a6a] font-bold">Total Aggregated PHP Reserves</span>
                    <span className="text-2xl font-bold font-outfit text-gold-metallic mt-1">
                      ₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Institutions Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {(() => {
                    const list = userProfile.linkedBanks || [];
                    const banksToShow = list.length > 0 ? list : [
                      { id: 'gcash', name: 'GCash Corporate Wallet', short: 'GCash', balance: 12500000.00, type: 'wallet', isLinked: bankLinked && bankName === 'GCash' },
                      { id: 'bdo', name: 'Banco de Oro (BDO)', short: 'BDO', balance: 4500000.00, type: 'bank', isLinked: bankLinked && bankName === 'BDO' },
                      { id: 'ubp', name: 'UnionBank of the Philippines', short: 'UnionBank', balance: 3200000.00, type: 'bank', isLinked: bankLinked && bankName === 'UnionBank' },
                      { id: 'bpi', name: 'Bank of the Philippine Islands (BPI)', short: 'BPI', balance: 5800000.00, type: 'bank', isLinked: bankLinked && bankName === 'BPI' },
                      { id: 'maya', name: 'Maya Business Account', short: 'Maya', balance: 1200000.00, type: 'wallet', isLinked: bankLinked && bankName === 'Maya' }
                    ];

                    return banksToShow.map((bank) => {
                      const logoBg = bank.id === 'ubp' ? 'bg-[#FF6600]' :
                                     bank.id === 'bdo' ? 'bg-[#0033A0]' :
                                     bank.id === 'bpi' ? 'bg-[#980000]' :
                                     bank.id === 'gcash' ? 'bg-[#005CE6]' :
                                     bank.id === 'maya' ? 'bg-[#00E676]' : 'bg-[#D4AF37]';
                      
                      return (
                        <div 
                          key={bank.id}
                          className="relative p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[155px] hover:brightness-[1.12] hover:scale-[1.03] shadow-[0_8px_30px_rgba(0,0,0,0.85)] cursor-default"
                          style={bank.isLinked ? {
                            background: 'linear-gradient(135deg, #1f1f23 0%, #0f0f11 25%, #2a2a30 45%, #080809 60%, #151518 100%)',
                            borderColor: 'rgba(212, 175, 55, 0.45)',
                            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05), inset 0 -1px 1px rgba(0, 0, 0, 0.6), 0 0 15px rgba(212, 175, 55, 0.05)'
                          } : {
                            background: 'linear-gradient(135deg, #151518 0%, #0a0a0c 35%, #1a1a1f 65%, #050506 100%)',
                            borderColor: 'rgba(255, 255, 255, 0.06)',
                            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02)',
                            opacity: 0.65
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <BankLogo bankId={bank.id} className="h-9 w-9 shadow-md rounded-xl shrink-0" />
                            {bank.isLinked ? (
                              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3 animate-pulse" /> Linked
                              </span>
                            ) : (
                              <span className="text-[9px] text-white/30 font-light">Unlinked</span>
                            )}
                          </div>

                          <div className="mt-4">
                            <span className="text-[10px] text-white/40 block font-light truncate uppercase tracking-wider">{bank.name}</span>
                            {bank.isLinked ? (
                              <span className="text-base font-bold font-mono text-gold-metallic block mt-1 tracking-wider">
                                ₱{parseFloat(bank.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-base font-mono text-white/20 block mt-1 tracking-wider">₱0.00</span>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[6.5px] font-mono tracking-[0.2em] text-white/20 uppercase font-bold select-none">
                              FEHUVIA TREASURY
                            </span>
                            {bank.isLinked ? (
                              <button
                                onClick={() => handleUnlinkBank(bank.id)}
                                className="text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              >
                                Disconnect
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedBankToLink(bank);
                                  setIsBankModalOpen(true);
                                }}
                                className="text-[9px] font-bold text-[#e4c37a] hover:text-[#f3d99d] transition-colors cursor-pointer"
                              >
                                + Connect Link
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Web3 Settlement Key Connection Plate */}
              <div className="plate-black-metallic shape-asymmetric-1 p-6 border border-[#2C2C2C] mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-gold-metallic">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h3 className="font-cormorant text-2xl font-light tracking-wide text-white">Morph Settlement Wallet</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#0a0a0c] border border-[#2C2C2C] rounded-2xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`h-2 w-2 rounded-full ${userProfile.walletAddress ? 'bg-emerald-500 animate-ping' : 'bg-zinc-600'}`}></span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${userProfile.walletAddress ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {userProfile.walletAddress ? 'Morph Testnet Connected' : 'Morph Testnet Disconnected'}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm font-mono select-all break-all leading-relaxed ${userProfile.walletAddress ? 'text-white/80' : 'text-white/40'}`}>
                      {userProfile.walletAddress ? userProfile.walletAddress : 'No EVM settlement wallet connected.'}
                    </p>
                    {userProfile.walletAddress ? (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-white/40">Network: <strong className="text-white/60">Morph L2</strong></span>
                        <span className="text-xs text-white/40">Gas Token: <strong className="text-white/60">ETH</strong></span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-white/30 mt-1">Please connect your MetaMask wallet to execute settlements on-chain.</p>
                    )}
                  </div>

                  <button
                    onClick={userProfile.walletAddress ? handleDisconnectWallet : () => setIsWalletModalOpen(true)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      userProfile.walletAddress
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                        : 'bg-gold-metallic text-black hover:scale-[1.01]'
                    }`}
                  >
                    {userProfile.walletAddress ? 'Disconnect Wallet' : 'Connect Wallet'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {currentPage === 'Bridge' && (
            <div id="coach-bridge-view" className="animate-fadeIn">
              <BridgeView
                userProfile={userProfile}
                balance={balance}
                walletUSDCBalance={walletUSDCBalance}
                exchangeRate={exchangeRate}
                fetchProfile={fetchProfile}
                fetchPayments={fetchPayments}
                setToast={setToast}
                setNotifications={setNotifications}
                setWalletUSDCBalance={setWalletUSDCBalance}
                gasTelemetry={gasTelemetry}

                prefilledBridgeInvoice={prefilledBridgeInvoice}
                setPrefilledBridgeInvoice={setPrefilledBridgeInvoice}
                setCurrentPage={setCurrentPage}
                executeSettlement={executeSettlement}
                onOpenBankLink={(bank) => {
                  setSelectedBankToLink(bank);
                  setIsBankModalOpen(true);
                }}
              />
            </div>
          )}

          {currentPage === 'Analytics' && (
            <div id="coach-analytics-view" className="animate-fadeIn">
              <AnalyticsView invoices={invoices} predictions={predictions} />
            </div>
          )}

          {currentPage === 'Profile' && (
            <div id="coach-profile-view" className="animate-fadeIn">
              <ProfileView 
                userProfile={userProfile} 
                handleUpdateAutomationLevel={handleUpdateAutomationLevel}
                onResetDemo={handleResetDemoState}
              />
            </div>
          )}

          {currentPage === 'Notifications' && (
            <NotificationsView 
              notifications={notifications} 
              setNotifications={setNotifications} 
            />
          )}

          {currentPage === 'Help' && (
            <HelpView 
              setToast={setToast}
              onStartTour={() => { 
                setToast({
                  show: true,
                  type: 'disabled',
                  message: 'The interactive workstation tour is temporarily disabled.',
                  txHash: 'Tour Disabled'
                });
              }} 
            />
          )}

        </div>
        </div>

        {/* WORKSTATION LOCK OVERLAY */}
        {!userProfile.walletAddress && (
          <div className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[3px] flex items-center justify-center p-6 animate-fadeIn">
            <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative text-center border border-[#D4AF37]/20 flex flex-col items-center">
              
              {/* Pulsing golden shield container */}
              <div className="h-16 w-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-gold-metallic mb-6 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <h2 className="font-cormorant text-3xl font-light tracking-wide text-white mb-3 animate-[fadeIn_0.4s_ease-out]">
                Workstation Gated
              </h2>
              <p className="text-white/50 text-xs md:text-sm font-light leading-relaxed mb-8">
                To safeguard corporate payables, run real-time cash flow predictions, and execute smart stablecoin settlements, Fehuvia requires an active key connection.
              </p>

              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4.5 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect EVM Wallet
              </button>

              <a 
                href="https://morph-rails-hoodi.morph.network/faucet?ref=blog.morph.network" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-[#D4AF37] hover:underline mt-4 inline-flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer"
              >
                Request Morph L2 Gas ETH ↗
              </a>

              <p className="text-[10px] text-white/30 font-light mt-4 flex items-center gap-1.5 justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-pulse"></span>
                Status: Awaiting Morph L2 Key Link
              </p>
            </div>
          </div>
        )}
        
      </main>
      <DemoDisclaimer compact />

      {/* Dynamic Manual Review Checklist Modal */}
      {reviewModal.isOpen && reviewModal.invoice && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-[fadeIn_0.2s_ease-out] font-outfit text-white">
          <div className="glass-panel-gold rounded-3xl w-full max-w-lg p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/35 text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setReviewModal({ isOpen: false, invoice: null })}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="h-14 w-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-gold-metallic mx-auto mb-3 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Treasury Manual Review
              </h3>
              <p className="text-white/40 text-xs font-light mt-1">
                AI Copilot flagged invoice <span className="font-mono text-[#D4AF37] font-semibold">{reviewModal.invoice.id}</span> for multi-factor authorization.
              </p>
            </div>

            {/* Invoice Details Card */}
            <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] space-y-2 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6a6a6a]">Supplier:</span>
                <span className="font-bold text-white">{reviewModal.invoice.supplier}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6a6a6a]">Amount:</span>
                <span className="font-black text-white">${reviewModal.invoice.amount.toLocaleString(undefined, {minimumFractionDigits: 2})} USDC</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6a6a6a]">Due Date:</span>
                <span className="text-white/70">{reviewModal.invoice.dueDate}</span>
              </div>
              <div className="pt-2 border-t border-white/5 text-[11px] text-amber-400 font-light leading-relaxed">
                <span className="font-semibold uppercase tracking-wider block mb-1">AI Recommendation Reason:</span>
                {reviewModal.invoice.aiAction.reason}
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3.5 mb-6">
              <span className="text-[10px] uppercase tracking-wider text-[#6a6a6a] font-bold block mb-1">Manual Verification Checklist</span>
              
              {[
                { id: 'whitelist', label: 'Verify recipient wallet address matches approved vendor whitelist.' },
                { id: 'procurement', label: 'Match invoice metadata against purchase orders & service logs.' },
                { id: 'limits', label: 'Confirm amount lies within your corporate daily spending limits.' },
                { id: 'runway', label: 'Evaluate runway projection models & Morph L2 gas requirements.' }
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/5 bg-[#121214]/40 hover:bg-[#161619] transition-all cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-[#2C2C2C] text-[#D4AF37] focus:ring-[#D4AF37] h-4 w-4 bg-black cursor-pointer"
                    checked={checkedItems[item.id] || false}
                    onChange={(e) => setCheckedItems(prev => ({ ...prev, [item.id]: e.target.checked }))}
                  />
                  <span className="text-xs text-white/70 leading-relaxed font-light group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Actions Footer */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const allChecked = ['whitelist', 'procurement', 'limits', 'runway'].every(k => checkedItems[k]);
                  if (!allChecked) {
                    setToast({
                      show: true,
                      message: 'Please verify all checklist items before executing smart settlement.',
                      txHash: 'Checklist Incomplete'
                    });
                    return;
                  }
                  
                  // Execute settlement!
                  setReviewModal({ isOpen: false, invoice: null });
                  executeSettlement(reviewModal.invoice.id);
                }}
                className="bg-gold-metallic text-black font-bold uppercase tracking-wider text-xs rounded-xl py-3.5 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.25)] hover:box-gold-glow flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Approve & Settle
              </button>

              <button
                onClick={() => {
                  // Schedule postponement
                  setReviewModal({ isOpen: false, invoice: null });
                  handleSchedule(reviewModal.invoice.id);
                }}
                className="bg-[#1c1c1e] hover:bg-[#27272a] text-white border border-[#2C2C2C] font-bold uppercase tracking-wider text-xs rounded-xl py-3.5 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                Postpone Schedule
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Dynamic Calendar Postpone Modal */}
      {scheduleModal.isOpen && scheduleModal.invoice && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-[fadeIn_0.2s_ease-out] font-outfit text-white">
          <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/35 text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setScheduleModal({ isOpen: false, invoice: null })}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="h-14 w-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-gold-metallic mx-auto mb-3 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Postpone B2B Settlement
              </h3>
              <p className="text-white/40 text-xs font-light mt-1">
                Select a manual post-due date to schedule payment optimization paths.
              </p>
            </div>

            {/* Invoice Details mini card */}
            <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] space-y-1.5 mb-6 text-xs font-light">
              <div className="flex justify-between">
                <span className="text-[#6a6a6a]">Supplier / Vendor:</span>
                <span className="font-bold text-white">{scheduleModal.invoice.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6a6a6a]">Settlement Amount:</span>
                <span className="font-bold text-white">${scheduleModal.invoice.amount.toLocaleString()} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6a6a6a]">Original Due Date:</span>
                <span className="text-white/70 font-mono">{scheduleModal.invoice.dueDate}</span>
              </div>
            </div>

            {/* Calendar Component Grid */}
            <div className="mb-6">
              {renderCalendar(scheduleModal.invoice)}
            </div>

            {/* Actions Footer */}
            <button
              onClick={() => executeScheduling(scheduleModal.invoice.id, selectedScheduleDate)}
              disabled={!selectedScheduleDate}
              className="w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-xl py-4 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.25)] flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Scheduled Path</span>
            </button>
          </div>
        </div>
      )}

      {/* Dynamic L2-to-Bank Off-ramp Bridge Modal */}
      {showOffRampModal && offRampInvoice && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-[fadeIn_0.2s_ease-out] font-outfit text-white">
          <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/35 text-white">
            
            {/* Close Button */}
            <button
              onClick={() => {
                if (offRampStep === 0 || offRampStep === 4) {
                  setShowOffRampModal(false);
                  setOffRampInvoice(null);
                  setOffRampStep(0);
                }
              }}
              disabled={offRampStep > 0 && offRampStep < 4}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <Layers className="w-12 h-12 text-[#D4AF37] mx-auto mb-3 animate-pulse" />
              <h3 className="font-cormorant text-2xl font-light tracking-wide text-white flex items-center justify-center gap-2">
                <Landmark className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>L2-to-Bank Off-Ramp Bridge</span>
              </h3>
              <p className="text-white/40 text-xs font-light mt-1">
                Clearing physical fiat obligations by programmatically off-ramping Morph stablecoins.
              </p>
            </div>

            {/* Wallet vs Destination Account comparisons */}
            <div className="space-y-3 mb-6">
              <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Buyer Wallet (Source)</span>
                  <span className="text-xs font-bold text-white block mt-1 font-mono">
                    ${walletUSDCBalance.toLocaleString(undefined, {minimumFractionDigits:2})} USDC
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Settle Amount</span>
                  <span className="text-xs font-extrabold text-gold-metallic block mt-1 font-mono">
                    ${offRampInvoice.amount.toLocaleString()} USDC
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Supplier (Recipient)</span>
                  <span className="text-xs font-bold text-white block mt-1">
                    {offRampInvoice.supplier}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Bank Account Destination</span>
                  <span className="text-xs font-extrabold text-emerald-400 block mt-1 font-mono">
                    {offRampInvoice.supplierWallet}
                  </span>
                </div>
              </div>

              {/* Box 3: Actual Gas Fee Telemetry */}
              {(() => {
                const gasUsed = 85000;
                const ethFee = (gasUsed * gasTelemetry.gasPriceGwei) / 1000000000;
                const usdFee = ethFee * gasTelemetry.ethPriceUsd;
                const phpFee = usdFee * exchangeRate;
                return (
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-center justify-between animate-fadeIn">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">L2 Network Gas Fee (Morph Rollup)</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                        <TrendingUp className="w-3.5 h-3.5 text-gold-metallic shrink-0 animate-pulse" />
                        <span className="font-mono text-white/90">~{ethFee.toFixed(6)} ETH</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Estimated Cost</span>
                      <span className="text-xs font-bold text-white/50 block mt-1 font-mono">
                        ₱{phpFee.toFixed(2)} PHP (${usdFee.toFixed(3)} USD)
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Step loader or details */}
            {offRampStep === 0 ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-gold-metallic shrink-0 mt-0.5" />
                  <span className="text-[10px] text-orange-200 leading-relaxed font-light">
                    Fehuvia's L2 Off-Ramp Gateway will lock stablecoins on Morph, trigger StraitsX L2 liquidity pools, and programmatically wire direct Peso fiat via PESONet/InstaPay banking APIs.
                  </span>
                </div>

                <button
                  onClick={handleExecuteOffRamp}
                  className="w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 transition-all duration-300 shadow-xl cursor-pointer"
                >
                  Execute Off-Ramp Payout
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Step indicator animations */}
                <div className="p-5 border border-dashed border-[#D4AF37]/20 bg-[#D4AF37]/5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {offRampStep < 4 && (
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-scanLine" style={{ top: 0 }}></div>
                  )}
                  
                  {offRampStep < 4 ? (
                    <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37]/35 border-t-[#D4AF37] animate-spin mb-3"></div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400 animate-[fadeIn_0.2s_ease-out]">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {offRampStep === 4 ? 'Off-Ramp Disbursed!' : 'Processing L2 Off-Ramp'}
                  </span>
                  <p className="text-[10px] text-white/60 leading-relaxed font-light mt-2 animate-pulse">
                    {offRampStatus}
                  </p>
                </div>

                {offRampStep === 4 && (
                  <button
                    onClick={() => {
                      setShowOffRampModal(false);
                      setOffRampInvoice(null);
                      setOffRampStep(0);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 transition-all duration-300 shadow-xl cursor-pointer"
                  >
                    Done & Return
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Dynamic Fiat-to-USDC Liquidity Bridge Modal */}
      {showBridgeModal && bridgeInvoice && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-[fadeIn_0.2s_ease-out] font-outfit text-white">
          <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/35 text-white">
            
            {/* Close Button */}
            <button
              onClick={() => {
                if (bridgeStep === 0 || bridgeStep === 4) {
                  setShowBridgeModal(false);
                  setBridgeInvoice(null);
                  setBridgeStep(0);
                }
              }}
              disabled={bridgeStep > 0 && bridgeStep < 4}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer disabled:opacity-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <ShieldAlert className="w-12 h-12 text-[#fb923c] mx-auto mb-3 animate-pulse" />
              <h3 className="font-cormorant text-2xl font-light tracking-wide text-white">
                ⚠️ Insufficient Stablecoins
              </h3>
              <p className="text-white/40 text-xs font-light mt-1">
                Your Morph L2 Key lacks the USDC stablecoins needed to settle this invoice.
              </p>
            </div>

            {/* Wallet vs GCash comparisons */}
            <div className="space-y-3 mb-6">
              <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Connected Wallet</span>
                  <span className="text-xs font-bold text-red-400 block mt-1">
                    ${walletUSDCBalance.toLocaleString(undefined, {minimumFractionDigits:2})} USDC
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Required Amount</span>
                  <span className="text-xs font-extrabold text-white block mt-1 font-mono">
                    ${bridgeInvoice.amount.toLocaleString()} USDC
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/15 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">GCash Business Wallet</span>
                  <span className="text-xs font-bold text-emerald-400 block mt-1">
                    ₱{balance.toLocaleString(undefined, {minimumFractionDigits:2})} PHP
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Convert PHP Value</span>
                  <span className="text-xs font-extrabold text-emerald-400 block mt-1">
                    ₱{(bridgeInvoice.amount * exchangeRate).toLocaleString(undefined, {minimumFractionDigits:2})} PHP
                  </span>
                </div>
              </div>
            </div>

            {/* Step loader or details */}
            {bridgeStep === 0 ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-gold-metallic shrink-0 mt-0.5" />
                  <span className="text-[10px] text-orange-200 leading-relaxed font-light">
                    Fehuvia's Fiat Liquidity Bridge will automatically debit GCash, convert the funds through our StraitsX pool at the live rate (₱{exchangeRate.toFixed(2)}), and mint matching USDC directly into your L2 wallet.
                  </span>
                </div>

                <button
                  onClick={handleExecuteBridge}
                  className="w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 transition-all duration-300 shadow-xl cursor-pointer"
                >
                  Execute Conversion Bridge
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Step indicator animations */}
                <div className="p-5 border border-dashed border-[#D4AF37]/20 bg-[#D4AF37]/5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {bridgeStep < 4 && (
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-scanLine" style={{ top: 0 }}></div>
                  )}
                  
                  {bridgeStep < 4 ? (
                    <div className="w-8 h-8 rounded-full border-2 border-[#D4AF37]/35 border-t-[#D4AF37] animate-spin mb-3"></div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400 animate-[fadeIn_0.2s_ease-out]">
                      <Check className="w-4 h-4" />
                    </div>
                  )}

                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {bridgeStep === 4 ? 'Bridge Complete!' : 'Executing Conversion Bridge'}
                  </span>
                  <p className="text-[10px] text-white/60 leading-relaxed font-light mt-2 animate-pulse">
                    {bridgeStatus}
                  </p>
                </div>

                {bridgeStep === 4 && (
                  <button
                    onClick={() => {
                      setShowBridgeModal(false);
                      setBridgeInvoice(null);
                      setBridgeStep(0);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 transition-all duration-300 shadow-xl cursor-pointer"
                  >
                    Return & Settle Invoice
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* simulated Philippine Brankas Open Banking Modal */}
      <BrankasLinkModal 
        isOpen={isBankModalOpen}
        initialBank={selectedBankToLink}
        onClose={() => {
          setIsBankModalOpen(false);
          setSelectedBankToLink(null);
        }}
        onLinkSuccess={handleLinkBankSuccess}
      />

      {/* simulated Philippine Conversion Consent Modal */}
      {conversionModal.isOpen && conversionModal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit">
          <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/20 text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setConversionModal({ isOpen: false, invoice: null })}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <ShieldAlert className="w-10 h-10 text-gold-metallic mx-auto mb-3" />
              <h2 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Protected Treasury Rule
              </h2>
              <p className="text-white/40 text-xs font-light mt-1">
                A dynamic fiat-to-stablecoin conversion is required to complete this Morph L2 settlement.
              </p>
            </div>

            {/* Conversion Details */}
            <div className="space-y-4 mb-6">
              {/* Box 1: PHP Ledger */}
              <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Debit Account</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                    <Landmark className="w-3.5 h-3.5 text-[#FF6600]" />
                    {bankName} Commercial Link
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Conversion Amount</span>
                  <span className="text-xs font-extrabold text-red-400 block mt-1">
                    -₱{(conversionModal.invoice.amount * exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP
                  </span>
                </div>
              </div>

              {/* Conversion Middle Arrow Indicator */}
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="h-px bg-white/5 flex-1"></div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-gold-metallic uppercase tracking-widest bg-[#0a0a0c] border border-gold-metallic/20 px-2 py-0.5 rounded-full">
                  Rate: ₱{exchangeRate.toFixed(2)} PHP / $1.00 USDC
                </div>
                <div className="h-px bg-white/5 flex-1"></div>
              </div>

              {/* Box 2: Morph Stablecoins */}
              <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Credit / Mint Target</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                    <Wallet className="w-3.5 h-3.5 text-gold-metallic" />
                    Morph Settlement Key
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Settling Invoice</span>
                  <span className="text-xs font-extrabold text-emerald-400 block mt-1">
                    +${conversionModal.invoice.amount.toLocaleString()} USDC
                  </span>
                </div>
              </div>

              {/* Box 3: Actual Gas Fee Telemetry */}
              {(() => {
                const gasUsed = 180000;
                const ethFee = (gasUsed * gasTelemetry.gasPriceGwei) / 1000000000;
                const usdFee = ethFee * gasTelemetry.ethPriceUsd;
                const phpFee = usdFee * exchangeRate;
                return (
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-center justify-between animate-fadeIn">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">L2 Network Gas Fee (Morph Rollup)</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                        <TrendingUp className="w-3.5 h-3.5 text-gold-metallic shrink-0 animate-pulse" />
                        <span className="font-mono text-white/90">~{ethFee.toFixed(6)} ETH</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Estimated Cost</span>
                      <span className="text-xs font-bold text-white/50 block mt-1 font-mono">
                        ₱{phpFee.toFixed(2)} PHP (${usdFee.toFixed(3)} USD)
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 rounded-xl border border-[#D4AF37]/10 bg-[#D4AF37]/5 flex gap-2.5 items-start mb-6">
              <ShieldCheck className="w-4 h-4 text-gold-metallic shrink-0 mt-0.5" />
              <span className="text-[10px] text-[#fb923c] leading-relaxed font-light">
                Fehuvia's protected conversion engine will dynamically debit your {bankName} balance and route the converted stablecoins through the settlement smart contract.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  const invId = conversionModal.invoice.id;
                  setConversionModal({ isOpen: false, invoice: null });
                  executeSettlement(invId);
                }}
                className="w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 transition-all duration-300 shadow-xl cursor-pointer"
              >
                Authorize & Convert Fiat
              </button>
              
              <button
                onClick={() => setConversionModal({ isOpen: false, invoice: null })}
                className="w-full text-center text-xs text-white/40 hover:text-white transition-colors cursor-pointer py-2 block"
              >
                Cancel Settlement
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Direct On-Chain Settlement Confirmation Modal */}
      {confirmModal.isOpen && confirmModal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit">
          <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/20 text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setConfirmModal({ isOpen: false, invoice: null })}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <ShieldCheck className="w-10 h-10 text-gold-metallic mx-auto mb-3 animate-pulse" />
              <h2 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Direct Settlement Authorization
              </h2>
              <p className="text-white/40 text-xs font-light mt-1">
                Verify the on-chain invoice details before signing the settlement payload with your EVM key.
              </p>
            </div>

            {/* Invoice Details */}
            <div className="space-y-4 mb-6">
              {/* Box 1: Supplier & Reference */}
              <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">B2B Supplier Counterparty</span>
                  <span className="text-xs font-bold text-white block mt-1 truncate max-w-[200px]">
                    {confirmModal.invoice.supplier}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Invoice ID</span>
                  <span className="text-xs font-bold text-gold-metallic block mt-1">
                    {confirmModal.invoice.id}
                  </span>
                </div>
              </div>

              {/* Box 2: On-Chain Wallet Balance sufficient */}
              <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Settlement Asset</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Morph Testnet USDC
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Direct Charge</span>
                  <span className="text-xs font-extrabold text-emerald-400 block mt-1">
                    -${parseFloat(confirmModal.invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                  </span>
                </div>
              </div>

              {/* Box 3: Actual Gas Fee Telemetry */}
              {(() => {
                const gasUsed = 120000;
                const ethFee = (gasUsed * gasTelemetry.gasPriceGwei) / 1000000000;
                const usdFee = ethFee * gasTelemetry.ethPriceUsd;
                const phpFee = usdFee * exchangeRate;
                return (
                  <div className="p-4 rounded-xl border border-white/5 bg-[#0a0a0c] flex items-center justify-between animate-fadeIn">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">L2 Network Gas Fee (Morph Rollup)</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                        <TrendingUp className="w-3.5 h-3.5 text-gold-metallic shrink-0 animate-pulse" />
                        <span className="font-mono text-white/90">~{ethFee.toFixed(6)} ETH</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-[#6a6a6a] block">Estimated Cost</span>
                      <span className="text-xs font-bold text-white/50 block mt-1 font-mono">
                        ₱{phpFee.toFixed(2)} PHP (${usdFee.toFixed(3)} USD)
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Verification Badge */}
              <div className="p-4 rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/5 text-left">
                <p className="text-[10px] text-[#e4c37a] leading-relaxed font-light">
                  🛡️ <strong>Treasury Verification:</strong> Your active Morph L2 wallet balance is fully sufficient for direct settlement. No cash conversion path is required.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  const invId = confirmModal.invoice.id;
                  setConfirmModal({ isOpen: false, invoice: null });
                  executeSettlement(invId);
                }}
                className="w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4 transition-all duration-300 shadow-xl cursor-pointer"
              >
                Authorize & Settle Direct
              </button>
              
              <button
                onClick={() => setConfirmModal({ isOpen: false, invoice: null })}
                className="w-full text-center text-xs text-white/40 hover:text-white transition-colors cursor-pointer py-2 block"
              >
                Cancel Settlement
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EVM Wallet Selection Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit">
          <div className="glass-panel-gold rounded-3xl w-full max-w-md p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/20 text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <Wallet className="w-10 h-10 text-gold-metallic mx-auto mb-3" />
              <h2 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Connect EVM Wallet
              </h2>
              <p className="text-white/40 text-xs font-light mt-1">
                Select an injected browser extension wallet to establish your non-custodial L2 settlement key.
              </p>
            </div>

            {/* Wallet List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {detectedWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    if (wallet.isInstalled || wallet.id === 'walletconnect') {
                      handleConnectWallet(wallet.id);
                    } else {
                      window.open(wallet.installUrl, '_blank');
                    }
                  }}
                  className="w-full p-4 bg-[#0a0a0c] hover:bg-[#161618] border border-[#2C2C2C] hover:border-gold-metallic/40 rounded-2xl flex items-center justify-between transition-all duration-300 cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-4">
                    {/* Injected Premium SVG Wallet Logo */}
                    <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-[#141416] border border-white/5 shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-105">
                      {renderWalletLogo(wallet.id)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block group-hover:text-gold-metallic transition-colors">
                        {wallet.name}
                      </span>
                      <span className="text-[9px] text-[#6a6a6a] block mt-0.5">
                        {wallet.id === 'walletconnect' ? 'Connect via QR Code scan' : `Connect using ${wallet.name} extension`}
                      </span>
                    </div>
                  </div>

                  {/* Installed Status Badge */}
                  <div className="flex items-center">
                    {wallet.id === 'walletconnect' ? (
                      <span className="text-[8px] font-bold text-[#6a6a6a] bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                        EVM Rail
                      </span>
                    ) : wallet.isInstalled ? (
                      <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Installed
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-zinc-500 bg-zinc-950/20 border border-zinc-800/20 px-2 py-0.5 rounded uppercase tracking-wider hover:text-white hover:border-white/30 transition-colors">
                        Get Extension
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[9px] text-center text-white/30 leading-relaxed font-light mt-6">
              *Fehuvia links your address securely for transaction signing. Your private keys never leave your custody.
            </p>

          </div>
        </div>
      )}

      {/* Dynamic Coach Mark Spotlight Walkthrough */}
      {showCoach && coachCoords && (
        <div className="fixed inset-0 z-[120] pointer-events-none font-montserrat">
          {/* Semi-transparent dark blocking layer */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] pointer-events-auto animate-coachOverlay" onClick={handleFinishCoach}></div>
          
          {/* Glowing spotlight overlay around target element */}
          <div 
            className="absolute rounded-2xl border-2 border-gold-metallic/80 animate-coachSpotlight transition-all duration-500 ease-out z-10"
            style={{
              top: coachCoords.top - 8,
              left: coachCoords.left - 8,
              width: coachCoords.width + 16,
              height: coachCoords.height + 16,
              pointerEvents: 'none'
            }}
          >
            {/* Pulsing indicator dot */}
            <div className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 rounded-full bg-gold-metallic animate-ping"></div>
            <div className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 rounded-full bg-gold-metallic border border-black"></div>
          </div>

          {/* Premium Floating Guide Card — Montserrat font for readability */}
          <div 
            key={`coach-step-${activeCoachStep}`} 
            className="pointer-events-auto z-20 animate-coachSlideUp transition-all duration-300"
            style={getCardStyle()}
          >
            <div className="glass-panel-gold rounded-3xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.95)] border border-[#D4AF37]/35 text-white">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-semibold text-gold-metallic uppercase tracking-widest bg-[#D4AF37]/10 px-2.5 py-1 rounded-full border border-gold-metallic/20">
                  Step {activeCoachStep + 1} of {coachSteps.length}
                </span>
                <button onClick={handleFinishCoach} className="text-white/40 hover:text-white transition-colors cursor-pointer text-[11px] uppercase tracking-wider font-semibold">
                  Skip
                </button>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg text-white mb-2 font-semibold tracking-wide leading-snug">
                {coachSteps[activeCoachStep].title}
              </h3>
              <p className="text-white/55 text-[13px] font-normal leading-relaxed mb-6">
                {coachSteps[activeCoachStep].description}
              </p>

              {/* Step Indicators */}
              <div className="flex items-center gap-1.5 mb-5">
                {coachSteps.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === activeCoachStep ? 'w-6 bg-[#D4AF37]' : i < activeCoachStep ? 'w-3 bg-[#D4AF37]/50' : 'w-3 bg-white/15'}`}></div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <button
                  onClick={() => setActiveCoachStep(prev => Math.max(0, prev - 1))}
                  disabled={activeCoachStep === 0}
                  className={`text-[11px] font-semibold uppercase tracking-wider text-white/50 hover:text-white transition-all disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed`}
                >
                  Back
                </button>

                {activeCoachStep < coachSteps.length - 1 ? (
                  <button
                    onClick={() => setActiveCoachStep(prev => prev + 1)}
                    className="px-5 py-2.5 bg-gold-metallic text-black font-bold uppercase tracking-wider text-[10px] rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleFinishCoach}
                    className="px-5 py-2.5 bg-emerald-500 text-black font-bold uppercase tracking-wider text-[10px] rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Get Started
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit text-white">
          <div className="glass-panel-gold rounded-3xl w-full max-w-sm p-6 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/25 text-center flex flex-col items-center">
            
            {/* Pulsing warning shield container */}
            <div className="h-14 w-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-gold-metallic mb-5 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="font-cormorant text-2xl font-light tracking-wide text-white mb-2">
              Confirm Registry Exit
            </h3>
            <p className="text-white/50 text-[11px] font-light leading-relaxed mb-6">
              Are you sure you want to exit the secure workstation? Your active Morph L2 settlement keys will be disconnected from this active session.
            </p>

            {/* Action Buttons */}
            <div className="w-full space-y-2.5">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="w-full bg-[#D4AF37] hover:box-gold-glow text-black font-bold uppercase tracking-wider text-[10px] rounded-full py-3.5 transition-all shadow-md cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)'
                }}
              >
                Exit Workstation
              </button>
              
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-bold uppercase tracking-wider text-[10px] rounded-full py-3.5 transition-all cursor-pointer"
              >
                Cancel & Resume
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
