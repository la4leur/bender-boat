import React, { useState, useMemo } from 'react';
import { FileText, Send, Clock, Zap, Mail, Users, AlertTriangle, Ship } from 'lucide-react';
import { vessels, fleetStats, unfilledOverview, recentChanges, currentGaps } from '../data';

const openPositions = [
  { position: 'Engine Mechanic', vessel: 'Venture', status: 'Interviewing', days: 12 },
  { position: 'Seasonal Steward', vessel: 'Venture', status: 'Posted', days: 21 },
  { position: 'Bartender', vessel: 'Sea Bird', status: 'Offer Extended', days: 8 },
  { position: 'Rotational Laundry Steward', vessel: 'Quest', status: 'Screening', days: 5 },
];

const statusBadge = (s: string) =>
  s === 'Offer Extended' ? 'badge-success' : s === 'Interviewing' ? 'badge-info' : s === 'Screening' ? 'badge-warning' : 'badge-ghost';

const WeeklyReport: React.FC = () => {
  const [generated, setGenerated] = useState(false);
  const lw = unfilledOverview[unfilledOverview.length - 1];
  const totalUnfilled = vessels.reduce((s, v) => s + v.unfilledBillets, 0);
  const reportDate = new Date(fleetStats.reportDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const changeSummary = useMemo(() => {
    const r: Record<string, { e: number; d: number }> = {};
    for (const [v, cs] of Object.entries(recentChanges)) {
      const recent = cs.filter((c) => c.date >= '2026-04-25');
      r[v] = { e: recent.filter((c) => c.type === 'embark').length, d: recent.filter((c) => c.type === 'disembark').length };
    }
    return r;
  }, []);

  if (!generated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <FileText size={48} className="text-primary" />
        <h2 className="text-2xl font-bold text-base-content">Weekly Crewing Report</h2>
        <p className="text-base-content/60 max-w-md text-center">
          Generate the same report Samantha Kelley builds manually every Monday — vessel status,
          crew changes, unfilled billets, and open positions — with one click.
        </p>
        <button className="btn btn-primary btn-lg gap-2" onClick={() => setGenerated(true)}>
          <Send size={20} /> Generate Report
        </button>
        <span className="text-base-content/50 text-sm flex items-center gap-2"><Clock size={14} /> Currently takes Sam 4+ hours each Monday</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Email header */}
      <div className="card bg-base-100 shadow border border-base-200 p-4">
        <div className="flex items-center gap-2 mb-2"><Mail size={18} className="text-primary" /><span className="font-bold text-base-content text-lg">Weekly Crewing Report</span></div>
        <div className="grid grid-cols-[60px_1fr] gap-y-1 text-sm text-base-content/80">
          <span className="font-semibold text-base-content/60">From:</span><span>{fleetStats.reportAuthor} &lt;sam.kelley@standingtide.com&gt;</span>
          <span className="font-semibold text-base-content/60">To:</span><span>{fleetStats.distribution.to} recipients</span>
          <span className="font-semibold text-base-content/60">CC:</span><span>{fleetStats.distribution.cc} recipients</span>
          <span className="font-semibold text-base-content/60">Date:</span><span>{reportDate}</span>
          <span className="font-semibold text-base-content/60">Subject:</span><span className="font-medium text-base-content">Shipboard Crewing Update — Week of {lw.week}</span>
        </div>
      </div>

      {/* 1. Fleet Summary */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="font-bold text-base-content flex items-center gap-2 mb-3"><Ship size={18} className="text-primary" /> 1. Fleet Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {vessels.map((v) => (
            <div key={v.name} className="bg-base-200 rounded-lg p-3 text-center">
              <div className="font-semibold text-base-content">{v.name}</div>
              <div className="text-2xl font-bold text-primary">{v.currentCrew}</div>
              <div className="text-xs text-base-content/60">of {v.billetCount} billets • {v.currentLocation}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-base-content/70"><strong>{fleetStats.totalCrew}</strong> crew • <strong>{fleetStats.vesselCount}</strong> vessels • <strong>{fleetStats.multiVesselCrew}</strong> multi-vessel • <strong>{totalUnfilled}</strong> unfilled</p>
      </div>

      {/* 2. Comings & Goings */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="font-bold text-base-content flex items-center gap-2 mb-3"><Users size={18} className="text-secondary" /> 2. Comings &amp; Goings Snapshot</h3>
        <table className="table table-sm">
          <thead><tr className="bg-base-200"><th>Vessel</th><th className="text-center">Embarking</th><th className="text-center">Disembarking</th><th className="text-center">Net</th></tr></thead>
          <tbody>
            {Object.entries(changeSummary).map(([v, c]) => {
              const counts = c as { e: number; d: number };
              return (
                <tr key={v}>
                  <td className="font-medium text-base-content">{v}</td>
                  <td className="text-center"><span className="badge badge-success badge-sm">{counts.e}</span></td>
                  <td className="text-center"><span className="badge badge-warning badge-sm">{counts.d}</span></td>
                  <td className="text-center font-semibold">{counts.e - counts.d >= 0 ? '+' : ''}{counts.e - counts.d}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. Unfilled Billets */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="font-bold text-base-content flex items-center gap-2 mb-3"><AlertTriangle size={18} className="text-warning" /> 3. Unfilled Billets — {lw.week}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {(['quest', 'seaBird', 'seaLion', 'venture'] as const).map((k) => {
            const labels: Record<string, string> = { quest: 'Quest', seaBird: 'Sea Bird', seaLion: 'Sea Lion', venture: 'Venture' };
            return (<div key={k} className="bg-base-200 rounded p-2 text-center"><div className="text-xs text-base-content/60">{labels[k]}</div><div className="text-xl font-bold text-base-content">{lw[k]}</div></div>);
          })}
        </div>
        <p className="text-sm text-base-content/70">Total: <strong>{lw.total}</strong> unfilled billet-days this week</p>
      </div>

      {/* 4. Open Positions */}
      <div className="card bg-base-100 shadow p-4">
        <h3 className="font-bold text-base-content flex items-center gap-2 mb-3"><Users size={18} className="text-info" /> 4. Open Positions &amp; Recruitment</h3>
        <table className="table table-sm">
          <thead><tr className="bg-base-200"><th>Position</th><th>Vessel</th><th>Status</th><th>Days</th></tr></thead>
          <tbody>
            {openPositions.map((p, i) => (
              <tr key={i}><td className="text-base-content">{p.position}</td><td className="text-base-content/80">{p.vessel}</td><td><span className={`badge badge-sm ${statusBadge(p.status)}`}>{p.status}</span></td><td className="text-base-content/70">{p.days}d</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Distribution */}
      <div className="card bg-base-100 shadow p-4 text-sm text-base-content/60">
        <strong>Distribution:</strong> To: {fleetStats.distribution.to} recipients • CC: {fleetStats.distribution.cc} recipients
      </div>

      {/* Comparison callout */}
      <div className="card bg-primary/10 border-2 border-primary shadow-lg p-5">
        <div className="flex items-start gap-4">
          <Zap size={32} className="text-primary flex-shrink-0" />
          <div>
            <h4 className="font-bold text-base-content text-lg mb-2">Manual vs. Automated</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-base-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-base-content/60 mb-1"><Clock size={14} /> Today</div>
                <p className="text-sm text-base-content">Sam builds this manually every Monday. Cross-referencing spreadsheets, chasing updates, formatting. <strong className="text-error">4+ hours.</strong></p>
              </div>
              <div className="bg-base-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-primary mb-1"><Zap size={14} /> With Bender Boat</div>
                <p className="text-sm text-base-content">One button. Same report. Zero assembly. <strong className="text-success">Under 30 seconds.</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-ghost btn-sm" onClick={() => setGenerated(false)}>← Back to Generate</button>
    </div>
  );
};

export default WeeklyReport;
