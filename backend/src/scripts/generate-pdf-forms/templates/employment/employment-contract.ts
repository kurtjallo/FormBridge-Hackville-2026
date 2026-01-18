import { GeneratorConfig } from '../../types';
import { createDocument, drawHeader, drawSectionTitle, drawParagraph, drawLabel, drawFieldLabel, drawFooter, drawLine, drawSignatureLine, drawCheckboxLabel, drawSubHeader } from '../../utils/pdf-builder';
import { addTextField, addMultilineTextField, addDropdown, addDateField, addSignatureField, addCheckbox } from '../../utils/form-fields';
import { PAGE_SIZES, MARGINS, FIELD_HEIGHTS, FIELD_WIDTHS, SPACING, FONT_SIZES } from '../../utils/layout';
import { GOVERNING_LAW, SEVERABILITY, ONTARIO_ESA_REFERENCE, EMPLOYMENT_AT_WILL } from '../../utils/legal-clauses';
import * as fs from 'fs';

export async function generateEmploymentContract(config: GeneratorConfig): Promise<void> {
  const { doc, fonts, createPage } = await createDocument({
    title: 'Employment Contract',
    category: 'Employment',
    pageSize: PAGE_SIZES.LETTER,
    margins: MARGINS.LEGAL,
  });

  const form = doc.getForm();

  // ============ PAGE 1 ============
  let ctx = createPage();
  drawHeader(ctx, 'EMPLOYMENT CONTRACT');

  drawParagraph(ctx, 'This Employment Contract ("Agreement") is entered into between the Employer and Employee identified below, effective as of the Start Date specified herein.');
  ctx.y -= SPACING.PARAGRAPH;

  // Employer Section
  drawSectionTitle(ctx, 'EMPLOYER INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Company Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'employer_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'employer_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Contact Person:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'employer_contact',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Employee Section
  drawSectionTitle(ctx, 'EMPLOYEE INFORMATION');

  drawFieldLabel(ctx.page, fonts.regular, 'Full Legal Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'employee_name',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Address:', ctx.margins.left, ctx.y + 4);
  addMultilineTextField(form, ctx.page, {
    name: 'employee_address',
    x: ctx.margins.left + 100,
    y: ctx.y - 36,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.MULTI_LINE_SMALL,
  });
  ctx.y -= FIELD_HEIGHTS.MULTI_LINE_SMALL + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Phone:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'employee_phone',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.SHORT,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Email:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'employee_email',
    x: ctx.margins.left + 270,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.SECTION;

  // Position Details
  drawSectionTitle(ctx, 'POSITION DETAILS');

  drawFieldLabel(ctx.page, fonts.regular, 'Job Title:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'job_title',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Department:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'department',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Start Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'start_date', ctx.margins.left + 100, ctx.y - 12);

  drawFieldLabel(ctx.page, fonts.regular, 'Reports To:', ctx.margins.left + 230, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'reports_to',
    x: ctx.margins.left + 300,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Work Location:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'work_location',
    x: ctx.margins.left + 100,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.LONG,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  // ============ PAGE 2 ============
  ctx = createPage();

  // Compensation
  drawSectionTitle(ctx, 'COMPENSATION', '1');

  drawFieldLabel(ctx.page, fonts.regular, 'Base Salary (CAD):', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'base_salary',
    x: ctx.margins.left + 130,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Pay Frequency:', ctx.margins.left + 280, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'pay_frequency',
    x: ctx.margins.left + 380,
    y: ctx.y - 12,
    width: 100,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly'],
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.PARAGRAPH;

  drawParagraph(ctx, 'The Employee shall be paid in accordance with the Employer\'s standard payroll practices, subject to all applicable statutory deductions including Canada Pension Plan (CPP), Employment Insurance (EI), and income tax.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Benefits
  drawSectionTitle(ctx, 'BENEFITS', '2');
  drawParagraph(ctx, 'The Employee shall be eligible for the following benefits, subject to the terms and conditions of each benefit plan:');
  ctx.y -= SPACING.PARAGRAPH;

  const benefitCheckboxX = ctx.margins.left + 20;

  addCheckbox(form, ctx.page, { name: 'benefit_health', x: benefitCheckboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Extended Health Care', benefitCheckboxX + 20, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'benefit_dental', x: benefitCheckboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Dental Coverage', benefitCheckboxX + 20, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'benefit_vision', x: benefitCheckboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Vision Care', benefitCheckboxX + 20, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'benefit_rrsp', x: benefitCheckboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'RRSP Matching Program', benefitCheckboxX + 20, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'benefit_life', x: benefitCheckboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Life Insurance', benefitCheckboxX + 20, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'benefit_disability', x: benefitCheckboxX, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Short/Long Term Disability', benefitCheckboxX + 20, ctx.y);
  ctx.y -= SPACING.SECTION;

  // Work Schedule
  drawSectionTitle(ctx, 'WORK SCHEDULE', '3');

  drawFieldLabel(ctx.page, fonts.regular, 'Hours per Week:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'hours_per_week',
    x: ctx.margins.left + 120,
    y: ctx.y - 12,
    width: 60,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });

  drawFieldLabel(ctx.page, fonts.regular, 'Work Days:', ctx.margins.left + 200, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'work_days',
    x: ctx.margins.left + 270,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['Monday-Friday', 'Tuesday-Saturday', 'Varies', 'Other'],
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 12;

  addCheckbox(form, ctx.page, { name: 'remote_work', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Remote/Hybrid work arrangement permitted', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.SECTION;

  // Probation
  drawSectionTitle(ctx, 'PROBATIONARY PERIOD', '4');

  drawFieldLabel(ctx.page, fonts.regular, 'Probation Period:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'probation_period',
    x: ctx.margins.left + 130,
    y: ctx.y - 12,
    width: 120,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['None', '30 Days', '60 Days', '90 Days', '6 Months'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.FIELD + 8;

  drawParagraph(ctx, 'During the probationary period, either party may terminate this Agreement with the minimum notice required under the Employment Standards Act, 2000.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Vacation
  drawSectionTitle(ctx, 'VACATION', '5');

  drawFieldLabel(ctx.page, fonts.regular, 'Annual Vacation Days:', ctx.margins.left + 20, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'vacation_days',
    x: ctx.margins.left + 150,
    y: ctx.y - 12,
    width: 50,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawParagraph(ctx, 'Vacation entitlement is subject to the minimum requirements under the Employment Standards Act, 2000 (Ontario). Unused vacation may be carried forward or paid out in accordance with company policy.', 20);

  // ============ PAGE 3 ============
  ctx = createPage();

  // Termination
  drawSectionTitle(ctx, 'TERMINATION', '6');
  drawParagraph(ctx, EMPLOYMENT_AT_WILL, 20);
  ctx.y -= SPACING.FIELD;

  drawFieldLabel(ctx.page, fonts.regular, 'Notice Period Required:', ctx.margins.left + 20, ctx.y + 4);
  addDropdown(form, ctx.page, {
    name: 'notice_period',
    x: ctx.margins.left + 160,
    y: ctx.y - 12,
    width: 150,
    height: FIELD_HEIGHTS.DROPDOWN,
    options: ['ESA Minimum', '2 Weeks', '4 Weeks', '8 Weeks', '3 Months'],
  });
  ctx.y -= FIELD_HEIGHTS.DROPDOWN + SPACING.CLAUSE;

  // Confidentiality
  drawSectionTitle(ctx, 'CONFIDENTIALITY', '7');
  drawParagraph(ctx, 'The Employee agrees to maintain the confidentiality of all proprietary information, trade secrets, client lists, business strategies, and other confidential information belonging to the Employer, both during and after employment.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Intellectual Property
  drawSectionTitle(ctx, 'INTELLECTUAL PROPERTY', '8');

  addCheckbox(form, ctx.page, { name: 'ip_assignment', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'Employee agrees to assign all work product and inventions created during employment to Employer', ctx.margins.left + 40, ctx.y);
  ctx.y -= SPACING.PARAGRAPH;

  drawParagraph(ctx, 'All inventions, discoveries, designs, developments, improvements, copyrightable works, and trade secrets conceived or made by the Employee during employment that relate to the Employer\'s business shall be the exclusive property of the Employer.', 20);
  ctx.y -= SPACING.CLAUSE;

  // Governing Law
  drawSectionTitle(ctx, 'GOVERNING LAW', '9');
  drawParagraph(ctx, GOVERNING_LAW, 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, ONTARIO_ESA_REFERENCE, 20);
  ctx.y -= SPACING.CLAUSE;

  // General
  drawSectionTitle(ctx, 'GENERAL PROVISIONS', '10');
  drawParagraph(ctx, SEVERABILITY, 20);
  ctx.y -= SPACING.FIELD;
  drawParagraph(ctx, 'This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements relating to the subject matter hereof.', 20);

  // ============ PAGE 4 ============
  ctx = createPage();

  // Acknowledgments
  drawSectionTitle(ctx, 'EMPLOYEE ACKNOWLEDGMENTS');
  drawParagraph(ctx, 'By signing below, the Employee acknowledges and agrees to the following:');
  ctx.y -= SPACING.PARAGRAPH;

  addCheckbox(form, ctx.page, { name: 'ack_read', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I have read and understood this Employment Contract', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'ack_legal', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I have had the opportunity to seek independent legal advice', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'ack_voluntary', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I am entering into this Agreement voluntarily', ctx.margins.left + 40, ctx.y);
  ctx.y -= 18;

  addCheckbox(form, ctx.page, { name: 'ack_policies', x: ctx.margins.left + 20, y: ctx.y - 2 });
  drawCheckboxLabel(ctx.page, fonts.regular, 'I agree to comply with all company policies and procedures', ctx.margins.left + 40, ctx.y);
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

  // Employee Signature
  ctx.page.drawText('EMPLOYEE:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'employee_signature',
    x: ctx.margins.left + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'employee_printed_name',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'employee_sign_date', ctx.margins.left + 85, ctx.y - 12);
  ctx.y -= FIELD_HEIGHTS.DATE + SPACING.SECTION;

  // Employer Signature
  ctx.page.drawText('EMPLOYER:', {
    x: ctx.margins.left,
    y: ctx.y,
    size: FONT_SIZES.BODY,
    font: fonts.bold,
  });
  ctx.y -= SPACING.PARAGRAPH;

  drawFieldLabel(ctx.page, fonts.regular, 'Signature:', ctx.margins.left, ctx.y + 4);
  drawSignatureLine(ctx.page, ctx.margins.left + 70, ctx.y - 8, FIELD_WIDTHS.SIGNATURE);
  addSignatureField(form, ctx.page, {
    name: 'employer_signature',
    x: ctx.margins.left + 70,
    y: ctx.y - 40,
    width: FIELD_WIDTHS.SIGNATURE,
    height: FIELD_HEIGHTS.SIGNATURE,
  });
  ctx.y -= FIELD_HEIGHTS.SIGNATURE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Printed Name:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'employer_printed_name',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Title:', ctx.margins.left, ctx.y + 4);
  addTextField(form, ctx.page, {
    name: 'employer_title',
    x: ctx.margins.left + 85,
    y: ctx.y - 12,
    width: FIELD_WIDTHS.MEDIUM,
    height: FIELD_HEIGHTS.SINGLE_LINE,
  });
  ctx.y -= FIELD_HEIGHTS.SINGLE_LINE + SPACING.FIELD + 8;

  drawFieldLabel(ctx.page, fonts.regular, 'Date:', ctx.margins.left, ctx.y + 4);
  addDateField(form, ctx.page, 'employer_sign_date', ctx.margins.left + 85, ctx.y - 12);

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
