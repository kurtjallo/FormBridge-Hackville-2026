import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import { PHIPA_NOTICE } from '../../utils/legal-clauses';
import * as fs from 'fs';

export async function generatePatientRelease(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Patient Information Release Authorization',
    category: 'Healthcare',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'AUTHORIZATION FOR RELEASE OF HEALTH INFORMATION');

  drawParagraph(ctx, 'I hereby authorize the release of my personal health information as described below. This authorization complies with the Personal Health Information Protection Act, 2004 (PHIPA).');
  ctx.y -= SPACING.SECTION;

  // Patient Information
  drawSectionTitle(ctx, 'PATIENT INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Patient Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'patient_name',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date of Birth*:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'patient_dob', ctx.margins.left + 90, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Health Card #:', ctx.margins.left + 220, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'health_card',
    x: ctx.margins.left + 310,
    y: ctx.y - 12,
    width: 140,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'patient_address',
    x: ctx.margins.left + 60,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'patient_phone',
    x: ctx.margins.left + 50,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Provider Releasing Information
  drawSectionTitle(ctx, 'HEALTHCARE PROVIDER RELEASING INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Provider/Facility Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'releasing_provider',
    x: ctx.margins.left + 145,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'releasing_address',
    x: ctx.margins.left + 60,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'releasing_phone',
    x: ctx.margins.left + 50,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Fax:', ctx.margins.left + 200, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'releasing_fax',
    x: ctx.margins.left + 230,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Recipient of Information
  drawSectionTitle(ctx, 'RECIPIENT OF INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Recipient Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'recipient_name',
    x: ctx.margins.left + 105,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Organization:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'recipient_org',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'recipient_address',
    x: ctx.margins.left + 60,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'recipient_phone',
    x: ctx.margins.left + 50,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Fax:', ctx.margins.left + 200, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'recipient_fax',
    x: ctx.margins.left + 230,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Information to be Released
  drawSectionTitle(ctx, 'INFORMATION TO BE RELEASED');
  drawParagraph(ctx, 'Select all types of information authorized for release:');
  ctx.y -= SPACING.PARAGRAPH;

  const checkboxX = ctx.margins.left + 20;

  addCheckbox(form, ctx.page, { name: 'info_records', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Complete Medical Records', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'info_summary', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Discharge Summary', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'info_lab', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Laboratory/Test Results', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'info_imaging', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Diagnostic Imaging (X-rays, MRI, CT scans)', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'info_mental', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Mental Health Records', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'info_substance', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Substance Abuse Treatment Records', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'info_hiv', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'HIV/AIDS Testing and Treatment Records', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'info_genetic', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Genetic Testing Results', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'info_other', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Other (specify below):', checkboxX + 20, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  addTextField(form, ctx.page, {
    name: 'other_info',
    x: ctx.margins.left + 40,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date Range (if applicable):', ctx.margins.left, ctx.y + 4);
  drawFieldLabel(ctx.page, fonts.regular, 'From:', ctx.margins.left + 160, ctx.y + 4);
  addDateField(form, ctx.page, 'date_from', ctx.margins.left + 200, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'To:', ctx.margins.left + 320, ctx.y + 4);
  addDateField(form, ctx.page, 'date_to', ctx.margins.left + 345, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.SECTION;

  // Purpose of Disclosure
  drawSectionTitle(ctx, 'PURPOSE OF DISCLOSURE');

  drawFieldLabel(ctx.page, fonts.regular, 'Purpose*:', ctx.margins.left, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'disclosure_purpose',
    x: ctx.margins.left + 65,
    y: ctx.y - 12,
    width: 200,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Continuity of Care', 'Insurance Claim', 'Legal Proceedings', 'Employment', 'Personal Request', 'Other'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Specific Purpose:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'specific_purpose',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 300,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.SECTION;

  // Authorization Term
  drawSectionTitle(ctx, 'AUTHORIZATION TERM');

  drawFieldLabel(ctx.page, fonts.regular, 'This authorization expires on:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'expiration_date', ctx.margins.left + 180, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.FIELD + 8;

  drawParagraph(ctx, 'If no date is specified, this authorization will expire one (1) year from the date of signature.', 0, FONT_SIZES.SMALL);
  ctx.y -= SPACING.SECTION;

  // Rights and Revocation
  drawLine(ctx);
  ctx.y -= SPACING.FIELD;
  ctx.page.drawText('PATIENT RIGHTS', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawParagraph(ctx, 'I understand that:', 0, FONT_SIZES.SMALL);
  ctx.y -= SPACING.LINE;
  drawParagraph(ctx, '• I may revoke this authorization at any time by providing written notice, except to the extent that action has already been taken.', 10, FONT_SIZES.SMALL);
  drawParagraph(ctx, '• I may refuse to sign this authorization and that my treatment will not be conditioned on signing.', 10, FONT_SIZES.SMALL);
  drawParagraph(ctx, '• Information disclosed may be re-disclosed by the recipient and may no longer be protected by privacy laws.', 10, FONT_SIZES.SMALL);
  ctx.y -= SPACING.PARAGRAPH;

  ctx.page.drawText(PHIPA_NOTICE.slice(0, 200) + '...', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.italic,
  });
  ctx.y -= SPACING.SECTION;

  // Signature
  drawLine(ctx);
  ctx.y -= SPACING.PARAGRAPH;

  ctx.page.drawText('AUTHORIZATION SIGNATURE', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.SECTION;

  drawFieldLabel(ctx.page, fonts.regular, 'Patient Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 110, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'patient_signature',
    x: ctx.margins.left + 110,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'patient_printed_name',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left + 280, ctx.y + 4);
  addDateField(form, ctx.page, 'sign_date', ctx.margins.left + 320, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'If signed by representative:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'representative_name',
    x: ctx.margins.left + 150,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Relationship:', ctx.margins.left + 320, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'representative_relationship',
    x: ctx.margins.left + 395,
    y: ctx.y - 12,
    width: 60,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

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
