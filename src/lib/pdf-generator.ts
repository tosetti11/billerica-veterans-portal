import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
}

// Official form references for each service type
const FORM_REFERENCES: Record<string, { officialForm: string; title: string; agency: string; instructions: string }> = {
  va_disability: {
    officialForm: "VA Form 21-526EZ",
    title: "Application for Disability Compensation and Related Compensation Benefits",
    agency: "U.S. Department of Veterans Affairs",
    instructions: "This intake form captures information needed to prepare VA Form 21-526EZ. The Veterans Service Officer will use this data to complete and file the official VA form on your behalf.",
  },
  property_tax_abatement: {
    officialForm: "MA Form 96 / Clause 22",
    title: "Application for Property Tax Exemption — Veterans",
    agency: "Massachusetts Department of Revenue / Town of Billerica Assessor's Office",
    instructions: "This form captures information for your property tax exemption application under Massachusetts General Laws Chapter 59, Section 5. The VSO will prepare the official filing with the Assessor's Office.",
  },
  pension: {
    officialForm: "VS-1 (Chapter 115 Application)",
    title: "Application for Veterans Benefits Under M.G.L. Chapter 115",
    agency: "Commonwealth of Massachusetts — Department of Veterans' Services",
    instructions: "This form captures information for your Chapter 115 benefits application. The VSO will complete the official VS-1 form and submit it to the state Department of Veterans' Services.",
  },
  burial: {
    officialForm: "VA Form 21P-530EZ",
    title: "Application for Burial Benefits",
    agency: "U.S. Department of Veterans Affairs",
    instructions: "This form captures information needed to file VA Form 21P-530EZ for burial allowance and/or VA Form 40-1330 for a government headstone/marker. The VSO will prepare the official VA filings.",
  },
};

const DEFAULT_REF = {
  officialForm: "Intake Form",
  title: "Veterans Service Request",
  agency: "Town of Billerica Veterans Services",
  instructions: "This form has been submitted through the Billerica Veterans Portal. The VSO will review and take appropriate action.",
};

/**
 * Generate a filled PDF document from form submission data
 */
export async function generateFilledPDF(
  templateName: string,
  serviceType: string,
  fields: FormField[],
  data: Record<string, string>,
  veteranName: string,
  caseNumber: string,
  submittedAt: Date
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const ref = FORM_REFERENCES[serviceType] || DEFAULT_REF;
  const pageWidth = 612; // Letter size
  const pageHeight = 792;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Helper to add a new page when needed
  function checkPageBreak(needed: number): PDFPage {
    if (y - needed < margin + 40) {
      // Add footer to current page
      addFooter(page, helvetica, pageWidth, pdfDoc.getPageCount());
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
      // Add continuation header
      page.drawText(`${ref.officialForm} — Continued`, {
        x: margin,
        y,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 20;
    }
    return page;
  }

  // ═══════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════

  // Top border line
  page.drawRectangle({
    x: margin,
    y: y - 2,
    width: contentWidth,
    height: 3,
    color: rgb(0.0, 0.2, 0.5),
  });
  y -= 15;

  // Agency name
  page.drawText(ref.agency.toUpperCase(), {
    x: margin,
    y,
    size: 8,
    font: helveticaBold,
    color: rgb(0.0, 0.2, 0.5),
  });
  y -= 14;

  // Official form number
  page.drawText(ref.officialForm, {
    x: margin,
    y,
    size: 10,
    font: helveticaBold,
    color: rgb(0.0, 0.2, 0.5),
  });

  // Date on right side
  const dateStr = submittedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateWidth = helvetica.widthOfTextAtSize(`Submitted: ${dateStr}`, 8);
  page.drawText(`Submitted: ${dateStr}`, {
    x: pageWidth - margin - dateWidth,
    y,
    size: 8,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 20;

  // Form title
  page.drawText(ref.title, {
    x: margin,
    y,
    size: 14,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  y -= 16;

  // Template name (if different from title)
  if (templateName !== ref.title) {
    page.drawText(`Portal Form: ${templateName}`, {
      x: margin,
      y,
      size: 9,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 14;
  }

  // Separator
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 16;

  // ═══════════════════════════════════════════════
  // CASE INFO BOX
  // ═══════════════════════════════════════════════

  const boxHeight = 50;
  page.drawRectangle({
    x: margin,
    y: y - boxHeight,
    width: contentWidth,
    height: boxHeight,
    color: rgb(0.95, 0.95, 0.97),
    borderColor: rgb(0.8, 0.8, 0.85),
    borderWidth: 0.5,
  });

  page.drawText("CASE INFORMATION", {
    x: margin + 10,
    y: y - 14,
    size: 7,
    font: helveticaBold,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`Case Number: ${caseNumber}`, {
    x: margin + 10,
    y: y - 28,
    size: 10,
    font: courier,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Veteran: ${veteranName}`, {
    x: margin + 250,
    y: y - 28,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Status: Submitted for Review`, {
    x: margin + 10,
    y: y - 42,
    size: 8,
    font: helvetica,
    color: rgb(0.2, 0.5, 0.2),
  });

  y -= boxHeight + 16;

  // ═══════════════════════════════════════════════
  // INSTRUCTIONS
  // ═══════════════════════════════════════════════

  const instructionLines = wrapText(ref.instructions, helvetica, 7, contentWidth - 20);
  const instrBoxHeight = 12 + instructionLines.length * 10 + 8;

  page.drawRectangle({
    x: margin,
    y: y - instrBoxHeight,
    width: contentWidth,
    height: instrBoxHeight,
    color: rgb(0.98, 0.97, 0.93),
    borderColor: rgb(0.85, 0.8, 0.65),
    borderWidth: 0.5,
  });

  page.drawText("INSTRUCTIONS", {
    x: margin + 10,
    y: y - 12,
    size: 7,
    font: helveticaBold,
    color: rgb(0.5, 0.45, 0.3),
  });

  for (let i = 0; i < instructionLines.length; i++) {
    page.drawText(instructionLines[i], {
      x: margin + 10,
      y: y - 24 - i * 10,
      size: 7,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  y -= instrBoxHeight + 20;

  // ═══════════════════════════════════════════════
  // FORM FIELDS
  // ═══════════════════════════════════════════════

  page.drawText("SUBMITTED INFORMATION", {
    x: margin,
    y,
    size: 9,
    font: helveticaBold,
    color: rgb(0.0, 0.2, 0.5),
  });
  y -= 6;

  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: rgb(0.0, 0.2, 0.5),
  });
  y -= 16;

  for (const field of fields) {
    const value = data[field.name] || (field.required ? "[Not Provided]" : "—");
    const isTextarea = field.type === "textarea";
    const valueLines = isTextarea
      ? wrapText(value, helvetica, 10, contentWidth - 20)
      : [value];

    const fieldHeight = 14 + valueLines.length * 14 + 12;
    page = checkPageBreak(fieldHeight);

    // Field label
    const labelText = `${field.label}${field.required ? " *" : ""}`;
    page.drawText(labelText, {
      x: margin,
      y,
      size: 8,
      font: helveticaBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 14;

    // Value box
    const valueBoxHeight = valueLines.length * 14 + 6;
    page.drawRectangle({
      x: margin,
      y: y - valueBoxHeight,
      width: contentWidth,
      height: valueBoxHeight,
      color: rgb(0.98, 0.98, 0.98),
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 0.5,
    });

    for (let i = 0; i < valueLines.length; i++) {
      page.drawText(valueLines[i], {
        x: margin + 8,
        y: y - 12 - i * 14,
        size: 10,
        font: value === "[Not Provided]" || value === "—" ? helvetica : helvetica,
        color: value === "[Not Provided]"
          ? rgb(0.7, 0.3, 0.3)
          : value === "—"
            ? rgb(0.6, 0.6, 0.6)
            : rgb(0, 0, 0),
      });
    }

    y -= valueBoxHeight + 12;
  }

  // ═══════════════════════════════════════════════
  // SIGNATURE / CERTIFICATION SECTION
  // ═══════════════════════════════════════════════

  page = checkPageBreak(100);

  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: rgb(0.0, 0.2, 0.5),
  });
  y -= 16;

  page.drawText("CERTIFICATION", {
    x: margin,
    y,
    size: 9,
    font: helveticaBold,
    color: rgb(0.0, 0.2, 0.5),
  });
  y -= 14;

  const certText = `I certify that the information provided above is true and correct to the best of my knowledge. I understand that this form has been submitted electronically through the Billerica Veterans Service Portal and will be reviewed by the Veterans Service Officer.`;
  const certLines = wrapText(certText, helvetica, 8, contentWidth);
  for (const line of certLines) {
    page.drawText(line, {
      x: margin,
      y,
      size: 8,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 12;
  }

  y -= 10;

  // Electronic signature line
  page.drawText("Electronically submitted by:", {
    x: margin,
    y,
    size: 8,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 16;

  page.drawText(veteranName, {
    x: margin,
    y,
    size: 12,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  page.drawText(dateStr, {
    x: margin + 300,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  });
  y -= 4;

  // Signature line
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + 250, y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: margin + 300, y },
    end: { x: margin + 450, y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  y -= 10;

  page.drawText("Veteran / Applicant Signature", {
    x: margin,
    y,
    size: 7,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText("Date", {
    x: margin + 300,
    y,
    size: 7,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Add footer to last page
  addFooter(page, helvetica, pageWidth, pdfDoc.getPageCount());

  // Set document metadata
  pdfDoc.setTitle(`${ref.officialForm} - ${veteranName}`);
  pdfDoc.setAuthor("Billerica Veterans Service Portal");
  pdfDoc.setSubject(templateName);
  pdfDoc.setCreator("Billerica VSO Portal — pdf-lib");

  return pdfDoc.save();
}

function addFooter(page: PDFPage, font: PDFFont, pageWidth: number, pageNum: number) {
  const margin = 50;
  page.drawLine({
    start: { x: margin, y: 35 },
    end: { x: pageWidth - margin, y: 35 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  page.drawText(
    `Town of Billerica Veterans Services — 365 Boston Rd, Billerica, MA 01821 — (978) 671-0968`,
    {
      x: margin,
      y: 22,
      size: 6,
      font,
      color: rgb(0.5, 0.5, 0.5),
    }
  );

  page.drawText(`Page ${pageNum}`, {
    x: pageWidth - margin - font.widthOfTextAtSize(`Page ${pageNum}`, 6),
    y: 22,
    size: 6,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  if (!text) return [""];
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ");
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}
