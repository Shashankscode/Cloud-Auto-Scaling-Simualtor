import React, { useEffect, useState } from 'react';

export default function HistoryView() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Standard fetch logic remains completely unchanged
    fetch('/api/logs')
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Failed to fetch logs", err));
  }, []);

  return (
    <div className="bg-black border border-slate-800 p-6 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] w-full max-w-5xl mx-auto flex flex-col font-sans select-none text-white h-full">
      
      <div className="mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">System Event Logs</h2>
        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Historical records of auto-scaling events</p>
      </div>

      <div className="bg-[#0a0a0a] border border-slate-800 rounded-xl overflow-hidden flex-grow shadow-inner">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111] border-b border-slate-700 text-[10px] uppercase tracking-widest text-slate-400">
              <th className="p-4 font-black">Timestamp</th>
              <th className="p-4 font-black">Action Taken</th>
              <th className="p-4 font-black">Avg RPM</th>
              <th className="p-4 font-black">Active Servers</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500 font-bold italic">No events logged yet. Start the engine to generate data.</td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-slate-400 text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${log.action.includes('Up') ? 'bg-white shadow-[0_0_5px_#fff]' : log.action.includes('Down') ? 'bg-slate-500' : 'bg-slate-700'}`}></span>
                    {log.action}
                  </td>
                  <td className="p-4 font-mono text-slate-300">{log.rpm}</td>
                  <td className="p-4 font-mono font-bold text-white">{log.activeServersCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}