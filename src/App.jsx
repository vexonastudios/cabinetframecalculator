import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import FrameDiagram from './components/FrameDiagram';
import CutListTable from './components/CutListTable';
import LumberOptimizer from './components/LumberOptimizer';
import ProjectManager from './components/ProjectManager';
import MasterBatchList from './components/MasterBatchList';
import { DEFAULT_FRAME_PARAMS, calculateCabinetFrame } from './utils/cabinetMath';
import { formatFraction } from './utils/fractionUtils';
import { Hammer, CheckCircle2, ShieldCheck, Ruler } from 'lucide-react';

export default function App() {
  const [frameParams, setFrameParams] = useState(DEFAULT_FRAME_PARAMS);
  const [activePreset, setActivePreset] = useState(null);

  // Master Cut List state for batching multiple cabinet frames
  const [batchList, setBatchList] = useState(() => {
    try {
      const saved = localStorage.getItem('woodcraft_master_batch_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveBatchToStorage = (newList) => {
    setBatchList(newList);
    try {
      localStorage.setItem('woodcraft_master_batch_list', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

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

  const handleAddToMasterList = (calcResult) => {
    if (!calcResult) return;
    const newFrameBatch = {
      id: Date.now().toString(),
      title: `Frame ${formatFraction(frameParams.openingWidth)} × ${formatFraction(frameParams.openingHeight)}`,
      openingWidth: frameParams.openingWidth,
      openingHeight: frameParams.openingHeight,
      items: calcResult.cutList.map((item, idx) => ({
        id: `${item.id}_${idx}`,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        length: item.length,
        lengthFraction: item.lengthFraction,
        lengthDecimal: item.lengthDecimal,
        widthFraction: item.widthFraction,
        notes: item.notes,
        checked: false
      }))
    };

    saveBatchToStorage([...batchList, newFrameBatch]);
  };

  const handleToggleCheckItem = (frameId, itemId) => {
    const updated = batchList.map(frame => {
      if (frame.id !== frameId) return frame;
      return {
        ...frame,
        items: frame.items.map(item => {
          if (item.id !== itemId) return item;
          return { ...item, checked: !item.checked };
        })
      };
    });
    saveBatchToStorage(updated);
  };

  const handleRemoveFrame = (frameId) => {
    saveBatchToStorage(batchList.filter(f => f.id !== frameId));
  };

  const handleClearBatch = () => {
    saveBatchToStorage([]);
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

        {/* Workspace Layout: Flex on mobile, Grid on desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column */}
          <div className="contents lg:block lg:col-span-5 lg:space-y-6">
            <div className="order-1 lg:order-none w-full">
              <InputPanel
                params={frameParams}
                onChange={setFrameParams}
              />
            </div>

            <div className="order-5 lg:order-none w-full">
              <ProjectManager
                currentParams={frameParams}
                onLoadParams={setFrameParams}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="contents lg:block lg:col-span-7 lg:space-y-6">
            <div className="order-2 lg:order-none w-full">
              <CutListTable
                calcResult={calcResult}
                onAddToMasterList={handleAddToMasterList}
              />
            </div>

            <div className="order-3 lg:order-none w-full">
              <MasterBatchList
                batchList={batchList}
                onToggleCheckItem={handleToggleCheckItem}
                onRemoveFrame={handleRemoveFrame}
                onClearBatch={handleClearBatch}
              />
            </div>

            <div className="order-4 lg:order-none w-full">
              <FrameDiagram
                calcResult={calcResult}
              />
            </div>

            <div className="order-5 lg:order-none w-full">
              <LumberOptimizer
                stockOptimization={calcResult.stockOptimization}
                fractionPrecision={frameParams.fractionPrecision}
              />
            </div>
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
