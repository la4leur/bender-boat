import React from 'react';
import { Clock, Sun, Moon, Sunrise, Sunset, Eye, PenLine } from 'lucide-react';
import { watchSchedule } from '../data';

const watchIcons: Record<string, React.ReactNode> = {
  'Mid Watch': <Moon size={14} className="text-info" />,
  'Morning Watch': <Sunrise size={14} className="text-warning" />,
  'Forenoon Watch': <Sun size={14} className="text-warning" />,
  'Afternoon Watch': <Sun size={14} className="text-primary" />,
  'First Dog / Second Dog': <Sunset size={14} className="text-secondary" />,
  'Evening Watch': <Moon size={14} className="text-info" />,
};

export const WatchBoard: React.FC<{}> = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/60">Watch Pattern: <span className="font-semibold text-base-content">4 on / 8 off</span></div>
          <div className="text-sm text-base-content/60">Date: <span className="font-semibold text-base-content">May 12, 2026</span> — Day 3 of Voyage</div>
        </div>
        <div className="badge badge-info gap-1">
          <Eye size={12} /> Current: Morning Watch (0400–0800)
        </div>
      </div>

      {/* 24-hour Watch Rotation */}
      <div className="space-y-2">
        {watchSchedule.map((entry, i) => {
          const isCurrent = entry.time === 'Morning Watch';
          return (
            <div key={i} className={`card ${isCurrent ? 'bg-primary/10 border border-primary/30' : 'bg-base-200'}`}>
              <div className="card-body p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{watchIcons[entry.time]}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">{entry.watch}</span>
                        <span className="text-sm text-base-content/60">{entry.time}</span>
                        {isCurrent && <span className="badge badge-primary badge-xs">ACTIVE</span>}
                      </div>
                      <div className="mt-1">
                        <span className="text-sm font-semibold">{entry.officer}</span>
                        <span className="text-xs text-base-content/60 ml-1">— OOW</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.crew.map((c, j) => (
                          <span key={j} className="badge badge-outline badge-xs">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isCurrent ? (
                      <button className="btn btn-primary btn-xs gap-1"><PenLine size={12} /> Log Entry</button>
                    ) : i < 1 ? (
                      <span className="text-xs text-base-content/40">Signed ✓</span>
                    ) : (
                      <span className="text-xs text-base-content/40">Upcoming</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-base-content/60 mt-1 pl-7">{entry.notes}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Work Hours Summary */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Clock size={16} className="opacity-60" /> Work Hours — Rolling Compliance
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Crew Member</th>
                  <th>Last 24h</th>
                  <th>Last 7 Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Sarah Blackwood (CPT)', h24: '8h', h7d: '48h', ok: true },
                  { name: 'Mike Reeves (C/M)', h24: '8h', h7d: '52h', ok: true },
                  { name: 'Tom Halverson (3/M)', h24: '8h', h7d: '48h', ok: true },
                  { name: 'Rachel Torres (ENG)', h24: '8h', h7d: '50h', ok: true },
                  { name: "Dave O'Brien (ENG)", h24: '8h', h7d: '48h', ok: true },
                  { name: 'Kyle Fischer (ENG)', h24: '8h', h7d: '48h', ok: true },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium">{row.name}</td>
                    <td>{row.h24}</td>
                    <td>{row.h7d}</td>
                    <td>
                      <span className="badge badge-success badge-xs">Compliant</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-base-content/60 mt-2">
            STCW limits: Max 14h in any 24h period • Max 72h in any 7-day period • Min 10h rest in any 24h period
          </div>
        </div>
      </div>
    </div>
  );
};
