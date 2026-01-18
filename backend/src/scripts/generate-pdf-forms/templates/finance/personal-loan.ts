import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import { GOVERNING_LAW, DISPUTE_RESOLUTION, SEVERABILITY, LOAN_DEFAULT, CAD_CURRENCY_NOTE } from '../../utils/legal-clauses';
import * as fs from 'fs';

export async function generatePersonalLoan(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Personal Loan Agreement',
    category: 'Finance',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'PERSONAL LOAN AGREEMENT');

  drawParagraph(ctx, 'This Personal Loan Agreement ("Agreement") is entered into between the Lender and Borrower identified below, effective as of the date of execution.');
  ctx.y -= SPACING.PARAGRAPH;

  // Loan Date
  drawFieldLabel(ctx.page, fonts.regular, 'Agreement Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'agreement_date', ctx.margins.left + 110, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.SECTION;

  // Lender Section
  drawSectionTitle(ctx, 'LENDER INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'lender_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'lender_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'lender_phone',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'lender_email',
    x: ctx.margins.left + 270,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Borrower Section
  drawSectionTitle(ctx, 'BORROWER INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'borrower_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'borrower_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'borrower_phone',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'borrower_email',
    x: ctx.margins.left + 270,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Loan Terms
  drawSectionTitle(ctx, 'LOAN TERMS', '1');

  drawFieldLabel(ctx.page, fonts.regular, 'Principal Amount (CAD):', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'principal_amount',
    x: ctx.margins.left + 160,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Annual Interest Rate (%):', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'interest_rate',
    x: ctx.margins.left + 170,
    y: ctx.y - 12,
    width: 80,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Loan Term:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'loan_term',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['6 Months', '12 Months', '24 Months', '36 Months', '48 Months', '60 Months', 'Other'],
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Repayment Schedule
  drawSectionTitle(ctx, 'REPAYMENT SCHEDULE', '2');

  drawFieldLabel(ctx.page, fonts.regular, 'Payment Frequency:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'payment_frequency',
    x: ctx.margins.left + 140,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Payment Amount (CAD):', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'payment_amount',
    x: ctx.margins.left + 160,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'First Payment Due:', ctx.margins.left + 20, ctx.y + 4);
  addDateField(form, ctx.page, 'first_payment_date', ctx.margins.left + 140, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Final Payment Due:', ctx.margins.left + 20, ctx.y + 4);
  addDateField(form, ctx.page, 'final_payment_date', ctx.margins.left + 140, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.FIELD + 8;

  ctx.page.drawText(CAD_CURRENCY_NOTE, {
    x: ctx.margins.left + 20,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.italic,
  });
  ctx.y -= SPACING.CLAUSE;

  // Loan Purpose
  drawSectionTitle(ctx, 'LOAN PURPOSE', '3');
  drawParagraph(ctx, 'The Borrower represents that the loan proceeds will be used for the following purpose:');
  ctx.y -= SPACING.FIELD;

  addMultilineTextField(form, ctx.page, {
    name: 'loan_purpose',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_SMALL,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 300,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.SECTION;

  // Collateral (Optional)
  drawSectionTitle(ctx, 'COLLATERAL (IF APPLICABLE)', '4');

  addCheckbox(form, ctx.page, { name: 'secured_loan', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'This loan is secured by collateral', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  drawParagraph(ctx, 'If secured, describe the collateral:');
  ctx.y -= SPACING.FIELD;

  addMultilineTextField(form, ctx.page, {
    name: 'collateral_description',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_SMALL,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 300,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.SECTION;

  // Prepayment
  drawSectionTitle(ctx, 'PREPAYMENT', '5');

  addCheckbox(form, ctx.page, { name: 'prepayment_allowed', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Prepayment is allowed without penalty', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'prepayment_penalty', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Prepayment is subject to penalty (specify below)', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Prepayment Penalty:', ctx.margins.left + 40, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'prepayment_penalty_amount',
    x: ctx.margins.left + 160,
    y: ctx.y - 12,
    width: 200,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  // ============ PAGE 3 ============
  ctx = createPage();

  // Late Payment
  drawSectionTitle(ctx, 'LATE PAYMENT', '6');

  drawFieldLabel(ctx.page, fonts.regular, 'Grace Period:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'grace_period',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['None', '5 Days', '10 Days', '15 Days'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Late Fee (CAD):', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'late_fee',
    x: ctx.margins.left + 120,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.CLAUSE;

  // Default
  drawSectionTitle(ctx, 'DEFAULT', '7');
  drawParagraph(ctx, LOAN_DEFAULT, 20);
  ctx.y -= SPACING.CLAUSE;

  // Governing Law
  drawSectionTitle(ctx, 'GOVERNING LAW', '8');
  drawParagraph(ctx, GOVERNING_LAW, 20);
  ctx.y -= SPACING.CLAUSE;

  // Dispute Resolution
  drawSectionTitle(ctx, 'DISPUTE RESOLUTION', '9');
  drawParagraph(ctx, DISPUTE_RESOLUTION, 20);
  ctx.y -= SPACING.CLAUSE;

  // General Provisions
  drawSectionTitle(ctx, 'GENERAL PROVISIONS', '10');
  drawParagraph(ctx, SEVERABILITY, 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, 'This Agreement constitutes the entire agreement between the parties and may not be modified except in writing signed by both parties.', 20);
  ctx.y -= SPACING.SECTION;

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

  // Lender Signature
  ctx.page.drawText('LENDER:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });

  const rightColX = ctx.margins.left + 260;
  ctx.page.drawText('BORROWER:', {
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
    name: 'lender_signature',
    x: ctx.margins.left + 60,
    y: ctx.y - 40,
    width: 150,
    height: FIELD_HEIGHTS.SIGNATURE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', rightColX, ctx.y + 4);
  drawSignatureLine(ctx.page, rightColX + 60, ctx.y - 8, 150);
  addSignatureField(form, ctx.page, {
    name: 'borrower_signature',
    x: rightColX + 60,
    y: ctx.y - 40,
    width: 150,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  // Name row
  drawFieldLabel(ctx.page, fonts.regular, 'Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'lender_printed_name',
    x: ctx.margins.left + 60,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Name:', rightColX, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'borrower_printed_name',
    x: rightColX + 60,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  // Date row
  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'lender_sign_date', ctx.margins.left + 60, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', rightColX, ctx.y + 4);
  addDateField(form, ctx.page, 'borrower_sign_date', rightColX + 60, ctx.y - 12);

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
