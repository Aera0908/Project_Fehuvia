import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { CashflowPrediction } from './CashflowPrediction';
import { AICopilot } from './AICopilot';
import { InvoiceManagement } from './InvoiceManagement';
import { CashFlowView } from './CashFlowView';
import { InvoicesView } from './InvoicesView';
import { PaymentsView } from './PaymentsView';
import { AnalyticsView } from './AnalyticsView';
import { ProfileView } from './ProfileView';
import { NotificationsView } from './NotificationsView';
import { HelpView } from './HelpView';
import { Bell, User, HelpCircle, FileText, TrendingUp, Clock, X, Check, ShieldAlert, Sparkles, CreditCard } from 'lucide-react';

export default function DashboardLayout({ setView }) {
  // Navigation page routing state
  const [currentPage, setCurrentPage] = useState('Dashboard');

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

  // Available Balance state
  const [balance, setBalance] = useState(1289401.07);
  const [portfolioValue, setPortfolioValue] = useState(2847392.00);

  // Invoices list state
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      supplier: 'Acme Corp',
      amount: 125000,
      dueDate: '2026-05-20',
      aiAction: { status: 'safe', message: 'Safe to Pay' },
      settled: false,
      scheduled: false,
      loading: false
    },
    {
      id: 'INV-002',
      supplier: 'Global Suppliers Ltd',
      amount: 89500,
      dueDate: '2026-05-22',
      aiAction: { status: 'safe', message: 'Safe to Pay' },
      settled: false,
      scheduled: false,
      loading: false
    },
    {
      id: 'INV-003',
      supplier: 'Tech Solutions Inc',
      amount: 210000,
      dueDate: '2026-05-25',
      aiAction: { status: 'delay', message: 'Delay 5 Days', delayDays: 5 },
      settled: false,
      scheduled: false,
      loading: false
    },
    {
      id: 'INV-004',
      supplier: 'Manufacturing Co',
      amount: 156000,
      dueDate: '2026-05-21',
      aiAction: { status: 'safe', message: 'Safe to Pay' },
      settled: false,
      scheduled: false,
      loading: false
    },
    {
      id: 'INV-005',
      supplier: 'Cloud Services Ltd',
      amount: 45000,
      dueDate: '2026-05-28',
      aiAction: { status: 'review', message: 'Review Required' },
      settled: false,
      scheduled: false,
      loading: false
    },
  ]);

  // Settled Payments Log State (initially seeded with high fidelity items)
  const [payments, setPayments] = useState([
    {
      timestamp: '2026-05-18 14:32:05',
      invoiceId: 'INV-000',
      supplier: 'Acme Corp',
      destination: '0x9d3fB7A215E9f1165A98C72B9eB4d693fE3eA23e',
      amount: 45000,
      fee: '< 0.0001 ETH',
      txHash: '0x4f12d8a5a415a7cf90b21a3617b019b88ef11b7fa239d031e21b79fca23e712a'
    },
    {
      timestamp: '2026-05-19 09:12:44',
      invoiceId: 'INV-008',
      supplier: 'Oracle Corp',
      destination: '0x9d3fB7A215E9f1165A98C72B9eB4d693fE3eA23e',
      amount: 110000,
      fee: '< 0.0001 ETH',
      txHash: '0x8f3c7e81b9e1165a98c72b9eb4d693fe3ea23ef7fa239d031e21b79fca23e712a'
    }
  ]);

  // Translucent Toast Notifications State
  const [toast, setToast] = useState({ show: false, message: '', txHash: '' });

  // Dynamic notifications state with seed records
  const [notifications, setNotifications] = useState([
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
  ]);

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

  // Handle single invoice settlement
  const handleSettle = (id) => {
    // 1. Set specific invoice to loading state
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: true } : inv));

    // 2. Simulate 1.2s Morph Testnet transaction finality
    setTimeout(() => {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === id) {
          // Adjust top-level available balances and total portfolio values
          setBalance(prevBal => prevBal - inv.amount);
          setPortfolioValue(prevVal => prevVal - inv.amount);

          const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
          const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

          // Append this cleared item to the settled payments log
          setPayments(prevPayments => [
            ...prevPayments,
            {
              timestamp: nowStr,
              invoiceId: inv.id,
              supplier: inv.supplier,
              destination: '0x9d3fB7A215E9f1165A98C72B9eB4d693fE3eA23e',
              amount: inv.amount,
              fee: '< 0.0001 ETH',
              txHash: mockTxHash
            }
          ]);

          // Trigger toast
          setToast({
            show: true,
            message: `Invoice ${inv.id} ($${inv.amount.toLocaleString()}) successfully settled T+0 via Morph!`,
            txHash: `${mockTxHash.substring(0, 10)}...${mockTxHash.substring(56)}`
          });

          // Append to dynamic notifications
          setNotifications(prev => [
            {
              id: `notif-${Date.now()}`,
              title: 'Morph Transaction Cleared',
              message: `Invoice ${inv.id} ($${inv.amount.toLocaleString()}) successfully settled T+0 via Morph!`,
              time: 'Just now',
              read: false,
              type: 'success',
              meta: `Tx: ${mockTxHash.substring(0, 10)}...${mockTxHash.substring(56)}`
            },
            ...prev
          ]);

          return { ...inv, loading: false, settled: true };
        }
        return inv;
      }));
    }, 1200);
  };

  // Handle invoice postpone scheduling
  const handleSchedule = (id) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, scheduled: true } : inv));
    
    setToast({
      show: true,
      message: `Invoice ${id} has been scheduled for postponed payment (Jun 2). Runway optimized.`,
      txHash: 'Local Schedule updated'
    });
  };

  // Handle invoice uploading from InvoicesView
  const handleUploadInvoice = (newInv) => {
    const nextId = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    
    setInvoices(prev => [
      ...prev,
      {
        id: nextId,
        supplier: newInv.supplier,
        amount: newInv.amount,
        dueDate: newInv.dueDate,
        aiAction: {
          status: newInv.status,
          message: newInv.status === 'safe' ? 'Safe to Pay' : newInv.status === 'delay' ? 'Delay 5 Days' : 'Review Required'
        },
        settled: false,
        scheduled: false,
        loading: false
      }
    ]);

    setToast({
      show: true,
      message: `Invoice ${nextId} uploaded successfully. AI safety analysis completed.`,
      txHash: 'Local Upload Registered'
    });

    // Append to dynamic notifications
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Invoice Uploaded',
        message: `Invoice ${nextId} uploaded successfully. AI safety analysis completed.`,
        time: 'Just now',
        read: false,
        type: 'info',
        meta: `Supplier: ${newInv.supplier}`
      },
      ...prev
    ]);
  };

  // Derived metrics counters
  const activeInvoices = invoices.filter(inv => !inv.settled);
  const pendingCount = activeInvoices.length;
  const pendingTotal = activeInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="dark h-screen bg-[#070708] flex relative overflow-hidden font-outfit text-white">
      
      {/* 1. Dashboard Sidebar Panel */}
      <Sidebar setView={setView} currentPage={currentPage} setCurrentPage={setCurrentPage} />

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
        {toast.show && (
          <div className="fixed bottom-6 right-6 z-50 p-4 w-96 rounded-xl border border-emerald-500/35 bg-[#0d0d0f]/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-[fadeIn_0.3s_ease-out] flex gap-3.5 items-start">
            <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Morph Transaction Cleared</p>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">{toast.message}</p>
              {toast.txHash && (
                <p className="text-[9px] font-mono text-emerald-400 mt-2 bg-emerald-950/20 border border-emerald-500/20 rounded px-1.5 py-0.5 inline-block">
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
        )}

        {/* Workspace Header — collapses on scroll via CSS only (no mount/unmount) */}
        <header className={`px-8 sticky top-0 z-10 transition-all duration-300 border-b ${
          isHeaderScrolled 
            ? 'py-2.5 bg-[#0a0a0b]/40 backdrop-blur-2xl border-[#e4c37a]/15' 
            : 'py-5 bg-[#0a0a0b]/80 border-[#2C2C2C] backdrop-blur-md'
        }`}
                style={{
                  boxShadow: isHeaderScrolled ? '0 4px 30px rgba(0, 0, 0, 0.4)' : '0 1px 0 rgba(255, 255, 255, 0.01)',
                }}>
          <div className="flex items-center justify-between gap-4">
            
            {/* Header values */}
            <div className="flex items-center gap-6 flex-wrap">
              
              {/* Portfolio Value */}
              <div className="cursor-pointer" onClick={() => setCurrentPage('Dashboard')}>
                {/* Label row — collapses via max-height + opacity */}
                <div className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-6 opacity-100 mb-1'}`}>
                  <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider whitespace-nowrap">Portfolio Value</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#6a6a6a] cursor-help shrink-0" />
                </div>
                <div className="flex items-center gap-2">
                  {/* Compact label visible only when collapsed */}
                  <span className={`text-[9px] font-bold text-[#6a6a6a] uppercase tracking-wider hidden sm:inline transition-all duration-300 ${isHeaderScrolled ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>Portfolio</span>
                  <span className={`font-black text-white leading-tight transition-all duration-300 ${isHeaderScrolled ? 'text-sm' : 'text-2xl'}`}>
                    ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {/* Growth badge — collapses */}
                  <span className={`text-[10px] font-bold tracking-wide text-gold-metallic ml-1 whitespace-nowrap transition-all duration-300 ${isHeaderScrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                    +$342,158 (12.5%)
                  </span>
                </div>
              </div>

              <div className={`w-px bg-[#2C2C2C] hidden sm:block transition-all duration-300 ${isHeaderScrolled ? 'h-5' : 'h-10'}`}></div>

              {/* Available balance */}
              <div className="cursor-pointer" onClick={() => setCurrentPage('Dashboard')}>
                <div className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-6 opacity-100 mb-1'}`}>
                  <span className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider whitespace-nowrap">Available Balance</span>
                  <HelpCircle className="w-3.5 h-3.5 text-[#6a6a6a] cursor-help shrink-0" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold text-[#6a6a6a] uppercase tracking-wider hidden sm:inline transition-all duration-300 ${isHeaderScrolled ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>Balance</span>
                  <span className={`font-black text-white leading-tight transition-all duration-300 ${isHeaderScrolled ? 'text-sm' : 'text-2xl'}`}>
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            <div className="flex items-center gap-3 shrink-0 relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className={`hover:bg-[#161618] rounded-xl border border-transparent hover:border-[#2C2C2C] transition-all relative cursor-pointer ${
                  showNotificationsDropdown 
                    ? 'bg-[#161618] border-[#2C2C2C]' 
                    : ''
                } ${isHeaderScrolled ? 'p-1.5' : 'p-2.5'}`}
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
                              setCurrentPage('Notifications');
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
                className={`flex items-center gap-2.5 hover:bg-[#161618] rounded-xl border border-transparent hover:border-[#2C2C2C] transition-all cursor-pointer ${isHeaderScrolled ? 'px-2.5 py-1.5' : 'px-4 py-2'}`}
              >
                <div className={`rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isHeaderScrolled ? 'w-7 h-7' : 'w-9 h-9'}`}
                     style={{
                       background: 'linear-gradient(135deg, #fcf6ba 0%, #D4AF37 50%, #B8860B 100%)',
                       boxShadow: '0 2px 8px rgba(212, 175, 55, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.3)'
                     }}>
                  <User className={`text-[#0a0a0a] transition-all duration-300 ${isHeaderScrolled ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
                </div>
                {/* Name — collapses via CSS */}
                <div className={`text-left hidden sm:block overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}>
                  <p className="text-sm font-bold text-white leading-none mb-0.5 whitespace-nowrap">Admin User</p>
                  <p className="text-[10px] text-[#a1a1a1] leading-none whitespace-nowrap">admin@fehuvia.com</p>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Metrics sub-bar — collapses via CSS height, always in DOM */}
        <div className={`px-8 border-b border-[#2C2C2C] overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-h-0 py-0 opacity-0 border-transparent' : 'max-h-24 py-5 opacity-100'}`}
             style={{
               boxShadow: isHeaderScrolled ? 'none' : '0 1px 0 rgba(255, 255, 255, 0.01)'
             }}>
          <div className="flex items-center gap-8 flex-wrap">
            
            {/* Stat: Pending payables */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('Invoices')}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#2C2C2C]"
                   style={{
                     background: 'linear-gradient(145deg, #101012 0%, #070709 100%)',
                     boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), inset 0 -1px 1px rgba(0, 0, 0, 0.4)'
                   }}>
                <FileText className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider">Pending Invoices</p>
                <p className="text-base font-bold text-white leading-tight">
                  {pendingCount} <span className="text-xs text-[#6a6a6a] font-normal">(${pendingTotal.toLocaleString()})</span>
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-[#2C2C2C]"></div>

            {/* Stat: AI status */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('Analytics')}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#2C2C2C]"
                   style={{
                     background: 'linear-gradient(145deg, #101012 0%, #070709 100%)',
                     boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), inset 0 -1px 1px rgba(0, 0, 0, 0.4)'
                   }}>
                <TrendingUp className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider">AI Optimization</p>
                <p className="text-base font-bold text-white leading-tight">
                  94% <span className="text-xs text-[#4ade80] font-semibold uppercase tracking-wider">Active</span>
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-[#2C2C2C]"></div>

            {/* Stat: settlement latency */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('Cash Flow')}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[#2C2C2C]"
                   style={{
                     background: 'linear-gradient(145deg, #101012 0%, #070709 100%)',
                     boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), inset 0 -1px 1px rgba(0, 0, 0, 0.4)'
                   }}>
                <Clock className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider">Avg. Settlement</p>
                <p className="text-base font-bold text-white leading-tight">
                  1.2d <span className="text-xs text-gold-metallic font-semibold">-24%</span>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Workspace Panels Grid */}
        <div className="p-8 space-y-8">
          
          {currentPage === 'Dashboard' && (
            <>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs text-[#6a6a6a] uppercase tracking-[0.2em] font-bold">Financial Overview</h2>
                
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-[#0a0a0c] border border-[#2C2C2C] rounded-lg p-1">
                  <button className="px-3.5 py-1.5 text-xs text-[#6a6a6a] hover:text-white font-medium transition-colors cursor-pointer">
                    Today
                  </button>
                  <button className="px-3.5 py-1.5 text-xs text-[#6a6a6a] hover:text-white font-medium transition-colors cursor-pointer">
                    Week
                  </button>
                  <button className="px-4 py-1.5 text-xs text-white rounded-md font-bold transition-all border border-[#2C2C2C] bg-[#161618] cursor-pointer"
                          style={{
                            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.02), inset 0 -1px 1px rgba(0, 0, 0, 0.5)'
                          }}>
                    30 Days
                  </button>
                  <button className="px-3.5 py-1.5 text-xs text-[#6a6a6a] hover:text-white font-medium transition-colors cursor-pointer">
                    All Time
                  </button>
                </div>
              </div>

              {/* Forecast Area Chart + AI Recommendations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <CashflowPrediction />
                </div>
                <div>
                  <AICopilot />
                </div>
              </div>

              {/* Payables Ledger Table Panel */}
              <InvoiceManagement
                invoices={invoices}
                handleSettle={handleSettle}
                handleSchedule={handleSchedule}
              />
            </>
          )}

          {currentPage === 'Cash Flow' && <CashFlowView />}

          {currentPage === 'Invoices' && (
            <InvoicesView
              invoices={invoices}
              handleSettle={handleSettle}
              handleSchedule={handleSchedule}
              handleUploadInvoice={handleUploadInvoice}
            />
          )}

          {currentPage === 'Payments' && <PaymentsView payments={payments} />}

          {currentPage === 'Analytics' && <AnalyticsView />}

          {currentPage === 'Profile' && <ProfileView />}

          {currentPage === 'Notifications' && (
            <NotificationsView 
              notifications={notifications} 
              setNotifications={setNotifications} 
            />
          )}

          {currentPage === 'Help' && <HelpView />}

        </div>
        
      </main>
    </div>
  );
}
