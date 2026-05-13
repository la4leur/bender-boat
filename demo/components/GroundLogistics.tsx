import React, { useState } from 'react';
import { MapPin, Clock, Hotel, Car, Users, AlertTriangle, ChevronDown, ChevronUp, Navigation, Star, DollarSign, Check, X, ExternalLink, Phone } from 'lucide-react';
import { CrewLogisticsPlan, LogisticsTag, PortHotel } from '../types';
import { crewLogisticsPlans, portHotels } from '../data';

function TagBadge({ tag }: { key?: string; tag: LogisticsTag }) {
  const colorMap: Record<string, string> = {
    traveling_together: 'badge-info',
    first_arrival: 'badge-warning',
    rental_vehicle: 'badge-success',
    rider: 'badge-success badge-outline',
    rest_required: 'badge-error',
    heavy_gear: 'badge-neutral',
    inter_vessel: 'badge-primary',
    comms_needed: 'badge-warning',
    return_booked: 'badge-ghost',
    priority_arrival: 'badge-secondary',
  };
  return (
    <div className="tooltip tooltip-bottom" data-tip={tag.detail || tag.label}>
      <span className={`badge badge-sm gap-1 ${colorMap[tag.type] || 'badge-ghost'}`}>
        <span>{tag.icon}</span>
        <span>{tag.label}</span>
      </span>
    </div>
  );
}

function CrewLogisticsCard({ plan, index }: { key?: string; plan: CrewLogisticsPlan; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="card bg-base-100 border border-base-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setExpanded(!expanded)}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="card-body p-4">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-content font-bold text-sm">
              {plan.pickupSequence === 0 ? '★' : plan.pickupSequence}
            </div>
            <div>
              <h3 className="font-bold text-sm">{plan.crewMemberName}</h3>
              <p className="text-xs opacity-60">{plan.position}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono opacity-70">
              Arrives {new Date(plan.arrivalTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @ {new Date(plan.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {plan.tags.map((tag, i) => (
            <TagBadge key={`${plan.crewMemberId}-tag-${i}`} tag={tag} />
          ))}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-3 space-y-3 border-t border-base-200 pt-3">
            {/* Hotel */}
            {plan.hotel && (
              <div className="flex items-start gap-2">
                <Hotel size={14} className="text-info mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold">{plan.hotel.hotelName}</span>
                  <span className="opacity-60"> — {plan.hotel.address}</span>
                  <div className="flex gap-3 mt-1 opacity-70">
                    <span>Conf: {plan.hotel.confirmationNumber}</span>
                    <span>In: {plan.hotel.checkIn}</span>
                    <span>Out: {plan.hotel.checkOut}</span>
                    <span>${plan.hotel.nightlyRate}/night</span>
                  </div>
                  {plan.hotel.notes && <div className="mt-1 opacity-60 italic">{plan.hotel.notes}</div>}
                </div>
              </div>
            )}

            {/* Ground Transport */}
            {plan.groundTransport && (
              <div className="flex items-start gap-2">
                <Car size={14} className="text-success mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold capitalize">{plan.groundTransport.type.replace('_', ' ')}</span>
                  {plan.groundTransport.provider && <span> — {plan.groundTransport.provider}</span>}
                  {plan.groundTransport.confirmationNumber && <span className="opacity-60"> ({plan.groundTransport.confirmationNumber})</span>}
                  <div className="mt-1 opacity-70">
                    <span>{plan.groundTransport.pickupLocation}</span>
                    <span className="mx-1">→</span>
                    <span>{plan.groundTransport.dropoffLocation}</span>
                  </div>
                  <div className="flex gap-3 mt-1 opacity-70">
                    <span>Pickup: {new Date(plan.groundTransport.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    {plan.groundTransport.cost > 0 && <span>${plan.groundTransport.cost}</span>}
                    {plan.groundTransport.capacity && <span>Capacity: {plan.groundTransport.capacity}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Watch Eligibility */}
            {plan.watchEligibleTime && (
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-warning mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold">Watch eligible:</span>
                  <span className="ml-1">
                    {new Date(plan.watchEligibleTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @{' '}
                    {new Date(plan.watchEligibleTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="opacity-60 ml-1">(STCW minimum rest)</span>
                </div>
              </div>
            )}

            {/* Notes */}
            {plan.notes && (
              <div className="flex items-start gap-2">
                <Navigation size={14} className="text-secondary mt-0.5 shrink-0" />
                <p className="text-xs opacity-70 italic">{plan.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HotelPicker() {
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [showOnlyReimbursable, setShowOnlyReimbursable] = useState(false);

  const filtered = portHotels
    .filter(h => !showOnlyReimbursable || h.reimbursable)
    .sort((a, b) => {
      if (sortBy === 'price') return (a.corporateRate || a.nightlyRate) - (b.corporateRate || b.nightlyRate);
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.walkingMinutes === -1 ? 1 : b.walkingMinutes === -1 ? -1 : a.walkingMinutes - b.walkingMinutes;
    });

  const amenityIcons: Record<string, string> = {
    wifi: '📶', pool: '🏊', gym: '💪', breakfast: '🍳', shuttle: '🚐',
    restaurant: '🍽️', beach_access: '🏖️', kitchen: '🍳', laundry: '👕',
    parking: '🅿️', spa: '💆', golf: '⛳', garden: '🌿', concierge: '🔔',
    business_center: '💼', cave_pool: '🏊', kayaks: '🛶', tennis: '🎾',
    afternoon_tea: '☕',
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Hotel size={14} className="text-primary" />
            Hotel Picker — Hamilton, Bermuda
          </h3>
          <div className="flex items-center gap-2">
            <label className="label cursor-pointer gap-1.5 p-0">
              <span className="label-text text-xs">Reimbursable only</span>
              <input type="checkbox" className="toggle toggle-xs toggle-primary" checked={showOnlyReimbursable} onChange={() => setShowOnlyReimbursable(!showOnlyReimbursable)} />
            </label>
            <select className="select select-xs select-bordered" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
              <option value="distance">Distance from port</option>
              <option value="price">Price (low → high)</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="table table-xs">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Distance</th>
                <th>Rate</th>
                <th>Reimbursable</th>
                <th>Amenities</th>
                <th>Booking</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(hotel => (
                <tr key={hotel.id} className={!hotel.reimbursable ? 'opacity-60' : ''}>
                  <td>
                    <div className="font-semibold">{hotel.name}</div>
                    <div className="text-xs opacity-60">{hotel.address}</div>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: hotel.rating }).map((_, i) => (
                        <Star key={i} size={10} className="text-warning fill-warning" />
                      ))}
                    </div>
                    {hotel.hotelChain && <div className="text-xs opacity-50">{hotel.hotelChain}{hotel.loyaltyProgram ? ` · ${hotel.loyaltyProgram}` : ''}</div>}
                  </td>
                  <td>
                    <div className="font-mono text-xs">{hotel.distanceFromPort}</div>
                    <div className="text-xs opacity-60">
                      {hotel.walkingMinutes > 0 ? `${hotel.walkingMinutes} min walk` : 'Taxi/shuttle'}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs">
                      {hotel.corporateRate ? (
                        <>
                          <span className="font-bold text-success">${hotel.corporateRate}</span>
                          <span className="opacity-40 line-through ml-1">${hotel.nightlyRate}</span>
                          <div className="text-xs text-success">Corporate rate</div>
                        </>
                      ) : (
                        <span className="font-bold">${hotel.nightlyRate}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {hotel.reimbursable ? (
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-success" />
                        <span className="text-xs text-success">Yes</span>
                        {hotel.maxReimbursable && (
                          <span className="text-xs opacity-50">(≤${hotel.maxReimbursable})</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <X size={12} className="text-error" />
                        <span className="text-xs text-error">No</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-0.5 max-w-[160px]">
                      {hotel.amenities.slice(0, 5).map(a => (
                        <span key={a} className="tooltip tooltip-bottom" data-tip={a.replace(/_/g, ' ')}>
                          <span className="text-xs">{amenityIcons[a] || '·'}</span>
                        </span>
                      ))}
                      {hotel.amenities.length > 5 && (
                        <span className="text-xs opacity-50">+{hotel.amenities.length - 5}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-xs ${hotel.bookingMethod === 'corporate_direct' ? 'badge-success' : hotel.bookingMethod === 'phone' ? 'badge-info' : 'badge-ghost'}`}>
                      {hotel.bookingMethod === 'corporate_direct' ? 'Corporate' : hotel.bookingMethod === 'phone' ? 'Direct' : hotel.bookingMethod === 'port_agent' ? 'Port Agent' : 'OTA'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-xs ${hotel.availability === 'available' ? 'badge-success' : hotel.availability === 'limited' ? 'badge-warning' : 'badge-error'}`}>
                      {hotel.availability === 'available' ? 'Available' : hotel.availability === 'limited' ? 'Limited' : 'Sold Out'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Crew notes */}
        <div className="mt-3 space-y-1">
          <div className="text-xs font-semibold opacity-70">💡 Crew Notes</div>
          {filtered.filter(h => h.crewNotes).slice(0, 3).map(hotel => (
            <div key={hotel.id} className="text-xs bg-base-200 rounded px-2 py-1">
              <span className="font-semibold">{hotel.name}:</span> <span className="opacity-70 italic">{hotel.crewNotes}</span>
            </div>
          ))}
        </div>

        {/* Policy reminder */}
        <div className="alert alert-info mt-3 py-2">
          <AlertTriangle size={14} />
          <span className="text-xs">
            <strong>Company Policy:</strong> Nightly reimbursement cap: $300. Corporate rates require booking via direct account. Receipts required for all lodging over $100/night.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function GroundLogistics() {
  const plans = crewLogisticsPlans;
  const sorted = [...plans].sort((a, b) => a.pickupSequence - b.pickupSequence);

  // Summary stats
  const totalHotelCost = plans.reduce((sum, p) => sum + (p.hotel?.nightlyRate || 0), 0);
  const totalTransportCost = plans.reduce((sum, p) => sum + (p.groundTransport?.cost || 0), 0);
  const restRequired = plans.filter(p => p.tags.some(t => t.type === 'rest_required'));
  const firstTimers = plans.filter(p => p.tags.some(t => t.type === 'first_arrival'));
  const uniqueHotels = [...new Set(plans.filter(p => p.hotel).map(p => p.hotel!.hotelName))];

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Crew Arriving</div>
          <div className="stat-value text-lg">{plans.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Hotels</div>
          <div className="stat-value text-lg">{uniqueHotels.length}</div>
          <div className="stat-desc text-xs">${totalHotelCost}/night total</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Transport Cost</div>
          <div className="stat-value text-lg">${totalTransportCost}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">Rest Required</div>
          <div className="stat-value text-lg text-warning">{restRequired.length}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg border border-base-300 p-3">
          <div className="stat-title text-xs">First-Timers</div>
          <div className="stat-value text-lg text-info">{firstTimers.length}</div>
        </div>
      </div>

      {/* Hotel Picker */}
      <HotelPicker />

      {/* Pickup timeline */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <MapPin size={14} className="text-primary" />
            Pickup Sequence — Bermuda Crew Change
          </h3>
          <div className="overflow-x-auto mt-2">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Crew</th>
                  <th>Arrives</th>
                  <th>Hotel</th>
                  <th>Transport</th>
                  <th>To Pier</th>
                  <th>Watch Eligible</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((plan) => (
                  <tr key={plan.crewMemberId}>
                    <td className="font-bold">{plan.pickupSequence === 0 ? '★' : plan.pickupSequence}</td>
                    <td>
                      <div className="font-semibold">{plan.crewMemberName}</div>
                      <div className="text-xs opacity-60">{plan.position}</div>
                    </td>
                    <td className="font-mono text-xs">
                      {new Date(plan.arrivalTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br />
                      {new Date(plan.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="text-xs">{plan.hotel?.hotelName?.replace(' & Beach Club', '').replace(' Beach Resort', '').trim() || '—'}</td>
                    <td className="text-xs capitalize">{plan.groundTransport?.type.replace('_', ' ') || '—'}</td>
                    <td className="font-mono text-xs">
                      {plan.groundTransport ? new Date(plan.groundTransport.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="font-mono text-xs">
                      {plan.watchEligibleTime ? (
                        <>
                          {new Date(plan.watchEligibleTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                          {new Date(plan.watchEligibleTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </>
                      ) : '—'}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {plan.tags.filter(t => ['first_arrival', 'rest_required', 'priority_arrival', 'heavy_gear', 'comms_needed', 'inter_vessel'].includes(t.type)).map((tag, i) => (
                          <span key={`${plan.crewMemberId}-flag-${i}`} className="tooltip" data-tip={tag.detail}>
                            <span className="text-sm">{tag.icon}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hotel grouping */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Hotel size={14} className="text-info" />
            Hotel Assignments — Routing Groups
          </h3>
          <div className="space-y-3 mt-2">
            {uniqueHotels.map(hotel => {
              const crewAtHotel = plans.filter(p => p.hotel?.hotelName === hotel);
              return (
                <div key={hotel} className="bg-base-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm">{hotel}</span>
                      <span className="text-xs opacity-60 ml-2">{crewAtHotel[0]?.hotel?.address}</span>
                    </div>
                    <div className="badge badge-sm">{crewAtHotel.length} crew</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {crewAtHotel.map(c => (
                      <div key={c.crewMemberId} className="flex items-center gap-1 bg-base-100 rounded px-2 py-1 text-xs">
                        <Users size={10} />
                        <span className="font-semibold">{c.crewMemberName}</span>
                        <span className="opacity-60">({c.hotel?.confirmationNumber})</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    ${crewAtHotel[0]?.hotel?.nightlyRate}/night × {crewAtHotel.length} rooms = ${(crewAtHotel[0]?.hotel?.nightlyRate || 0) * crewAtHotel.length}/night
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual cards */}
      <h3 className="font-bold text-sm flex items-center gap-2 pt-2">
        <Users size={14} /> Crew Detail Cards
        <span className="text-xs opacity-60 font-normal">(click to expand)</span>
      </h3>
      <div className="space-y-2">
        {sorted.map((plan, i) => (
          <CrewLogisticsCard key={plan.crewMemberId} plan={plan} index={i} />
        ))}
      </div>
    </div>
  );
}