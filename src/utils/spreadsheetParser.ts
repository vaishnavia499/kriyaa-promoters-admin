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
  buyerName?: string;
  remarks?: string;
  isValid: boolean;
  errors: string[];
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      if (inQuotes && i + 1 < line.length && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCsvText(csvText: string): { rows: ParsedPlotRow[]; fatalError?: string } {
  if (!csvText || !csvText.trim()) {
    return { rows: [], fatalError: 'File is empty' };
  }

  // Remove Byte Order Mark (BOM) if present
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();

  // Split lines
  const rawLines = cleanText.split(/\r\n|\n|\r/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (rawLines.length < 2) {
    return { rows: [], fatalError: 'File must contain a header row and at least one data row' };
  }

  // Detect delimiter from the first few lines
  const sample = rawLines.slice(0, 5).join('\n');
  const delimiter = sample.includes('\t') ? '\t' : sample.includes(';') ? ';' : ',';

  // Find the header row (scan first 10 rows to skip any title or empty banner rows)
  let headerRowIndex = -1;
  let headers: string[] = [];
  let plotNumIdx = -1;

  for (let i = 0; i < Math.min(rawLines.length, 10); i++) {
    const cols = parseCsvLine(rawLines[i], delimiter).map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    const foundIdx = cols.findIndex(
      (h) => h.includes('plot') || h === 'number' || h === 'plotno' || h === 'plotnumber' || h === 'plotid' || h === 'no' || h === 'id'
    );
    if (foundIdx !== -1) {
      headerRowIndex = i;
      headers = cols;
      plotNumIdx = foundIdx;
      break;
    }
  }

  if (headerRowIndex === -1 || plotNumIdx === -1) {
    return { rows: [], fatalError: 'Could not find a "Plot Number" column in header row. Please ensure your header includes "Plot Number" or "Plot No".' };
  }

  // Header index resolution
  const dimIdx = headers.findIndex((h) => h.includes('dim') || h.includes('size'));
  const sqftIdx = headers.findIndex((h) => h.includes('sqft') || h.includes('area') || h.includes('extent'));
  const centsIdx = headers.findIndex((h) => h.includes('cent'));
  const facingIdx = headers.findIndex((h) => h.includes('facing') || h.includes('direction'));
  const roadIdx = headers.findIndex((h) => h.includes('road') || h.includes('width'));
  const rateIdx = headers.findIndex((h) => h.includes('rate') || h.includes('sqftprice') || h.includes('pricepersqft'));
  const priceIdx = headers.findIndex((h) => (h.includes('price') || h.includes('cost') || h.includes('total')) && !h.includes('per') && !h.includes('rate'));
  const statusIdx = headers.findIndex((h) => h.includes('status') || h.includes('availability'));
  const cornerIdx = headers.findIndex((h) => h.includes('corner'));
  const buyerIdx = headers.findIndex((h) => h.includes('buyer') || h.includes('client') || h.includes('customer'));
  const remarksIdx = headers.findIndex((h) => h.includes('remark') || h.includes('note'));

  const seenPlots = new Set<string>();
  const parsedRows: ParsedPlotRow[] = [];

  for (let i = headerRowIndex + 1; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const cols = parseCsvLine(rawLine, delimiter);
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
    const roadWidth = (roadIdx !== -1 ? cols[roadIdx] : '') || '30 Ft Tar Road';

    // Price per Sq.Ft
    let pricePerSqFt = rateIdx !== -1 ? parseFloat(cols[rateIdx].replace(/[^0-9.]/g, '')) : 1200;
    if (isNaN(pricePerSqFt) || pricePerSqFt <= 0) pricePerSqFt = 1200;

    // Total Price
    let totalPrice = priceIdx !== -1 ? parseFloat(cols[priceIdx].replace(/[^0-9.]/g, '')) : Math.round(areaSqFt * pricePerSqFt);
    if (isNaN(totalPrice) || totalPrice <= 0) totalPrice = Math.round(areaSqFt * pricePerSqFt);

    // Status
    const rawStatus = (statusIdx !== -1 ? cols[statusIdx] : '').toLowerCase();
    let status: ParsedPlotRow['status'] = 'Available';
    if (rawStatus.includes('sold')) status = 'Sold';
    else if (rawStatus.includes('reserve') || rawStatus.includes('book') || rawStatus.includes('hold')) status = 'Reserved';

    const isCorner = cornerIdx !== -1
      ? cols[cornerIdx].toLowerCase() === 'yes' || cols[cornerIdx].toLowerCase() === 'true'
      : (cols[remarksIdx] || '').toLowerCase().includes('corner');

    const buyerName = buyerIdx !== -1 ? cols[buyerIdx] : undefined;
    const remarks = remarksIdx !== -1 ? cols[remarksIdx] : undefined;

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
      buyerName,
      remarks,
      isValid: rowErrors.length === 0,
      errors: rowErrors,
    });
  }

  return { rows: parsedRows };
}

