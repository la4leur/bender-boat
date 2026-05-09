import React, { useState, useMemo } from 'react';
import {
  Search, Plane, Clock, DollarSign, MapPin, Calendar, Shield,
  ChevronDown, ChevronRight, Star, Zap, RefreshCw, ArrowRight,
  CheckCircle, AlertTriangle, Users, Filter, ArrowUpDown, Hotel, Car,
  Truck, Send, Globe
} from 'lucide-react';
import { TravelSearchCriteria, TravelOption, TravelSubTab } from '../types';
import {
  travelSearchScenarios, travelOptionsForLisa,
  travelOptionsForAndy, travelOptionsForDave,
} from '../data';
import GroundLogistics from './GroundLogistics';
import TravelPacketsView from './TravelPackets';
import VisaTracker from './VisaTracker';

type SortBy = 'totalCost' | 'flightCost' | 'travelTime' | 'departure';

const tagConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  best_value: { label: 'Best Value', color: 'badge-success', icon: <Star size={12} /> },
  fastest: { label: 'Fastest', color: 'badge-info', icon: <Zap size={12} /> },
  most_flexible: { label: 'Most Flexible', color: 'badge-accent', icon: <RefreshCw size={12} /> },
  direct: { label: 'Direct', color: 'badge-primary', icon: <Plane size={12} /> },
  budget: { label: 'Budget', color: 'badge-warning', icon: <DollarSign size={12} /> },
  marine: { label: 'Marine Fare', color: 'badge-secondary', icon: <Shield size={12} /> },
};

function formatMins(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}h ${r}m`;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function getOptionsForScenario(id: string): TravelOption[] {
  if (id === 'lisa-chen') return travelOptionsForLisa;
  if (id === 'andy-brooks') return travelOptionsForAndy;
  if (id === 'dave-winters') return travelOptionsForDave;
  return [];
}

function CriteriaCard({ criteria, isSelected, onClick, ...rest }: {
  criteria: TravelSearchCriteria; isSelected: boolean; onClick: () => void; [key: string]: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`card bg-base-100 border-2 transition-all cursor-pointer text-left w-full ${
        isSelected ? 'border-primary shadow-lg' : 'border-base-300 hover:border-primary/30'
      }`}
    >
      <div className="card-body p-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <span className="font-bold text-sm">{criteria.crewMemberName}</span>
        </div>
        <p className="text-xs text-base-content/60">{criteria.position}</p>
        <div className="divider my-1"></div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-start gap-2">
            <Calendar size={12} className="text-base-content/40 mt-0.5 flex-shrink-0" />
            <span>{new Date(criteria.dateRangeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(criteria.dateRangeEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={12} className="text-base-content/40 mt-0.5 flex-shrink-0" />
            <span>{criteria.originAirports.join(', ')} → {criteria.destinationAirports.join(', ')}</span>
          </div>
          <div className="flex items-start gap-2">
            <DollarSign size={12} className="text-base-content/40 mt-0.5 flex-shrink-0" />
            <span>Budget: {criteria.maxBudget ? fmt(criteria.maxBudget) : 'No limit'}</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock size={12} className="text-base-content/40 mt-0.5 flex-shrink-0" />
            <span>{criteria.arriveBy === 'day_before' ? 'Arrive day before' : criteria.arriveBy === 'morning_of' ? 'Arrive morning of' : 'Flexible'}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function OptionCard({ option, isBest, isSelected, onSelect, budget, ...rest }: {
  option: TravelOption; isBest: boolean; isSelected: boolean;
  onSelect: (id: string) => void; budget: number | null; [key: string]: any;
}) {
  const overBudget = budget !== null && option.totalCost > budget;
  return (
    <div className={`card bg-base-100 border-2 transition-all ${
      isSelected ? 'border-success shadow-lg' : isBest ? 'border-primary/40' : 'border-base-300'
    } ${overBudget ? 'opacity-60' : ''}`}>
      <div className="card-body p-4">
        {/* Tags row */}
        <div className="flex flex-wrap gap-1 min-h-[24px]">
          {option.tags.map(tag => {
            const tc = tagConfig[tag];
            return tc ? (
              <span key={tag} className={`badge ${tc.color} badge-xs gap-0.5`}>{tc.icon}{tc.label}</span>
            ) : null;
          })}
          {overBudget && (
            <span className="badge badge-error badge-xs gap-0.5"><AlertTriangle size={10} />Over Budget</span>
          )}
        </div>

        {/* Airline + Flight */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold">{option.airline}</span>
            <span className="text-xs text-base-content/50 ml-2">{option.flightNumbers.join(' → ')}</span>
          </div>
          <span className="text-xs text-base-content/50">{option.fareClass}</span>
        </div>

        {/* Route visualization */}
        <div className="flex items-center gap-3 py-2">
          <div className="text-center">
            <p className="font-mono font-bold text-lg">{option.departTime}</p>
            <p className="text-xs font-medium text-primary">{option.originAirport}</p>
            <p className="text-xs text-base-content/40">{new Date(option.departDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-xs text-base-content/50">{formatMins(option.travelTimeMinutes)}</span>
            <div className="w-full flex items-center gap-1 my-1">
              <div className="flex-1 border-t-2 border-dashed border-base-300"></div>
              {option.stops === 0 ? (
                <Plane size={14} className="text-primary" />
              ) : (
                <div className="badge badge-ghost badge-xs">{option.stops} stop</div>
              )}
              <div className="flex-1 border-t-2 border-dashed border-base-300"></div>
            </div>
            {option.layoverInfo && (
              <span className="text-xs text-base-content/40">{option.layoverInfo}</span>
            )}
          </div>
          <div className="text-center">
            <p className="font-mono font-bold text-lg">{option.arriveTime}</p>
            <p className="text-xs font-medium text-primary">{option.destinationAirport}</p>
            <p className="text-xs text-base-content/40">{new Date(option.arriveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="bg-base-200 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1"><Plane size={10} /> Flight</span>
            <span className="font-mono">{fmt(option.flightCost)}</span>
          </div>
          {option.hotelNeeded && (
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1"><Hotel size={10} /> Hotel (night before)</span>
              <span className="font-mono">{fmt(option.hotelCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1"><Car size={10} /> Ground transport</span>
            <span className="font-mono">{fmt(option.groundTransportCost)}</span>
          </div>
          <div className="divider my-0.5"></div>
          <div className="flex justify-between font-bold text-sm">
            <span>Total Trip Cost</span>
            <span className={`font-mono ${overBudget ? 'text-error' : 'text-success'}`}>{fmt(option.totalCost)}</span>
          </div>
        </div>

        {/* Info badges */}
        <div className="flex gap-1 flex-wrap">
          {option.refundable && <span className="badge badge-outline badge-xs text-success border-success">✓ Refundable</span>}
          {option.marineFare && <span className="badge badge-outline badge-xs text-info border-info">⚓ Marine Fare</span>}
          {!option.hotelNeeded && <span className="badge badge-outline badge-xs">No hotel needed</span>}
        </div>

        {/* Select button */}
        <button
          className={`btn btn-sm mt-1 ${isSelected ? 'btn-success' : 'btn-primary btn-outline'}`}
          onClick={() => onSelect(option.id)}
        >
          {isSelected ? (
            <><CheckCircle size={14} /> Selected</>
          ) : (
            <>Select this option</>
          )}
        </button>
      </div>
    </div>
  );
}

function ComparisonBar({ options, selectedIds }: { options: TravelOption[]; selectedIds: Set<string> }) {
  const selected = options.filter(o => selectedIds.has(o.id));
  if (selected.length === 0) return null;

  const totalFlights = selected.reduce((s, o) => s + o.flightCost, 0);
  const totalHotels = selected.reduce((s, o) => s + o.hotelCost, 0);
  const totalGround = selected.reduce((s, o) => s + o.groundTransportCost, 0);
  const grandTotal = selected.reduce((s, o) => s + o.totalCost, 0);

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
        <CheckCircle size={16} className="text-success" />
        Crew Change Travel Summary — {selected.length} booking{selected.length > 1 ? 's' : ''} selected
      </h4>
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr>
              <th>Crew</th>
              <th>Route</th>
              <th>Flight</th>
              <th>Hotel</th>
              <th>Ground</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {selected.map(o => {
              const scenario = travelSearchScenarios.find(s =>
                getOptionsForScenario(s.crewMemberId).some(opt => opt.id === o.id)
              );
              return (
                <tr key={o.id}>
                  <td className="font-medium">{scenario?.crewMemberName || '—'}</td>
                  <td className="font-mono text-xs">{o.originAirport}→{o.destinationAirport}</td>
                  <td className="font-mono">{fmt(o.flightCost)}</td>
                  <td className="font-mono">{o.hotelCost > 0 ? fmt(o.hotelCost) : '—'}</td>
                  <td className="font-mono">{fmt(o.groundTransportCost)}</td>
                  <td className="font-mono font-bold">{fmt(o.totalCost)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={2}>Total Crew Change Cost</td>
              <td className="font-mono">{fmt(totalFlights)}</td>
              <td className="font-mono">{totalHotels > 0 ? fmt(totalHotels) : '—'}</td>
              <td className="font-mono">{fmt(totalGround)}</td>
              <td className="font-mono text-primary text-base">{fmt(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-base-content/50 mt-2">
        Click "Select" on any option to update. Cost event records will be created in the Change Portal automatically.
      </p>
    </div>
  );
}

function TravelSearch() {
  const [activeScenario, setActiveScenario] = useState<string>(travelSearchScenarios[0].crewMemberId);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortBy>('totalCost');
  const [showDirectOnly, setShowDirectOnly] = useState(false);
  const [showRefundableOnly, setShowRefundableOnly] = useState(false);
  const [showMarineOnly, setShowMarineOnly] = useState(false);
  const [showBudgetOnly, setShowBudgetOnly] = useState(false);

  const scenario = travelSearchScenarios.find(s => s.crewMemberId === activeScenario)!;
  const rawOptions = getOptionsForScenario(activeScenario);

  const filteredOptions = useMemo(() => {
    let opts = [...rawOptions];
    if (showDirectOnly) opts = opts.filter(o => o.stops === 0);
    if (showRefundableOnly) opts = opts.filter(o => o.refundable);
    if (showMarineOnly) opts = opts.filter(o => o.marineFare);
    if (showBudgetOnly && scenario.maxBudget) opts = opts.filter(o => o.totalCost <= scenario.maxBudget!);

    opts.sort((a, b) => {
      switch (sortBy) {
        case 'totalCost': return a.totalCost - b.totalCost;
        case 'flightCost': return a.flightCost - b.flightCost;
        case 'travelTime': return a.travelTimeMinutes - b.travelTimeMinutes;
        case 'departure': return a.departTime.localeCompare(b.departTime);
        default: return 0;
      }
    });
    return opts;
  }, [rawOptions, sortBy, showDirectOnly, showRefundableOnly, showMarineOnly, showBudgetOnly, scenario.maxBudget]);

  const handleSelect = (optionId: string) => {
    setSelectedOptions(prev => {
      const next = new Set(prev);
      // Remove any existing selection for this scenario
      rawOptions.forEach(o => next.delete(o.id));
      if (!prev.has(optionId)) {
        next.add(optionId);
      }
      return next;
    });
  };

  const bestValueId = [...rawOptions].sort((a, b) => a.totalCost - b.totalCost)[0]?.id;

  // Stats
  const cheapest = rawOptions.reduce((m, o) => Math.min(m, o.totalCost), Infinity);
  const most = rawOptions.reduce((m, o) => Math.max(m, o.totalCost), 0);
  const directCount = rawOptions.filter(o => o.stops === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Search size={20} className="text-primary" />
            Travel Planner — Side-by-Side Comparison
          </h2>
          <p className="text-sm text-base-content/60 mt-1">
            Fuzzy date ranges • Multiple airports • Full cost breakdown with hotel & ground transport
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-info/10 px-3 py-2 rounded-lg">
          <Plane size={14} className="text-info" />
          <span>Powered by C Teleport API (post-V1)</span>
        </div>
      </div>

      {/* Crew member selector */}
      <div>
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Users size={16} />
          Upcoming Crew Change — Select crew member to plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {travelSearchScenarios.map(s => (
            <CriteriaCard
              key={s.crewMemberId}
              criteria={s}
              isSelected={activeScenario === s.crewMemberId}
              onClick={() => setActiveScenario(s.crewMemberId)}
            />
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats stats-horizontal bg-base-100 border border-base-300 w-full">
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Options Found</div>
          <div className="stat-value text-lg">{rawOptions.length}</div>
          <div className="stat-desc">{scenario.originAirports.length * scenario.destinationAirports.length} routes searched</div>
        </div>
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Cheapest Total</div>
          <div className="stat-value text-lg text-success">{fmt(cheapest)}</div>
          <div className="stat-desc">incl. hotel & ground</div>
        </div>
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Most Expensive</div>
          <div className="stat-value text-lg">{fmt(most)}</div>
          <div className="stat-desc">{fmt(most - cheapest)} spread</div>
        </div>
        <div className="stat py-3 px-4">
          <div className="stat-title text-xs">Direct Flights</div>
          <div className="stat-value text-lg text-primary">{directCount}</div>
          <div className="stat-desc">of {rawOptions.length} options</div>
        </div>
      </div>

      {/* Filters + Sort */}
      <div className="flex flex-wrap items-center gap-2 bg-base-200 rounded-lg p-3">
        <Filter size={14} className="text-base-content/40" />
        <span className="text-xs text-base-content/50">Filters:</span>
        <label className="label cursor-pointer gap-1 p-0">
          <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" checked={showDirectOnly} onChange={() => setShowDirectOnly(!showDirectOnly)} />
          <span className="text-xs">Direct only</span>
        </label>
        <label className="label cursor-pointer gap-1 p-0">
          <input type="checkbox" className="checkbox checkbox-xs checkbox-accent" checked={showRefundableOnly} onChange={() => setShowRefundableOnly(!showRefundableOnly)} />
          <span className="text-xs">Refundable only</span>
        </label>
        <label className="label cursor-pointer gap-1 p-0">
          <input type="checkbox" className="checkbox checkbox-xs checkbox-info" checked={showMarineOnly} onChange={() => setShowMarineOnly(!showMarineOnly)} />
          <span className="text-xs">Marine fare only</span>
        </label>
        <label className="label cursor-pointer gap-1 p-0">
          <input type="checkbox" className="checkbox checkbox-xs checkbox-success" checked={showBudgetOnly} onChange={() => setShowBudgetOnly(!showBudgetOnly)} />
          <span className="text-xs">Within budget</span>
        </label>
        <div className="divider divider-horizontal mx-1"></div>
        <ArrowUpDown size={14} className="text-base-content/40" />
        <span className="text-xs text-base-content/50">Sort:</span>
        {([
          ['totalCost', 'Total Cost'],
          ['flightCost', 'Flight Only'],
          ['travelTime', 'Travel Time'],
          ['departure', 'Departure'],
        ] as [SortBy, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`btn btn-xs ${sortBy === key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSortBy(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">
            {filteredOptions.length} option{filteredOptions.length !== 1 ? 's' : ''} for {scenario.crewMemberName}
          </h3>
          {filteredOptions.length < rawOptions.length && (
            <span className="text-xs text-base-content/50">
              {rawOptions.length - filteredOptions.length} filtered out
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOptions.map(option => (
            <OptionCard
              key={option.id}
              option={option}
              isBest={option.id === bestValueId}
              isSelected={selectedOptions.has(option.id)}
              onSelect={handleSelect}
              budget={scenario.maxBudget}
            />
          ))}
        </div>
        {filteredOptions.length === 0 && (
          <div className="text-center py-8 text-base-content/40">
            <Search size={32} className="mx-auto mb-2 opacity-40" />
            <p>No options match your filters. Try relaxing the criteria.</p>
          </div>
        )}
      </div>

      {/* Comparison summary */}
      <ComparisonBar options={[...travelOptionsForLisa, ...travelOptionsForAndy, ...travelOptionsForDave]} selectedIds={selectedOptions} />

      {/* Workflow note */}
      <div className="bg-base-200 rounded-lg p-4 text-sm">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <ArrowRight size={16} className="text-primary" /> What happens next
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <div className="badge badge-primary badge-sm">1</div>
            <div>
              <p className="font-medium text-xs">Select options for each crew member</p>
              <p className="text-xs text-base-content/50">Total cost auto-calculated across all bookings</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="badge badge-primary badge-sm">2</div>
            <div>
              <p className="font-medium text-xs">Confirm & book</p>
              <p className="text-xs text-base-content/50">Cost events created in the Change Portal for Kelly</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="badge badge-primary badge-sm">3</div>
            <div>
              <p className="font-medium text-xs">Track & adjust</p>
              <p className="text-xs text-base-content/50">Changes, cancellations, and refunds all linked to this crew change</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const subTabs: { id: TravelSubTab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'search', label: 'Search & Compare', icon: <Search size={14} /> },
  { id: 'logistics', label: 'Ground Logistics', icon: <Truck size={14} /> },
  { id: 'packets', label: 'Travel Packets', icon: <Send size={14} />, badge: '1' },
  { id: 'visas', label: 'Visa Tracker', icon: <Globe size={14} />, badge: '1' },
];

export default function TravelPlanner() {
  const [activeSubTab, setActiveSubTab] = useState<TravelSubTab>('search');

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div className="tabs tabs-boxed bg-base-200 p-1">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            className={`tab tab-sm gap-1.5 ${activeSubTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge && activeSubTab !== tab.id && (
              <span className="badge badge-xs badge-warning">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {activeSubTab === 'search' && <TravelSearch />}
      {activeSubTab === 'logistics' && <GroundLogistics />}
      {activeSubTab === 'packets' && <TravelPacketsView />}
      {activeSubTab === 'visas' && <VisaTracker />}
    </div>
  );
}
