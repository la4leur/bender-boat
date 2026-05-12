import React, { useState } from 'react';
import { ArrowLeft, ArrowDown, ArrowRight, ChevronDown, ChevronUp, Clock, AlertTriangle, ShieldCheck, Lock, Ship, Users, UserPlus } from 'lucide-react';
import { GearId, GearProcess, Stage, SubStage } from '../types';
import { gears, meshPoints } from '../data';

interface Props {
  gearId: GearId;
  onBack: () => void;
  onNavigateGear: (id: GearId) => void;
}

const gearIcons: Record<GearId, React.ReactNode> = {
  'vessel-schedule': <Ship size={22} />,
  'crew-rotation': <Users size={22} />,
  'hiring-onboarding': <UserPlus size={22} />,
  'training-compliance': <ShieldCheck size={22} />,
};

const gearColorMap: Record<GearId, { text: string; border: string; bg: string; badge: string }> = {
  'vessel-schedule': { text: 'text-info', border: 'border-info', bg: 'bg-info/10', badge: 'badge-info' },
  'crew-rotation': { text: 'text-primary', border: 'border-primary', bg: 'bg-primary/10', badge: 'badge-primary' },
  'hiring-onboarding': { text: 'text-secondary', border: 'border-secondary', bg: 'bg-secondary/10', badge: 'badge-secondary' },
  'training-compliance': { text: 'text-warning', border: 'border-warning', bg: 'bg-warning/10', badge: 'badge-warning' },
};

export const GearDetail: React.FC<Props> = ({ gearId, onBack, onNavigateGear }) => {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const gear = gears.find(g => g.id === gearId)!;
  const colors = gearColorMap[gearId];

  const incomingMesh = meshPoints.filter(m => m.toGear === gearId);
  const outgoingMesh = meshPoints.filter(m => m.fromGear === gearId);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div className={colors.text}>
          {gearIcons[gearId]}
        </div>
        <div>
          <h2 className="text-xl font-bold">{gear.name}</h2>
          <p className={`text-sm font-medium ${colors.text}`}>{gear.tagline}</p>
        </div>
      </div>

      {/* Inputs */}
      <div className={`card ${colors.bg} border ${colors.border}`}>
        <div className="card-body p-3">
          <h3 className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Inputs — What feeds this gear</h3>
          <ul className="mt-1 space-y-1">
            {gear.inputs.map((inp, i) => (
              <li key={i} className="text-sm flex items-start gap-1.5">
                <ArrowRight size={12} className="mt-1 shrink-0 opacity-40" />
                {inp}
              </li>
            ))}
          </ul>
          {incomingMesh.length > 0 && (
            <div className="mt-2 space-y-1">
              {incomingMesh.map((m, i) => {
                const fromGear = gears.find(g => g.id === m.fromGear)!;
                const fromColors = gearColorMap[m.fromGear];
                return (
                  <button
                    key={i}
                    className="btn btn-xs btn-ghost gap-1"
                    onClick={() => onNavigateGear(m.fromGear)}
                  >
                    <span className={`badge ${fromColors.badge} badge-xs`}>{fromGear.shortName}</span>
                    → {m.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-0">
        {gear.stages.map((stage, i) => {
          const isExpanded = expandedStage === stage.id;
          const hasPainPoints = stage.painPoints && stage.painPoints.length > 0;
          
          return (
            <div key={stage.id}>
              <div
                className={`card bg-base-200 border ${stage.gate ? 'border-warning' : 'border-base-300'} cursor-pointer hover:bg-base-200/80`}
                onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
              >
                <div className="card-body p-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      stage.gate ? 'bg-warning text-warning-content' : `${colors.bg} ${colors.text}`
                    }`}>
                      {stage.gate ? <Lock size={14} /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm">{stage.name}</h4>
                        {stage.gate && <span className="badge badge-warning badge-xs">GATE</span>}
                        {stage.duration && (
                          <span className="text-xs text-base-content/40 flex items-center gap-0.5">
                            <Clock size={10} /> {stage.duration}
                          </span>
                        )}
                        {hasPainPoints && (
                          <AlertTriangle size={12} className="text-error" />
                        )}
                      </div>
                      <p className="text-xs text-base-content/60 mt-0.5">{stage.description}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="opacity-40" /> : <ChevronDown size={14} className="opacity-40" />}
                  </div>

                  {isExpanded && (
                    <div className="mt-3 ml-11 space-y-3">
                      {stage.owner && (
                        <p className="text-xs text-base-content/50">
                          <span className="font-semibold">Owner:</span> {stage.owner}
                        </p>
                      )}
                      {hasPainPoints && (
                        <div className="bg-error/10 border border-error/20 rounded p-2 space-y-1">
                          <p className="text-xs font-semibold text-error flex items-center gap-1">
                            <AlertTriangle size={12} /> Current Problems
                          </p>
                          {stage.painPoints!.map((p, j) => (
                            <p key={j} className="text-xs text-error/70 ml-4">• {p}</p>
                          ))}
                        </div>
                      )}
                      {stage.substages && stage.substages.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-base-content/60">Sub-steps:</p>
                          {stage.substages.map((sub: SubStage) => (
                            <div key={sub.id} className="flex items-center gap-2 text-xs ml-2">
                              {sub.gate ? <Lock size={10} className="text-warning shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full bg-base-content/20 shrink-0" />}
                              <span className="font-medium">{sub.name}</span>
                              <span className="text-base-content/40">— {sub.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {stage.automationNote && (
                        <div className="bg-success/10 border border-success/20 rounded p-2">
                          <p className="text-xs text-success flex items-start gap-1">
                            <ShieldCheck size={12} className="mt-0.5 shrink-0" />
                            <span><span className="font-semibold">Our system:</span> {stage.automationNote}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {i < gear.stages.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown size={14} className="text-base-content/20" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Outputs */}
      <div className={`card ${colors.bg} border ${colors.border}`}>
        <div className="card-body p-3">
          <h3 className="text-xs font-bold text-base-content/60 uppercase tracking-wider">Outputs — What this gear produces</h3>
          <ul className="mt-1 space-y-1">
            {gear.outputs.map((out, i) => (
              <li key={i} className="text-sm flex items-start gap-1.5">
                <ArrowRight size={12} className="mt-1 shrink-0 opacity-40" />
                {out}
              </li>
            ))}
          </ul>
          {outgoingMesh.length > 0 && (
            <div className="mt-2 space-y-1">
              {outgoingMesh.map((m, i) => {
                const toGear = gears.find(g => g.id === m.toGear)!;
                const toColors = gearColorMap[m.toGear];
                return (
                  <button
                    key={i}
                    className="btn btn-xs btn-ghost gap-1"
                    onClick={() => onNavigateGear(m.toGear)}
                  >
                    {m.label} →
                    <span className={`badge ${toColors.badge} badge-xs`}>{toGear.shortName}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button className="btn btn-ghost btn-sm" onClick={onBack}>
        <ArrowLeft size={16} /> Back to System View
      </button>
    </div>
  );
};
