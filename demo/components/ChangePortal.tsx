import React, { useState, useMemo } from 'react';
import {
  DollarSign, ArrowUpDown, RefreshCw, XCircle, Plane, Filter,
  TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle,
  ChevronDown, ChevronRight, FileText, Download, Eye, Users, Navigation
} from 'lucide-react';
import { CostEvent, CostEventType, RefundStatus } from '../types';
import { costEvents } from '../data';

type FilterView = 'all' | 'voyage' | 'crew' | 'refunds';
type TimeFilter = 'all' | 'current_voyage' | 'last_30';
type AmountPreset = 'any' | 'under100' | '100to500' | '500to1k' | 'over1k' | 'custom';

const amountPresets: { key: AmountPreset; label: string; min: number; max: number }[] = [
  { key: 'any', label: 'Any Amount', min: 0, max: Infinity },
  { key: 'under100', label: '< $100', min: 0, max: 100 },
  { key: '100to500', label: '$100 – $500', min: 100, max: 500 },
  { key: '500to1k', label: '$500 – $1K', min: 500, max: 1000 },
  { key: 'over1k', label: '$1K+', min: 1000, max: Infinity },
];

const typeConfig: Record<CostEventType, { label: string; color: string; icon: React.ReactNode }> = {
  booking: { label: 'Booking', color: 'badge-info', icon: <Plane size={14} /> },
  change: { label: 'Change', color: 'badge-warning', icon: <ArrowUpDown size={14} /> },
  refund: { label: 'Refund', color: 'badge-success', icon: <RefreshCw size={14} /> },
  cancellation: { label: 'Cancellation', color: 'badge-error', icon: <XCircle size={14} /> },
  rebooking: { label: 'Rebooking', color: 'badge-accent', icon: <Plane size={14} /> },
};

const refundColors: Record<RefundStatus, string> = {
  not_applicable: 'text-base-content/40',
  pending: 'text-warning',
  processing: 'text-info',
  credited: 'text-success',
  denied: 'text-error',
};

function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  if (n < 0) return `-${formatted}`;
  return formatted;
}

interface EventRowProps { event: CostEvent; isExpanded: boolean; onToggle: () => void }

const EventRow: React.FC<EventRowProps> = ({ event, isExpanded, onToggle }) => {
  const tc = typeConfig[event.type];
  return (
    <div className="border border-base-300 rounded-lg mb-2 overflow-hidden">
      <button className="w-full flex items-center gap-3 p-3 hover:bg-base-200 transition-colors text-left" onClick={onToggle}>
        <div className="flex-shrink-0">
          {isExpanded ? <ChevronDown size={14} className="text-base-content/40" /> : <ChevronRight size={14} className="text-base-content/40" />}
        </div>
        <div className="flex-shrink-0">
          <span className={`badge ${tc.color} badge-sm gap-1`}>{tc.icon}{tc.label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">{event.crewMemberName}</span>
          <span className="text-xs text-base-content/50 truncate block">{event.description}</span>
        </div>
        <div className="flex-shrink-0 text-right">
          {event.type === 'cancellation' || event.type === 'refund' ? (
            <span className="text-sm font-mono text-success">{formatCurrency(event.delta)}</span>
          ) : event.delta === 0 ? (
            <span className="text-sm font-mono text-base-content/50">$0.00</span>
          ) : (
            <span className="text-sm font-mono">{formatCurrency(event.delta)}</span>
          )}
        </div>
        <div className="flex-shrink-0 w-20 text-right">
          {event.refundStatus !== 'not_applicable' && (
            <span className={`text-xs font-medium ${refundColors[event.refundStatus]}`}>
              {event.refundStatus === 'pending' && '⏳ Pending'}
              {event.refundStatus === 'processing' && '🔄 Processing'}
              {event.refundStatus === 'credited' && '✅ Credited'}
              {event.refundStatus === 'denied' && '❌ Denied'}
            </span>
          )}
        </div>
        <div className="flex-shrink-0 text-xs text-base-content/40 w-28 text-right">
          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-base-300 bg-base-200/50 p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-base-content/50 uppercase tracking-wide">Voyage</span>
              <p className="font-medium">{event.voyageName}</p>
            </div>
            <div>
              <span className="text-xs text-base-content/50 uppercase tracking-wide">Vendor</span>
              <p className="font-medium">{event.vendor}</p>
            </div>
            <div>
              <span className="text-xs text-base-content/50 uppercase tracking-wide">Flight / PNR</span>
              <p className="font-medium font-mono">{event.flightInfo || '—'}</p>
              {event.pnr && <p className="text-xs text-base-content/50">PNR: {event.pnr}</p>}
            </div>
            <div>
              <span className="text-xs text-base-content/50 uppercase tracking-wide">Approved By</span>
              <p className="font-medium">{event.approvedBy}</p>
              <p className="text-xs text-base-content/50">{event.approvalStatus.replace('_', ' ')}</p>
            </div>
          </div>

          {(event.type === 'change' || event.type === 'cancellation' || event.type === 'refund') && (
            <div className="bg-base-100 rounded-lg p-3">
              <span className="text-xs text-base-content/50 uppercase tracking-wide">Cost Impact</span>
              <div className="flex items-center gap-6 mt-1">
                <div>
                  <span className="text-xs text-base-content/40">Original</span>
                  <p className="font-mono">{formatCurrency(event.originalAmount)}</p>
                </div>
                <span className="text-base-content/30">→</span>
                <div>
                  <span className="text-xs text-base-content/40">New</span>
                  <p className="font-mono">{formatCurrency(event.newAmount)}</p>
                </div>
                <span className="text-base-content/30">=</span>
                <div>
                  <span className="text-xs text-base-content/40">Delta</span>
                  <p className={`font-mono font-bold ${event.delta < 0 ? 'text-success' : event.delta > 0 ? 'text-error' : ''}`}>
                    {event.delta > 0 ? '+' : ''}{formatCurrency(event.delta)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {event.refundStatus !== 'not_applicable' && (
            <div className="bg-base-100 rounded-lg p-3">
              <span className="text-xs text-base-content/50 uppercase tracking-wide">Refund Status</span>
              <div className="flex items-center justify-between mt-1">
                <span className={`font-medium ${refundColors[event.refundStatus]}`}>
                  {event.refundStatus.charAt(0).toUpperCase() + event.refundStatus.slice(1)} — {formatCurrency(event.refundAmount)}
                </span>
                {event.refundStatus === 'pending' && (
                  <span className="text-xs text-base-content/50">Est. 5-7 business days</span>
                )}
              </div>
            </div>
          )}

          <div>
            <span className="text-xs text-base-content/50 uppercase tracking-wide">Reason</span>
            <p className="mt-1">{event.reason}</p>
          </div>

          {event.notes && (
            <div>
              <span className="text-xs text-base-content/50 uppercase tracking-wide">Notes</span>
              <p className="mt-1 text-base-content/70">{event.notes}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button className="btn btn-xs btn-ghost gap-1"><Eye size={12} />View Chain</button>
            <button className="btn btn-xs btn-ghost gap-1"><FileText size={12} />Receipt</button>
            <button className="btn btn-xs btn-ghost gap-1"><Download size={12} />Export</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChangePortal() {
  const [view, setView] = useState<FilterView>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilters, setTypeFilters] = useState<Set<CostEventType>>(new Set(['booking', 'change', 'refund', 'cancellation', 'rebooking']));
  const [amountPreset, setAmountPreset] = useState<AmountPreset>('any');
  const [customMin, setCustomMin] = useState('');
  const [customMax, setCustomMax] = useState('');

  const filtered = useMemo(() => {
    let events = [...costEvents];
    if (timeFilter === 'current_voyage') events = events.filter(e => e.voyageId === 'v1');
    if (timeFilter === 'last_30') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      events = events.filter(e => new Date(e.date) >= cutoff);
    }
    events = events.filter(e => typeFilters.has(e.type));

    // Amount filter
    let minAmt = 0;
    let maxAmt = Infinity;
    if (amountPreset === 'custom') {
      minAmt = customMin ? parseFloat(customMin) : 0;
      maxAmt = customMax ? parseFloat(customMax) : Infinity;
    } else {
      const preset = amountPresets.find(p => p.key === amountPreset);
      if (preset) { minAmt = preset.min; maxAmt = preset.max; }
    }
    if (minAmt > 0 || maxAmt < Infinity) {
      events = events.filter(e => {
        const amt = Math.abs(e.newAmount || e.delta);
        return amt >= minAmt && amt <= maxAmt;
      });
    }

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return events;
  }, [timeFilter, typeFilters, amountPreset, customMin, customMax]);

  const stats = useMemo(() => {
    const all = timeFilter === 'current_voyage' ? costEvents.filter(e => e.voyageId === 'v1') : costEvents;
    const totalBooked = all.filter(e => e.type === 'booking').reduce((s, e) => s + e.newAmount, 0);
    const totalChanges = all.filter(e => e.type === 'change').length;
    const refundsPending = all.filter(e => e.refundStatus === 'pending').reduce((s, e) => s + e.refundAmount, 0);
    const refundsCredited = all.filter(e => e.refundStatus === 'credited').reduce((s, e) => s + e.refundAmount, 0);
    const cancellations = all.filter(e => e.type === 'cancellation').length;
    const netSpend = all.reduce((s, e) => {
      if (e.type === 'booking') return s + e.newAmount;
      if (e.type === 'refund' && e.refundStatus === 'credited') return s - e.refundAmount;
      return s;
    }, 0);
    return { totalBooked, totalChanges, refundsPending, refundsCredited, cancellations, netSpend };
  }, [timeFilter]);

  // Group by voyage
  const byVoyage = useMemo(() => {
    const map = new Map<string, { name: string; events: typeof filtered; total: number }>();
    filtered.forEach(e => {
      if (!map.has(e.voyageId)) map.set(e.voyageId, { name: e.voyageName, events: [], total: 0 });
      const v = map.get(e.voyageId)!;
      v.events.push(e);
      if (e.type === 'booking') v.total += e.newAmount;
      if (e.type === 'refund' && e.refundStatus === 'credited') v.total -= e.refundAmount;
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Group by crew
  const byCrew = useMemo(() => {
    const map = new Map<string, { name: string; events: typeof filtered; total: number }>();
    filtered.forEach(e => {
      if (!map.has(e.crewMemberId)) map.set(e.crewMemberId, { name: e.crewMemberName, events: [], total: 0 });
      const c = map.get(e.crewMemberId)!;
      c.events.push(e);
      if (e.type === 'booking') c.total += e.newAmount;
      if (e.type === 'refund' && e.refundStatus === 'credited') c.total -= e.refundAmount;
    });
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [filtered]);

  // Refunds only
  const refundEvents = useMemo(() => {
    return filtered.filter(e => e.refundStatus !== 'not_applicable');
  }, [filtered]);

  const toggleType = (t: CostEventType) => {
    const next = new Set(typeFilters);
    if (next.has(t)) { if (next.size > 1) next.delete(t); }
    else next.add(t);
    setTypeFilters(next);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-base-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-400" />
              Change & Expense Portal
            </h2>
            <p className="text-xs text-base-content/50 mt-1">
              Kelly's view — All cost events tied to crew, voyage, and reason
            </p>
          </div>
          <button className="btn btn-sm btn-ghost gap-1"><Download size={14} />Export CSV</button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <div className="bg-base-100 rounded-lg p-2 text-center">
            <p className="text-xs text-base-content/50">Booked</p>
            <p className="text-sm font-bold text-info">{formatCurrency(stats.totalBooked)}</p>
          </div>
          <div className="bg-base-100 rounded-lg p-2 text-center">
            <p className="text-xs text-base-content/50">Changes</p>
            <p className="text-sm font-bold text-warning">{stats.totalChanges}</p>
          </div>
          <div className="bg-base-100 rounded-lg p-2 text-center">
            <p className="text-xs text-base-content/50">Cancelled</p>
            <p className="text-sm font-bold text-error">{stats.cancellations}</p>
          </div>
          <div className="bg-base-100 rounded-lg p-2 text-center">
            <p className="text-xs text-base-content/50">Refund Pending</p>
            <p className="text-sm font-bold text-warning">{formatCurrency(stats.refundsPending)}</p>
          </div>
          <div className="bg-base-100 rounded-lg p-2 text-center">
            <p className="text-xs text-base-content/50">Refund Credited</p>
            <p className="text-sm font-bold text-success">{formatCurrency(stats.refundsCredited)}</p>
          </div>
          <div className="bg-base-100 rounded-lg p-2 text-center">
            <p className="text-xs text-base-content/50">Net Spend</p>
            <p className="text-sm font-bold">{formatCurrency(stats.netSpend)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-base-content/40" />
          <span className="text-xs text-base-content/50">View:</span>
        </div>
        {(['all', 'voyage', 'crew', 'refunds'] as FilterView[]).map(v => (
          <button
            key={v}
            className={`btn btn-xs ${view === v ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView(v)}
          >
            {v === 'all' && 'All Events'}
            {v === 'voyage' && <><Navigation size={12} /> By Voyage</>}
            {v === 'crew' && <><Users size={12} /> By Crew</>}
            {v === 'refunds' && <><RefreshCw size={12} /> Refunds</>}
          </button>
        ))}
        <div className="flex-1" />
        <select
          className="select select-xs select-bordered"
          value={timeFilter}
          onChange={e => setTimeFilter(e.target.value as TimeFilter)}
        >
          <option value="all">All Time</option>
          <option value="current_voyage">Current Voyage</option>
          <option value="last_30">Last 30 Days</option>
        </select>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-1">
        {(Object.entries(typeConfig) as [CostEventType, typeof typeConfig.booking][]).map(([key, cfg]) => (
          <button
            key={key}
            className={`badge ${typeFilters.has(key) ? cfg.color : 'badge-ghost opacity-40'} badge-sm gap-1 cursor-pointer`}
            onClick={() => toggleType(key)}
          >
            {cfg.icon}{cfg.label}
          </button>
        ))}
      </div>

      {/* Amount filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <DollarSign size={14} className="text-base-content/40" />
          <span className="text-xs text-base-content/50">Amount:</span>
        </div>
        {amountPresets.map(p => (
          <button
            key={p.key}
            className={`btn btn-xs ${amountPreset === p.key ? 'btn-accent' : 'btn-ghost'}`}
            onClick={() => setAmountPreset(p.key)}
          >
            {p.label}
          </button>
        ))}
        <button
          className={`btn btn-xs ${amountPreset === 'custom' ? 'btn-accent' : 'btn-ghost'}`}
          onClick={() => setAmountPreset('custom')}
        >
          Custom
        </button>
        {amountPreset === 'custom' && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="Min"
              className="input input-xs input-bordered w-20 font-mono"
              value={customMin}
              onChange={e => setCustomMin(e.target.value)}
            />
            <span className="text-xs text-base-content/40">–</span>
            <input
              type="number"
              placeholder="Max"
              className="input input-xs input-bordered w-20 font-mono"
              value={customMax}
              onChange={e => setCustomMax(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Content */}
      {view === 'all' && (
        <div>
          <p className="text-xs text-base-content/50 mb-2">{filtered.length} events — newest first</p>
          {filtered.map(e => (
            <EventRow
              key={e.id}
              event={e}
              isExpanded={expandedId === e.id}
              onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
            />
          ))}
        </div>
      )}

      {view === 'voyage' && (
        <div className="space-y-4">
          {byVoyage.map(([vid, v]) => (
            <div key={vid} className="border border-base-300 rounded-xl overflow-hidden">
              <div className="bg-base-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation size={16} className="text-primary" />
                  <span className="font-medium text-sm">{v.name}</span>
                  <span className="badge badge-sm badge-ghost">{v.events.length} events</span>
                </div>
                <span className="font-mono text-sm font-bold">{formatCurrency(v.total)}</span>
              </div>
              <div className="p-3">
                {v.events.map(e => (
                  <EventRow
                    key={e.id}
                    event={e}
                    isExpanded={expandedId === e.id}
                    onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'crew' && (
        <div className="space-y-4">
          {byCrew.map(([cid, c]) => (
            <div key={cid} className="border border-base-300 rounded-xl overflow-hidden">
              <div className="bg-base-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-secondary" />
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className="badge badge-sm badge-ghost">{c.events.length} events</span>
                </div>
                <span className="font-mono text-sm font-bold">{formatCurrency(c.total)}</span>
              </div>
              <div className="p-3">
                {c.events.map(e => (
                  <EventRow
                    key={e.id}
                    event={e}
                    isExpanded={expandedId === e.id}
                    onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'refunds' && (
        <div>
          <div className="bg-base-200 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <RefreshCw size={16} className="text-success" /> Refund Tracker
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-base-100 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock size={14} className="text-warning" />
                  <span className="text-xs text-base-content/50">Pending</span>
                </div>
                <p className="text-lg font-bold text-warning">
                  {formatCurrency(refundEvents.filter(e => e.refundStatus === 'pending').reduce((s, e) => s + e.refundAmount, 0))}
                </p>
                <p className="text-xs text-base-content/40">
                  {refundEvents.filter(e => e.refundStatus === 'pending').length} refund(s)
                </p>
              </div>
              <div className="bg-base-100 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <AlertTriangle size={14} className="text-info" />
                  <span className="text-xs text-base-content/50">Processing</span>
                </div>
                <p className="text-lg font-bold text-info">
                  {formatCurrency(refundEvents.filter(e => e.refundStatus === 'processing').reduce((s, e) => s + e.refundAmount, 0))}
                </p>
                <p className="text-xs text-base-content/40">
                  {refundEvents.filter(e => e.refundStatus === 'processing').length} refund(s)
                </p>
              </div>
              <div className="bg-base-100 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle size={14} className="text-success" />
                  <span className="text-xs text-base-content/50">Credited</span>
                </div>
                <p className="text-lg font-bold text-success">
                  {formatCurrency(refundEvents.filter(e => e.refundStatus === 'credited').reduce((s, e) => s + e.refundAmount, 0))}
                </p>
                <p className="text-xs text-base-content/40">
                  {refundEvents.filter(e => e.refundStatus === 'credited').length} refund(s)
                </p>
              </div>
            </div>
          </div>
          {refundEvents.map(e => (
            <EventRow
              key={e.id}
              event={e}
              isExpanded={expandedId === e.id}
              onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
            />
          ))}
          {refundEvents.length === 0 && (
            <p className="text-center text-sm text-base-content/40 py-8">No refund events in this time period</p>
          )}
        </div>
      )}

      {/* Footer note */}
      <div className="text-center py-4 border-t border-base-300">
        <p className="text-xs text-base-content/40">
          Every change is tied to a crew member, a voyage, and a reason. No more reconciling emails against credit card statements.
        </p>
      </div>
    </div>
  );
}
