import React, { useEffect, useState, useRef } from 'react';

export default function ServerVisualizer({ systemState, simulatedRpm, actualSimulatedRpm, setSimulatedRpm, isRunning, setIsRunning }) {
  const [requests, setRequests] = useState([]);
  const [scaleEvents, setScaleEvents] = useState([]);
  
  // Decoupled Visual State to delay server movement until animation finishes
  const [visualActive, setVisualActive] = useState([]);
  const [visualIdle, setVisualIdle] = useState([]);
  const prevBackendCountRef = useRef(1);

  // 1. Initial Load Sync
  useEffect(() => {
    if (visualActive.length === 0 && systemState.activeServers?.length > 0) {
      setVisualActive(systemState.activeServers);
      setVisualIdle(systemState.idleServers);
      prevBackendCountRef.current = systemState.activeServers.length;
    }
  }, [systemState, visualActive.length]);

  // 2. Strict Cyclic Server Scaling with Delay
  useEffect(() => {
    const currentBackendCount = systemState.activeServers?.length || 0;
    const prevCount = prevBackendCountRef.current;

    // SCALE UP: Send Signal LEFT to Idle Queue
    if (currentBackendCount > prevCount) {
      const eventId = `scale-up-${Date.now()}`;
      setScaleEvents(prev => [...prev, { id: eventId, type: 'up' }]);
      
      // Wait for 1.5s signal to arrive before visually moving server
      setTimeout(() => {
        setVisualActive(systemState.activeServers);
        setVisualIdle(systemState.idleServers);
      }, 1500); 
    } 
    // SCALE DOWN: Send Signal RIGHT to Active Queue
    else if (currentBackendCount < prevCount) {
      const eventId = `scale-down-${Date.now()}`;
      setScaleEvents(prev => [...prev, { id: eventId, type: 'down' }]);
      
      // Wait for 1.5s signal to arrive before visually removing server
      setTimeout(() => {
        setVisualActive(systemState.activeServers);
        setVisualIdle(systemState.idleServers);
      }, 1500);
    }

    prevBackendCountRef.current = currentBackendCount;
  }, [systemState.activeServers, systemState.idleServers]);

  // 3. Generate 1-to-1 Discrete Request Bubbles
  useEffect(() => {
    if (simulatedRpm === 0 || !isRunning) return;
    
    const msPerRequest = Math.floor(60000 / simulatedRpm); 
    
    const interval = setInterval(() => {
      const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setRequests(prev => [...prev, requestId]);
      
      // Request animation takes exactly 2 seconds top-to-bottom
      setTimeout(() => {
        setRequests(prev => prev.filter(id => id !== requestId));
      }, 2000); 

    }, msPerRequest);

    return () => clearInterval(interval);
  }, [simulatedRpm, isRunning]);

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg h-full flex flex-col gap-8 overflow-hidden">
      
      {/* --- SECTION 1: TRAFFIC CONTROLS --- */}
      <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-8 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] shrink-0">
         <div className="flex flex-col items-center md:items-start w-full md:w-1/4">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Incoming Traffic</span>
            <span className="text-5xl font-mono font-black text-purple-400 tracking-tighter">
              {actualSimulatedRpm} <span className="text-xl text-slate-500 font-sans tracking-normal">RPM</span>
            </span>
         </div>

         <div className="flex-grow w-full flex flex-col gap-4">
            <input 
              type="range" min="0" max="150" 
              value={actualSimulatedRpm} 
              onChange={(e) => setSimulatedRpm(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-center md:justify-start gap-4">
              <button onClick={() => setSimulatedRpm(120)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-1.5 rounded-md text-xs font-bold transition uppercase tracking-wider">Simulate Spike</button>
              <button onClick={() => setSimulatedRpm(50)} className="bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 border border-slate-500/50 px-4 py-1.5 rounded-md text-xs font-bold transition uppercase tracking-wider">Normal Load</button>
              <button onClick={() => setSimulatedRpm(10)} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/50 px-4 py-1.5 rounded-md text-xs font-bold transition uppercase tracking-wider">Simulate Drop</button>
            </div>
         </div>

         <div className="w-full md:w-1/4 flex justify-end">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition shadow-lg border ${isRunning ? 'bg-orange-600/20 text-orange-500 border-orange-500 hover:bg-orange-600/30' : 'bg-green-600/20 text-green-400 border-green-500 hover:bg-green-600/30'}`}
            >
              {isRunning ? 'Stop Engine' : 'Start Engine'}
            </button>
         </div>
      </div>

      {/* --- PYRAMID SIMULATOR LAYOUT --- */}
      <div className="flex flex-col flex-grow relative border-t border-slate-800 pt-8 w-full">

        {/* 1. THE WIRES (Circuit Board Background) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           {/* Trunk from top to LB */}
           <div className="absolute top-0 left-1/2 w-0.5 h-[15%] bg-slate-700 -translate-x-1/2"></div>
           {/* Trunk from LB down to junction */}
           <div className="absolute top-[35%] left-1/2 w-0.5 h-[15%] bg-slate-700 -translate-x-1/2"></div>
           {/* Horizontal connection line */}
           <div className="absolute top-[50%] left-[25%] right-[25%] h-0.5 bg-slate-700"></div>
           {/* Drop down to Idle (Left) */}
           <div className="absolute top-[50%] left-[25%] w-0.5 h-[15%] bg-slate-700 -translate-x-1/2"></div>
           {/* Drop down to Active (Right) */}
           <div className="absolute top-[50%] left-[75%] w-0.5 h-[15%] bg-slate-700 -translate-x-1/2"></div>
           {/* Bottom cycle connector (Idle <-> Active) */}
           <div className="absolute top-[85%] left-[30%] right-[30%] h-0.5 border-t border-dashed border-slate-600"></div>
        </div>

        {/* 2. CENTER TOP: LOAD BALANCER */}
        <div className="w-full flex justify-center h-[35%] z-20 relative">
          <div className="bg-blue-900/20 border border-blue-500 px-8 py-6 rounded-2xl text-center shadow-[0_0_40px_rgba(59,130,246,0.15)] backdrop-blur-md flex flex-col items-center justify-center w-[40%] max-w-sm">
            <h4 className="font-bold text-blue-400 uppercase tracking-widest text-sm mb-2">Load Balancer</h4>
            <div className="bg-slate-950 px-4 py-2 rounded border border-blue-500/30 mb-2">
               <p className="text-sm text-blue-300 font-mono">{systemState.avgRpm} RPM Avg</p>
            </div>
            <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded bg-slate-950 border border-slate-800 ${systemState.actionTaken?.includes('Up') ? 'text-yellow-400' : systemState.actionTaken?.includes('Down') ? 'text-blue-400' : 'text-slate-300'}`}>
              {systemState.actionTaken}
            </span>
          </div>
        </div>

        {/* 3. BOTTOM ROW: QUEUES */}
        <div className="w-full flex justify-between h-[50%] mt-[15%] z-10 px-8">
          
          {/* BOTTOM LEFT: IDLE QUEUE */}
          <div className="w-[45%] bg-slate-950 border border-slate-700 rounded-xl p-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex flex-col">
            <h4 className="text-center font-bold text-slate-400 mb-4 uppercase text-xs tracking-wider border-b border-slate-800 pb-2">Idle Server Pool</h4>
            <div className="flex flex-col gap-3 overflow-y-auto">
              {visualIdle?.map((server) => (
                <div key={server.id} className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex justify-between items-center opacity-60">
                  <span className="font-mono text-slate-400 text-sm">{server.id}</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-500"></span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM RIGHT: ACTIVE QUEUE */}
          <div className="w-[45%] bg-slate-950 border border-green-500/30 rounded-xl p-5 shadow-[inset_0_0_40px_rgba(34,197,94,0.05)] flex flex-col">
            <h4 className="text-center font-bold text-green-400 mb-4 uppercase text-xs tracking-wider border-b border-green-900/50 pb-2">Active Working Array</h4>
            <div className="flex flex-col gap-3 overflow-y-auto">
              {visualActive?.map((server) => (
                <div key={server.id} className="bg-green-500/10 border border-green-500/50 p-3 rounded-lg flex justify-between items-center">
                  <span className="font-mono text-green-300 text-sm z-10">{server.id}</span>
                  <span className="relative flex h-2.5 w-2.5 z-10">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. ANIMATION RENDERING LAYER */}
        
        {/* Discrete Traffic Requests (Top -> LB -> Active Right) */}
        {requests.map(id => (
          <div 
            key={id}
            className="absolute w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_15px_#a855f7] z-30"
            style={{ animation: 'requestPath 2s linear forwards', left: 'calc(50% - 8px)' }}
          ></div>
        ))}

        {/* Scale Up Event (Yellow Bubble: LB -> Idle Left) */}
        {scaleEvents.filter(e => e.type === 'up').map(event => (
          <div 
            key={event.id}
            className="absolute w-5 h-5 rounded-full bg-yellow-400 shadow-[0_0_20px_#eab308] z-40"
            style={{ animation: 'wakeUpPath 1.5s linear forwards', left: 'calc(50% - 10px)' }}
          ></div>
        ))}

        {/* Scale Down Event (Blue Bubble: LB -> Active Right) */}
        {scaleEvents.filter(e => e.type === 'down').map(event => (
          <div 
            key={event.id}
            className="absolute w-5 h-5 rounded-full bg-blue-400 shadow-[0_0_20px_#60a5fa] z-40"
            style={{ animation: 'shutdownPath 1.5s linear forwards', left: 'calc(50% - 10px)' }}
          ></div>
        ))}

      </div>

      {/* --- PRECISE CIRCUIT BOARD CSS KEYFRAMES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Request: Drops to LB -> Drops to Trunk -> Rights Right -> Drops into Active */
        @keyframes requestPath {
          0%   { top: -20px; opacity: 0; }
          10%  { top: 5%; opacity: 1; }
          25%  { top: 20%; left: calc(50% - 8px); } /* In LB */
          45%  { top: 50%; left: calc(50% - 8px); } /* Down to Horizontal Wire */
          70%  { top: 50%; left: calc(75% - 8px); } /* Across to Active column */
          95%  { top: 75%; left: calc(75% - 8px); opacity: 1; transform: scale(1); } /* Down into Queue */
          100% { top: 75%; left: calc(75% - 8px); opacity: 0; transform: scale(0.5); }
        }

        /* Wake Up: Starts in LB -> Drops to Trunk -> Goes Left -> Drops into Idle */
        @keyframes wakeUpPath {
          0%   { top: 20%; opacity: 1; transform: scale(0.5); }
          10%  { top: 20%; transform: scale(1); }
          40%  { top: 50%; left: calc(50% - 10px); } /* Down to Horizontal Wire */
          70%  { top: 50%; left: calc(25% - 10px); } /* Across to Idle column */
          95%  { top: 70%; left: calc(25% - 10px); opacity: 1; transform: scale(1); } /* Down into Queue */
          100% { top: 70%; left: calc(25% - 10px); opacity: 0; transform: scale(0.5); }
        }

        /* Shutdown: Starts in LB -> Drops to Trunk -> Goes Right -> Drops into Active */
        @keyframes shutdownPath {
          0%   { top: 20%; opacity: 1; transform: scale(0.5); }
          10%  { top: 20%; transform: scale(1); }
          40%  { top: 50%; left: calc(50% - 10px); } /* Down to Horizontal Wire */
          70%  { top: 50%; left: calc(75% - 10px); } /* Across to Active column */
          95%  { top: 70%; left: calc(75% - 10px); opacity: 1; transform: scale(1); } /* Down into Queue */
          100% { top: 70%; left: calc(75% - 10px); opacity: 0; transform: scale(0.5); }
        }
      `}} />
    </div>
  );
}