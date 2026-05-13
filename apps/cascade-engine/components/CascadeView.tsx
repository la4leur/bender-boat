import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowDown, Play, Pause, RotateCcw, Zap, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { DisruptionType, CascadeStep, GearId } from '../types';
import { disruptions, gearNames } from '../data';

interface Props {
  disruptionId: string;
  onBack: () => void;
  onChecklist: () => void;
}

const impactStyles = {
  blocking: { badge: 'badge-error', label: 'BLOCKING', icon: '🔴' },
  degraded: { badge: 'badge-warning', label: 'DEGRADED', icon: '🟡' },
  awareness: { badge: 'badge-info', label: 'AWARENESS', icon: '🔵' },
};

export const CascadeView: React.FC<Props> = ({ disruptionId, onBack, onChecklist }) => {
  const d = disruptions.find(x => x.id === disruptionId)!;
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const totalSteps = d.cascadeSteps.length;

  useEffect(() => {
    if (!isPlaying || revealedSteps >= totalSteps) {
      if (revealedSteps >= totalSteps) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setRevealedSteps(prev => prev + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isPlaying, revealedSteps, totalSteps]);

  const handlePlay = useCallback(() => {
    if (revealedSteps >= totalSteps) {
      setRevealedSteps(0);
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(true);
    }
  }, [revealedSteps, totalSteps]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setRevealedSteps(0);
    setExpandedStep(null);
  }, []);

  // Group steps by gear for the impact summary
  const gearImpact = d.gearsAffected.map(gearId => {
    const steps = d.cascadeSteps.filter(s => s.gear === gearId);
    const worstImpact = steps.some(s => s.impact === 'blocking') ? 'blocking' :
      steps.some(s => s.impact === 'degraded') ? 'degraded' : 'awareness';
    return { gearId, steps: steps.length, impact: worstImpact as 'blocking' | 'degraded' | 'awareness' };
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div className="text-2xl">{d.icon}</div>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{d.name}</h2>
          <p className="text-xs text-base-content/60">{d.description}</p>
        </div>
      </div>

      {/* Real example callout */}
      <div className="alert bg-error/10 border border-error/20">
        <AlertTriangle size={14} className="text-error shrink-0" />
        <p className="text-xs"><span className="font-bold">From your data:</span> {d.realExample}</p>
      </div>

      {/* Gear impact summary */}
      <div className="flex gap-2 flex-wrap">
        {gearImpact.map(gi => (
          <div key={gi.gearId} className={`badge gap-1 ${impactStyles[gi.impact].badge} badge-sm`}>
            {impactStyles[gi.impact].icon} {gearNames[gi.gearId].name} ({gi.steps})
          </div>
        ))}
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2 bg-base-200 rounded-lg p-2">
        <button
          className={`btn btn-sm ${isPlaying ? 'btn-warning' : 'btn-success'}`}
          onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? 'Pause' : revealedSteps >= totalSteps ? 'Replay' : 'Watch Cascade'}
        </button>
        <button className="btn btn-sm btn-ghost" onClick={handleReset}>
          <RotateCcw size={14} /> Reset
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => setRevealedSteps(totalSteps)}>
          <Zap size={14} /> Show All
        </button>
        <div className="flex-1" />
        <span className="text-xs text-base-content/50">
          {revealedSteps} / {totalSteps} steps
        </span>
        <progress className="progress progress-primary w-20" value={revealedSteps} max={totalSteps} />
      </div>

      {/* Cascade timeline */}
      <div className="space-y-0">
        {d.cascadeSteps.map((step, i) => {
          const isRevealed = i < revealedSteps;
          const isLatest = i === revealedSteps - 1;
          const impact = impactStyles[step.impact];
          const gn = gearNames[step.gear];
          const isExpanded = expandedStep === step.id;

          return (
            <div key={step.id}>
              <div
                className={`card border transition-all duration-500 ${
                  isRevealed
                    ? isLatest
                      ? `${gn.color} border-2 ${gn.textColor.replace('text-', 'border-')} shadow-md`
                      : `${gn.color} border-base-300`
                    : 'bg-base-100 border-base-200 opacity-20'
                } ${isRevealed ? 'cursor-pointer' : ''}`}
                onClick={() => isRevealed && setExpandedStep(isExpanded ? null : step.id)}
              >
                <div className="card-body p-3">
                  <div className="flex items-start gap-3">
                    {/* Timeline node */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500 ${
                      isRevealed
                        ? step.impact === 'blocking' ? 'bg-error text-error-content' :
                          step.impact === 'degraded' ? 'bg-warning text-warning-content' :
                          'bg-info text-info-content'
                        : 'bg-base-300 text-base-content/30'
                    }`}>
                      {isRevealed ? i + 1 : '?'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`badge ${gn.badgeClass} badge-xs`}>{gearNames[step.gear].name}</span>
                        <span className={`badge ${impact.badge} badge-xs`}>{impact.label}</span>
                        <span className="text-xs text-base-content/40 flex items-center gap-0.5">
                          <Clock size={10} /> {step.timeOffset}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm mt-1">{isRevealed ? step.title : '???'}</h4>
                      {isRevealed && (
                        <p className={`text-xs text-base-content/60 mt-0.5 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {step.description}
                        </p>
                      )}
                      {isRevealed && step.triggersNext && step.triggersNext.length > 0 && isExpanded && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-base-content/40">
                          <Zap size={10} /> Triggers {step.triggersNext.length} downstream action{step.triggersNext.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {i < d.cascadeSteps.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown size={12} className={`transition-opacity duration-500 ${isRevealed ? 'opacity-30' : 'opacity-10'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resolution */}
      {revealedSteps >= totalSteps && (
        <div className="card bg-success/10 border-2 border-success">
          <div className="card-body p-3 text-center">
            <CheckCircle2 size={24} className="text-success mx-auto" />
            <p className="font-bold text-sm mt-1">Cascade Complete — {totalSteps} Steps Across {d.gearsAffected.length} Gears</p>
            <p className="text-xs text-base-content/60">
              {d.checklist.filter(c => c.automatable).length} of {d.checklist.length} reconstitution actions are automatable. 
              The rest need human judgment — but the system generates the checklist and tracks completion.
            </p>
            <button className="btn btn-success btn-sm mt-2" onClick={onChecklist}>
              <CheckCircle2 size={14} /> View Reconstitution Checklist →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
