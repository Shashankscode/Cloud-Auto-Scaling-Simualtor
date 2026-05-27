import React from 'react';

export default function ServerDashboard({ activeServers = [], idleServers = [] }) {
  return (
    <div className="grid grid-cols-2 gap-8 flex-grow">
      <div className="bg-slate-950 border border-green-500/30 rounded-xl p-5 shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]">
        <h4 className="text-center font-bold text-green-400 mb-4 uppercase text-xs tracking-wider">Active Working Array</h4>
        <div className="flex flex-col gap-3">
          {activeServers.map((server) => (
            <div key={server.id} className="bg-green-500/10 border border-green-500/50 p-3 rounded-lg flex justify-between items-center">
              <span className="font-mono text-green-300 text-sm">{server.id}</span>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-700 rounded-xl p-5">
        <h4 className="text-center font-bold text-slate-400 mb-4 uppercase text-xs tracking-wider">Idle Wait Array</h4>
        <div className="flex flex-col gap-3">
          {idleServers.map((server) => (
            <div key={server.id} className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex justify-between items-center opacity-50">
              <span className="font-mono text-slate-400 text-sm">{server.id}</span>
              <span className="h-3 w-3 rounded-full bg-slate-500"></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}