import React from 'react';
import { Package, Percent, Scissors, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatFraction } from '../utils/fractionUtils';

export default function LumberOptimizer({ stockOptimization, stockBoardLength = 96, onStockLengthChange }) {
  if (!stockOptimization) return null;

  const { boardCount, stockLength, stockLengthFraction, boards, wasteFraction, wastePercentage } = stockOptimization;
  const yieldPercentage = (100 - parseFloat(wastePercentage || 0)).toFixed(1);

  return (
    <div className="bg-slate-900 border-2 border-emerald-500/70 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/30 pb-3.5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
            <Package className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white font-display tracking-tight">
                8FT BOARD CUT MAP (MINIMUM WASTE)
              </h2>
              <span className="bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow">
                OPTIMIZED
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-300/80 mt-0.5">
              Exact cut sequence for {stockLengthFraction} stock boards (1/8" blade kerf accounted)
            </p>
          </div>
        </div>

        {/* Board Length Selector & Yield stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onStockLengthChange && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[96, 120, 144].map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => onStockLengthChange(len)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    stockBoardLength === len
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {len / 12}' Board
                </button>
              ))}
            </div>
          )}

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Yield</span>
            <span className="text-sm font-mono font-black text-emerald-400">{yieldPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Summary Yield Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Boards Needed</span>
          <span className="text-lg font-mono font-black text-white">{boardCount} × 8ft Boards</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Lumber Used</span>
          <span className="text-lg font-mono font-black text-emerald-400">
            {boards.reduce((sum, b) => sum + (b.usedInches || 0), 0) / 12 > 0
              ? (boards.reduce((sum, b) => sum + (b.usedInches || 0), 0) / 12).toFixed(1)
              : '0'} ft
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Scrap / Offcut</span>
          <span className="text-lg font-mono font-black text-amber-400">{wasteFraction}</span>
        </div>
      </div>

      {/* 8ft Board Visual Diagrams & Step-by-Step Cut Order */}
      <div className="space-y-4 pt-1">
        {boards.map((board) => (
          <div key={board.boardIndex} className="bg-slate-950 p-4 rounded-xl border-2 border-slate-800 space-y-3">
            
            {/* Board Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 border-b border-slate-800/80 pb-2">
              <span className="font-black text-white text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                8FT BOARD #{board.boardIndex}
              </span>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                <span>Used: <strong className="text-emerald-400">{board.usedFraction}</strong></span>
                <span>Usable Offcut: <strong className="text-amber-400">{board.remainingFraction}</strong></span>
              </div>
            </div>

            {/* Visual Board Strip */}
            <div className="relative h-10 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 flex items-center p-1 gap-1 shadow-inner">
              {board.cuts.map((cut, idx) => {
                const widthPercent = (cut.length / stockLength) * 100;
                const isStile = cut.type === 'STILE';

                return (
                  <div
                    key={cut.id || idx}
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full rounded-lg relative flex items-center justify-center px-1 border transition-all ${
                      isStile
                        ? 'bg-sky-600 border-sky-400 text-white'
                        : 'bg-emerald-600 border-emerald-400 text-slate-950 font-black'
                    }`}
                  >
                    <span className="text-xs font-mono font-black truncate drop-shadow">
                      {cut.lengthFraction}
                    </span>
                  </div>
                );
              })}

              {/* Scrap Offcut */}
              {board.remainingLength > 0 && (
                <div
                  style={{ width: `${(board.remainingLength / stockLength) * 100}%` }}
                  className="h-full rounded-lg bg-slate-800/80 border border-dashed border-slate-600 flex items-center justify-center text-xs text-amber-400 font-mono italic font-bold"
                >
                  {board.remainingFraction} (Scrap)
                </div>
              )}
            </div>

            {/* Step-by-Step Cut Order Sequence */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                CUT SEQUENCE (FROM LEFT TO RIGHT):
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                {board.cuts.map((cut, i) => (
                  <React.Fragment key={i}>
                    <div className="bg-slate-950 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500">#{i + 1}</span>
                      <span className="font-bold text-white">{cut.name}</span>
                      <span className="font-black text-emerald-400">{cut.lengthFraction}</span>
                    </div>
                    {i < board.cuts.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                ))}

                {board.remainingLength > 0 && (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <div className="bg-slate-950/60 px-2.5 py-1 rounded-md border border-dashed border-amber-500/40 text-amber-300 text-xs">
                      Offcut Leftover: <strong>{board.remainingFraction}</strong>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
