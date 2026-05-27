import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ServerVisualizer from './ServerVisualizer';

export default function MainDashboardView() {
  const [systemState, setSystemState] = useState({
    avgRpm: 0,
    activeServers: [],
    idleServers: [],
    actionTaken: 'Initializing...'
  });
  const [simulatedRpm, setSimulatedRpm] = useState(50);
  const [isRunning, setIsRunning] = useState(false);

  // Core Simulation Engine Loop
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(async () => {
        try {
          const response = await axios.post('/api/traffic', {
            currentRpm: simulatedRpm
          });
          setSystemState(response.data);
        } catch (error) {
          console.error("Simulation error", error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, simulatedRpm]);

  return (
    <div className="flex flex-col gap-6 h-[85vh]">
      <header className="flex justify-between items-end border-b border-slate-800 pb-4 shrink-0">
        <h2 className="text-3xl font-bold text-slate-200">System Overview</h2>
        <div className={`px-4 py-1 rounded-full font-bold text-sm ${isRunning ? 'bg-green-500/20 text-green-400 border border-green-500' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
          {isRunning ? '● LIVE' : '○ PAUSED'}
        </div>
      </header>

      {/* Renders the unified 4-section Visualizer */}
      <div className="w-full flex-grow">
        <ServerVisualizer 
          systemState={systemState} 
          simulatedRpm={isRunning ? simulatedRpm : 0} 
          actualSimulatedRpm={simulatedRpm} 
          setSimulatedRpm={setSimulatedRpm}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
        />
      </div>
    </div>
  );
}