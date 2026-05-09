import React, { useState } from 'react';
import { User, Shield, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Plane, Phone, Mail, FlaskConical, Activity } from 'lucide-react';
import { CrewMember, DAComplianceStatus } from '../types';
import { currentCrew, reliefCrew } from '../data';

const CredBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'valid') return <span className="badge badge-success badge-xs gap-1"><CheckCircle size={10} /> Valid</span>;
  if (status === 'expiring_soon') return <span className="badge badge-warning badge-xs gap-1"><AlertTriangle size={10} /> Expiring</span>;
  return <span className="badge badge-error badge-xs gap-1"><Clock size={10} /> Expired</span>;
};

const DAStatusBadge: React.FC<{ status: DAComplianceStatus }> = ({ status }) => {
  switch (status) {
    case 'compliant':
      return <span className="badge badge-success badge-sm gap-1"><CheckCircle size={10} /> Compliant</span>;
    case 'due_soon':
      return <span className="badge badge-warning badge-sm gap-1"><AlertTriangle size={10} /> Due Soon</span>;
    case 'pending_result':
      return <span className="badge badge-info badge-sm gap-1"><Clock size={10} /> Pending Result</span>;
    case 'overdue':
      return <span className="badge badge-error badge-sm gap-1"><AlertTriangle size={10} /> Overdue</span>;
    case 'failed':
      return <span className="badge badge-error badge-sm gap-1"><AlertTriangle size={10} /> Failed</span>;
    case 'not_enrolled':
      return <span className="badge badge-ghost badge-sm gap-1">Not Enrolled</span>;
    default:
      return null;
  }
};

const DAComplianceSection: React.FC<{ member: CrewMember }> = ({ member }) => {
  const [showHistory, setShowHistory] = useState(false);
  const da = member.daCompliance;
  if (!da) return null;

  return (
    <div>
      <div className="text-xs font-semibold mb-1 flex items-center gap-1">
        <FlaskConical size={12} className="opacity-60" /> D&A Compliance
      </div>
      <div className="bg-base-300 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <DAStatusBadge status={da.status} />
          <span className="text-xs text-base-content/50">Consortium: {da.consortiumName} ({da.consortiumId})</span>
        </div>

        {da.status === 'pending_result' && (
          <div className="text-xs text-info font-medium bg-info/10 rounded px-2 py-1">
            ⏳ Awaiting MRO clearance — specimen collected {da.lastRandomDate}
          </div>
        )}
        {da.status === 'due_soon' && (
          <div className="text-xs text-warning font-medium bg-warning/10 rounded px-2 py-1">
            ⚠️ Random test due — last random was {da.lastRandomDate}
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div><span className="text-base-content/50">Last Random:</span> {da.lastRandomDate || 'N/A'}</div>
          <div><span className="text-base-content/50">Result:</span> {da.lastRandomResult === 'negative' ? '✅ Negative' : da.lastRandomResult === 'pending' ? '⏳ Pending' : da.lastRandomResult || 'N/A'}</div>
          <div><span className="text-base-content/50">Pre-Employment:</span> {da.preEmploymentDate}</div>
          <div><span className="text-base-content/50">Result:</span> {da.preEmploymentResult === 'negative' ? '✅ Negative' : da.preEmploymentResult}</div>
          {da.nextEligibleDate && (
            <>
              <div><span className="text-base-content/50">Next Eligible:</span> {da.nextEligibleDate}</div>
              <div></div>
            </>
          )}
        </div>

        {/* Collapsible Test History */}
        <div>
          <button
            className="text-xs text-base-content/50 hover:text-base-content flex items-center gap-1"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Activity size={10} />
            Test History ({da.testHistory.length})
            {showHistory ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
          {showHistory && (
            <table className="table table-xs mt-1">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Result</th>
                  <th>MRO</th>
                </tr>
              </thead>
              <tbody>
                {da.testHistory.slice().reverse().map((test) => (
                  <tr key={test.id}>
                    <td>{test.testDate}</td>
                    <td className="capitalize">{test.testType.replace('_', ' ')}</td>
                    <td>
                      {test.result === 'negative' ? (
                        <span className="text-success">Negative</span>
                      ) : test.result === 'pending' ? (
                        <span className="text-info">Pending</span>
                      ) : test.result === 'positive' ? (
                        <span className="text-error">Positive</span>
                      ) : (
                        <span className="text-base-content/50">Cancelled</span>
                      )}
                    </td>
                    <td>
                      {test.mroCleared ? (
                        <CheckCircle size={12} className="text-success" />
                      ) : (
                        <Clock size={12} className="text-info" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
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
            {member.daCompliance && member.daCompliance.status === 'pending_result' && (
              <span className="badge badge-info badge-xs">D&A ⏳</span>
            )}
            {member.daCompliance && member.daCompliance.status === 'due_soon' && (
              <span className="badge badge-warning badge-xs">D&A ⚠️</span>
            )}
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

            {/* D&A Compliance */}
            <DAComplianceSection member={member} />

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

const DAFleetSummary: React.FC<{ crew: CrewMember[] }> = ({ crew }) => {
  const enrolled = crew.filter(c => c.daCompliance);
  const compliant = enrolled.filter(c => c.daCompliance!.status === 'compliant').length;
  const dueSoon = enrolled.filter(c => c.daCompliance!.status === 'due_soon').length;
  const pendingResult = enrolled.filter(c => c.daCompliance!.status === 'pending_result').length;
  const overdue = enrolled.filter(c => c.daCompliance!.status === 'overdue').length;

  return (
    <div className="bg-base-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FlaskConical size={14} className="text-primary" />
          D&A Compliance — Fleet Overview
        </div>
        <span className="text-xs text-base-content/50">Administrator: Drug Free Vessel</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-base-content/60">Enrolled:</span>
          <span className="font-semibold">{enrolled.length}/{crew.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="badge badge-success badge-xs">✓</span>
          <span>Compliant: {compliant}</span>
        </div>
        {dueSoon > 0 && (
          <div className="flex items-center gap-1">
            <span className="badge badge-warning badge-xs">!</span>
            <span>Due Soon: {dueSoon}</span>
          </div>
        )}
        {pendingResult > 0 && (
          <div className="flex items-center gap-1">
            <span className="badge badge-info badge-xs">⏳</span>
            <span>Pending Result: {pendingResult}</span>
          </div>
        )}
        {overdue > 0 && (
          <div className="flex items-center gap-1">
            <span className="badge badge-error badge-xs">!</span>
            <span>Overdue: {overdue}</span>
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

      {/* D&A Fleet Summary */}
      <DAFleetSummary crew={displayed} />

      <div className="space-y-2">
        {displayed.map(member => (
          <CrewCard key={member.id} member={member} isRelief={reliefCrew.includes(member)} />
        ))}
      </div>
    </div>
  );
};
