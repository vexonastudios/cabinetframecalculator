import React from 'react';
import { Package, Percent, Scissors, CheckCircle } from 'lucide-react';
import { formatFraction } from '../utils/fractionUtils';

export default function LumberOptimizer({ stockOptimization, fractionPrecision = 16 }) {
  if (!stockOptimization) return null;

  const { boardCount, stockLength, stockLengthFraction, boards, wasteFraction, wastePercentage } = stockOptimization;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <Package className="w-5 h-5 text-emerald-400" />
            Lumber Stock & Cut Pattern Optimizer
          </h2>
          <p className="text-xs text-slate-400">
            Nesting plan for {stockLengthFraction} stock boards (includes 1/8" blade kerf loss)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold">
            {boardCount} Board{boardCount > 1 ? 's' : ''} Needed
          </span>
          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-mono">
            Waste: {wastePercentage}% ({wasteFraction})
          </span>
        </div>
      </div>

      {/* Board Cut Visualizers */}
      <div className="space-y-3">
        {boards.map((board) => (
          <div key={board.boardIndex} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            
            {/* Board Title & Yield */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Stock Board #{board.boardIndex} ({board.stockLengthFraction})
              </span>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span>Used: <strong className="text-amber-400">{board.usedFraction}</strong></span>
                <span>Offcut / Scrap: <strong className="text-slate-300">{board.remainingFraction}</strong></span>
              </div>
            </div>

            {/* Visual Board Cut Strip */}
            <div className="relative h-9 w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center p-1 gap-1">
              {board.cuts.map((cut, idx) => {
                const widthPercent = (cut.length / stockLength) * 100;
                const isStile = cut.type === 'STILE';

                return (
                  <div
                    key={cut.id}
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full rounded relative flex items-center justify-center px-1 border group transition-all ${
                      isStile
                        ? 'bg-sky-600/80 hover:bg-sky-500 border-sky-400/50 text-white'
                        : 'bg-amber-600/80 hover:bg-amber-500 border-amber-400/50 text-slate-950'
                    }`}
                    title={`${cut.name}: ${cut.lengthFraction}`}
                  >
                    <span className="text-[10px] font-mono font-bold truncate drop-shadow">
                      {cut.lengthFraction}
                    </span>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block z-20 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg border border-slate-700 whitespace-nowrap font-mono">
                      {cut.name} ({cut.lengthFraction})
                    </div>
                  </div>
                );
              })}

              {/* Remaining Offcut / Scrap space */}
              {board.remainingLength > 0 && (
                <div
                  style={{ width: `${(board.remainingLength / stockLength) * 100}%` }}
                  className="h-full rounded bg-slate-800/60 border border-dashed border-slate-700/60 flex items-center justify-center text-[10px] text-slate-400 font-mono italic"
                >
                  {board.remainingFraction}
                </div>
              )}
            </div>

            {/* List of Cuts on this Board */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 pt-0.5">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Cuts:</span>
              {board.cuts.map((c, i) => (
                <span key={i} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                  {c.name}: <strong className="text-amber-400">{c.lengthFraction}</strong>
                </span>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
