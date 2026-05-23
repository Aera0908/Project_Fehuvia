import React from 'react';

export default function Features({ setModalType }) {
  const capabilities = [
    {
      title: 'Zero-Friction B2B Settlements',
      metric: 'T+0 Finality',
      spec: 'Settle multi-party vendor obligations instantly via decentralized ERC-20 rails, bypassing traditional SWIFT and regional clearinghouse limits.',
      stats: [
        { label: 'Morph Block Time', value: '1.5s' },
        { label: 'Avg. Gas Cost', value: '< $0.01' },
      ],
      plateClass: 'plate-gold-metallic',
      shapeClass: 'shape-asymmetric-1',
    },
    {
      title: 'Deterministic Treasury AI',
      metric: '98.7% Forecast Accuracy',
      spec: 'Our GPT-4o powered cashflow engine contextually parses invoice metadata, counterparty risk histories, and multi-currency ledgers with zero hallucination bounds.',
      stats: [
        { label: 'Analysis Speed', value: '< 800ms' },
        { label: 'Context Length', value: '128k Tokens' },
      ],
      plateClass: 'plate-black-metallic',
      shapeClass: 'shape-asymmetric-2',
    },
    {
      title: 'Stablecoin Agnostic Rails',
      metric: 'USDC • USDT • EURC',
      spec: 'Integrate directly with primary liquidity networks. Maintain treasury balances and discharge B2B accounts in fully collateralized dollar and euro stablecoins.',
      stats: [
        { label: 'Direct Wallets', value: 'Ethers / Wagmi' },
        { label: 'Swap Slippage', value: '0.00%' },
      ],
      plateClass: 'plate-black-metallic',
      shapeClass: 'shape-asymmetric-3',
    },
    {
      title: 'On-Chain Ledger Security',
      metric: '100% Cryptographic Uptime',
      spec: 'All payment decisions and settlement states are immutably verified by Ethereum-backed L2 Morph Rollups, establishing bulletproof data integrity.',
      stats: [
        { label: 'L2 Rollup Type', value: 'Optimistic' },
        { label: 'Contract Audits', value: 'Pass' },
      ],
      plateClass: 'plate-gold-metallic',
      shapeClass: 'shape-asymmetric-4',
    },
  ];

  return (
    <section
      id="features"
      className="relative z-10 px-8 md:px-16 py-28 min-h-[100svh] snap-start flex items-center overflow-hidden font-outfit"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(228, 195, 122, 0.08), rgba(0, 0, 0, 0.96)), radial-gradient(circle at top left, rgba(228, 195, 122, 0.12), transparent 30%), radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.03), transparent 25%)',
      }}
    >
      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-16">
          <div>
            <span className="text-[#e4c37a] text-xs font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(228,195,122,0.3)] block mb-3">
              Protocol Capabilities
            </span>
            <h2 className="font-cormorant text-4xl sm:text-5xl font-light text-white leading-tight">
              Engineered for <span className="italic text-gold-metallic">institutional performance</span>.
            </h2>
          </div>
          <button
            onClick={() => setModalType('signup')}
            className="border border-[#e4c37a]/30 text-[#fcf6ba] hover:bg-[#e4c37a]/10 font-bold uppercase tracking-wider text-xs rounded-full px-8 py-4 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shrink-0 font-outfit"
          >
            Inquire Platform Access
          </button>
        </div>

        {/* Capabilities Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {capabilities.map((item, index) => {
            const isGold = item.plateClass === 'plate-gold-metallic';
            return (
              <article
                key={item.title}
                className={`group ${item.plateClass} ${item.shapeClass} p-8 md:p-10 relative overflow-hidden flex flex-col justify-between min-h-[320px]`}
              >
                {/* Visual Glass Hover Glare Effect */}
                <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-white/[0.02] opacity-0 group-hover:opacity-100 rotate-45 translate-x-[-150%] group-hover:translate-x-[50%] transition-all duration-[1.5s] ease-in-out pointer-events-none" />

                <div className="flex flex-col space-y-4">
                  {/* Top Stats Label Row */}
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <h3 className={`text-xl font-black tracking-wide ${isGold ? 'text-black' : 'text-white'}`}>
                      {item.title}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-widest font-mono border px-3 py-1 rounded-full ${
                      isGold ? 'border-black/20 text-black/70 bg-black/5' : 'border-white/10 text-white/50 bg-white/5'
                    }`}>
                      {item.metric}
                    </span>
                  </div>

                  {/* Specification paragraph */}
                  <p className={`text-sm leading-relaxed font-light ${isGold ? 'text-black/75 font-medium' : 'text-white/60'}`}>
                    {item.spec}
                  </p>
                </div>

                {/* Quantitative Technical Specs Grid */}
                <div className={`grid grid-cols-2 gap-4 pt-8 border-t mt-8 ${
                  isGold ? 'border-black/10' : 'border-white/5'
                }`}>
                  {item.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col space-y-1">
                      <span className={`text-[9px] uppercase tracking-widest font-bold ${
                        isGold ? 'text-black/55' : 'text-white/35'
                      }`}>
                        {stat.label}
                      </span>
                      <span className={`text-lg font-black tracking-wide ${isGold ? 'text-black' : 'text-white'}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
