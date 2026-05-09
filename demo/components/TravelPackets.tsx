import React, { useState } from 'react';
import { Send, Mail, MessageSquare, Check, Clock, RefreshCw, FileText, Eye, ChevronDown, ChevronUp, AlertCircle, Users } from 'lucide-react';
import { TravelPacket, PacketStatus, PacketChannel } from '../types';
import { travelPackets, crewLogisticsPlans } from '../data';

const statusConfig: Record<PacketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'badge-ghost', icon: <FileText size={10} /> },
  sent: { label: 'Sent', color: 'badge-info', icon: <Send size={10} /> },
  updated: { label: 'Updated', color: 'badge-warning', icon: <RefreshCw size={10} /> },
  acknowledged: { label: 'Acknowledged', color: 'badge-success', icon: <Check size={10} /> },
};

const channelLabels: Record<PacketChannel, { label: string; icon: React.ReactNode }> = {
  sms: { label: 'SMS', icon: <MessageSquare size={10} /> },
  email: { label: 'Email', icon: <Mail size={10} /> },
  both: { label: 'SMS + Email', icon: <Send size={10} /> },
};

function PacketPreview({ packet }: { packet: TravelPacket }) {
  const logistics = crewLogisticsPlans.find(p => p.crewMemberId === packet.crewMemberId);

  return (
    <div className="bg-base-200 rounded-lg p-4 mt-3 border-l-4 border-primary">
      <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
        Travel Packet Preview — {packet.crewMemberName}
      </div>

      <div className="bg-base-100 rounded-lg p-3 space-y-3 text-xs">
        {/* Header */}
        <div className="border-b border-base-300 pb-2">
          <div className="font-bold text-sm">M/V HATCHLING — Crew Change Travel Details</div>
          <div className="opacity-60">Prepared for: {packet.crewMemberName} ({packet.position})</div>
          <div className="opacity-60">Version {packet.version} • {packet.sentAt ? `Sent ${new Date(packet.sentAt).toLocaleDateString()}` : 'Draft'}</div>
        </div>

        {/* Changes highlight */}
        {packet.changes && packet.changes.length > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded p-2">
            <div className="font-bold flex items-center gap-1 text-warning">
              <AlertCircle size={12} />
              Updated Information
            </div>
            {packet.changes.map((change, i) => (
              <div key={i} className="mt-1">
                <span className="font-semibold">{change.field}:</span>
                <span className="line-through opacity-50 ml-1">{change.oldValue}</span>
                <span className="ml-1 text-success font-semibold">→ {change.newValue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Flight info */}
        {packet.sections.flights && (
          <div>
            <div className="font-bold">✈️ Flight Details</div>
            <div className="opacity-70 ml-4">
              {logistics ? (
                <div>Outbound flight booked. See itinerary attached.</div>
              ) : (
                <div>Flight details pending.</div>
              )}
            </div>
          </div>
        )}

        {/* Hotel */}
        {packet.sections.hotel && logistics?.hotel && (
          <div>
            <div className="font-bold">🏨 Hotel</div>
            <div className="opacity-70 ml-4">
              <div>{logistics.hotel.hotelName}</div>
              <div>{logistics.hotel.address}</div>
              <div>Check-in: {logistics.hotel.checkIn} • Check-out: {logistics.hotel.checkOut}</div>
              <div>Confirmation: {logistics.hotel.confirmationNumber}</div>
              {logistics.hotel.notes && <div className="italic mt-1">{logistics.hotel.notes}</div>}
            </div>
          </div>
        )}

        {/* Ground Transport */}
        {packet.sections.groundTransport && logistics?.groundTransport && (
          <div>
            <div className="font-bold">🚗 Ground Transport</div>
            <div className="opacity-70 ml-4">
              <div className="capitalize">{logistics.groundTransport.type.replace('_', ' ')}{logistics.groundTransport.provider ? ` — ${logistics.groundTransport.provider}` : ''}</div>
              <div>Pickup: {logistics.groundTransport.pickupLocation} @ {new Date(logistics.groundTransport.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
              <div>Destination: {logistics.groundTransport.dropoffLocation}</div>
            </div>
          </div>
        )}

        {/* Pickup instructions */}
        {packet.sections.pickupInstructions && logistics && (
          <div>
            <div className="font-bold">📍 Pickup Instructions</div>
            <div className="opacity-70 ml-4 italic">{logistics.notes}</div>
          </div>
        )}

        {/* Port info */}
        {packet.sections.portInfo && (
          <div>
            <div className="font-bold">⚓ Port Information</div>
            <div className="opacity-70 ml-4">
              <div>Hamilton Harbour, Front Street Dock, Hamilton, Bermuda</div>
              <div>Access: Front Street public dock — no base security gate</div>
              <div>Port Agent: Meyer Agencies Ltd. — +1-441-295-4176</div>
              <div>Note: No rental cars in Bermuda — taxi or hotel shuttle only</div>
            </div>
          </div>
        )}

        {/* Vessel berth */}
        {packet.sections.vesselBerth && (
          <div>
            <div className="font-bold">🚢 Vessel Location</div>
            <div className="opacity-70 ml-4">
              <div>M/V HATCHLING — SANSU Bender Class</div>
              <div>Berth: Hamilton Harbour, Front Street Dock (port side to)</div>
              <div>Gangway: Amidships, starboard side</div>
            </div>
          </div>
        )}

        {/* Emergency contacts */}
        {packet.sections.emergencyContacts && (
          <div>
            <div className="font-bold">🆘 Emergency Contacts</div>
            <div className="opacity-70 ml-4">
              <div>Vessel: +1 (757) 555-0101 (Bridge — Iridium sat phone)</div>
              <div>Ops Manager: +1 (757) 555-0102</div>
              <div>Port Agent (Bermuda): +1-441-295-4176 (Meyer Agencies Ltd.)</div>
              <div>Standing Tide Office: +1 (757) 555-0200</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PacketCard({ packet, index }: { key?: string; packet: TravelPacket; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const cfg = statusConfig[packet.status];
  const ch = channelLabels[packet.channel];

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-bold text-sm">{packet.crewMemberName}</h3>
              <p className="text-xs opacity-60">{packet.position}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`badge badge-sm gap-1 ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
            <span className="badge badge-sm badge-outline gap-1">
              {ch.icon} {ch.label}
            </span>
            <span className="badge badge-sm badge-ghost">v{packet.version}</span>
          </div>
        </div>

        {/* Sections included */}
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(packet.sections).filter(([, v]) => v).map(([key]) => (
            <span key={key} className="badge badge-xs badge-outline capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          ))}
        </div>

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-xs opacity-60 mt-1">
          {packet.sentAt && (
            <span className="flex items-center gap-1"><Send size={10} /> Sent {new Date(packet.sentAt).toLocaleString()}</span>
          )}
          {packet.acknowledgedAt && (
            <span className="flex items-center gap-1"><Check size={10} /> Ack'd {new Date(packet.acknowledgedAt).toLocaleString()}</span>
          )}
          {!packet.sentAt && (
            <span className="flex items-center gap-1"><Clock size={10} /> Not yet sent</span>
          )}
        </div>

        {/* Changes badge */}
        {packet.changes && packet.changes.length > 0 && (
          <div className="flex items-center gap-1 mt-1 text-warning text-xs">
            <AlertCircle size={12} />
            <span>{packet.changes.length} change(s) since last version</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-2">
          <button
            className="btn btn-xs btn-outline btn-primary"
            onClick={(e) => { e.stopPropagation(); setShowPreview(!showPreview); }}
          >
            <Eye size={12} /> {showPreview ? 'Hide' : 'Preview'}
          </button>
          {packet.status === 'draft' && (
            <button className="btn btn-xs btn-primary gap-1">
              <Send size={12} /> Send Packet
            </button>
          )}
          {packet.status === 'updated' && (
            <button className="btn btn-xs btn-warning gap-1">
              <RefreshCw size={12} /> Push Update
            </button>
          )}
          {(packet.status === 'sent' || packet.status === 'acknowledged') && (
            <button className="btn btn-xs btn-outline gap-1">
              <RefreshCw size={12} /> Resend
            </button>
          )}
        </div>

        {/* Preview panel */}
        {showPreview && <PacketPreview packet={packet} />}
      </div>
    </div>
  );
}

export default function TravelPacketsView() {
  const packets = travelPackets;
  const sent = packets.filter(p => p.status !== 'draft');
  const drafts = packets.filter(p => p.status === 'draft');
  const needsUpdate = packets.filter(p => p.status === 'updated');
  const acked = packets.filter(p => p.status === 'acknowledged');

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Total Packets</div>
          <div className="stat-value text-lg">{packets.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Sent</div>
          <div className="stat-value text-lg text-info">{sent.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Need Update Push</div>
          <div className="stat-value text-lg text-warning">{needsUpdate.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Acknowledged</div>
          <div className="stat-value text-lg text-success">{acked.length}</div>
        </div>
      </div>

      {/* Group push */}
      <div className="card bg-primary/5 border border-primary/20">
        <div className="card-body p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              <div>
                <span className="font-bold text-sm">Group Push — Bermuda Crew Change</span>
                <span className="text-xs opacity-60 ml-2">Send or update packets for all relief crew</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-xs btn-outline btn-primary gap-1">
                <Mail size={12} /> Email All
              </button>
              <button className="btn btn-xs btn-outline btn-primary gap-1">
                <MessageSquare size={12} /> SMS All
              </button>
              <button className="btn btn-xs btn-primary gap-1">
                <Send size={12} /> Push All (SMS + Email)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drafts needing attention */}
      {(drafts.length > 0 || needsUpdate.length > 0) && (
        <div>
          <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-warning" />
            Needs Attention ({drafts.length + needsUpdate.length})
          </h3>
          <div className="space-y-2">
            {[...needsUpdate, ...drafts].map((pkt, i) => (
              <PacketCard key={pkt.id} packet={pkt} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Sent / acknowledged */}
      <div>
        <h3 className="font-bold text-sm flex items-center gap-2 mb-2">
          <Check size={14} className="text-success" />
          Sent ({sent.filter(p => p.status !== 'updated').length})
        </h3>
        <div className="space-y-2">
          {sent.filter(p => p.status !== 'updated').map((pkt, i) => (
            <PacketCard key={pkt.id} packet={pkt} index={i} />
          ))}
        </div>
      </div>

      {/* Crew portal link */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FileText size={14} className="text-secondary" />
            Crew Self-Service Portal
          </h3>
          <p className="text-xs opacity-70 mt-1">
            Each crew member receives a unique token-based link to view their travel packet. No login required.
            Links expire after the crew change date.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {packets.map(pkt => (
              <div key={pkt.id} className="bg-base-200 rounded px-2 py-1 text-xs flex items-center gap-1">
                <span className="font-semibold">{pkt.crewMemberName.split(' ')[0]}:</span>
                <span className="font-mono text-primary opacity-80">crew.hatchling.opsnormal.ai/t/{pkt.id.replace('pkt-', '')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}