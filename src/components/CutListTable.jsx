import React from 'react';
import { ListChecks, Copy, Check, Scissors } from 'lucide-react';
import { formatFraction } from '../utils/fractionUtils';

export default function CutListTable({ calcResult, onAddToMasterList }) {
  const [copiedId, setCopiedId] = React.useState(null);
  const [addedSuccess, setAddedSuccess] = React.useState(false);
  const [checkedCuts, setCheckedCuts] = React.useState({});

  if (!calcResult) return null;

  const { cutList, outerWidthFraction, outerHeightFraction, totalLinearFeet, stockOptimization, config } = calcResult;
  const prec = config.fractionPrecision || 16;

  const handleCopyText = (item) => {
    const text = `${item.quantity}x ${item.name}: ${item.lengthFraction} (${item.lengthDecimal}")`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCheckCut = (id) => {
    setCheckedCuts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const completedCount = cutList.filter(item => checkedCuts[item.id]).length;
  const totalCount = cutList.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'RAIL':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'STILE':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'MULLION':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-emerald-950/60 ring-1 ring-emerald-500/30 space-y-4">
      
      {/* High-Visibility Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/30 pb-3.5 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 shadow-md shadow-emerald-500/10">
            <Scissors className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white font-display tracking-tight">
                CUT LIST SHEET
              </h2>
              <span className="bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow">
                WHAT TO CUT
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-300/80 mt-0.5">
              Cut dimensions for {formatFraction(config.materialWidth, prec)} stock board
            </p>
          </div>
        </div>

        {/* Outer dimensions badge & Check Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-emerald-500/40 shadow-inner">
            <span className="text-xs text-slate-400 font-semibold">Frame:</span>
            <span className="text-sm font-mono font-black text-emerald-400">
              {outerWidthFraction} × {outerHeightFraction}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddBatch}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all transform active:scale-95 border ${
              addedSuccess
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 scale-105'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border-emerald-400'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            {addedSuccess ? 'ADDED TO JOB LIST!' : 'SAVE TO MASTER LIST'}
          </button>
        </div>
      </div>

      {/* Live Cut Progress Bar */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Progress:</span>
          <span className="text-xs font-mono font-black text-emerald-400">
            {completedCount} of {totalCount} cuts completed
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">{progressPercent}%</span>
        </div>

        {completedCount > 0 && (
          <button
            onClick={() => setCheckedCuts({})}
            className="text-[10px] text-slate-400 hover:text-white underline font-semibold"
          >
            Reset
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-emerald-500/20 bg-slate-900/90 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              <th className="py-3 px-4 text-center">Done</th>
              <th className="py-3 px-4">Qty</th>
              <th className="py-3 px-4">Part Description</th>
              <th className="py-3 px-4 text-emerald-400">CUT LENGTH (FRACTION)</th>
              <th className="py-3 px-4">Decimal</th>
              <th className="py-3 px-4">Stock Width</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-right">Copy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs font-medium text-slate-200">
            {cutList.map((item) => {
              const isChecked = !!checkedCuts[item.id];
              return (
                <tr 
                  key={item.id} 
                  onClick={() => toggleCheckCut(item.id)}
                  className={`cursor-pointer transition-colors ${
                    isChecked ? 'bg-emerald-950/40 text-slate-400 opacity-60' : 'hover:bg-emerald-950/30'
                  }`}
                >
                  {/* Checkbox Column */}
                  <td className="py-3.5 px-4 text-center select-none">
                    <div className={`w-5 h-5 rounded mx-auto flex items-center justify-center border transition-all ${
                      isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600 bg-slate-900'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </td>

                  {/* Qty Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-mono font-black text-sm shadow ${
                      isChecked ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {item.quantity}×
                    </span>
                  </td>

                  {/* Name & Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold text-sm ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                          {item.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</span>
                    </div>
                  </td>

                  {/* Fraction Cut Length - Stand Out */}
                  <td className={`py-3.5 px-4 font-mono font-black text-base ${isChecked ? 'line-through text-slate-500' : 'text-emerald-400'}`}>
                    {item.lengthFraction}
                  </td>

                  {/* Decimal Length */}
                  <td className="py-3.5 px-4 font-mono text-slate-400 font-semibold">
                    {item.lengthDecimal}"
                  </td>

                  {/* Material Stock Width */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {item.widthFraction}
                  </td>

                  {/* Notes */}
                  <td className="py-3.5 px-4 text-slate-300 text-xs leading-relaxed max-w-xs">
                    {item.notes}
                  </td>

                  {/* Copy Button */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleCopyText(item)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors inline-flex items-center justify-center active:scale-95 border border-slate-700"
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile High-Contrast Cards - Simplified & Easy to Read */}
      <div className="md:hidden space-y-3">
        {cutList.map((item) => {
          const isChecked = !!checkedCuts[item.id];
          return (
            <div 
              key={item.id} 
              onClick={() => toggleCheckCut(item.id)}
              className={`rounded-xl border-2 p-4 shadow-lg space-y-3 cursor-pointer transition-all ${
                isChecked
                  ? 'bg-emerald-950/30 border-emerald-500/40 border-l-8 border-l-emerald-400 opacity-75'
                  : 'bg-slate-950 border-emerald-500/60 border-l-8 border-l-emerald-500'
              }`}
            >
              {/* Header row: Checkbox + Qty + Name + Copy */}
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  {/* Interactive Checkbox Box */}
                  <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border-2 transition-all ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-600 bg-slate-900'
                  }`}>
                    {isChecked && <Check className="w-5 h-5 stroke-[3]" />}
                  </div>

                  <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-mono font-black text-sm shadow ${
                    isChecked ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {item.quantity}×
                  </span>

                  <div>
                    <span className={`font-extrabold text-base block leading-tight ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.name}
                    </span>
                    <span className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyText(item);
                  }}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 active:scale-95 border border-slate-700"
                >
                  {copiedId === item.id ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Big Bold Cut Display Box */}
              <div className={`rounded-xl p-3.5 border flex items-center justify-between ${
                isChecked ? 'bg-slate-900/60 border-slate-800' : 'bg-emerald-950/40 border-emerald-500/40'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block mb-0.5">
                    {isChecked ? 'CUT COMPLETED' : 'CUT LENGTH TO MAKE:'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className={`font-mono font-black text-2xl tracking-tight ${isChecked ? 'line-through text-slate-400' : 'text-emerald-400'}`}>
                      {item.lengthFraction}
                    </span>
                    <span className="font-mono text-slate-400 text-xs font-semibold">
                      ({item.lengthDecimal}")
                    </span>
                  </div>
                </div>

                <div className="text-right border-l border-emerald-500/20 pl-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Stock</span>
                  <span className="font-mono font-bold text-white text-sm">{item.widthFraction}</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-300 font-medium leading-normal pt-1">
                {item.notes}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary Footer Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 flex flex-col justify-center items-center text-center shadow-inner">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">Total Pieces</span>
          <span className="text-lg font-mono font-black text-white">
            {cutList.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 flex flex-col justify-center items-center text-center shadow-inner">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">Linear Footage</span>
          <span className="text-lg font-mono font-black text-emerald-400">
            {totalLinearFeet} ft
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 flex flex-col justify-center items-center text-center shadow-inner">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">Stock 8ft Boards</span>
          <span className="text-lg font-mono font-black text-emerald-400">
            {stockOptimization?.boardCount || 1}
          </span>
        </div>
      </div>

    </div>
  );
}
