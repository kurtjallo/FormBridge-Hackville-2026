import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';
import { DocumentConfig, PageContext, Fonts, Margins } from '../types';
import { FONT_SIZES, COLORS, SPACING, LINE_HEIGHTS } from './layout';

export async function createDocument(config: DocumentConfig): Promise<{
  doc: PDFDocument;
  fonts: Fonts;
  createPage: () => PageContext;
}> {
  const doc = await PDFDocument.create();

  doc.setTitle(config.title);
  doc.setSubject(`${config.category} document`);
  doc.setCreator('FormBridge PDF Generator');

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const fonts: Fonts = { regular, bold, italic };
  const form = doc.getForm();

  const createPage = (): PageContext => {
    const page = doc.addPage(config.pageSize);
    return {
      doc,
      page,
      form,
      fonts,
      y: config.pageSize[1] - config.margins.top,
      margins: config.margins,
      width: config.pageSize[0],
      height: config.pageSize[1],
    };
  };

  return { doc, fonts, createPage };
}

export function drawHeader(ctx: PageContext, title: string): number {
  const { page, fonts, margins, width } = ctx;
  const titleWidth = fonts.bold.widthOfTextAtSize(title, FONT_SIZES.TITLE);
  const x = (width - titleWidth) / 2;

  page.drawText(title, {
    x,
    y: ctx.y,
    size: FONT_SIZES.TITLE,
    font: fonts.bold,
    color: COLORS.BLACK,
  });

  ctx.y -= FONT_SIZES.TITLE + SPACING.SECTION;

  // Draw a line under the title
  page.drawLine({
    start: { x: margins.left, y: ctx.y + SPACING.LINE },
    end: { x: width - margins.right, y: ctx.y + SPACING.LINE },
    thickness: 1,
    color: COLORS.DARK_GRAY,
  });

  ctx.y -= SPACING.PARAGRAPH;
  return ctx.y;
}

export function drawSubHeader(ctx: PageContext, text: string): number {
  const { page, fonts } = ctx;

  page.drawText(text, {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.SECTION_HEADER,
    font: fonts.bold,
    color: COLORS.BLACK,
  });

  ctx.y -= FONT_SIZES.SECTION_HEADER + SPACING.PARAGRAPH;
  return ctx.y;
}

export function drawSectionTitle(ctx: PageContext, title: string, clauseNum?: string): number {
  const { page, fonts, margins } = ctx;
  const text = clauseNum ? `${clauseNum}. ${title}` : title;

  page.drawText(text, {
    x: margins.left,
    y: ctx.y,
    size: FONT_SIZES.SECTION_HEADER,
    font: fonts.bold,
    color: COLORS.BLACK,
  });

  ctx.y -= FONT_SIZES.SECTION_HEADER + SPACING.CLAUSE;
  return ctx.y;
}

export function drawParagraph(
  ctx: PageContext,
  text: string,
  indent: number = 0,
  fontSize: number = FONT_SIZES.BODY
): number {
  const { page, fonts, margins, width } = ctx;
  const maxWidth = width - margins.left - margins.right - indent;
  const words = text.split(' ');
  let line = '';
  let lineY = ctx.y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const testWidth = fonts.regular.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && line) {
      page.drawText(line, {
        x: margins.left + indent,
        y: lineY,
        size: fontSize,
        font: fonts.regular,
        color: COLORS.DARK_GRAY,
      });
      line = word;
      lineY -= fontSize * LINE_HEIGHTS.NORMAL;
    } else {
      line = testLine;
    }
  }

  if (line) {
    page.drawText(line, {
      x: margins.left + indent,
      y: lineY,
      size: fontSize,
      font: fonts.regular,
      color: COLORS.DARK_GRAY,
    });
    lineY -= fontSize * LINE_HEIGHTS.NORMAL;
  }

  ctx.y = lineY - SPACING.PARAGRAPH;
  return ctx.y;
}

export function drawLabel(ctx: PageContext, text: string, x?: number): number {
  const { page, fonts, margins } = ctx;

  page.drawText(text, {
    x: x ?? margins.left,
    y: ctx.y,
    size: FONT_SIZES.FIELD_LABEL,
    font: fonts.bold,
    color: COLORS.DARK_GRAY,
  });

  ctx.y -= FONT_SIZES.FIELD_LABEL + SPACING.LINE;
  return ctx.y;
}

export function drawFieldLabel(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number
): void {
  page.drawText(text, {
    x,
    y,
    size: FONT_SIZES.FIELD_LABEL,
    font,
    color: COLORS.DARK_GRAY,
  });
}

export function drawCheckboxLabel(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  y: number
): void {
  page.drawText(text, {
    x,
    y,
    size: FONT_SIZES.BODY,
    font,
    color: COLORS.DARK_GRAY,
  });
}

export function drawFooter(ctx: PageContext, pageNum: number, totalPages: number): void {
  const { page, fonts, margins, width, height } = ctx;
  const footerY = margins.bottom - 30;
  const text = `Page ${pageNum} of ${totalPages}`;
  const textWidth = fonts.regular.widthOfTextAtSize(text, FONT_SIZES.FOOTER);

  page.drawText(text, {
    x: (width - textWidth) / 2,
    y: footerY,
    size: FONT_SIZES.FOOTER,
    font: fonts.regular,
    color: COLORS.GRAY,
  });
}

export function drawLine(ctx: PageContext, y?: number): void {
  const { page, margins, width } = ctx;
  const lineY = y ?? ctx.y;

  page.drawLine({
    start: { x: margins.left, y: lineY },
    end: { x: width - margins.right, y: lineY },
    thickness: 0.5,
    color: COLORS.LIGHT_GRAY,
  });
}

export function drawSignatureLine(
  page: PDFPage,
  x: number,
  y: number,
  width: number
): void {
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 1,
    color: COLORS.BLACK,
  });
}

export function needsNewPage(ctx: PageContext, requiredSpace: number): boolean {
  return ctx.y - requiredSpace < ctx.margins.bottom;
}
