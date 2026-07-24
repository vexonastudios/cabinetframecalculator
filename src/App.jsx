import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import FrameDiagram from './components/FrameDiagram';
import CutListTable from './components/CutListTable';
import LumberOptimizer from './components/LumberOptimizer';
import ProjectManager from './components/ProjectManager';
import { DEFAULT_FRAME_PARAMS, calculateCabinetFrame } from './utils/cabinetMath';
import { formatFraction } from './utils/fractionUtils';
import { Hammer, CheckCircle2, ShieldCheck, Ruler } from 'lucide-react';

export default function App() {
  const [frameParams, setFrameParams] = useState(DEFAULT_FRAME_PARAMS);
  const [activePreset, setActivePreset] = useState(null);

  // Compute face frame cuts live
  const calcResult = useMemo(() => {
    return calculateCabinetFrame(frameParams);
  }, [frameParams]);

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id);
    setFrameParams((prev) => ({
      ...prev,
      openingWidth: preset.w,
      openingHeight: preset.h,
      materialWidth: preset.matW || 2.5,
      verticalOpenings: preset.vOpenings || 1,
      horizontalOpenings: preset.hOpenings || 1
    }));
  };

  const handleReset = () => {
    setFrameParams(DEFAULT_FRAME_PARAMS);
    setActivePreset(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!calcResult) return;

    const headers = ['Part Name', 'Type', 'Quantity', 'Cut Length (Fraction)', 'Cut Length (Decimal Inches)', 'Stock Width', 'Notes'];
    const rows = calcResult.cutList.map(item => [
      `"${item.name}"`,
      `"${item.type}"`,
      item.quantity,
      `"${item.lengthFraction}"`,
      item.lengthDecimal,
      `"${item.widthFraction}"`,
      `"${item.notes}"`
    ]);

    const csvContent = [
      `"Cabinet Face Frame Cut Sheet - Woodcraft Pro"`,
      `"Opening Specs: ${frameParams.openingWidth}" W x ${frameParams.openingHeight}" H"`,
      `"Outer Dimensions: ${calcResult.outerWidthFraction} W x ${calcResult.outerHeightFraction} H"`,
      `"Material Stock Width: ${formatFraction(frameParams.materialWidth)}"`,
      `"Joint Style: ${frameParams.jointStyle}"`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cabinet-frame-cutlist-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Navigation & Header Toolbar */}
      <Header
        onReset={handleReset}
        onPrint={handlePrint}
        onExportCSV={handleExportCSV}
        onSelectPreset={handleSelectPreset}
        activePreset={activePreset}
      />

      {/* Main Workbench Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Highlight Summary Banner */}
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-900 to-orange-950/30 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Ruler className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-display">
                Frame Outer Dimensions: <span className="text-amber-400">{calcResult.outerWidthFraction} W</span> × <span className="text-amber-400">{calcResult.outerHeightFraction} H</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {frameParams.jointStyle === 'CONTINUOUS_RAILS' ? (
                  <>Top & Bottom boards run continuous (<strong className="text-amber-300">{calcResult.outerWidthFraction}</strong>). Vertical stiles cut at <strong className="text-sky-300">{calcResult.cutList.find(c => c.id === 'outer-stiles')?.lengthFraction}</strong> (-5" deduction).</>
                ) : (
                  <>Vertical stiles run continuous (<strong className="text-sky-300">{calcResult.outerHeightFraction}</strong>). Top & Bottom rails cut at <strong className="text-amber-300">{calcResult.cutList.find(c => c.id === 'top-rail')?.lengthFraction}</strong>.</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto font-mono text-xs">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Opening Size</span>
              <span className="text-white font-bold">{formatFraction(frameParams.openingWidth)} × {formatFraction(frameParams.openingHeight)}</span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Material Width</span>
              <span className="text-emerald-400 font-bold">{formatFraction(frameParams.materialWidth)}</span>
            </div>
          </div>
        </div>

        {/* Workspace Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Inputs & Project Manager) - 5 Columns */}
          <div className="lg:col-span-5 space-y-6">
            <InputPanel
              params={frameParams}
              onChange={setFrameParams}
            />

            <ProjectManager
              currentParams={frameParams}
              onLoadParams={setFrameParams}
            />
          </div>

          {/* Right Column (Visual Diagram, Cut List & Lumber Optimizer) - 7 Columns */}
          <div className="lg:col-span-7 space-y-6">
            <FrameDiagram
              calcResult={calcResult}
            />

            <CutListTable
              calcResult={calcResult}
            />

            <LumberOptimizer
              stockOptimization={calcResult.stockOptimization}
              fractionPrecision={frameParams.fractionPrecision}
            />
          </div>

        </div>

      </main>

      {/* Workshop Print Cut Sheet Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          Woodcraft FrameCut Pro — Precision Cabinet Face Frame & Stile/Rail Cut Calculator
        </div>
      </footer>

    </div>
  );
}
