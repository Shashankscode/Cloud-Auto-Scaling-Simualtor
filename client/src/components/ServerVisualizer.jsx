import React, { useEffect, useState, useRef } from 'react';

export default function ServerVisualizer({ systemState, simulatedRpm, actualSimulatedRpm, setSimulatedRpm, isRunning, setIsRunning }) {
  
  // --- DYNAMIC VIEWPORT THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- VISUAL PIPELINE STATES ---
  const [trafficDrops, setTrafficDrops] = useState([]); 
  const [trunkDrops, setTrunkDrops] = useState([]);     
  const [arms, setArms] = useState([]);                 
  const [finalDrops, setFinalDrops] = useState([]);     

  // --- DECOUPLED SERVER STATES ---
  const [visualActive, setVisualActive] = useState([]);
  const [visualIdle, setVisualIdle] = useState([]);
  const [movingServer, setMovingServer] = useState(null); 
  
  const prevBackendCountRef = useRef(0);
  const isInitialLoad = useRef(true);

  const targetActiveStateRef = useRef([]);
  const targetIdleStateRef = useRef([]);

  useEffect(() => {
    targetActiveStateRef.current = systemState.activeServers || [];
    targetIdleStateRef.current = systemState.idleServers || [];

    if (isInitialLoad.current && systemState.activeServers?.length > 0) {
      setVisualActive(systemState.activeServers);
      setVisualIdle(systemState.idleServers);
      prevBackendCountRef.current = systemState.activeServers.length;
      isInitialLoad.current = false;
    }
  }, [systemState]);

  // --- STRICT SEQUENTIAL SCALING LIFE-CYCLE ---
  useEffect(() => {
    if (isInitialLoad.current) return;

    const currentCount = systemState.activeServers?.length || 0;
    const prevCount = prevBackendCountRef.current;

    if (currentCount > prevCount) {
      const id = Date.now();
      setTrunkDrops(prev => [...prev, { id, direction: 'left', type: 'up' }]);
      
      setTimeout(() => { 
        setTrunkDrops(prev => prev.filter(x => x.id !== id));
        setArms(prev => [...prev, { id, direction: 'left', type: 'up' }]);
        
        setTimeout(() => { 
          setArms(prev => prev.filter(x => x.id !== id));
          setFinalDrops(prev => [...prev, { id, target: 'idle', type: 'up' }]);
          
          setTimeout(() => { 
            setFinalDrops(prev => prev.filter(x => x.id !== id));
            const backupActiveList = targetActiveStateRef.current;
            if (backupActiveList.length > 0) {
              const migratingServerInstance = backupActiveList[backupActiveList.length - 1];
              setVisualIdle(prev => prev.slice(0, -1));
              setMovingServer({ id: migratingServerInstance.id, direction: 'to-active' });

              setTimeout(() => {
                setMovingServer(null);
                setVisualActive(backupActiveList);
              }, 1500); 
            }
          }, 800); 
        }, 1200); 
      }, 800); 
    } 
    else if (currentCount < prevCount) {
      const id = Date.now();
      setTrunkDrops(prev => [...prev, { id, direction: 'right', type: 'down' }]);
      
      setTimeout(() => {
        setTrunkDrops(prev => prev.filter(x => x.id !== id));
        setArms(prev => [...prev, { id, direction: 'right', type: 'down' }]);
        
        setTimeout(() => {
          setArms(prev => prev.filter(x => x.id !== id));
          setFinalDrops(prev => [...prev, { id, target: 'active', type: 'down' }]);
          
          setTimeout(() => {
            setFinalDrops(prev => prev.filter(x => x.id !== id));
            const backupIdleList = targetIdleStateRef.current;
            const targetDeactivatedId = `Server-${visualActive.length}`;
            
            setVisualActive(prev => prev.slice(0, -1));
            setMovingServer({ id: targetDeactivatedId, direction: 'to-idle' });

            setTimeout(() => {
              setMovingServer(null);
              setVisualIdle(backupIdleList);
            }, 1500);
          }, 800);
        }, 1200);
      }, 800);
    }

    prevBackendCountRef.current = currentCount;
  }, [systemState.activeServers?.length]);

  // --- STRICT REQUEST PROCESSING LOOPS ---
  useEffect(() => {
    if (simulatedRpm === 0 || !isRunning) return;
    const msPerRequest = Math.max(Math.floor(60000 / simulatedRpm), 1000); 
    
    const interval = setInterval(() => {
      const id = Date.now() + Math.random();
      setTrafficDrops(prev => [...prev, { id }]);
      
      setTimeout(() => { 
        setTrafficDrops(prev => prev.filter(x => x.id !== id));
        setTrunkDrops(prev => [...prev, { id, direction: 'right', type: 'req' }]);
        
        setTimeout(() => { 
          setTrunkDrops(prev => prev.filter(x => x.id !== id));
          setArms(prev => [...prev, { id, direction: 'right', type: 'req' }]);
          
          setTimeout(() => { 
            setArms(prev => prev.filter(x => x.id !== id));
            setFinalDrops(prev => [...prev, { id, target: 'active', type: 'req' }]);
            
            setTimeout(() => { 
              setFinalDrops(prev => prev.filter(x => x.id !== id));
            }, 800);
          }, 1200);
        }, 800);
      }, 800);
    }, msPerRequest);

    return () => clearInterval(interval);
  }, [simulatedRpm, isRunning]);

  return (
    <div className={`p-4 md:p-6 rounded-2xl shadow-xl w-full max-w-full overflow-hidden flex flex-col items-center font-sans select-none border transition-all duration-300 ${
      isDarkMode ? 'bg-black border-slate-800 text-slate-200' : 'bg-[#f8fafc] border-slate-200 text-slate-800'
    }`}>
      
      {/* --- RESPONSIVE CONTROLS PANELS --- */}
      <div className={`p-4 rounded-2xl flex flex-col lg:flex-row w-full justify-between items-center gap-6 z-30 mb-4 border transition-all duration-300 ${
        isDarkMode ? 'bg-[#0a0a0a] border-slate-800 shadow-md' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
         <div className="flex flex-col items-center lg:items-start w-full lg:w-1/5 shrink-0">
            <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-cyan-500' : 'text-slate-400'}`}>Incoming Traffic</span>
            <span className={`text-3xl font-mono font-black ${isDarkMode ? 'text-cyan-400' : 'text-slate-900'}`}>
              {actualSimulatedRpm} <span className={`text-xs font-sans tracking-normal font-bold ${isDarkMode ? 'text-cyan-600' : 'text-slate-500'}`}>RPM</span>
            </span>
         </div>
         
         <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4">
            <input 
              type="range" min="0" max="150" 
              value={actualSimulatedRpm} 
              onChange={(e) => setSimulatedRpm(Number(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-800 accent-cyan-500' : 'bg-slate-200 accent-purple-600'}`}
            />
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setSimulatedRpm(120)} className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider transition-all ${
                isDarkMode 
                  ? 'bg-red-950/50 hover:bg-red-900/80 text-red-400 border border-red-800/80' 
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm'
              }`}>SPIKE</button>
              <button onClick={() => setSimulatedRpm(50)} className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider transition-all ${
                isDarkMode 
                  ? 'bg-cyan-950/50 hover:bg-cyan-900/80 text-cyan-400 border border-cyan-800/80' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm'
              }`}>NORMAL</button>
              <button onClick={() => setSimulatedRpm(10)} className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider transition-all ${
                isDarkMode 
                  ? 'bg-blue-950/50 hover:bg-blue-900/80 text-blue-400 border border-blue-800/80' 
                  : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 shadow-sm'
              }`}>DROP</button>
            </div>
         </div>

         <div className="w-full lg:w-auto shrink-0 flex items-center justify-center lg:justify-end gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-4 py-3 rounded-xl text-xs font-black tracking-widest transition-all border ${
                isDarkMode 
                  ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isDarkMode ? '☀️ LIGHT VIEW' : '🌙 DARK VIEW'}
            </button>

            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full sm:w-40 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all border ${
                isRunning 
                  ? isDarkMode ? 'bg-orange-950/80 text-orange-400 border-orange-700 hover:bg-orange-900' : 'bg-orange-600/10 text-orange-500 border-orange-500/50 hover:bg-orange-600/20'
                  : isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700 hover:bg-emerald-900' : 'bg-green-600/10 text-green-400 border-green-500/50 hover:bg-green-600/20'
              }`}
            >
              {isRunning ? 'HALT SIMULATION' : 'START SIMULATION'}
            </button>
         </div>
      </div>

      {/* --- UNBROKEN CONTAINER CANVAS FRAME --- */}
      <div className={`w-full relative h-[450px] mt-2 overflow-hidden max-w-full border rounded-xl transition-all duration-300 ${
        isDarkMode ? 'border-slate-800 bg-[#050505]' : 'border-slate-300 bg-white shadow-inner'
      }`}>
        
        {/* PHYSICAL STRUCTURAL SVG CHANNELS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <line x1="50%" y1="0" x2="50%" y2="35" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeWidth="4" />
          <line x1="50%" y1="145" x2="50%" y2="175" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeWidth="4" />
          <line x1="28.5%" y1="175" x2="71.5%" y2="175" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeWidth="4" />
          <line x1="28.5%" y1="175" x2="28.5%" y2="220" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeWidth="4" />
          <line x1="71.5%" y1="175" x2="71.5%" y2="220" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeWidth="4" />
          <line x1="28.5%" y1="420" x2="71.5%" y2="420" stroke={isDarkMode ? "#475569" : "#94a3b8"} strokeWidth="4" strokeDasharray="6 6" />
        </svg>

        {/* LOAD BALANCER COMPONENT */}
        <div className={`absolute top-[35px] left-1/2 -translate-x-1/2 w-64 p-4 rounded-2xl text-center z-10 border transition-all duration-300 ${
          isDarkMode ? 'bg-[#0a0a0a] border-slate-700' : 'bg-white border-slate-200 shadow-md'
        }`}>
           <h4 className={`font-black uppercase tracking-[0.15em] text-[11px] ${isDarkMode ? 'text-cyan-400' : 'text-slate-800'}`}>Load Balancer Matrix</h4>
           <div className={`mt-2 px-3 py-1.5 rounded-xl inline-block border transition-all duration-300 ${
             isDarkMode ? 'bg-black border-slate-700 text-cyan-300' : 'bg-slate-50 border-slate-200 text-indigo-700 font-bold'
           }`}>
              <span className="text-[11px] font-mono tracking-wider font-bold">{systemState.avgRpm} RPM AVG LOAD</span>
           </div>
        </div>

        {/* STANDBY CLUSTER BOX */}
        <div className={`absolute top-[220px] left-[5%] md:left-[10%] w-[42%] md:w-[37%] p-4 rounded-2xl h-[175px] z-10 flex flex-col border transition-all duration-300 ${
          isDarkMode ? 'bg-[#0a0a0a] border-slate-800 text-amber-500' : 'bg-white border-slate-300 text-slate-400'
        }`}>
           <h4 className={`text-center font-black mb-3 uppercase text-[9px] tracking-[0.2em] border-b pb-2 shrink-0 ${isDarkMode ? 'border-slate-800 text-amber-500' : 'border-slate-200 text-slate-500'}`}>Standby Cluster</h4>
           <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-grow scrollbar-thin">
             {visualIdle?.map((server) => (
               <div key={server.id} className={`p-2 rounded-xl flex justify-between items-center shrink-0 border transition-all duration-300 ${
                 isDarkMode ? 'bg-black border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-700'
               }`}>
                 <div className="flex items-center gap-2">
                   <div className={`w-1 h-3 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-slate-400'}`}></div>
                   <span className="font-mono text-xs tracking-wider font-bold">{server.id}</span>
                 </div>
                 <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-slate-600' : 'bg-slate-400'}`}></div>
               </div>
             ))}
           </div>
        </div>

        {/* OPERATIONAL ARRAY BOX */}
        <div className={`absolute top-[220px] right-[5%] md:right-[10%] w-[42%] md:w-[37%] p-4 rounded-2xl h-[175px] z-10 flex flex-col border transition-all duration-300 ${
          isDarkMode ? 'bg-[#0a0a0a] border-emerald-900 text-emerald-400' : 'bg-white border-2 border-emerald-500 shadow-lg text-emerald-600'
        }`}>
           <h4 className={`text-center font-black mb-3 uppercase text-[9px] tracking-[0.2em] border-b pb-2 shrink-0 ${isDarkMode ? 'text-emerald-400 border-emerald-900' : 'text-green-600 border-green-200'}`}>Operational Array</h4>
           <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-grow scrollbar-thin">
             {visualActive?.map((server) => (
               <div key={server.id} className={`p-2 rounded-xl flex justify-between items-center border shrink-0 animate-[rackPop_0.3s_ease-out] ${
                 isDarkMode 
                   ? 'bg-black border-emerald-800 text-emerald-300' 
                   : 'bg-emerald-50 border-2 border-emerald-200 text-emerald-900'
               }`}>
                 <div className="flex items-center gap-2">
                   <div className={`w-1 h-3 rounded-full ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-400'}`}></div>
                   <span className="font-mono text-xs tracking-wider font-bold">{server.id}</span>
                 </div>
                 <span className="relative flex h-1.5 w-1.5">
                   <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-400'}`}></span>
                   <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDarkMode ? 'bg-emerald-500' : 'bg-emerald-400'}`}></span>
                 </span>
               </div>
             ))}
           </div>
        </div>

        {/* --- SOLID IMMUTABLE DATA BUBBLES LAYER --- */}
        {trafficDrops.map(req => (
          <div key={req.id} className={`absolute w-3 h-3 rounded-full left-1/2 -translate-x-1/2 animate-[dropInlet_0.8s_linear_forwards] z-40 ${
            isDarkMode ? 'bg-cyan-400' : 'bg-purple-500'
          }`} />
        ))}

        {trunkDrops.map(req => (
          <div key={req.id} className={`absolute w-3.5 h-3.5 rounded-full left-1/2 -translate-x-1/2 animate-[dropTrunk_0.8s_linear_forwards] z-40 ${
            req.type === 'up' 
              ? isDarkMode ? 'bg-amber-400' : 'bg-amber-500' 
              : req.type === 'down' 
                ? isDarkMode ? 'bg-rose-500' : 'bg-rose-500'
                : isDarkMode ? 'bg-cyan-400' : 'bg-purple-500'
          }`} />
        ))}

        {arms.filter(a => a.direction === 'left').map(req => (
          <div key={req.id} className={`absolute h-3.5 w-3.5 rounded-full animate-[routeLeftBus_1.2s_linear_forwards] top-[168px] z-40 ${
            isDarkMode ? 'bg-amber-400' : 'bg-amber-500'
          }`} />
        ))}
        {arms.filter(a => a.direction === 'right').map(req => (
          <div key={req.id} className={`absolute h-3.5 w-3.5 rounded-full animate-[routeRightBus_1.2s_linear_forwards] top-[168px] z-40 ${
            req.type === 'down' 
              ? isDarkMode ? 'bg-rose-500' : 'bg-rose-500'
              : isDarkMode ? 'bg-cyan-400' : 'bg-purple-500'
          }`} />
        ))}

        {finalDrops.filter(d => d.target === 'idle').map(req => (
          <div key={req.id} className={`absolute w-3.5 h-3.5 rounded-full left-[28.5%] -translate-x-1/2 animate-[dropTerminalGate_0.8s_linear_forwards] z-40 ${
            isDarkMode ? 'bg-amber-400' : 'bg-amber-500'
          }`} />
        ))}
        {finalDrops.filter(d => d.target === 'active').map(req => (
          <div key={req.id} className={`absolute w-3.5 h-3.5 rounded-full left-[71.5%] -translate-x-1/2 animate-[dropTerminalGate_0.8s_linear_forwards] z-40 ${
            req.type === 'down' 
              ? isDarkMode ? 'bg-rose-500' : 'bg-rose-500'
              : isDarkMode ? 'bg-cyan-400' : 'bg-purple-500'
          }`} />
        ))}

        {/* --- SERVER SLIDE TRANSIT MIGRATION --- */}
        {movingServer && (
          <div 
            className={`absolute top-[395px] w-40 p-2.5 rounded-xl border-2 flex justify-between items-center z-50 ${
              movingServer.direction === 'to-active' 
                ? isDarkMode
                  ? 'bg-black border-emerald-500 text-emerald-400 animate-[migrateToActive_1.5s_ease-in-out_forwards]'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-900 animate-[migrateToActive_1.5s_ease-in-out_forwards]'
                : isDarkMode
                  ? 'bg-black border-slate-600 text-slate-400 animate-[migrateToIdle_1.5s_ease-in-out_forwards]'
                  : 'bg-slate-50 border-slate-300 text-slate-700 animate-[migrateToIdle_1.5s_ease-in-out_forwards]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div className={`w-1 h-3 rounded-full animate-pulse ${
                movingServer.direction === 'to-active' 
                  ? isDarkMode ? 'bg-emerald-500' : 'bg-emerald-500' 
                  : isDarkMode ? 'bg-slate-500' : 'bg-slate-500'
              }`} />
              <span className="font-mono text-[11px] tracking-wider font-black">{movingServer.id}</span>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${
              movingServer.direction === 'to-active' 
                ? isDarkMode ? 'bg-emerald-500' : 'bg-emerald-500' 
                : isDarkMode ? 'bg-slate-500' : 'bg-slate-400'
            }`} />
          </div>
        )}

      </div>

      {/* --- PIPELINE ANIMATION KEYFRAMES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dropInlet {
          0%   { top: 0px; }
          100% { top: 35px; }
        }
        @keyframes dropTrunk {
          0%   { top: 145px; }
          100% { top: 175px; }
        }
        @keyframes routeLeftBus {
          0%   { left: 50%; }
          100% { left: 28.5%; }
        }
        @keyframes routeRightBus {
          0%   { left: 50%; }
          100% { left: 71.5%; }
        }
        @keyframes dropTerminalGate {
          0%   { top: 175px; }
          100% { top: 220px; }
        }
        @keyframes migrateToActive {
          0%   { left: 28.5%; transform: translateX(-50%); }
          100% { left: 71.5%; transform: translateX(-50%); }
        }
        @keyframes migrateToIdle {
          0%   { left: 71.5%; transform: translateX(-50%); }
          100% { left: 28.5%; transform: translateX(-50%); }
        }
        @keyframes rackPop {
          0% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(115,115,115,0.6);
          border-radius: 8px;
        }
      `}} />
    </div>
  );
}