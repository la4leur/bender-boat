import React from 'react';
import { useInView } from '../hooks';
import { comparison } from '../data';

export default function Comparison() {
  const { ref, isVisible } = useInView();

  return (
    <section id="comparison" ref={ref} className="py-32 px-8 relative">
      <div className="max-w-5xl mx-auto">
        <div className={`fade-up ${isVisible ? 'visible' : ''} mb-16`}>
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">Comparison</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-dark-50 mb-4">
            vs HELM + D-A/Atriis <span className="text-dark-500">($45k/year)</span>
          </h3>
          <p className="text-xl text-dark-300 max-w-3xl">
            HELM quoted ~$20,000/year for vessel ops. Direct Accommodations runs ~$25,000/year for travel — stripped down, no reporting. Combined: $45,200/year for two disconnected tools. Here's what one unified system looks like.
          </p>
        </div>

        <div className={`fade-up fade-up-delay-1 ${isVisible ? 'visible' : ''}`}>
          <div className="overflow-hidden rounded-2xl border border-dark-700 bg-dark-800/40">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-5 bg-dark-800 border-b border-dark-700">
              <div className="col-span-4 text-sm font-semibold text-dark-400 uppercase tracking-wider">Feature</div>
              <div className="col-span-4 text-sm font-semibold text-dark-400 uppercase tracking-wider text-center">
                HELM + D-A <span className="text-red-400/60">$45k/yr</span>
              </div>
              <div className="col-span-4 text-sm font-semibold text-sea-400 uppercase tracking-wider text-center">
                Bender Boat <span className="text-emerald-400/60">$30k/yr</span>
              </div>
            </div>

            {/* Rows */}
            {comparison.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 gap-4 p-5 border-b border-dark-700/50 last:border-0 ${
                  i % 2 === 0 ? 'bg-dark-800/20' : ''
                } hover:bg-dark-800/40 transition-colors`}
              >
                <div className="col-span-4 font-medium text-dark-200">{row.feature}</div>
                <div className={`col-span-4 text-sm text-center ${
                  row.helmStatus === 'yes' ? 'comp-yes' :
                  row.helmStatus === 'partial' ? 'comp-partial' : 'comp-no'
                }`}>
                  <span className="inline-flex items-center gap-1.5">
                    {row.helmStatus === 'yes' ? '✓' : row.helmStatus === 'partial' ? '~' : '✗'}
                    <span className="text-dark-400">{row.helm}</span>
                  </span>
                </div>
                <div className="col-span-4 text-sm text-center">
                  <span className="inline-flex items-center gap-1.5 text-sea-400">
                    ✓+
                    <span className="text-dark-300">{row.bender}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom line */}
        <div className={`fade-up fade-up-delay-2 ${isVisible ? 'visible' : ''} mt-8 p-6 rounded-2xl bg-gradient-to-r from-sea-500/10 to-gold-500/10 border border-sea-500/20`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-2xl font-bold text-dark-100">5-year cost comparison</div>
              <div className="text-dark-400">Total cost of ownership over 5 years</div>
            </div>
            <div className="flex gap-12">
              <div className="text-center">
                <div className="text-3xl font-black text-red-400">$226k</div>
                <div className="text-sm text-dark-500">HELM + D-A (5 years)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-emerald-400">$222k</div>
                <div className="text-sm text-dark-500">Bender Boat (5 years)</div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-dark-400 text-sm">
            Same money. One unified system instead of two. Full data ownership. And capabilities neither vendor offers at any price.
          </div>
        </div>
      </div>
    </section>
  );
}
