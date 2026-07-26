import { formatFraction, formatDecimal, parseFraction } from './fractionUtils';

/**
 * Cabinet Face Frame Math & Cut List Calculator Engine
 */

export const DEFAULT_FRAME_PARAMS = {
  name: 'Standard Face Frame',
  openingWidth: '',        // Default blank so user can type immediately
  openingHeight: '',       // Default blank so user can type immediately
  overlayLeft: 1.0,        // 1 inch overlap left
  overlayRight: 1.0,       // 1 inch overlap right
  overlayTop: 1.0,         // 1 inch overlap top
  overlayBottom: 1.0,      // 1 inch overlap bottom
  materialWidth: 2.5,      // 2 1/2 inches face frame stock
  materialThickness: 0.75, // 3/4 inch stock thickness
  jointStyle: 'CONTINUOUS_RAILS', // 'CONTINUOUS_RAILS' (top/bottom full width) or 'CONTINUOUS_STILES' (vertical full height)
  verticalOpenings: 1,     // 1 = single door opening, 2 = double door with center stile
  horizontalOpenings: 1,   // 1 = single opening, 2 = drawer over door
  stockBoardLength: 96,    // 8 ft (96 inches)
  sawKerf: 0.125,          // 1/8 inch saw blade kerf
  fractionPrecision: 16,   // 1/16th inch
  
  // Door Settings
  calculateDoors: false,
  doorStyle: 'OVERLAY',    // 'OVERLAY' or 'INSET'
  doorOverlay: 0.5,        // 1/2 inch overlay
  doorInsetReveal: 0.09375 // 3/32 inch gap
};

/**
 * Calculates complete cut list, outer frame dimensions, and stock lumber optimization.
 */
export function calculateCabinetFrame(params = {}) {
  const config = { ...DEFAULT_FRAME_PARAMS, ...params };

  const opW = parseFraction(config.openingWidth) || 0;
  const opH = parseFraction(config.openingHeight) || 0;
  const ovL = parseFraction(config.overlayLeft) || 0;
  const ovR = parseFraction(config.overlayRight) || 0;
  const ovT = parseFraction(config.overlayTop) || 0;
  const ovB = parseFraction(config.overlayBottom) || 0;
  const matW = parseFraction(config.materialWidth) || 2.5;
  const matT = parseFraction(config.materialThickness) || 0.75;
  const vOpenings = Math.max(1, parseInt(config.verticalOpenings, 10) || 1);
  const hOpenings = Math.max(1, parseInt(config.horizontalOpenings, 10) || 1);
  const prec = config.fractionPrecision || 16;

  // 1. Calculate Outer Dimensions
  const totalOverlayX = ovL + ovR;
  const totalOverlayY = ovT + ovB;

  const outerWidth = opW + totalOverlayX;
  const outerHeight = opH + totalOverlayY;

  // 2. Determine Stile & Rail Quantities and Cut Lengths
  const cutList = [];

  const isContinuousRails = config.jointStyle === 'CONTINUOUS_RAILS';

  if (isContinuousRails) {
    // TOP BOARD runs FULL LENGTH across total outer width
    cutList.push({
      id: 'top-rail',
      type: 'RAIL',
      name: 'Top Rail',
      subtitle: 'Full width continuous top board',
      length: outerWidth,
      width: matW,
      thickness: matT,
      quantity: 1,
      notes: `Full outer width (${formatFraction(outerWidth, prec)})`
    });

    // BOTTOM BOARD runs FULL LENGTH across total outer width
    cutList.push({
      id: 'bottom-rail',
      type: 'RAIL',
      name: 'Bottom Rail',
      subtitle: 'Full width continuous bottom board',
      length: outerWidth,
      width: matW,
      thickness: matT,
      quantity: 1,
      notes: `Full outer width (${formatFraction(outerWidth, prec)})`
    });

    // VERTICAL OUTER STILES fit between Top & Bottom rails: Outer Height - 2 * Material Width
    const outerStileLength = outerHeight - (2 * matW);
    cutList.push({
      id: 'outer-stiles',
      type: 'STILE',
      name: 'Outer Stiles (Vertical)',
      subtitle: 'Left & Right side vertical boards',
      length: Math.max(0, outerStileLength),
      width: matW,
      thickness: matT,
      quantity: 2,
      notes: `Outer height (${formatFraction(outerHeight, prec)}) minus 2× ${formatFraction(matW, prec)} material width = -${formatFraction(2 * matW, prec)}`
    });

    // CENTER STILES / MULLIONS (if vertical partition count > 1)
    if (vOpenings > 1) {
      const centerStileCount = vOpenings - 1;
      const centerStileLength = outerHeight - (2 * matW);
      cutList.push({
        id: 'center-stiles',
        type: 'MULLION',
        name: 'Center Stile / Mullion',
        subtitle: 'Vertical divider between door openings',
        length: Math.max(0, centerStileLength),
        width: matW,
        thickness: matT,
        quantity: centerStileCount,
        notes: `Fits between top & bottom rails`
      });
    }

    // MID RAILS (if horizontal drawer/door openings > 1)
    if (hOpenings > 1) {
      const midRailCount = hOpenings - 1;
      const midRailLength = outerWidth - (2 * matW);
      cutList.push({
        id: 'mid-rails',
        type: 'MID_RAIL',
        name: 'Mid Rail / Partition',
        subtitle: 'Horizontal divider (e.g. drawer over door)',
        length: Math.max(0, midRailLength),
        width: matW,
        thickness: matT,
        quantity: midRailCount,
        notes: `Fits between vertical stiles`
      });
    }
  } else {
    // CONTINUOUS STILES (Vertical boards run full height)
    const stileLength = outerHeight;
    cutList.push({
      id: 'outer-stiles',
      type: 'STILE',
      name: 'Outer Stiles (Vertical)',
      subtitle: 'Full height continuous side boards',
      length: stileLength,
      width: matW,
      thickness: matT,
      quantity: 2,
      notes: `Full outer height (${formatFraction(outerHeight, prec)})`
    });

    const railLength = outerWidth - (2 * matW);

    cutList.push({
      id: 'top-rail',
      type: 'RAIL',
      name: 'Top Rail',
      subtitle: 'Horizontal top board between stiles',
      length: Math.max(0, railLength),
      width: matW,
      thickness: matT,
      quantity: 1,
      notes: `Outer width minus 2× ${formatFraction(matW, prec)} side stiles = -${formatFraction(2 * matW, prec)}`
    });

    cutList.push({
      id: 'bottom-rail',
      type: 'RAIL',
      name: 'Bottom Rail',
      subtitle: 'Horizontal bottom board between stiles',
      length: Math.max(0, railLength),
      width: matW,
      thickness: matT,
      quantity: 1,
      notes: `Outer width minus 2× ${formatFraction(matW, prec)} side stiles = -${formatFraction(2 * matW, prec)}`
    });

    if (vOpenings > 1) {
      const centerStileCount = vOpenings - 1;
      const centerStileLength = outerHeight - (2 * matW);
      cutList.push({
        id: 'center-stiles',
        type: 'MULLION',
        name: 'Center Stile / Mullion',
        subtitle: 'Vertical divider between door openings',
        length: Math.max(0, centerStileLength),
        width: matW,
        thickness: matT,
        quantity: centerStileCount,
        notes: `Fits between top & bottom rails`
      });
    }

    if (hOpenings > 1) {
      const midRailCount = hOpenings - 1;
      cutList.push({
        id: 'mid-rails',
        type: 'MID_RAIL',
        name: 'Mid Rail / Partition',
        subtitle: 'Horizontal divider',
        length: Math.max(0, railLength),
        width: matW,
        thickness: matT,
        quantity: hOpenings - 1,
        notes: `Fits between outer stiles`
      });
    }
  }

  // Enrich cut list with formatted fraction strings
  const formattedCutList = cutList.map(item => ({
    ...item,
    lengthFraction: formatFraction(item.length, prec),
    lengthDecimal: formatDecimal(item.length, 3),
    widthFraction: formatFraction(item.width, prec),
    totalLinearInches: item.length * item.quantity
  }));

  // Total linear footage required
  const totalLinearInches = formattedCutList.reduce((sum, item) => sum + item.totalLinearInches, 0);
  const totalLinearFeet = totalLinearInches / 12;

  // 3. Door & Drawer Sizing
  let doorList = [];
  if (config.calculateDoors) {
    const dOverlay = Number(config.doorOverlay) || 0;
    const dReveal = Number(config.doorInsetReveal) || 0;
    const dStyle = config.doorStyle;

    // Calculate exact inner opening size per section
    const openingW = (opW - ((vOpenings - 1) * matW)) / vOpenings;
    const openingH = (opH - ((hOpenings - 1) * matW)) / hOpenings;

    let doorW = openingW;
    let doorH = openingH;

    if (dStyle === 'OVERLAY') {
      doorW += (dOverlay * 2);
      doorH += (dOverlay * 2);
    } else if (dStyle === 'INSET') {
      doorW -= (dReveal * 2);
      doorH -= (dReveal * 2);
    }

    doorList.push({
      id: 'door-front',
      name: dStyle === 'OVERLAY' ? `Overlay Door/Drawer Front (${formatFraction(dOverlay)} over)` : `Inset Door/Drawer Front (${formatFraction(dReveal)} gap)`,
      quantity: vOpenings * hOpenings,
      width: doorW,
      widthFraction: formatFraction(doorW, prec),
      height: doorH,
      heightFraction: formatFraction(doorH, prec)
    });
  }

  // 3. Stock Board Nesting & Lumber Optimizer
  const stockOptimization = optimizeLumberStock({
    cutList: formattedCutList,
    stockLength: config.stockBoardLength,
    sawKerf: config.sawKerf,
    fractionPrecision: prec
  });

  return {
    config,
    outerWidth,
    outerHeight,
    outerWidthFraction: formatFraction(outerWidth, prec),
    outerHeightFraction: formatFraction(outerHeight, prec),
    totalOverlayX,
    totalOverlayY,
    cutList: formattedCutList,
    doorList,
    totalLinearInches,
    totalLinearFeet: formatDecimal(totalLinearFeet, 2),
    stockOptimization
  };
}

/**
 * Lumber Stock Optimizer using First Fit Decreasing algorithm
 */
export function optimizeLumberStock({ cutList, stockLength = 96, sawKerf = 0.125, fractionPrecision = 16 }) {
  // Expand individual piece cuts
  const pieces = [];
  if (Array.isArray(cutList)) {
    cutList.forEach(item => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const len = Math.max(0, Number(item.length) || parseFraction(item.lengthFraction) || 0);
      if (len > 0) {
        for (let i = 0; i < qty; i++) {
          pieces.push({
            id: `${item.id || 'part'}-${i + 1}`,
            name: item.name || 'Cut Piece',
            length: len,
            lengthFraction: item.lengthFraction || formatFraction(len),
            type: item.type || 'PART'
          });
        }
      }
    });
  }

  // Sort by length descending
  pieces.sort((a, b) => (b.length || 0) - (a.length || 0));

  const boards = [];

  pieces.forEach(piece => {
    let placed = false;

    for (let board of boards) {
      const neededSpace = piece.length + (board.cuts.length > 0 ? sawKerf : 0);
      if (board.remainingLength >= neededSpace) {
        board.cuts.push({
          ...piece,
          startPos: stockLength - board.remainingLength + (board.cuts.length > 0 ? sawKerf : 0)
        });
        board.remainingLength -= neededSpace;
        placed = true;
        break;
      }
    }

    if (!placed) {
      const newBoard = {
        boardIndex: boards.length + 1,
        stockLength,
        stockLengthFraction: formatFraction(stockLength, fractionPrecision),
        remainingLength: Math.max(0, stockLength - (piece.length || 0)),
        cuts: [{
          ...piece,
          startPos: 0
        }]
      };
      boards.push(newBoard);
    }
  });

  const totalBoardInches = boards.length * stockLength;
  const wasteInches = boards.reduce((sum, b) => sum + b.remainingLength, 0);
  const wastePercentage = totalBoardInches > 0 ? (wasteInches / totalBoardInches) * 100 : 0;

  return {
    boardCount: boards.length,
    stockLength,
    stockLengthFraction: formatFraction(stockLength, fractionPrecision),
    boards: boards.map(b => ({
      ...b,
      usedInches: stockLength - b.remainingLength,
      usedFraction: formatFraction(stockLength - b.remainingLength, fractionPrecision),
      remainingFraction: formatFraction(Math.max(0, b.remainingLength), fractionPrecision)
    })),
    totalBoardInches,
    wasteInches,
    wasteFraction: formatFraction(wasteInches, fractionPrecision),
    wastePercentage: formatDecimal(wastePercentage, 1)
  };
}
