// Phase 3 parent tools tests: PDF and Word export, plan wording, disclaimers.
// Run: node tests/tools.test.js   (no dependencies)
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const PDF = require(path.join(root, 'assets', 'summary-pdf.js'));
const DOCX = require(path.join(root, 'assets', 'docx-lite.js'));
let pass = 0, fail = 0;
function ok(name, cond, extra) { if (cond) pass++; else { fail++; console.log('FAIL', name, extra || ''); } }

// 1. PDF blocks
const blocks = [
  { t: 'eyebrow', s: 'FASD Compass' }, { t: 'title', s: 'Support plan for Sam' }, { t: 'meta', s: 'Made on 3 November 2026' },
  { t: 'notice', s: 'It is not an individual clinical assessment.' }, { t: 'h2', s: 'Strengths and interests' },
  { t: 'li', s: 'Loves animals 🐶 and drawing' }, { t: 'p', s: 'Short sentences help. ' + 'Long text wraps. '.repeat(400) }, { t: 'foot', s: 'fasdcompass.co.uk' }
];
const pdf = Buffer.from(PDF.blocks(blocks, 'Support plan'));
const ps = pdf.toString('latin1');
ok('pdf header', ps.startsWith('%PDF-1.'));
ok('pdf trailer', /%%EOF\s*$/.test(ps));
ok('pdf multi-page for long text', (ps.match(/\/Type \/Page\b/g) || []).length >= 2);
ok('pdf title in info', ps.includes('/Title <' + Buffer.from('Support plan').toString('hex') + '>') || ps.includes('(Support plan)'));
ok('pdf no question marks from emoji', !/animals \?/.test(ps));
ok('pdf xref offsets valid', (() => { const m = ps.match(/startxref\s+(\d+)/); return m && ps.slice(+m[1], +m[1] + 4) === 'xref'; })());

// 2. Word document
const docx = Buffer.from(DOCX.build(blocks, 'Support plan'));
ok('docx is zip', docx.slice(0, 4).toString('hex') === '504b0304');
function entries(buf) { // read central directory (stored entries)
  const out = {}; let e = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const n = buf.readUInt16LE(e + 10); let p = buf.readUInt32LE(e + 16);
  for (let i = 0; i < n; i++) {
    const comp = buf.readUInt16LE(p + 10), crc = buf.readUInt32LE(p + 16), size = buf.readUInt32LE(p + 20);
    const nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nl).toString();
    const lnl = buf.readUInt16LE(off + 26), lxl = buf.readUInt16LE(off + 28);
    const data = buf.slice(off + 30 + lnl + lxl, off + 30 + lnl + lxl + size);
    out[name] = { comp, crc, data }; p += 46 + nl + xl + cl;
  }
  return out;
}
const z = entries(docx);
['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/styles.xml', 'word/numbering.xml', 'docProps/core.xml'].forEach(n => ok('docx has ' + n, !!z[n]));
ok('docx crc matches', Object.values(z).every(f => (zlib.crc32 ? zlib.crc32(f.data) >>> 0 === f.crc : DOCX._crc32(f.data) >>> 0 === f.crc)));
const docXml = z['word/document.xml'] ? z['word/document.xml'].data.toString('utf8') : '';
ok('docx contains heading', docXml.includes('Strengths and interests'));
ok('docx keeps emoji text', docXml.includes('Loves animals'));
ok('docx escapes xml', (() => { const d = Buffer.from(DOCX.build([{ t: 'p', s: 'A & B <c>' }], 'x')); return entries(d)['word/document.xml'].data.toString().includes('A &amp; B &lt;c&gt;'); })());

// 3. Wording in the tools and pages
const tools = read('assets/tools.js');
ok('support plan disclaimer', /not an individual clinical assessment/.test(tools));
ok('regulation plan disclaimer', /not every difficulty is caused by FASD/.test(tools));
const pages = ['support-plan/index.html', 'regulation-toolkit/index.html', 'everyday-solutions/index.html', 'routine-builder/index.html', 'my-fasd-compass/index.html'];
const BANNED = [/\bconfirms? (?:fasd|a diagnosis)\b/i, /\brules? out fasd\b(?![^.]*\bcannot\b)/i, /\byour child has fasd\b/i, /\bworks offline\b/i, /\bdiagnostic of fasd\b/i, /(?<!not an individual )\bclinical assessment of your child\b/i];
const toText = h => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
pages.forEach(p => {
  const h = read(p), t = toText(h);
  BANNED.forEach(r => ok(p + ' avoids ' + r, !r.test(t), (t.match(r) || [])[0]));
  ok(p + ' has version 1.2.5 assets', !/v=1\.2\.[0-4]\b/.test(h));
  ok(p + ' links My FASD Compass in footer', h.includes('href="/my-fasd-compass/">My FASD Compass</a>'));
});
ok('support plan page states not a clinical assessment', /not a clinical assessment/i.test(toText(read('support-plan/index.html'))));
ok('regulation page says not every difficulty is FASD', /Not every difficulty is caused by FASD/i.test(toText(read('regulation-toolkit/index.html'))));
const lib = toText(read('everyday-solutions/index.html'));
['Memory', 'Attention', 'Instructions', 'Transitions', 'Sleep', 'Eating', 'Hygiene', 'Friendships', 'Emotional regulation', 'School attendance', 'Safety', 'Independence']
  .forEach(tp => ok('library topic ' + tp, new RegExp('\\b' + tp + '\\b', 'i').test(lib)));
const h4s = (read('everyday-solutions/index.html').match(/<h4[^>]*>[^<]*<\/h4>/g) || []).map(x => x.replace(/<[^>]+>/g, ''));
['What might be happening?', 'Why might this be difficult?', 'When to get more help'].forEach(q => ok('library parts: ' + q, h4s.filter(x => x.startsWith(q)).length >= 12, h4s.filter(x => x.startsWith(q)).length));
ok('routine builder has no network calls', !/fetch\(|XMLHttpRequest|sendBeacon/.test(read('assets/routines.js')));
ok('docx writer has no network calls', !/fetch\(|XMLHttpRequest|sendBeacon/.test(read('assets/docx-lite.js')));

console.log(`tools tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
