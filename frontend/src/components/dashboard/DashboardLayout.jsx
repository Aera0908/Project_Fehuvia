import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
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
import DemoDisclaimer from '../DemoDisclaimer';
import BrankasLinkModal from '../BrankasLinkModal';
import { Bell, User, HelpCircle, FileText, TrendingUp, Clock, X, Check, ShieldAlert, Sparkles, CreditCard, Wallet } from 'lucide-react';

export default function DashboardLayout({ setView, handleLogout }) {
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

  const API_BASE = 'http://localhost:3001';

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

  // Computed B2B corporate portfolio value in Pesos (₱ PHP = Traditional Bank + Web3 Wallet * 56 conversion rate)
  const portfolioValue = balance + (walletUSDCBalance * 56);

  // Bank Connection State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
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

  // AI predictions co-pilot cache
  const [predictions, setPredictions] = useState(null);
  const [runway, setRunway] = useState(45);
  const [trend, setTrend] = useState('stable');

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
          if (data.user.balance !== undefined) setBalance(Number(data.user.balance));
          if (data.user.portfolioValue !== undefined) setPortfolioValue(Number(data.user.portfolioValue));
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
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
          supplierWallet: inv.supplierWallet
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
    fetchInvoices();
    fetchPredictions();
    fetchPayments();
  }, []);

  // Settled Payments Log State (initially loaded from backend database)
  const [payments, setPayments] = useState([]);

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

  // Fetch live on-chain stablecoin balance of connected MetaMask wallet
  const fetchWalletUSDCBalance = async (addressOverride = null) => {
    const address = addressOverride || userProfile.walletAddress;
    if (!window.ethereum || !address) {
      setWalletUSDCBalance(0);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const ERC20_ABI = ["function balanceOf(address account) view returns (uint256)"];
      const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
      const bal = await usdc.balanceOf(address);
      setWalletUSDCBalance(Number(ethers.formatUnits(bal, 6)));
    } catch (err) {
      console.error("Failed to fetch on-chain USDC balance:", err);
      setWalletUSDCBalance(0);
    }
  };

  // Wire automatic wallet balance checking inside mount hook
  useEffect(() => {
    if (userProfile.walletAddress) {
      fetchWalletUSDCBalance();
    }
  }, [userProfile.walletAddress]);

  // Handle MetaMask/EVM Wallet Connection
  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      setToast({
        show: true,
        message: 'No Ethereum wallet found! Please install MetaMask to connect.',
        txHash: 'Wallet Error'
      });
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // Request network switch to localhost (31337) or Morph L2 Testnet (2818)
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== 31337 && chainId !== 2818) {
        setToast({
          show: true,
          message: 'Please switch MetaMask to Hardhat Localhost (Chain ID: 31337) or Morph Testnet.',
          txHash: 'Network Switch'
        });
      }

      // Update userProfile state locally and persistently
      setUserProfile(prev => {
        const updated = { ...prev, walletAddress: address };
        localStorage.setItem('fehuvia_user', JSON.stringify(updated));
        return updated;
      });
      fetchWalletUSDCBalance(address);

      setToast({
        show: true,
        message: `Wallet connected: ${address.substring(0, 6)}...${address.substring(38)}`,
        txHash: 'Web3 Ready'
      });
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setToast({
        show: true,
        message: `Wallet connection failed: ${err.message || err}`,
        txHash: 'Connect Fail'
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
  const handleLinkBankSuccess = async ({ bankName, balance: linkedBalance }) => {
    const token = localStorage.getItem('fehuvia_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/auth/link-bank`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bankName, balance: linkedBalance })
      });

      if (!res.ok) throw new Error("Failed to link bank account in database.");

      const data = await res.json();
      
      // Update local storage session
      const storedUser = JSON.parse(localStorage.getItem('fehuvia_user') || '{}');
      const updatedUser = {
        ...storedUser,
        bankLinked: true,
        bankName: bankName,
        balance: linkedBalance
      };
      localStorage.setItem('fehuvia_user', JSON.stringify(updatedUser));

      setUserProfile(updatedUser);
      setBankLinked(true);
      setBankName(bankName);
      setBalance(linkedBalance);
      setIsBankModalOpen(false);

      setToast({
        show: true,
        message: `Successfully linked your ${bankName} account via Brankas!`,
        txHash: 'API Connected'
      });
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: 'Failed to establish bank connection. Please try again.',
        txHash: 'API Error'
      });
    }
  };

  // Handle traditional banking disconnection
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

      // Update local storage session
      const storedUser = JSON.parse(localStorage.getItem('fehuvia_user') || '{}');
      const updatedUser = {
        ...storedUser,
        bankLinked: false,
        bankName: '',
        balance: 0.00
      };
      localStorage.setItem('fehuvia_user', JSON.stringify(updatedUser));

      setUserProfile(updatedUser);
      setBankLinked(false);
      setBankName('');
      setBalance(0.00);

      setToast({
        show: true,
        message: 'Traditional banking account disconnected.',
        txHash: 'API Offline'
      });
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message: 'Failed to disconnect bank account.',
        txHash: 'API Error'
      });
    }
  };

  // Handle single invoice settlement via live Ethers.js Smart Contracts
  const handleSettle = async (id) => {
    const targetInvoice = invoices.find(inv => inv.id === id);
    if (!targetInvoice) return;

    // 1. Set specific invoice to loading state
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: true } : inv));

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

      // Deployed contract addresses in our sandbox
      const USDC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const SETTLEMENT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

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

      const supplierWallet = targetInvoice.supplierWallet || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
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
          setPortfolioValue(prevVal => Math.max(0, prevVal - inv.amount));

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

      // Background refresh of AI forecasts, user balances, and settled payments
      fetchPredictions();
      fetchProfile();
      fetchPayments();

    } catch (err) {
      console.error('Error settling invoice on-chain:', err);
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, loading: false } : inv));
      
      setToast({
        show: true,
        message: `Settlement failed: ${err.reason || err.message || 'Please check your connection.'}`,
        txHash: 'Error'
      });
    }
  };

  // Handle invoice postpone scheduling
  const handleSchedule = (id) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, scheduled: true } : inv));
    
    setToast({
      show: true,
      message: `Invoice ${id} has been scheduled for postponed payment. Runway optimized.`,
      txHash: 'Local Schedule updated'
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
        message: `Failed to upload invoice: ${err.message || 'Please check your connection.'}`,
        txHash: 'Error'
      });
    }
  };

  // Derived metrics counters
  const activeInvoices = invoices.filter(inv => !inv.settled);
  const pendingCount = activeInvoices.length;
  const pendingTotal = activeInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="dark h-screen bg-[#070708] flex relative overflow-hidden font-outfit text-white">
      
      {/* 1. Dashboard Sidebar Panel */}
      <Sidebar setView={setView} currentPage={currentPage} setCurrentPage={setCurrentPage} handleLogout={handleLogout} />

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

              {/* On-Chain USDC Balance (only shown if connected) */}
              {userProfile.walletAddress && (
                <>
                  <div className={`w-px bg-[#2C2C2C] hidden sm:block transition-all duration-300 ${isHeaderScrolled ? 'h-5' : 'h-10'}`}></div>
                  <div className="cursor-pointer" onClick={() => setCurrentPage('Profile')}>
                    <div className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-h-0 opacity-0 mb-0' : 'max-h-6 opacity-100 mb-1'}`}>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider whitespace-nowrap">On-Chain USDC</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className={`text-[9px] font-bold text-emerald-400 uppercase tracking-wider hidden sm:inline transition-all duration-300 ${isHeaderScrolled ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>USDC</span>
                      <span className={`font-black text-emerald-400 leading-tight transition-all duration-300 ${isHeaderScrolled ? 'text-sm' : 'text-lg sm:text-2xl font-mono'}`}>
                        ${walletUSDCBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </>
              )}

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
                <div className={`text-left hidden sm:block overflow-hidden transition-all duration-300 ${isHeaderScrolled ? 'max-w-0 opacity-0' : 'max-w-[160px] opacity-100'}`}>
                  <p className="text-sm font-bold text-white leading-none mb-0.5 whitespace-nowrap">
                    {userProfile.email.split('@')[0].toUpperCase()}
                  </p>
                  <p className="text-[10px] text-[#a1a1a1] leading-none whitespace-nowrap flex items-center gap-1">
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
                  <CashflowPrediction predictions={predictions} balance={balance} />
                </div>
                <div>
                  <AICopilot predictions={predictions} />
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

          {currentPage === 'Cash Flow' && <CashFlowView predictions={predictions} runway={runway} />}

          {currentPage === 'Invoices' && (
            <InvoicesView
              invoices={invoices}
              handleSettle={handleSettle}
              handleSchedule={handleSchedule}
              handleUploadInvoice={handleUploadInvoice}
            />
          )}

          {currentPage === 'Payments' && <PaymentsView payments={payments} />}

          {currentPage === 'Analytics' && <AnalyticsView invoices={invoices} predictions={predictions} />}

          {currentPage === 'Profile' && (
            <ProfileView 
              userProfile={userProfile} 
              handleConnectWallet={handleConnectWallet}
              handleDisconnectWallet={handleDisconnectWallet}
              bankLinked={bankLinked}
              bankName={bankName}
              bankBalance={balance}
              onOpenBankLink={() => setIsBankModalOpen(true)}
              onDisconnectBank={handleDisconnectBank}
            />
          )}

          {currentPage === 'Notifications' && (
            <NotificationsView 
              notifications={notifications} 
              setNotifications={setNotifications} 
            />
          )}

          {currentPage === 'Help' && <HelpView />}

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
                onClick={handleConnectWallet}
                className="w-full bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-full py-4.5 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect MetaMask Wallet
              </button>

              <p className="text-[10px] text-white/30 font-light mt-6 flex items-center gap-1.5 justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-pulse"></span>
                Status: Awaiting Morph L2 Key Link
              </p>
            </div>
          </div>
        )}
        
      </main>
      <DemoDisclaimer compact />
      
      {/* simulated Philippine Brankas Open Banking Modal */}
      <BrankasLinkModal 
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onLinkSuccess={handleLinkBankSuccess}
      />
    </div>
  );
}
