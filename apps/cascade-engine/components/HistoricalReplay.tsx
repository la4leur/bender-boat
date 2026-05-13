import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Users, Ship, AlertTriangle, Plane, TrendingUp, TrendingDown, Minus, UserPlus, UserMinus, RefreshCw, FileWarning, ChevronDown, ChevronRight } from 'lucide-react';
import { REAL_WEEKS, REAL_DIFFS, POSITION_ANALYSIS, FLEET_SUMMARY, type RealWeekData, type RealDiffData } from '../data';

interface Props {
  onBack: () => void;
  onDisruption: (id: string) => void;
}

export const HistoricalReplay: React.FC<Props> = ({ onBack, onDisruption }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setCurrentWeek(prev => {
        if (prev >= REAL_WEEKS.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [playing]);

  const week = REAL_WEEKS[currentWeek];
  const diff = currentWeek > 0 ? REAL_DIFFS[currentWeek - 1] : null;
  const prevWeek = currentWeek > 0 ? REAL_WEEKS[currentWeek - 1] : null;

  const deltaIcon = (curr: number, prev: number | undefined) => {
    if (prev === undefined) return null;
    const d = curr - prev;
    if (d > 0) return <span className="text-success text-xs ml-1">+{d}</span>;
    if (d < 0) return <span className="text-error text-xs ml-1">{d}</span>;
    return <span className="text-base-content/40 text-xs ml-1">—</span>;
  };

  const toggle = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost btn-xs" onClick={onBack}>
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex-1">
          <h2 className="text-base font-bold">Historical Replay — Real C&G Data</h2>
          <p className="text-xs opacity-60">
            {FLEET_SUMMARY.total_unique_crew} crew · {FLEET_SUMMARY.weeks_analyzed} weeks · {FLEET_SUMMARY.date_range}
          </p>
        </div>
        <div className="badge badge-accent badge-sm">REAL DATA</div>
      </div>

      {/* Timeline scrubber */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-3">
          <div className="flex items-center gap-2">
            <button className="btn btn-xs btn-ghost" onClick={() => { setCurrentWeek(0); setPlaying(false); }}>
              <SkipBack size={12} />
            </button>
            <button className="btn btn-xs btn-primary" onClick={() => setPlaying(!playing)}>
              {playing ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button className="btn btn-xs btn-ghost" onClick={() => setCurrentWeek(Math.min(REAL_WEEKS.length - 1, currentWeek + 1))}>
              <SkipForward size={12} />
            </button>

            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={REAL_WEEKS.length - 1}
                value={currentWeek}
                onChange={e => setCurrentWeek(parseInt(e.target.value))}
                className="range range-xs range-primary"
              />
              <div className="flex justify-between text-[9px] opacity-50 px-1 mt-0.5">
                {REAL_WEEKS.map((w, i) => (
                  <span key={i} className={i === currentWeek ? 'font-bold opacity-100' : ''}>
                    {w.date.slice(5)}
                  </span>
                ))}
              </div>
            </div>

            <span className="text-xs font-mono opacity-60">
              {currentWeek + 1}/{REAL_WEEKS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Current week snapshot */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-3">
          <h3 className="font-bold text-sm mb-2">
            📅 Week of {week.date}
          </h3>

          {/* Fleet stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            <StatCard icon={<Users size={14} />} label="Unique Crew" value={week.uniqueCrew} delta={prevWeek ? week.uniqueCrew - prevWeek.uniqueCrew : undefined} />
            <StatCard icon={<TrendingUp size={14} />} label="Embarks" value={week.embarks} delta={prevWeek ? week.embarks - prevWeek.embarks : undefined} />
            <StatCard icon={<TrendingDown size={14} />} label="Disembarks" value={week.disembarks} delta={prevWeek ? week.disembarks - prevWeek.disembarks : undefined} />
            <StatCard icon={<Plane size={14} />} label="No Flight" value={week.noFlight} delta={prevWeek ? week.noFlight - prevWeek.noFlight : undefined} bad />
            <StatCard icon={<FileWarning size={14} />} label="Positions" value={week.positions} delta={prevWeek ? week.positions - prevWeek.positions : undefined} />
            <StatCard icon={<AlertTriangle size={14} />} label="Unfilled" value={week.gapPositions} delta={prevWeek ? week.gapPositions - prevWeek.gapPositions : undefined} bad />
          </div>

          {/* Per-vessel breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
            {['Quest', 'Venture', 'Sea Bird', 'Sea Lion'].map(vessel => {
              const v = week.perVessel[vessel];
              const pv = prevWeek?.perVessel[vessel];
              if (!v) return null;
              return (
                <div key={vessel} className="bg-base-100 rounded-lg p-2">
                  <div className="text-xs font-bold flex items-center gap-1">
                    <Ship size={10} /> {vessel}
                  </div>
                  <div className="text-[10px] opacity-70 mt-1">
                    <span className="text-success">▲ {v.embarks}</span>
                    {pv && v.embarks !== pv.embarks && (
                      <span className="text-xs opacity-50"> ({v.embarks - pv.embarks > 0 ? '+' : ''}{v.embarks - pv.embarks})</span>
                    )}
                    {' · '}
                    <span className="text-error">▼ {v.disembarks}</span>
                    {pv && v.disembarks !== pv.disembarks && (
                      <span className="text-xs opacity-50"> ({v.disembarks - pv.disembarks > 0 ? '+' : ''}{v.disembarks - pv.disembarks})</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unfilled billets */}
          {week.unfilledSample.length > 0 && (
            <div className="mt-2">
              <button className="text-xs font-bold flex items-center gap-1 cursor-pointer" onClick={() => toggle('unfilled')}>
                {expandedSection === 'unfilled' ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                🔴 Unfilled Billets ({week.gapPositions})
              </button>
              {expandedSection === 'unfilled' && (
                <div className="mt-1 space-y-1">
                  {week.unfilledSample.map((g, i) => (
                    <div key={i} className="flex justify-between items-center bg-error/10 rounded px-2 py-1 text-xs">
                      <span><span className="font-mono">{g.vessel}</span> — {g.position}</span>
                      <span className="badge badge-error badge-xs">{g.gapDays}d gap</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Week-over-week diff */}
      {diff && (
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body p-3">
            <button className="text-sm font-bold flex items-center gap-1 cursor-pointer" onClick={() => setShowDiff(!showDiff)}>
              {showDiff ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <RefreshCw size={14} /> Changes: {diff.from.slice(5)} → {diff.to.slice(5)}
              <span className="badge badge-primary badge-xs ml-1">
                {diff.recordsDelta > 0 ? '+' : ''}{diff.recordsDelta} records
              </span>
            </button>

            {showDiff && (
              <div className="mt-2 space-y-3">
                {/* New crew */}
                {diff.newCrewCount > 0 && (
                  <div>
                    <div className="text-xs font-bold text-success flex items-center gap-1 mb-1">
                      <UserPlus size={12} /> +{diff.newCrewCount} New Crew
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {diff.newCrewSample.map((n, i) => (
                        <span key={i} className="badge badge-success badge-xs badge-outline">{n}</span>
                      ))}
                      {diff.newCrewCount > diff.newCrewSample.length && (
                        <span className="badge badge-ghost badge-xs">+{diff.newCrewCount - diff.newCrewSample.length} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Removed crew */}
                {diff.removedCrewCount > 0 && (
                  <div>
                    <div className="text-xs font-bold text-error flex items-center gap-1 mb-1">
                      <UserMinus size={12} /> -{diff.removedCrewCount} Removed
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {diff.removedCrewSample.map((n, i) => (
                        <span key={i} className="badge badge-error badge-xs badge-outline">{n}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking updates */}
                {diff.bookingChanges > 0 && (
                  <div>
                    <div className="text-xs font-bold text-info flex items-center gap-1 mb-1">
                      <Plane size={12} /> {diff.bookingChanges} Booking Updates
                      <span className="font-normal opacity-60">(Sam's manual work)</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {diff.bookingSample.map((b, i) => (
                        <span key={i} className="badge badge-info badge-xs badge-outline">
                          {b.name}: {b.field} ✓
                        </span>
                      ))}
                      {diff.bookingChanges > diff.bookingSample.length && (
                        <span className="badge badge-ghost badge-xs">+{diff.bookingChanges - diff.bookingSample.length} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Position changes */}
                {diff.positionChanges > 0 && (
                  <div>
                    <div className="text-xs font-bold text-warning flex items-center gap-1 mb-1">
                      <AlertTriangle size={12} /> {diff.positionChanges} Position Changes
                    </div>
                    <div className="space-y-0.5">
                      {diff.positionChangeSample.map((p, i) => (
                        <div key={i} className="text-[10px] bg-warning/10 rounded px-2 py-0.5">
                          <span className="font-medium">{p.name}:</span>{' '}
                          <span className="line-through opacity-50">{p.from}</span> → <span className="font-bold">{p.to}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cascade triggers */}
                <div className="border-t border-base-300 pt-2">
                  <div className="text-xs font-bold mb-1">🔗 Cascades Triggered</div>
                  <div className="flex flex-wrap gap-1">
                    {diff.newCrewCount > 0 && (
                      <button className="badge badge-secondary badge-sm cursor-pointer" onClick={() => onDisruption('unexpected-resignation')}>
                        Hiring pipeline activated →
                      </button>
                    )}
                    {diff.bookingChanges > 5 && (
                      <button className="badge badge-info badge-sm cursor-pointer" onClick={() => onDisruption('missed-flight')}>
                        Travel coordination cascade →
                      </button>
                    )}
                    {diff.positionChanges > 0 && (
                      <button className="badge badge-warning badge-sm cursor-pointer" onClick={() => onDisruption('failed-certification')}>
                        Compliance re-check needed →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fleet trajectory chart (text-based) */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-3">
          <h3 className="text-sm font-bold mb-2">📈 Fleet Trajectory (9 Weeks)</h3>
          <div className="space-y-1.5">
            {REAL_WEEKS.map((w, i) => {
              const maxCrew = Math.max(...REAL_WEEKS.map(wk => wk.uniqueCrew));
              const barWidth = (w.uniqueCrew / maxCrew) * 100;
              const isActive = i === currentWeek;
              return (
                <button
                  key={w.date}
                  className={`flex items-center gap-2 w-full text-left rounded-lg px-2 py-1 transition-all cursor-pointer ${
                    isActive ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-base-300'
                  }`}
                  onClick={() => setCurrentWeek(i)}
                >
                  <span className="text-[10px] font-mono w-10 shrink-0">{w.date.slice(5)}</span>
                  <div className="flex-1 h-3 bg-base-300 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-primary' : 'bg-primary/40'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold w-8 text-right">{w.uniqueCrew}</span>
                  <div className="w-12 text-right">
                    {w.noFlight > 0 && (
                      <span className="text-[9px] text-error">✈{w.noFlight}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Position variant analysis */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-3">
          <button className="text-sm font-bold flex items-center gap-1 cursor-pointer" onClick={() => toggle('positions')}>
            {expandedSection === 'positions' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            ⚠️ Position Naming Chaos — {POSITION_ANALYSIS.totalUnique} Variants
          </button>
          {expandedSection === 'positions' && (
            <div className="mt-2 space-y-2">
              <p className="text-xs opacity-70">
                {POSITION_ANALYSIS.totalUnique} unique position titles for ~25 actual positions.
                {Object.keys(POSITION_ANALYSIS.variantGroups).length} groups have multiple spellings.
                Controlled dropdowns eliminate this instantly.
              </p>

              {/* Typos */}
              <div className="bg-error/10 rounded-lg p-2">
                <div className="text-xs font-bold text-error mb-1">🐛 Typos in Production</div>
                <div className="space-y-0.5 text-xs">
                  <div><code className="text-error">"Enginer Mechanic"</code> — 45 occurrences (should be Engine Mechanic)</div>
                  <div><code className="text-error">"Seassonal Steward"</code> — 1 occurrence (should be Seasonal Steward)</div>
                  <div><code className="text-error">"Shipyard Enginer Mechanic"</code> — 9 occurrences</div>
                </div>
              </div>

              {/* Variant groups sample */}
              <div className="text-xs font-bold">Position Variant Groups:</div>
              {Object.entries(POSITION_ANALYSIS.variantGroups).slice(0, 8).map(([norm, variants]) => (
                <div key={norm} className="bg-warning/10 rounded px-2 py-1 text-xs">
                  <span className="font-bold">{norm}:</span>{' '}
                  {(variants as string[]).map((v, i) => (
                    <span key={i}>
                      {i > 0 && ' · '}
                      <code className="text-warning">{v}</code>
                    </span>
                  ))}
                </div>
              ))}

              <div className="text-xs opacity-60 italic">
                ...and {Object.keys(POSITION_ANALYSIS.variantGroups).length - 8} more variant groups.
                Our system: one dropdown, one source of truth.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back-build explanation */}
      <div className="card bg-accent/10 shadow-sm">
        <div className="card-body p-3">
          <h3 className="text-sm font-bold">🔄 How Back-Build Works</h3>
          <div className="text-xs space-y-2 mt-1">
            <p>
              <strong>Each weekly C&G report is a snapshot.</strong> Diff week N vs. week N+1 = every change event detected automatically.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-base-200 rounded-lg p-2">
                <div className="font-bold text-success">✅ What we detect</div>
                <ul className="mt-1 space-y-0.5">
                  <li>New crew added to schedule</li>
                  <li>Crew removed / departed</li>
                  <li>Position title changes</li>
                  <li>Booking status updates</li>
                  <li>Vessel assignment changes</li>
                  <li>Unfilled billet trends</li>
                </ul>
              </div>
              <div className="bg-base-200 rounded-lg p-2">
                <div className="font-bold text-warning">⚡ Auto-triggers</div>
                <ul className="mt-1 space-y-0.5">
                  <li>Resignation → hiring pipeline</li>
                  <li>No flight booked → travel alert</li>
                  <li>New crew → compliance check</li>
                  <li>Position change → cert review</li>
                  <li>Unfilled billet → urgency flag</li>
                  <li>Vessel schedule → travel cascade</li>
                </ul>
              </div>
              <div className="bg-base-200 rounded-lg p-2">
                <div className="font-bold text-info">📊 9-Week Proof</div>
                <ul className="mt-1 space-y-0.5">
                  <li>{FLEET_SUMMARY.total_unique_crew} unique crew tracked</li>
                  <li>{REAL_DIFFS.reduce((s, d) => s + d.bookingChanges, 0)} booking updates detected</li>
                  <li>{REAL_DIFFS.reduce((s, d) => s + d.newCrewCount, 0)} new crew arrivals</li>
                  <li>{REAL_DIFFS.reduce((s, d) => s + d.positionChanges, 0)} position reassignments</li>
                  <li>0 manual data entry required</li>
                  <li>Feed us spreadsheets, we build history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  delta?: number;
  bad?: boolean;
}> = ({ icon, label, value, delta, bad }) => (
  <div className="bg-base-100 rounded-lg p-2 text-center">
    <div className="flex justify-center opacity-50">{icon}</div>
    <div className={`text-lg font-bold ${bad && value > 0 ? 'text-error' : ''}`}>{value}</div>
    <div className="text-[9px] opacity-60">{label}</div>
    {delta !== undefined && delta !== 0 && (
      <div className={`text-[10px] font-bold ${
        bad ? (delta > 0 ? 'text-error' : 'text-success') : (delta > 0 ? 'text-success' : 'text-error')
      }`}>
        {delta > 0 ? '▲' : '▼'}{Math.abs(delta)}
      </div>
    )}
  </div>
);
