import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Download, Clock, Server, Activity } from 'lucide-react';

const History = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/logs`)
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error(err));
  }, []);

  const exportCSV = () => {
    if (logs.length === 0) return;
    const csv = Papa.unparse(logs.map(log => ({
      Timestamp: new Date(log.Timestamp).toLocaleString(),
      RPM: log.RPM,
      Action: log.Action,
      ServersActive: log.ServersActive
    })));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'autoscaling_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Event Logs</h1>
          <p className="text-slate-400 text-sm">Historical record of all auto-scaling triggers</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium flex items-center gap-2"><Clock className="w-3 h-3"/> Timestamp</th>
                <th className="px-6 py-4 font-medium"><Activity className="w-3 h-3 inline mr-2"/> RPM</th>
                <th className="px-6 py-4 font-medium">Event Action</th>
                <th className="px-6 py-4 font-medium"><Server className="w-3 h-3 inline mr-2"/> Active Servers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No events recorded yet.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-slate-300 text-sm font-mono">{new Date(log.Timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-white font-mono">{log.RPM}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        log.Action === 'Scale Up' ? 'bg-rose-500/20 text-rose-400' :
                        log.Action === 'Scale Down' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {log.Action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-cyan-400 font-mono">{log.ServersActive}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
