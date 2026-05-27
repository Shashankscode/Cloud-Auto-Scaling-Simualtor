import React, { useState } from 'react';

export default function SettingsView() {
  const [thresholds, setThresholds] = useState({
    highThreshold: 100,
    lowThreshold: 20
  });

  const handleSave = (e) => {
    e.preventDefault();
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thresholds)
    }).then(() => alert('Configuration Saved Successfully!'));
  };

  return (
    <div className="bg-[#050505] border border-cyan-900/50 p-6 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.05)] w-full max-w-3xl mx-auto flex flex-col font-sans select-none text-slate-300">
      
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black tracking-tight text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">System Settings</h2>
        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Configure algorithmic scaling parameters</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        
        {/* High Threshold Card */}
        <div className="bg-[#0a0a0a] border border-slate-800 p-5 rounded-xl flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-amber-500">Scale-Up Threshold (RPM)</label>
          <input 
            type="number" 
            value={thresholds.highThreshold}
            onChange={(e) => setThresholds({...thresholds, highThreshold: Number(e.target.value)})}
            className="bg-[#000] border border-cyan-900/80 text-cyan-300 font-mono text-lg p-3 rounded-lg focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all w-full max-w-xs"
          />
          <span className="text-xs text-slate-500 italic">Triggers the addition of a new server from the Standby Cluster.</span>
        </div>

        {/* Low Threshold Card */}
        <div className="bg-[#0a0a0a] border border-slate-800 p-5 rounded-xl flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-rose-500">Scale-Down Threshold (RPM)</label>
          <input 
            type="number" 
            value={thresholds.lowThreshold}
            onChange={(e) => setThresholds({...thresholds, lowThreshold: Number(e.target.value)})}
            className="bg-[#000] border border-cyan-900/80 text-cyan-300 font-mono text-lg p-3 rounded-lg focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all w-full max-w-xs"
          />
          <span className="text-xs text-slate-500 italic">Triggers the removal of a server back to the Standby Cluster.</span>
        </div>

        <button 
          type="submit" 
          className="mt-4 w-full md:w-auto self-start px-8 py-3.5 rounded-xl text-xs font-black tracking-widest transition-all bg-cyan-950/60 text-cyan-300 border border-cyan-700 hover:bg-cyan-900 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
        >
          SAVE ALGORITHM PARAMETERS
        </button>

      </form>
    </div>
  );
}