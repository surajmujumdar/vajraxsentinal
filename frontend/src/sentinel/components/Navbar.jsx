import React from 'react';
import { LogOut, Bell, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PlatformToggle from '@/components/PlatformToggle';

export const Navbar = ({ onNewAssessmentClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full border-b border-rose-900/40 bg-[#070104]/95 backdrop-blur px-6 flex items-center justify-between z-50 sticky top-0 py-3 gap-4 font-hud" data-purpose="global-header">
      {/* Left: Brand Crest */}
      <div className="flex items-center space-x-3.5 flex-shrink-0">
        <img 
          src="/sentinal_logo.png" 
          alt="SENTINEL Logo" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="w-10 h-10 rounded-lg border border-rose-500/50 object-cover shadow-[0_0_15px_rgba(255,23,68,0.4)]"
        />
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-hud font-bold tracking-widest text-lg text-white drop-shadow-[0_0_8px_rgba(255,23,68,0.6)]">SENTINEL</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono border border-rose-500/40 shadow-[0_0_8px_rgba(255,23,68,0.25)]">V3.4 CORE</span>
          </div>
          <p className="text-[11px] font-mono text-rose-400/80 tracking-wider">SECURE TELEMETRY & POSTURE VISUALIZATION</p>
        </div>
      </div>

      {/* Center: Status Tickers + Global Toggle */}
      <div className="flex items-center space-x-6 flex-shrink-0">
        <div className="hidden xl:flex items-center space-x-6 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#ff1744]"></span>
            <span className="text-slate-300">SAST/DAST: <span className="text-rose-400 font-bold">ACTIVE</span></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_#ff5252]"></span>
            <span className="text-slate-300">NEURAL ENGINE: <span className="text-rose-300 font-bold">ONLINE (16,632 OPS)</span></span>
          </div>
          <div className="text-slate-300">
            DEFCON: <span className="text-rose-400 font-bold">LEVEL 2</span>
          </div>
        </div>

        <PlatformToggle />
      </div>
      
      {/* Right: Actions & User Avatar */}
      <div className="flex items-center space-x-3.5 flex-shrink-0">
        <button 
          onClick={onNewAssessmentClick}
          className="relative px-3.5 py-1.5 rounded text-xs font-mono font-semibold tracking-wider uppercase bg-rose-950/80 border border-rose-500/50 hover:border-rose-400 hover:bg-rose-500/20 text-rose-200 flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(255,23,68,0.3)] group cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-rose-400" />
          <span>NEW SCAN</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_#ff1744]"></span>
        </button>

        {/* Bell notification */}
        <button 
          className="relative p-2 rounded-lg bg-rose-950/80 border border-rose-500/50 hover:border-rose-400 hover:bg-rose-500/20 text-rose-300 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(255,23,68,0.3)] cursor-pointer" 
          title="System Notifications"
        >
          <Bell className="w-4 h-4 text-rose-400 drop-shadow-[0_0_8px_rgba(255,23,68,0.6)]" />
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400 shadow-[0_0_6px_#f43f5e]"></span>
          </span>
        </button>

        {/* User Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-rose-950 text-xs font-mono">
          <div className="w-7 h-7 rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-300 font-bold text-xs shadow-[0_0_8px_rgba(255,23,68,0.3)]">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="text-slate-300 hidden lg:inline text-xs">{user?.username || 'admin'}</span>
          <button 
            onClick={logout}
            className="ml-1 text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
