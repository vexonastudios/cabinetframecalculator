import React from 'react';
import { Hammer, Printer, Download, RefreshCw, Sparkles, Settings, FileDown } from 'lucide-react';

export default function Header({ 
  onReset, 
  onPrint, 
  onExportCSV, 
  onSelectPreset, 
  activePreset,
  onOpenSettings,
  projectCount = 0
}) {
  const presets = [
    { id: 'standard-base', label: 'Standard Base (14.5" × 30")', w: 14.5, h: 30, matW: 2.5 },
    { id: 'upper-wall', label: 'Upper Wall (11.5" × 36")', w: 11.5, h: 36, matW: 2.5 },
    { id: 'double-door', label: 'Double Door (27" × 30")', w: 27, h: 30, matW: 2.5, vOpenings: 2 },
    { id: 'drawer-door', label: 'Drawer over Door (14.5" × 30")', w: 14.5, h: 30, matW: 2.5, hOpenings: 2 }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
            <Hammer className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
              Woodcraft <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">FrameCut Pro</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Cabinet Face Frame Cut Calculator & Lumber Estimator</p>
          </div>
        </div>

        {/* Preset Quick Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                activePreset === preset.id
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
          <button
            onClick={onReset}
            title="Reset to defaults"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            Print Cut Sheet
          </button>
        </div>

      </div>
    </header>
  );
}
