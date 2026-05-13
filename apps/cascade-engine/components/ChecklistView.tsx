import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Clock, Lock, Zap, Bot, User, Filter } from 'lucide-react';
import { DisruptionType, ChecklistItem, GearId } from '../types';
import { disruptions, gearNames } from '../data';

interface Props {
  disruptionId: string;
  onBack: () => void;
  onCascade: () => void;
}

export const ChecklistView: React.FC<Props> = ({ disruptionId, onBack, onCascade }) => {
  const d = disruptions.find(x => x.id === disruptionId)!;
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [filterGear, setFilterGear] = useState<GearId | 'all'>('all');
  const [showAutoOnly, setShowAutoOnly] = useState(false);

  const filteredItems = d.checklist.filter(item => {
    if (filterGear !== 'all' && item.gear !== filterGear) return false;
    if (showAutoOnly && !item.automatable) return false;
    return true;
  });

  const toggleCheck = (id: string) => {
    const item = d.checklist.find(c => c.id === id)!;
    // Check dependencies
    if (item.dependsOn) {
      const unmetDeps = item.dependsOn.filter(depId => !checked.has(depId));
      if (unmetDeps.length > 0) return; // Can't check - deps not met
    }
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const isBlocked = (item: ChecklistItem) => {
    if (!item.dependsOn) return false;
    return item.dependsOn.some(depId => !checked.has(depId));
  };

  const autoCount = d.checklist.filter(c => c.automatable).length;
  const manualCount = d.checklist.length - autoCount;
  const criticalCount = d.checklist.filter(c => c.critical).length;
  const completedCount = checked.size;

  // Unique gears in this checklist
  const gearsInChecklist = Array.from(new Set(d.checklist.map(c => c.gear)));

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div className="text-2xl">{d.icon}</div>
        <div className="flex-1">
          <h2 className="text-lg font-bold">Reconstitution Checklist</h2>
          <p className="text-xs text-base-content/60">{d.name} — {d.checklist.length} actions to restore normal operations</p>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={onCascade}>← Cascade</button>
      </div>

      {/* Stats */}
      <div className="stats stats-horizontal bg-base-200 w-full text-center">
        <div className="stat px-3 py-2">
          <div className="stat-title text-xs">Total Actions</div>
          <div className="stat-value text-lg">{d.checklist.length}</div>
        </div>
        <div className="stat px-3 py-2">
          <div className="stat-title text-xs">Automatable</div>
          <div className="stat-value text-lg text-success">{autoCount}</div>
          <div className="stat-desc text-xs">{Math.round(autoCount / d.checklist.length * 100)}%</div>
        </div>
        <div className="stat px-3 py-2">
          <div className="stat-title text-xs">Manual</div>
          <div className="stat-value text-lg text-warning">{manualCount}</div>
        </div>
        <div className="stat px-3 py-2">
          <div className="stat-title text-xs">Critical</div>
          <div className="stat-value text-lg text-error">{criticalCount}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <progress className="progress progress-success flex-1" value={completedCount} max={d.checklist.length} />
        <span className="text-xs font-mono">{completedCount}/{d.checklist.length}</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter size={12} className="text-base-content/40" />
        <select
          className="select select-bordered select-xs"
          value={filterGear}
          onChange={e => setFilterGear(e.target.value as GearId | 'all')}
        >
          <option value="all">All Gears</option>
          {gearsInChecklist.map(g => (
            <option key={g} value={g}>{gearNames[g].name}</option>
          ))}
        </select>
        <label className="label cursor-pointer gap-1">
          <input
            type="checkbox"
            className="checkbox checkbox-xs checkbox-success"
            checked={showAutoOnly}
            onChange={e => setShowAutoOnly(e.target.checked)}
          />
          <span className="text-xs">Automatable only</span>
        </label>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {filteredItems.map((item) => {
          const isDone = checked.has(item.id);
          const blocked = isBlocked(item);
          const gn = gearNames[item.gear];

          return (
            <div
              key={item.id}
              className={`card border transition-all ${
                isDone ? 'bg-success/10 border-success/30' :
                blocked ? 'bg-base-200 border-base-300 opacity-50' :
                item.critical ? 'bg-base-100 border-error/30' :
                'bg-base-100 border-base-300'
              }`}
            >
              <div className="card-body p-3">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    className={`mt-0.5 shrink-0 ${blocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !blocked && toggleCheck(item.id)}
                    disabled={blocked}
                  >
                    {isDone ? (
                      <CheckCircle2 size={18} className="text-success" />
                    ) : blocked ? (
                      <Lock size={18} className="text-base-content/30" />
                    ) : (
                      <Circle size={18} className="text-base-content/30 hover:text-base-content/60" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`badge ${gn.badgeClass} badge-xs`}>{gn.name}</span>
                      {item.critical && <span className="badge badge-error badge-xs">CRITICAL</span>}
                      {item.automatable ? (
                        <span className="badge badge-success badge-xs gap-0.5"><Bot size={8} /> Auto</span>
                      ) : (
                        <span className="badge badge-ghost badge-xs gap-0.5"><User size={8} /> Manual</span>
                      )}
                    </div>
                    <p className={`text-sm font-medium mt-1 ${isDone ? 'line-through text-base-content/40' : ''}`}>
                      {item.action}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-base-content/50">
                      <span className="flex items-center gap-0.5"><User size={10} /> {item.owner}</span>
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {item.deadline}</span>
                    </div>
                    {item.automationNote && (
                      <div className="mt-1.5 bg-success/10 rounded px-2 py-1 text-xs text-success flex items-start gap-1">
                        <Bot size={10} className="mt-0.5 shrink-0" />
                        {item.automationNote}
                      </div>
                    )}
                    {blocked && item.dependsOn && (
                      <div className="mt-1 text-xs text-warning flex items-center gap-1">
                        <Lock size={10} /> Blocked — complete prerequisite actions first
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary insight */}
      <div className="alert bg-base-200 border border-base-300">
        <Zap size={16} className="text-success" />
        <div>
          <p className="text-xs font-semibold">Automation Coverage: {Math.round(autoCount / d.checklist.length * 100)}%</p>
          <p className="text-xs text-base-content/60">
            {autoCount} actions fire automatically — no human intervention needed. 
            The remaining {manualCount} require judgment calls, but the system generates them, assigns owners, 
            tracks deadlines, and enforces dependency order. Nobody has to remember what to do next.
          </p>
        </div>
      </div>
    </div>
  );
};
