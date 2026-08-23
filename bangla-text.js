// ====================================================
// BANGLA TEXT → PDF RENDERER
// ----------------------------------------------------
// WHY THIS EXISTS
// jsPDF can embed a Bengali TTF, but it writes glyphs in plain logical
// order. It performs NO OpenType shaping (GSUB/GPOS), which Bengali
// absolutely requires:
//   • যুক্তাক্ষর (conjuncts)  ক + ্ + ষ  →  ক্ষ
//   • pre-base vowels        ক + ি      →  কি  (ি must move BEFORE ক)
//   • রেফ / র-ফলা / য-ফলা and matra positioning
// Without shaping you get broken/disjointed Bangla — exactly the bug —
// while English (which needs no shaping) looks fine.
//
// THE FIX
// The browser already has a full shaping engine (HarfBuzz) driving
// <canvas>. So Bangla runs are drawn to an off-screen canvas at high
// resolution, then placed into the PDF as an image at the exact same
// position/size the text would have occupied. English text is untouched
// and stays as real selectable PDF text.
// ====================================================

'use strict';

const BN_FAMILY = 'BanglaPdfFont';
const BN_PT2MM  = 25.4 / 72;   // 1 pt in mm
const BN_SS     = 4;           // supersampling: 4 canvas px per pt ≈ 288 DPI (sharp in print, small file)

const bnState = {
  ready: false,
  usingSystemFallback: false,
  cache: new Map()
};

// ---------------------------------------------------
// FONT REGISTRATION (for the canvas, not for jsPDF)
// ---------------------------------------------------
// Reuses the exact TTF bytes loadBanglaFont() already fetched/cached, so
// no extra download and it works fully offline. If that isn't available
// we fall back to the local file, then to any Bengali font on the device
// (every Android/iOS phone ships one) — shaping is correct either way.
async function initBanglaCanvasFont(base64ttf) {
  if (bnState.ready) return true;

  const tryFace = async (source) => {
    try {
      const face = new FontFace(BN_FAMILY, source);
      await face.load();
      document.fonts.add(face);
      return true;
    } catch (_) { return false; }
  };

  let ok = false;

  // 1. Bytes already in hand (from the jsPDF font loader / localStorage)
  if (base64ttf) {
    const buf = _base64ToArrayBuffer(base64ttf);
    if (buf && buf.byteLength > 1000) ok = await tryFace(buf);
  }

  // 2. Local bundled file
  if (!ok) ok = await tryFace('url(fonts/NotoSansBengali-Regular.ttf)');

  // 3. Whatever Bengali font the device/webfont stack provides
  if (!ok) {
    bnState.usingSystemFallback = true;
    try { await document.fonts.ready; } catch (_) {}
  }

  bnState.ready = true;
  return ok;
}

function bnFontString(px, bold) {
  const stack = `"${BN_FAMILY}", "Noto Sans Bengali", "Nirmala UI", "Vrinda", "Kalpurush", "SolaimanLipi", sans-serif`;
  return `${bold ? 700 : 400} ${px}px ${stack}`;
}

let _bnCanvas = null, _bnCtx = null;
function bnCtx() {
  if (!_bnCtx) {
    _bnCanvas = document.createElement('canvas');
    _bnCtx = _bnCanvas.getContext('2d');
  }
  return _bnCtx;
}

function bnRgb(color) {
  if (Array.isArray(color)) return `rgb(${color[0]},${color[1]},${color[2]})`;
  return color || '#000000';
}

// ---------------------------------------------------
// MEASURE (in mm, matching jsPDF's unit)
// ---------------------------------------------------
function bnMeasure(text, sizePt, bold) {
  const ctx = bnCtx();
  const px = sizePt * BN_SS;
  ctx.font = bnFontString(px, bold);
  const m = ctx.measureText(text);

  // fontBoundingBox covers reph/matra/descenders that stick out beyond
  // the ink box of this particular string — using it keeps every line of
  // a paragraph on a consistent baseline.
  const asc  = m.fontBoundingBoxAscent  || m.actualBoundingBoxAscent  || px * 0.95;
  const desc = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent || px * 0.35;

  return {
    wMm:   (m.width / BN_SS) * BN_PT2MM,
    ascMm: (asc    / BN_SS) * BN_PT2MM,
    descMm:(desc   / BN_SS) * BN_PT2MM,
    _px: px, _w: m.width, _asc: asc, _desc: desc
  };
}

// ---------------------------------------------------
// RENDER ONE LINE TO A PNG DATA URL
// ---------------------------------------------------
function bnRenderLine(text, sizePt, bold, color) {
  const key = `${text}|${sizePt}|${bold ? 1 : 0}|${bnRgb(color)}`;
  if (bnState.cache.has(key)) return bnState.cache.get(key);

  const m = bnMeasure(text, sizePt, bold);
  const pad = Math.ceil(m._px * 0.12);
  const w = Math.max(1, Math.ceil(m._w) + pad * 2);
  const h = Math.max(1, Math.ceil(m._asc + m._desc) + pad * 2);

  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  ctx.font = bnFontString(m._px, bold);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = bnRgb(color);
  ctx.fillText(text, pad, pad + m._asc);

  const out = {
    url:   cv.toDataURL('image/png'),
    wMm:   (w / BN_SS) * BN_PT2MM,
    hMm:   (h / BN_SS) * BN_PT2MM,
    ascMm: ((pad + m._asc) / BN_SS) * BN_PT2MM
  };

  // Keep the cache bounded — a 200-house report reuses far fewer strings
  if (bnState.cache.size > 400) bnState.cache.clear();
  bnState.cache.set(key, out);
  return out;
}

// ---------------------------------------------------
// WORD WRAP (Bangla-aware)
// ---------------------------------------------------
function bnWrap(text, sizePt, bold, maxWidthMm) {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let line = '';

  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (bnMeasure(test, sizePt, bold).wMm <= maxWidthMm || !line) {
      // A single word longer than the cell is hard-split by character
      if (!line && bnMeasure(word, sizePt, bold).wMm > maxWidthMm) {
        let chunk = '';
        for (const ch of word) {
          if (bnMeasure(chunk + ch, sizePt, bold).wMm > maxWidthMm && chunk) {
            lines.push(chunk); chunk = ch;
          } else { chunk += ch; }
        }
        line = chunk;
        continue;
      }
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// ---------------------------------------------------
// PUBLIC: drop-in replacement for doc.text()
// ---------------------------------------------------
// opts: { size, bold, color, align: 'left'|'center'|'right', maxWidth }
// Non-Bangla text goes straight to doc.text() so English stays as real,
// selectable, fully vector PDF text.
function bnText(doc, text, x, y, opts = {}) {
  const str = String(text == null ? '' : text);
  const size  = opts.size  != null ? opts.size : doc.getFontSize();
  const bold  = !!opts.bold;
  const color = opts.color || [0, 0, 0];
  const align = opts.align || 'left';

  if (!containsBengali(str) || !bnState.ready) {
    if (opts.color) doc.setTextColor(...(Array.isArray(color) ? color : [0, 0, 0]));
    if (opts.size) doc.setFontSize(size);
    doc.text(str, x, y, align === 'left' ? undefined : { align });
    return;
  }

  let img = bnRenderLine(str, size, bold, color);
  let w = img.wMm, h = img.hMm, asc = img.ascMm;

  // Shrink-to-fit rather than overflow the column/box it belongs to
  if (opts.maxWidth && w > opts.maxWidth) {
    const k = opts.maxWidth / w;
    w *= k; h *= k; asc *= k;
  }

  let dx = x;
  if (align === 'center') dx = x - w / 2;
  else if (align === 'right') dx = x - w;

  try {
    doc.addImage(img.url, 'PNG', dx, y - asc, w, h);
  } catch (_) {
    // Absolute last resort — embedded font, unshaped but visible
    doc.text(str, x, y, align === 'left' ? undefined : { align });
  }
}

// ---------------------------------------------------
// PUBLIC: multi-line block, returns height used (mm)
// ---------------------------------------------------
function bnTextBlock(doc, text, x, y, widthMm, opts = {}) {
  const size = opts.size != null ? opts.size : doc.getFontSize();
  const bold = !!opts.bold;
  const lineH = opts.lineHeight || size * BN_PT2MM * 1.32;
  const lines = bnWrap(text, size, bold, widthMm);

  lines.forEach((ln, i) => {
    let lx = x;
    if (opts.align === 'center') lx = x + widthMm / 2;
    else if (opts.align === 'right') lx = x + widthMm;
    bnText(doc, ln, lx, y + i * lineH, {
      size, bold, color: opts.color, align: opts.align || 'left', maxWidth: widthMm
    });
  });

  return lines.length * lineH;
}

// ---------------------------------------------------
// PUBLIC: autoTable integration
// ---------------------------------------------------
// Call from didParseCell: blanks the cell's own text (so jsPDF never
// draws unshaped glyphs) while reserving the correct number of lines so
// the row height is still right.
function bnPrepareCell(data, colWidthsMm) {
  if (data.section !== 'body') return;
  const raw = data.cell.raw;
  const str = Array.isArray(raw) ? raw.join(' ') : String(raw == null ? '' : raw);
  if (!str || !containsBengali(str) || !bnState.ready) return;

  const size = data.cell.styles.fontSize || 7;
  const pad  = 2 * (data.cell.styles.cellPadding || 2.5);
  const colW = (colWidthsMm && colWidthsMm[data.column.index]) || data.cell.width || 30;
  const usable = Math.max(4, colW - pad);

  const lines = bnWrap(str, size, false, usable);
  data.cell._bnLines  = lines;
  data.cell._bnWidth  = usable;
  data.cell._bnSize   = size;
  // Reserve the vertical space, but draw nothing: spaces keep autoTable's
  // height maths correct without painting broken glyphs.
  data.cell.text = lines.map(() => ' ');
}

// Call from didDrawCell: paints the shaped Bangla over the blanked cell.
function bnDrawCell(doc, data) {
  const lines = data.cell._bnLines;
  if (!lines || !lines.length) return;

  const size   = data.cell._bnSize || 7;
  const color  = data.cell.styles.textColor || [15, 23, 42];
  const padMm  = data.cell.styles.cellPadding || 2.5;
  const lineH  = size * BN_PT2MM * 1.32;
  const halign = data.cell.styles.halign || 'left';

  // Vertically centered inside the (possibly taller) row, like autoTable does
  const blockH = lines.length * lineH;
  let y = data.cell.y + Math.max(padMm, (data.cell.height - blockH) / 2) + lineH * 0.78;

  // Hard clamp to the cell's REAL width (the estimate used at parse time
  // can differ for auto-width columns) so text can never spill outside.
  const safeW = Math.max(3, Math.min(data.cell._bnWidth || 999, data.cell.width - padMm * 2));

  lines.forEach((ln, i) => {
    let x = data.cell.x + padMm;
    if (halign === 'center') x = data.cell.x + data.cell.width / 2;
    else if (halign === 'right') x = data.cell.x + data.cell.width - padMm;
    bnText(doc, ln, x, y + i * lineH, {
      size,
      color: Array.isArray(color) ? color : [15, 23, 42],
      align: halign === 'center' ? 'center' : halign === 'right' ? 'right' : 'left',
      maxWidth: safeW
    });
  });
}
