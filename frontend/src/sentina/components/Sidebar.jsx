import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Compass, 
  FileText, 
  Layers, 
  Code2, 
  Globe, 
  Boxes, 
  KeyRound, 
  Settings 
} from 'lucide-react';

export const Sidebar = ({ currentTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, statusLabel: 'LIVE', statusColor: 'cyan', isPulse: true },
    { id: 'assessments', label: 'Assessment', Icon: ClipboardCheck, subtitle: 'SYS.01' },
    { id: 'findings', label: 'Finding Explorer', Icon: Compass, subtitle: 'EXPLORER' },
    { id: 'reports', label: 'Security Reports', Icon: FileText, subtitle: 'PDF/CSV' },
    { id: 'capabilities', label: 'Engine Matrix', Icon: Layers, subtitle: 'SYNC' },
  ];

  const engineItems = [
    { id: 'sast', label: 'SAST (Static)', Icon: Code2, activeColor: 'cyan', subtitle: 'CODE' },
    { id: 'dast', label: 'DAST (Web)', Icon: Globe, activeColor: 'amber', subtitle: 'WEB' },
    { id: 'sca', label: 'SCA (Deps)', Icon: Boxes, activeColor: 'purple', subtitle: 'DEPS' },
    { id: 'secrets', label: 'Secrets', Icon: KeyRound, activeColor: 'rose', subtitle: 'VAULT' },
    { id: 'capabilities', label: 'Setting', Icon: Settings, activeColor: 'cyan', subtitle: 'CFG' },
  ];

  const renderItem = (item, isEngine = false) => {
    const isActive = currentTab === item.id;
    const { Icon } = item;
    
    // Active classes vs Inactive classes
    const activeBorderColor = item.activeColor === 'amber' ? 'border-l-amber-400 border-amber-400/30 text-amber-200'
      : item.activeColor === 'purple' ? 'border-l-purple-400 border-purple-400/30 text-purple-200'
      : item.activeColor === 'rose' ? 'border-l-rose-400 border-rose-400/30 text-rose-200'
      : 'border-l-cyan-400 border-cyan-400/30 text-cyan-200';

    const activeBg = item.activeColor === 'amber' ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent'
      : item.activeColor === 'purple' ? 'bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent'
      : item.activeColor === 'rose' ? 'bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-transparent'
      : 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-transparent';

    const containerClasses = isActive
      ? `group flex items-center justify-between px-3.5 py-2.5 rounded-xl ${activeBg} border-l-4 border-y border-r ${activeBorderColor} text-white shadow-[inset_0_0_18px_rgba(6,182,212,0.15)] transition-all cursor-pointer`
      : "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-cyan-200 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/25 transition-all cursor-pointer";
      
    const iconColor = isActive 
      ? (item.activeColor === 'amber' ? 'text-amber-400' : item.activeColor === 'purple' ? 'text-purple-400' : item.activeColor === 'rose' ? 'text-rose-400' : 'text-cyan-300')
      : 'text-slate-400 group-hover:text-cyan-400';
      
    const textClasses = isActive ? "font-semibold tracking-wide truncate" : "truncate";

    return (
      <a key={item.id + (isEngine ? '-eng' : '')} onClick={() => onTabChange(item.id)} className={containerClasses}>
        <div className="flex items-center space-x-3 min-w-0">
          <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${iconColor}`} />
          <span className={`${textClasses} text-[13px]`}>{item.label}</span>
        </div>
        
        {item.statusLabel && (
          <span className="flex items-center space-x-1.5 flex-shrink-0">
            <span className={`w-2 h-2 rounded-full bg-${item.statusColor}-400 ${item.isPulse ? 'animate-pulse' : ''} shadow-[0_0_8px_#38bdf8]`}></span>
            <span className={`text-[10px] text-${item.statusColor}-300 font-bold uppercase tracking-wider`}>{item.statusLabel}</span>
          </span>
        )}
        
        {item.subtitle && !item.statusLabel && (
          <span className={`text-[10px] font-mono tracking-wider transition-colors flex-shrink-0 ${
            isActive ? 'text-cyan-300/90 font-bold' : 'text-slate-500 group-hover:text-cyan-400'
          }`}>
            {item.subtitle}
          </span>
        )}
      </a>
    );
  };

  return (
    <aside className="w-full lg:w-80 xl:w-[340px] flex-shrink-0 tech-border-card rounded-2xl border border-cyan-500/30 bg-command-900/95 backdrop-blur-md shadow-[0_0_45px_rgba(2,6,23,0.9)] sticky top-20 z-30 p-5" data-purpose="platform-modules-sidebar">
      {/* Sidebar Header / Module Crest */}
      <div className="flex items-center justify-between pb-3.5 border-b border-cyan-900/50 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-sm shadow-[0_0_10px_#38bdf8]"></div>
          <div>
            <span className="font-hud font-bold tracking-widest text-sm uppercase text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
              PLATFORM MODULES
            </span>
            <span className="block text-[10px] font-mono text-cyan-400/70 tracking-wider mt-0.5">
              NAV // V3.4 SUBSYSTEMS
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold tracking-wider">
          ONLINE
        </span>
      </div>

      {/* Module Navigation List */}
      <nav className="space-y-1.5 font-mono text-xs max-h-[calc(100vh-210px)] overflow-y-auto hud-scrollbar pr-1">
        {menuItems.map(item => renderItem(item, false))}

        {/* Category Divider */}
        <div className="pt-3 pb-1.5 px-3">
          <div className="flex items-center justify-between text-[10px] text-cyan-400/70 uppercase tracking-widest border-t border-cyan-900/50 pt-3">
            <span className="font-bold">ANALYSIS ENGINES</span>
            <span className="text-[9px] text-slate-400">AUTO-SCAN</span>
          </div>
        </div>

        {engineItems.map(item => renderItem(item, true))}
      </nav>

      {/* Sidebar Mini Telemetry Pod */}
      <div className="mt-5 pt-3.5 border-t border-cyan-900/50 bg-command-950/70 rounded-xl p-3 border border-cyan-800/40">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span className="font-semibold text-slate-300">PIPELINE HEALTH</span>
          <span className="text-cyan-300 font-bold font-hud">99.8%</span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-900/60 mb-2">
          <div className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full w-[94%] shadow-[0_0_8px_#38bdf8]"></div>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80">
          <span className="text-slate-400">HOST: sentinel-node-04</span>
          <span className="text-emerald-400 font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ACTIVE</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
