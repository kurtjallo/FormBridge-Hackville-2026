import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import { MEDICAL_CONSENT_STANDARD, PHIPA_NOTICE } from '../../utils/legal-clauses';
import * as fs from 'fs';

export async function generateMedicalConsent(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Medical Consent Form',
    category: 'Healthcare',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'INFORMED CONSENT FOR MEDICAL TREATMENT');

  // Patient Information
  drawSectionTitle(ctx, 'PATIENT INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Patient Full Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'patient_name',
    x: ctx.margins.left + 115,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date of Birth*:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'patient_dob', ctx.margins.left + 90, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Gender:', ctx.margins.left + 220, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'patient_gender',
    x: ctx.margins.left + 275,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Male', 'Female', 'Other', 'Prefer not to say'],
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Health Card #*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'health_card',
    x: ctx.margins.left + 95,
    y: ctx.y - 12,
    width: 150,
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

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left + 200, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'patient_email',
    x: ctx.margins.left + 240,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Emergency Contact
  drawSectionTitle(ctx, 'EMERGENCY CONTACT');

  drawFieldLabel(ctx.page, fonts.regular, 'Contact Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'emergency_name',
    x: ctx.margins.left + 95,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Relationship*:', ctx.margins.left, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'emergency_relationship',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: 130,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'],
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Phone*:', ctx.margins.left + 240, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'emergency_phone',
    x: ctx.margins.left + 290,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Procedure Information
  drawSectionTitle(ctx, 'PROCEDURE/TREATMENT INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Physician Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'physician_name',
    x: ctx.margins.left + 105,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Procedure/Treatment*:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'procedure_description',
    x: ctx.margins.left,
    y: ctx.y - 55,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 500,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 20;

  drawFieldLabel(ctx.page, fonts.regular, 'Scheduled Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'procedure_date', ctx.margins.left + 100, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Location:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'procedure_location',
    x: ctx.margins.left + 285,
    y: ctx.y - 12,
    width: 165,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Consent Acknowledgments
  drawSectionTitle(ctx, 'PATIENT ACKNOWLEDGMENTS');
  drawParagraph(ctx, MEDICAL_CONSENT_STANDARD);
  ctx.y -= SPACING.PARAGRAPH;

  drawParagraph(ctx, 'By checking the boxes below, I acknowledge that:');
  ctx.y -= SPACING.PARAGRAPH;

  addCheckbox(form, ctx.page, { name: 'ack_explained', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'The procedure/treatment has been fully explained to me', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_risks', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I understand the potential risks, benefits, and complications', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_alternatives', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I have been informed of alternative treatment options', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_questions', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I have had the opportunity to ask questions and receive answers', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_anesthesia', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I consent to anesthesia if required (if applicable)', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_blood', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I consent to blood transfusion if necessary (if applicable)', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_voluntary', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I am giving consent voluntarily without coercion', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.SECTION;

  // Allergies and Medical History
  drawSectionTitle(ctx, 'ALLERGIES AND MEDICAL CONDITIONS');

  drawFieldLabel(ctx.page, fonts.regular, 'Known Allergies:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'allergies',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 300,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Current Medications:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'medications',
    x: ctx.margins.left + 120,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG - 20,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 300,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Medical Conditions:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'medical_conditions',
    x: ctx.margins.left + 115,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG - 15,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 300,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.SECTION;

  // Privacy Notice
  drawLine(ctx);
  ctx.y -= SPACING.FIELD;
  ctx.page.drawText('PRIVACY NOTICE', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;
  drawParagraph(ctx, PHIPA_NOTICE, 0, FONT_SIZES.SMALL);
  ctx.y -= SPACING.SECTION;

  // Signature Section
  drawLine(ctx);
  ctx.y -= SPACING.PARAGRAPH;

  ctx.page.drawText('CONSENT SIGNATURES', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.SECTION_HEADER,
    font: fonts.bold,
  });
  ctx.y -= SPACING.SECTION;

  // Patient Signature
  ctx.page.drawText('PATIENT (or Legal Representative):', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'patient_signature',
    x: ctx.margins.left + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'patient_printed_name',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left + 270, ctx.y + 4);
  addDateField(form, ctx.page, 'patient_sign_date', ctx.margins.left + 310, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Relationship (if representative):', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'representative_relationship',
    x: ctx.margins.left + 185,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Witness Signature
  ctx.page.drawText('WITNESS:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'witness_signature',
    x: ctx.margins.left + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'witness_name',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left + 270, ctx.y + 4);
  addDateField(form, ctx.page, 'witness_date', ctx.margins.left + 310, ctx.y - 12);

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
