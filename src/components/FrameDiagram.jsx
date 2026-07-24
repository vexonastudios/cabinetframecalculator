import React, { useState } from 'react';
import { Eye, Info, Sparkles, Layers } from 'lucide-react';
import { formatFraction } from '../utils/fractionUtils';

export default function FrameDiagram({ calcResult }) {
  const [hoveredPiece, setHoveredPiece] = useState(null);

  if (!calcResult) return null;

  const { config, outerWidth, outerHeight, cutList } = calcResult;
  const isContinuousRails = config.jointStyle === 'CONTINUOUS_RAILS';
  const prec = config.fractionPrecision || 16;

  const matW = Number(config.materialWidth) || 2.5;
  const ovL = Number(config.overlayLeft) || 1.0;
  const ovR = Number(config.overlayRight) || 1.0;
  const ovT = Number(config.overlayTop) || 1.0;
  const ovB = Number(config.overlayBottom) || 1.0;

  // SVG viewBox canvas scaling setup
  const padding = 60; // dimension callout space
  const svgW = 600;
  const svgH = 450;

  const availW = svgW - (padding * 2);
  const availH = svgH - (padding * 2);

  const scale = Math.min(availW / (outerWidth || 1), availH / (outerHeight || 1));

  const frameW = outerWidth * scale;
  const frameH = outerHeight * scale;

  const originX = (svgW - frameW) / 2;
  const originY = (svgH - frameH) / 2;

  const matScaled = matW * scale;
  const ovLScaled = ovL * scale;
  const ovRScaled = ovR * scale;
  const ovTScaled = ovT * scale;
  const ovBScaled = ovB * scale;

  // Inner Opening Box coordinates inside outer frame
  const openX = originX + ovLScaled;
  const openY = originY + ovTScaled;
  const openW = (outerWidth - ovL - ovR) * scale;
  const openH = (outerHeight - ovT - ovB) * scale;

  // Outer Stiles geometry
  let stileY = originY;
  let stileH = frameH;
  let topRailW = frameW;
  let topRailX = originX;
  let topRailY = originY;

  let botRailW = frameW;
  let botRailX = originX;
  let botRailY = originY + frameH - matScaled;

  if (isContinuousRails) {
    // TOP & BOTTOM BOARDS extend full width across top and bottom
    // Outer stiles sit BETWEEN top and bottom boards
    stileY = originY + matScaled;
    stileH = frameH - (2 * matScaled);
  } else {
    // STILES run full height
    // Top/Bottom rails sit BETWEEN outer stiles
    topRailX = originX + matScaled;
    topRailW = frameW - (2 * matScaled);
    botRailX = originX + matScaled;
    botRailW = frameW - (2 * matScaled);
  }

  // Get piece cut lengths for labels
  const topRailCut = cutList.find(p => p.id === 'top-rail');
  const stileCut = cutList.find(p => p.id === 'outer-stiles');
  const botRailCut = cutList.find(p => p.id === 'bottom-rail');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <Eye className="w-5 h-5 text-amber-400" />
            Interactive Frame Construction Diagram
          </h2>
          <p className="text-xs text-slate-400">
            {isContinuousRails 
              ? 'Continuous Top & Bottom Rails (Full-length horizontal top board)'
              : 'Continuous Stiles (Full-length vertical side boards)'
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs font-semibold">
          <span className="md:hidden text-[10px] text-amber-400/80 italic font-normal mb-1 sm:mb-0">Tip: Rotate phone for larger view</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Top/Bottom Boards
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-3 h-3 rounded bg-sky-500 inline-block" /> Vertical Stiles
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Box */}
      <div className="relative bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 flex items-center justify-center overflow-hidden">
        
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-auto max-h-[420px] select-none"
        >
          <defs>
            {/* Grid Pattern for Inner Opening */}
            <pattern id="openingGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(245, 158, 11, 0.08)" strokeWidth="1" />
            </pattern>

            {/* Dimension Arrow Markers */}
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
            <marker id="arrowCyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Inner Opening Translucent Grid */}
          <rect
            x={openX}
            y={openY}
            width={openW}
            height={openH}
            fill="url(#openingGrid)"
            stroke="rgba(245, 158, 11, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            className="transition-all duration-300"
          />

          {/* Inner Opening Label */}
          <text
            x={openX + openW / 2}
            y={openY + openH / 2 - 8}
            fill="#f59e0b"
            fontSize="13"
            fontWeight="bold"
            textAnchor="middle"
            className="font-mono opacity-90"
          >
            OPENING: {formatFraction(config.openingWidth, prec)} × {formatFraction(config.openingHeight, prec)}
          </text>
          <text
            x={openX + openW / 2}
            y={openY + openH / 2 + 10}
            fill="#94a3b8"
            fontSize="12"
            textAnchor="middle"
            className="font-mono"
          >
            ({config.openingWidth}" W × {config.openingHeight}" H)
          </text>

          {/* 1. TOP RAIL BOARD */}
          <g 
            onMouseEnter={() => setHoveredPiece('top-rail')}
            onMouseLeave={() => setHoveredPiece(null)}
            className="cursor-pointer transition-all duration-200"
          >
            <rect
              x={topRailX}
              y={topRailY}
              width={topRailW}
              height={matScaled}
              fill={hoveredPiece === 'top-rail' ? '#f59e0b' : '#d97706'}
              stroke="#b45309"
              strokeWidth="2"
              rx="2"
            />
            <text
              x={topRailX + topRailW / 2}
              y={topRailY + matScaled / 2 + 4}
              fill="#0f172a"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono"
            >
              TOP RAIL: {topRailCut?.lengthFraction || `${outerWidth}"`} (FULL LENGTH)
            </text>
          </g>

          {/* 2. BOTTOM RAIL BOARD */}
          <g 
            onMouseEnter={() => setHoveredPiece('bottom-rail')}
            onMouseLeave={() => setHoveredPiece(null)}
            className="cursor-pointer transition-all duration-200"
          >
            <rect
              x={botRailX}
              y={botRailY}
              width={botRailW}
              height={matScaled}
              fill={hoveredPiece === 'bottom-rail' ? '#f59e0b' : '#d97706'}
              stroke="#b45309"
              strokeWidth="2"
              rx="2"
            />
            <text
              x={botRailX + botRailW / 2}
              y={botRailY + matScaled / 2 + 4}
              fill="#0f172a"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono"
            >
              BOTTOM RAIL: {botRailCut?.lengthFraction || `${outerWidth}"`}
            </text>
          </g>

          {/* 3. LEFT STILE */}
          <g 
            onMouseEnter={() => setHoveredPiece('outer-stiles')}
            onMouseLeave={() => setHoveredPiece(null)}
            className="cursor-pointer transition-all duration-200"
          >
            <rect
              x={originX}
              y={stileY}
              width={matScaled}
              height={stileH}
              fill={hoveredPiece === 'outer-stiles' ? '#38bdf8' : '#0284c7'}
              stroke="#0369a1"
              strokeWidth="2"
              rx="2"
            />
            {/* Label inside left stile if wide enough */}
            <text
              x={originX + matScaled / 2}
              y={stileY + stileH / 2}
              fill="#0f172a"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              writingMode="tb"
              className="font-mono"
            >
              STILE: {stileCut?.lengthFraction}
            </text>
          </g>

          {/* 4. RIGHT STILE */}
          <g 
            onMouseEnter={() => setHoveredPiece('outer-stiles')}
            onMouseLeave={() => setHoveredPiece(null)}
            className="cursor-pointer transition-all duration-200"
          >
            <rect
              x={originX + frameW - matScaled}
              y={stileY}
              width={matScaled}
              height={stileH}
              fill={hoveredPiece === 'outer-stiles' ? '#38bdf8' : '#0284c7'}
              stroke="#0369a1"
              strokeWidth="2"
              rx="2"
            />
            <text
              x={originX + frameW - matScaled / 2}
              y={stileY + stileH / 2}
              fill="#0f172a"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              writingMode="tb"
              className="font-mono"
            >
              STILE: {stileCut?.lengthFraction}
            </text>
          </g>

          {/* Joint Line Highlights */}
          {isContinuousRails && (
            <>
              {/* Horizontal joint line top left */}
              <line x1={originX} y1={originY + matScaled} x2={originX + frameW} y2={originY + matScaled} stroke="#fbbf24" strokeWidth="2" strokeDasharray="2 2" />
              {/* Horizontal joint line bottom */}
              <line x1={originX} y1={originY + frameH - matScaled} x2={originX + frameW} y2={originY + frameH - matScaled} stroke="#fbbf24" strokeWidth="2" strokeDasharray="2 2" />
            </>
          )}

          {/* DIMENSION LINES & ARROWS */}

          {/* Outer Width Dimension Line (Top) */}
          <g>
            <line
              x1={originX}
              y1={originY - 20}
              x2={originX + frameW}
              y2={originY - 20}
              stroke="#f59e0b"
              strokeWidth="1.5"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            {/* Tick ends */}
            <line x1={originX} y1={originY - 28} x2={originX} y2={originY - 5} stroke="#f59e0b" strokeWidth="1" />
            <line x1={originX + frameW} y1={originY - 28} x2={originX + frameW} y2={originY - 5} stroke="#f59e0b" strokeWidth="1" />
            
            <rect x={originX + frameW / 2 - 70} y={originY - 34} width="140" height="24" fill="#090d16" rx="4" stroke="#d97706" strokeWidth="1" />
            <text x={originX + frameW / 2} y={originY - 17} fill="#fbbf24" fontSize="13" fontWeight="bold" textAnchor="middle" className="font-mono">
              OUTER: {formatFraction(outerWidth, prec)}
            </text>
          </g>

          {/* Outer Height Dimension Line (Right) */}
          <g>
            <line
              x1={originX + frameW + 20}
              y1={originY}
              x2={originX + frameW + 20}
              y2={originY + frameH}
              stroke="#f59e0b"
              strokeWidth="1.5"
              markerStart="url(#arrow)"
              markerEnd="url(#arrow)"
            />
            <line x1={originX + frameW + 5} y1={originY} x2={originX + frameW + 28} y2={originY} stroke="#f59e0b" strokeWidth="1" />
            <line x1={originX + frameW + 5} y1={originY + frameH} x2={originX + frameW + 28} y2={originY + frameH} stroke="#f59e0b" strokeWidth="1" />

            <rect x={originX + frameW + 28} y={originY + frameH / 2 - 14} width="115" height="28" fill="#090d16" rx="4" stroke="#d97706" strokeWidth="1" />
            <text x={originX + frameW + 85} y={originY + frameH / 2 + 5} fill="#fbbf24" fontSize="13" fontWeight="bold" textAnchor="middle" className="font-mono">
              OUTER: {formatFraction(outerHeight, prec)}
            </text>
          </g>

          {/* Vertical Stile Cut Dimension Callout (Left side) */}
          {isContinuousRails && (
            <g>
              <line
                x1={originX - 18}
                y1={originY + matScaled}
                x2={originX - 18}
                y2={originY + frameH - matScaled}
                stroke="#38bdf8"
                strokeWidth="1.5"
                markerStart="url(#arrowCyan)"
                markerEnd="url(#arrowCyan)"
              />
              <line x1={originX - 25} y1={originY + matScaled} x2={originX - 5} y2={originY + matScaled} stroke="#38bdf8" strokeWidth="1" />
              <line x1={originX - 25} y1={originY + frameH - matScaled} x2={originX - 5} y2={originY + frameH - matScaled} stroke="#38bdf8" strokeWidth="1" />

              <rect x={originX - 135} y={originY + frameH / 2 - 16} width="112" height="32" fill="#090d16" rx="4" stroke="#0284c7" strokeWidth="1" />
              <text x={originX - 79} y={originY + frameH / 2 - 1} fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono">
                STILE CUT
              </text>
              <text x={originX - 79} y={originY + frameH / 2 + 12} fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle" className="font-mono">
                {stileCut?.lengthFraction} (-5")
              </text>
            </g>
          )}

        </svg>

      </div>

      {/* Math Rule Explanation Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <span className="font-bold text-amber-300">Your Math Formula Applied:</span> Top & Bottom boards run continuous across the total width ({formatFraction(outerWidth, prec)}). Vertical side stiles are cut at {formatFraction(outerHeight - (2 * matW), prec)} (Outer Height {formatFraction(outerHeight, prec)} minus {formatFraction(2 * matW, prec)} total top/bottom board width).
        </div>
      </div>

    </div>
  );
}
