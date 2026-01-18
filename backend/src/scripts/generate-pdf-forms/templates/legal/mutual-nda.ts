import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawLabel, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, needsNewPage } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import { GOVERNING_LAW, DISPUTE_RESOLUTION, ENTIRE_AGREEMENT, SEVERABILITY, AMENDMENTS, COUNTERPARTS, CONFIDENTIALITY_STANDARD, NDA_EXCLUSIONS, CAD_CURRENCY_NOTE } from '../../utils/legal-clauses';
import * as fs from 'fs';

export async function generateMutualNDA(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Mutual Non-Disclosure Agreement',
    category: 'Legal',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'MUTUAL NON-DISCLOSURE AGREEMENT');

  // Introduction
  drawParagraph(ctx, 'This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of the date set forth below by and between the parties identified herein.');
  ctx.y -= SPACING.PARAGRAPH;

  // Effective Date
  drawLabel(ctx, 'EFFECTIVE DATE');
  drawFieldLabel(ctx.page, fonts.regular, 'Date (YYYY-MM-DD):', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'effective_date', ctx.margins.left + 110, ctx.y - 12, FIELD_WIDTHS.DATE);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.SECTION;

  // Party 1 Section
  drawSectionTitle(ctx, 'PARTY 1 (First Party)');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'party1_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'party1_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'party1_email',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Party 2 Section
  drawSectionTitle(ctx, 'PARTY 2 (Second Party)');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'party2_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'party2_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'party2_email',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Purpose Section
  drawSectionTitle(ctx, 'PURPOSE OF DISCLOSURE');
  drawParagraph(ctx, 'The parties wish to explore a potential business relationship and, in connection therewith, may disclose certain confidential information to each other. Please describe the purpose:');
  ctx.y -= SPACING.FIELD;

  addMultilineTextField(form, ctx.page, {
    name: 'disclosure_purpose',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    maxLength: 500,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_MEDIUM + SPACING.SECTION;

  // ============ PAGE 2 ============
  ctx = createPage();

  // Clause 1: Definition of Confidential Information
  drawSectionTitle(ctx, 'DEFINITION OF CONFIDENTIAL INFORMATION', '1');
  drawParagraph(ctx, '"Confidential Information" means any and all information or data, whether oral, written, electronic, or visual, that is disclosed by one party (the "Disclosing Party") to the other party (the "Receiving Party") under this Agreement, including but not limited to: technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, marketing, finances, or other business information.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Clause 2: Obligations
  drawSectionTitle(ctx, 'OBLIGATIONS OF RECEIVING PARTY', '2');
  drawParagraph(ctx, CONFIDENTIALITY_STANDARD, 20);
  ctx.y -= SPACING.CLAUSE;

  // Clause 3: Exclusions
  drawSectionTitle(ctx, 'EXCLUSIONS FROM CONFIDENTIAL INFORMATION', '3');
  drawParagraph(ctx, NDA_EXCLUSIONS, 20);
  ctx.y -= SPACING.CLAUSE;

  // Clause 4: Term
  drawSectionTitle(ctx, 'TERM AND TERMINATION', '4');
  drawParagraph(ctx, 'This Agreement shall remain in effect for the term specified below from the Effective Date, unless earlier terminated by either party upon thirty (30) days written notice to the other party:', 20);
  ctx.y -= SPACING.FIELD;

  drawFieldLabel(ctx.page, fonts.regular, 'Agreement Term:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'agreement_term',
    x: ctx.margins.left + 120,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['1 Year', '2 Years', '3 Years', '5 Years', 'Indefinite'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.SECTION;

  // Clause 5: Return of Information
  drawSectionTitle(ctx, 'RETURN OF INFORMATION', '5');
  drawParagraph(ctx, 'Upon termination of this Agreement or upon request by the Disclosing Party, the Receiving Party shall promptly return or destroy all Confidential Information and any copies thereof, and shall certify in writing that it has done so.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Clause 6: No Rights Granted
  drawSectionTitle(ctx, 'NO RIGHTS GRANTED', '6');
  drawParagraph(ctx, 'Nothing in this Agreement shall be construed as granting any rights, by license or otherwise, in any Confidential Information, except as expressly set forth herein.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Clause 7: Remedies
  drawSectionTitle(ctx, 'REMEDIES', '7');
  drawParagraph(ctx, 'Each party acknowledges that the Confidential Information is valuable and unique, and that unauthorized disclosure or use would cause irreparable harm for which monetary damages would be inadequate. Accordingly, each party agrees that the other party shall be entitled to seek injunctive relief, in addition to any other remedies available at law or in equity.', 20);

  // ============ PAGE 3 ============
  ctx = createPage();

  // Clause 8: Governing Law
  drawSectionTitle(ctx, 'GOVERNING LAW', '8');
  drawParagraph(ctx, GOVERNING_LAW, 20);
  ctx.y -= SPACING.CLAUSE;

  // Clause 9: Dispute Resolution
  drawSectionTitle(ctx, 'DISPUTE RESOLUTION', '9');
  drawParagraph(ctx, DISPUTE_RESOLUTION, 20);
  ctx.y -= SPACING.CLAUSE;

  // Clause 10: General Provisions
  drawSectionTitle(ctx, 'GENERAL PROVISIONS', '10');
  drawParagraph(ctx, ENTIRE_AGREEMENT, 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, SEVERABILITY, 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, AMENDMENTS, 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, COUNTERPARTS, 20);
  ctx.y -= SPACING.SECTION;

  // Signature Blocks
  drawLine(ctx);
  ctx.y -= SPACING.SECTION;

  ctx.page.drawText('IN WITNESS WHEREOF, the parties have executed this Agreement as of the dates set forth below.', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.SECTION;

  // Party 1 Signature
  ctx.page.drawText('PARTY 1:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'party1_signature',
    x: ctx.margins.left + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'party1_printed_name',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'party1_title',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'party1_sign_date', ctx.margins.left + 85, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.SECTION;

  // Party 2 Signature
  ctx.page.drawText('PARTY 2:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'party2_signature',
    x: ctx.margins.left + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'party2_printed_name',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'party2_title',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'party2_sign_date', ctx.margins.left + 85, ctx.y - 12);

  // Add footers to all pages
  const pages = doc.getPages();
  pages.forEach((page, index) => {
    const pageCtx = { ...ctx, page, y: 0 };
    drawFooter(pageCtx, index + 1, pages.length);
  });

  // Save the PDF
  const pdfBytes = await doc.save();
  fs.writeFileSync(config.outputPath, pdfBytes);
}
