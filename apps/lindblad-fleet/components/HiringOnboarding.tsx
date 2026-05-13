import React, { useState } from 'react';
import {
  pipelineStages, candidates, fragmentedTools, processFailures,
  getPipelineStats, PipelineCandidate, PipelineStage, ProcessFailure,
  FragmentedTool, PipelineStageId, StagePhase
} from '../hiringData';

type SubView = 'pipeline' | 'onboarding' | 'tools' | 'failures';

const phaseColors: Record<StagePhase, string> = {
  hiring: 'bg-blue-100 text-blue-800 border-blue-300',
  onboarding: 'bg-amber-100 text-amber-800 border-amber-300',
  compliance: 'bg-red-100 text-red-800 border-red-300',
};

const phaseLabels: Record<StagePhase, string> = {
  hiring: 'Hiring',
  onboarding: 'Onboarding',
  compliance: 'Compliance Gate',
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  blocked: { label: 'Blocked', color: 'text-red-700', bg: 'bg-red-100' },
  cleared: { label: 'Cleared', color: 'text-blue-700', bg: 'bg-blue-100' },
  rescinded: { label: 'Rescinded', color: 'text-gray-700', bg: 'bg-gray-200' },
  withdrawn: { label: 'Withdrawn', color: 'text-gray-600', bg: 'bg-gray-100' },
};

// ── Pipeline Overview ──

const PipelineView: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<PipelineCandidate | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const stats = getPipelineStats();

  const hiringStages = pipelineStages.filter(s => s.phase === 'hiring');
  const onboardingStages = pipelineStages.filter(s => s.phase === 'onboarding');
  const complianceStages = pipelineStages.filter(s => s.phase === 'compliance');

  const filtered = filterStatus === 'all' ? candidates : candidates.filter(c => c.status === filterStatus);
  const getCandidatesAtStage = (stageId: PipelineStageId) =>
    filtered.filter(c => c.currentStage === stageId);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-base-100 rounded-lg p-3 border border-base-300">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-base-content/60">Total in Pipeline</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div className="text-2xl font-bold text-emerald-700">{stats.active}</div>
          <div className="text-xs text-emerald-600">Active</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="text-2xl font-bold text-red-700">{stats.blocked}</div>
          <div className="text-xs text-red-600">Blocked</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{stats.cleared}</div>
          <div className="text-xs text-blue-600">Gate Cleared</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="text-2xl font-bold text-amber-700">{stats.avgDaysInPipeline}d</div>
          <div className="text-xs text-amber-600">Avg Pipeline Time</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-sm font-medium text-base-content/60">Filter:</span>
        {['all', 'active', 'blocked', 'cleared', 'rescinded'].map(s => (
          <button
            key={s}
            className={`btn btn-xs ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'all' ? 'All' : statusConfig[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Pipeline lanes */}
      {[
        { label: '🔍 Hiring Pipeline', stages: hiringStages, phase: 'hiring' as StagePhase },
        { label: '📋 Onboarding Pipeline', stages: onboardingStages, phase: 'onboarding' as StagePhase },
        { label: '🚧 Compliance Gate', stages: complianceStages, phase: 'compliance' as StagePhase },
      ].map(lane => (
        <div key={lane.label}>
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
            {lane.label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${phaseColors[lane.phase]}`}>
              {lane.stages.reduce((sum, s) => sum + getCandidatesAtStage(s.id).length, 0)} people
            </span>
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {lane.stages.map((stage, i) => {
              const atStage = getCandidatesAtStage(stage.id);
              return (
                <div key={stage.id} className="flex items-stretch gap-0 shrink-0">
                  <div className={`w-36 rounded-lg border p-2 ${phaseColors[lane.phase]} bg-opacity-30`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold">{stage.shortName}</span>
                      <span className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${atStage.length > 0 ? 'bg-base-content text-base-100' : 'bg-base-300 text-base-content/40'}`}>
                        {atStage.length}
                      </span>
                    </div>
                    <div className="text-[10px] text-base-content/50 mb-1">{stage.currentTool}</div>
                    <div className="space-y-1">
                      {atStage.map(c => (
                        <button
                          key={c.id}
                          className={`w-full text-left text-[11px] px-1.5 py-1 rounded border transition-all ${
                            selectedCandidate?.id === c.id ? 'ring-2 ring-primary' : ''
                          } ${
                            c.status === 'blocked' ? 'bg-red-50 border-red-300 text-red-800' :
                            c.status === 'rescinded' ? 'bg-gray-100 border-gray-300 text-gray-500 line-through' :
                            c.status === 'cleared' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                            'bg-white border-base-300 text-base-content'
                          }`}
                          onClick={() => setSelectedCandidate(c)}
                        >
                          <div className="font-medium truncate">{c.name}</div>
                          <div className="text-[9px] opacity-70">{c.targetPosition}</div>
                          {c.isRealExample && <div className="text-[8px] font-bold text-orange-600 mt-0.5">📧 REAL DATA</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                  {i < lane.stages.length - 1 && (
                    <div className="flex items-center px-1 text-base-content/20">→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Candidate detail */}
      {selectedCandidate && (
        <CandidateDetail candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
      )}
    </div>
  );
};

// ── Candidate Detail Panel ──

const CandidateDetail: React.FC<{ candidate: PipelineCandidate; onClose: () => void }> = ({ candidate: c, onClose }) => {
  const stage = pipelineStages.find(s => s.id === c.currentStage);
  const sc = statusConfig[c.status];
  const completedItems = c.checklistItems.filter(i => i.completed).length;
  const totalItems = c.checklistItems.length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="bg-base-100 rounded-xl border border-base-300 p-4 shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{c.name}</h3>
            {c.isRealExample && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300">
                📧 FROM EMAIL DATA
              </span>
            )}
          </div>
          <div className="text-sm text-base-content/60">
            {c.targetPosition} → {c.targetVessel}
            {c.source === 'loi' && ' (LOI Internal)'}
            {c.source === 'rehire' && ' (Rehire)'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
            {sc.label}
          </span>
          <button className="btn btn-ghost btn-xs" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="text-center p-2 bg-base-200 rounded-lg">
          <div className="text-lg font-bold">{c.daysInPipeline}d</div>
          <div className="text-[10px] text-base-content/60">In Pipeline</div>
        </div>
        <div className="text-center p-2 bg-base-200 rounded-lg">
          <div className="text-lg font-bold">{c.daysInCurrentStage}d</div>
          <div className="text-[10px] text-base-content/60">Current Stage</div>
        </div>
        <div className="text-center p-2 bg-base-200 rounded-lg">
          <div className={`text-lg font-bold ${phaseColors[stage?.phase || 'hiring'].split(' ')[1]}`}>
            {stage?.name || '—'}
          </div>
          <div className="text-[10px] text-base-content/60">Stage</div>
        </div>
        <div className="text-center p-2 bg-base-200 rounded-lg">
          <div className="text-lg font-bold">{c.targetEmbarkDate || '—'}</div>
          <div className="text-[10px] text-base-content/60">Target Embark</div>
        </div>
      </div>

      {/* Blockers */}
      {c.blockers.length > 0 && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-xs font-bold text-red-800 mb-1">⛔ Blockers</div>
          {c.blockers.map((b, i) => (
            <div key={i} className="text-sm text-red-700 flex items-start gap-1">
              <span className="shrink-0 mt-0.5">•</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}

      {/* Onboarding Checklist */}
      {c.checklistItems.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold">Onboarding Checklist</span>
            <span className="text-xs text-base-content/60">{completedItems}/{totalItems} ({progress}%)</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all ${progress === 100 ? 'bg-success' : progress > 50 ? 'bg-warning' : 'bg-error'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="space-y-1">
            {c.checklistItems.map(item => (
              <div
                key={item.id}
                className={`flex items-start gap-2 p-2 rounded text-sm ${
                  item.completed ? 'bg-emerald-50' :
                  item.blockedReason ? 'bg-red-50' : 'bg-base-200'
                }`}
              >
                <span className="shrink-0 mt-0.5">
                  {item.completed ? '✅' : item.blockedReason ? '🔴' : '⬜'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${item.completed ? 'line-through text-base-content/40' : ''}`}>
                    {item.task}
                  </div>
                  <div className="text-[10px] text-base-content/50">
                    Current: {item.tool}
                    {item.completedDate && ` • Done: ${item.completedDate}`}
                    {item.dueDate && !item.completed && ` • Due: ${item.dueDate}`}
                  </div>
                  {item.blockedReason && (
                    <div className="text-[11px] text-red-600 mt-0.5">⚠ {item.blockedReason}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="text-sm p-3 bg-base-200 rounded-lg">
        <span className="font-bold text-base-content/70">Notes: </span>
        {c.notes}
      </div>
    </div>
  );
};

// ── Onboarding Tracker (all candidates in onboarding) ──

const OnboardingTracker: React.FC = () => {
  const inOnboarding = candidates.filter(c => {
    const stage = pipelineStages.find(s => s.id === c.currentStage);
    return (stage?.phase === 'onboarding' || stage?.phase === 'compliance') && c.status !== 'rescinded';
  });

  const allItems = inOnboarding.flatMap(c => c.checklistItems);
  const completed = allItems.filter(i => i.completed).length;
  const blocked = allItems.filter(i => i.blockedReason && !i.completed).length;
  const pending = allItems.filter(i => !i.completed && !i.blockedReason).length;

  // Group by vessel
  const byVessel: Record<string, PipelineCandidate[]> = {};
  inOnboarding.forEach(c => {
    if (!byVessel[c.targetVessel]) byVessel[c.targetVessel] = [];
    byVessel[c.targetVessel].push(c);
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-base-100 rounded-lg p-3 border border-base-300">
          <div className="text-2xl font-bold">{inOnboarding.length}</div>
          <div className="text-xs text-base-content/60">In Onboarding</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div className="text-2xl font-bold text-emerald-700">{completed}</div>
          <div className="text-xs text-emerald-600">Tasks Complete</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <div className="text-2xl font-bold text-red-700">{blocked}</div>
          <div className="text-xs text-red-600">Tasks Blocked</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="text-2xl font-bold text-amber-700">{pending}</div>
          <div className="text-xs text-amber-600">Tasks Pending</div>
        </div>
      </div>

      {/* By vessel */}
      {Object.entries(byVessel).map(([vessel, crew]) => (
        <div key={vessel} className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
          <div className="bg-base-200 px-4 py-2 font-bold text-sm flex justify-between">
            <span>🚢 {vessel}</span>
            <span className="text-base-content/60">{crew.length} candidate{crew.length > 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Progress</th>
                  <th>Blockers</th>
                  <th>Target Embark</th>
                  <th>Days Left</th>
                </tr>
              </thead>
              <tbody>
                {crew.map(c => {
                  const completedC = c.checklistItems.filter(i => i.completed).length;
                  const totalC = c.checklistItems.length;
                  const pct = totalC > 0 ? Math.round((completedC / totalC) * 100) : 0;
                  const stage = pipelineStages.find(s => s.id === c.currentStage);
                  const sc = statusConfig[c.status];
                  const daysUntilEmbark = c.targetEmbarkDate
                    ? Math.max(0, Math.round((new Date(c.targetEmbarkDate).getTime() - Date.now()) / 86400000))
                    : null;

                  return (
                    <tr key={c.id} className={c.status === 'blocked' ? 'bg-red-50' : ''}>
                      <td className="font-medium">
                        {c.name}
                        {c.isRealExample && <span className="ml-1 text-[9px] text-orange-600">📧</span>}
                      </td>
                      <td className="text-xs">{c.targetPosition}</td>
                      <td>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="text-xs">{stage?.shortName}</td>
                      <td>
                        {totalC > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-base-300 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${pct === 100 ? 'bg-success' : pct > 50 ? 'bg-warning' : 'bg-error'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px]">{completedC}/{totalC}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-base-content/40">Pre-onboarding</span>
                        )}
                      </td>
                      <td>
                        {c.blockers.length > 0 ? (
                          <div className="text-[10px] text-red-600">
                            {c.blockers.map((b, i) => <div key={i}>⛔ {b}</div>)}
                          </div>
                        ) : (
                          <span className="text-[10px] text-emerald-600">None</span>
                        )}
                      </td>
                      <td className="text-xs">{c.targetEmbarkDate || '—'}</td>
                      <td className={`text-xs font-bold ${daysUntilEmbark !== null && daysUntilEmbark < 14 ? 'text-red-600' : ''}`}>
                        {daysUntilEmbark !== null ? `${daysUntilEmbark}d` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* What feeds to crew changes */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 p-4">
        <h3 className="font-bold text-sm mb-2">🔗 How This Feeds Crew Changes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-xs text-base-content/60 mb-1">Compliance Gate Cleared</div>
            <div className="text-2xl">→</div>
            <div className="text-xs font-bold text-emerald-700">Auto-creates crew change record</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-xs text-base-content/60 mb-1">Crew Change Confirmed</div>
            <div className="text-2xl">→</div>
            <div className="text-xs font-bold text-blue-700">Triggers travel booking (C Teleport)</div>
          </div>
          <div className="bg-white/70 rounded-lg p-3 text-center">
            <div className="text-xs text-base-content/60 mb-1">Travel + Ground Set</div>
            <div className="text-2xl">→</div>
            <div className="text-xs font-bold text-purple-700">Pushes travel packet to crew member</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Tool Fragmentation View ──

const ToolFragmentationView: React.FC = () => {
  const categories = [...new Set(fragmentedTools.map(t => t.category))];

  return (
    <div className="space-y-4">
      {/* Header callout */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="text-center">
          <div className="text-5xl font-black text-red-600 mb-1">{fragmentedTools.length}</div>
          <div className="text-sm font-bold text-red-800">Disconnected tools for a single hire-to-board pipeline</div>
          <div className="text-xs text-red-600 mt-1">Every handoff is an email. Every status check is a different login.</div>
        </div>
      </div>

      {/* Current vs. Ours comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current */}
        <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
          <div className="bg-red-100 px-4 py-2 font-bold text-sm text-red-800">
            ❌ Current State — {fragmentedTools.length} Tools
          </div>
          <div className="p-3 space-y-2">
            {fragmentedTools.map(tool => (
              <div key={tool.name} className="flex items-start gap-2 p-2 bg-base-200 rounded-lg">
                <div className="shrink-0 w-24">
                  <div className="text-xs font-bold">{tool.name}</div>
                  <div className="text-[9px] text-base-content/50">{tool.category}</div>
                </div>
                <div className="flex-1 min-w-0">
                  {tool.issues.map((issue, i) => (
                    <div key={i} className="text-[10px] text-red-600">• {issue}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ours */}
        <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
          <div className="bg-emerald-100 px-4 py-2 font-bold text-sm text-emerald-800">
            ✅ Our Platform — 1 System
          </div>
          <div className="p-3 space-y-2">
            {categories.map(cat => {
              const tools = fragmentedTools.filter(t => t.category === cat);
              const replacements = [...new Set(tools.map(t => t.ourReplacement))];
              return (
                <div key={cat} className="p-2 bg-emerald-50 rounded-lg">
                  <div className="text-xs font-bold text-emerald-800 mb-1">
                    {cat}
                    <span className="font-normal text-base-content/50 ml-2">
                      replaces {tools.map(t => t.name).join(', ')}
                    </span>
                  </div>
                  {replacements.map((r, i) => (
                    <div key={i} className="text-[10px] text-emerald-700">✓ {r}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pipeline flow comparison */}
      <div className="bg-base-100 rounded-xl border border-base-300 p-4">
        <h3 className="font-bold text-sm mb-3">Pipeline Flow — Tool Handoffs</h3>
        <div className="overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max pb-2">
            {pipelineStages.map((stage, i) => (
              <React.Fragment key={stage.id}>
                <div className={`shrink-0 p-2 rounded-lg border text-center ${phaseColors[stage.phase]} min-w-[90px]`}>
                  <div className="text-[10px] font-bold">{stage.shortName}</div>
                  <div className="text-[8px] opacity-70 mt-0.5">{stage.currentTool}</div>
                </div>
                {i < pipelineStages.length - 1 && (
                  <div className="text-base-content/20 shrink-0">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-base-content/50 mt-2">
          Blue = Hiring tools • Amber = Onboarding tools • Red = Compliance tools — each color boundary is a manual handoff between systems
        </div>
      </div>
    </div>
  );
};

// ── Process Failures View ──

const ProcessFailuresView: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <div className="text-3xl font-black text-red-600 mb-1">{processFailures.length} Documented Failures</div>
        <div className="text-sm text-red-700">Real incidents from Lindblad / Standing Tide emails — each one preventable</div>
      </div>

      {processFailures.map(pf => (
        <div
          key={pf.id}
          className={`bg-base-100 rounded-xl border ${expanded === pf.id ? 'border-red-300 shadow-lg' : 'border-base-300'} overflow-hidden transition-all`}
        >
          <button
            className="w-full text-left px-4 py-3 flex items-start justify-between hover:bg-base-200 transition-colors"
            onClick={() => setExpanded(expanded === pf.id ? null : pf.id)}
          >
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                {pf.title}
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">📧 Real Incident</span>
              </div>
              <div className="text-xs text-base-content/60">{pf.person} — {pf.date}</div>
            </div>
            <span className="text-base-content/40">{expanded === pf.id ? '▼' : '▶'}</span>
          </button>

          {expanded === pf.id && (
            <div className="px-4 pb-4 space-y-3">
              <div className="text-sm">{pf.description}</div>
              
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <div className="text-xs font-bold text-red-800 mb-1">Impact</div>
                <div className="text-sm text-red-700">{pf.impact}</div>
              </div>

              {pf.quote && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <div className="text-sm italic text-amber-800">"{pf.quote}"</div>
                  <div className="text-xs text-amber-600 mt-1">— {pf.quoteBy}</div>
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex-1 bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="text-xs font-bold text-red-800 mb-1">Tools Involved</div>
                  <div className="flex flex-wrap gap-1">
                    {pf.toolsInvolved.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex-1 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800 mb-1">Our Prevention</div>
                  <div className="text-sm text-emerald-700">{pf.ourPrevention}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Main Component ──

const HiringOnboarding: React.FC = () => {
  const [subView, setSubView] = useState<SubView>('pipeline');
  const stats = getPipelineStats();

  const subViews: { id: SubView; label: string; badge?: string; badgeColor?: string }[] = [
    { id: 'pipeline', label: 'Pipeline Board' },
    { id: 'onboarding', label: 'Onboarding Tracker', badge: `${stats.blocked} blocked`, badgeColor: 'badge-error' },
    { id: 'tools', label: 'Tool Fragmentation', badge: `${stats.toolCount} tools`, badgeColor: 'badge-warning' },
    { id: 'failures', label: 'Process Failures', badge: `${stats.failureCount}`, badgeColor: 'badge-error' },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex gap-2 flex-wrap">
        {subViews.map(sv => (
          <button
            key={sv.id}
            className={`btn btn-sm ${subView === sv.id ? 'btn-primary' : 'btn-ghost'} gap-2`}
            onClick={() => setSubView(sv.id)}
          >
            {sv.label}
            {sv.badge && (
              <span className={`badge badge-xs ${subView === sv.id ? 'badge-primary-content' : sv.badgeColor || ''}`}>
                {sv.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {subView === 'pipeline' && <PipelineView />}
      {subView === 'onboarding' && <OnboardingTracker />}
      {subView === 'tools' && <ToolFragmentationView />}
      {subView === 'failures' && <ProcessFailuresView />}
    </div>
  );
};

export default HiringOnboarding;
