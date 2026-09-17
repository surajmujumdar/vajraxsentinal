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
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, statusLabel: 'LIVE', statusColor: 'rose', isPulse: true },
    { id: 'assessments', label: 'Assessment', Icon: ClipboardCheck, subtitle: 'SYS.01' },
    { id: 'findings', label: 'Finding Explorer', Icon: Compass, subtitle: 'EXPLORER' },
    { id: 'reports', label: 'Security Reports', Icon: FileText, subtitle: 'PDF/CSV' },
    { id: 'capabilities', label: 'Engine Matrix', Icon: Layers, subtitle: 'SYNC' },
  ];

  const engineItems = [
    { id: 'sast', label: 'SAST (Static)', Icon: Code2, activeColor: 'rose', subtitle: 'CODE' },
    { id: 'dast', label: 'DAST (Web)', Icon: Globe, activeColor: 'amber', subtitle: 'WEB' },
    { id: 'sca', label: 'SCA (Deps)', Icon: Boxes, activeColor: 'purple', subtitle: 'DEPS' },
    { id: 'secrets', label: 'Secrets', Icon: KeyRound, activeColor: 'rose', subtitle: 'VAULT' },
    { id: 'capabilities', label: 'Setting', Icon: Settings, activeColor: 'rose', subtitle: 'CFG' },
  ];

  const renderItem = (item, isEngine = false) => {
    const isActive = currentTab === item.id;
    const { Icon } = item;
    
    // Active classes vs Inactive classes
    const activeBorderColor = item.activeColor === 'amber' ? 'border-l-amber-400 border-amber-400/30 text-amber-200'
      : item.activeColor === 'purple' ? 'border-l-purple-400 border-purple-400/30 text-purple-200'
      : 'border-l-rose-500 border-rose-500/40 text-rose-100';

    const activeBg = item.activeColor === 'amber' ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent'
      : item.activeColor === 'purple' ? 'bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent'
      : 'bg-gradient-to-r from-rose-600/25 via-rose-500/15 to-transparent';

    const containerClasses = isActive
      ? `group flex items-center justify-between px-4 py-2.5 rounded-xl ${activeBg} border-l-4 border-y border-r ${activeBorderColor} text-white shadow-[inset_0_0_18px_rgba(255,23,68,0.25)] transition-all cursor-pointer`
      : "group flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-300 hover:text-rose-200 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/25 transition-all cursor-pointer";
      
    const iconColor = isActive 
      ? (item.activeColor === 'amber' ? 'text-amber-400' : item.activeColor === 'purple' ? 'text-purple-400' : 'text-rose-400')
      : 'text-slate-400 group-hover:text-rose-400';
      
    const textClasses = isActive ? "font-bold tracking-wide truncate font-hud" : "truncate font-medium font-hud";

    return (
      <a key={item.id + (isEngine ? '-eng' : '')} onClick={() => onTabChange(item.id)} className={containerClasses}>
        <div className="flex items-center space-x-3.5 min-w-0">
          <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${iconColor}`} />
          <span className={`${textClasses} text-[13.5px]`}>{item.label}</span>
        </div>
        
        {item.statusLabel && (
          <span className="flex items-center space-x-1.5 flex-shrink-0">
            <span className={`w-2 h-2 rounded-full bg-rose-500 ${item.isPulse ? 'animate-pulse' : ''} shadow-[0_0_10px_#ff1744]`}></span>
            <span className={`text-[10.5px] text-rose-300 font-bold uppercase tracking-wider font-mono`}>{item.statusLabel}</span>
          </span>
        )}
        
        {item.subtitle && !item.statusLabel && (
          <span className={`text-[10px] font-mono tracking-wider transition-colors flex-shrink-0 ${
            isActive ? 'text-rose-300 font-bold' : 'text-slate-500 group-hover:text-rose-400'
          }`}>
            {item.subtitle}
          </span>
        )}
      </a>
    );
  };

  return (
    <aside 
      className="w-full lg:w-[360px] xl:w-[380px] 2xl:w-[410px] flex-shrink-0 tech-border-card rounded-2xl border border-rose-500/30 bg-command-900/95 backdrop-blur-md shadow-[0_0_45px_rgba(7,1,4,0.95)] sticky top-[80px] self-start h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] z-30 p-4 sm:p-5 select-none overflow-hidden flex flex-col justify-between"
      style={{ position: 'sticky', top: '80px' }}
      data-purpose="platform-modules-sidebar"
    >
      {/* Sidebar Header / Module Crest */}
      <div className="flex items-center justify-between pb-3 border-b border-rose-900/50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-rose-500 rounded-sm shadow-[0_0_12px_#ff1744]"></div>
          <div>
            <span className="font-hud font-bold tracking-widest text-sm uppercase text-white drop-shadow-[0_0_10px_rgba(255,23,68,0.5)]">
              PLATFORM MODULES
            </span>
            <span className="block text-[10px] font-mono text-rose-400/70 tracking-wider mt-0.5">
              NAV // V3.4 SUBSYSTEMS
            </span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-[10px] font-mono text-rose-300 font-bold tracking-wider shadow-[0_0_8px_rgba(255,23,68,0.25)]">
          ONLINE
        </span>
      </div>

      {/* Module Navigation List - Vertically Expanded, Non-Scrolling */}
      <nav className="flex-1 flex flex-col justify-evenly py-2 font-mono text-xs overflow-hidden">
        {menuItems.map(item => renderItem(item, false))}

        {/* Category Divider */}
        <div className="py-1 px-3">
          <div className="flex items-center justify-between text-[10px] text-rose-400/70 uppercase tracking-widest border-t border-rose-900/40 pt-2 font-hud">
            <span className="font-bold">ANALYSIS ENGINES</span>
            <span className="text-[9px] text-slate-400 font-mono">AUTO-SCAN</span>
          </div>
        </div>

        {engineItems.map(item => renderItem(item, true))}
      </nav>

      {/* Sidebar Mini Telemetry Pod - Anchored at Bottom */}
      <div className="pt-3 border-t border-rose-900/50 bg-command-950/70 rounded-xl p-3 border border-rose-900/40 flex-shrink-0">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span className="font-semibold text-slate-300 font-hud">PIPELINE HEALTH</span>
          <span className="text-rose-400 font-bold font-hud text-sm">99.8%</span>
        </div>
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-rose-900/60 mb-2">
          <div className="bg-gradient-to-r from-red-600 via-rose-500 to-rose-400 h-full w-[94%] shadow-[0_0_8px_#ff1744]"></div>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-rose-400/80">
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
