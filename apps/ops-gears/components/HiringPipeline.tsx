import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, ShieldAlert, ShieldCheck, Clock, AlertTriangle, CheckCircle, UserPlus, ArrowDown, Lock } from 'lucide-react';
import { gears } from '../data';
import { Stage, SubStage } from '../types';

interface Props {
  onBack: () => void;
}

const hiringGear = gears.find(g => g.id === 'hiring-onboarding')!;

const stagePhases: Record<string, { phase: string; color: string }> = {
  'ho-requisition': { phase: 'DEMAND', color: 'badge-error' },
  'ho-sourcing': { phase: 'RECRUIT', color: 'badge-info' },
  'ho-screening': { phase: 'RECRUIT', color: 'badge-info' },
  'ho-interview': { phase: 'RECRUIT', color: 'badge-info' },
  'ho-offer': { phase: 'RECRUIT', color: 'badge-info' },
  'ho-preboarding': { phase: 'ONBOARD', color: 'badge-secondary' },
  'ho-drug-alcohol': { phase: 'CLEAR', color: 'badge-warning' },
  'ho-background': { phase: 'CLEAR', color: 'badge-warning' },
  'ho-credentials': { phase: 'VERIFY', color: 'badge-primary' },
  'ho-gap-remediation': { phase: 'TRAIN', color: 'badge-accent' },
  'ho-travel-docs': { phase: 'TRAVEL', color: 'badge-info' },
  'ho-deploy-ready': { phase: 'DEPLOY', color: 'badge-success' },
};

const StageCard: React.FC<{ stage: Stage; index: number; isLast: boolean }> = ({ stage, index, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const phaseInfo = stagePhases[stage.id] || { phase: '?', color: 'badge-ghost' };
  const hasDetails = (stage.painPoints && stage.painPoints.length > 0) || 
                     (stage.substages && stage.substages.length > 0) ||
                     stage.automationNote;

  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-6 top-full w-0.5 h-4 bg-base-content/20 z-0" />
      )}
      
      <div
        className={`card bg-base-200 border ${stage.gate ? 'border-warning' : 'border-base-300'} ${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        <div className="card-body p-3">
          <div className="flex items-start gap-3">
            {/* Step number + gate indicator */}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                stage.gate ? 'bg-warning text-warning-content' : 'bg-base-300 text-base-content'
              }`}>
                {stage.gate ? <Lock size={14} /> : index + 1}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${phaseInfo.color} badge-xs`}>{phaseInfo.phase}</span>
                <h4 className="font-bold text-sm">{stage.name}</h4>
                {stage.gate && (
                  <span className="badge badge-warning badge-xs gap-0.5">
                    <Lock size={8} /> GATE
                  </span>
                )}
                {stage.duration && (
                  <span className="text-xs text-base-content/40 flex items-center gap-0.5">
                    <Clock size={10} /> {stage.duration}
                  </span>
                )}
              </div>
              <p className="text-xs text-base-content/60 mt-1">{stage.description}</p>

              {/* Pain points indicator */}
              {stage.painPoints && stage.painPoints.length > 0 && !expanded && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle size={10} className="text-error" />
                  <span className="text-xs text-error">{stage.painPoints.length} current problem{stage.painPoints.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {hasDetails && (
              <div className="opacity-40">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </div>

          {/* Expanded details */}
          {expanded && (
            <div className="mt-3 ml-11 space-y-3">
              {/* Pain points */}
              {stage.painPoints && stage.painPoints.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-error flex items-center gap-1">
                    <AlertTriangle size={12} /> Current Problems
                  </p>
                  {stage.painPoints.map((p, i) => (
                    <p key={i} className="text-xs text-error/70 ml-4">• {p}</p>
                  ))}
                </div>
              )}

              {/* Substages */}
              {stage.substages && stage.substages.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-base-content/60">Sub-steps:</p>
                  <div className="space-y-1 ml-2">
                    {stage.substages.map((sub: SubStage) => (
                      <div key={sub.id} className="flex items-center gap-2 text-xs">
                        {sub.gate ? (
                          <Lock size={10} className="text-warning shrink-0" />
                        ) : (
                          <CheckCircle size={10} className="text-success/50 shrink-0" />
                        )}
                        <span className="font-medium">{sub.name}</span>
                        <span className="text-base-content/40">— {sub.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Automation note */}
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
      
      {/* Arrow connector */}
      {!isLast && (
        <div className="flex justify-center py-1">
          <ArrowDown size={16} className="text-base-content/30" />
        </div>
      )}
    </div>
  );
};

export const HiringPipeline: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserPlus size={22} className="text-secondary" />
            Hiring → Deployment Pipeline
          </h2>
          <p className="text-sm text-base-content/60">
            13 stages from "billet opens" to "butt in seat." Gates block progression until cleared.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        <span className="badge badge-error badge-sm">DEMAND</span>
        <span className="badge badge-info badge-sm">RECRUIT</span>
        <span className="badge badge-secondary badge-sm">ONBOARD</span>
        <span className="badge badge-warning badge-sm">CLEAR</span>
        <span className="badge badge-primary badge-sm">VERIFY</span>
        <span className="badge badge-accent badge-sm">TRAIN</span>
        <span className="badge badge-success badge-sm">DEPLOY</span>
        <span className="text-xs text-base-content/40 flex items-center gap-1 ml-2">
          <Lock size={10} /> = Gate (blocks if not passed)
        </span>
      </div>

      {/* Timing summary */}
      <div className="alert bg-base-200">
        <div className="text-sm">
          <span className="font-bold">End-to-end timeline:</span>{' '}
          <span className="text-base-content/70">35-60 days typical — but only if certs are current. A single expired certification can add 2-3 weeks for recertification training.</span>
        </div>
      </div>

      {/* Feeds from */}
      <div className="card bg-primary/10 border border-primary/30">
        <div className="card-body p-3">
          <p className="text-xs font-semibold text-primary">⬇ Fed by: Crew Rotation Gear</p>
          <p className="text-xs text-base-content/60">
            When crew rotation can't find qualified relief in the pool, it triggers a hiring requisition. 
            The requisition includes: position, vessel class, full certification requirements from LEX 2025 matrix, 
            target deployment date and port.
          </p>
        </div>
      </div>

      {/* The Pipeline */}
      <div className="space-y-0">
        {hiringGear.stages.map((stage, i) => (
          <StageCard
            key={stage.id}
            stage={stage}
            index={i}
            isLast={i === hiringGear.stages.length - 1}
          />
        ))}
      </div>

      {/* Feeds into */}
      <div className="card bg-warning/10 border border-warning/30">
        <div className="card-body p-3">
          <p className="text-xs font-semibold text-warning">⬇ Feeds into: Training & Compliance Gate → Crew Rotation</p>
          <p className="text-xs text-base-content/60">
            When all gates pass, crew member enters the relief pool as deployment-ready. 
            Crew Rotation assigns them to the next open billet. Travel is booked. Crew change executes.
            The gear turns.
          </p>
        </div>
      </div>

      <button className="btn btn-ghost btn-sm" onClick={onBack}>
        <ArrowLeft size={16} /> Back to System View
      </button>
    </div>
  );
};
