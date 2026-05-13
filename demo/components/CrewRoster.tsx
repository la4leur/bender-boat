import React, { useState } from 'react';
import { User, Shield, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Plane, Phone, Mail } from 'lucide-react';
import { CrewMember } from '../types';
import { currentCrew, reliefCrew } from '../data';

const CredBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'valid') return <span className="badge badge-success badge-xs gap-1"><CheckCircle size={10} /> Valid</span>;
  if (status === 'expiring_soon') return <span className="badge badge-warning badge-xs gap-1"><AlertTriangle size={10} /> Expiring</span>;
  return <span className="badge badge-error badge-xs gap-1"><Clock size={10} /> Expired</span>;
};

const CrewCard: React.FC<{ member: CrewMember; isRelief?: boolean }> = ({ member, isRelief }) => {
  const [expanded, setExpanded] = useState(false);
  const allValid = member.credentials.every(c => c.status === 'valid');

  return (
    <div className="card bg-base-200">
      <div className="card-body p-3">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isRelief ? 'bg-info/20 text-info' : 'bg-primary/20 text-primary'}`}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold text-sm">{member.name}</div>
              <div className="text-xs text-base-content/60">{member.position} • {member.department}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!allValid && <AlertTriangle size={14} className="text-warning" />}
            <span className={`badge badge-sm ${member.status === 'on_board' ? 'badge-success' : member.status === 'available' ? 'badge-info' : 'badge-warning'}`}>
              {member.status === 'on_board' ? 'On Board' : member.status === 'available' ? 'Available' : member.status}
            </span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-base-300 pt-3">
            {/* Contact & Info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1"><Plane size={12} className="opacity-60" /> Home: {member.homeAirport}</div>
              <div className="flex items-center gap-1"><Phone size={12} className="opacity-60" /> {member.phone}</div>
              <div className="flex items-center gap-1"><Mail size={12} className="opacity-60" /> {member.email}</div>
              <div className="flex items-center gap-1"><Clock size={12} className="opacity-60" /> {member.seaDays} sea days</div>
            </div>

            {/* Credentials */}
            <div>
              <div className="text-xs font-semibold mb-1 flex items-center gap-1">
                <Shield size={12} className="opacity-60" /> Credentials
              </div>
              <table className="table table-xs">
                <thead>
                  <tr>
                    <th>Credential</th>
                    <th>Number</th>
                    <th>Expires</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {member.credentials.map((cred, i) => (
                    <tr key={i}>
                      <td className="font-medium">{cred.name}</td>
                      <td className="text-base-content/60">{cred.number}</td>
                      <td className="text-base-content/60">{cred.expiryDate}</td>
                      <td><CredBadge status={cred.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rotation */}
            <div className="text-xs text-base-content/60">
              Rotation: {member.rotationWeeks} weeks on / {member.rotationWeeks} weeks off
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CrewRoster: React.FC<{}> = () => {
  const [filter, setFilter] = useState<'all' | 'onboard' | 'relief'>('all');

  const displayed = filter === 'onboard' ? currentCrew
    : filter === 'relief' ? reliefCrew
    : [...currentCrew, ...reliefCrew];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')}>
          All Crew ({currentCrew.length + reliefCrew.length})
        </button>
        <button className={`btn btn-sm ${filter === 'onboard' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('onboard')}>
          On Board ({currentCrew.length})
        </button>
        <button className={`btn btn-sm ${filter === 'relief' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('relief')}>
          Relief Pool ({reliefCrew.length})
        </button>
      </div>

      <div className="space-y-2">
        {displayed.map(member => (
          <CrewCard key={member.id} member={member} isRelief={reliefCrew.includes(member)} />
        ))}
      </div>
    </div>
  );
};
