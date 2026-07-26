import React, { useState } from 'react';
import { ClipboardCheck, Check, Trash2, Printer, Download, Plus, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { formatFraction } from '../utils/fractionUtils';

export default function MasterBatchList({ batchList, onToggleCheckItem, onRemoveFrame, onClearBatch }) {
  if (!batchList || batchList.length === 0) return null;

  // Calculate total statistics across all added frames
  let totalPieces = 0;
  let completedPieces = 0;
  let totalInches = 0;

  batchList.forEach(frame => {
    frame.items.forEach(item => {
      const count = item.quantity || 1;
      totalPieces += count;
      if (item.checked) completedPieces += count;
      totalInches += (item.length || 0) * count;
    });
  });

  const totalFeet = (totalInches / 12).toFixed(1);
  const progressPercent = totalPieces > 0 ? Math.round((completedPieces / totalPieces) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/30 pb-3.5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 shadow-md">
            <ClipboardCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white font-display tracking-tight">
                MASTER WORKSHOP JOB LIST
              </h2>
              <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow">
                {batchList.length} {batchList.length === 1 ? 'Frame' : 'Frames'} Added
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-300/80 mt-0.5">
              Check off cuts as you make them at your saw
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onClearBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear List
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-300">Cut Completion: {completedPieces} of {totalPieces} pieces done</span>
          <span className="text-amber-400 font-mono">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
          <div 
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Frame Batches Accordion / List */}
      <div className="space-y-4">
        {batchList.map((frame, frameIdx) => (
          <div key={frame.id || frameIdx} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
            
            {/* Frame Banner Header */}
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-bold text-white text-sm">{frame.title}</span>
                <span className="text-xs text-slate-400 font-mono">({frame.openingWidth}" × {frame.openingHeight}")</span>
              </div>
              <button
                onClick={() => onRemoveFrame(frame.id)}
                className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                title="Remove this frame from master list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* List of Cuts inside Frame */}
            <div className="divide-y divide-slate-800/60 p-2 sm:p-3 space-y-2">
              {frame.items.map((item) => {
                const itemKey = `${frame.id}_${item.id}`;
                return (
                  <div
                    key={itemKey}
                    onClick={() => onToggleCheckItem(frame.id, item.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                      item.checked
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-400 opacity-60'
                        : 'bg-slate-900 border-slate-800 text-white hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Interactive Checkbox */}
                      <button type="button" className="shrink-0">
                        {item.checked ? (
                          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-md border-2 border-slate-600 hover:border-amber-400 bg-slate-850" />
                        )}
                      </button>

                      {/* Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${item.checked ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.quantity}× {item.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block">Width: {item.widthFraction}</span>
                      </div>
                    </div>

                    {/* Cut Length */}
                    <div className="text-right shrink-0">
                      <span className={`font-mono font-black text-lg block ${item.checked ? 'line-through text-slate-500' : 'text-emerald-400'}`}>
                        {item.lengthFraction}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">({item.lengthDecimal}")</span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
