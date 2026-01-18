import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel, drawSubHeader } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import * as fs from 'fs';

export async function generateBusinessLicense(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Business License Application',
    category: 'Government',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'BUSINESS LICENSE APPLICATION');

  drawParagraph(ctx, 'Complete this application to apply for or renew a business license. All fields marked with an asterisk (*) are required. Please print clearly or type.');
  ctx.y -= SPACING.PARAGRAPH;

  // Application Type
  drawSectionTitle(ctx, 'APPLICATION TYPE');

  addCheckbox(form, ctx.page, { name: 'app_new', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'New Application', ctx.margins.left + 40, ctx.y);

  addCheckbox(form, ctx.page, { name: 'app_renewal', x: ctx.margins.left + 180, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Renewal', ctx.margins.left + 200, ctx.y);

  addCheckbox(form, ctx.page, { name: 'app_amendment', x: ctx.margins.left + 290, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Amendment', ctx.margins.left + 310, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Previous License #:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'previous_license',
    x: ctx.margins.left + 130,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Business Information
  drawSectionTitle(ctx, 'BUSINESS INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Business Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'business_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Trade Name (DBA):', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'trade_name',
    x: ctx.margins.left + 115,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Business Type*:', ctx.margins.left, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'business_type',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: 180,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Sole Proprietorship', 'Partnership', 'Corporation', 'Cooperative', 'Non-Profit'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Business Number:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'business_number',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Business Address
  drawSectionTitle(ctx, 'BUSINESS ADDRESS');

  drawFieldLabel(ctx.page, fonts.regular, 'Street Address*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'business_street',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'City*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'business_city',
    x: ctx.margins.left + 60,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Province*:', ctx.margins.left + 230, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'business_province',
    x: ctx.margins.left + 300,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['ON', 'BC', 'AB', 'SK', 'MB', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Postal Code*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'business_postal',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.POSTAL,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  addCheckbox(form, ctx.page, { name: 'mailing_same', x: ctx.margins.left, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Mailing address is the same as business address', ctx.margins.left + 20, ctx.y);

  // ============ PAGE 2 ============
  ctx = createPage();

  // Business Activity
  drawSectionTitle(ctx, 'BUSINESS ACTIVITY');

  drawFieldLabel(ctx.page, fonts.regular, 'Primary Business Activity*:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'business_activity',
    x: ctx.margins.left,
    y: ctx.y - 55,
    width: FIELD_WIDTHS.FULL,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
    maxLength: 300,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 20;

  drawFieldLabel(ctx.page, fonts.regular, 'NAICS Code:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'naics_code',
    x: ctx.margins.left + 80,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Number of Employees:', ctx.margins.left, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'employee_count',
    x: ctx.margins.left + 140,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['1-5', '6-10', '11-25', '26-50', '51-100', '100+'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Proposed Start Date*:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'start_date', ctx.margins.left + 140, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.SECTION;

  // Owner/Director Information
  drawSectionTitle(ctx, 'OWNER/DIRECTOR INFORMATION');
  drawParagraph(ctx, 'Provide information for all owners/directors with 25% or more ownership:');
  ctx.y -= SPACING.PARAGRAPH;

  // Owner 1
  drawSubHeader(ctx, 'Owner/Director 1');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Name*:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner1_name',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner1_title',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Ownership %:', ctx.margins.left + 280, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner1_percent',
    x: ctx.margins.left + 370,
    y: ctx.y - 12,
    width: 60,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner1_phone',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner1_email',
    x: ctx.margins.left + 270,
    y: ctx.y - 12,
    width: 180,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.PARAGRAPH;

  // Owner 2
  drawSubHeader(ctx, 'Owner/Director 2 (if applicable)');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Name:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner2_name',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner2_title',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Ownership %:', ctx.margins.left + 280, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner2_percent',
    x: ctx.margins.left + 370,
    y: ctx.y - 12,
    width: 60,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner2_phone',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'owner2_email',
    x: ctx.margins.left + 270,
    y: ctx.y - 12,
    width: 180,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  // ============ PAGE 3 ============
  ctx = createPage();

  // Declarations
  drawSectionTitle(ctx, 'DECLARATIONS AND ACKNOWLEDGMENTS');
  drawParagraph(ctx, 'By signing this application, I/we declare and acknowledge that:');
  ctx.y -= SPACING.PARAGRAPH;

  addCheckbox(form, ctx.page, { name: 'ack_accurate', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'All information provided in this application is true and accurate', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_comply', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I will comply with all applicable municipal by-laws and regulations', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_zoning', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'The business location complies with zoning requirements', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_inspection', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I understand the business may be subject to inspection', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_revoke', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I understand the license may be revoked for non-compliance', ctx.margins.left + 40, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'ack_fee', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I understand the application fee is non-refundable', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.SECTION;

  // Additional Information
  drawSectionTitle(ctx, 'ADDITIONAL INFORMATION');
  drawParagraph(ctx, 'Provide any additional information relevant to your application:');
  ctx.y -= SPACING.FIELD;

  addMultilineTextField(form, ctx.page, {
    name: 'additional_info',
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

  drawParagraph(ctx, 'I certify that I am authorized to submit this application on behalf of the business and that all information provided is complete and accurate to the best of my knowledge.');
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

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'applicant_name',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'applicant_title',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left + 280, ctx.y + 4);
  addDateField(form, ctx.page, 'application_date', ctx.margins.left + 320, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Office Use Only
  drawLine(ctx);
  ctx.y -= SPACING.FIELD;
  ctx.page.drawText('FOR OFFICE USE ONLY', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.SMALL,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Application #:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'office_app_number',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Received Date:', ctx.margins.left + 230, ctx.y + 4);
  addDateField(form, ctx.page, 'office_received_date', ctx.margins.left + 330, ctx.y - 12);

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
