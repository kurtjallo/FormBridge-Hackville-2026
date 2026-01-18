import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawLabel, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel, drawSubHeader } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import { GOVERNING_LAW, DISPUTE_RESOLUTION, ENTIRE_AGREEMENT, SEVERABILITY, IP_ASSIGNMENT_CLAUSE, CAD_CURRENCY_NOTE } from '../../utils/legal-clauses';
import * as fs from 'fs';

export async function generateIPAssignment(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Intellectual Property Assignment Agreement',
    category: 'Legal',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT');

  // Introduction
  drawParagraph(ctx, 'This Intellectual Property Assignment Agreement ("Agreement") is made and entered into as of the Effective Date by and between the Assignor and Assignee identified below.');
  ctx.y -= SPACING.PARAGRAPH;

  // Effective Date
  drawLabel(ctx, 'EFFECTIVE DATE');
  drawFieldLabel(ctx.page, fonts.regular, 'Date (YYYY-MM-DD):', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'effective_date', ctx.margins.left + 120, ctx.y - 12, FIELD_WIDTHS.DATE);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.SECTION;

  // Assignor Section
  drawSectionTitle(ctx, 'ASSIGNOR (Creator/Owner)');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignor_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'assignor_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignor_email',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignor_phone',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Assignee Section
  drawSectionTitle(ctx, 'ASSIGNEE (Company/Recipient)');

  drawFieldLabel(ctx.page, fonts.regular, 'Company Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignee_company',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'assignee_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Contact Person:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignee_contact',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignee_email',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Recitals
  drawSectionTitle(ctx, 'RECITALS');
  drawParagraph(ctx, 'WHEREAS, the Assignor has developed, created, or owns certain intellectual property described herein; and', 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, 'WHEREAS, the Assignee desires to acquire all right, title, and interest in and to such intellectual property; and', 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, 'WHEREAS, the Assignor agrees to assign such intellectual property to the Assignee in exchange for the consideration set forth herein;', 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, 'NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:', 20);
  ctx.y -= SPACING.SECTION;

  // IP Summary
  drawSectionTitle(ctx, 'SUMMARY OF INTELLECTUAL PROPERTY', '1');
  drawParagraph(ctx, 'Brief description of the intellectual property being assigned:');
  ctx.y -= SPACING.FIELD;

  addMultilineTextField(form, ctx.page, {
    name: 'ip_summary',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    maxLength: 500,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_MEDIUM + SPACING.SECTION;

  // Types of IP Rights
  drawSectionTitle(ctx, 'TYPES OF INTELLECTUAL PROPERTY RIGHTS ASSIGNED', '2');
  drawParagraph(ctx, 'Select all types of intellectual property rights included in this assignment:');
  ctx.y -= SPACING.PARAGRAPH;

  // Checkboxes for IP types
  const checkboxStartY = ctx.y;
  const checkboxX = ctx.margins.left + 20;

  addCheckbox(form, ctx.page, { name: 'assign_patents', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Patents and Patent Applications', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'assign_copyrights', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Copyrights (including software, documentation, designs)', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'assign_trademarks', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Trademarks and Service Marks', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'assign_trade_secrets', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Trade Secrets and Proprietary Information', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'assign_other', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Other (specify below):', checkboxX + 20, ctx.y);
  ctx.y -= 25;

  addTextField(form, ctx.page, {
    name: 'other_ip_description',
    x: ctx.margins.left + 40,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Assignment Clause
  drawSectionTitle(ctx, 'ASSIGNMENT OF RIGHTS', '3');
  drawParagraph(ctx, IP_ASSIGNMENT_CLAUSE, 20);
  ctx.y -= SPACING.CLAUSE;

  // Consideration
  drawSectionTitle(ctx, 'CONSIDERATION', '4');
  drawParagraph(ctx, 'In consideration for the assignment of the Intellectual Property, the Assignee agrees to pay the Assignor the following amount:', 20);
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Payment Amount (CAD):', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'payment_amount',
    x: ctx.margins.left + 150,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Payment Terms:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'payment_terms',
    x: ctx.margins.left + 150,
    y: ctx.y - 12,
    width: 180,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Lump Sum on Signing', 'Within 30 Days', 'Within 60 Days', 'Installments', 'Other'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD;

  ctx.page.drawText(CAD_CURRENCY_NOTE, {
    x: ctx.margins.left + 20,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.italic,
  });

  // ============ PAGE 3 ============
  ctx = createPage();

  // Representations and Warranties
  drawSectionTitle(ctx, 'REPRESENTATIONS AND WARRANTIES', '5');
  drawParagraph(ctx, 'The Assignor represents and warrants that:', 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, '(a) The Assignor is the sole owner of the Intellectual Property and has full right, power, and authority to enter into this Agreement and to assign the Intellectual Property;', 30);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, '(b) The Intellectual Property is free and clear of all liens, encumbrances, security interests, and claims of any kind;', 30);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, '(c) The Intellectual Property does not infringe upon any patent, copyright, trademark, trade secret, or other intellectual property right of any third party;', 30);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, '(d) There are no pending or threatened claims, actions, or proceedings relating to the Intellectual Property.', 30);
  ctx.y -= SPACING.CLAUSE;

  // Further Assurances
  drawSectionTitle(ctx, 'FURTHER ASSURANCES', '6');
  drawParagraph(ctx, 'The Assignor agrees to execute and deliver such further instruments and documents and to take such further actions as may be reasonably necessary or appropriate to carry out the purposes and intent of this Agreement and to perfect the assignment of the Intellectual Property to the Assignee.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Confidentiality
  drawSectionTitle(ctx, 'CONFIDENTIALITY', '7');
  drawParagraph(ctx, 'The Assignor agrees to maintain the confidentiality of any trade secrets or proprietary information included in the Intellectual Property and shall not disclose such information to any third party without the prior written consent of the Assignee.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Non-Competition (Optional)
  drawSectionTitle(ctx, 'NON-COMPETITION (OPTIONAL)', '8');
  drawParagraph(ctx, 'If applicable, the Assignor agrees not to compete with the Assignee in the development or commercialization of the Intellectual Property for the period specified below:', 20);
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Non-Compete Period:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'noncompete_period',
    x: ctx.margins.left + 140,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Not Applicable', '1 Year', '2 Years', '3 Years', '5 Years'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.SECTION;

  // Governing Law
  drawSectionTitle(ctx, 'GOVERNING LAW', '9');
  drawParagraph(ctx, GOVERNING_LAW, 20);
  ctx.y -= SPACING.CLAUSE;

  // Dispute Resolution
  drawSectionTitle(ctx, 'DISPUTE RESOLUTION', '10');
  drawParagraph(ctx, DISPUTE_RESOLUTION, 20);

  // ============ PAGE 4 ============
  ctx = createPage();

  // General Provisions
  drawSectionTitle(ctx, 'GENERAL PROVISIONS', '11');
  drawParagraph(ctx, ENTIRE_AGREEMENT, 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, SEVERABILITY, 20);
  ctx.y -= SPACING.SECTION;

  // Schedule A
  drawLine(ctx);
  ctx.y -= SPACING.PARAGRAPH;
  drawSubHeader(ctx, 'SCHEDULE A: DETAILED DESCRIPTION OF INTELLECTUAL PROPERTY');
  drawParagraph(ctx, 'Provide a detailed description of all intellectual property being assigned, including any patent numbers, copyright registration numbers, trademark registration numbers, or other identifying information:');
  ctx.y -= SPACING.FIELD;

  addMultilineTextField(form, ctx.page, {
    name: 'detailed_ip_description',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_LARGE,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_LARGE,
    maxLength: 2000,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_LARGE + SPACING.SECTION;

  // Schedule B
  drawSubHeader(ctx, 'SCHEDULE B: PRIOR INVENTIONS EXCLUDED (IF ANY)');
  drawParagraph(ctx, 'List any prior inventions, creations, or works that are excluded from this assignment:');
  ctx.y -= SPACING.FIELD;

  addMultilineTextField(form, ctx.page, {
    name: 'prior_inventions',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    maxLength: 1000,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_MEDIUM + SPACING.SECTION;

  // Signature Section
  drawLine(ctx);
  ctx.y -= SPACING.PARAGRAPH;

  ctx.page.drawText('IN WITNESS WHEREOF, the parties have executed this Agreement as of the dates set forth below.', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.SECTION;

  // Assignor Signature
  ctx.page.drawText('ASSIGNOR:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'assignor_signature',
    x: ctx.margins.left + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });

  // Assignee signature on the right
  const rightColX = ctx.margins.left + 280;
  ctx.page.drawText('ASSIGNEE:', {
    x: rightColX,
    y: ctx.y + SPACING.PARAGRAPH,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', rightColX, ctx.y + 4);
  drawSignatureLine(ctx.page, rightColX + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'assignee_signature',
    x: rightColX + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  // Names and dates row
  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignor_printed_name',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', rightColX, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignee_printed_name',
    x: rightColX + 85,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  // Title row
  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignor_title',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', rightColX, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'assignee_title',
    x: rightColX + 85,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  // Date row
  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'assignor_sign_date', ctx.margins.left + 85, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', rightColX, ctx.y + 4);
  addDateField(form, ctx.page, 'assignee_sign_date', rightColX + 85, ctx.y - 12);

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
