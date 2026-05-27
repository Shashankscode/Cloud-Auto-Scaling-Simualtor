import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import MainDashboardView from './components/MainDashboardView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';

// Custom component to handle active link styling dynamically with glowing cyan hues
function SidebarLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`p-3 rounded-xl font-bold text-sm transition-all border ${
        isActive 
          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
          : 'bg-[#0a0a0a] hover:bg-[#111] text-slate-500 border-slate-800/60 hover:text-cyan-500 hover:border-cyan-900/50'
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-slate-300 font-sans flex">
        
        {/* --- PREMIUM NEON SIDEBAR PANEL --- */}
        <aside className="w-64 bg-[#030303] border-r border-slate-800 p-6 flex flex-col gap-4 z-20 shrink-0">
          <div className="mb-6 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              CloudAutoscaling Simulator
            </h1>
            
          </div>
          
          <nav className="flex flex-col gap-3">
            <SidebarLink to="/">Dashboard</SidebarLink>
            <SidebarLink to="/history">Event Logs</SidebarLink>
            <SidebarLink to="/settings">System Settings</SidebarLink>
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-900 text-center">
             <span className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">
               Status: <span className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]">Operational</span>
             </span>
          </div>
        </aside>

        {/* --- MAIN BLACK CONTENT WINDOW --- */}
        <main className="flex-1 p-8 overflow-y-auto bg-black">
          <Routes>
            <Route path="/" element={<MainDashboardView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}