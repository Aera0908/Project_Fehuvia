import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ShieldCheck, CircleDollarSign, Rocket, Landmark } from 'lucide-react';

const roadmapSteps = [
  {
    phase: '01',
    title: 'Signal',
    quarter: 'Q2 2026',
    icon: Sparkles,
    accent: 'text-[#fcf6ba]',
    glowBorder: 'hover:border-[#fcf6ba]/35 border-[#fcf6ba]/15',
    glowBg: 'rgba(252, 246, 186, 0.04)',
    body: 'The product sharpens its treasury intelligence layer, turning static invoice data into live settlement signals with visible runway forecasting.',
    points: ['Realtime invoice ingestion', 'First-pass liquidity forecasting', 'Executive dashboard motion system'],
  },
  {
    phase: '02',
    title: 'Lock',
    quarter: 'Q3 2026',
    icon: ShieldCheck,
    accent: 'text-emerald-400',
    glowBorder: 'hover:border-emerald-400/35 border-emerald-400/15',
    glowBg: 'rgba(52, 211, 153, 0.04)',
    body: 'Settlement policy becomes configurable, with safety checks, approval paths, and risk thresholds tuned for different treasury profiles.',
    points: ['Policy-based pay scheduling', 'Approval routing for high-risk invoices', 'Adaptive safety sandboxing'],
  },
  {
    phase: '03',
    title: 'Flow',
    quarter: 'Q4 2026',
    icon: CircleDollarSign,
    accent: 'text-[#e4c37a]',
    glowBorder: 'hover:border-[#e4c37a]/35 border-[#e4c37a]/15',
    glowBg: 'rgba(228, 195, 122, 0.04)',
    body: 'The early-settlement engine expands across more stablecoins and payment networks, making the system feel less like a tool and more like an operating layer.',
    points: ['Multi-asset settlement rails', 'Supplier-side discount capture', 'Cross-network treasury visibility'],
  },
  {
    phase: '04',
    title: 'Scale',
    quarter: '2027',
    icon: Rocket,
    accent: 'text-sky-400',
    glowBorder: 'hover:border-sky-400/35 border-sky-400/15',
    glowBg: 'rgba(56, 189, 248, 0.04)',
    body: 'The roadmap expands beyond treasury operations into a broader finance copilot, where automation starts to coordinate decisions instead of just suggesting them.',
    points: ['Regional treasury segmentation', 'Smart routing and orchestration', 'Automated finance workflows'],
  },
  {
    phase: '05',
    title: 'Anchor',
    quarter: 'Next Horizon',
    icon: Landmark,
    accent: 'text-white',
    glowBorder: 'hover:border-white/30 border-white/10',
    glowBg: 'rgba(255, 255, 255, 0.03)',
    body: 'Fehuvia becomes the system of record for liquidity operations, blending automation, policy, and execution into one continuous command surface.',
    points: ['Liquidity OS foundation', 'Policy-driven execution graph', 'Institutional command center'],
  },
];

export default function Roadmap() {
  const sectionRef = useRef(null);
  const wrapperRef = useRef(null);
  const stepRefs = useRef([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndices, setActiveIndices] = useState(new Array(roadmapSteps.length).fill(false));

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementHeight = rect.height;

      // The tip of the gold glowing line is anchored to exactly 70% of the viewport height (lower-middle screen)
      const triggerY = viewportHeight * 0.70;
      const scrollOffset = triggerY - rect.top;

      const progress = Math.min(Math.max(scrollOffset / (elementHeight || 1), 0), 1);
      setScrollProgress(progress);

      // The exact viewport Y coordinate of the tip of the gold line on the screen
      const tipY = rect.top + progress * elementHeight;

      // Determine active steps dynamically based on their actual middle crossing the trigger line
      const activeStates = roadmapSteps.map((_, index) => {
        const el = stepRefs.current[index];
        if (!el) return false;
        const elRect = el.getBoundingClientRect();
        // Center position of the step container (coinciding with the node dot)
        const nodeCenterY = elRect.top + elRect.height / 2;
        // Node is active ONLY when the gold line's tip reaches or passes its center Y coordinate
        return nodeCenterY <= tipY + 4; // 4px visual padding to ensure smooth HMR and visual overlap
      });

      setActiveIndices(activeStates);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Initial check with small delay to ensure DOM layout is calculated
    const timer = setTimeout(handleScroll, 50);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section
      id="roadmap"
      ref={sectionRef}
      className="relative z-10 px-8 md:px-16 py-28 min-h-screen bg-[#050507] overflow-hidden font-outfit"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(228,195,122,0.06),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.04),transparent_30%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-24 md:mb-32">
          <span className="text-[#e4c37a] text-xs font-bold tracking-[0.3em] uppercase block mb-3 drop-shadow-[0_0_10px_rgba(228,195,122,0.3)]">
            Roadmap
          </span>
          <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-light leading-tight text-white">
            Fehuvia's <span className="italic text-gold-metallic">Evolutionary</span> Path
          </h2>
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-[#e4c37a] to-transparent my-6" />
          <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-2xl font-light">
            Our phases map out Fehuvia's transition from smart treasury signals to a cryptographic, institutional liquidity operating system.
          </p>
        </div>

        {/* Timeline Content Wrapper */}
        <div ref={wrapperRef} className="relative mt-16 max-w-6xl mx-auto">
          
          {/* Vertical Base Hairline Divider */}
          <div className="absolute top-0 bottom-0 left-6 md:left-1/2 w-0.5 bg-white/10 -translate-x-1/2" />
          
          {/* Active Glowing Line Divider */}
          <div
            className="absolute top-0 left-6 md:left-1/2 w-0.5 bg-gradient-to-b from-[#bf953f] via-[#fcf6ba] to-[#aa771c] -translate-x-1/2 transition-all duration-100 ease-out origin-top"
            style={{ 
              height: `${scrollProgress * 100}%`,
              boxShadow: '0 0 15px #e4c37a, 0 0 5px #e4c37a'
            }}
          />

          {/* Alternating/Stacked Steps Cards */}
          <div className="space-y-16 md:space-y-24 relative z-10">
            {roadmapSteps.map((step, index) => {
              const isLeft = index % 2 === 0;
              const isActive = activeIndices[index];
              const Icon = step.icon;

              return (
                <div 
                  key={step.phase} 
                  ref={el => stepRefs.current[index] = el}
                  className="relative flex flex-col md:flex-row items-start md:items-center w-full"
                >
                  
                  {/* Glowing Node Dot Anchor on the Line */}
                  <div
                    className={`absolute left-6 md:left-1/2 w-5 h-5 rounded-full border-2 -translate-x-1/2 z-20 flex items-center justify-center transition-all duration-700 ease-out ${
                      isActive
                        ? 'bg-black border-[#e4c37a] shadow-[0_0_12px_rgba(228,195,122,0.9)] scale-110'
                        : 'bg-[#0a0a0c] border-white/20'
                    }`}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        isActive ? 'bg-[#e4c37a] animate-pulse' : 'bg-white/30'
                      }`} 
                    />
                  </div>

                  {/* Step Card Content */}
                  <div
                    className={`w-full md:w-[calc(50%-2.5rem)] pl-16 md:pl-0 transition-all duration-700 ease-out ${
                      isLeft
                        ? 'md:pr-14 md:mr-auto text-left md:text-right md:pl-0'
                        : 'md:pl-14 md:ml-auto text-left'
                    }`}
                  >
                    <article
                      className={`plate-black-metallic shape-asymmetric-3 p-6 md:p-8 border transition-all duration-1000 ${
                        isActive
                          ? `opacity-100 translate-y-0 ${step.glowBorder} shadow-[0_15px_45px_rgba(0,0,0,0.6)]`
                          : 'opacity-30 translate-y-4 border-white/5'
                      }`}
                      style={{
                        background: isActive 
                          ? `linear-gradient(135deg, #0d0d0f 0%, #151518 45%, ${step.glowBg} 75%, #08080a 100%)`
                          : undefined
                      }}
                    >
                      <div className="relative z-10 h-full flex flex-col justify-between gap-6">
                        
                        {/* Header Part */}
                        <div className={`flex items-start gap-4 ${isLeft ? 'md:flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-700 ${
                            isActive 
                              ? 'border-[#e4c37a]/30 bg-[#e4c37a]/5 shadow-[0_0_15px_rgba(228,195,122,0.1)]' 
                              : 'border-white/10 bg-white/3'
                          }`}>
                            <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? `${step.accent} scale-110` : 'text-white/40'}`} />
                          </div>

                          <div className="flex-1">
                            <div className={`text-[10px] font-bold uppercase tracking-[0.28em] transition-colors duration-500 ${
                              isActive ? step.accent : 'text-white/40'
                            }`}>
                              Phase {step.phase}
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mt-1 tracking-tight font-outfit">
                              {step.title}
                            </h3>
                          </div>
                        </div>

                        {/* Description Body */}
                        <p className="text-white/60 leading-relaxed text-sm md:text-[15px] font-light">
                          {step.body}
                        </p>

                        {/* Milestones Bullet List */}
                        <div className="space-y-3">
                          <div className="text-[10px] uppercase tracking-[0.24em] text-white/35 font-semibold">Milestones</div>
                          <div className={`grid gap-2 text-sm text-white/70 ${isLeft ? 'md:justify-items-end' : ''}`}>
                            {step.points.map((point) => (
                              <div 
                                key={point} 
                                className={`flex items-center gap-3 w-full ${isLeft ? 'md:flex-row-reverse md:text-right' : 'flex-row'}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500 ${
                                  isActive ? 'bg-[#e4c37a] shadow-[0_0_8px_#e4c37a]' : 'bg-white/30'
                                }`} />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer Details */}
                        <div className={`flex items-center justify-between pt-4 border-t border-white/5 text-[10px] uppercase tracking-[0.24em] text-white/35 ${isLeft ? 'md:flex-row-reverse' : 'flex-row'}`}>
                          <span className="font-semibold">{step.quarter}</span>
                          <span className={`font-semibold transition-colors ${isActive ? step.accent : ''}`}>
                            {isActive ? 'Active Timeline' : 'Upcoming'}
                          </span>
                        </div>

                      </div>
                    </article>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}