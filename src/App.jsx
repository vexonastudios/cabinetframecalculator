import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import FrameDiagram from './components/FrameDiagram';
import CutListTable from './components/CutListTable';
import LumberOptimizer from './components/LumberOptimizer';
import ProjectManager from './components/ProjectManager';
import MasterBatchList from './components/MasterBatchList';
import SettingsModal from './components/SettingsModal';
import { DEFAULT_FRAME_PARAMS, calculateCabinetFrame, optimizeLumberStock } from './utils/cabinetMath';
import { formatFraction } from './utils/fractionUtils';
import { Hammer, CheckCircle2, ShieldCheck, Ruler, Scissors, Layers, Layout, BookOpen } from 'lucide-react';

export default function App() {
  const [shopSettings, setShopSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('woodcraft_shop_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      materialWidth: 2.5,
      sawKerf: 0.125,
      jointStyle: 'CONTINUOUS_RAILS',
      costPerBoard: 0,
      fractionPrecision: 16
    };
  });

  const [frameParams, setFrameParams] = useState({
    ...DEFAULT_FRAME_PARAMS,
    materialWidth: shopSettings.materialWidth,
    sawKerf: shopSettings.sawKerf,
    jointStyle: shopSettings.jointStyle,
    fractionPrecision: shopSettings.fractionPrecision
  });
  
  const [activePreset, setActivePreset] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // UI Flow State
  const [activeTab, setActiveTab] = useState('cutlist'); // 'cutlist', 'diagram', 'lumber', 'joblist'

  // Master Cut List state for batching multiple cabinet frames
  const [batchList, setBatchList] = useState(() => {
    try {
      const saved = localStorage.getItem('woodcraft_master_batch_list');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(frame => ({
        ...frame,
        items: Array.isArray(frame?.items) ? frame.items.map(item => ({
          ...item,
          length: Number(item.length) || parseFraction(item.lengthFraction) || 0
        })) : []
      }));
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

  // Compute 8ft board optimization for Master Batch List if items exist
  const combinedBatchOptimization = useMemo(() => {
    if (!batchList || batchList.length === 0) return null;
    
    const allCuts = [];
    batchList.forEach(frame => {
      if (Array.isArray(frame?.items)) {
        frame.items.forEach(item => {
          const itemLen = Number(item.length) || parseFraction(item.lengthFraction) || 0;
          if (itemLen > 0) {
            allCuts.push({
              id: item.id,
              type: item.type,
              name: item.name,
              quantity: Number(item.quantity) || 1,
              length: itemLen,
              lengthFraction: item.lengthFraction,
              widthFraction: item.widthFraction,
              notes: item.notes
            });
          }
        });
      }
    });

    return optimizeLumberStock({
      cutList: allCuts,
      stockLength: frameParams.stockBoardLength || 96,
      sawKerf: frameParams.sawKerf || 0.125,
      fractionPrecision: frameParams.fractionPrecision || 16
    });
  }, [batchList, frameParams.stockBoardLength, frameParams.sawKerf, frameParams.fractionPrecision]);

  const activeStockOptimization = combinedBatchOptimization || calcResult.stockOptimization;

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

  const handleSaveSettings = (newSettings) => {
    setShopSettings(newSettings);
    try {
      localStorage.setItem('woodcraft_shop_settings', JSON.stringify(newSettings));
    } catch (e) {}
    
    // Also update current frame params if they changed
    setFrameParams(prev => ({
      ...prev,
      materialWidth: newSettings.materialWidth,
      sawKerf: newSettings.sawKerf,
      jointStyle: newSettings.jointStyle,
      fractionPrecision: newSettings.fractionPrecision
    }));
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
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workbench Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Highlight Summary Banner - Simplified */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-lg text-slate-300 border border-slate-700">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">
                Frame Size: <span className="text-amber-400">{(!frameParams.openingWidth || !frameParams.openingHeight) ? '--' : calcResult.outerWidthFraction + ' W'}</span> × <span className="text-amber-400">{(!frameParams.openingWidth || !frameParams.openingHeight) ? '--' : calcResult.outerHeightFraction + ' H'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {(!frameParams.openingWidth || !frameParams.openingHeight)
                  ? 'Awaiting dimensions...'
                  : frameParams.jointStyle === 'CONTINUOUS_RAILS' 
                    ? `Top/Bottom continuous. Stiles cut at ${calcResult.cutList.find(c => c.id === 'outer-stiles')?.lengthFraction}.`
                    : `Stiles continuous. Top/Bottom cut at ${calcResult.cutList.find(c => c.id === 'top-rail')?.lengthFraction}.`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 mr-2">Opening:</span>
              <span className="font-bold text-white">
                {frameParams.openingWidth ? formatFraction(frameParams.openingWidth) : '--'} × {frameParams.openingHeight ? formatFraction(frameParams.openingHeight) : '--'}
              </span>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-slate-500 mr-2">Mat Width:</span>
              <span className="font-bold text-white">{formatFraction(frameParams.materialWidth)}</span>
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
          </div          {/* Right Column (Tabbed Outputs) */}
          <div className="contents lg:block lg:col-span-7 space-y-4">
            
            {(!frameParams.openingWidth || !frameParams.openingHeight) ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
                  <Ruler className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-display">Let's Get Started</h3>
                <p className="text-slate-400 max-w-sm text-sm">
                  Enter your cabinet's <strong>Inner Opening Width</strong> and <strong>Height</strong> on the left to instantly generate your cut list, frame diagram, and lumber map.
                </p>
              </div>
            ) : (
              <>
                {/* Tab Navigation */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
                  <button
                    onClick={() => setActiveTab('cutlist')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex-1 justify-center sm:flex-none ${
                      activeTab === 'cutlist' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Scissors className="w-4 h-4" />
                    Cut List
                  </button>
                  <button
                    onClick={() => setActiveTab('diagram')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex-1 justify-center sm:flex-none ${
                      activeTab === 'diagram' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layout className="w-4 h-4" />
                    Diagram
                  </button>
                  <button
                    onClick={() => setActiveTab('lumber')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex-1 justify-center sm:flex-none ${
                      activeTab === 'lumber' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Lumber Map
                  </button>
                  <button
                    onClick={() => setActiveTab('joblist')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex-1 justify-center sm:flex-none ${
                      activeTab === 'joblist' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Job List
                    {batchList.length > 0 && (
                      <span className="bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                        {batchList.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="pt-2">
                  <div className={`${activeTab === 'cutlist' ? 'block' : 'hidden'} print:block print:mb-8`}>
                    <CutListTable
                      calcResult={calcResult}
                      onAddToMasterList={handleAddToMasterList}
                    />
                  </div>

                  <div className={`${activeTab === 'diagram' ? 'block' : 'hidden'} print:block print:mb-8`}>
                    <FrameDiagram
                      calcResult={calcResult}
                    />
                  </div>

                  <div className={`${activeTab === 'lumber' ? 'block' : 'hidden'} print:block print:mb-8`}>
                    <LumberOptimizer
                      stockOptimization={activeStockOptimization}
                      stockBoardLength={frameParams.stockBoardLength}
                      onStockLengthChange={(len) => setFrameParams(p => ({ ...p, stockBoardLength: len }))}
                      costPerBoard={shopSettings.costPerBoard}
                    />
                  </div>

                  <div className={`${activeTab === 'joblist' ? 'block' : 'hidden'}`}>
                    <MasterBatchList
                      batchList={batchList}
                      onToggleCheckItem={handleToggleCheckItem}
                      onRemoveFrame={handleRemoveFrame}
                      onClearBatch={handleClearBatch}
                    />
                  </div>
                </div>
              </>
            )}
          </div>iv>

        </div>

      </main>

      {/* Workshop Print Cut Sheet Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          Woodcraft FrameCut Pro — Precision Cabinet Face Frame & Stile/Rail Cut Calculator
        </div>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={shopSettings}
        onSaveSettings={handleSaveSettings}
      />

    </div>
  );
}
