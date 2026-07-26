import React, { useState } from 'react';
import { Settings, X, Save } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, currentSettings, onSaveSettings }) {
  const [localSettings, setLocalSettings] = useState(currentSettings);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800 bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <Settings className="w-5 h-5 text-emerald-400" />
            Shop Defaults
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-5">
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Material & Cutting</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Material Width (Inches)</label>
              <input
                type="number"
                step="0.125"
                min="0.5"
                value={localSettings.materialWidth || 2.5}
                onChange={(e) => handleChange('materialWidth', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Saw Blade Kerf (Inches)</label>
              <input
                type="number"
                step="0.03125"
                min="0"
                value={localSettings.sawKerf || 0.125}
                onChange={(e) => handleChange('sawKerf', parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Default Joint Style</label>
              <select
                value={localSettings.jointStyle || 'CONTINUOUS_RAILS'}
                onChange={(e) => handleChange('jointStyle', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
              >
                <option value="CONTINUOUS_RAILS">Continuous Top & Bottom Rails</option>
                <option value="CONTINUOUS_STILES">Continuous Side Stiles</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimating</h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cost per 8ft Stock Board ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={localSettings.costPerBoard || 0}
                  onChange={(e) => handleChange('costPerBoard', parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-3 py-2 text-white font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Defaults
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
