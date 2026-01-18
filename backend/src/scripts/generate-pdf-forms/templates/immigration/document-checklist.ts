import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import * as fs from 'fs';

export async function generateDocumentChecklist(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Supporting Document Checklist',
    category: 'Immigration',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'SUPPORTING DOCUMENT CHECKLIST');

  drawParagraph(ctx, 'Use this checklist to ensure you have gathered all required supporting documents for your immigration application. Check each item as you collect it and note the date obtained.');
  ctx.y -= SPACING.SECTION;

  // Applicant Information
  drawSectionTitle(ctx, 'APPLICANT INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Applicant Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'applicant_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Application Type:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'application_type',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'File/Case Number:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'case_number',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Identity Documents
  drawSectionTitle(ctx, 'IDENTITY DOCUMENTS');

  const checkboxX = ctx.margins.left + 20;
  const noteX = ctx.margins.left + 350;

  // Header for columns
  ctx.page.drawText('Document', {
    x: checkboxX + 20,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.bold,
  });
  ctx.page.drawText('Notes/Date', {
    x: noteX,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  // Identity documents list
  addCheckbox(form, ctx.page, { name: 'id_passport', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Valid Passport (certified copy of all pages)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'id_passport_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'id_birth', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Birth Certificate (certified translation if not in English/French)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'id_birth_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'id_photo', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Passport-style Photos (as per IRCC specifications)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'id_photo_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'id_national', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'National ID Card (if applicable)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'id_national_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'id_travel', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Travel History (entry/exit stamps, visa copies)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'id_travel_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= SPACING.SECTION;

  // Financial Documents
  drawSectionTitle(ctx, 'FINANCIAL DOCUMENTS');

  addCheckbox(form, ctx.page, { name: 'fin_bank', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Bank Statements (last 6 months)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'fin_bank_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'fin_tax', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Tax Returns/Notice of Assessment (last 3 years)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'fin_tax_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'fin_employment', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Employment Letter (current position, salary, start date)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'fin_employment_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'fin_pay', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Pay Stubs (last 3 months)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'fin_pay_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'fin_property', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Property Ownership Documents (if applicable)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'fin_property_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'fin_investment', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Investment Statements (RRSP, TFSA, etc.)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'fin_investment_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Relationship Documents
  drawSectionTitle(ctx, 'RELATIONSHIP DOCUMENTS (FOR FAMILY SPONSORSHIP)');

  addCheckbox(form, ctx.page, { name: 'rel_marriage', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Marriage Certificate (certified translation)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'rel_marriage_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'rel_divorce', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Divorce/Annulment Decree (if previously married)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'rel_divorce_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'rel_photos', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Photos Together (throughout relationship, dated)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'rel_photos_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'rel_communication', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Communication Evidence (chat logs, call records)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'rel_communication_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'rel_joint', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Joint Accounts/Leases/Bills', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'rel_joint_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'rel_letters', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Letters from Family/Friends (attesting to relationship)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'rel_letters_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= SPACING.SECTION;

  // Background/Security Documents
  drawSectionTitle(ctx, 'BACKGROUND/SECURITY DOCUMENTS');

  addCheckbox(form, ctx.page, { name: 'bg_police', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Police Clearance Certificate (from each country lived 6+ months)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'bg_police_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'bg_military', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Military Service Records (if applicable)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'bg_military_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= SPACING.SECTION;

  // Medical Documents
  drawSectionTitle(ctx, 'MEDICAL DOCUMENTS');

  addCheckbox(form, ctx.page, { name: 'med_exam', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Immigration Medical Exam (from designated physician)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'med_exam_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'med_vaccination', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Vaccination Records', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'med_vaccination_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'med_condition', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Medical Condition Documentation (if applicable)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'med_condition_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= SPACING.SECTION;

  // Education/Work Documents
  drawSectionTitle(ctx, 'EDUCATION & WORK DOCUMENTS');

  addCheckbox(form, ctx.page, { name: 'edu_diplomas', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Diplomas/Degrees (certified copies and translations)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'edu_diplomas_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'edu_transcripts', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Academic Transcripts', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'edu_transcripts_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'edu_reference', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Reference Letters from Employers', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'edu_reference_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= 22;

  addCheckbox(form, ctx.page, { name: 'edu_language', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Language Test Results (IELTS, CELPIP, TEF)', checkboxX + 20, ctx.y);
  addTextField(form, ctx.page, {
    name: 'edu_language_note',
    x: noteX,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
    fontSize: 8,
  });
  ctx.y -= SPACING.SECTION;

  // Notes Section
  drawSectionTitle(ctx, 'ADDITIONAL NOTES');

  addMultilineTextField(form, ctx.page, {
    name: 'additional_notes',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_MEDIUM,
    maxLength: 500,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_MEDIUM + SPACING.SECTION;

  // Signature
  drawLine(ctx);
  ctx.y -= SPACING.PARAGRAPH;

  addCheckbox(form, ctx.page, { name: 'ack_complete', x: ctx.margins.left, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I confirm that I have gathered all documents checked above and they are true and accurate', ctx.margins.left + 20, ctx.y);
  ctx.y -= SPACING.SECTION;

  drawFieldLabel(ctx.page, fonts.regular, 'Applicant Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 120, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'applicant_signature',
    x: ctx.margins.left + 120,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'completion_date', ctx.margins.left + 50, ctx.y - 12);

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
