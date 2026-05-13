import React, { useState } from 'react';
import { Ship, Users, Anchor, MapPin, AlertTriangle, Navigation } from 'lucide-react';
import { vessels, fleetStats } from '../data';
import { Vessel } from '../types';

interface Props {
  onSelectVessel?: (vessel: string | null) => void;
}

const statusColors: Record<string, string> = {
  operational: 'badge-success',
  repositioning: 'badge-info',
  wet_dock: 'badge-warning',
  layup: 'badge-error',
};

const statusLabels: Record<string, string> = {
  operational: 'Operational',
  repositioning: 'Repositioning',
  wet_dock: 'Wet Dock',
  layup: 'Layup',
};

const FleetOverview: React.FC<Props> = ({ onSelectVessel }) => {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  const handleSelect = (name: string) => {
    const next = selectedVessel === name ? null : name;
    setSelectedVessel(next);
    onSelectVessel?.(next);
  };

  const totalUnfilled = vessels.reduce((s, v) => s + v.unfilledBillets, 0);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100">
        <div className="stat">
          <div className="stat-figure text-primary"><Ship size={28} /></div>
          <div className="stat-title">Vessels</div>
          <div className="stat-value text-primary">{fleetStats.vesselCount}</div>
          <div className="stat-desc">Expedition fleet</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-secondary"><Users size={28} /></div>
          <div className="stat-title">Total Crew</div>
          <div className="stat-value text-secondary">{fleetStats.totalCrew}</div>
          <div className="stat-desc">{fleetStats.multiVesselCrew} multi-vessel</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-accent"><Anchor size={28} /></div>
          <div className="stat-title">Multi-Vessel Crew</div>
          <div className="stat-value text-accent">{fleetStats.multiVesselCrew}</div>
          <div className="stat-desc">Serve on 2+ ships</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-info"><MapPin size={28} /></div>
          <div className="stat-title">Ports</div>
          <div className="stat-value text-info">{fleetStats.totalPorts}</div>
          <div className="stat-desc">Across all itineraries</div>
        </div>
      </div>

      {/* Vessel cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vessels.map((v) => (
          <VesselCard
            key={v.name}
            vessel={v}
            selected={selectedVessel === v.name}
            onSelect={() => handleSelect(v.name)}
          />
        ))}
      </div>
    </div>
  );
};

interface VesselCardProps {
  vessel: Vessel;
  selected: boolean;
  onSelect: () => void;
}

const VesselCard: React.FC<VesselCardProps> = ({ vessel, selected, onSelect }) => {
  const v = vessel;
  const fillPct = Math.round((v.currentCrew / v.billetCount) * 100);

  return (
    <div
      onClick={onSelect}
      className={`card bg-base-100 shadow-md cursor-pointer transition-all border-2 ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-base-200 hover:border-primary/40'
      }`}
    >
      <div className="card-body p-4 gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship size={20} className="text-primary" />
            <h3 className="card-title text-lg text-base-content">{v.name}</h3>
            <span className="text-base-content/60 text-sm">({v.shortName})</span>
          </div>
          <span className={`badge ${statusColors[v.status]} badge-sm`}>
            {statusLabels[v.status]}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-4 text-sm text-base-content/60">
          <span className="flex items-center gap-1"><MapPin size={14} /> {v.currentLocation}</span>
          <span className="flex items-center gap-1"><Navigation size={14} /> Next: {v.nextPort}</span>
        </div>

        {/* Crew progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-base-content">Crew: {v.currentCrew} / {v.billetCount}</span>
              <span className="font-semibold text-base-content">{fillPct}%</span>
            </div>
            <progress className="progress progress-primary w-full" value={v.currentCrew} max={v.billetCount} />
          </div>
          {v.unfilledBillets > 0 && (
            <div className="badge badge-warning gap-1">
              <AlertTriangle size={12} />
              {v.unfilledBillets} unfilled
            </div>
          )}
        </div>

        {/* Department breakdown */}
        <div className="grid grid-cols-5 gap-1">
          {v.departments.map((d) => (
            <div key={d.name} className="text-center">
              <div className="text-xs font-medium text-base-content/60 mb-1">{d.name}</div>
              <div className="w-full bg-base-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${d.filled === d.total ? 'bg-success' : 'bg-warning'}`}
                  style={{ width: `${(d.filled / d.total) * 100}%` }}
                />
              </div>
              <div className="text-xs text-base-content/60 mt-0.5">{d.filled}/{d.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FleetOverview;
