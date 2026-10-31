export interface ParsedPlotRow {
  plotNumber: string;
  category: 'Land/Plots' | 'Residential' | 'Commercial';
  status: 'Available' | 'Reserved' | 'Sold';
  plotDimensions: string;
  areaSqFt: number;
  areaCents: number;
  facing: 'North' | 'East' | 'South' | 'West' | 'North-East' | 'North-West';
  roadWidth: string;
  pricePerSqFt: number;
  totalPrice: number;
  isCornerPlot: boolean;
  isValid: boolean;
  errors: string[];
}

export function parseCsvText(csvText: string): { rows: ParsedPlotRow[]; fatalError?: string } {
  if (!csvText || !csvText.trim()) {
    return { rows: [], fatalError: 'File is empty' };
  }

  // Split lines
  const lines = csvText.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { rows: [], fatalError: 'File must contain a header row and at least one data row' };
  }

  // Parse header
  const headerLine = lines[0];
  const delimiter = headerLine.includes('\t') ? '\t' : headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(delimiter).map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Header index resolution
  const plotNumIdx = headers.findIndex((h) => h.includes('plot') || h === 'number' || h === 'no' || h === 'id');
  const dimIdx = headers.findIndex((h) => h.includes('dim') || h.includes('size'));
  const sqftIdx = headers.findIndex((h) => h.includes('sqft') || h.includes('area') || h.includes('extent'));
  const centsIdx = headers.findIndex((h) => h.includes('cent'));
  const facingIdx = headers.findIndex((h) => h.includes('facing') || h.includes('direction'));
  const roadIdx = headers.findIndex((h) => h.includes('road') || h.includes('width'));
  const rateIdx = headers.findIndex((h) => h.includes('rate') || h.includes('sqftprice') || h.includes('pricepersqft'));
  const priceIdx = headers.findIndex((h) => (h.includes('price') || h.includes('cost') || h.includes('total')) && !h.includes('per'));
  const statusIdx = headers.findIndex((h) => h.includes('status') || h.includes('availability'));
  const cornerIdx = headers.findIndex((h) => h.includes('corner'));

  if (plotNumIdx === -1) {
    return { rows: [], fatalError: 'Could not find a "Plot Number" column in header row' };
  }

  const seenPlots = new Set<string>();
  const parsedRows: ParsedPlotRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = rawLine.split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length === 0 || cols.every((c) => c === '')) continue;

    const rowErrors: string[] = [];
    const plotNum = cols[plotNumIdx] || '';

    if (!plotNum) {
      rowErrors.push('Missing plot number');
    } else if (seenPlots.has(plotNum)) {
      rowErrors.push(`Duplicate plot number #${plotNum}`);
    } else {
      seenPlots.add(plotNum);
    }

    // Dimensions
    const dimensions = (dimIdx !== -1 ? cols[dimIdx] : '') || '30x40 ft';

    // Area Sq.Ft
    let areaSqFt = sqftIdx !== -1 ? parseFloat(cols[sqftIdx].replace(/[^0-9.]/g, '')) : 1200;
    if (isNaN(areaSqFt) || areaSqFt <= 0) {
      rowErrors.push('Invalid area sq.ft value');
      areaSqFt = 1200;
    }

    // Cents
    let areaCents = centsIdx !== -1 ? parseFloat(cols[centsIdx].replace(/[^0-9.]/g, '')) : parseFloat((areaSqFt / 435.6).toFixed(2));
    if (isNaN(areaCents) || areaCents <= 0) {
      areaCents = parseFloat((areaSqFt / 435.6).toFixed(2));
    }

    // Facing
    const rawFacing = (facingIdx !== -1 ? cols[facingIdx] : '').toLowerCase();
    let facing: ParsedPlotRow['facing'] = 'North';
    if (rawFacing.includes('east') && rawFacing.includes('north')) facing = 'North-East';
    else if (rawFacing.includes('west') && rawFacing.includes('north')) facing = 'North-West';
    else if (rawFacing.includes('east')) facing = 'East';
    else if (rawFacing.includes('west')) facing = 'West';
    else if (rawFacing.includes('south')) facing = 'South';

    // Road width
    const roadWidth = (roadIdx !== -1 ? cols[roadIdx] : '') || '40 ft';

    // Price per Sq.Ft
    let pricePerSqFt = rateIdx !== -1 ? parseFloat(cols[rateIdx].replace(/[^0-9.]/g, '')) : 2100;
    if (isNaN(pricePerSqFt) || pricePerSqFt <= 0) pricePerSqFt = 2100;

    // Total Price
    let totalPrice = priceIdx !== -1 ? parseFloat(cols[priceIdx].replace(/[^0-9.]/g, '')) : Math.round(areaSqFt * pricePerSqFt);
    if (isNaN(totalPrice) || totalPrice <= 0) totalPrice = Math.round(areaSqFt * pricePerSqFt);

    // Status
    const rawStatus = (statusIdx !== -1 ? cols[statusIdx] : '').toLowerCase();
    let status: ParsedPlotRow['status'] = 'Available';
    if (rawStatus.includes('sold')) status = 'Sold';
    else if (rawStatus.includes('reserve') || rawStatus.includes('book')) status = 'Reserved';

    const isCorner = cornerIdx !== -1 ? cols[cornerIdx].toLowerCase() === 'yes' || cols[cornerIdx].toLowerCase() === 'true' : false;

    parsedRows.push({
      plotNumber: plotNum,
      category: 'Land/Plots',
      status,
      plotDimensions: dimensions,
      areaSqFt,
      areaCents,
      facing,
      roadWidth,
      pricePerSqFt,
      totalPrice,
      isCornerPlot: isCorner,
      isValid: rowErrors.length === 0,
      errors: rowErrors,
    });
  }

  return { rows: parsedRows };
}

