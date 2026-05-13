import React, { useState, useMemo } from 'react';
import { ArrowLeftRight, Plane, Hotel, FileCheck, Check, X } from 'lucide-react';
import { recentChanges } from '../data';
import { CrewChange } from '../types';

const vesselTabs = ['All', 'Quest', 'Sea Bird', 'Sea Lion', 'Venture'] as const;
const typeTabs = ['All', 'Embarking', 'Disembarking'] as const;

const CrewChanges: React.FC = () => {
  const [vesselFilter, setVesselFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Flatten changes with vessel label
  const allChanges = useMemo(() => {
    const flat: (CrewChange & { vessel: string })[] = [];
    for (const [vessel, changes] of Object.entries(recentChanges)) {
      for (const c of changes) {
        flat.push({ ...c, vessel });
      }
    }
    return flat.sort((a, b) => b.date.localeCompare(a.date));
  }, []);

  // Detect inter-vessel crew (name appears on multiple vessels)
  const multiVesselNames = useMemo(() => {
    const nameVessels: Record<string, Set<string>> = {};
    allChanges.forEach((c) => {
      if (!nameVessels[c.name]) nameVessels[c.name] = new Set();
      nameVessels[c.name].add(c.vessel);
    });
    const result = new Set<string>();
    Object.entries(nameVessels).forEach(([name, vs]) => {
      if (vs.size > 1) result.add(name);
    });
    return result;
  }, [allChanges]);

  const filtered = useMemo(() => {
    return allChanges.filter((c) => {
      if (vesselFilter !== 'All' && c.vessel !== vesselFilter) return false;
      if (typeFilter === 'Embarking' && c.type !== 'embark') return false;
      if (typeFilter === 'Disembarking' && c.type !== 'disembark') return false;
      return true;
    });
  }, [allChanges, vesselFilter, typeFilter]);

  const BoolIcon: React.FC<{ val: boolean | null | undefined }> = ({ val }) => {
    if (val === null || val === undefined) return <span className="text-base-content/30">—</span>;
    return val
      ? <Check size={16} className="text-success" />
      : <X size={16} className="text-error" />;
  };

  return (
    <div className="space-y-4">
      {/* Vessel tabs */}
      <div className="flex flex-wrap gap-2">
        {vesselTabs.map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${vesselFilter === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setVesselFilter(t)}
          >{t}</button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex gap-2">
        {typeTabs.map((t) => (
          <button
            key={t}
            className={`btn btn-xs ${typeFilter === t ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setTypeFilter(t)}
          >{t}</button>
        ))}
        <span className="text-sm text-base-content/60 ml-auto">{filtered.length} changes</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-base-200">
        <table className="table table-sm table-zebra">
          <thead>
            <tr className="bg-base-200">
              <th>Date</th>
              <th>Vessel</th>
              <th>Name</th>
              <th>Position</th>
              <th>Type</th>
              <th className="text-center"><Plane size={14} /></th>
              <th className="text-center"><Hotel size={14} /></th>
              <th className="text-center"><FileCheck size={14} /></th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={`${c.date}-${c.name}-${c.vessel}-${i}`} className="hover">
                <td className="text-base-content/80 whitespace-nowrap">{c.date}</td>
                <td className="font-medium text-base-content">{c.vessel}</td>
                <td className="text-base-content">
                  {c.name}
                  {multiVesselNames.has(c.name) && (
                    <span className="badge badge-outline badge-xs ml-1" title="Inter-vessel crew">↔ Transfer</span>
                  )}
                </td>
                <td className="text-base-content/80">{c.position}</td>
                <td>
                  <span className={`badge badge-sm ${c.type === 'embark' ? 'badge-success' : 'badge-warning'}`}>
                    {c.type === 'embark' ? 'Embark' : 'Disembark'}
                  </span>
                </td>
                <td className="text-center"><BoolIcon val={c.flightBooked} /></td>
                <td className="text-center"><BoolIcon val={c.hotelBooked} /></td>
                <td className="text-center"><BoolIcon val={c.visa} /></td>
                <td className="text-base-content/60 text-xs max-w-[200px] truncate">{c.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CrewChanges;
