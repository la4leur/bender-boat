import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Anchor, Users, Navigation, Clock, ArrowRightLeft, DollarSign, Search, Phone } from 'lucide-react';
import { DemoTab } from './types';
import { VesselDashboard } from './components/VesselDashboard';
import { CrewRoster } from './components/CrewRoster';
import { VoyagePlanner } from './components/VoyagePlanner';
import { WatchBoard } from './components/WatchBoard';
import { CrewChangeWorkflow } from './components/CrewChangeWorkflow';
import { ChangePortal } from './components/ChangePortal';
import TravelPlanner from './components/TravelPlanner';
import { LifelinePortal } from './components/LifelinePortal';

const tabs: { id: DemoTab; label: string; icon: React.ReactNode; desc: string; badge?: string }[] = [
  { id: 'vessel', label: 'Vessel', icon: <Anchor size={16} />, desc: 'M/V HATCHLING overview' },
  { id: 'crew', label: 'Crew', icon: <Users size={16} />, desc: 'Roster & credentials' },
  { id: 'voyage', label: 'Voyage', icon: <Navigation size={16} />, desc: 'Route & manifest' },
  { id: 'watch', label: 'Watch', icon: <Clock size={16} />, desc: 'Schedule & hours' },
  { id: 'crewchange', label: 'Crew Change', icon: <ArrowRightLeft size={16} />, desc: 'The workflow', badge: 'Demo' },
  { id: 'lifeline', label: 'Lifeline', icon: <Phone size={16} />, desc: 'Emergency travel response', badge: '🔴' },
  { id: 'changes', label: 'Changes', icon: <DollarSign size={16} />, desc: "Kelly's expense portal", badge: 'New' },
  { id: 'travel', label: 'Travel', icon: <Search size={16} />, desc: 'Compare & book flights', badge: 'New' },
];

const App = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>('vessel');

  return (
    <div className="min-h-screen bg-base-100">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="flex overflow-x-auto px-2 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-base-content/60 hover:text-base-content'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && <span className={`badge badge-xs ${tab.id === 'lifeline' ? 'badge-error' : tab.id === 'changes' || tab.id === 'travel' ? 'badge-accent' : 'badge-secondary'}`}>{tab.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 animate-fade-in" key={activeTab}>
        {activeTab === 'vessel' && <VesselDashboard />}
        {activeTab === 'crew' && <CrewRoster />}
        {activeTab === 'voyage' && <VoyagePlanner />}
        {activeTab === 'watch' && <WatchBoard />}
        {activeTab === 'crewchange' && <CrewChangeWorkflow />}
        {activeTab === 'lifeline' && <LifelinePortal />}
        {activeTab === 'changes' && <ChangePortal />}
        {activeTab === 'travel' && <TravelPlanner />}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
