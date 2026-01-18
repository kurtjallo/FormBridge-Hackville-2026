import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import { SPONSORSHIP_UNDERTAKING, CAD_CURRENCY_NOTE } from '../../utils/legal-clauses';
import * as fs from 'fs';

export async function generateSponsorshipUndertaking(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Sponsorship Undertaking',
    category: 'Immigration',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'SPONSORSHIP UNDERTAKING');

  drawParagraph(ctx, 'This undertaking outlines the sponsor\'s commitment to provide for the basic requirements of the sponsored person(s) for the duration of the sponsorship period as required by Immigration, Refugees and Citizenship Canada (IRCC).');
  ctx.y -= SPACING.SECTION;

  // Sponsor Information
  drawSectionTitle(ctx, 'SPONSOR INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'sponsor_name',
    x: ctx.margins.left + 105,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date of Birth*:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'sponsor_dob', ctx.margins.left + 90, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Citizenship Status*:', ctx.margins.left + 220, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'citizenship_status',
    x: ctx.margins.left + 345,
    y: ctx.y - 12,
    width: 110,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Canadian Citizen', 'Permanent Resident'],
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address*:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'sponsor_address',
    x: ctx.margins.left + 60,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'sponsor_phone',
    x: ctx.margins.left + 50,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Email*:', ctx.margins.left + 200, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'sponsor_email',
    x: ctx.margins.left + 240,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Financial Information
  drawSectionTitle(ctx, 'FINANCIAL INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Annual Gross Income (CAD)*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'annual_income',
    x: ctx.margins.left + 175,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Employment Status*:', ctx.margins.left, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'employment_status',
    x: ctx.margins.left + 120,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Employed', 'Self-Employed', 'Retired', 'Unemployed', 'Other'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Employer Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'employer_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 4;

  ctx.page.drawText(CAD_CURRENCY_NOTE, {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.italic,
  });
  ctx.y -= SPACING.SECTION;

  // Sponsored Person Information
  drawSectionTitle(ctx, 'SPONSORED PERSON INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'sponsored_name',
    x: ctx.margins.left + 105,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date of Birth*:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'sponsored_dob', ctx.margins.left + 90, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Country of Birth:', ctx.margins.left + 220, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'sponsored_country',
    x: ctx.margins.left + 330,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Current Country of Residence*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'sponsored_residence',
    x: ctx.margins.left + 185,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Relationship to Sponsor*:', ctx.margins.left, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'relationship',
    x: ctx.margins.left + 150,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Spouse', 'Common-Law Partner', 'Conjugal Partner', 'Parent', 'Grandparent', 'Child', 'Other Relative'],
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Additional Sponsored Persons
  drawSectionTitle(ctx, 'ADDITIONAL SPONSORED PERSONS (IF APPLICABLE)');
  drawParagraph(ctx, 'List any dependent children or other family members included in this sponsorship:');
  ctx.y -= SPACING.PARAGRAPH;

  // Person 2
  drawFieldLabel(ctx.page, fonts.regular, 'Name:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'additional1_name',
    x: ctx.margins.left + 65,
    y: ctx.y - 12,
    width: 180,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'DOB:', ctx.margins.left + 270, ctx.y + 4);
  addDateField(form, ctx.page, 'additional1_dob', ctx.margins.left + 305, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Relationship:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'additional1_relationship',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.PARAGRAPH;

  // Person 3
  drawFieldLabel(ctx.page, fonts.regular, 'Name:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'additional2_name',
    x: ctx.margins.left + 65,
    y: ctx.y - 12,
    width: 180,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'DOB:', ctx.margins.left + 270, ctx.y + 4);
  addDateField(form, ctx.page, 'additional2_dob', ctx.margins.left + 305, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Relationship:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'additional2_relationship',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Previous Sponsorships
  drawSectionTitle(ctx, 'PREVIOUS SPONSORSHIP HISTORY');

  addCheckbox(form, ctx.page, { name: 'prev_sponsor_no', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I have NOT previously sponsored anyone', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'prev_sponsor_yes', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I HAVE previously sponsored person(s) (provide details below)', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  addMultilineTextField(form, ctx.page, {
    name: 'previous_sponsorship_details',
    x: ctx.margins.left,
    y: ctx.y - FIELD_HEIGHTS.MULTI_LINE_SMALL,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 300,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.SECTION;

  // Undertaking Acknowledgments
  drawSectionTitle(ctx, 'UNDERTAKING ACKNOWLEDGMENTS');
  drawParagraph(ctx, 'By signing this undertaking, I acknowledge and agree that:');
  ctx.y -= SPACING.PARAGRAPH;

  const checkboxX = ctx.margins.left + 20;

  addCheckbox(form, ctx.page, { name: 'ack_financial', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I will provide for the basic requirements of the sponsored person(s)', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_period', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I understand the undertaking period (3-20 years depending on relationship)', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_repay', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I agree to repay any social assistance paid to the sponsored person(s)', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_binding', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I understand this undertaking is binding even if circumstances change', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_default', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I understand that defaulting may affect future sponsorship applications', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_accurate', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'All information provided is true, complete, and accurate', checkboxX + 20, ctx.y);
  ctx.y -= SPACING.SECTION;

  // Undertaking Statement
  drawLine(ctx);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, SPONSORSHIP_UNDERTAKING, 0, FONT_SIZES.SMALL);

  // ============ PAGE 3 ============
  ctx = createPage();

  // Signature Section
  drawSectionTitle(ctx, 'SIGNATURES');

  ctx.page.drawText('SPONSOR:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'sponsor_signature',
    x: ctx.margins.left + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'sponsor_printed_name',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left + 270, ctx.y + 4);
  addDateField(form, ctx.page, 'sponsor_sign_date', ctx.margins.left + 310, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Co-Signer (if applicable)
  ctx.page.drawText('CO-SIGNER (if applicable):', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'cosigner_signature',
    x: ctx.margins.left + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'cosigner_name',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left + 270, ctx.y + 4);
  addDateField(form, ctx.page, 'cosigner_date', ctx.margins.left + 310, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Relationship to Sponsor:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'cosigner_relationship',
    x: ctx.margins.left + 145,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Witness
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
