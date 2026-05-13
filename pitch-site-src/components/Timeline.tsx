import React from 'react';
import { useInView } from '../hooks';
import { buildPhases } from '../data';

export default function Timeline() {
  const { ref, isVisible } = useInView();

  const phaseColors = [
    { bg: 'bg-sea-500/20', border: 'border-sea-500/40', text: 'text-sea-400', dot: 'bg-sea-400' },
    { bg: 'bg-gold-500/20', border: 'border-gold-500/40', text: 'text-gold-400', dot: 'bg-gold-400' },
    { bg: 'bg-teal-500/20', border: 'border-teal-500/40', text: 'text-teal-400', dot: 'bg-teal-400' },
    { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', dot: 'bg-purple-400' },
    { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', dot: 'bg-blue-400' },
  ];

  // Group phases by version
  const v1Phases = buildPhases.filter((_, i) => i < 4);
  const v15Phase = buildPhases.find((_, i) => i === 4);
  const v2Phase = buildPhases.find((_, i) => i === 5);

  return (
    <section id="timeline" ref={ref} className="py-32 px-8 relative">
      <div className="max-w-5xl mx-auto">
        <div className={`fade-up ${isVisible ? 'visible' : ''} mb-16`}>
          <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3">Build Roadmap</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-dark-50 mb-4">28 Weeks, Three Milestones</h3>
          <p className="text-xl text-dark-300 max-w-3xl">
            V1 launches in 10 weeks. Advanced logistics by week 18. Engineering and white-label by week 28. Revenue from day one.
          </p>
        </div>

        {/* V1 Section */}
        <div className={`fade-up ${isVisible ? 'visible' : ''} mb-4`}>
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">V1</span>
            <span className="text-dark-400">Core Platform — 10 Weeks</span>
            <span className="text-emerald-400 text-sm font-semibold">→ $1,880/mo revenue starts</span>
          </div>
        </div>

        <div className="relative mb-12">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-dark-700 hidden md:block" />
          <div className="space-y-8">
            {v1Phases.map((phase, i) => {
              const colors = phaseColors[i];
              return (
                <div
                  key={i}
                  className={`fade-up fade-up-delay-${Math.min(i + 1, 5)} ${isVisible ? 'visible' : ''} 
                    relative md:pl-16`}
                >
                  <div className={`absolute left-4 top-6 w-5 h-5 rounded-full ${colors.dot} border-4 border-dark-900 hidden md:block`} />
                  <div className={`p-6 rounded-2xl bg-dark-800/60 border ${colors.border} card-hover`}>
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                      <div>
                        <div className={`text-sm font-semibold ${colors.text} uppercase tracking-wider`}>
                          Phase {phase.phase}
                        </div>
                        <h4 className="text-2xl font-bold text-dark-100">{phase.title}</h4>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full ${colors.bg} ${colors.text} text-sm font-semibold`}>
                        {phase.weeks}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {phase.deliverables.map((d, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <svg className={`w-4 h-4 ${colors.text} mt-1 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-dark-300 text-sm">{d}</span>
                          </div>
                        ))}
                      </div>
                      {phase.highlight && (
                        <div className={`flex items-center p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
                          <p className={`text-sm ${colors.text} font-medium`}>{phase.highlight}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* V1.5 Section */}
        {v15Phase && (
          <>
            <div className={`fade-up fade-up-delay-4 ${isVisible ? 'visible' : ''} mb-4`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold">V1.5</span>
                <span className="text-dark-400">Advanced Logistics — Weeks 11–18</span>
                <span className="text-purple-400 text-sm font-semibold">→ D-A eliminated</span>
              </div>
            </div>
            <div className={`fade-up fade-up-delay-5 ${isVisible ? 'visible' : ''} relative md:pl-16 mb-12`}>
              <div className={`absolute left-4 top-6 w-5 h-5 rounded-full bg-purple-400 border-4 border-dark-900 hidden md:block`} />
              <div className="p-6 rounded-2xl bg-dark-800/60 border border-purple-500/40 card-hover">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-purple-400 uppercase tracking-wider">V1.5</div>
                    <h4 className="text-2xl font-bold text-dark-100">{v15Phase.title}</h4>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-400 text-sm font-semibold">
                    {v15Phase.weeks}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {v15Phase.deliverables.map((d, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-dark-300 text-sm">{d}</span>
                      </div>
                    ))}
                  </div>
                  {v15Phase.highlight && (
                    <div className="flex items-center p-4 rounded-xl bg-purple-500/20 border border-purple-500/40">
                      <p className="text-sm text-purple-400 font-medium">{v15Phase.highlight}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* V2 Section */}
        {v2Phase && (
          <>
            <div className={`fade-up fade-up-delay-5 ${isVisible ? 'visible' : ''} mb-4`}>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-bold">V2</span>
                <span className="text-dark-400">Engineering & Scale — Weeks 19–28</span>
                <span className="text-blue-400 text-sm font-semibold">→ White-label + Lindblad</span>
              </div>
            </div>
            <div className={`fade-up fade-up-delay-5 ${isVisible ? 'visible' : ''} relative md:pl-16 mb-12`}>
              <div className={`absolute left-4 top-6 w-5 h-5 rounded-full bg-blue-400 border-4 border-dark-900 hidden md:block`} />
              <div className="p-6 rounded-2xl bg-dark-800/60 border border-blue-500/40 card-hover">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div>
                    <div className="text-sm font-semibold text-blue-400 uppercase tracking-wider">V2</div>
                    <h4 className="text-2xl font-bold text-dark-100">{v2Phase.title}</h4>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm font-semibold">
                    {v2Phase.weeks}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {v2Phase.deliverables.map((d, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-dark-300 text-sm">{d}</span>
                      </div>
                    ))}
                  </div>
                  {v2Phase.highlight && (
                    <div className="flex items-center p-4 rounded-xl bg-blue-500/20 border border-blue-500/40">
                      <p className="text-sm text-blue-400 font-medium">{v2Phase.highlight}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Revenue Trajectory */}
        <div className={`fade-up fade-up-delay-5 ${isVisible ? 'visible' : ''} mt-8 p-6 rounded-2xl bg-gradient-to-r from-sea-500/10 via-purple-500/10 to-blue-500/10 border border-sea-500/20`}>
          <h4 className="text-lg font-semibold text-dark-200 mb-4">Revenue Trajectory for Ops Normal</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-dark-800/60 border border-emerald-500/30">
              <span className="text-emerald-400 font-semibold block mb-1">Week 10 — SANSU Live</span>
              <span className="text-2xl font-black text-dark-100">$26.6k</span>
              <span className="text-dark-500 text-xs block">/year · 1 customer</span>
            </div>
            <div className="p-4 rounded-xl bg-dark-800/60 border border-purple-500/30">
              <span className="text-purple-400 font-semibold block mb-1">Week 18 — Full Platform</span>
              <span className="text-2xl font-black text-dark-100">$80k+</span>
              <span className="text-dark-500 text-xs block">/year · 3 direct customers</span>
            </div>
            <div className="p-4 rounded-xl bg-dark-800/60 border border-blue-500/30">
              <span className="text-blue-400 font-semibold block mb-1">Week 28 — White-Label</span>
              <span className="text-2xl font-black text-dark-100">$266k+</span>
              <span className="text-dark-500 text-xs block">/year · direct + Lindblad resale</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
