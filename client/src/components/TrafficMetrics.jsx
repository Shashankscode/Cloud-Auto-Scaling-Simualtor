import React from 'react';

export default function TrafficMetrics({ simulatedRpm }) {
  return (
    <div className="flex flex-col items-center mb-8 w-full">
       <div className="bg-purple-500/20 border border-purple-500 px-6 py-2 rounded-full text-purple-300 font-mono text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse">
          Incoming Traffic: {simulatedRpm} Req/Min
       </div>
       <div className="h-8 w-px bg-slate-600 my-1"></div>
       <div className="border border-blue-500 bg-blue-500/10 px-8 py-3 rounded-lg text-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <h4 className="font-bold text-blue-400 uppercase tracking-widest text-sm">Application Load Balancer</h4>
       </div>
       <div className="h-8 w-px bg-slate-600 my-1"></div>
    </div>
  );
}