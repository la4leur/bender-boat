import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, Anchor } from 'lucide-react';
import { Task, Phase } from './types';
import { phaseInfo } from './data';
import { GanttChart } from './components/GanttChart';
import { TaskDetail } from './components/TaskDetail';
import { PhaseSummary } from './components/PhaseSummary';

const phaseFilters: Array<{ key: Phase | 'all'; label: string; badge?: string }> = [
  { key: 'all', label: 'All Phases' },
  { key: 'v1', label: 'V1', badge: 'Wk 1–10' },
  { key: 'v1.5', label: 'V1.5', badge: 'Wk 11–18' },
  { key: 'v2', label: 'V2', badge: 'Wk 19–28' }
];

const App: React.FC<{}> = () => {
  const [activePhase, setActivePhase] = useState<Phase | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getTabClass = (key: Phase | 'all') => {
    if (key === activePhase) {
      if (key === 'v1') return 'tab tab-active text-success';
      if (key === 'v1.5') return 'tab tab-active text-warning';
      if (key === 'v2') return 'tab tab-active text-info';
      return 'tab tab-active';
    }
    return 'tab';
  };

  return (
    <div className="p-4 space-y-4 min-h-screen bg-base-100">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Anchor size={20} className="text-primary" />
          <div>
            <h1 className="text-lg font-bold">Bender Boat — Development Timeline</h1>
            <p className="text-xs text-base-content/50">Ops Normal AI LLC • Jim + Cam • 28 weeks total</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-success inline-block" /> V1 Core
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-warning inline-block" /> V1.5 Logistics
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-info inline-block" /> V2 Engineering
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm rotate-45 bg-accent inline-block" /> Milestone
          </div>
        </div>
      </div>

      {/* Phase tabs */}
      <div className="tabs tabs-boxed bg-base-200 w-fit">
        {phaseFilters.map(f => (
          <a
            key={f.key}
            className={getTabClass(f.key)}
            onClick={() => { setActivePhase(f.key); setSelectedTask(null); }}
          >
            {f.label}
            {f.badge && (
              <span className="badge badge-xs ml-1 badge-ghost">{f.badge}</span>
            )}
          </a>
        ))}
      </div>

      {/* Phase description */}
      {activePhase !== 'all' && phaseInfo[activePhase] && (
        <div className="text-sm text-base-content/60">
          <span className="font-semibold">{phaseInfo[activePhase].label}</span>
          {' — '}{phaseInfo[activePhase].description}
        </div>
      )}

      {/* Summary stats */}
      <PhaseSummary activePhase={activePhase} />

      {/* Gantt chart */}
      <div className="bg-base-200 rounded-lg overflow-hidden">
        <GanttChart
          activePhase={activePhase}
          onSelectTask={setSelectedTask}
          selectedTaskId={selectedTask?.id || null}
        />
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Revenue context footer */}
      <div className="bg-base-200 rounded-lg p-4">
        <h3 className="font-bold text-sm mb-2">Revenue Milestones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-base-300 rounded p-3">
            <div className="text-xs text-base-content/50">V1 Launch (Week 10)</div>
            <div className="font-bold text-success">$1,880/mo + $20/PNR</div>
            <div className="text-xs text-base-content/50">~$26,600/yr · SANSU direct</div>
          </div>
          <div className="bg-base-300 rounded p-3">
            <div className="text-xs text-base-content/50">V1.5 Launch (Week 18)</div>
            <div className="font-bold text-warning">C Teleport Live</div>
            <div className="text-xs text-base-content/50">D-A eliminated · PNR fees automated</div>
          </div>
          <div className="bg-base-300 rounded p-3">
            <div className="text-xs text-base-content/50">V2 Launch (Week 28)</div>
            <div className="font-bold text-info">$3,000/mo + White-Label</div>
            <div className="text-xs text-base-content/50">Lindblad via Standing Tide · ~$146k/yr potential</div>
          </div>
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
