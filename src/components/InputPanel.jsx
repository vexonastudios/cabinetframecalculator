import React from 'react';
import { parseFraction, formatFraction } from '../utils/fractionUtils';
import { Ruler, Maximize2, Scissors, ArrowRightLeft, Grid, ShieldCheck, HelpCircle } from 'lucide-react';

export default function InputPanel({ params, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...params, [key]: value });
  };

  const handleFractionAdjust = (key, delta) => {
    const current = parseFraction(params[key]);
    const updated = Math.max(0, current + delta);
    handleChange(key, updated);
  };

  const handleOverlayAll = (val) => {
    onChange({
      ...params,
      overlayLeft: val,
      overlayRight: val,
      overlayTop: val,
      overlayBottom: val
    });
  };

  const isUniformOverlay = 
    params.overlayLeft === params.overlayRight &&
    params.overlayTop === params.overlayBottom &&
    params.overlayLeft === params.overlayTop;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      
      {/* Panel Section Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
          <Ruler className="w-5 h-5 text-amber-400" />
          Cabinet Opening & Frame Specs
        </h2>
        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          Woodcraft Precision
        </span>
      </div>

      {/* 1. Inner Opening Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Inner Opening Width */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              Inner Opening Width
            </label>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {formatFraction(parseFraction(params.openingWidth))}
            </span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={params.openingWidth}
              onChange={(e) => handleChange('openingWidth', e.target.value)}
              placeholder="e.g. 14 1/2 or 14.5"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Quick Fraction Adjusters */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Quick:</span>
            <div className="flex gap-1">
              {[-0.5, -0.125, 0.125, 0.5].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => handleFractionAdjust('openingWidth', delta)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold font-mono border border-slate-700 transition-colors active:scale-95"
                >
                  {delta > 0 ? `+${formatFraction(delta)}` : formatFraction(delta)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inner Opening Height */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              Inner Opening Height
            </label>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              {formatFraction(parseFraction(params.openingHeight))}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={params.openingHeight}
              onChange={(e) => handleChange('openingHeight', e.target.value)}
              placeholder="e.g. 30 or 30 1/4"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Quick Fraction Adjusters */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Quick:</span>
            <div className="flex gap-1">
              {[-0.5, -0.125, 0.125, 0.5].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => handleFractionAdjust('openingHeight', delta)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold font-mono border border-slate-700 transition-colors active:scale-95"
                >
                  {delta > 0 ? `+${formatFraction(delta)}` : formatFraction(delta)}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 2. Side Overlap / Overlay Settings */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-orange-400" />
              Side Overlap / Overlay (Extra Margin)
            </label>
            <p className="text-[11px] text-slate-400 mt-0.5">Adds margin outside opening edges (+2" total for 1" overlay on each side)</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
            {[0.5, 0.75, 1.0, 1.5].map((ov) => (
              <button
                key={ov}
                type="button"
                onClick={() => handleOverlayAll(ov)}
                className={`px-3 py-2 rounded-lg text-sm font-mono font-bold transition-all border active:scale-95 ${
                  isUniformOverlay && Number(params.overlayLeft) === ov
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {formatFraction(ov)} / side
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <div>
            <span className="text-[10px] text-slate-400 font-medium">Left Overlay</span>
            <input
              type="text"
              value={params.overlayLeft}
              onChange={(e) => handleChange('overlayLeft', parseFraction(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-500"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium">Right Overlay</span>
            <input
              type="text"
              value={params.overlayRight}
              onChange={(e) => handleChange('overlayRight', parseFraction(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-500"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium">Top Overlay</span>
            <input
              type="text"
              value={params.overlayTop}
              onChange={(e) => handleChange('overlayTop', parseFraction(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-500"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-medium">Bottom Overlay</span>
            <input
              type="text"
              value={params.overlayBottom}
              onChange={(e) => handleChange('overlayBottom', parseFraction(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Material Width & Joint Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Frame Stock Material Width */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Stock Board Width
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
              {formatFraction(parseFraction(params.materialWidth))} (2.5")
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={params.materialWidth}
              onChange={(e) => handleChange('materialWidth', parseFraction(e.target.value))}
              placeholder="2.5 or 2 1/2"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2 mt-2 md:mt-0">
            <span className="text-[10px] uppercase text-slate-400">Presets:</span>
            <div className="flex flex-wrap gap-2">
              {[1.5, 2.0, 2.5, 3.0].map((mw) => (
                <button
                  key={mw}
                  type="button"
                  onClick={() => handleChange('materialWidth', mw)}
                  className={`px-3 py-2 rounded-lg text-sm font-mono font-bold border transition-all active:scale-95 ${
                    Number(params.materialWidth) === mw
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {formatFraction(mw)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Joint Orientation Selector */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-sky-400" />
            Joint Construction Rule
          </label>

          <div className="grid grid-cols-1 gap-2">
            {/* CONTINUOUS_RAILS Option (User Rule) */}
            <button
              type="button"
              onClick={() => handleChange('jointStyle', 'CONTINUOUS_RAILS')}
              className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-3 ${
                params.jointStyle === 'CONTINUOUS_RAILS'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                params.jointStyle === 'CONTINUOUS_RAILS' ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
              }`}>
                {params.jointStyle === 'CONTINUOUS_RAILS' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300 block">Full Top & Bottom Boards (Your Rule)</span>
                <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                  Top/Bottom rails span full width. Vertical stiles are deducted by 2× material width (-5" for 2.5" stock).
                </span>
              </div>
            </button>

            {/* CONTINUOUS_STILES Option */}
            <button
              type="button"
              onClick={() => handleChange('jointStyle', 'CONTINUOUS_STILES')}
              className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-3 ${
                params.jointStyle === 'CONTINUOUS_STILES'
                  ? 'bg-sky-500/10 border-sky-500/50 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                params.jointStyle === 'CONTINUOUS_STILES' ? 'border-sky-400 bg-sky-400' : 'border-slate-600'
              }`}>
                {params.jointStyle === 'CONTINUOUS_STILES' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </div>
              <div>
                <span className="text-xs font-bold text-sky-300 block">Full Vertical Stiles</span>
                <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                  Side stiles span full height. Top/Bottom rails fit between stiles (-5" for 2.5" stock).
                </span>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Partitioning & Stock Lumber Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        
        {/* Door Bays */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Door Openings (Bays)
          </label>
          <select
            value={params.verticalOpenings}
            onChange={(e) => handleChange('verticalOpenings', parseInt(e.target.value, 10))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-semibold focus:border-amber-500"
          >
            <option value={1}>1 Opening (Single Door)</option>
            <option value={2}>2 Openings (+ Center Mullion)</option>
            <option value={3}>3 Openings (+ 2 Center Mullions)</option>
          </select>
        </div>

        {/* Horizontal Partitions */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Drawer Partitions
          </label>
          <select
            value={params.horizontalOpenings}
            onChange={(e) => handleChange('horizontalOpenings', parseInt(e.target.value, 10))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-semibold focus:border-amber-500"
          >
            <option value={1}>1 Opening (Single Section)</option>
            <option value={2}>2 Sections (Drawer over Door)</option>
            <option value={3}>3 Sections (Multi-Drawer)</option>
          </select>
        </div>

        {/* Stock Lumber Board Length */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Stock Board Length
          </label>
          <select
            value={params.stockBoardLength}
            onChange={(e) => handleChange('stockBoardLength', parseFloat(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs font-semibold focus:border-amber-500"
          >
            <option value={96}>8 Foot Boards (96")</option>
            <option value={120}>10 Foot Boards (120")</option>
            <option value={144}>12 Foot Boards (144")</option>
          </select>
        </div>

      </div>

    </div>
  );
}
