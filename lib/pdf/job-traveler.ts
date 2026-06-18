import 'server-only';

import PDFDocument from 'pdfkit';
import type { InspectionRecord, Job, JobOperation } from '@/lib/db/schema';

const PAGE_MARGIN = 50;
const HEADER_BG = '#e5e7eb';
const BORDER_COLOR = '#d1d5db';
const MUTED_COLOR = '#6b7280';

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(date: Date | null) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function dash(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

type TableColumn = {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
};

type TableRow = string[];

function drawTable(
  doc: PDFKit.PDFDocument,
  startY: number,
  columns: TableColumn[],
  rows: TableRow[],
  options?: { emptyMessage?: string }
): number {
  const tableWidth = doc.page.width - PAGE_MARGIN * 2;
  const rowPadding = 6;
  const headerHeight = 24;
  const minRowHeight = 22;
  let y = startY;

  const drawHeader = () => {
    doc.save();
    doc.rect(PAGE_MARGIN, y, tableWidth, headerHeight).fill(HEADER_BG);
    doc.strokeColor(BORDER_COLOR).lineWidth(0.5);
    doc.rect(PAGE_MARGIN, y, tableWidth, headerHeight).stroke();

    let x = PAGE_MARGIN;
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9);

    for (const column of columns) {
      doc.text(column.header, x + rowPadding, y + 7, {
        width: column.width - rowPadding * 2,
        align: column.align ?? 'left',
        lineBreak: false,
      });
      x += column.width;
    }

    doc.restore();
    y += headerHeight;
  };

  const ensureSpace = (height: number) => {
    const bottom = doc.page.height - PAGE_MARGIN;
    if (y + height > bottom) {
      doc.addPage();
      y = PAGE_MARGIN;
      drawHeader();
    }
  };

  drawHeader();

  if (rows.length === 0) {
    ensureSpace(minRowHeight);
    doc.save();
    doc.strokeColor(BORDER_COLOR).lineWidth(0.5);
    doc.rect(PAGE_MARGIN, y, tableWidth, minRowHeight).stroke();
    doc
      .fillColor(MUTED_COLOR)
      .font('Helvetica-Oblique')
      .fontSize(9)
      .text(options?.emptyMessage ?? 'No records.', PAGE_MARGIN + rowPadding, y + 7, {
        width: tableWidth - rowPadding * 2,
      });
    doc.restore();
    return y + minRowHeight + 16;
  }

  for (const row of rows) {
    let rowHeight = minRowHeight;

    for (let i = 0; i < columns.length; i++) {
      const cellHeight = doc.heightOfString(row[i] ?? '—', {
        width: columns[i].width - rowPadding * 2,
        align: columns[i].align ?? 'left',
      });
      rowHeight = Math.max(rowHeight, cellHeight + rowPadding * 2);
    }

    ensureSpace(rowHeight);

    doc.save();
    doc.strokeColor(BORDER_COLOR).lineWidth(0.5);
    doc.rect(PAGE_MARGIN, y, tableWidth, rowHeight).stroke();

    let x = PAGE_MARGIN;
    doc.fillColor('#111827').font('Helvetica').fontSize(9);

    for (let i = 0; i < columns.length; i++) {
      doc.text(row[i] ?? '—', x + rowPadding, y + rowPadding, {
        width: columns[i].width - rowPadding * 2,
        align: columns[i].align ?? 'left',
      });
      x += columns[i].width;
    }

    doc.restore();
    y += rowHeight;
  }

  return y + 16;
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string, y: number) {
  const bottom = doc.page.height - PAGE_MARGIN;
  if (y + 30 > bottom) {
    doc.addPage();
    y = PAGE_MARGIN;
  }

  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(title, PAGE_MARGIN, y);
  return y + 22;
}

function drawJobHeader(doc: PDFKit.PDFDocument, job: Job, y: number) {
  const tableWidth = doc.page.width - PAGE_MARGIN * 2;
  const colWidth = tableWidth / 2;
  const rowHeight = 28;

  const fields: [string, string][] = [
    ['Job Number', dash(job.jobNumber)],
    ['Customer', dash(job.customerName)],
    ['Part Number', dash(job.partNumber)],
    ['Revision', dash(job.partRevision)],
    ['Quantity', dash(job.quantity)],
    ['Due Date', formatDate(job.dueDate)],
  ];

  doc.save();
  doc.strokeColor(BORDER_COLOR).lineWidth(0.5);

  for (let i = 0; i < fields.length; i += 2) {
    const rowY = y + (i / 2) * rowHeight;

    doc.rect(PAGE_MARGIN, rowY, colWidth, rowHeight).stroke();
    doc.rect(PAGE_MARGIN + colWidth, rowY, colWidth, rowHeight).stroke();

    doc
      .fillColor(MUTED_COLOR)
      .font('Helvetica')
      .fontSize(8)
      .text(fields[i][0], PAGE_MARGIN + 8, rowY + 6, { width: colWidth - 16 });
    doc
      .fillColor('#111827')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(fields[i][1], PAGE_MARGIN + 8, rowY + 16, { width: colWidth - 16 });

    if (fields[i + 1]) {
      doc
        .fillColor(MUTED_COLOR)
        .font('Helvetica')
        .fontSize(8)
        .text(fields[i + 1][0], PAGE_MARGIN + colWidth + 8, rowY + 6, {
          width: colWidth - 16,
        });
      doc
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(fields[i + 1][1], PAGE_MARGIN + colWidth + 8, rowY + 16, {
          width: colWidth - 16,
        });
    }
  }

  doc.restore();
  return y + (fields.length / 2) * rowHeight + 20;
}

export async function generateJobTravelerPdf(
  job: Job,
  operations: JobOperation[],
  inspectionRecords: InspectionRecord[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margin: PAGE_MARGIN,
      bufferPages: true,
      info: {
        Title: `${job.jobNumber} Job Traveler`,
        Author: 'OpsTrace',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const generatedAt = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    doc
      .fillColor('#111827')
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('Job Traveler', PAGE_MARGIN, PAGE_MARGIN, { align: 'left' });

    doc
      .fillColor(MUTED_COLOR)
      .font('Helvetica')
      .fontSize(9)
      .text(`Generated ${generatedAt}`, PAGE_MARGIN, PAGE_MARGIN + 26, { align: 'left' });

    let y = drawJobHeader(doc, job, PAGE_MARGIN + 52);

    y = drawSectionTitle(doc, 'Operations', y);

    const tableWidth = doc.page.width - PAGE_MARGIN * 2;
    const operationColumns: TableColumn[] = [
      { header: 'Seq', width: tableWidth * 0.07, align: 'center' },
      { header: 'Description', width: tableWidth * 0.33 },
      { header: 'Machine', width: tableWidth * 0.18 },
      { header: 'Completed By', width: tableWidth * 0.2 },
      { header: 'Completed At', width: tableWidth * 0.22 },
    ];

    const operationRows: TableRow[] = operations.map((operation) => [
      dash(operation.sequence),
      dash(operation.description),
      dash(operation.machine),
      dash(operation.completedBy),
      formatDateTime(operation.completedAt),
    ]);

    y = drawTable(doc, y, operationColumns, operationRows, {
      emptyMessage: 'No operations recorded.',
    });

    y = drawSectionTitle(doc, 'Inspection Records', y);

    const inspectionColumns: TableColumn[] = [
      { header: 'Dimension', width: tableWidth * 0.2 },
      { header: 'Spec', width: tableWidth * 0.18 },
      { header: 'Actual', width: tableWidth * 0.18 },
      { header: 'Result', width: tableWidth * 0.14 },
      { header: 'Inspector', width: tableWidth * 0.3 },
    ];

    const inspectionRows: TableRow[] = inspectionRecords.map((record) => [
      dash(record.dimension),
      dash(record.nominalSpec),
      dash(record.actualValue),
      dash(record.result),
      dash(record.inspector),
    ]);

    drawTable(doc, y, inspectionColumns, inspectionRows, {
      emptyMessage: 'No inspection records.',
    });

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc
        .fillColor(MUTED_COLOR)
        .font('Helvetica')
        .fontSize(8)
        .text(
          `Page ${i + 1} of ${pageCount}`,
          PAGE_MARGIN,
          doc.page.height - PAGE_MARGIN + 20,
          { align: 'center', width: doc.page.width - PAGE_MARGIN * 2 }
        );
    }

    doc.end();
  });
}
