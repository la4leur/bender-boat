import React from 'react';
import { Calendar, Users, GitBranch, BookOpen, Gauge, ArrowRight, X } from 'lucide-react';
import { Task, Phase } from '../types';
import { tasks, phaseInfo } from '../data';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose }) => {
  const deps = task.dependencies?.map(depId => tasks.find(t => t.id === depId)).filter(Boolean) || [];
  const dependents = tasks.filter(t => t.dependencies?.includes(task.id));
  const phase = phaseInfo[task.phase];
  const duration = task.endWeek - task.startWeek + 1;

  const getConfidenceBadge = (c: number) => {
    if (c >= 8) return 'badge-success';
    if (c >= 6) return 'badge-warning';
    return 'badge-error';
  };

  const getConfidenceLabel = (c: number) => {
    if (c >= 9) return 'High — proven pattern';
    if (c >= 8) return 'High — well understood';
    if (c >= 7) return 'Solid — manageable complexity';
    if (c >= 6) return 'Moderate — some unknowns';
    if (c >= 5) return 'Moderate — new territory';
    return 'Lower — significant unknowns';
  };

  const getPhaseBadge = (p: Phase) => {
    switch (p) {
      case 'v1': return 'badge-success';
      case 'v1.5': return 'badge-warning';
      case 'v2': return 'badge-info';
    }
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg">{task.name}</h3>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className={`badge badge-sm ${getPhaseBadge(task.phase)}`}>
              {phase?.label}
            </span>
            <span className="badge badge-sm badge-outline">
              {task.category}
            </span>
            {task.milestone && (
              <span className="badge badge-sm badge-accent">🏁 Milestone</span>
            )}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-base-content/70">{task.description}</p>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-base-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-base-content/50 mb-1">
            <Calendar size={12} /> Timeline
          </div>
          <div className="text-sm font-semibold">
            Week {task.startWeek} → Week {task.endWeek}
          </div>
          <div className="text-xs text-base-content/50">{duration} week{duration > 1 ? 's' : ''}</div>
        </div>

        <div className="bg-base-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-base-content/50 mb-1">
            <Gauge size={12} /> Confidence
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge badge-sm ${getConfidenceBadge(task.confidence)}`}>
              {task.confidence}/10
            </span>
          </div>
          <div className="text-xs text-base-content/50 mt-0.5">{getConfidenceLabel(task.confidence)}</div>
        </div>

        <div className="bg-base-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-base-content/50 mb-1">
            <Users size={12} /> Team
          </div>
          <div className="text-sm font-semibold">{task.team || 'TBD'}</div>
        </div>

        {task.referenceFrom && (
          <div className="bg-base-300 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-base-content/50 mb-1">
              <BookOpen size={12} /> Reference Build
            </div>
            <div className="text-sm font-semibold text-success">{task.referenceFrom}</div>
            <div className="text-xs text-base-content/50">Code reuse available</div>
          </div>
        )}
      </div>

      {/* Dependencies */}
      {deps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-xs text-base-content/50 mb-2">
            <GitBranch size={12} /> Depends On
          </div>
          <div className="flex flex-wrap gap-1">
            {deps.map(dep => dep && (
              <span key={dep.id} className="badge badge-sm badge-outline gap-1">
                {dep.name}
                <span className="text-base-content/40">W{dep.endWeek}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dependents */}
      {dependents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-xs text-base-content/50 mb-2">
            <ArrowRight size={12} /> Blocks
          </div>
          <div className="flex flex-wrap gap-1">
            {dependents.map(dep => (
              <span key={dep.id} className="badge badge-sm badge-outline gap-1">
                {dep.name}
                <span className="text-base-content/40">W{dep.startWeek}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Milestone info */}
      {task.milestone && task.milestoneLabel && (
        <div className="alert">
          <span className="text-lg">🏁</span>
          <span className="font-semibold">{task.milestoneLabel}</span>
        </div>
      )}
    </div>
  );
};
