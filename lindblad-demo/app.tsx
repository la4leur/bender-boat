import React, { useState } from 'react';
import { Ship, ArrowLeftRight, AlertTriangle, Users, FileText } from 'lucide-react';
import FleetOverview from './components/FleetOverview';
import CrewChanges from './components/CrewChanges';
import UnfilledBillets from './components/UnfilledBillets';
import CrewRoster from './components/CrewRoster';
import WeeklyReport from './components/WeeklyReport';
import { TabId } from './types';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'fleet', label: 'Fleet', icon: <Ship size={18} /> },
  { id: 'changes', label: 'Crew Changes', icon: <ArrowLeftRight size={18} /> },
  { id: 'billets', label: 'Unfilled Billets', icon: <AlertTriangle size={18} /> },
  { id: 'roster', label: 'Crew Roster', icon: <Users size={18} /> },
  { id: 'report', label: 'Weekly Report', icon: <FileText size={18} /> },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('fleet');

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ship size={28} className="text-primary" />
            <div>
              <h1 className="text-xl font-bold text-base-content">Lindblad Expeditions</h1>
              <p className="text-xs text-base-content/60">Fleet Crewing Dashboard — 4 Vessels</p>
            </div>
          </div>
          <div className="text-xs text-base-content/50">Standing Tide • Bender Boat Demo</div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'fleet' && <FleetOverview />}
        {activeTab === 'changes' && <CrewChanges />}
        {activeTab === 'billets' && <UnfilledBillets />}
        {activeTab === 'roster' && <CrewRoster />}
        {activeTab === 'report' && <WeeklyReport />}
      </div>
    </div>
  );
};

export default App;

import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')!).render(<App />);
