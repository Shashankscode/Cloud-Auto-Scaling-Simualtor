import React, { useState, useEffect, useRef } from 'react';
import TrafficMetrics from '../components/TrafficMetrics';
import ServerDashboard from '../components/ServerDashboard';
import { Play, Square, Zap, ArrowDownToLine } from 'lucide-react';

const Dashboard = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [trafficMode, setTrafficMode] = useState('normal'); // 'normal', 'spike', 'drop'
  
  const [metrics, setMetrics] = useState({
    requests: 0,
    movingAverage: 0,
    activeServers: 1,
    queueSize: 0,
    action: "Normal"
  });

  const [settings, setSettings] = useState({ HighThreshold: 100, LowThreshold: 20, MaxServers: 5, MinServers: 1, Cooldown: 30 });
  const [serverPool, setServerPool] = useState([
    { id: 1, status: 'active' }, { id: 2, status: 'standby' },
    { id: 3, status: 'standby' }, { id: 4, status: 'standby' },
    { id: 5, status: 'standby' }
  ]);

  const simulationInterval = useRef(null);

  // Fetch initial config
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/config`)
      .then(res => res.json())
      .then(data => {
        if(data) setSettings(data);
      })
      .catch(err => console.error("Failed to fetch config", err));
  }, []);

  const sendTraffic = async (rpm) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/traffic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rpm })
      });
      const data = await res.json();
      setMetrics({
        requests: data.currentRpm,
        movingAverage: data.movingAverage,
        activeServers: data.activeServers,
        queueSize: data.queueSize,
        action: data.action
      });

      // Update local server pool visual state based on activeServers count from backend
      setServerPool(prev => {
        return prev.map((s, index) => {
          if (index < data.activeServers) {
            return { ...s, status: 'active' };
          } else {
            return { ...s, status: 'standby' };
          }
        });
      });
    } catch (err) {
      console.error("Traffic simulation error", err);
    }
  };

  useEffect(() => {
    if (isSimulating) {
      simulationInterval.current = setInterval(() => {
        let rpm = 50; // default normal
        if (trafficMode === 'spike') {
          rpm = Math.floor(Math.random() * 50) + 120; // 120-170
        } else if (trafficMode === 'drop') {
          rpm = Math.floor(Math.random() * 10) + 5; // 5-15
        } else {
          rpm = Math.floor(Math.random() * 40) + 40; // 40-80
        }
        sendTraffic(rpm);
      }, 1000); // 1 request per second
    } else {
      clearInterval(simulationInterval.current);
    }
    return () => clearInterval(simulationInterval.current);
  }, [isSimulating, trafficMode]);

  const toggleSimulation = () => setIsSimulating(!isSimulating);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Dashboard</h1>
          <p className="text-slate-400 text-sm">Real-time traffic analysis & auto-scaling monitor</p>
        </div>
        
        <div className="flex gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800 backdrop-blur">
          <button 
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isSimulating ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
          >
            {isSimulating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          </button>
          
          <div className="w-px bg-slate-800 mx-1"></div>
          
          <button 
            onClick={() => setTrafficMode('spike')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${trafficMode === 'spike' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <Zap className="w-4 h-4" />
            Spike
          </button>
          <button 
            onClick={() => setTrafficMode('normal')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${trafficMode === 'normal' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Normal
          </button>
          <button 
            onClick={() => setTrafficMode('drop')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${trafficMode === 'drop' ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            <ArrowDownToLine className="w-4 h-4" />
            Drop
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-4">
         <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Queue</div>
            <div className="text-white font-mono">{metrics.queueSize}s</div>
         </div>
         <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Moving Avg</div>
            <div className="text-white font-mono">{metrics.movingAverage} RPM</div>
         </div>
         <div className="bg-slate-900/80 border border-slate-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Last Action</div>
            <div className={`font-mono font-bold ${metrics.action === 'Scale Up' ? 'text-rose-400' : metrics.action === 'Scale Down' ? 'text-emerald-400' : 'text-slate-300'}`}>{metrics.action}</div>
         </div>
      </div>

      {/* Recharts Traffic Visuals */}
      {/* We convert our RPM into the "cpuLoad" prop for the visual gauge to look cool */}
      <TrafficMetrics 
        requests={metrics.requests} 
        cpuLoad={Math.min(100, (metrics.movingAverage / settings.HighThreshold) * 100).toFixed(0)} 
        settings={{ upper: settings.HighThreshold, lower: settings.LowThreshold }} 
      />

      {/* 3D Server Dashboard */}
      {/* Note: we override the remove/deploy manual functions since backend controls it */}
      <ServerDashboard 
        serverPool={serverPool} 
        deployServer={() => {}} 
        removeServer={() => {}} 
        requests={metrics.requests}
      />
    </div>
  );
};

export default Dashboard;
