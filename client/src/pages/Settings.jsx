import React, { useState, useEffect } from 'react';
import { Save, Sliders, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState({
    HighThreshold: 100,
    LowThreshold: 20,
    MaxServers: 5,
    MinServers: 1,
    Cooldown: 30
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/config`)
      .then(res => res.json())
      .then(data => {
        if(data) setConfig(data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: parseInt(e.target.value) || 0 });
    setSaveSuccess(false);
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
    setIsSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Configuration Parameters</h1>
          <p className="text-slate-400 text-sm">Tune the auto-scaling heuristic variables</p>
        </div>
        <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded border border-amber-500/20 flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4" />
          Changes apply instantly
        </div>
      </div>

      <form onSubmit={saveConfig} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800">
          <Sliders className="text-cyan-400 w-5 h-5" />
          <h2 className="text-lg font-semibold text-white">Threshold Tuning</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">High Load Threshold (RPM)</label>
            <input 
              type="number" name="HighThreshold" 
              value={config.HighThreshold} onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-rose-400 font-mono text-lg focus:outline-none focus:border-rose-500"
            />
            <p className="text-xs text-slate-500 mt-2">Triggers SCALE UP if moving average exceeds this value.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Low Load Threshold (RPM)</label>
            <input 
              type="number" name="LowThreshold" 
              value={config.LowThreshold} onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-cyan-400 font-mono text-lg focus:outline-none focus:border-cyan-500"
            />
            <p className="text-xs text-slate-500 mt-2">Triggers SCALE DOWN if moving average drops below this value.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-6 border-t border-slate-800">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Server Instances</label>
            <input 
              type="number" name="MaxServers" 
              value={config.MaxServers} onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Min Server Instances</label>
            <input 
              type="number" name="MinServers" 
              value={config.MinServers} onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cooldown Period (Seconds)</label>
            <input 
              type="number" name="Cooldown" 
              value={config.Cooldown} onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
              saveSuccess 
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]'
            }`}
          >
            <Save className="w-5 h-5" />
            {saveSuccess ? 'CONFIG SAVED' : 'SAVE CONFIGURATION'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
