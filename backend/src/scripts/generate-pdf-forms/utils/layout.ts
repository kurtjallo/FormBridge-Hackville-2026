import { rgb, RGB } from 'pdf-lib';

// Standard page sizes in points (72 points = 1 inch)
export const PAGE_SIZES = {
  LETTER: [612, 792] as [number, number],   // 8.5" x 11"
  LEGAL: [612, 1008] as [number, number],   // 8.5" x 14"
  A4: [595, 842] as [number, number],
};

// Standard margins in points
export const MARGINS = {
  STANDARD: { top: 72, bottom: 72, left: 72, right: 72 },      // 1" all around
  NARROW: { top: 54, bottom: 54, left: 54, right: 54 },        // 0.75"
  LEGAL: { top: 72, bottom: 90, left: 72, right: 72 },         // Extra bottom for footer
};

// Font sizes
export const FONT_SIZES = {
  TITLE: 16,
  SECTION_HEADER: 12,
  SUBSECTION: 11,
  BODY: 10,
  SMALL: 9,
  FIELD_LABEL: 8,
  FOOTER: 8,
};

// Line heights (multiplier of font size)
export const LINE_HEIGHTS = {
  TIGHT: 1.2,
  NORMAL: 1.4,
  RELAXED: 1.6,
};

// Colors
export const COLORS: Record<string, RGB> = {
  BLACK: rgb(0, 0, 0),
  DARK_GRAY: rgb(0.3, 0.3, 0.3),
  GRAY: rgb(0.5, 0.5, 0.5),
  LIGHT_GRAY: rgb(0.85, 0.85, 0.85),
  FIELD_BORDER: rgb(0.6, 0.6, 0.6),
  FIELD_BACKGROUND: rgb(0.97, 0.97, 0.97),
};

// Field dimensions
export const FIELD_HEIGHTS = {
  SINGLE_LINE: 18,
  DATE: 18,
  MULTI_LINE_SMALL: 40,
  MULTI_LINE_MEDIUM: 60,
  MULTI_LINE_LARGE: 100,
  CHECKBOX: 12,
  SIGNATURE: 50,
  DROPDOWN: 18,
};

// Field widths
export const FIELD_WIDTHS = {
  SHORT: 100,
  MEDIUM: 200,
  LONG: 300,
  FULL: 468,  // LETTER width - 2*72 margins
  DATE: 100,
  PHONE: 120,
  POSTAL: 80,
  SIGNATURE: 200,
};

// Spacing
export const SPACING = {
  SECTION: 24,
  PARAGRAPH: 12,
  FIELD: 8,
  LINE: 4,
  CLAUSE: 16,
};
