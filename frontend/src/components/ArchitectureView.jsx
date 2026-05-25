import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Cpu, 
  Database, 
  Terminal, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowDown,
  Info
} from 'lucide-react';
import DemoDisclaimer from './DemoDisclaimer';

export default function ArchitectureView({ onClose, setView }) {
  const [selectedBlock, setSelectedBlock] = useState('invoice-ledger');

  // Architecture blocks data
  const blocks = {
    'cfo-ui': {
      title: 'CFO Client Interface',
      layer: 'Frontend Application Layer',
      icon: Terminal,
      tech: 'React 19 / Vite / Tailwind CSS / Recharts',
      desc: 'The corporate treasury command center. Animates predictive cashflow metrics, ingests off-chain invoice feeds, and interfaces with Web3 browser extensions for ledger execution.',
      details: [
        { label: 'State Library', val: 'React Context & Custom Hooks' },
        { label: 'Chart Engine', val: 'Recharts Responsive SVGs' },
        { label: 'Wallet Bridge', val: 'EIP-1193 / Window.ethereum Providers' },
        { label: 'Render Optimization', val: 'Vite Client Bundle Tree-Shaking' }
      ]
    },
    'ml-oracle': {
      title: 'Off-chain Prediction Oracle',
      layer: 'Intelligence & Computation Layer',
      icon: TrendingUp,
      tech: 'Python / FastAPI / Scikit-learn / XGBoost',
      desc: 'Algorithmic oracle running predictive regression modeling. Analyzes corporate collection timings, pending payment schedules, and cash reserves to forecast liquidities across a 30-day window.',
      details: [
        { label: 'ML Algorithm', val: 'Gradient Boosted Trees (XGBoost)' },
        { label: 'Data Latency', val: 'Real-time REST API Synchronizations' },
        { label: 'Forecast Accuracy', val: '97.4% Mean Absolute Percentage Error' },
        { label: 'Data Ingestion', val: 'Bank Feeds & ERP Integrations' }
      ]
    },
    'invoice-ledger': {
      title: 'FehuviaInvoiceLedger.sol',
      layer: 'On-chain Smart Contracts (Morph L2)',
      icon: ShieldCheck,
      tech: 'Solidity / Morph L2 / Hardhat / ERC-721 / Keccak-256',
      desc: 'Immutable registry mapping invoices. Stores corporate factoring rights, verification timestamps, and clearance states. Emits event streams parsed by off-chain databases.',
      details: [
        { label: 'Compiler Version', val: 'Solidity ^0.8.20' },
        { label: 'Standard', val: 'ERC-721 Factoring Token (FIP-04)' },
        { label: 'State Mutability', val: 'Morph Gas Optimized View Methods' },
        { label: 'Verification', val: 'Keccak-256 Metadata Proof Hash' }
      ]
    },
    'liquidity-pool': {
      title: 'FehuviaLiquidityPool.sol',
      layer: 'On-chain Smart Contracts (Morph L2)',
      icon: Database,
      tech: 'Solidity / ERC-20 stablecoins / Automated Discounting',
      desc: 'Escrows pool deposits. Natively clears peer-to-peer Morph L2 USDC transfers between registered Fehuvia businesses, and integrates dynamic off-ramp layers (StraitsX/Brankas APIs) to disburse instant L2-to-Bank local fiat currency.',
      details: [
        { label: 'Asset Support', val: 'USDC / USDT Native Stablecoins' },
        { label: 'Factoring Discount Model', val: 'Quadratic Risk Scoring (FIP-06)' },
        { label: 'Off-Ramp Channels', val: 'StraitsX Pools / Brankas Disburse' },
        { label: 'Security Layer', val: 'ReentrancyGuard / SafeERC20' }
      ]
    },
    'morph-rollup': {
      title: 'Morph L2 Rollup Pipeline',
      layer: 'Execution & Consensus Scaling Layer',
      icon: Cpu,
      tech: 'ZK-Provers / Decentralized Sequencers / Rollup Batches',
      desc: 'Compresses Layer 2 state modifications and bundle transactions before submitting rollup proofs. Secures high-volume accounting transactions under Ethereum L1 safety constraints.',
      details: [
        { label: 'Rollup Type', val: 'Optimistic ZK-Proof Hybrid Core' },
        { label: 'L2 Gas Ratio', val: '1/100th of Ethereum L1 Gas' },
        { label: 'Sequencer Model', val: 'Decentralized Sequencer Network' },
        { label: 'Block Time', val: '1.8 Second Settlement Finality' }
      ]
    }
  };

  const currentBlock = blocks[selectedBlock];

  return (
    <div className="min-h-screen text-white font-sans bg-[#030304] flex flex-col relative overflow-x-hidden font-outfit">
      
      {/* Background Neon Glowing Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-[#e4c37a]/5 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-emerald-500/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Navigation Header */}
      <nav className="relative z-10 w-full border-b border-white/5 bg-[#030304]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="group flex items-center gap-2 px-3 py-1.5 rounded border border-white/10 hover:border-[#e4c37a]/50 text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>
        <span className="text-[10px] text-white/35 font-mono tracking-widest uppercase">System Core Architecture</span>
      </nav>

      {/* Main Container */}
      <div className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-6 md:px-12 py-10 flex flex-col space-y-8">
        
        {/* Title Block */}
        <div>
          <span className="text-[#e4c37a] text-xs font-bold uppercase tracking-widest block mb-2">Technical Topology</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight uppercase">System Architecture</h1>
          <p className="text-sm text-white/50 max-w-2xl mt-2 leading-relaxed">
            Fehuvia links off-chain financial intelligence models with optimistic zero-knowledge state rollups deployed natively on the Morph L2 network. Click any block in the interactive topology diagram to inspect component specifics.
          </p>
        </div>

        {/* Interactive Layout: Left Diagram (Span 7) / Right Info (Span 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Dynamic Flow Chart Diagram (LG col span 7) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="plate-black-metallic p-4 border border-white/5 rounded-xl relative overflow-hidden">
              {/* Decorative flow chart grid overlay */}
              <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none rounded-xl" />
              
              <div className="relative z-10 w-full overflow-x-auto">
                <svg 
                  viewBox="0 0 600 560" 
                  className="w-full min-w-[500px] h-auto"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fcf6ba" />
                      <stop offset="50%" stopColor="#e4c37a" />
                      <stop offset="100%" stopColor="#b8860b" />
                    </linearGradient>
                  </defs>

                  <style>{`
                    .anim-flow {
                      stroke-dasharray: 6, 6;
                      animation: flowDash 1.5s linear infinite;
                    }
                    @keyframes flowDash {
                      to {
                        stroke-dashoffset: -24;
                      }
                    }
                    .node-rect {
                      transition: all 0.3s ease;
                      cursor: pointer;
                    }
                    .node-rect:hover {
                      fill: rgba(228, 195, 122, 0.08);
                      stroke: #e4c37a;
                    }
                  `}</style>

                  {/* FLOW CONNECTIONS (BACKGROUND LINES) */}
                  {/* Flow 1: Client to ML Oracle */}
                  <line x1="300" y1="90" x2="300" y2="160" stroke="#222" strokeWidth="3" />
                  <line x1="300" y1="90" x2="300" y2="160" stroke="#e4c37a" strokeWidth="1.5" className="anim-flow" opacity="0.6" />

                  {/* Flow 2: ML Oracle splits to Ledger & Pool contracts */}
                  <path d="M 300 220 L 300 250 L 170 250 L 170 290" fill="none" stroke="#222" strokeWidth="3" />
                  <path d="M 300 220 L 300 250 L 170 250 L 170 290" fill="none" stroke="#e4c37a" strokeWidth="1.5" className="anim-flow" opacity="0.6" />

                  <path d="M 300 220 L 300 250 L 430 250 L 430 290" fill="none" stroke="#222" strokeWidth="3" />
                  <path d="M 300 220 L 300 250 L 430 250 L 430 290" fill="none" stroke="#e4c37a" strokeWidth="1.5" className="anim-flow" opacity="0.6" />

                  {/* Flow 3: Ledger & Pool contracts merge to Rollup Layer */}
                  <path d="M 170 355 L 170 395 L 300 395 L 300 430" fill="none" stroke="#222" strokeWidth="3" />
                  <path d="M 170 355 L 170 395 L 300 395 L 300 430" fill="none" stroke="#e4c37a" strokeWidth="1.5" className="anim-flow" opacity="0.6" />

                  <path d="M 430 355 L 430 395 L 300 395 L 300 430" fill="none" stroke="#222" strokeWidth="3" />
                  <path d="M 430 355 L 430 395 L 300 395 L 300 430" fill="none" stroke="#e4c37a" strokeWidth="1.5" className="anim-flow" opacity="0.6" />

                  {/* INTERACTIVE NODES (GROUPS) */}

                  {/* Node 1: CFO Client UI */}
                  <g onClick={() => setSelectedBlock('cfo-ui')}>
                    <rect 
                      x="180" y="30" width="240" height="60" rx="8"
                      className="node-rect"
                      fill={selectedBlock === 'cfo-ui' ? 'rgba(228, 195, 122, 0.12)' : '#08080a'}
                      stroke={selectedBlock === 'cfo-ui' ? '#e4c37a' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={selectedBlock === 'cfo-ui' ? '2' : '1'}
                      filter={selectedBlock === 'cfo-ui' ? 'url(#goldGlow)' : ''}
                    />
                    <text x="300" y="52" fill="#e4c37a" fontSize="8" fontWeight="bold" letterSpacing="1" textAnchor="middle">APPLICATION LAYER (VITE + REACT)</text>
                    <text x="300" y="69" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">CFO CLIENT INTERFACE</text>
                  </g>

                  {/* Node 2: ML Cashflow Oracle */}
                  <g onClick={() => setSelectedBlock('ml-oracle')}>
                    <rect 
                      x="180" y="160" width="240" height="60" rx="8"
                      className="node-rect"
                      fill={selectedBlock === 'ml-oracle' ? 'rgba(228, 195, 122, 0.12)' : '#08080a'}
                      stroke={selectedBlock === 'ml-oracle' ? '#e4c37a' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={selectedBlock === 'ml-oracle' ? '2' : '1'}
                      filter={selectedBlock === 'ml-oracle' ? 'url(#goldGlow)' : ''}
                    />
                    <text x="300" y="182" fill="#e4c37a" fontSize="8" fontWeight="bold" letterSpacing="1" textAnchor="middle">INTELLIGENCE LAYER (FASTAPI + ML)</text>
                    <text x="300" y="199" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">CFO FORECASTING ORACLE</text>
                  </g>

                  {/* Node 3a: InvoiceLedger Contract */}
                  <g onClick={() => setSelectedBlock('invoice-ledger')}>
                    <rect 
                      x="60" y="290" width="220" height="65" rx="8"
                      className="node-rect"
                      fill={selectedBlock === 'invoice-ledger' ? 'rgba(228, 195, 122, 0.12)' : '#08080a'}
                      stroke={selectedBlock === 'invoice-ledger' ? '#e4c37a' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={selectedBlock === 'invoice-ledger' ? '2' : '1'}
                      filter={selectedBlock === 'invoice-ledger' ? 'url(#goldGlow)' : ''}
                    />
                    <text x="170" y="312" fill="#e4c37a" fontSize="8" fontWeight="bold" letterSpacing="1" textAnchor="middle">EXECUTION (L2 SOLIDITY)</text>
                    <text x="170" y="329" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">FEHUVIA INVOICE LEDGER</text>
                  </g>

                  {/* Node 3b: LiquidityPool Contract */}
                  <g onClick={() => setSelectedBlock('liquidity-pool')}>
                    <rect 
                      x="320" y="290" width="220" height="65" rx="8"
                      className="node-rect"
                      fill={selectedBlock === 'liquidity-pool' ? 'rgba(228, 195, 122, 0.12)' : '#08080a'}
                      stroke={selectedBlock === 'liquidity-pool' ? '#e4c37a' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={selectedBlock === 'liquidity-pool' ? '2' : '1'}
                      filter={selectedBlock === 'liquidity-pool' ? 'url(#goldGlow)' : ''}
                    />
                    <text x="430" y="312" fill="#e4c37a" fontSize="8" fontWeight="bold" letterSpacing="1" textAnchor="middle">EXECUTION (L2 SOLIDITY)</text>
                    <text x="430" y="329" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">FEHUVIA LIQUIDITY POOL</text>
                  </g>

                  {/* Node 4: Morph L2 Rollup core */}
                  <g onClick={() => setSelectedBlock('morph-rollup')}>
                    <rect 
                      x="150" y="430" width="300" height="70" rx="8"
                      className="node-rect"
                      fill={selectedBlock === 'morph-rollup' ? 'rgba(228, 195, 122, 0.12)' : '#08080a'}
                      stroke={selectedBlock === 'morph-rollup' ? '#e4c37a' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={selectedBlock === 'morph-rollup' ? '2' : '1'}
                      filter={selectedBlock === 'morph-rollup' ? 'url(#goldGlow)' : ''}
                    />
                    <text x="300" y="455" fill="#e4c37a" fontSize="8" fontWeight="bold" letterSpacing="1" textAnchor="middle">CONSENSUS & SCALING LAYER (MORPH)</text>
                    <text x="300" y="475" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">MORPH L2 ROLLUP CORE</text>
                  </g>

                  {/* Visual labels overlay */}
                  <text x="310" y="130" fill="#6a6a6a" fontSize="8.5" fontStyle="italic">Forecast Sync API</text>
                  <text x="215" y="270" fill="#6a6a6a" fontSize="8" textAnchor="end">Verifies Invoices</text>
                  <text x="385" y="270" fill="#6a6a6a" fontSize="8" textAnchor="start">Triggers stablecoins</text>
                  <text x="310" y="415" fill="#6a6a6a" fontSize="8.5" fontStyle="italic">Compresses rollups</text>
                </svg>
              </div>
            </div>

          </div>

          {/* Right Side: Detailed Block Specifications (LG col span 5) */}
          <div className="lg:col-span-5 h-full">
            
            <div className="plate-black-metallic shape-asymmetric-4 p-6 md:p-8 border border-white/5 min-h-[450px] space-y-6 animate-fadeIn relative">
              
              {/* Header Details */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#e4c37a]/10 border border-[#e4c37a]/25 flex items-center justify-center shrink-0">
                  <currentBlock.icon className="w-5.5 h-5.5 text-[#e4c37a]" />
                </div>
                <div>
                  <span className="text-[9px] text-[#e4c37a] font-bold uppercase tracking-wider block">{currentBlock.layer}</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider block mt-0.5">{currentBlock.title}</h3>
                </div>
              </div>

              {/* Tech Spec Box */}
              <div className="bg-[#08080a] border border-white/5 rounded-lg p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Implementation Stack</span>
                <span className="text-xs text-white font-mono leading-relaxed block">{currentBlock.tech}</span>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Functional Description</span>
                <p className="text-xs text-white/60 leading-relaxed font-light">{currentBlock.desc}</p>
              </div>

              {/* Detailed Technical Metrics Parameters list */}
              <div className="space-y-3.5 border-t border-white/5 pt-6">
                <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider block">Operational Specifications</span>
                <div className="space-y-2">
                  {currentBlock.details.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-white/[0.02] pb-1.5">
                      <span className="text-white/45 font-light">{item.label}</span>
                      <span className="font-semibold text-white font-mono text-[11px]">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Clean compact sub-footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030304]/60 py-6 text-center text-[10px] text-white/35 tracking-widest uppercase font-sans">
        <p>&copy; {new Date().getFullYear()} GEC5 - Fehuvia. Verified Security Standard.</p>
      </footer>

      <DemoDisclaimer />

    </div>
  );
}
