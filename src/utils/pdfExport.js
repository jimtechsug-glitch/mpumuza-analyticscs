/**
 * pdfExport.js  –  Mpumuza Analytics  |  Direct PDF Downloader
 *
 * The report card shell is already fixed at exactly 794 × 1123 px (A4 at 96 dpi)
 * and all content inside it is already CSS-scaled to fit.  So we simply:
 *   1. Capture the element as a JPEG at 2× pixel ratio (crisp text/colours)
 *   2. Place the resulting image to fill the entire A4 PDF page
 *
 * Uses `html-to-image` for rendering (handles oklch, Tailwind v4, flex/grid,
 * Google Fonts, etc.) and jsPDF to package and download the file.
 */

import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';

// A4 dimensions
const A4_W_MM  = 210;
const A4_H_MM  = 297;
const MARGIN   = 4;           // mm — small breathing room
const IMG_W    = A4_W_MM - MARGIN * 2;   // 202 mm
const IMG_H    = A4_H_MM - MARGIN * 2;   // 289 mm

// The report card shell is rendered at exactly these pixel dimensions
const SHELL_W_PX = 794;
const SHELL_H_PX = 1123;

/**
 * Downloads one or more report cards as a single PDF to local storage.
 *
 * @param {HTMLElement} element      – The .print-container shell element
 * @param {string}      filename     – Output filename (with or without .pdf)
 * @param {Function}   [onProgress] – (current, total) => void
 * @returns {Promise<boolean>}
 */
export const exportElementToPDF = async (
  element,
  filename = 'Mpumuza_Report_Card.pdf',
  onProgress
) => {
  if (!element) {
    console.error('[PDF Export] No target element provided');
    return false;
  }

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Support batch mode: find all .print-container children, or use the element itself
  const cards   = Array.from(element.querySelectorAll('.print-container'));
  const targets = cards.length > 0 ? cards : [element];

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    for (let i = 0; i < targets.length; i++) {
      onProgress?.(i + 1, targets.length);

      const target = targets[i];
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      await new Promise((r) => setTimeout(r, 100)); // settle animations/fonts

      // Capture the element.  Because the shell is already 794 × 1123 px,
      // we tell html-to-image exactly those dimensions and use 2× pixel ratio
      // for sharp text without needing any extra scaling.
      const dataUrl = await toJpeg(target, {
        quality: 0.97,
        pixelRatio: 2,
        width:  SHELL_W_PX,
        height: SHELL_H_PX,
        backgroundColor: '#ffffff',
        skipAutoScale: true,
        filter: (node) => {
          if (node.classList?.contains('print:hidden')) return false;
          if (node.getAttribute?.('data-print-hidden') === 'true') return false;
          return true;
        },
      });

      if (i > 0) pdf.addPage();

      // Place the image to fill the entire A4 content area (margin on all sides)
      pdf.addImage(dataUrl, 'JPEG', MARGIN, MARGIN, IMG_W, IMG_H);
    }

    pdf.save(cleanFilename);
    onProgress?.(targets.length, targets.length);
    return true;
  } catch (err) {
    console.error('[PDF Export Error]:', err);
    return false;
  }
};
