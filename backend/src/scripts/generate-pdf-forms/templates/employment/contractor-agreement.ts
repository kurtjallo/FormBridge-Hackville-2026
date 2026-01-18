import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import { GOVERNING_LAW, DISPUTE_RESOLUTION, SEVERABILITY, INDEPENDENT_CONTRACTOR, CAD_CURRENCY_NOTE } from '../../utils/legal-clauses';
import * as fs from 'fs';

export async function generateContractorAgreement(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Independent Contractor Agreement',
    category: 'Employment',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'INDEPENDENT CONTRACTOR AGREEMENT');

  drawParagraph(ctx, 'This Independent Contractor Agreement ("Agreement") is entered into between the Client and Contractor identified below, effective as of the Effective Date specified herein.');
  ctx.y -= SPACING.PARAGRAPH;

  // Effective Date
  drawFieldLabel(ctx.page, fonts.regular, 'Effective Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'effective_date', ctx.margins.left + 100, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.SECTION;

  // Client Section
  drawSectionTitle(ctx, 'CLIENT INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Company Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'client_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'client_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Contact Person:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'client_contact',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'client_email',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Contractor Section
  drawSectionTitle(ctx, 'CONTRACTOR INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contractor_name',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Business Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contractor_business',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'contractor_address',
    x: ctx.margins.left + 110,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'GST/HST Number:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contractor_gst',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contractor_email',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Services
  drawSectionTitle(ctx, 'SERVICES', '1');
  drawParagraph(ctx, 'The Contractor agrees to provide the following services to the Client:');
  ctx.y -= SPACING.FIELD;

  addMultilineTextField(form, ctx.page, {
    name: 'services_description',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    maxLength: 1000,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_MEDIUM + SPACING.SECTION;

  // Deliverables
  drawSectionTitle(ctx, 'DELIVERABLES', '2');
  drawParagraph(ctx, 'The Contractor shall deliver the following work product:');
  ctx.y -= SPACING.FIELD;

  addMultilineTextField(form, ctx.page, {
    name: 'deliverables',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_SMALL,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 500,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.SECTION;

  // Term
  drawSectionTitle(ctx, 'TERM', '3');

  drawFieldLabel(ctx.page, fonts.regular, 'Start Date:', ctx.margins.left + 20, ctx.y + 4);
  addDateField(form, ctx.page, 'contract_start', ctx.margins.left + 90, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'End Date:', ctx.margins.left + 220, ctx.y + 4);
  addDateField(form, ctx.page, 'contract_end', ctx.margins.left + 280, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.FIELD + 12;

  addCheckbox(form, ctx.page, { name: 'ongoing_contract', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Ongoing engagement (no fixed end date)', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.CLAUSE;

  // Compensation
  drawSectionTitle(ctx, 'COMPENSATION', '4');

  drawFieldLabel(ctx.page, fonts.regular, 'Rate Type:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'rate_type',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Hourly', 'Daily', 'Weekly', 'Monthly', 'Fixed Project Fee'],
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Rate (CAD):', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'rate_amount',
    x: ctx.margins.left + 300,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 12;

  drawFieldLabel(ctx.page, fonts.regular, 'Payment Terms:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'payment_terms',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Upon Completion'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  ctx.page.drawText(CAD_CURRENCY_NOTE, {
    x: ctx.margins.left + 20,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.italic,
  });
  ctx.y -= SPACING.FIELD;

  drawParagraph(ctx, 'The Contractor shall submit invoices for services rendered, and the Client shall pay within the timeframe specified above. GST/HST shall be added where applicable.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Expenses
  drawSectionTitle(ctx, 'EXPENSES', '5');

  addCheckbox(form, ctx.page, { name: 'expenses_reimbursed', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Pre-approved expenses will be reimbursed', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'expenses_included', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'All expenses included in the rate', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.CLAUSE;

  // Independent Contractor Status
  drawSectionTitle(ctx, 'INDEPENDENT CONTRACTOR STATUS', '6');
  drawParagraph(ctx, INDEPENDENT_CONTRACTOR, 20);

  // ============ PAGE 3 ============
  ctx = createPage();

  // Confidentiality
  drawSectionTitle(ctx, 'CONFIDENTIALITY', '7');
  drawParagraph(ctx, 'The Contractor agrees to maintain the confidentiality of all proprietary information, trade secrets, client information, and other confidential materials disclosed by the Client during the term of this Agreement and for a period of two (2) years following its termination.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Intellectual Property
  drawSectionTitle(ctx, 'INTELLECTUAL PROPERTY', '8');

  addCheckbox(form, ctx.page, { name: 'ip_to_client', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'All work product becomes property of Client upon payment', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'ip_licensed', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Work product is licensed to Client (Contractor retains ownership)', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  drawParagraph(ctx, 'Any pre-existing intellectual property of the Contractor used in delivering the services shall remain the property of the Contractor, subject to a license granted to the Client as necessary for use of the deliverables.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Insurance
  drawSectionTitle(ctx, 'INSURANCE', '9');

  addCheckbox(form, ctx.page, { name: 'insurance_required', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Contractor must maintain professional liability insurance', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  drawFieldLabel(ctx.page, fonts.regular, 'Minimum Coverage (CAD):', ctx.margins.left + 40, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'insurance_amount',
    x: ctx.margins.left + 180,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.CLAUSE;

  // Non-Solicitation
  drawSectionTitle(ctx, 'NON-SOLICITATION', '10');

  addCheckbox(form, ctx.page, { name: 'non_solicitation', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Non-solicitation clause applies (Contractor will not solicit Client\'s employees or clients)', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Non-Solicitation Period:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'non_solicitation_period',
    x: ctx.margins.left + 160,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Not Applicable', '6 Months', '1 Year', '2 Years'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.CLAUSE;

  // Termination
  drawSectionTitle(ctx, 'TERMINATION', '11');

  drawFieldLabel(ctx.page, fonts.regular, 'Notice Required:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'termination_notice',
    x: ctx.margins.left + 130,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Immediate', '7 Days', '14 Days', '30 Days'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawParagraph(ctx, 'Either party may terminate this Agreement with written notice as specified above. Upon termination, the Contractor shall deliver all completed work product and return all Client materials.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Governing Law
  drawSectionTitle(ctx, 'GOVERNING LAW', '12');
  drawParagraph(ctx, GOVERNING_LAW, 20);
  ctx.y -= SPACING.CLAUSE;

  // General
  drawSectionTitle(ctx, 'GENERAL PROVISIONS', '13');
  drawParagraph(ctx, SEVERABILITY, 20);

  // Signatures
  drawLine(ctx);
  ctx.y -= SPACING.PARAGRAPH;

  ctx.page.drawText('IN WITNESS WHEREOF, the parties have executed this Agreement as of the dates set forth below.', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.SECTION;

  // Client Signature
  ctx.page.drawText('CLIENT:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });

  // Contractor header on right
  const rightColX = ctx.margins.left + 260;
  ctx.page.drawText('CONTRACTOR:', {
    x: rightColX,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  // Signature row
  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 60, ctx.y - 8, 150);
  addSignatureField(form, ctx.page, {
    name: 'client_signature',
    x: ctx.margins.left + 60,
    y: ctx.y - 40,
    width: 150,
    height: FIELD_HEIGHTS.SIGNATURE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', rightColX, ctx.y + 4);
  drawSignatureLine(ctx.page, rightColX + 60, ctx.y - 8, 150);
  addSignatureField(form, ctx.page, {
    name: 'contractor_signature',
    x: rightColX + 60,
    y: ctx.y - 40,
    width: 150,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  // Name row
  drawFieldLabel(ctx.page, fonts.regular, 'Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'client_printed_name',
    x: ctx.margins.left + 60,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Name:', rightColX, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contractor_printed_name',
    x: rightColX + 60,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  // Title row
  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'client_title',
    x: ctx.margins.left + 60,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', rightColX, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contractor_title',
    x: rightColX + 60,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  // Date row
  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'client_sign_date', ctx.margins.left + 60, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', rightColX, ctx.y + 4);
  addDateField(form, ctx.page, 'contractor_sign_date', rightColX + 60, ctx.y - 12);

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
