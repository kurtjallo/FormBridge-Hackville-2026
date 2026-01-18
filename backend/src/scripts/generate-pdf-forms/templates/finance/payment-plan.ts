import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import { GOVERNING_LAW, SEVERABILITY, CAD_CURRENCY_NOTE } from '../../utils/legal-clauses';
import * as fs from 'fs';

export async function generatePaymentPlan(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Payment Plan Agreement',
    category: 'Finance',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'PAYMENT PLAN AGREEMENT');

  drawParagraph(ctx, 'This Payment Plan Agreement ("Agreement") is entered into between the Creditor and Debtor identified below to establish a structured repayment arrangement for an outstanding debt.');
  ctx.y -= SPACING.PARAGRAPH;

  // Agreement Date
  drawFieldLabel(ctx.page, fonts.regular, 'Agreement Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'agreement_date', ctx.margins.left + 110, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.SECTION;

  // Creditor Section
  drawSectionTitle(ctx, 'CREDITOR INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Name/Company:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'creditor_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'creditor_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'creditor_phone',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Account #:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'account_number',
    x: ctx.margins.left + 300,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Debtor Section
  drawSectionTitle(ctx, 'DEBTOR INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'debtor_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'debtor_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'debtor_phone',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'debtor_email',
    x: ctx.margins.left + 270,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Debt Details
  drawSectionTitle(ctx, 'DEBT DETAILS', '1');

  drawFieldLabel(ctx.page, fonts.regular, 'Original Debt Amount (CAD):', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'original_debt',
    x: ctx.margins.left + 180,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Current Balance (CAD):', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'current_balance',
    x: ctx.margins.left + 160,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Description of Debt:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'debt_description',
    x: ctx.margins.left + 140,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 4;

  ctx.page.drawText(CAD_CURRENCY_NOTE, {
    x: ctx.margins.left + 20,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.italic,
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Payment Schedule
  drawSectionTitle(ctx, 'PAYMENT SCHEDULE', '2');

  drawFieldLabel(ctx.page, fonts.regular, 'Payment Amount (CAD):', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'payment_amount',
    x: ctx.margins.left + 160,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Payment Frequency:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'payment_frequency',
    x: ctx.margins.left + 140,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Weekly', 'Bi-Weekly', 'Monthly'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Number of Payments:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'number_of_payments',
    x: ctx.margins.left + 150,
    y: ctx.y - 12,
    width: 80,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'First Payment Due:', ctx.margins.left + 20, ctx.y + 4);
  addDateField(form, ctx.page, 'first_payment_date', ctx.margins.left + 140, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Final Payment Due:', ctx.margins.left + 20, ctx.y + 4);
  addDateField(form, ctx.page, 'final_payment_date', ctx.margins.left + 140, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.CLAUSE;

  // Payment Method
  drawSectionTitle(ctx, 'PAYMENT METHOD', '3');

  drawFieldLabel(ctx.page, fonts.regular, 'Payment Method:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'payment_method',
    x: ctx.margins.left + 130,
    y: ctx.y - 12,
    width: 180,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Bank Transfer', 'Post-Dated Cheques', 'Pre-Authorized Debit', 'Credit Card', 'Cash', 'Other'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawParagraph(ctx, 'The Debtor agrees to make payments by the method specified above on or before each due date.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Interest
  drawSectionTitle(ctx, 'INTEREST', '4');

  addCheckbox(form, ctx.page, { name: 'interest_waived', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Interest is waived during the payment plan period', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'interest_accrues', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Interest continues to accrue at the following rate:', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Interest Rate (%):', ctx.margins.left + 40, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'interest_rate',
    x: ctx.margins.left + 150,
    y: ctx.y - 12,
    width: 80,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.CLAUSE;

  // Default Consequences
  drawSectionTitle(ctx, 'DEFAULT AND CONSEQUENCES', '5');

  addCheckbox(form, ctx.page, { name: 'ack_default', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I understand that failure to make payments as agreed constitutes default', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  drawParagraph(ctx, 'In the event of default (missed or late payments), the Creditor may:', 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, '(a) Declare the entire remaining balance immediately due and payable;', 30);
  ctx.y -= SPACING.LINE;
  drawParagraph(ctx, '(b) Resume collection activities, including reporting to credit bureaus;', 30);
  ctx.y -= SPACING.LINE;
  drawParagraph(ctx, '(c) Pursue legal remedies to recover the outstanding amount plus costs.', 30);
  ctx.y -= SPACING.CLAUSE;

  // Governing Law
  drawSectionTitle(ctx, 'GOVERNING LAW', '6');
  drawParagraph(ctx, GOVERNING_LAW, 20);
  ctx.y -= SPACING.CLAUSE;

  // General
  drawSectionTitle(ctx, 'GENERAL PROVISIONS', '7');
  drawParagraph(ctx, SEVERABILITY, 20);
  ctx.y -= SPACING.SECTION;

  // Acknowledgments
  drawLine(ctx);
  ctx.y -= SPACING.PARAGRAPH;

  drawParagraph(ctx, 'By signing below, the Debtor acknowledges:');
  ctx.y -= SPACING.FIELD;

  addCheckbox(form, ctx.page, { name: 'ack_read', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I have read and understand this Payment Plan Agreement', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'ack_debt', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I acknowledge that I owe the debt specified above', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'ack_terms', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I agree to the payment terms and understand the consequences of default', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.SECTION;

  // Signatures
  ctx.page.drawText('AGREED AND ACCEPTED:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.SECTION;

  // Creditor Signature
  ctx.page.drawText('CREDITOR:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });

  const rightColX = ctx.margins.left + 260;
  ctx.page.drawText('DEBTOR:', {
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
    name: 'creditor_signature',
    x: ctx.margins.left + 60,
    y: ctx.y - 40,
    width: 150,
    height: FIELD_HEIGHTS.SIGNATURE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', rightColX, ctx.y + 4);
  drawSignatureLine(ctx.page, rightColX + 60, ctx.y - 8, 150);
  addSignatureField(form, ctx.page, {
    name: 'debtor_signature',
    x: rightColX + 60,
    y: ctx.y - 40,
    width: 150,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  // Name row
  drawFieldLabel(ctx.page, fonts.regular, 'Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'creditor_printed_name',
    x: ctx.margins.left + 60,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Name:', rightColX, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'debtor_printed_name',
    x: rightColX + 60,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  // Date row
  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'creditor_sign_date', ctx.margins.left + 60, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', rightColX, ctx.y + 4);
  addDateField(form, ctx.page, 'debtor_sign_date', rightColX + 60, ctx.y - 12);

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
