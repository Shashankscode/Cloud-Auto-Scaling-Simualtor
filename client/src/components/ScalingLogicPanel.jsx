import React from 'react';

export default function ScalingLogicPanel({ systemState }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-slate-200">Logic Metrics</h3>
      <div className="flex flex-col gap-4">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <p className="text-sm text-slate-400">Moving Average (Queue)</p>
          <p className="text-2xl font-mono text-white">{systemState.avgRpm} RPM</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <p className="text-sm text-slate-400">Last Action Executed</p>
          <p className="text-lg font-bold text-yellow-400">{systemState.actionTaken}</p>
        </div>
      </div>
    </div>
  );
}