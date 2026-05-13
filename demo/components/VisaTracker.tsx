import React, { useState } from 'react';
import { Shield, AlertTriangle, Check, Clock, X, FileText, ChevronDown, ChevronUp, Phone, Globe, Calendar, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { VisaRequest, VisaStatus, VisaDocument } from '../types';
import { visaRequests } from '../data';

const statusConfig: Record<VisaStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  not_required: { label: 'Not Required', color: 'badge-ghost', bgColor: 'bg-base-200', icon: <Check size={10} /> },
  not_started: { label: 'Not Started', color: 'badge-neutral', bgColor: 'bg-base-200', icon: <Circle size={10} /> },
  documents_gathering: { label: 'Gathering Docs', color: 'badge-warning', bgColor: 'bg-warning/10', icon: <FileText size={10} /> },
  submitted: { label: 'Submitted', color: 'badge-info', bgColor: 'bg-info/10', icon: <Clock size={10} /> },
  processing: { label: 'Processing', color: 'badge-info', bgColor: 'bg-info/10', icon: <Clock size={10} /> },
  approved: { label: 'Approved', color: 'badge-success', bgColor: 'bg-success/10', icon: <CheckCircle2 size={10} /> },
  denied: { label: 'Denied', color: 'badge-error', bgColor: 'bg-error/10', icon: <X size={10} /> },
  expired: { label: 'Expired', color: 'badge-error', bgColor: 'bg-error/10', icon: <AlertTriangle size={10} /> },
};

const urgencyConfig: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normal', color: '' },
  urgent: { label: 'Urgent', color: 'border-l-4 border-l-warning' },
  critical: { label: 'Critical', color: 'border-l-4 border-l-error' },
};

function DocumentChecklist({ documents }: { documents: VisaDocument[] }) {
  const collected = documents.filter(d => d.collected).length;
  const total = documents.filter(d => d.required).length;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold">Document Checklist</span>
        <span className="text-xs opacity-60">{collected}/{total} collected</span>
      </div>
      <div className="w-full bg-base-200 rounded-full h-1.5 mb-2">
        <div
          className={`h-1.5 rounded-full transition-all ${collected === total ? 'bg-success' : 'bg-warning'}`}
          style={{ width: `${total > 0 ? (collected / total) * 100 : 0}%` }}
        />
      </div>
      <div className="space-y-1">
        {documents.map((doc, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            {doc.collected ? (
              <CheckCircle2 size={12} className="text-success mt-0.5 shrink-0" />
            ) : (
              <Circle size={12} className="text-base-content/30 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <span className={doc.collected ? 'opacity-70' : 'font-semibold'}>{doc.name}</span>
              {doc.required && !doc.collected && <span className="text-error ml-1">*</span>}
              {doc.notes && <span className="text-warning ml-1 italic">— {doc.notes}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisaCard({ visa, index }: { key?: string; visa: VisaRequest; index: number }) {
  const [expanded, setExpanded] = useState(visa.status === 'documents_gathering' || visa.urgency !== 'normal');
  const cfg = statusConfig[visa.status];
  const urg = urgencyConfig[visa.urgency];

  // Calculate deadline
  const deadlineDays = visa.status === 'not_required' ? null :
    visa.daysUntilCrewChange - visa.processingDays;

  return (
    <div
      className={`card bg-base-100 border border-base-300 shadow-sm ${urg.color} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => setExpanded(!expanded)}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${cfg.bgColor}`}>
              <Globe size={14} />
            </div>
            <div>
              <h3 className="font-bold text-sm">{visa.crewMemberName}</h3>
              <p className="text-xs opacity-60">{visa.nationality} → {visa.destinationCountry} ({visa.destinationPort})</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge badge-sm gap-1 ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
            {visa.urgency !== 'normal' && (
              <span className={`badge badge-sm ${visa.urgency === 'critical' ? 'badge-error' : 'badge-warning'}`}>
                {visa.urgency === 'critical' ? '🔴' : '🟡'} {urg.label}
              </span>
            )}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>

        {/* Quick stats row */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs">
          <span className="flex items-center gap-1 opacity-70">
            <Shield size={10} /> {visa.visaType}
          </span>
          <span className="flex items-center gap-1 opacity-70">
            <Calendar size={10} /> Crew change: {visa.crewChangeDate}
          </span>
          {visa.processingDays > 0 && (
            <span className="flex items-center gap-1 opacity-70">
              <Clock size={10} /> ~{visa.processingDays}d processing
            </span>
          )}
          {deadlineDays !== null && deadlineDays > 0 && visa.status !== 'approved' && visa.status !== 'not_required' && (
            <span className={`flex items-center gap-1 font-semibold ${deadlineDays < 14 ? 'text-error' : deadlineDays < 30 ? 'text-warning' : 'text-success'}`}>
              <AlertCircle size={10} /> Must submit within {deadlineDays}d
            </span>
          )}
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="mt-3 border-t border-base-200 pt-3 space-y-3">
            {/* Timeline */}
            {(visa.submittedDate || visa.approvedDate || visa.expiryDate) && (
              <div className="flex flex-wrap gap-4 text-xs">
                {visa.submittedDate && (
                  <div>
                    <span className="opacity-50">Submitted:</span>
                    <span className="font-semibold ml-1">{visa.submittedDate}</span>
                  </div>
                )}
                {visa.approvedDate && (
                  <div>
                    <span className="opacity-50">Approved:</span>
                    <span className="font-semibold ml-1 text-success">{visa.approvedDate}</span>
                  </div>
                )}
                {visa.expiryDate && (
                  <div>
                    <span className="opacity-50">Expires:</span>
                    <span className="font-semibold ml-1">{visa.expiryDate}</span>
                  </div>
                )}
              </div>
            )}

            {/* Document checklist */}
            {visa.documents.length > 0 && (
              <DocumentChecklist documents={visa.documents} />
            )}

            {/* Port agent */}
            {visa.portAgent && (
              <div className="flex items-center gap-2 text-xs bg-base-200 rounded p-2">
                <Phone size={12} className="text-primary" />
                <span className="font-semibold">Port Agent:</span>
                <span>{visa.portAgent}</span>
                <span className="opacity-60">{visa.portAgentContact}</span>
              </div>
            )}

            {/* Notes */}
            <div className="text-xs opacity-70 italic bg-base-200 rounded p-2">
              {visa.notes}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {visa.status === 'not_started' && (
                <button className="btn btn-xs btn-primary gap-1" onClick={e => e.stopPropagation()}>
                  <FileText size={12} /> Start Application
                </button>
              )}
              {visa.status === 'documents_gathering' && (
                <button className="btn btn-xs btn-warning gap-1" onClick={e => e.stopPropagation()}>
                  <FileText size={12} /> Submit Application
                </button>
              )}
              {visa.status === 'approved' && visa.expiryDate && (
                <button className="btn btn-xs btn-outline gap-1" onClick={e => e.stopPropagation()}>
                  <Calendar size={12} /> Set Renewal Reminder
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VisaTracker() {
  const [filter, setFilter] = useState<'all' | 'action_needed' | 'approved' | 'not_required'>('all');

  const filtered = visaRequests.filter(v => {
    if (filter === 'all') return true;
    if (filter === 'action_needed') return ['not_started', 'documents_gathering', 'submitted', 'processing'].includes(v.status);
    if (filter === 'approved') return v.status === 'approved';
    if (filter === 'not_required') return v.status === 'not_required';
    return true;
  });

  // Sort: urgent/critical first, then by days until crew change
  const sorted = [...filtered].sort((a, b) => {
    const urgOrder: Record<string, number> = { critical: 0, urgent: 1, normal: 2 };
    if (urgOrder[a.urgency] !== urgOrder[b.urgency]) return urgOrder[a.urgency] - urgOrder[b.urgency];
    return a.daysUntilCrewChange - b.daysUntilCrewChange;
  });

  const actionNeeded = visaRequests.filter(v => ['not_started', 'documents_gathering'].includes(v.status));
  const inProcess = visaRequests.filter(v => ['submitted', 'processing'].includes(v.status));
  const approved = visaRequests.filter(v => v.status === 'approved');
  const notRequired = visaRequests.filter(v => v.status === 'not_required');
  const urgent = visaRequests.filter(v => v.urgency !== 'normal');

  // Expiry dashboard
  const expiring90 = visaRequests.filter(v => v.expiryDate).filter(v => {
    const exp = new Date(v.expiryDate!);
    const now = new Date();
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90;
  });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Total Requests</div>
          <div className="stat-value text-lg">{visaRequests.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Action Needed</div>
          <div className="stat-value text-lg text-warning">{actionNeeded.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Processing</div>
          <div className="stat-value text-lg text-info">{inProcess.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Approved</div>
          <div className="stat-value text-lg text-success">{approved.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Urgent / Critical</div>
          <div className="stat-value text-lg text-error">{urgent.length}</div>
        </div>
      </div>

      {/* Expiry alert */}
      {expiring90.length > 0 && (
        <div className="alert alert-warning shadow-sm text-sm">
          <AlertTriangle size={16} />
          <div>
            <span className="font-bold">{expiring90.length} visa(s) expiring within 90 days:</span>
            {expiring90.map(v => (
              <span key={v.id} className="ml-2">{v.crewMemberName} ({v.destinationCountry}, exp {v.expiryDate})</span>
            ))}
          </div>
        </div>
      )}

      {/* New request builder */}
      <div className="card bg-primary/5 border border-primary/20">
        <div className="card-body p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              <div>
                <span className="font-bold text-sm">Visa Request Builder</span>
                <span className="text-xs opacity-60 ml-2">Select crew + destination → auto-generates requirements checklist</span>
              </div>
            </div>
            <button className="btn btn-xs btn-primary gap-1">
              <Globe size={12} /> New Visa Request
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'all' as const, label: 'All', count: visaRequests.length },
          { id: 'action_needed' as const, label: 'Action Needed', count: actionNeeded.length },
          { id: 'approved' as const, label: 'Approved', count: approved.length },
          { id: 'not_required' as const, label: 'Not Required', count: notRequired.length },
        ].map(f => (
          <button
            key={f.id}
            className={`btn btn-xs gap-1 ${filter === f.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {sorted.map((visa, i) => (
          <VisaCard key={visa.id} visa={visa} index={i} />
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-8 opacity-50 text-sm">
          No visa requests match this filter.
        </div>
      )}
    </div>
  );
}