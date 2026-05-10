import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { unfilledOverview, currentGaps } from '../data';

const vesselColors: Record<string, string> = {
  quest: 'bg-primary',
  seaBird: 'bg-success',
  seaLion: 'bg-warning',
  venture: 'bg-secondary',
};

const vesselLabels: Record<string, string> = {
  quest: 'Quest',
  seaBird: 'Sea Bird',
  seaLion: 'Sea Lion',
  venture: 'Venture',
};

const vesselKeys = ['quest', 'seaBird', 'seaLion', 'venture'] as const;

const UnfilledBillets: React.FC = () => {
  const maxTotal = Math.max(...unfilledOverview.map((w) => w.total));
  const totalBilletDays = unfilledOverview.reduce((s, w) => s + w.total, 0);

  const lastWeek = unfilledOverview[unfilledOverview.length - 1];
  const prevWeek = unfilledOverview[unfilledOverview.length - 2];
  const trendUp = lastWeek.total > prevWeek.total;

  // Group gaps by vessel
  const groupedGaps: Record<string, typeof currentGaps> = {};
  currentGaps.forEach((g) => {
    if (!groupedGaps[g.vessel]) groupedGaps[g.vessel] = [];
    groupedGaps[g.vessel].push(g);
  });

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="stat bg-base-100 rounded-lg shadow p-4 flex-1 min-w-[160px]">
          <div className="stat-title">Total Billet-Days (14 wks)</div>
          <div className="stat-value text-warning">{totalBilletDays.toLocaleString()}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow p-4 flex-1 min-w-[160px]">
          <div className="stat-title">Latest Week</div>
          <div className="stat-value flex items-center gap-2">
            {lastWeek.total}
            {trendUp
              ? <TrendingUp size={20} className="text-error" />
              : <TrendingDown size={20} className="text-success" />}
          </div>
          <div className="stat-desc">{lastWeek.week}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow p-4 flex-1 min-w-[160px]">
          <div className="stat-title">Current Gaps</div>
          <div className="stat-value text-error">{currentGaps.length}</div>
          <div className="stat-desc">Open positions</div>
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="font-semibold text-base-content mb-4">Unfilled Billet-Days per Week</h3>

        {/* Legend */}
        <div className="flex gap-4 mb-3 text-sm">
          {vesselKeys.map((k) => (
            <span key={k} className="flex items-center gap-1">
              <span className={`w-3 h-3 rounded-sm ${vesselColors[k]}`} />
              <span className="text-base-content/70">{vesselLabels[k]}</span>
            </span>
          ))}
        </div>

        {/* Chart */}
        <div className="flex items-end gap-1 h-48">
          {unfilledOverview.map((w) => {
            const heightPct = (w.total / maxTotal) * 100;
            return (
              <div key={w.week} className="flex-1 flex flex-col items-center group" title={`${w.week}: ${w.total} billet-days`}>
                <div className="text-xs text-base-content/60 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {w.total}
                </div>
                <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${heightPct}%` }}>
                  {vesselKeys.map((k) => {
                    const segPct = w.total > 0 ? (w[k] / w.total) * 100 : 0;
                    return (
                      <div
                        key={k}
                        className={`${vesselColors[k]} w-full transition-all`}
                        style={{ height: `${segPct}%` }}
                        title={`${vesselLabels[k]}: ${w[k]}`}
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] text-base-content/50 mt-1 -rotate-45 origin-top-left whitespace-nowrap">
                  {w.week.split('-')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current gaps table */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="font-semibold text-base-content mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-warning" />
          Current Billet Gaps
        </h3>

        {Object.entries(groupedGaps).map(([vessel, gaps]) => (
          <div key={vessel} className="mb-4">
            <h4 className="text-sm font-semibold text-base-content/80 mb-2 border-b border-base-200 pb-1">{vessel}</h4>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-base-content/60">
                    <th>Position</th>
                    <th>Days Unfilled</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {gaps.map((g, i) => (
                    <tr key={i} className={g.days > 5 ? 'bg-warning/10' : ''}>
                      <td className="text-base-content">{g.position}</td>
                      <td>
                        <span className={`badge badge-sm ${g.days > 5 ? 'badge-warning' : 'badge-ghost'}`}>
                          {g.days}d
                        </span>
                      </td>
                      <td className="text-base-content/60 text-sm">{g.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnfilledBillets;
