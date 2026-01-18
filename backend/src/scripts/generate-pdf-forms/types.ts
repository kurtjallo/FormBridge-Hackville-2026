import { PDFDocument, PDFPage, PDFFont, PDFForm } from 'pdf-lib';

export interface DocumentConfig {
  title: string;
  category: string;
  pageSize: [number, number];
  margins: Margins;
}

export interface Margins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
}

export interface PageContext {
  doc: PDFDocument;
  page: PDFPage;
  form: PDFForm;
  fonts: Fonts;
  y: number;
  margins: Margins;
  width: number;
  height: number;
}

export interface TextFieldConfig {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  multiline?: boolean;
  maxLength?: number;
  fontSize?: number;
}

export interface CheckboxConfig {
  name: string;
  x: number;
  y: number;
  size?: number;
}

export interface DropdownConfig {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  options: string[];
}

export interface SignatureConfig {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GeneratorConfig {
  outputPath: string;
}

export interface GenerationResult {
  document: string;
  category: string;
  path: string;
  success: boolean;
  error?: string;
}
