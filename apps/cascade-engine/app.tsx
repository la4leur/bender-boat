import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Zap, List, Clock, CheckCircle2 } from 'lucide-react';
import { DisruptionCatalog } from './components/DisruptionCatalog';
import { CascadeView } from './components/CascadeView';
import { ChecklistView } from './components/ChecklistView';
import { HistoricalReplay } from './components/HistoricalReplay';

type View =
  | { type: 'catalog' }
  | { type: 'cascade'; disruptionId: string }
  | { type: 'checklist'; disruptionId: string }
  | { type: 'replay' };

const tabs = [
  { id: 'catalog' as const, label: 'Disruptions', icon: <Zap size={14} /> },
  { id: 'replay' as const, label: 'Historical Replay', icon: <Clock size={14} /> },
];

const App: React.FC<{}> = () => {
  const [view, setView] = useState<View>({ type: 'catalog' });

  const activeTab = view.type === 'catalog' ? 'catalog' :
    view.type === 'replay' ? 'replay' : 'catalog';

  return (
    <div className="min-h-screen bg-base-100">
      {/* Tab bar */}
      <div className="tabs tabs-bordered bg-base-200 px-2 pt-2 sticky top-0 z-10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab tab-sm gap-1 ${activeTab === tab.id ? 'tab-active font-bold' : ''}`}
            onClick={() => setView(tab.id === 'catalog' ? { type: 'catalog' } : { type: 'replay' })}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        {(view.type === 'cascade' || view.type === 'checklist') && (
          <>
            <button className="tab tab-active tab-sm gap-1 font-bold">
              {view.type === 'cascade' ? <><Zap size={14} /> Cascade</> : <><CheckCircle2 size={14} /> Checklist</>}
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {view.type === 'catalog' && (
        <DisruptionCatalog onSelect={(id) => setView({ type: 'cascade', disruptionId: id })} />
      )}
      {view.type === 'cascade' && (
        <CascadeView
          disruptionId={view.disruptionId}
          onBack={() => setView({ type: 'catalog' })}
          onChecklist={() => setView({ type: 'checklist', disruptionId: view.disruptionId })}
        />
      )}
      {view.type === 'checklist' && (
        <ChecklistView
          disruptionId={view.disruptionId}
          onBack={() => setView({ type: 'catalog' })}
          onCascade={() => setView({ type: 'cascade', disruptionId: view.disruptionId })}
        />
      )}
      {view.type === 'replay' && (
        <HistoricalReplay
          onBack={() => setView({ type: 'catalog' })}
          onDisruption={(id) => setView({ type: 'cascade', disruptionId: id })}
        />
      )}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
