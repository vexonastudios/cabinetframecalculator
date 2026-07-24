import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Plus, Trash2, Layers, Check, Download, FileSpreadsheet } from 'lucide-react';
import { formatFraction } from '../utils/fractionUtils';
import { calculateCabinetFrame } from '../utils/cabinetMath';

const STORAGE_KEY = 'woodcraft_saved_projects_v1';

export default function ProjectManager({ currentParams, onLoadParams }) {
  const [savedFrames, setSavedFrames] = useState([]);
  const [frameName, setFrameName] = useState('Upper Cabinet 1');
  const [showSavedList, setShowSavedList] = useState(false);

  useEffect(() => {
    try {
      const loaded = localStorage.getItem(STORAGE_KEY);
      if (loaded) {
        setSavedFrames(JSON.parse(loaded));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToStorage = (list) => {
    setSavedFrames(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleSaveCurrent = () => {
    const newFrame = {
      id: Date.now().toString(),
      name: frameName || `Cabinet ${savedFrames.length + 1}`,
      savedAt: new Date().toLocaleDateString(),
      params: { ...currentParams }
    };

    const updated = [...savedFrames, newFrame];
    saveToStorage(updated);
    setFrameName(`Cabinet ${updated.length + 1}`);
  };

  const handleDeleteFrame = (id) => {
    const updated = savedFrames.filter(f => f.id !== id);
    saveToStorage(updated);
  };

  // Roll up combined project cut list
  const combinedRollup = React.useMemo(() => {
    if (savedFrames.length === 0) return null;

    let totalBoards = 0;
    let totalPieces = 0;
    let totalFeet = 0;
    const itemSummary = {};

    savedFrames.forEach((frame) => {
      const calc = calculateCabinetFrame(frame.params);
      totalFeet += parseFloat(calc.totalLinearFeet) || 0;
      totalBoards += calc.stockOptimization?.boardCount || 0;

      calc.cutList.forEach((cut) => {
        const key = `${cut.name} (${cut.lengthFraction})`;
        if (!itemSummary[key]) {
          itemSummary[key] = {
            name: cut.name,
            lengthFraction: cut.lengthFraction,
            quantity: 0
          };
        }
        itemSummary[key].quantity += cut.quantity;
        totalPieces += cut.quantity;
      });
    });

    return {
      totalBoards,
      totalPieces,
      totalFeet: totalFeet.toFixed(1),
      itemSummary: Object.values(itemSummary)
    };
  }, [savedFrames]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <Layers className="w-5 h-5 text-amber-400" />
            Project Job Manager & Multi-Frame Rollup
          </h2>
          <p className="text-xs text-slate-400">Save multiple frames and calculate whole-job lumber totals</p>
        </div>

        <button
          onClick={() => setShowSavedList(!showSavedList)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 self-start"
        >
          <FolderOpen className="w-4 h-4 text-amber-400" />
          {showSavedList ? 'Hide Saved Job Frames' : `View Saved Frames (${savedFrames.length})`}
        </button>
      </div>

      {/* Save current frame form */}
      <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <input
          type="text"
          value={frameName}
          onChange={(e) => setFrameName(e.target.value)}
          placeholder="Name this cabinet frame (e.g. Island Left)"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-amber-500"
        />
        <button
          onClick={handleSaveCurrent}
          className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" /> Save Frame
        </button>
      </div>

      {/* Saved Frames List */}
      {showSavedList && (
        <div className="space-y-2 pt-1">
          {savedFrames.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 text-center">No saved frames in this project yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedFrames.map((frame) => (
                <div
                  key={frame.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">{frame.name}</span>
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Opening: {frame.params.openingWidth}" × {frame.params.openingHeight}"
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onLoadParams(frame.params)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 rounded text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteFrame(frame.id)}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Combined Project Rollup Summary */}
      {combinedRollup && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
            <span className="font-bold text-amber-300 uppercase tracking-wider">Whole Job Lumber Rollup ({savedFrames.length} Frames)</span>
            <span className="font-mono text-slate-400">{combinedRollup.totalPieces} total pieces</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Feet</span>
              <span className="text-sm font-mono font-bold text-amber-400">{combinedRollup.totalFeet} ft</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">8ft Boards</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{combinedRollup.totalBoards} boards</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Saved Frames</span>
              <span className="text-sm font-mono font-bold text-sky-400">{savedFrames.length}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
