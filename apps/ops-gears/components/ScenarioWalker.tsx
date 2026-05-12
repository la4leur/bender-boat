import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Ship, Users, UserPlus, ShieldCheck, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { GearId, ScenarioStep } from '../types';
import { scenarioSteps } from '../data';

interface Props {
  onBack: () => void;
}

const gearMeta: Record<GearId, { icon: React.ReactNode; label: string; badge: string }> = {
  'vessel-schedule': { icon: <Ship size={14} />, label: 'Vessel Schedule', badge: 'badge-info' },
  'crew-rotation': { icon: <Users size={14} />, label: 'Crew Rotation', badge: 'badge-primary' },
  'hiring-onboarding': { icon: <UserPlus size={14} />, label: 'Hiring & Onboarding', badge: 'badge-secondary' },
  'training-compliance': { icon: <ShieldCheck size={14} />, label: 'Training & Compliance', badge: 'badge-warning' },
};

const highlightIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-success" />,
  warning: <AlertTriangle size={16} className="text-warning" />,
  error: <XCircle size={16} className="text-error" />,
  info: <Info size={16} className="text-info" />,
};

const highlightBg: Record<string, string> = {
  success: 'border-success/40 bg-success/5',
  warning: 'border-warning/40 bg-warning/5',
  error: 'border-error/40 bg-error/5',
  info: 'border-info/40 bg-info/5',
};

export const ScenarioWalker: React.FC<Props> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= scenarioSteps.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStep]);

  const step = scenarioSteps[currentStep];
  const progress = ((currentStep + 1) / scenarioSteps.length) * 100;

  // Count steps per gear up to current
  const gearCounts: Record<GearId, number> = {
    'vessel-schedule': 0,
    'crew-rotation': 0,
    'hiring-onboarding': 0,
    'training-compliance': 0,
  };
  for (let i = 0; i <= currentStep; i++) {
    gearCounts[scenarioSteps[i].gear]++;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold">Scenario: Chief Mate Replacement</h2>
          <p className="text-sm text-base-content/60">
            45 days, all 4 gears — from "rotation due" to "butt in seat"
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="card bg-base-200">
        <div className="card-body p-3">
          <div className="flex items-center gap-3">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => { setCurrentStep(Math.max(0, currentStep - 1)); setPlaying(false); }}
              disabled={currentStep === 0}
            >
              <SkipBack size={16} />
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => { setCurrentStep(Math.min(scenarioSteps.length - 1, currentStep + 1)); setPlaying(false); }}
              disabled={currentStep === scenarioSteps.length - 1}
            >
              <SkipForward size={16} />
            </button>
            <div className="flex-1 text-right">
              <span className="text-sm font-mono">
                Step {currentStep + 1} / {scenarioSteps.length}
              </span>
              <span className="text-sm text-base-content/40 ml-2">
                Day {step.dayOffset > 0 ? '+' : ''}{step.dayOffset}
              </span>
            </div>
          </div>
          <progress className="progress progress-primary w-full mt-2" value={progress} max={100} />
          
          {/* Gear activity counters */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(Object.keys(gearMeta) as GearId[]).map(gid => (
              <div key={gid} className={`badge ${gearMeta[gid].badge} badge-sm gap-1 ${gearCounts[gid] > 0 ? '' : 'opacity-30'}`}>
                {gearMeta[gid].icon}
                {gearMeta[gid].label}: {gearCounts[gid]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {scenarioSteps.map((s, i) => {
          const meta = gearMeta[s.gear];
          const isCurrent = i === currentStep;
          const isPast = i < currentStep;
          const isFuture = i > currentStep;
          const hl = s.highlight || 'info';

          return (
            <div
              key={i}
              ref={isCurrent ? stepRef : undefined}
              className={`card border-l-4 ${
                isCurrent
                  ? `${highlightBg[hl]} border-l-4 shadow-lg scale-[1.01]`
                  : isPast
                  ? 'bg-base-200/50 border-base-content/10 opacity-60'
                  : 'bg-base-200/30 border-base-content/5 opacity-30'
              } transition-all duration-300 cursor-pointer`}
              onClick={() => { setCurrentStep(i); setPlaying(false); }}
            >
              <div className="card-body p-3">
                <div className="flex items-start gap-2">
                  {/* Day marker */}
                  <div className="text-center min-w-[48px]">
                    <div className={`text-xs font-mono ${isCurrent ? 'font-bold' : 'text-base-content/40'}`}>
                      Day {s.dayOffset > 0 ? '+' : ''}{s.dayOffset}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mt-0.5">
                    {isCurrent ? highlightIcons[hl] : isPast ? <CheckCircle size={16} className="text-success/40" /> : <div className="w-4 h-4 rounded-full bg-base-content/10" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${meta.badge} badge-xs gap-0.5`}>
                        {meta.icon} {meta.label}
                      </span>
                      <span className={`text-sm font-bold ${isCurrent ? '' : 'text-base-content/60'}`}>
                        {s.title}
                      </span>
                    </div>
                    {(isCurrent || isPast) && (
                      <p className={`text-xs mt-1 ${isCurrent ? 'text-base-content/80' : 'text-base-content/40'}`}>
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary at end */}
      {currentStep === scenarioSteps.length - 1 && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <div>
            <h3 className="font-bold">Full Cycle Complete</h3>
            <p className="text-sm">
              45 days. 4 gears. 23 tracked steps. Every gate documented. 
              From "no relief available" to "new Chief Mate on watch" — with full audit trail, 
              zero spreadsheets, and zero 4 AM phone calls.
            </p>
          </div>
        </div>
      )}

      <button className="btn btn-ghost btn-sm" onClick={onBack}>
        <ArrowLeft size={16} /> Back to System View
      </button>
    </div>
  );
};
