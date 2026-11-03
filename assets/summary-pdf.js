/* FASD Compass: builds PDFs in the browser: the developmental concerns summary and the family tool plans.
   No libraries, nothing sent anywhere. Uses the standard PDF fonts Helvetica and Helvetica-Bold. v1.2.7 */
(function () {
  var W = { F1: [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 761, 556, 761, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 761, 611, 761, 761, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 761, 500, 667, 278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611, 667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500], F2: [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 761, 556, 761, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 761, 611, 761, 761, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 761, 500, 667, 278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611, 722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556] };
  var CP = { 0x20AC:128,0x201A:130,0x0192:131,0x201E:132,0x2026:133,0x2020:134,0x2021:135,0x02C6:136,0x2030:137,0x0160:138,0x2039:139,0x0152:140,0x017D:142,
    0x2018:145,0x2019:146,0x201C:147,0x201D:148,0x2022:149,0x2013:150,0x2014:151,0x02DC:152,0x2122:153,0x0161:154,0x203A:155,0x0153:156,0x017E:158,0x0178:159 };
  function enc(s) { var out = []; s = String(s == null ? '' : s).replace(/[\r\t]/g, ' ').replace(/\u00D7/g, 'x');
    for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i);
      if ((c >= 0xD800 && c <= 0xDFFF) || c === 0xFE0F || c === 0x200D || (c >= 0x2190 && c <= 0x2BFF && !CP[c])) continue; if (c >= 32 && c < 127) out.push(c); else if (c >= 160 && c <= 255) out.push(c); else if (CP[c]) out.push(CP[c]); else if (c === 10) out.push(32); else out.push(63); }
    return out; }
  function width(bytes, font, size) { var t = 0; for (var i = 0; i < bytes.length; i++) { var b = bytes[i]; t += (b >= 32 ? W[font][b - 32] : 556) || 556; } return t * size / 1000; }
  function hex(bytes) { var h = ''; for (var i = 0; i < bytes.length; i++) h += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16); return '<' + h + '>'; }
  function wrap(str, font, size, maxW) {
    var words = String(str || '').split(/\s+/).filter(Boolean), lines = [], cur = '';
    words.forEach(function (wd) { var t = cur ? cur + ' ' + wd : wd;
      if (width(enc(t), font, size) <= maxW) cur = t;
      else { if (cur) lines.push(cur); while (width(enc(wd), font, size) > maxW && wd.length > 1) { var k = wd.length; while (k > 1 && width(enc(wd.slice(0, k)), font, size) > maxW) k--; lines.push(wd.slice(0, k)); wd = wd.slice(k); } cur = wd; } });
    if (cur) lines.push(cur); return lines.length ? lines : [''];
  }
  function Doc() { this.pages = []; this.newPage(); }
  Doc.prototype.newPage = function () { this.ops = []; this.pages.push(this.ops); this.y = 792; };
  Doc.prototype.need = function (h) { if (this.y - h < 56) { this.newPage(); } };
  Doc.prototype.text = function (x, y, s, font, size, rgb) { this.ops.push((rgb || '0.11 0.16 0.22') + ' rg BT /' + font + ' ' + size + ' Tf ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Td ' + hex(enc(s)) + ' Tj ET'); };
  Doc.prototype.line = function (x1, y1, x2, y2, rgb, wdt) { this.ops.push((rgb || '0.8 0.84 0.87') + ' RG ' + (wdt || 0.6) + ' w ' + x1 + ' ' + y1.toFixed(2) + ' m ' + x2 + ' ' + y2.toFixed(2) + ' l S'); };
  Doc.prototype.rect = function (x, y, w, h, stroke, fill) { this.ops.push((fill ? fill + ' rg ' : '') + (stroke ? stroke + ' RG 0.8 w ' : '') + x + ' ' + y.toFixed(2) + ' ' + w + ' ' + h.toFixed(2) + ' re ' + (fill && stroke ? 'B' : fill ? 'f' : 'S')); };
  Doc.prototype.para = function (s, opt) { opt = opt || {}; var f = opt.font || 'F1', sz = opt.size || 10, x = opt.x || 50, mw = opt.w || 495, lh = sz * 1.35;
    var ls = wrap(s, f, sz, mw); this.need(ls.length * lh + 2); var self = this;
    ls.forEach(function (l) { self.y -= lh; self.text(x, self.y + 3, l, f, sz, opt.rgb); }); this.y -= (opt.after == null ? 4 : opt.after); };
  Doc.prototype.labelled = function (label, value) { var lw = width(enc(label + ' '), 'F2', 10); var ls = wrap(value, 'F1', 10, 495 - lw); this.need(ls.length * 13.5 + 2); this.y -= 13.5;
    this.text(50, this.y + 3, label, 'F2', 10); this.text(50 + lw, this.y + 3, ls[0], 'F1', 10); for (var i = 1; i < ls.length; i++) { this.y -= 13.5; this.text(50 + lw, this.y + 3, ls[i], 'F1', 10); } this.y -= 3; };
  Doc.prototype.bytes = function () {
    var objs = [], n = this.pages.length, kids = [], i;
    objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    objs[5] = '<< /Title ' + hex(enc(this.title || 'Developmental concerns summary')) + ' /Producer (FASD Compass) /Creator (fasdcompass.co.uk) >>';
    for (i = 0; i < n; i++) { var pid = 6 + i * 2, cid = pid + 1; kids.push(pid + ' 0 R');
      var ops = this.pages[i].slice(); ops.push('0.35 0.4 0.45 rg BT /F1 8 Tf 50 30 Td ' + hex(enc('FASD Compass · fasdcompass.co.uk · Page ' + (i + 1) + ' of ' + n)) + ' Tj ET');
      var stream = ops.join('\n');
      objs[pid] = '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + cid + ' 0 R >>';
      objs[cid] = '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream'; }
    objs[2] = '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + n + ' >>';
    var out = '%PDF-1.4\n', offs = [];
    for (i = 1; i < objs.length; i++) { offs[i] = out.length; out += i + ' 0 obj\n' + objs[i] + '\nendobj\n'; }
    var x = out.length; out += 'xref\n0 ' + objs.length + '\n0000000000 65535 f \n';
    for (i = 1; i < objs.length; i++) out += ('0000000000' + offs[i]).slice(-10) + ' 00000 n \n';
    out += 'trailer\n<< /Size ' + objs.length + ' /Root 1 0 R /Info 5 0 R >>\nstartxref\n' + x + '\n%%EOF';
    var b = new Uint8Array(out.length); for (i = 0; i < out.length; i++) b[i] = out.charCodeAt(i) & 255; return b;
  };
  var NAVY = '0.05 0.14 0.25', TEAL = '0.07 0.48 0.43', GREY = '0.33 0.38 0.43';
  function build(d) {
    var doc = new Doc();
    doc.text(50, doc.y, 'FASD COMPASS · DEVELOPMENTAL CONCERNS SUMMARY', 'F2', 8.5, TEAL); doc.y -= 24;
    doc.text(50, doc.y, 'Developmental concerns to discuss', 'F2', 18, NAVY); doc.y -= 12;
    doc.line(50, doc.y, 545, doc.y, NAVY, 1.2); doc.y -= 4;
    doc.labelled('Date completed:', d.date);
    doc.labelled('Completed by:', d.completedBy || 'Parent or carer');
    if (d.ageRange) doc.labelled('Child\u2019s age range:', d.ageRange);
    doc.y -= 4;
    var dl = wrap(d.disclaimer, 'F2', 9.5, 479), bh = dl.length * 12.8 + 12; doc.need(bh + 6);
    doc.rect(50, doc.y - bh, 495, bh, '0.79 0.54 0', '1 0.97 0.9'); var yy = doc.y - 4;
    dl.forEach(function (l) { yy -= 12.8; doc.text(58, yy + 3, l, 'F2', 9.5, '0.23 0.16 0'); }); doc.y -= bh + 12;
    // table
    var cx = [50, 210, 330], cw = [154, 114, 215];
    doc.need(20); doc.y -= 13; ['Area', 'What was reported', 'Parent or carer example'].forEach(function (h, i) { doc.text(cx[i], doc.y + 3, h, 'F2', 9, NAVY); });
    doc.y -= 4; doc.line(50, doc.y, 545, doc.y, NAVY, 1);
    d.areas.forEach(function (a) {
      var c0 = wrap(a.domain, a.concern ? 'F2' : 'F1', 9, cw[0]), c1 = wrap(a.status, a.concern ? 'F2' : 'F1', 9, cw[1]), c2 = wrap(a.note || '', 'F1', 9, cw[2]);
      var rows = Math.max(c0.length, c1.length, c2.length), h = rows * 11.5 + 7; doc.need(h);
      var top = doc.y; [c0, c1, c2].forEach(function (col, i) { col.forEach(function (l, k) { doc.text(cx[i], top - 11.5 * (k + 1) + 1, l, (i < 2 && a.concern) ? 'F2' : 'F1', 9); }); });
      doc.y -= h; doc.line(50, doc.y, 545, doc.y);
    });
    doc.y -= 8;
    doc.labelled('Information about alcohol in pregnancy:', d.pae);
    doc.labelled('Concerns to discuss:', d.concerns);
    if (d.strengths) doc.labelled('Strengths and interests:', d.strengths);
    if (d.notes) doc.labelled('Other notes:', d.notes);
    doc.y -= 4; doc.para('Questions for the clinician', { font: 'F2', size: 10.5, rgb: NAVY, after: 1 });
    d.questions.forEach(function (q) { var ls = wrap(q, 'F1', 9.5, 480); doc.need(ls.length * 12.5);
      ls.forEach(function (l, k) { doc.y -= 12.5; if (!k) doc.text(54, doc.y + 3, '\u2022', 'F1', 9.5); doc.text(64, doc.y + 3, l, 'F1', 9.5); }); });
    doc.y -= 10; doc.para(d.footer, { size: 8, rgb: GREY });
    return doc.bytes();
  }
  /* Generic document from simple blocks, used by the family tools.
     Block types: eyebrow, title, meta, notice, h2, h3, p, li, foot */
  function blocks(list, title) {
    var doc = new Doc(); doc.title = title; var first = true;
    list.forEach(function (b) {
      var s = String(b.s == null ? '' : b.s).replace(/\s+/g, ' ').trim(); if (!s && b.t !== 'gap') return;
      if (b.t === 'eyebrow') { doc.y -= first ? 0 : 6; doc.text(50, doc.y, s.toUpperCase(), 'F2', 8.5, TEAL); doc.y -= 24; }
      else if (b.t === 'title') { wrap(s, 'F2', 18, 495).forEach(function (l) { doc.need(24); doc.text(50, doc.y, l, 'F2', 18, NAVY); doc.y -= 22; }); doc.y += 10; doc.line(50, doc.y, 545, doc.y, NAVY, 1.2); doc.y -= 4; }
      else if (b.t === 'meta') doc.para(s, { size: 9.5, rgb: GREY, after: 4 });
      else if (b.t === 'notice') { var dl = wrap(s, 'F2', 9.5, 479), bh = dl.length * 12.8 + 12; doc.need(bh + 8); doc.y -= 4;
        doc.rect(50, doc.y - bh, 495, bh, '0.79 0.54 0', '1 0.97 0.9'); var yy = doc.y - 4;
        dl.forEach(function (l) { yy -= 12.8; doc.text(58, yy + 3, l, 'F2', 9.5, '0.23 0.16 0'); }); doc.y -= bh + 8; }
      else if (b.t === 'h2') { doc.need(48); doc.y -= 8; doc.para(s, { font: 'F2', size: 12.5, rgb: NAVY, after: 2 }); doc.line(50, doc.y, 545, doc.y, '0.07 0.48 0.43', 0.8); doc.y -= 3; }
      else if (b.t === 'h3') { doc.need(34); doc.y -= 2; doc.para(s, { font: 'F2', size: 10.5, rgb: TEAL, after: 1 }); }
      else if (b.t === 'li') { var ls = wrap(s, 'F1', 10, 478); doc.need(ls.length * 13.2 + 1);
        ls.forEach(function (l, k) { doc.y -= 13.2; if (!k) doc.text(56, doc.y + 3, '\u2022', 'F1', 10); doc.text(67, doc.y + 3, l, 'F1', 10); }); doc.y -= 1.5; }
      else if (b.t === 'foot') { doc.y -= 8; doc.para(s, { size: 8, rgb: GREY }); }
      else doc.para(s, { size: 10, after: 4 });
      first = false;
    });
    return doc.bytes();
  }
  function save(bytes, filename, type) {
    var blob = new Blob([bytes], { type: type || 'application/pdf' }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
  function download(d, filename) {
    var blob = new Blob([build(d)], { type: 'application/pdf' }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename || 'developmental-concerns-summary.pdf'; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
  var api = { build: build, download: download, blocks: blocks, save: save, _wrap: wrap };
  if (typeof window !== 'undefined') window.FASDSummaryPDF = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
