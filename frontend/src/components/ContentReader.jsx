import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Code,
  ShieldCheck,
  Terminal,
  HelpCircle,
  FileText,
  AlertTriangle,
  Cpu,
  ExternalLink,
  Search,
  Copy,
  Check,
  Sparkles,
  CheckCircle,
  FileCode,
  LayoutDashboard,
  ShieldAlert,
  ArrowUpRight,
  ChevronDown,
  Menu
} from 'lucide-react';

export default function ContentReader({ activePage = 'core-concept', onClose, setView }) {
  const [activeTab, setActiveTab] = useState(activePage);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Copy to clipboard helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle category expansion
  const toggleCategory = (catName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Sync activeTab if activePage changes from parent
  useEffect(() => {
    setActiveTab(activePage);
  }, [activePage]);

  // Initialize category expansion states (collapsed on default)
  useEffect(() => {
    const initial = {};
    categories.forEach(cat => {
      initial[cat.name] = false;
    });
    setExpandedCategories(initial);
  }, []);

  // Group pages by category
  const categories = [
    {
      name: 'System Navigation',
      items: [
        { id: 'core-concept', title: 'Core Concept', icon: Sparkles },
        { id: 'cfo-dashboard', title: 'CFO Dashboard', icon: LayoutDashboard },
        { id: 'protocol-specs', title: 'Protocol Specs', icon: Cpu },
      ]
    },
    {
      name: 'Resources',
      items: [
        { id: 'documentation', title: 'Documentation', icon: BookOpen },
        { id: 'developer-portal', title: 'Developer Portal', icon: Terminal },
        { id: 'smart-contracts', title: 'Smart Contracts', icon: FileCode },
        { id: 'morph-explorer', title: 'Morph L2 Explorer', icon: ExternalLink },
      ]
    },
    {
      name: 'Corporate',
      items: [
        { id: 'security-audit', title: 'Security Audit', icon: ShieldCheck },
        { id: 'risk-parameters', title: 'Risk Parameters', icon: ShieldAlert },
        { id: 'terms-carriage', title: 'Terms of Carriage', icon: FileText },
      ]
    },
    {
      name: 'Sub-footer',
      items: [
        { id: 'privacy-charter', title: 'Privacy Charter', icon: ShieldCheck },
        { id: 'risk-warning', title: 'Risk Warning', icon: AlertTriangle },
      ]
    }
  ];

  // Flattened items for search/retrieval
  const allItems = categories.flatMap(cat => cat.items.map(item => ({ ...item, categoryName: cat.name })));
  const currentItem = allItems.find(item => item.id === activeTab) || allItems[0];

  // Filter items based on search
  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  // Render contents dynamically based on activeTab
  const renderPageContent = () => {
    switch (activeTab) {
      case 'core-concept':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Liquidity Redefined</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Core Algorithmic Concept</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                Fehuvia operates as an on-chain autonomous liquidity co-pilot designed to resolve the single biggest constraint in modern commerce: <strong>net-payment delay terms</strong>. By reading off-chain bank feeds, invoice ledgers, and on-chain transactional flows, the system forecasts precise corporate liquidity cycles and triggers instant invoice factoring settlements.
              </p>
            </div>

            {/* Visual concept layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="plate-black-metallic shape-asymmetric-3 p-5 border border-white/5 space-y-3">
                <div className="w-9 h-9 rounded bg-[#e4c37a]/10 flex items-center justify-center border border-[#e4c37a]/20">
                  <span className="text-sm font-bold text-[#e4c37a]">01</span>
                </div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Predictive Forecasts</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Real-time machine learning models predict future cash reserves across a 30-day window, projecting incoming collections and pending liabilities.
                </p>
              </div>

              <div className="plate-black-metallic shape-asymmetric-3 p-5 border border-white/5 space-y-3">
                <div className="w-9 h-9 rounded bg-[#e4c37a]/10 flex items-center justify-center border border-[#e4c37a]/20">
                  <span className="text-sm font-bold text-[#e4c37a]">02</span>
                </div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Instant Smart Settlement</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Rather than waiting for 30, 60, or 90 days, suppliers trigger L2 smart contracts to settle valid accounts receivable instantly.
                </p>
              </div>

              <div className="plate-black-metallic shape-asymmetric-3 p-5 border border-white/5 space-y-3">
                <div className="w-9 h-9 rounded bg-[#e4c37a]/10 flex items-center justify-center border border-[#e4c37a]/20">
                  <span className="text-sm font-bold text-[#e4c37a]">03</span>
                </div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Morph L2 rollups</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Transactions execute natively on Morph Testnet, achieving near-instant settlement finality at a fraction of standard L1 gas fees.
                </p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3">Decentralized Factoring Engine</h3>
              <p className="text-xs text-white/50 leading-relaxed max-w-3xl mb-4">
                When a supplier requests early invoice payment, Fehuvia automatically evaluates corporate scorecards and risk premiums. The factoring discount is computed dynamically by on-chain algorithms and paid out from decentralized liquidity pools directly in stablecoins (e.g. USDT, USDC) on the Morph network.
              </p>
              <button
                onClick={() => setView('dashboard')}
                className="px-5 py-2.5 rounded bg-[#e4c37a] text-black font-bold uppercase tracking-wider text-xs hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Launch Demo App</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'cfo-dashboard':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Workspace Controls</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">CFO Dashboard Architecture</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                The Fehuvia CFO Dashboard is a state-of-the-art interactive workspace designed for corporate treasurers. It provides a real-time command center linking cashflow forecasting, active invoices, on-chain balances, and automatic transaction matching.
              </p>
            </div>

            {/* Dashboard features stack */}
            <div className="space-y-4">
              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg flex gap-4 items-start">
                <LayoutDashboard className="w-5 h-5 text-[#e4c37a] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Treasury Overview Panel</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Visualizes high-impact cashflow metrics including Total Treasury Valuation, Available Instant Balances, and Pending Invoices. Seamlessly integrates multi-chain assets under a unified interface.
                  </p>
                </div>
              </div>

              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg flex gap-4 items-start">
                <Cpu className="w-5 h-5 text-[#e4c37a] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">AI Recommendation Copilot</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Evaluates liabilities and flags early payment discounts. Recommends strategic debt carriage options based on current pool yields and gas parameters.
                  </p>
                </div>
              </div>

              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg flex gap-4 items-start">
                <FileText className="w-5 h-5 text-[#e4c37a] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Immutable Invoice Ledger</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Stores valid accounts receivable on-chain. Invoice attributes, verification signatures, and payment clearances are cryptographically logged, eliminating fraud risks and manual audits.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <button
                onClick={() => setView('dashboard')}
                className="px-5 py-2.5 rounded border border-[#e4c37a]/30 text-[#e4c37a] font-bold uppercase tracking-wider text-xs hover:bg-[#e4c37a]/5 transition-all"
              >
                Enter Interactive CFO Dashboard Demo
              </button>
            </div>
          </div>
        );

      case 'protocol-specs':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Technical standards</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Protocol Specifications</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                The Fehuvia core protocol standardizes decentralized invoice factoring serialization, risk scoring architectures, and state synchronization pipelines with Morph Layer 2 rollups.
              </p>
            </div>

            {/* Specs Table */}
            <div className="plate-black-metallic rounded-lg border border-white/5 overflow-hidden">
              <table className="w-full text-left text-xs text-white/70">
                <thead>
                  <tr className="border-b border-white/5 text-white bg-white/[0.02] font-semibold">
                    <th className="p-3.5">Parameter</th>
                    <th className="p-3.5">Specification</th>
                    <th className="p-3.5">Verification Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3.5 font-bold text-white font-mono">Rollup Target</td>
                    <td className="p-3.5">Morph Testnet Rollup Core</td>
                    <td className="p-3.5">L2 Gas Optimized Contract States</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white font-mono">Invoice Schema</td>
                    <td className="p-3.5">FIP-04 Invoice Struct Metadata</td>
                    <td className="p-3.5">Keccak-256 On-Chain Content Hash</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white font-mono">Settlement Finality</td>
                    <td className="p-3.5">T+0 Instant Rollup Execution</td>
                    <td className="p-3.5">Optimistic ZK-Proof State Finalizer</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white font-mono">Base Liquidity Model</td>
                    <td className="p-3.5">Decentralized Automated Discounting</td>
                    <td className="p-3.5">Quadratic Factorization Formula</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">State Lifecycle Pipeline</h4>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center text-center">
                <div className="bg-white/[0.02] border border-white/5 rounded p-3 w-full">
                  <span className="text-[10px] text-[#e4c37a] uppercase font-bold block mb-1">Step 1</span>
                  <span className="text-xs text-white uppercase font-bold">Sign Metadata</span>
                </div>
                <div className="text-white/35 font-bold">➜</div>
                <div className="bg-white/[0.02] border border-white/5 rounded p-3 w-full">
                  <span className="text-[10px] text-[#e4c37a] uppercase font-bold block mb-1">Step 2</span>
                  <span className="text-xs text-white uppercase font-bold">Mint Factoring Right</span>
                </div>
                <div className="text-white/35 font-bold">➜</div>
                <div className="bg-white/[0.02] border border-white/5 rounded p-3 w-full">
                  <span className="text-[10px] text-[#e4c37a] uppercase font-bold block mb-1">Step 3</span>
                  <span className="text-xs text-white uppercase font-bold">Execute on Morph</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'documentation':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">User manual</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Protocol Documentation</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                Get started integrating Fehuvia with your existing ERP, inventory system, or crypto accounting stack. The documentation outlines primary actions, triggers, and query schemas.
              </p>
            </div>

            <div className="space-y-5">
              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quickstart Integration Guide</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  To begin automated B2B settlements:
                  <br />
                  1. Link your MetaMask or WalletConnect wallet to the Fehuvia CFO Portal.
                  <br />
                  2. Register your business invoice template metadata.
                  <br />
                  3. Synchronize incoming supplier and vendor addresses.
                  <br />
                  4. Deploy liquidity reserves or settle outstanding balances with a single click.
                </p>
              </div>

              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Treasury Webhook Triggers</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Define callbacks to react instantly to invoice states. Fehuvia emits events such as `InvoiceIssued`, `InvoiceApprovedForPay`, `FactoringDiscountCommitted`, and `SettleClearedOnMorphL2`.
                </p>
              </div>
            </div>
          </div>
        );

      case 'developer-portal':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Build on Fehuvia</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Developer Portal</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                Integrate automated, decentralized liquidities directly into your applications. Install our SDK, import smart hooks, and execute instant invoice settlements natively.
              </p>
            </div>

            {/* SDK Code Snippet */}
            <div className="plate-black-metallic rounded-lg border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#e4c37a]" />
                  <span className="text-[10px] text-white/70 font-mono">fehuvia-integration.js</span>
                </div>
                <button
                  onClick={() => handleCopy(`// Install SDK: npm i @fehuvia/sdk\nimport { FehuviaSDK } from '@fehuvia/sdk';\n\nconst sdk = new FehuviaSDK({\n  network: 'morph-testnet',\n  apiKey: 'fh_test_8390ab2c89f'\n});\n\n// Trigger automated settlement on L2\nconst receipt = await sdk.invoices.settle('INV-002');\nconsole.log('Cleared block:', receipt.blockNumber);`, 'sdk-snippet')}
                  className="text-white/40 hover:text-white transition-colors text-[10px] flex items-center gap-1 font-mono uppercase"
                >
                  {copiedId === 'sdk-snippet' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-[#e4c37a]/90 bg-black/40 overflow-x-auto leading-relaxed">
                {`// Install SDK: npm i @fehuvia/sdk
import { FehuviaSDK } from '@fehuvia/sdk';

const sdk = new FehuviaSDK({
  network: 'morph-testnet',
  apiKey: 'fh_test_8390ab2c89f'
});

// Trigger automated settlement on L2
const receipt = await sdk.invoices.settle('INV-002');
console.log('Cleared block:', receipt.blockNumber);`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/5 rounded p-4 space-y-1">
                <span className="text-xs font-bold text-white uppercase block">API Reference</span>
                <span className="text-[11px] text-white/50 block">Explore full HTTP/gRPC interfaces, payload specifications, and security validations.</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded p-4 space-y-1">
                <span className="text-xs font-bold text-white uppercase block">Sandbox Testnet Faucet</span>
                <span className="text-[11px] text-white/50 block">Claim mock corporate stablecoins to test high-volume factory routing in sandbox mode.</span>
              </div>
            </div>
          </div>
        );

      case 'smart-contracts':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Morph deployment</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Smart Contracts</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                All settlements, factoring agreements, and yield-pooling models run on highly optimized, audited smart contracts deployed natively on the Morph Testnet.
              </p>
            </div>

            {/* Smart Contract cards list */}
            <div className="space-y-3.5">
              {[
                { name: 'FehuviaInvoiceLedger.sol', desc: 'Main core registry storing invoice states, factoring transfers, and clearances.', address: '0x83eF92C23CBa5232938abC9c836efd92C80e927c' },
                { name: 'FehuviaLiquidityPool.sol', desc: 'Pool managing stablecoin reserves, deposits, factoring payouts, and rewards.', address: '0x2C46F8125Ea9d20c57c4c92A1a36E108aF92C32D' },
                { name: 'MorphStateSynchronizer.sol', desc: 'Synchronizes cross-chain rollups, state roots, and transaction state receipts.', address: '0x9EfdC2373C2C3a129E3eBd36F9c8efd927c0e2a3' }
              ].map((contract, i) => (
                <div key={i} className="plate-black-metallic p-4 rounded border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white uppercase block font-mono">{contract.name}</span>
                    <span className="text-[11px] text-white/50 leading-relaxed block">{contract.desc}</span>
                    <span className="text-[10px] font-mono text-[#e4c37a] block mt-1">{contract.address}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(contract.address, `contract-${i}`)}
                    className="px-3 py-1.5 rounded bg-white/[0.04] border border-white/10 hover:bg-white/[0.04] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 self-start md:self-auto"
                  >
                    {copiedId === `contract-${i}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'morph-explorer':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">On-chain visibility</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Morph L2 Explorer Integration</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                Every settlement, transaction invoice clearing, and debt commitment executed inside Fehuvia is instantly finalized on Morph Testnet and discoverable on-chain.
              </p>
            </div>

            {/* Visual rollup stats card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg text-center space-y-1">
                <span className="text-[10px] text-white/40 uppercase block font-bold">L2 Block Time</span>
                <span className="text-xl font-extrabold text-white block">1.8 Seconds</span>
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Highly Stable</span>
              </div>
              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg text-center space-y-1">
                <span className="text-[10px] text-white/40 uppercase block font-bold">Rollup Finality</span>
                <span className="text-xl font-extrabold text-white block">Optimistic ZK</span>
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Dual-Validation</span>
              </div>
              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg text-center space-y-1">
                <span className="text-[10px] text-white/40 uppercase block font-bold">Standard Gas Cost</span>
                <span className="text-xl font-extrabold text-white block">&lt; $0.001</span>
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Cost Efficient</span>
              </div>
            </div>

            <div className="plate-black-metallic p-5 border border-white/5 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">How to verify on the Explorer:</h4>
              <p className="text-xs text-white/50 leading-relaxed">
                When you initiate a settlement:
                <br />
                1. Look up your unique transaction hash on the Morph Block Explorer.
                <br />
                2. Verify the `State Root Sync` proof serial logged in the event records.
                <br />
                3. Inspect the invoice struct arguments emitted by the `FehuviaInvoiceLedger` contract.
              </p>
              <a
                href="https://explorer-testnet.morphl2.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#e4c37a] font-bold uppercase tracking-wider hover:underline"
              >
                <span>Open Morph Explorer</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        );

      case 'security-audit':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Cryptographic Safety</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Security Audit Report</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                The security and safety of corporate funds is our absolute highest priority. All core Fehuvia smart contracts have undergone extensive static analysis, fuzzing, and manual line-by-line review.
              </p>
            </div>

            {/* Audit score grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white/[0.01] border border-white/5 rounded-full w-40 h-40 mx-auto">
                <span className="text-4xl font-extrabold text-emerald-400 block tracking-tight">98</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Score (CertiK)</span>
              </div>
              <div className="md:col-span-8 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audited Core Modules:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="text-white/70">Reentrancy Protection</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="text-white/70">Overflow Safeguards</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="text-white/70">L2 Serialization Checks</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="text-white/70">Access Rights Control</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="plate-black-metallic p-5 border border-white/5 rounded-lg space-y-2">
              <span className="text-xs font-bold text-white uppercase block">Formal Verification Standard</span>
              <p className="text-xs text-white/50 leading-relaxed">
                Fehuvia's code employs strict automated formal verification patterns. The pricing algorithm utilizes integer-based division scales to prevent floating point imprecision, ensuring yield payouts and discounting deductions match exact math down to the smallest decimal units.
              </p>
            </div>
          </div>
        );

      case 'risk-parameters':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Protocol safety margins</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">System Risk Parameters</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                The protocol establishes system-wide safety thresholds, collateral LTV limitations, and discount parameters to insulate the decentralized treasury from defaults and liquidity pinches.
              </p>
            </div>

            {/* Dynamic visual slider bars */}
            <div className="space-y-4">
              {[
                { name: 'Max Invoice LTV Limit', val: '80%', desc: 'The maximum percentage of invoice value paid out in stablecoins during factoring.', width: 'w-4/5' },
                { name: 'Default Factoring Liquidating Fee', val: '5%', desc: 'Penalty applied to defaulted or non-paid invoice durations after maturity.', width: 'w-[5%]' },
                { name: 'Base Discount Rate', val: '2.4%', desc: 'Annual base rate applied to invoice credit risks, offset by historical ratings.', width: 'w-[10%]' }
              ].map((param, i) => (
                <div key={i} className="plate-black-metallic p-4 rounded border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white uppercase tracking-wider">{param.name}</span>
                    <span className="text-[#e4c37a]">{param.val}</span>
                  </div>
                  <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                    <div className={`bg-[#e4c37a] h-full rounded-full ${param.width}`} />
                  </div>
                  <p className="text-[10px] text-white/45 leading-relaxed">{param.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'terms-carriage':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Legal framework</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Terms of Carriage</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                The legal structure governing decentralized invoice carriage, B2B debt transfers, and digital account factoring protocols within the Fehuvia ecosystem.
              </p>
            </div>

            <div className="space-y-4 text-xs text-white/50 leading-relaxed font-light font-sans">
              <p>
                <strong>1. Acceptance of Terms:</strong> By deploying capital to Fehuvia pools or requesting invoice factoring settlements on the Morph Network, users agree to be bound by these decentralized debt carriage terms.
              </p>
              <p>
                <strong>2. Transfer of Rights:</strong> Settle transactions execute an absolute, irreversible transfer of the accounts receivable rights from the original vendor (the seller) to the Fehuvia Liquidity Pool smart contracts on L2.
              </p>
              <p>
                <strong>3. Arbitration:</strong> Any disputes relating to unpaid invoices, fraudulent ledger inputs, or non-delivery of items shall be resolved via decentralized multi-signature arbitration panels as defined in contract parameters.
              </p>
            </div>
          </div>
        );

      case 'privacy-charter':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Data security</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">Privacy Charter</h2>
              <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-3xl">
                We believe privacy is a fundamental right. Fehuvia utilizes advanced cryptographic hashing to protect corporate datasets, vendor alignments, and cashflow details from public leakage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg space-y-2">
                <span className="text-xs font-bold text-white uppercase block font-sans">Zero-Knowledge Shielding</span>
                <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                  Invoice specifics (such as supplier names and descriptions) are hashed off-chain. Only cryptographic verification hashes and payment roots are committed publicly to L2.
                </p>
              </div>
              <div className="plate-black-metallic p-5 border border-white/5 rounded-lg space-y-2">
                <span className="text-xs font-bold text-white uppercase block font-sans">GDPR & ISO Compliance</span>
                <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                  Off-chain components conform strictly to encryption standards, ensuring user accounting files and profile credentials remain isolated under zero-access environments.
                </p>
              </div>
            </div>
          </div>
        );

      case 'risk-warning':
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
              <div className="w-10 h-10 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <span className="text-red-500 text-xs font-bold uppercase tracking-widest block font-sans">Financial disclosure</span>
                <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight uppercase font-sans">High-Risk Financial Warning</h2>
              </div>
            </div>

            <p className="text-sm text-white/60 leading-relaxed max-w-3xl font-sans">
              Participation in decentralized stablecoin liquidity pooling, invoice factoring, and L2 debt carriage contracts carries significant financial and technical risk.
            </p>

            <div className="space-y-4">
              <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg space-y-1">
                <span className="text-xs font-bold text-white uppercase block font-sans">Smart Contract Risk</span>
                <span className="text-[11px] text-white/45 leading-relaxed block font-sans">
                  Despite audit compliance, complex blockchain integrations are susceptible to software bugs, compiler discrepancies, or network-level disruptions that could lead to complete loss of deployed assets.
                </span>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg space-y-1">
                <span className="text-xs font-bold text-white uppercase block font-sans">Gas & Liquidity Volatility</span>
                <span className="text-[11px] text-white/45 leading-relaxed block font-sans">
                  On-chain gas parameters and stablecoin liquidity levels fluctuate significantly based on aggregate volume. Deployed reserves could face lockups or liquidations during unprecedented high-volatility scenarios.
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-white/40 text-xs font-sans">Document not found.</div>;
    }
  };

  return (
    <div className="min-h-screen text-white font-sans bg-[#030304] flex flex-col relative overflow-x-hidden font-outfit">

      {/* Dynamic Gold Radial Glow behind content */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-[#e4c37a]/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Top Navbar */}
      <nav className="relative z-10 w-full border-b border-white/5 bg-[#030304]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="group flex items-center gap-2 px-3 py-1.5 rounded border border-white/10 hover:border-[#e4c37a]/50 text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>
        <span className="text-[10px] text-white/35 font-mono tracking-widest uppercase">Knowledge Hub & Resource Center</span>
      </nav>

      {/* Main Layout Grid */}
      <div className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 px-6 md:px-12 py-10">

        {/* Navigation Column (Sidebar on Desktop, Collapsible Drawer on Mobile) */}
        <div className="lg:col-span-3 col-span-1">
          
          {/* Mobile Collapsible Navigation Trigger (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center justify-between p-3.5 bg-[#08080a] border border-white/5 rounded-lg mb-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e4c37a] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#e4c37a]"></span>
              </span>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Knowledge Directory</span>
            </div>
            
            <button 
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="px-3 py-1.5 rounded bg-[#e4c37a]/10 border border-[#e4c37a]/20 text-[#e4c37a] hover:bg-[#e4c37a]/20 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Menu className="w-3.5 h-3.5 text-[#e4c37a]" />
              <span>{isMobileNavOpen ? 'Hide' : 'Browse'} Directory</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMobileNavOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Desktop/Mobile Navigation Content (Always visible on Desktop, collapsible on Mobile) */}
          <div className={`${isMobileNavOpen ? 'block' : 'hidden'} lg:block space-y-6 animate-fadeIn`}>
            
            {/* Search box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
              <input
                type="text"
                placeholder="Search Topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#08080a] border border-white/5 rounded px-9 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e4c37a]/30 transition-all font-light"
              />
            </div>

            {/* Navigation Categories */}
            <div className="space-y-4">
              {filteredCategories.map((cat, i) => {
                const isExpanded = expandedCategories[cat.name] ?? false;
                return (
                  <div key={i} className="space-y-1 bg-white/[0.01] lg:bg-transparent border border-white/5 lg:border-none p-2 lg:p-0 rounded-lg animate-fadeIn">
                    {/* Clickable Header for Collapsing */}
                    <button
                      onClick={() => toggleCategory(cat.name)}
                      className="w-full flex items-center justify-between text-[10px] font-bold text-white/35 hover:text-white uppercase tracking-[0.2em] py-1.5 pl-1 pr-2 text-left transition-colors"
                    >
                      <span>{cat.name}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90 text-white/20'}`} />
                    </button>

                    {/* Collapsible List of items */}
                    {isExpanded && (
                      <div className="space-y-1 pl-1 transition-all duration-200">
                        {cat.items.map((item) => {
                          const IconComponent = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileNavOpen(false); // Auto-close drawer on click on mobile!
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-left text-xs uppercase tracking-wider transition-all ${isActive
                                  ? 'bg-[#e4c37a]/10 border border-[#e4c37a]/20 text-[#e4c37a] font-semibold'
                                  : 'bg-transparent border border-transparent text-white/55 hover:bg-white/[0.02] hover:text-white font-light'
                                }`}
                            >
                              <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#e4c37a]' : 'text-white/40'}`} />
                              <span>{item.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredCategories.length === 0 && (
                <div className="text-center py-6 text-xs text-white/30 font-light font-sans">
                  No matching topics found.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Reading Sheet Pane (Span 9) */}
        <div className="lg:col-span-9 plate-black-metallic shape-asymmetric-4 p-6 md:p-10 border border-white/5 min-h-[500px]">
          {renderPageContent()}
        </div>

      </div>

      {/* Clean compact sub-footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030304]/60 py-6 text-center text-[10px] text-white/35 tracking-widest uppercase font-sans">
        <p>&copy; {new Date().getFullYear()} GEC5 - Fehuvia. Verified Security Standard.</p>
      </footer>

    </div>
  );
}
