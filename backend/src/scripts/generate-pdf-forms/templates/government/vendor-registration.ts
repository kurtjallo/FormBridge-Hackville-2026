import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import * as fs from 'fs';

export async function generateVendorRegistration(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Vendor Registration Form',
    category: 'Government',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'VENDOR REGISTRATION FORM');

  drawParagraph(ctx, 'Complete this form to register as an approved vendor. Registration is required to receive purchase orders and payments. Please print clearly or type.');
  ctx.y -= SPACING.SECTION;

  // Vendor Information
  drawSectionTitle(ctx, 'VENDOR INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Company Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'vendor_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Business Number*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'business_number',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'GST/HST Number:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'gst_number',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address*:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'vendor_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'vendor_phone',
    x: ctx.margins.left + 60,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Email*:', ctx.margins.left + 200, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'vendor_email',
    x: ctx.margins.left + 240,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Website:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'vendor_website',
    x: ctx.margins.left + 60,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Contact Person
  drawSectionTitle(ctx, 'PRIMARY CONTACT');

  drawFieldLabel(ctx.page, fonts.regular, 'Contact Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contact_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contact_title',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Direct Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contact_phone',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Direct Email:', ctx.margins.left + 220, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'contact_email',
    x: ctx.margins.left + 300,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Banking Information
  drawSectionTitle(ctx, 'BANKING INFORMATION FOR PAYMENTS');

  drawFieldLabel(ctx.page, fonts.regular, 'Bank Name*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'bank_name',
    x: ctx.margins.left + 80,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Transit Number*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'transit_number',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Institution #*:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'institution_number',
    x: ctx.margins.left + 320,
    y: ctx.y - 12,
    width: 80,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Account Number*:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'account_number',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Commodity/Service Categories
  drawSectionTitle(ctx, 'COMMODITY/SERVICE CATEGORIES');
  drawParagraph(ctx, 'Select all categories that apply to your products or services:');
  ctx.y -= SPACING.PARAGRAPH;

  const categories = [
    'Office Supplies & Equipment',
    'IT Hardware & Software',
    'Professional Services',
    'Construction & Maintenance',
    'Janitorial & Cleaning Services',
    'Food & Catering Services',
    'Transportation & Logistics',
    'Printing & Publishing',
  ];

  const checkboxX = ctx.margins.left + 20;
  categories.forEach((category, index) => {
    const col = index % 2;
    const xPos = col === 0 ? checkboxX : checkboxX + 250;
    const yOffset = Math.floor(index / 2) * 20;

    if (col === 0 && index > 0) {
      ctx.y -= 20;
    }

    addCheckbox(form, ctx.page, { name: `cat_${index}`, x: xPos, y: ctx.y - 2 - (col === 0 ? 0 : 0) });
    drawCheckboxLabel(ctx.page, fonts.regular, category, xPos + 20, ctx.y - (col === 0 ? 0 : 0));
  });
  ctx.y -= 20 + SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Other Categories:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'other_categories',
    x: ctx.margins.left + 110,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Certifications
  drawSectionTitle(ctx, 'BUSINESS CERTIFICATIONS');
  drawParagraph(ctx, 'Select any certifications that apply to your business:');
  ctx.y -= SPACING.PARAGRAPH;

  addCheckbox(form, ctx.page, { name: 'cert_minority', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Minority-Owned Business', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'cert_women', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Women-Owned Business', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'cert_indigenous', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Indigenous-Owned Business', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'cert_disability', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Disability-Owned Business', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'cert_veteran', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Veteran-Owned Business', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'cert_small', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Small Business', checkboxX + 20, ctx.y);
  ctx.y -= 20;

  addCheckbox(form, ctx.page, { name: 'cert_local', x: checkboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Local Business', checkboxX + 20, ctx.y);
  ctx.y -= SPACING.SECTION;

  // References
  drawSectionTitle(ctx, 'BUSINESS REFERENCES');
  drawParagraph(ctx, 'Provide two business references:');
  ctx.y -= SPACING.PARAGRAPH;

  // Reference 1
  ctx.page.drawText('Reference 1:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Company:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'ref1_company',
    x: ctx.margins.left + 80,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left + 310, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'ref1_phone',
    x: ctx.margins.left + 355,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Contact:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'ref1_contact',
    x: ctx.margins.left + 80,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.PARAGRAPH;

  // Reference 2
  ctx.page.drawText('Reference 2:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Company:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'ref2_company',
    x: ctx.margins.left + 80,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left + 310, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'ref2_phone',
    x: ctx.margins.left + 355,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Contact:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'ref2_contact',
    x: ctx.margins.left + 80,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Declaration and Signature
  drawLine(ctx);
  ctx.y -= SPACING.PARAGRAPH;

  addCheckbox(form, ctx.page, { name: 'declaration', x: ctx.margins.left, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I declare that the information provided is true, complete, and accurate.', ctx.margins.left + 20, ctx.y);
  ctx.y -= SPACING.SECTION;

  drawFieldLabel(ctx.page, fonts.regular, 'Authorized Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 130, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'authorized_signature',
    x: ctx.margins.left + 130,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'signer_name',
    x: ctx.margins.left + 90,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left + 270, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'signer_title',
    x: ctx.margins.left + 305,
    y: ctx.y - 12,
    width: 130,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'registration_date', ctx.margins.left + 50, ctx.y - 12);

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
