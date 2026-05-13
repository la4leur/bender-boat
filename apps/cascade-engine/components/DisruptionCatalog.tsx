import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { DisruptionType } from '../types';
import { disruptions, gearNames } from '../data';

interface Props {
  onSelect: (id: string) => void;
}

const severityColors = {
  critical: 'border-error bg-error/5',
  high: 'border-warning bg-warning/5',
  medium: 'border-info bg-info/5',
};

const severityBadge = {
  critical: 'badge-error',
  high: 'badge-warning',
  medium: 'badge-info',
};

export const DisruptionCatalog: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold">Change Cascade Engine</h2>
        <p className="text-sm text-base-content/60 mt-1">
          When something breaks in one gear, the ripple propagates through every connected process. 
          Select a disruption to see exactly how it cascades — and the reconstitution checklist that brings operations back to normal.
        </p>
      </div>

      {/* Stats banner */}
      <div className="stats stats-horizontal bg-base-200 w-full text-center">
        <div className="stat px-3 py-2">
          <div className="stat-title text-xs">Disruption Types</div>
          <div className="stat-value text-lg">{disruptions.length}</div>
        </div>
        <div className="stat px-3 py-2">
          <div className="stat-title text-xs">Total Cascade Steps</div>
          <div className="stat-value text-lg">{disruptions.reduce((s, d) => s + d.cascadeSteps.length, 0)}</div>
        </div>
        <div className="stat px-3 py-2">
          <div className="stat-title text-xs">Checklist Actions</div>
          <div className="stat-value text-lg">{disruptions.reduce((s, d) => s + d.checklist.length, 0)}</div>
        </div>
        <div className="stat px-3 py-2">
          <div className="stat-title text-xs">Automatable</div>
          <div className="stat-value text-lg text-success">{disruptions.reduce((s, d) => s + d.checklist.filter(c => c.automatable).length, 0)}</div>
        </div>
      </div>

      {/* Disruption cards */}
      <div className="grid grid-cols-1 gap-3">
        {disruptions.map((d) => (
          <div
            key={d.id}
            className={`card border-2 ${severityColors[d.severity]} cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => onSelect(d.id)}
          >
            <div className="card-body p-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">{d.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm">{d.name}</h3>
                    <span className={`badge ${severityBadge[d.severity]} badge-xs`}>{d.severity}</span>
                  </div>
                  <p className="text-xs text-base-content/60 mt-0.5 line-clamp-2">{d.description}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {d.gearsAffected.map(g => (
                      <span key={g} className={`badge ${gearNames[g].badgeClass} badge-xs`}>
                        {gearNames[g].name}
                      </span>
                    ))}
                    <span className="text-xs text-base-content/40 ml-auto flex items-center gap-0.5">
                      {d.cascadeSteps.length} steps · {d.checklist.length} actions
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key insight */}
      <div className="alert bg-base-200 border border-base-300">
        <AlertTriangle size={16} className="text-warning" />
        <div>
          <p className="text-xs font-semibold">Why This Matters</p>
          <p className="text-xs text-base-content/60">
            Today, every one of these disruptions is handled by phone calls, text messages, and Sam's institutional memory. 
            A single missed flight triggers 8-10 manual actions across 3-4 people. A resignation cascades into 15+ actions over 6 weeks. 
            <strong> The system doesn't just track — it generates the reconstitution checklist and automates what it can.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
