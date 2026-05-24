import React from 'react';
import CountUp from './CountUp';

export default function About({ visionRef, isVisionVisible }) {
  const globalMetrics = [
    {
      stat: '74%',
      label: 'Liquidity Crises',
      desc: 'Of global SMEs face operational bottlenecks caused strictly by legacy banking settlement delays.',
      plateClass: 'plate-gold-metallic',
      shapeClass: 'shape-asymmetric-1',
    },
    {
      stat: '$3.1T',
      label: 'Trapped Capital',
      desc: 'In global invoice volume is locked in reactive corporate payment loops at any single moment.',
      plateClass: 'plate-black-metallic',
      shapeClass: 'shape-asymmetric-2',
    },
    {
      stat: 'T+0',
      label: 'Instant Settlements',
      desc: 'Bypasses multi-day international clearing lanes with low-cost stablecoin rails on Morph.',
      plateClass: 'plate-black-metallic',
      shapeClass: 'shape-asymmetric-3',
    },
    {
      stat: '98.7%',
      label: 'AI Forecast Precision',
      desc: 'Achieved by our neural cashflow modeling engine across multiple invoice cycles.',
      plateClass: 'plate-gold-metallic',
      shapeClass: 'shape-asymmetric-4',
    },
  ];

  return (
    <section
      id="vision"
      ref={visionRef}
      className="relative z-10 px-8 md:px-16 py-28 min-h-[100svh] snap-start flex items-center justify-center overflow-hidden font-outfit"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(228, 195, 122, 0.08), rgba(0, 0, 0, 0.96)), radial-gradient(circle at top right, rgba(228, 195, 122, 0.08), transparent 35%), radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.03), transparent 25%)',
      }}
    >
      <div className="max-w-[1400px] mx-auto w-full relative z-10">

        {/* Main Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 md:mb-28">
          <div className={`relative inline-block mb-4 transition-all duration-[1000ms] ${isVisionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-[#e4c37a] text-xs font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(228,195,122,0.3)]">
              The Vision
            </span>
          </div>

          <h2 className={`font-cormorant text-4xl sm:text-5xl lg:text-6xl font-light leading-tight tracking-tight text-white transition-all duration-[1200ms] delay-100 ${isVisionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Quiet authority over <span className="italic text-gold-metallic">liquidity</span>.
          </h2>

          <div className={`h-[1px] w-20 bg-gradient-to-r from-transparent via-[#e4c37a] to-transparent my-6 transition-all duration-[1200ms] delay-200 ${isVisionVisible ? 'w-24 opacity-100' : 'w-0 opacity-0'}`} />

          <p className={`text-white/50 leading-relaxed text-base md:text-lg font-light transition-all duration-[1200ms] delay-300 ${isVisionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Fehuvia strips away the standard administrative noise, offering an elite, zero-latency environment that integrates predictive cashflow intelligence with cryptographic settlement rails.
          </p>
        </div>

        {/* Dynamic Dual Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* Left Column: Prestigious Statement */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <span className="text-[#e4c37a] text-[10px] font-bold tracking-[0.25em] uppercase font-outfit">
              INTELLIGENT LIQUIDITY
            </span>
            <h3 className="font-cormorant text-3xl md:text-4xl text-silver-metallic leading-snug font-light">
              Bypassing the friction of traditional treasury systems.
            </h3>
            <p className="text-white/60 text-sm md:text-base leading-relaxed font-light">
              Corporate banks operate on slow, reactive rails. They force businesses to manage cash flow in arrears, waiting up to three business days for global clearances.
            </p>
            <p className="text-white/60 text-sm md:text-base leading-relaxed font-light">
              Fehuvia changes the architecture. We combine a predictive cashflow engine that actively advises your CFO with T+0 instant settlements, returning full operational agility back to the enterprise.
            </p>
          </div>

          {/* Right Column: Quantitative International Metrics Grid */}
          <div className="lg:col-span-7 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
            {globalMetrics.map((item, index) => {
              const delay = `${150 + index * 100}ms`;
              const isGold = item.plateClass === 'plate-gold-metallic';
              return (
                <div
                  key={item.label}
                  className={`${item.plateClass} ${item.shapeClass} p-6 md:p-8 flex flex-col justify-between min-h-[220px] transition-all duration-1000 ${isVisionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`}
                  style={{ transitionDelay: isVisionVisible ? delay : '0ms' }}
                >
                  <div>
                    {/* Stat Number - High-contrast charcoal for gold plate, metallic-gold for dark plate */}
                    <div className={`text-4xl md:text-5xl font-black tracking-tight mb-2 ${isGold ? 'text-black' : 'text-gold-metallic'
                      }`}>
                        {item.label === 'Liquidity Crises' && (
                          <CountUp value={74} suffix="%" active={isVisionVisible} />
                        )}
                        {item.label === 'Trapped Capital' && (
                          <CountUp value={3.1} prefix="$" suffix="T" decimals={1} active={isVisionVisible} />
                        )}
                        {item.label === 'Instant Settlements' && (
                          <CountUp value={0} prefix="T+" active={isVisionVisible} />
                        )}
                        {item.label === 'AI Forecast Precision' && (
                          <CountUp value={98.7} suffix="%" decimals={1} active={isVisionVisible} />
                        )}
                    </div>
                    {/* Stat Label */}
                    <div className={`text-xs font-bold uppercase tracking-wider mb-4 ${isGold ? 'text-black/60' : 'text-[#fcf6ba]'
                      }`}>
                      {item.label}
                    </div>
                  </div>
                  {/* Stat Description */}
                  <p className={`text-xs md:text-sm leading-relaxed font-light ${isGold ? 'text-black/70 font-medium' : 'text-white/65'
                    }`}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
