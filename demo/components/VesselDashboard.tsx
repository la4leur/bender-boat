import React from 'react';
import { Anchor, Users, Shield, Navigation, MapPin, Ruler, Weight, Radio } from 'lucide-react';
import { vessel, currentCrew, activeVoyage } from '../data';

export const VesselDashboard: React.FC<{}> = () => {
  const deckCrew = currentCrew.filter(c => c.department === 'Deck');
  const engineCrew = currentCrew.filter(c => c.department === 'Engine');
  const expiringCreds = currentCrew.flatMap(c => c.credentials.filter(cr => cr.status === 'expiring_soon'));

  return (
    <div className="space-y-4">
      {/* Vessel Header */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Anchor className="text-primary" size={24} />
                {vessel.name}
              </h2>
              <p className="text-base-content/60 mt-1">{vessel.class} • Flag: {vessel.flag}</p>
            </div>
            <div className="badge badge-success badge-lg gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Underway
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Radio size={14} className="opacity-60" /> <span className="text-base-content/60">Call Sign:</span> {vessel.callSign}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Weight size={14} className="opacity-60" /> <span className="text-base-content/60">GT:</span> {vessel.grossTonnage}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Ruler size={14} className="opacity-60" /> <span className="text-base-content/60">LOA:</span> {vessel.length}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} className="opacity-60" /> <span className="text-base-content/60">Home:</span> {vessel.homePort}
            </div>
          </div>
        </div>
      </div>

      {/* Active Voyage */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Navigation size={18} className="text-info" /> Active Voyage
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-center">
              <div className="text-xs text-base-content/60">FROM</div>
              <div className="font-semibold">{activeVoyage.departure}</div>
              <div className="text-xs text-base-content/60">{activeVoyage.departureDate}</div>
            </div>
            <div className="flex-1 flex items-center gap-1">
              <div className="flex-1 border-t-2 border-dashed border-info" />
              <div className="badge badge-info badge-sm">{activeVoyage.distance}</div>
              <div className="flex-1 border-t-2 border-dashed border-info" />
            </div>
            <div className="text-center">
              <div className="text-xs text-base-content/60">TO</div>
              <div className="font-semibold">{activeVoyage.arrival}</div>
              <div className="text-xs text-base-content/60">{activeVoyage.arrivalDate}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {activeVoyage.waypoints.map((wp, i) => (
              <span key={i} className="badge badge-outline badge-sm">{wp}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-base-200">
          <div className="card-body p-3 text-center">
            <Users size={20} className="mx-auto text-primary opacity-80" />
            <div className="text-2xl font-bold">{currentCrew.length}</div>
            <div className="text-xs text-base-content/60">Crew On Board</div>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body p-3 text-center">
            <Shield size={20} className="mx-auto text-success opacity-80" />
            <div className="text-2xl font-bold">{currentCrew.length - expiringCreds.length}</div>
            <div className="text-xs text-base-content/60">Fully Compliant</div>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body p-3 text-center">
            <Shield size={20} className="mx-auto text-warning opacity-80" />
            <div className="text-2xl font-bold">{expiringCreds.length}</div>
            <div className="text-xs text-base-content/60">Creds Expiring</div>
          </div>
        </div>
      </div>

      {/* Position Roster */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold mb-3">Position Roster</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Deck Department</div>
              {deckCrew.map(c => (
                <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-base-300 last:border-0">
                  <div>
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className="text-xs text-base-content/60 ml-2">{c.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.credentials.some(cr => cr.status === 'expiring_soon') && (
                      <span className="badge badge-warning badge-xs">⚠</span>
                    )}
                    <span className="badge badge-success badge-xs">On Board</span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">Engine Department</div>
              {engineCrew.map(c => (
                <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-base-300 last:border-0">
                  <div>
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className="text-xs text-base-content/60 ml-2">{c.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.credentials.some(cr => cr.status === 'expiring_soon') && (
                      <span className="badge badge-warning badge-xs">⚠</span>
                    )}
                    <span className="badge badge-success badge-xs">On Board</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
