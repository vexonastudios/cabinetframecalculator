import React from 'react';
import { ListChecks, CheckCircle2, Copy, Check, Info } from 'lucide-react';
import { formatFraction } from '../utils/fractionUtils';

export default function CutListTable({ calcResult }) {
  const [copiedId, setCopiedId] = React.useState(null);

  if (!calcResult) return null;

  const { cutList, outerWidthFraction, outerHeightFraction, totalLinearFeet, stockOptimization, config } = calcResult;
  const prec = config.fractionPrecision || 16;

  const handleCopyText = (item) => {
    const text = `${item.quantity}x ${item.name}: ${item.lengthFraction} (${item.lengthDecimal}")`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'RAIL':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'STILE':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'MULLION':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <ListChecks className="w-5 h-5 text-amber-400" />
            Face Frame Cut List Sheet
          </h2>
          <p className="text-xs text-slate-400">
            Exact cutting dimensions for {formatFraction(config.materialWidth, prec)} wide frame stock
          </p>
        </div>

        {/* Outer dimensions badge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-semibold">Overall Frame:</span>
          <span className="text-xs font-mono font-bold text-amber-400">
            {outerWidthFraction} W × {outerHeightFraction} H
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Qty</th>
              <th className="py-3 px-4">Part Description</th>
              <th className="py-3 px-4">Cut Length (Fraction)</th>
              <th className="py-3 px-4">Decimal (Inches)</th>
              <th className="py-3 px-4">Stock Width</th>
              <th className="py-3 px-4">Assembly Notes</th>
              <th className="py-3 px-4 text-right">Copy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs font-medium text-slate-200">
            {cutList.map((item) => (
              <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                
                {/* Qty Badge */}
                <td className="py-3 px-4">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                    {item.quantity}×
                  </span>
                </td>

                {/* Name & Type */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</span>
                  </div>
                </td>

                {/* Fraction Cut Length */}
                <td className="py-3 px-4 font-mono font-bold text-amber-400 text-sm">
                  {item.lengthFraction}
                </td>

                {/* Decimal Length */}
                <td className="py-3 px-4 font-mono text-slate-400">
                  {item.lengthDecimal}"
                </td>

                {/* Material Stock Width */}
                <td className="py-3 px-4 font-mono text-slate-300">
                  {item.widthFraction}
                </td>

                {/* Notes */}
                <td className="py-3 px-4 text-slate-400 text-xs leading-relaxed max-w-xs">
                  {item.notes}
                </td>

                {/* Copy Button */}
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleCopyText(item)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors inline-flex items-center justify-center active:scale-95"
                    title="Copy cut specs"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {cutList.map((item) => (
          <div key={item.id} className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30 shrink-0 mt-0.5">
                  {item.quantity}×
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 leading-tight">{item.subtitle}</span>
                </div>
              </div>
              
              <button
                onClick={() => handleCopyText(item)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 active:scale-95"
              >
                {copiedId === item.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="bg-slate-900 rounded-lg p-3 border border-slate-800/80 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Cut Length</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{item.lengthFraction}</span>
                <span className="font-mono text-slate-400 text-[10px] ml-1">({item.lengthDecimal}")</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Stock Width</span>
                <span className="font-mono text-slate-200 text-sm">{item.widthFraction}</span>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/50 pt-2">
              {item.notes}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Footer Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Total Pieces</span>
          <span className="text-base font-mono font-bold text-white">
            {cutList.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Linear Footage</span>
          <span className="text-base font-mono font-bold text-amber-400">
            {totalLinearFeet} ft
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Est. Stock Boards (8ft)</span>
          <span className="text-base font-mono font-bold text-emerald-400">
            {stockOptimization?.boardCount || 1}
          </span>
        </div>
      </div>

    </div>
  );
}
