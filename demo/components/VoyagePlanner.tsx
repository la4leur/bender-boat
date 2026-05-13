import React from 'react';
import { Navigation, MapPin, Calendar, Users, Clock, CheckCircle, Anchor } from 'lucide-react';
import { activeVoyage, currentCrew, vessel } from '../data';

export const VoyagePlanner: React.FC<{}> = () => {
  const progress = 45; // Day 3 of ~8 day voyage

  return (
    <div className="space-y-4">
      {/* Active Voyage Card */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Navigation size={18} className="text-info" /> {activeVoyage.name}
            </h3>
            <span className="badge badge-info">Active — Day 3</span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <progress className="progress progress-info w-full h-3" value={progress} max={100} />
            <div className="flex justify-between mt-1 text-xs text-base-content/60">
              <span>{activeVoyage.departure}</span>
              <span className="font-semibold text-info">~288 nm remaining</span>
              <span>{activeVoyage.arrival}</span>
            </div>
          </div>

          {/* Waypoints Timeline */}
          <div className="mt-4">
            <div className="text-xs font-semibold text-base-content/60 mb-2 uppercase tracking-wider">Route Waypoints</div>
            <div className="flex items-center gap-0">
              {activeVoyage.waypoints.map((wp, i) => {
                const passed = i < 2;
                const current = i === 2;
                return (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center min-w-0 flex-1">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passed ? 'bg-success' : current ? 'bg-info animate-pulse' : 'bg-base-300'}`}>
                        {passed && <CheckCircle size={10} className="text-success-content" />}
                        {current && <div className="w-2 h-2 bg-info-content rounded-full" />}
                      </div>
                      <div className="text-xs text-center mt-1 truncate w-full px-1">{wp}</div>
                    </div>
                    {i < activeVoyage.waypoints.length - 1 && (
                      <div className={`flex-0 w-8 h-0.5 ${passed ? 'bg-success' : 'bg-base-300'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Voyage Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-base-200">
          <div className="card-body p-3">
            <div className="text-xs text-base-content/60 uppercase tracking-wider mb-2">Departure</div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary" />
              <div>
                <div className="font-semibold text-sm">{activeVoyage.departure}</div>
                <div className="text-xs text-base-content/60">{activeVoyage.departureDate} at 0600</div>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body p-3">
            <div className="text-xs text-base-content/60 uppercase tracking-wider mb-2">Arrival (ETA)</div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-secondary" />
              <div>
                <div className="font-semibold text-sm">{activeVoyage.arrival}</div>
                <div className="text-xs text-base-content/60">{activeVoyage.arrivalDate} at 1400</div>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body p-3">
            <div className="text-xs text-base-content/60 uppercase tracking-wider mb-2">Distance</div>
            <div className="flex items-center gap-2">
              <Navigation size={14} className="text-info" />
              <div>
                <div className="font-semibold text-sm">{activeVoyage.distance}</div>
                <div className="text-xs text-base-content/60">Avg speed: 10.5 kts</div>
              </div>
            </div>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body p-3">
            <div className="text-xs text-base-content/60 uppercase tracking-wider mb-2">Crew</div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-primary" />
              <div>
                <div className="font-semibold text-sm">{currentCrew.length} aboard</div>
                <div className="text-xs text-base-content/60">All positions filled</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crew Manifest */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Users size={16} className="opacity-60" /> Crew Manifest — This Voyage
          </h3>
          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Dept</th>
                  <th>Watch</th>
                  <th>Credentials</th>
                </tr>
              </thead>
              <tbody>
                {currentCrew.map(c => {
                  const watchAssign = c.position === 'Captain' ? '0800–1200 / 2000–0000'
                    : c.position === 'Chief Mate' ? '0400–0800 / 1600–2000'
                    : c.position === 'Third Mate' ? '0000–0400 / 1200–1600'
                    : c.department === 'Deck' && c.id === 'c4' ? '0400–0800 / 1600–2000'
                    : c.department === 'Deck' && c.id === 'c5' ? '0800–1200 / 2000–0000'
                    : c.department === 'Deck' ? '0000–0400 / 1200–1600'
                    : c.id === 'c7' ? '0800–1200 / 2000–0000'
                    : c.id === 'c8' ? '0400–0800 / 1600–2000'
                    : '0000–0400 / 1200–1600';
                  const allValid = c.credentials.every(cr => cr.status === 'valid');
                  return (
                    <tr key={c.id}>
                      <td className="font-medium">{c.name}</td>
                      <td>{c.position}</td>
                      <td><span className={`badge badge-xs ${c.department === 'Deck' ? 'badge-primary' : 'badge-secondary'}`}>{c.department}</span></td>
                      <td className="font-mono text-xs">{watchAssign}</td>
                      <td>
                        {allValid
                          ? <span className="badge badge-success badge-xs gap-1"><CheckCircle size={10} /> Valid</span>
                          : <span className="badge badge-warning badge-xs">⚠ Review</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sea Time Preview */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Anchor size={16} className="opacity-60" /> Sea Time — Auto-Calculated at Voyage Close
          </h3>
          <div className="text-xs text-base-content/60 mb-3">
            When this voyage is completed, sea time records will be automatically generated for all crew members aboard.
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-base-300 rounded p-2 text-center">
              <div className="text-lg font-bold">8</div>
              <div className="text-xs text-base-content/60">Days (projected)</div>
            </div>
            <div className="bg-base-300 rounded p-2 text-center">
              <div className="text-lg font-bold">Ocean</div>
              <div className="text-xs text-base-content/60">Voyage Type</div>
            </div>
            <div className="bg-base-300 rounded p-2 text-center">
              <div className="text-lg font-bold">9</div>
              <div className="text-xs text-base-content/60">Crew Letters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
