import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SystemView } from './components/SystemView';
import { GearDetail } from './components/GearDetail';
import { HiringPipeline } from './components/HiringPipeline';
import { ScenarioWalker } from './components/ScenarioWalker';
import { GearId } from './types';

type View =
  | { type: 'system' }
  | { type: 'gear'; gearId: GearId }
  | { type: 'pipeline' }
  | { type: 'scenario' };

const App: React.FC<{}> = () => {
  const [view, setView] = useState<View>({ type: 'system' });

  const goHome = () => setView({ type: 'system' });

  switch (view.type) {
    case 'system':
      return (
        <SystemView
          onSelectGear={(id) => setView({ type: 'gear', gearId: id })}
          onSelectPipeline={() => setView({ type: 'pipeline' })}
          onSelectScenario={() => setView({ type: 'scenario' })}
        />
      );
    case 'gear':
      return (
        <GearDetail
          gearId={view.gearId}
          onBack={goHome}
          onNavigateGear={(id) => setView({ type: 'gear', gearId: id })}
        />
      );
    case 'pipeline':
      return <HiringPipeline onBack={goHome} />;
    case 'scenario':
      return <ScenarioWalker onBack={goHome} />;
    default:
      return null;
  }
};

createRoot(document.getElementById('root')!).render(<App />);
