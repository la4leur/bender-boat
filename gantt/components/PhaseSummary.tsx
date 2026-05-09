import React from 'react';
import { Clock, Package, Users, Gauge, ArrowRight } from 'lucide-react';
import { Phase } from '../types';
import { tasks, phaseInfo } from '../data';

interface PhaseSummaryProps {
  activePhase: Phase | 'all';
}

export const PhaseSummary: React.FC<PhaseSummaryProps> = ({ activePhase }) => {
  const filtered = activePhase === 'all' ? tasks : tasks.filter(t => t.phase === activePhase);

  const totalWeeks = activePhase === 'all' ? 28 :
    activePhase === 'v1' ? 10 :
    activePhase === 'v1.5' ? 8 : 10;

  const taskCount = filtered.length;
  const avgConfidence = filtered.reduce((sum, t) => sum + t.confidence, 0) / filtered.length;
  const milestoneCount = filtered.filter(t => t.milestone).length;
  const reusableCount = filtered.filter(t => t.referenceFrom).length;

  const categories = Array.from(new Set(filtered.map(t => t.category)));

  const getBadgeClass = () => {
    if (activePhase === 'v1') return 'badge-success';
    if (activePhase === 'v1.5') return 'badge-warning';
    if (activePhase === 'v2') return 'badge-info';
    return 'badge-primary';
  };

  const getConfidenceClass = (avg: number) => {
    if (avg >= 7.5) return 'text-success';
    if (avg >= 6) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
      <div className="bg-base-200 rounded-lg p-3 text-center">
        <Clock size={16} className="mx-auto mb-1 opacity-60" />
        <div className="text-xl font-bold">{totalWeeks}</div>
        <div className="text-xs text-base-content/50">Weeks</div>
      </div>
      <div className="bg-base-200 rounded-lg p-3 text-center">
        <Package size={16} className="mx-auto mb-1 opacity-60" />
        <div className="text-xl font-bold">{taskCount}</div>
        <div className="text-xs text-base-content/50">Tasks</div>
      </div>
      <div className="bg-base-200 rounded-lg p-3 text-center">
        <Gauge size={16} className="mx-auto mb-1 opacity-60" />
        <div className={`text-xl font-bold ${getConfidenceClass(avgConfidence)}`}>{avgConfidence.toFixed(1)}</div>
        <div className="text-xs text-base-content/50">Avg Confidence</div>
      </div>
      <div className="bg-base-200 rounded-lg p-3 text-center">
        <ArrowRight size={16} className="mx-auto mb-1 opacity-60" />
        <div className="text-xl font-bold">{milestoneCount}</div>
        <div className="text-xs text-base-content/50">Milestones</div>
      </div>
      <div className="bg-base-200 rounded-lg p-3 text-center">
        <Users size={16} className="mx-auto mb-1 opacity-60" />
        <div className="text-xl font-bold text-success">{reusableCount}</div>
        <div className="text-xs text-base-content/50">Reuse from Ferry Log</div>
      </div>
    </div>
  );
};
