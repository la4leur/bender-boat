import React from 'react';
import { useInView } from '../hooks';

export default function CTA() {
  const { ref, isVisible } = useInView();

  return (
    <section id="cta" ref={ref} className="py-32 px-8 relative min-h-[70vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-t from-sea-950/20 to-transparent" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-sea-500/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute top-20 right-1/3 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className={`max-w-4xl mx-auto text-center relative fade-up ${isVisible ? 'visible' : ''}`}>
        <h3 className="text-4xl md:text-6xl font-black text-dark-50 mb-6">
          Ready to build this?
        </h3>
        <p className="text-xl text-dark-300 mb-4 max-w-2xl mx-auto">
          Purpose-built for Standing Tide. Not a generic platform you have to fight —
          a system designed around how your crew actually operates.
        </p>
        <p className="text-lg text-dark-400 mb-8 max-w-2xl mx-auto">
          Your data. Your Supabase instance. Full data portability.
        </p>

        {/* Pricing cards */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="px-8 py-6 rounded-2xl bg-dark-800/80 border border-sea-500/30 text-center min-w-[220px]">
            <div className="text-dark-500 text-sm mb-1">Phase 1 — Ops + Crew + Travel</div>
            <div className="text-3xl font-black text-sea-400">$2,500<span className="text-lg font-normal text-dark-400">/mo</span></div>
            <div className="text-dark-500 text-xs mt-1">$30,000/year</div>
          </div>
          <div className="px-8 py-6 rounded-2xl bg-dark-800/80 border border-gold-500/30 text-center min-w-[220px]">
            <div className="text-dark-500 text-sm mb-1">Phase 2 — + Engineering</div>
            <div className="text-3xl font-black text-gold-400">$4,000<span className="text-lg font-normal text-dark-400">/mo</span></div>
            <div className="text-dark-500 text-xs mt-1">$48,000/year</div>
          </div>
        </div>

        <p className="text-sm text-dark-500 mb-12 max-w-xl mx-auto">
          vs <span className="text-red-400">$45,200/year</span> for HELM + D-A/Atriis combined — and you get one unified system with full data ownership.
          <br />
          <span className="text-emerald-400">5-year savings: $4,000+</span> with infinitely more capability.
        </p>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-300">
              <span className="text-dark-500 text-sm block">Developer</span>
              <span className="font-semibold">Ops Normal AI LLC</span>
            </div>
            <div className="px-6 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-300">
              <span className="text-dark-500 text-sm block">Timeline</span>
              <span className="font-semibold">10 Weeks</span>
            </div>
            <div className="px-6 py-3 rounded-xl bg-dark-800 border border-dark-600 text-dark-300">
              <span className="text-dark-500 text-sm block">Fleet</span>
              <span className="font-semibold">3 Vessels</span>
            </div>
          </div>

          <div className="mt-8 text-dark-500 text-sm">
            © {new Date().getFullYear()} Ops Normal AI LLC · Prepared for Standing Tide
          </div>
        </div>
      </div>
    </section>
  );
}
