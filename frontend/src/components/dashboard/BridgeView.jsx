import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Landmark, ArrowRight, Wallet, ShieldCheck, Check, Info, Sparkles, TrendingUp, AlertTriangle, Phone, QrCode, Delete, ShieldAlert } from 'lucide-react';
import { BankLogo } from '../BankLogo';
import { ethers } from 'ethers';
import { getFriendlyError, getErrorBadge } from '../../utils/errorMessages';

export function BridgeView({ 
  userProfile, 
  balance, 
  walletUSDCBalance, 
  exchangeRate, 
  fetchProfile, 
  fetchPayments, 
  setToast, 
  setNotifications, 
  setWalletUSDCBalance, 

  prefilledBridgeInvoice,
  setPrefilledBridgeInvoice,
  setCurrentPage,
  executeSettlement,
  onOpenBankLink
}) {
  const [direction, setDirection] = useState('fiat_to_token'); // fiat_to_token: PHP -> USDC, token_to_fiat: USDC -> PHP
  const [sourceAmount, setSourceAmount] = useState('');
  const [destAmount, setDestAmount] = useState('');
  const [step, setStep] = useState(0); // 0: input form, 1: lock/debit, 2: swap, 3: mint/disburse, 4: complete
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState('');

  // Security Gate State
  const [showSecurityGate, setShowSecurityGate] = useState(false);
  const [verificationMode, setVerificationMode] = useState('sms'); // 'sms' or 'qr'
  const [otpCode, setOtpCode] = useState('');
  const [qrScanned, setQrScanned] = useState(false);

  const walletAddress = userProfile?.walletAddress || '0xdemo7970C51812dc3A010C7d01b50e0d17dc79d0';
  const displayAddress = walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);

  // Extract all institutions (linked or unlinked)
  const allInstitutions = userProfile?.linkedBanks || [
    { id: 'gcash', name: 'GCash Corporate Wallet', short: 'GCash', balance: balance, type: 'wallet', isLinked: true },
    { id: 'bdo', name: 'Banco de Oro (BDO)', short: 'BDO', balance: 4500000.00, type: 'bank', isLinked: false },
    { id: 'ubp', name: 'UnionBank of the Philippines', short: 'UnionBank', balance: 3200000.00, type: 'bank', isLinked: false },
    { id: 'bpi', name: 'Bank of the Philippine Islands (BPI)', short: 'BPI', balance: 5800000.00, type: 'bank', isLinked: false },
    { id: 'maya', name: 'Maya Business Account', short: 'Maya', balance: 1200000.00, type: 'wallet', isLinked: false }
  ];
  
  const activeLinkedBanks = allInstitutions.filter(b => b.isLinked);
  
  const [selectedBankId, setSelectedBankId] = useState('gcash');

  useEffect(() => {
    // Default select GCash or the first linked bank
    const firstLinked = activeLinkedBanks.find(b => b.isLinked);
    if (firstLinked && !prefilledBridgeInvoice) {
      setSelectedBankId(firstLinked.id);
    }
  }, [userProfile, prefilledBridgeInvoice]);

  // Handle prefilled B2B invoice redirection values
  useEffect(() => {
    if (prefilledBridgeInvoice) {
      setDirection('fiat_to_token');
      const invoiceUSD = parseFloat(prefilledBridgeInvoice.amount);
      const computedPHP = invoiceUSD * exchangeRate;
      setDestAmount(invoiceUSD.toFixed(2));
      setSourceAmount(computedPHP.toFixed(2));
      setErrorText('');
    }
  }, [prefilledBridgeInvoice, exchangeRate]);

  // Compute destination amount based on source amount and live exchange rate
  useEffect(() => {
    if (prefilledBridgeInvoice) return; // Locked if prefilled B2B settlement

    if (!sourceAmount || isNaN(parseFloat(sourceAmount))) {
      setDestAmount('');
      return;
    }
    const val = parseFloat(sourceAmount);
    if (direction === 'fiat_to_token') {
      setDestAmount((val / exchangeRate).toFixed(2));
    } else {
      setDestAmount((val * exchangeRate).toFixed(2));
    }
  }, [sourceAmount, direction, exchangeRate, prefilledBridgeInvoice]);

  const handleSourceChange = (e) => {
    if (prefilledBridgeInvoice) return; // Locked
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setSourceAmount(val);
      setErrorText('');
    }
  };

  const toggleDirection = () => {
    if (prefilledBridgeInvoice) return; // Locked
    setDirection(prev => prev === 'fiat_to_token' ? 'token_to_fiat' : 'fiat_to_token');
    setSourceAmount('');
    setDestAmount('');
    setErrorText('');
  };

  const handleFractionClick = (fraction) => {
    if (prefilledBridgeInvoice) return; // Locked
    
    // Find active selected bank balance
    const targetBank = allInstitutions.find(b => b.id === selectedBankId) || { balance };
    const available = direction === 'fiat_to_token' ? parseFloat(targetBank.balance) : walletUSDCBalance;
    const computed = available * fraction;
    
    setSourceAmount(computed.toFixed(2));
    setErrorText('');
  };

  const handleExecuteBridge = () => {
    const amt = parseFloat(sourceAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorText('Please enter a valid amount greater than zero.');
      return;
    }

    const usdVal = direction === 'fiat_to_token' ? parseFloat(destAmount) : amt;
    const phpVal = direction === 'fiat_to_token' ? amt : parseFloat(destAmount);

    const targetBank = allInstitutions.find(b => b.id === selectedBankId);
    if (direction === 'fiat_to_token') {
      if (!targetBank) {
        setErrorText('Please connect a Peso financial funding source first.');
        return;
      }
      if (parseFloat(targetBank.balance) < phpVal) {
        setErrorText(`Insufficient traditional operating balance in connected ${targetBank.short}.`);
        return;
      }
    }

    if (direction === 'token_to_fiat' && walletUSDCBalance < usdVal) {
      setErrorText('Insufficient L2 USDC stablecoin wallet balance.');
      return;
    }

    setErrorText('');
    
    if (direction === 'fiat_to_token') {
      // Trigger interactive multi-bank validation gate overlays
      setOtpCode('');
      setQrScanned(false);
      setShowSecurityGate(true);
    } else {
      // Off-ramp does not require OTP keypad gate
      runConversionPipeline();
    }
  };

  const runConversionPipeline = () => {
    setShowSecurityGate(false);
    setStep(1);

    const usdVal = direction === 'fiat_to_token' ? parseFloat(destAmount) : parseFloat(sourceAmount);
    const phpVal = direction === 'fiat_to_token' ? parseFloat(sourceAmount) : parseFloat(destAmount);
    const targetBank = allInstitutions.find(b => b.id === selectedBankId) || { short: 'GCash' };

    if (direction === 'fiat_to_token') {
      setStatusText(`Debiting Peso cash from ${targetBank.short} account via Brankas APIs...`);
      
      setTimeout(() => {
        setStep(2);
        setStatusText('Routing stablecoins through StraitsX Liquidity Pool swap system...');
      }, 1500);

      setTimeout(() => {
        setStep(3);
        setStatusText(`Minting $${usdVal.toLocaleString(undefined, {minimumFractionDigits: 2})} USDC stablecoins directly into your L2 wallet (0xdemo...)...`);
      }, 3000);
    } else {
      setStatusText('Locking L2 USDC stablecoin tokens into the off-ramp custody gateway...');
      
      setTimeout(() => {
        setStep(2);
        setStatusText('Exchanging stablecoins for local PHP fiat in liquidity pool registers at live rate...');
      }, 1500);

      setTimeout(() => {
        setStep(3);
        setStatusText(`Dispatching PESONet/InstaPay payout of ₱${phpVal.toLocaleString(undefined, {minimumFractionDigits: 2})} cash directly into your bank link via Brankas Secure APIs...`);
      }, 3000);
    }

    setTimeout(async () => {
      try {
        const token = localStorage.getItem('fehuvia_token');
        if (!token) throw new Error('Authorization required.');

        if (!window.ethereum) {
          throw new Error('MetaMask or a valid EVM browser wallet is required to complete this actual on-chain transaction.');
        }

        setStatusText('Connecting to your browser wallet extension...');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        // Automatically sync wallet address if it doesn't match or is a demo address
        if (!userProfile?.walletAddress || userProfile.walletAddress.startsWith('0xdemo') || userProfile.walletAddress.toLowerCase() !== userAddress.toLowerCase()) {
          const token = localStorage.getItem('fehuvia_token');
          if (token) {
            try {
              const apiRes = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3001'}/api/auth/wallet`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ walletAddress: userAddress })
              });
              if (apiRes.ok) {
                await fetchProfile();
              }
            } catch (err) {
              console.warn("Failed to auto-update wallet address on backend during conversion:", err);
            }
          }
        }

        // Check/switch network to Morph Testnet (2910 / 0xb5e)
        setStatusText('Verifying Morph L2 Testnet network connection...');
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        if (chainId !== 2910 && chainId !== 2818) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xb5e' }],
            });
          } catch (switchErr) {
            if (switchErr.code === 4902 || switchErr.message?.toLowerCase().includes('unrecognized')) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xb5e',
                  chainName: 'Morph Testnet',
                  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['https://rpc-hoodi.morph.network'],
                  blockExplorerUrls: ['https://explorer-testnet.morph.network']
                }],
              });
            } else {
              throw switchErr;
            }
          }
        }

        const USDC_ADDRESS = "0xD8FCA101505D9F698485B22dCC79dF2Ec7a24660";
        const amountDecimals = ethers.parseUnits(usdVal.toFixed(2), 6);
        let txHash = '0x';

        if (direction === 'fiat_to_token') {
          setStatusText(`Minting $${usdVal.toLocaleString()} USDC stablecoins directly into your wallet via MetaMask...`);
          const abi = ["function mint(address to, uint256 amount) returns (bool)"];
          const usdc = new ethers.Contract(USDC_ADDRESS, abi, signer);
          const tx = await usdc.mint(userAddress, amountDecimals);
          setStatusText('Waiting for Morph L2 Testnet block finality...');
          const receipt = await tx.wait();
          txHash = receipt.hash;
        } else {
          setStatusText('Prompting MetaMask to sign stablecoin off-ramp custody transfer...');
          const abi = [
            "function balanceOf(address account) view returns (uint256)",
            "function mint(address to, uint256 amount) returns (bool)",
            "function transfer(address to, uint256 amount) returns (bool)"
          ];
          const usdc = new ethers.Contract(USDC_ADDRESS, abi, signer);
          
          // Auto-faucet check: if user has no USDC, let's auto-mint some first using MetaMask!
          const bal = await usdc.balanceOf(userAddress);
          if (bal < amountDecimals) {
            setStatusText('Zero mUSDC detected. Minting initial testnet USDC tokens first...');
            const mintTx = await usdc.mint(userAddress, ethers.parseUnits("50000", 6));
            await mintTx.wait();
          }

          setStatusText('Transferring USDC stablecoins to bridge off-ramp custody...');
          const tx = await usdc.transfer("0x000000000000000000000000000000000000dEaD", amountDecimals);
          setStatusText('Waiting for Morph L2 Testnet block finality...');
          const receipt = await tx.wait();
          txHash = receipt.hash;
        }

        setStatusText('Synchronizing on-chain finality with Fehuvia ledger databases...');

        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3001'}/api/bridge/convert`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            direction,
            amountUSD: usdVal,
            selectedBankId: selectedBankId,
            txHash: txHash
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Backend bridge conversion failed.');
        }

        const data = await res.json();

        setStep(4);
        setStatusText(direction === 'fiat_to_token' 
          ? `Conversion successful! Converted ₱${phpVal.toLocaleString()} from ${targetBank.short} into $${usdVal.toLocaleString()} USDC.`
          : `Off-ramp successful! Converted $${usdVal.toLocaleString()} USDC to ₱${phpVal.toLocaleString()} in your ${targetBank.short} account.`
        );

        setNotifications(prev => [
          {
            id: `bridge-${Date.now()}`,
            title: direction === 'fiat_to_token' ? 'USDC Mint Completed' : 'Bank Cash Disbursed',
            message: direction === 'fiat_to_token' 
              ? `Successfully converted ₱${phpVal.toLocaleString()} via ${targetBank.short} to $${usdVal.toLocaleString()} USDC.`
              : `Successfully Converted $${usdVal.toLocaleString()} USDC to ₱${phpVal.toLocaleString()} via ${targetBank.short}.`,
            time: 'Just now',
            read: false,
            type: 'success',
            meta: `Tx: ${txHash.substring(0, 10)}...`
          },
          ...prev
        ]);

        setToast({
          show: true,
          message: direction === 'fiat_to_token' 
            ? `Successfully minted $${usdVal.toLocaleString()} USDC to wallet!`
            : `Successfully credited ₱${phpVal.toLocaleString()} operating balance!`,
          txHash: `${txHash.substring(0, 10)}...`
        });

        if (userProfile && userProfile.walletAddress && userProfile.walletAddress.startsWith('0xdemo')) {
          setWalletUSDCBalance(prev => direction === 'fiat_to_token' ? prev + usdVal : Math.max(0, prev - usdVal));
        } else {
          // Connected with real EVM wallet: query on-chain balance to match blockchain state
          if (window.ethereum) {
            const tempProvider = new ethers.BrowserProvider(window.ethereum);
            const tempUsdc = new ethers.Contract(USDC_ADDRESS, ["function balanceOf(address account) view returns (uint256)"], tempProvider);
            tempUsdc.balanceOf(userAddress).then(bal => {
              const formattedBal = Number(ethers.formatUnits(bal, 6));
              setWalletUSDCBalance(formattedBal);
            }).catch(e => console.error("Balance refresh error:", e));
          }
        }

        fetchProfile();

      } catch (err) {
        console.error('Bridge conversion failed:', err);
        setStep(0);
        setErrorText(getFriendlyError(err, 'bridge'));
        setToast({
          show: true,
          message: getFriendlyError(err, 'bridge'),
          txHash: getErrorBadge('bridge')
        });
      }
    }, 4500);
  };

  const handleReturnAndSettle = () => {
    if (!prefilledBridgeInvoice) return;
    const invoiceId = prefilledBridgeInvoice.id;
    
    setPrefilledBridgeInvoice(null);
    setCurrentPage('Dashboard');
    
    setTimeout(() => {
      executeSettlement(invoiceId);
    }, 100);
  };

  const handleReset = () => {
    setStep(0);
    setSourceAmount('');
    setDestAmount('');
    setStatusText('');
    setErrorText('');
    setPrefilledBridgeInvoice(null);
  };

  // Keyboard pad helper
  const handleKeypadPress = (num) => {
    if (otpCode.length < 6) {
      setOtpCode(prev => prev + num);
      setErrorText('');
    }
  };

  const handleKeypadDelete = () => {
    setOtpCode(prev => prev.slice(0, -1));
    setErrorText('');
  };

  const handleAuthorizeOtp = () => {
    if (otpCode.length < 6) return;
    if (otpCode !== '123456') {
      setErrorText('Invalid sandbox OTP code. Please enter 123456.');
      return;
    }
    setErrorText('');
    runConversionPipeline();
  };

  const isFiatToToken = direction === 'fiat_to_token';
  const targetBank = allInstitutions.find(b => b.id === selectedBankId) || { id: 'gcash', short: 'GCash', isLinked: true, balance: 12500000.00 };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-outfit relative">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2C2C2C] pb-5">
        <div>
          <h1 className="font-cormorant text-2xl sm:text-3xl text-white font-light tracking-wide flex items-center gap-2.5">
            <Landmark className="w-7 h-7 text-[#D4AF37] shrink-0 animate-pulse" />
            <span>Treasury Conversion Bridge</span>
          </h1>
          <p className="text-[#6a6a6a] text-xs font-light mt-1.5 leading-relaxed">
            Convert traditional corporate bank balances into Web3 stablecoins and vice-versa in real-time.
          </p>
        </div>

        {/* Demo Mode Badge */}
        <div className="flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-full px-3 py-1 text-[10px] text-gold-metallic font-bold uppercase tracking-wider animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-gold-metallic" />
          <span>Interactive Demo Mode Active</span>
        </div>
      </div>

      {/* Prefilled settlement banner */}
      {prefilledBridgeInvoice && (
        <div className="p-4 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-xs text-white flex gap-3 items-center animate-[slideIn_0.3s_ease-out]">
          <ShieldAlert className="w-5 h-5 text-gold-metallic shrink-0" />
          <div className="flex-1 text-left">
            <span className="font-bold text-gold-metallic block text-[10px] uppercase tracking-wider">Settlement Conversion active</span>
            <span className="font-light text-white/70 block mt-0.5">
              Prefilled to settle invoice <strong className="text-white">{prefilledBridgeInvoice.id}</strong> to <strong className="text-white">{prefilledBridgeInvoice.supplier}</strong> for <strong className="text-white">${prefilledBridgeInvoice.amount.toLocaleString()} USDC</strong>. Inputs locked.
            </span>
          </div>
          <button 
            onClick={handleReset}
            className="text-[10px] font-bold text-gold-metallic hover:text-white transition-colors cursor-pointer border border-[#D4AF37]/20 rounded-lg px-2.5 py-1 bg-black/30"
          >
            Cancel Prefill
          </button>
        </div>
      )}

      {/* 2. Main Converter Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Swapping Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 border border-[#2C2C2C] relative overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, rgba(16, 16, 18, 0.95) 0%, rgba(10, 10, 12, 0.95) 100%)',
                 boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 1px 2px rgba(255, 255, 255, 0.015)'
               }}>
            
            {step === 0 ? (
              <div className="space-y-6">
                
                {/* Funding Source Segment Selector */}
                <div className="space-y-2 text-left animate-fadeIn">
                  <label className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider block">
                    {isFiatToToken ? 'Select Funding Source Bank / Wallet' : 'Select Destination Bank / Wallet'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {allInstitutions.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => {
                          if (prefilledBridgeInvoice) return; // Locked if prefilled B2B settlement
                          setSelectedBankId(bank.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all duration-300 flex items-center gap-2.5 cursor-pointer relative overflow-hidden ${
                          selectedBankId === bank.id
                            ? 'bg-[#D4AF37]/5 border-[#D4AF37]/50 shadow-[0_0_12px_rgba(212,175,55,0.12)] scale-[1.02]'
                            : bank.isLinked
                              ? 'bg-black/30 border-[#2C2C2C] hover:border-white/20'
                              : 'bg-black/15 border-[#2C2C2C]/50 opacity-40 hover:opacity-75'
                        } ${prefilledBridgeInvoice ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <BankLogo bankId={bank.id} className="h-8 w-8 rounded-xl shrink-0 shadow-sm" />
                        <div className="truncate">
                          <span className="text-[10px] font-bold text-white block truncate">{bank.short}</span>
                          {bank.isLinked ? (
                            <span className="text-[8px] text-emerald-400 font-medium block mt-0.5">
                              ₱{parseFloat(bank.balance).toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </span>
                          ) : (
                            <span className="text-[8px] text-white/30 block mt-0.5">
                              Unlinked
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inputs & Controls */}
                {targetBank.isLinked ? (
                  <>
                    <div className="flex flex-col gap-4 relative">
                      
                      {/* Source Card */}
                      <div className="p-5 rounded-2xl border border-white/5 bg-[#070708] space-y-2 relative transition-all focus-within:border-[#D4AF37]/35">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider block">
                            {isFiatToToken ? 'Source (Traditional Cash)' : 'Source (Web3 Stablecoins)'}
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={!!prefilledBridgeInvoice}
                              onClick={() => handleFractionClick(0.25)}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-extrabold text-[#a1a1a1] hover:text-white hover:border-white/25 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              1/4
                            </button>
                            <button
                              type="button"
                              disabled={!!prefilledBridgeInvoice}
                              onClick={() => handleFractionClick(0.5)}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-extrabold text-[#a1a1a1] hover:text-white hover:border-white/25 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              1/2
                            </button>
                            <button
                              type="button"
                              disabled={!!prefilledBridgeInvoice}
                              onClick={() => handleFractionClick(1.0)}
                              className="px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[9px] font-extrabold text-gold-metallic hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              MAX
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2.5 shrink-0">
                            {isFiatToToken ? (
                              <BankLogo bankId={targetBank.id} className="h-8 w-8 rounded-full shrink-0 shadow-sm" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                <Wallet className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex flex-col text-left">
                              <span className="text-sm font-bold text-white uppercase tracking-wide">
                                {isFiatToToken ? `${targetBank.short} (PHP)` : 'mUSDC (USDC)'}
                              </span>
                              {!isFiatToToken && (
                                <span className="text-[9px] text-emerald-400 font-mono mt-0.5 animate-pulse" title={walletAddress}>
                                  {displayAddress}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <input
                              type="text"
                              disabled={!!prefilledBridgeInvoice}
                              value={sourceAmount}
                              onChange={handleSourceChange}
                              placeholder="0.00"
                              className="bg-transparent text-right text-lg sm:text-xl font-mono font-bold text-white focus:outline-none placeholder-white/20 w-44 disabled:opacity-70 disabled:cursor-not-allowed"
                            />
                            <span className="text-[9px] text-[#6a6a6a] mt-1 font-light">
                              Available: {isFiatToToken ? `₱${parseFloat(targetBank.balance || balance).toLocaleString(undefined, {minimumFractionDigits: 2})}` : `$${walletUSDCBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} USDC`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Absolute Center Swap Button */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button
                          type="button"
                          disabled={!!prefilledBridgeInvoice}
                          onClick={toggleDirection}
                          className="h-10 w-10 rounded-full border border-[#2C2C2C] bg-[#0c0c0e] hover:bg-[#161618] hover:border-[#D4AF37]/50 active:scale-95 transition-all text-[#6a6a6a] hover:text-gold-metallic flex items-center justify-center cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ArrowLeftRight className="w-4 h-4 transform rotate-90" />
                        </button>
                      </div>

                      {/* Destination Card */}
                      <div className="p-5 rounded-2xl border border-white/5 bg-[#070708] space-y-2 relative transition-all">
                        <label className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider block">
                          {isFiatToToken ? 'Destination (Web3 Stablecoins)' : 'Destination (Traditional Cash)'}
                        </label>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2.5 shrink-0">
                            {!isFiatToToken ? (
                              <BankLogo bankId={targetBank.id} className="h-8 w-8 rounded-full shrink-0 shadow-sm" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                <Wallet className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex flex-col text-left">
                              <span className="text-sm font-bold text-white uppercase tracking-wide">
                                {!isFiatToToken ? `${targetBank.short} (PHP)` : 'mUSDC (USDC)'}
                              </span>
                              {isFiatToToken && (
                                <span className="text-[9px] text-emerald-400 font-mono mt-0.5 animate-pulse" title={walletAddress}>
                                  {displayAddress}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-lg sm:text-xl font-mono font-bold text-white/90">
                              {destAmount ? (isFiatToToken ? `$${parseFloat(destAmount).toLocaleString(undefined, {minimumFractionDigits: 2})} USDC` : `₱${parseFloat(destAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}`) : '0.00'}
                            </span>
                            <span className="text-[9px] text-[#6a6a6a] mt-1 font-light">
                              Available: {!isFiatToToken ? `₱${parseFloat(targetBank.balance || balance).toLocaleString(undefined, {minimumFractionDigits: 2})}` : `$${walletUSDCBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} USDC`}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Error Banner */}
                    {errorText && (
                      <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/10 text-xs text-red-400 font-light flex gap-2 items-center">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{errorText}</span>
                      </div>
                    )}

                    {/* Actions Footer */}
                    <button
                      type="button"
                      onClick={handleExecuteBridge}
                      className="w-full bg-gold-metallic hover:box-gold-glow text-black font-extrabold uppercase tracking-wider text-xs rounded-xl py-4 transform hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 cursor-pointer animate-[shimmer_2s_infinite]"
                    >
                      <span>Execute Conversion Bridge</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-[#D4AF37]/30 bg-black/45 space-y-4 text-center mt-6 animate-fadeIn">
                    <div className="h-10 w-10 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-gold-metallic mx-auto">
                      <Landmark className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">Link {targetBank.short} to Convert</span>
                      <p className="text-white/40 text-[11px] font-light max-w-sm mx-auto leading-relaxed mt-1">
                        Your {targetBank.short} account is currently unlinked. Connect via our sandbox Brankas integration to fetch operating balances and enable Web3 conversion rails.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenBankLink(targetBank)}
                      className="px-6 py-2.5 bg-gold-metallic hover:bg-gold-metallic/90 text-black font-extrabold uppercase tracking-wider text-[10px] rounded-full transition-all cursor-pointer shadow-lg shadow-gold-metallic/15 hover:scale-[1.02] active:scale-95"
                    >
                      🔗 Connect {targetBank.short} via Brankas Secure API
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
                
                {/* Loader Animation Container */}
                <div className="relative flex items-center justify-center h-24 w-24">
                  {step < 4 ? (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF37]/25 animate-spin duration-[4000ms]"></div>
                      <div className="absolute inset-2 rounded-full border border-[#D4AF37]/35 border-t-[#D4AF37] animate-spin"></div>
                      <ArrowLeftRight className="w-6 h-6 text-gold-metallic animate-pulse" />
                    </>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-[fadeIn_0.3s_ease-out] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <Check className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Step Description */}
                <div className="max-w-md space-y-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    {step === 4 ? 'Conversion Completed' : `Execution Sequence: Step ${step} of 3`}
                  </h3>
                  <p className="text-[#a1a1a1] text-xs font-light leading-relaxed px-4 transition-all">
                    {statusText}
                  </p>
                </div>

                {/* Completion CTA */}
                {step === 4 && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    {prefilledBridgeInvoice ? (
                      <button
                        type="button"
                        onClick={handleReturnAndSettle}
                        className="bg-gold-metallic hover:box-gold-glow text-black font-bold uppercase tracking-wider text-xs rounded-xl px-8 py-4 transition-all duration-300 shadow-xl cursor-pointer flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Return & Settle Invoice</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold uppercase tracking-wider text-xs rounded-xl px-8 py-3.5 transition-all shadow-xl cursor-pointer"
                      >
                        Done & Convert More
                      </button>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

        {/* Informational Sidebar */}
        <div className="space-y-6">
          
          {/* Rate Card Widget */}
          <div className="p-6 rounded-2xl border border-[#2C2C2C] bg-[#0a0a0c] space-y-4">
            <h3 className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-[0.15em] text-left">Rate Details</h3>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#a1a1a1] font-light">Exchange Rate:</span>
                <span className="font-bold text-white font-mono">1.00 USDC = ₱{exchangeRate.toFixed(2)} PHP</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#a1a1a1] font-light">Conversion Fee:</span>
                <span className="font-extrabold text-gold-metallic uppercase tracking-wider">Free (Demo Mode)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#a1a1a1] font-light">Network Gas Limit:</span>
                <span className="text-white/60 font-light font-mono">&lt; 0.0001 ETH</span>
              </div>
            </div>
          </div>

          {/* Educational Gateway Info */}
          <div className="p-6 rounded-2xl border border-[#2C2C2C] bg-[#0a0a0c] space-y-4 text-left">
            <h3 className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-[0.15em] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-gold-metallic" />
              <span>How it works</span>
            </h3>
            <div className="space-y-4 text-xs font-light text-[#a1a1a1] leading-relaxed">
              <div className="flex gap-2.5 items-start">
                <span className="h-5 w-5 shrink-0 rounded-full bg-[#161618] border border-[#2C2C2C] text-[10px] font-bold text-white flex items-center justify-center">1</span>
                <p>
                  **Brankas Link APIs** handle direct, authenticated Peso operating balance lock-ups/disbursements from linked corporate channels.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="h-5 w-5 shrink-0 rounded-full bg-[#161618] border border-[#2C2C2C] text-[10px] font-bold text-white flex items-center justify-center">2</span>
                <p>
                  **StraitsX Liquidity Gateway** routes stablecoins and operates currency swaps directly inside automated smart contracts.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="h-5 w-5 shrink-0 rounded-full bg-[#161618] border border-[#2C2C2C] text-[10px] font-bold text-white flex items-center justify-center">3</span>
                <p>
                  **Morph L2 Stablecoins** are securely minted directly into the treasurer's EVM key for immediate T+0 business settlement.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Interactive Bank Security Gate Overlay */}
      {showSecurityGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out] font-outfit text-white">
          <div className="glass-panel-gold rounded-3xl w-full max-w-lg p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative border border-[#D4AF37]/20 flex flex-col">
            
            {/* Close */}
            <button
              onClick={() => setShowSecurityGate(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <ShieldAlert className="w-10 h-10 text-gold-metallic mx-auto mb-3 animate-bounce" />
              <h2 className="font-cormorant text-2xl font-light tracking-wide text-white">
                Bank Payout Authorization
              </h2>
              <p className="text-white/40 text-xs font-light mt-1">
                Authorize Peso transfer of ₱{parseFloat(sourceAmount).toLocaleString(undefined, {minimumFractionDigits: 2})} via secure open finance gateway.
              </p>
            </div>

            {/* Error Banner inside Security Gate */}
            {errorText && (
              <div className="mb-5 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorText}
              </div>
            )}

            {/* Selector Tab */}
            <div className="grid grid-cols-2 gap-2 bg-black/35 border border-[#2C2C2C] p-1 rounded-xl mb-6">
              <button
                onClick={() => setVerificationMode('sms')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  verificationMode === 'sms'
                    ? 'bg-gold-metallic text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" /> SMS OTP Code
              </button>
              <button
                onClick={() => setVerificationMode('qr')}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  verificationMode === 'qr'
                    ? 'bg-gold-metallic text-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> InstaPay QR Scan
              </button>
            </div>

            {/* Mode A: SMS OTP Code Keypad Verification */}
            {verificationMode === 'sms' && (
              <div className="space-y-6 flex flex-col items-center">
                <div className="text-center max-w-sm space-y-1">
                  <span className="text-[10px] font-bold text-gold-metallic uppercase tracking-widest block">Open Finance mandate sent</span>
                  <p className="text-[11px] text-white/50 leading-relaxed font-light">
                    A simulated secure SMS authorization code was dispatched to your mobile +63 917 **** 201. Please enter the code below.
                  </p>
                </div>

                {/* Code boxes display */}
                <div className="flex gap-2 justify-center">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i}
                      className={`h-11 w-9 rounded-xl border flex items-center justify-center font-mono text-lg font-bold transition-all ${
                        otpCode.length === i 
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]/25' 
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      {otpCode[i] || ''}
                    </div>
                  ))}
                </div>

                {/* Digital Keypad */}
                <div className="w-full max-w-xs grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleKeypadPress(String(num))}
                      className="py-3 bg-[#0a0a0c] hover:bg-[#161618] border border-[#2C2C2C] active:border-gold-metallic/50 rounded-xl font-bold font-mono text-base hover:text-gold-metallic transition-all cursor-pointer active:scale-95"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={handleKeypadDelete}
                    className="py-3 bg-[#0a0a0c] hover:bg-[#161618] border border-[#2C2C2C] rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 transition-all cursor-pointer active:scale-95"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleKeypadPress('0')}
                    className="py-3 bg-[#0a0a0c] hover:bg-[#161618] border border-[#2C2C2C] rounded-xl font-bold font-mono text-base hover:text-gold-metallic transition-all cursor-pointer active:scale-95"
                  >
                    0
                  </button>
                  <button
                    onClick={handleAuthorizeOtp}
                    disabled={otpCode.length < 6}
                    className={`py-3 rounded-xl flex items-center justify-center font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                      otpCode.length === 6
                        ? 'bg-gold-metallic hover:bg-gold-metallic/90 text-black shadow-lg shadow-gold-metallic/15'
                        : 'bg-[#161618] border border-[#2C2C2C] text-white/20 cursor-not-allowed'
                    }`}
                  >
                    Authorize
                  </button>
                </div>
                
                <span className="text-[9px] text-white/30 font-light flex items-center gap-1.5 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-metallic" />
                  Secured by 256-bit open finance credential tokenization.
                </span>
              </div>
            )}

            {/* Mode B: QR Code Mandate */}
            {verificationMode === 'qr' && (
              <div className="space-y-6 flex flex-col items-center">
                <div className="text-center max-w-sm">
                  <span className="text-[10px] font-bold text-gold-metallic uppercase tracking-widest block">InstaPay / PesoNet Corporate QR</span>
                  <p className="text-[11px] text-white/50 leading-relaxed font-light mt-1">
                    Scan this secure transfer QR code from your bank mobile application to settle the currency swap.
                  </p>
                </div>

                {/* Simulated QR Code Card */}
                <div className="p-4 bg-white rounded-3xl shadow-2xl relative border border-white/10 shrink-0">
                  <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=instapay-fehuvia- StraitsX-swap-${sourceAmount}&color=0c0c0e`} 
                      alt="Simulated InstaPay Mandate QR Code"
                      className="w-40 h-40 object-contain rounded-xl select-none"
                    />
                    <span className="text-[10px] text-black font-extrabold uppercase mt-2 tracking-widest">Fehuvia Treasury</span>
                  </div>
                </div>

                {/* QR Mandate details */}
                <div className="w-full bg-[#0a0a0c] border border-[#2C2C2C] rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a1a1a1] font-light">Mandate Reference:</span>
                    <span className="font-bold text-white font-mono">TX-SWAP-BDO-99201</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a1a1a1] font-light">Recipient:</span>
                    <span className="font-bold text-white">StraitsX PHP-USDC Liquidity Pool</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a1a1a1] font-light">Charge Amount:</span>
                    <span className="font-bold text-emerald-400 font-mono">₱{parseFloat(sourceAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>

                <button
                  onClick={runConversionPipeline}
                  className="w-full bg-gold-metallic hover:box-gold-glow text-black font-extrabold uppercase tracking-wider text-xs rounded-xl py-3.5 transform hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Payout Scanned & Authorized</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Simulated X close button overlay helper
function X({ className, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2} 
      stroke="currentColor" 
      className={className} 
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
