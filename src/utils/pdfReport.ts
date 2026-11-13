export interface ReportBucketRow {
  label: string;
  enquiries: number;
  plotUpdates: number;
  total: number;
}

export interface DashboardReportInput {
  scopeName: string;
  generatedAt: Date;
  totalPlots: number;
  availablePlots: number;
  reservedPlots: number;
  soldPlots: number;
  totalEnquiries: number;
  totalValueText: string;
  dayRows: ReportBucketRow[];
  monthRows: ReportBucketRow[];
}

function escapePdfText(text: string): string {
  // Replace non-ASCII characters (like ₹) with ASCII equivalents for standard Type1 Helvetica
  const ascii = text.replace(/₹/g, 'Rs. ').replace(/[^\x20-\x7E]/g, ' ');
  return ascii.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Generates and downloads a valid single-page PDF containing
 * Business Overview, Day-wise Report, and Month-wise Report.
 */
export function downloadDashboardPdfReport(report: DashboardReportInput): void {
  const lines: { text: string; x: number; y: number; size: number; bold?: boolean }[] = [];
  let y = 760;

  const pushLine = (text: string, x: number, size: number, bold = false, step = 16) => {
    lines.push({ text, x, y, size, bold });
    y -= step;
  };

  pushLine('KRIYAA PROMOTERS - DASHBOARD REPORT', 48, 16, true, 20);
  pushLine(
    `Scope: ${report.scopeName}   |   Generated: ${report.generatedAt.toLocaleString('en-IN')}`,
    48,
    9.5,
    false,
    22
  );

  // Business Overview
  pushLine('BUSINESS OVERVIEW', 48, 11.5, true, 16);
  pushLine(
    `Total Plots: ${report.totalPlots}   |   Available: ${report.availablePlots}   |   Reserved: ${report.reservedPlots}   |   Sold: ${report.soldPlots}`,
    48,
    10,
    false,
    15
  );
  pushLine(
    `Total Enquiries: ${report.totalEnquiries}   |   Total Valuation: ${report.totalValueText}`,
    48,
    10,
    false,
    24
  );

  // Day-wise Report
  pushLine('DAY-WISE REPORT (LAST 7 DAYS)', 48, 11.5, true, 16);
  pushLine('Day                  Enquiries        Plot Updates     Total Activity', 48, 9.5, true, 14);
  report.dayRows.forEach((row) => {
    const col1 = row.label.padEnd(20, ' ');
    const col2 = String(row.enquiries).padEnd(16, ' ');
    const col3 = String(row.plotUpdates).padEnd(16, ' ');
    const col4 = String(row.total);
    pushLine(`${col1} ${col2} ${col3} ${col4}`, 48, 9.5, false, 14);
  });

  y -= 12;

  // Month-wise Report
  pushLine('MONTH-WISE REPORT (LAST 6 MONTHS)', 48, 11.5, true, 16);
  pushLine('Month                Enquiries        Plot Updates     Total Activity', 48, 9.5, true, 14);
  report.monthRows.forEach((row) => {
    const col1 = row.label.padEnd(20, ' ');
    const col2 = String(row.enquiries).padEnd(16, ' ');
    const col3 = String(row.plotUpdates).padEnd(16, ' ');
    const col4 = String(row.total);
    pushLine(`${col1} ${col2} ${col3} ${col4}`, 48, 9.5, false, 14);
  });

  const streamOps = lines
    .map((l) => {
      const font = l.bold ? '/F2' : '/F1';
      return `BT ${font} ${l.size} Tf ${l.x} ${l.y} Td (${escapePdfText(l.text)}) Tj ET`;
    })
    .join('\n');

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>\nendobj\n',
    `6 0 obj\n<< /Length ${streamOps.length} >>\nstream\n${streamOps}\nendstream\nendobj\n`,
  ];

  const encoder = new TextEncoder();
  const header = '%PDF-1.4\n';
  let offset = encoder.encode(header).length;
  const xrefEntries = ['0000000000 65535 f \n'];

  for (const obj of objects) {
    xrefEntries.push(`${String(offset).padStart(10, '0')} 00000 n \n`);
    offset += encoder.encode(obj).length;
  }

  const xrefOffset = offset;
  const xref = `xref\n0 ${objects.length + 1}\n${xrefEntries.join('')}`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const pdfString = header + objects.join('') + xref + trailer;
  const blob = new Blob([pdfString], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const dateSlug = report.generatedAt.toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kriyaa-promoters-report-${dateSlug}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

