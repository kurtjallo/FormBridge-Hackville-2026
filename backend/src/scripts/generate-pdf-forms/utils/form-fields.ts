import { PDFPage, PDFForm, PDFTextField, PDFCheckBox, PDFDropdown, rgb } from 'pdf-lib';
import { TextFieldConfig, CheckboxConfig, DropdownConfig, SignatureConfig } from '../types';
import { COLORS, FIELD_HEIGHTS } from './layout';

export function addTextField(
  form: PDFForm,
  page: PDFPage,
  config: TextFieldConfig
): PDFTextField {
  const field = form.createTextField(config.name);

  field.addToPage(page, {
    x: config.x,
    y: config.y,
    width: config.width,
    height: config.height,
    borderWidth: 1,
    borderColor: COLORS.FIELD_BORDER,
    backgroundColor: COLORS.FIELD_BACKGROUND,
  });

  if (config.maxLength) {
    field.setMaxLength(config.maxLength);
  }

  if (config.fontSize) {
    field.setFontSize(config.fontSize);
  } else {
    field.setFontSize(10);
  }

  return field;
}

export function addMultilineTextField(
  form: PDFForm,
  page: PDFPage,
  config: TextFieldConfig
): PDFTextField {
  const field = form.createTextField(config.name);

  field.addToPage(page, {
    x: config.x,
    y: config.y,
    width: config.width,
    height: config.height,
    borderWidth: 1,
    borderColor: COLORS.FIELD_BORDER,
    backgroundColor: COLORS.FIELD_BACKGROUND,
  });

  field.enableMultiline();

  if (config.maxLength) {
    field.setMaxLength(config.maxLength);
  }

  if (config.fontSize) {
    field.setFontSize(config.fontSize);
  } else {
    field.setFontSize(9);
  }

  return field;
}

export function addCheckbox(
  form: PDFForm,
  page: PDFPage,
  config: CheckboxConfig
): PDFCheckBox {
  const size = config.size || FIELD_HEIGHTS.CHECKBOX;
  const field = form.createCheckBox(config.name);

  field.addToPage(page, {
    x: config.x,
    y: config.y,
    width: size,
    height: size,
    borderWidth: 1,
    borderColor: COLORS.FIELD_BORDER,
    backgroundColor: COLORS.FIELD_BACKGROUND,
  });

  return field;
}

export function addDropdown(
  form: PDFForm,
  page: PDFPage,
  config: DropdownConfig
): PDFDropdown {
  const field = form.createDropdown(config.name);

  field.addToPage(page, {
    x: config.x,
    y: config.y,
    width: config.width,
    height: config.height,
    borderWidth: 1,
    borderColor: COLORS.FIELD_BORDER,
    backgroundColor: COLORS.FIELD_BACKGROUND,
  });

  field.addOptions(config.options);
  field.setFontSize(9);

  return field;
}

export function addSignatureField(
  form: PDFForm,
  page: PDFPage,
  config: SignatureConfig
): PDFTextField {
  const field = form.createTextField(config.name);

  field.addToPage(page, {
    x: config.x,
    y: config.y,
    width: config.width,
    height: config.height,
    borderWidth: 1,
    borderColor: COLORS.BLACK,
    backgroundColor: rgb(1, 1, 1),
  });

  field.setFontSize(12);

  return field;
}

export function addDateField(
  form: PDFForm,
  page: PDFPage,
  name: string,
  x: number,
  y: number,
  width: number = 100
): PDFTextField {
  return addTextField(form, page, {
    name,
    x,
    y,
    width,
    height: FIELD_HEIGHTS.DATE,
    maxLength: 10,
    fontSize: 10,
  });
}
