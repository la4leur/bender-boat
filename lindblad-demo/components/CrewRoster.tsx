import React, { useState, useMemo } from 'react';
import { Search, Users, Anchor, ChevronDown, ChevronUp } from 'lucide-react';
import { crewRoster, fleetStats } from '../data';

const vesselBadge: Record<string, string> = {
  Quest: 'badge-primary',
  'Sea Bird': 'badge-success',
  'Sea Lion': 'badge-warning',
  Venture: 'badge-secondary',
};

const vesselShort: Record<string, string> = {
  Quest: 'QT',
  'Sea Bird': 'SB',
  'Sea Lion': 'SL',
  Venture: 'VE',
};

type SortKey = 'name' | 'vessels' | 'events';
const vesselFilterOpts = ['All', 'Multi-Vessel Only', 'Quest', 'Sea Bird', 'Sea Lion', 'Venture'] as const;

const CrewRoster: React.FC = () => {
  const [search, setSearch] = useState('');
  const [vesselFilter, setVesselFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...crewRoster];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (vesselFilter === 'Multi-Vessel Only') {
      list = list.filter((c) => c.multiVessel);
    } else if (vesselFilter !== 'All') {
      list = list.filter((c) => c.vessels.includes(vesselFilter));
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'vessels') return b.vessels.length - a.vessels.length;
      return b.events.length - a.events.length;
    });

    return list;
  }, [search, vesselFilter, sortBy]);

  const multiCount = filtered.filter((c) => c.multiVessel).length;

  return (
    <div className="space-y-4">
      {/* Stats header */}
      <div className="flex flex-wrap gap-4 items-center text-sm text-base-content/70">
        <span className="flex items-center gap-1"><Users size={16} /> Showing <strong className="text-base-content">{filtered.length}</strong> of {fleetStats.totalCrew} crew</span>
        <span className="flex items-center gap-1"><Anchor size={16} /> <strong className="text-base-content">{multiCount}</strong> multi-vessel</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={16} className="text-base-content/40" />
          <input
            type="text"
            placeholder="Search crew by name…"
            className="grow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <select
          className="select select-bordered select-sm"
          value={vesselFilter}
          onChange={(e) => setVesselFilter(e.target.value)}
        >
          {vesselFilterOpts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        <select
          className="select select-bordered select-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
        >
          <option value="name">Sort: Name</option>
          <option value="vessels">Sort: Vessels</option>
          <option value="events">Sort: Events</option>
        </select>
      </div>

      {/* Crew list */}
      <div className="space-y-2">
        {filtered.map((c) => {
          const isOpen = expanded === c.name;
          return (
            <div key={c.name} className="card bg-base-100 shadow-sm border border-base-200">
              <div
                className="card-body p-3 cursor-pointer"
                onClick={() => setExpanded(isOpen ? null : c.name)}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <span className="font-semibold text-base-content">{c.name}</span>
                    {c.multiVessel && (
                      <span className="badge badge-accent badge-sm ml-2">⚓ Multi</span>
                    )}
                  </div>

                  {/* Vessel badges */}
                  <div className="flex gap-1">
                    {c.vessels.map((v) => (
                      <span key={v} className={`badge badge-sm ${vesselBadge[v] || 'badge-ghost'}`}>
                        {vesselShort[v] || v}
                      </span>
                    ))}
                  </div>

                  {/* Positions */}
                  <div className="flex gap-1 flex-wrap">
                    {c.positions.map((p) => (
                      <span key={p} className="badge badge-outline badge-xs">{p}</span>
                    ))}
                  </div>

                  <span className="text-xs text-base-content/50">{c.events.length} events</span>

                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Expanded timeline */}
              {isOpen && (
                <div className="px-4 pb-3">
                  <div className="overflow-x-auto">
                    <table className="table table-xs">
                      <thead>
                        <tr className="text-base-content/60">
                          <th>Date</th>
                          <th>Type</th>
                          <th>Vessel</th>
                          <th>Position</th>
                          <th>Port</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.events.map((e, i) => (
                          <tr key={i}>
                            <td className="whitespace-nowrap text-base-content/80">{e.date}</td>
                            <td>
                              <span className={`badge badge-xs ${e.type === 'embark' ? 'badge-success' : 'badge-warning'}`}>
                                {e.type === 'embark' ? 'Embark' : 'Disembark'}
                              </span>
                            </td>
                            <td className="text-base-content">{e.vessel}</td>
                            <td className="text-base-content/80">{e.position}</td>
                            <td className="text-base-content/60">{e.port || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CrewRoster;
