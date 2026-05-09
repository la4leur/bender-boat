import React, { useState } from 'react';
import { ChevronRight, Star, Users, BookOpen, Gauge } from 'lucide-react';
import { Task, Phase } from '../types';
import { tasks, milestones, phaseInfo, TOTAL_WEEKS } from '../data';

interface GanttChartProps {
  activePhase: Phase | 'all';
  onSelectTask: (task: Task) => void;
  selectedTaskId: string | null;
}

export const GanttChart: React.FC<GanttChartProps> = ({ activePhase, onSelectTask, selectedTaskId }) => {
  const filtered = activePhase === 'all' ? tasks : tasks.filter(t => t.phase === activePhase);
  const filteredMilestones = activePhase === 'all' ? milestones : milestones.filter(m => m.phase === activePhase);

  // Group tasks by category
  const categories = Array.from(new Set(filtered.map(t => t.category)));
  const grouped = categories.map(cat => ({
    category: cat,
    tasks: filtered.filter(t => t.category === cat)
  }));

  const weekNumbers = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);

  const getPhaseBarClass = (phase: Phase): string => {
    switch (phase) {
      case 'v1': return 'bg-success';
      case 'v1.5': return 'bg-warning';
      case 'v2': return 'bg-info';
    }
  };

  const getPhaseTextClass = (phase: Phase): string => {
    switch (phase) {
      case 'v1': return 'text-success-content';
      case 'v1.5': return 'text-warning-content';
      case 'v2': return 'text-info-content';
    }
  };

  const getConfidenceColor = (c: number): string => {
    if (c >= 8) return 'text-success';
    if (c >= 6) return 'text-warning';
    return 'text-error';
  };

  // Phase background bands
  const phaseBands = [
    { start: 1, end: 10, phase: 'v1' as Phase },
    { start: 11, end: 18, phase: 'v1.5' as Phase },
    { start: 19, end: 28, phase: 'v2' as Phase }
  ];

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: '1100px' }}>
        {/* Header */}
        <div className="flex border-b border-base-300 sticky top-0 bg-base-100 z-10">
          {/* Task name column */}
          <div className="w-56 shrink-0 p-2 font-bold text-sm text-base-content/60 border-r border-base-300">
            Task
          </div>
          {/* Week columns */}
          <div className="flex-1 flex relative">
            {/* Phase background bands */}
            {phaseBands.map(band => {
              const startPct = ((band.start - 1) / TOTAL_WEEKS) * 100;
              const widthPct = ((band.end - band.start + 1) / TOTAL_WEEKS) * 100;
              return (
                <div
                  key={band.phase}
                  className={`absolute top-0 bottom-0 ${getPhaseBarClass(band.phase)} opacity-5`}
                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                />
              );
            })}
            {weekNumbers.map(w => (
              <div
                key={w}
                className="flex-1 text-center text-xs py-1 border-r border-base-300/30 relative z-[1]"
                style={{ minWidth: '28px' }}
              >
                <span className={`${w === 10 || w === 18 || w === 28 ? 'font-bold text-base-content' : 'text-base-content/40'}`}>
                  {w}
                </span>
              </div>
            ))}
          </div>
          {/* Confidence column */}
          <div className="w-16 shrink-0 p-2 text-center text-xs text-base-content/60 border-l border-base-300">
            <Gauge size={14} className="inline opacity-60" />
          </div>
        </div>

        {/* Milestone row */}
        <div className="flex border-b border-base-300 bg-base-200/50">
          <div className="w-56 shrink-0 p-2 text-xs font-semibold text-base-content/60 flex items-center gap-1">
            <Star size={12} className="text-warning" /> Milestones
          </div>
          <div className="flex-1 relative" style={{ height: '32px' }}>
            {filteredMilestones.map(m => {
              const leftPct = ((m.week - 0.5) / TOTAL_WEEKS) * 100;
              return (
                <div
                  key={m.id}
                  className="absolute top-1 transform -translate-x-1/2 z-[2]"
                  style={{ left: `${leftPct}%` }}
                >
                  <div className="tooltip tooltip-bottom" data-tip={`Week ${m.week}: ${m.label}`}>
                    <div className={`w-5 h-5 rotate-45 ${phaseInfo[m.phase]?.bgColor || 'bg-accent'} border-2 border-base-100 cursor-pointer`} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="w-16 shrink-0" />
        </div>

        {/* Task rows grouped by category */}
        {grouped.map(group => (
          <React.Fragment key={group.category}>
            {/* Category header */}
            <div className="flex border-b border-base-300/50 bg-base-200/30">
              <div className="w-56 shrink-0 px-2 py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-base-content/40">
                  {group.category}
                </span>
              </div>
              <div className="flex-1" />
              <div className="w-16 shrink-0" />
            </div>

            {/* Tasks */}
            {group.tasks.map(task => {
              const isSelected = selectedTaskId === task.id;
              const startPct = ((task.startWeek - 1) / TOTAL_WEEKS) * 100;
              const widthPct = ((task.endWeek - task.startWeek + 1) / TOTAL_WEEKS) * 100;

              return (
                <div
                  key={task.id}
                  className={`flex border-b border-base-300/30 cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-base-200/50'
                  }`}
                  onClick={() => onSelectTask(task)}
                >
                  {/* Task name */}
                  <div className="w-56 shrink-0 px-3 py-2 flex items-center gap-1 border-r border-base-300">
                    <ChevronRight size={12} className={`opacity-40 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    <span className="text-sm truncate">{task.name}</span>
                    {task.milestone && (
                      <Star size={10} className="text-warning shrink-0" />
                    )}
                    {task.referenceFrom && (
                      <BookOpen size={10} className="text-success shrink-0 opacity-60" />
                    )}
                  </div>

                  {/* Gantt bar */}
                  <div className="flex-1 relative py-1.5">
                    <div
                      className={`absolute top-1.5 h-5 rounded-sm ${getPhaseBarClass(task.phase)} flex items-center justify-center overflow-hidden transition-all ${
                        isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-base-100' : ''
                      }`}
                      style={{ left: `${startPct}%`, width: `${widthPct}%`, minWidth: '30px' }}
                    >
                      <span className={`text-[10px] font-semibold ${getPhaseTextClass(task.phase)} truncate px-1`}>
                        {task.endWeek - task.startWeek >= 2 ? `W${task.startWeek}–${task.endWeek}` : `W${task.startWeek}`}
                      </span>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className={`w-16 shrink-0 flex items-center justify-center text-xs font-mono border-l border-base-300 ${getConfidenceColor(task.confidence)}`}>
                    {task.confidence}/10
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
