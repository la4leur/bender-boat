import React, { useState } from 'react';
import { Ship, Users, UserPlus, ShieldCheck, ArrowRight, ArrowDown, ArrowUp, ChevronDown, ChevronUp, AlertTriangle, Cog } from 'lucide-react';
import { GearProcess, MeshPoint, GearId } from '../types';
import { gears, meshPoints, realDataHighlights } from '../data';

interface Props {
  onSelectGear: (id: GearId) => void;
  onSelectPipeline: () => void;
  onSelectScenario: () => void;
}

const gearIcons: Record<GearId, React.ReactNode> = {
  'vessel-schedule': <Ship size={28} />,
  'crew-rotation': <Users size={28} />,
  'hiring-onboarding': <UserPlus size={28} />,
  'training-compliance': <ShieldCheck size={28} />,
};

const gearColors: Record<GearId, { border: string; bg: string; text: string; badge: string }> = {
  'vessel-schedule': { border: 'border-info', bg: 'bg-info/10', text: 'text-info', badge: 'badge-info' },
  'crew-rotation': { border: 'border-primary', bg: 'bg-primary/10', text: 'text-primary', badge: 'badge-primary' },
  'hiring-onboarding': { border: 'border-secondary', bg: 'bg-secondary/10', text: 'text-secondary', badge: 'badge-secondary' },
  'training-compliance': { border: 'border-warning', bg: 'bg-warning/10', text: 'text-warning', badge: 'badge-warning' },
};

const painData: Record<GearId, { stat: string; detail: string }> = {
  'vessel-schedule': realDataHighlights.vesselSchedule,
  'crew-rotation': realDataHighlights.crewRotation,
  'hiring-onboarding': realDataHighlights.hiringOnboarding,
  'training-compliance': realDataHighlights.trainingCompliance,
};

export const SystemView: React.FC<Props> = ({ onSelectGear, onSelectPipeline, onSelectScenario }) => {
  const [expandedMesh, setExpandedMesh] = useState<number | null>(null);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Cog size={20} className="opacity-60 animate-spin" style={{ animationDuration: '8s' }} />
          <h2 className="text-xl font-bold">Four Interlocking Gears</h2>
          <Cog size={20} className="opacity-60 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
        </div>
        <p className="text-base-content/60 text-sm max-w-2xl mx-auto">
          These processes don't run in isolation — they mesh like gears. When the vessel schedule turns, 
          it drives crew rotation. When rotation can't find relief, it triggers hiring. Training gates everything. 
          If any gear jams, the whole system feels it.
        </p>
      </div>

      {/* The Four Gears - Circular Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gears.map((gear) => {
          const colors = gearColors[gear.id];
          const pain = painData[gear.id];
          return (
            <div
              key={gear.id}
              className={`card ${colors.bg} border-2 ${colors.border} cursor-pointer hover:shadow-lg transition-all`}
              onClick={() => onSelectGear(gear.id)}
            >
              <div className="card-body p-4">
                <div className="flex items-start gap-3">
                  <div className={`${colors.text} mt-1`}>
                    {gearIcons[gear.id]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg">{gear.name}</h3>
                    <p className={`text-sm font-medium ${colors.text}`}>{gear.tagline}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-base-content/60">
                        <span className="font-semibold">Stages:</span> {gear.stages.length} steps
                      </p>
                      <div className="text-xs">
                        <span className="font-semibold text-base-content/60">Outputs:</span>
                        <ul className="mt-1 space-y-0.5">
                          {gear.outputs.map((o, i) => (
                            <li key={i} className="text-base-content/50 flex gap-1">
                              <ArrowRight size={10} className="mt-0.5 shrink-0 opacity-60" />
                              <span>{o}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Pain point from real data */}
                <div className="mt-3 bg-error/10 border border-error/30 rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-error shrink-0" />
                    <span className="text-sm font-bold text-error">{pain.stat}</span>
                  </div>
                  <p className="text-xs text-base-content/60 mt-0.5">{pain.detail}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flow Arrows - How they connect */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Cog size={18} className="opacity-60" /> Mesh Points — Where Gears Interlock
          </h3>
          <div className="space-y-2">
            {meshPoints.map((mp, i) => {
              const fromGear = gears.find(g => g.id === mp.fromGear)!;
              const toGear = gears.find(g => g.id === mp.toGear)!;
              const fromColors = gearColors[mp.fromGear];
              const toColors = gearColors[mp.toGear];
              const isExpanded = expandedMesh === i;

              return (
                <div key={i} className="bg-base-300 rounded-lg overflow-hidden">
                  <button
                    className="w-full p-3 flex items-center gap-2 text-left hover:bg-base-100/30 transition-colors"
                    onClick={() => setExpandedMesh(isExpanded ? null : i)}
                  >
                    <span className={`badge ${fromColors.badge} badge-sm`}>{fromGear.shortName}</span>
                    <ArrowRight size={14} className="opacity-60 shrink-0" />
                    <span className={`badge ${toColors.badge} badge-sm`}>{toGear.shortName}</span>
                    <span className="text-sm font-medium flex-1">{mp.label}</span>
                    {isExpanded ? <ChevronUp size={14} className="opacity-60" /> : <ChevronDown size={14} className="opacity-60" />}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2">
                      <p className="text-sm text-base-content/70">
                        <span className="font-semibold">Trigger:</span> {mp.trigger}
                      </p>
                      <div>
                        <p className="text-xs font-semibold text-base-content/60 mb-1">Data Flow:</p>
                        <ul className="space-y-0.5">
                          {mp.dataFlow.map((d, j) => (
                            <li key={j} className="text-xs text-base-content/50 flex gap-1.5">
                              <ArrowRight size={10} className="mt-0.5 shrink-0 opacity-40" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* The Cycle Visualization */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-bold text-lg mb-3">The Cycle</h3>
          <div className="flex flex-col items-center gap-1">
            {/* Row 1: Vessel Schedule */}
            <div className={`badge badge-info badge-lg gap-1 px-4 py-3`}>
              <Ship size={16} /> Vessel Schedule defines WHEN/WHERE
            </div>
            <ArrowDown size={20} className="text-info opacity-60" />
            
            {/* Row 2: Crew Rotation */}
            <div className={`badge badge-primary badge-lg gap-1 px-4 py-3`}>
              <Users size={16} /> Crew Rotation identifies WHO
            </div>
            
            {/* Branch */}
            <div className="flex items-center gap-4 my-1">
              <div className="text-center">
                <p className="text-xs text-success font-semibold mb-1">Relief found ✅</p>
                <ArrowDown size={16} className="text-success mx-auto" />
                <p className="text-xs text-base-content/60 mt-1">→ Book travel → Execute</p>
              </div>
              <div className="divider divider-horizontal mx-0">OR</div>
              <div className="text-center">
                <p className="text-xs text-error font-semibold mb-1">No relief ❌</p>
                <ArrowDown size={16} className="text-error mx-auto" />
              </div>
            </div>

            {/* Row 3: Hiring */}
            <div className={`badge badge-secondary badge-lg gap-1 px-4 py-3`}>
              <UserPlus size={16} /> Hiring & Onboarding fills the gap
            </div>
            <ArrowDown size={20} className="text-secondary opacity-60" />

            {/* Row 4: Training */}
            <div className={`badge badge-warning badge-lg gap-1 px-4 py-3`}>
              <ShieldCheck size={16} /> Training & Compliance GATES deployment
            </div>
            <ArrowDown size={20} className="text-success opacity-60" />

            {/* Row 5: Back to rotation */}
            <div className="badge badge-success badge-lg gap-1 px-4 py-3">
              ✅ Deploy → Back to Crew Rotation
            </div>
            <ArrowUp size={20} className="text-base-content/30" />
            <p className="text-xs text-base-content/40">Cycle repeats at next rotation</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button className="btn btn-secondary btn-lg" onClick={onSelectPipeline}>
          <UserPlus size={20} />
          Hiring → Deployment Pipeline
          <span className="text-xs opacity-70">13 stages, every gate</span>
        </button>
        <button className="btn btn-primary btn-lg" onClick={onSelectScenario}>
          <Ship size={20} />
          Walk the Scenario
          <span className="text-xs opacity-70">45 days, all 4 gears</span>
        </button>
      </div>
    </div>
  );
};
