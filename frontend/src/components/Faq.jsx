import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqItems = [
  {
    question: 'How does Fehuvia achieve T+0 instant settlements?',
    answer: 'Fehuvia bypasses legacy multi-day clearing networks by routing settlements over high-speed, secure stablecoin rails on the Morph Layer-2 network. Transactions clear and settle in real-time, converting international payment wait times from days to seconds at a fraction of traditional wire overheads.',
  },
  {
    question: 'Is the predictive cashflow forecasting secure?',
    answer: 'Absolutely. Our Cashflow Intelligence engine operates inside a fully sandboxed environment. We use zero-knowledge computations and localized, privacy-focused cashflow telemetry models to calculate runway and forecast cash flows, ensuring your corporate financial data is never exposed or shared.',
  },
  {
    question: 'How is institutional treasury capital safeguarded?',
    answer: 'All treasury assets are safeguarded using institution-grade multi-signature smart vaults (powered by Gnosis Safe custody standards). Access is strictly governed by pre-configured, multi-signature approval gates and policy thresholds defined by your corporate finance board.',
  },
  {
    question: 'What payment networks and assets are currently integrated?',
    answer: 'We natively support leading institutional stablecoin rails including USDC, USDT, and EURC. Additionally, we are actively launching integrations with standard corporate fiat networks like SEPA and FedNow to coordinate automated, hybrid fiat-crypto treasury matching.',
  },
  {
    question: 'Why build the treasury infrastructure on the Morph Layer-2 network?',
    answer: 'Morph provides the ultimate combination of Ethereum-grade security and ultra-low operational costs. Utilizing an optimistic-zk hybrid rollup architecture, Morph guarantees cryptographic finality for high-value corporate treasury transactions with zero-latency execution.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative z-10 px-8 md:px-16 py-28 min-h-screen snap-start flex items-center justify-center bg-[#050507] overflow-hidden font-outfit"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(228,195,122,0.06),transparent_35%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.03),transparent_30%)] pointer-events-none" />

      <div className="max-w-[1000px] mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20 md:mb-24">
          <span className="text-[#e4c37a] text-xs font-bold tracking-[0.3em] uppercase block mb-3 drop-shadow-[0_0_10px_rgba(228,195,122,0.3)]">
            FAQ
          </span>
          <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-light leading-tight text-white">
            Clear answers on <span className="italic text-gold-metallic">liquidity specs</span>.
          </h2>
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-[#e4c37a] to-transparent my-6" />
          <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-2xl font-light">
            Explore technical answers about Fehuvia’s secure cryptographic custody, zero-knowledge forecasting privacy, and instant L2 settlement settlement paths.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={index}
                onClick={() => toggleFAQ(index)}
                className={`plate-black-metallic shape-asymmetric-3 border cursor-pointer select-none transition-all duration-500 overflow-hidden ${
                  isOpen 
                    ? 'border-[#e4c37a]/30 shadow-[0_12px_30px_rgba(0,0,0,0.55)] bg-gradient-to-br from-[#121215] to-[#060608]' 
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                {/* Accordion Header Row */}
                <div className="p-6 md:p-7 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors duration-500 ${
                      isOpen ? 'border-[#e4c37a]/30 bg-[#e4c37a]/5 text-[#e4c37a]' : 'border-white/10 text-white/40'
                    }`}>
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h3 className={`text-base md:text-lg font-semibold tracking-tight transition-colors duration-500 ${
                      isOpen ? 'text-[#e4c37a]' : 'text-white'
                    }`}>
                      {item.question}
                    </h3>
                  </div>
                  
                  {/* Rotating Chevron */}
                  <ChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-500 ${
                    isOpen ? 'rotate-180 text-[#e4c37a]' : ''
                  }`} />
                </div>

                {/* Accordion Content Row (Smooth CSS Auto-Height grid animation) */}
                <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}>
                  <div className="overflow-hidden">
                    <div className="px-6 md:px-7 pb-6 md:pb-7 pt-0 border-t border-white/5">
                      <p className="text-white/55 text-sm md:text-[15px] leading-relaxed font-light mt-4">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>

              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
}
