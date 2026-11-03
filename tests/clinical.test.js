// Phase 5 clinical toolkit tests: content, disclaimers, safety wording and links.
// Run: node tests/clinical.test.js   (no dependencies)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const exists = p => fs.existsSync(path.join(root, p));
let pass = 0, fail = 0;
function ok(name, cond, extra) { if (cond) pass++; else { fail++; console.log('FAIL', name, extra || ''); } }
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const main = h => strip(h.slice(h.indexOf('<main'), h.indexOf('</main>')));

const PAGES = ['clinical-toolkit', 'clinical-assessment-checklist', 'clinical-quick-reference', 'clinician-learning'];
const BANNED = [/\bconfirms? (that )?(the child has )?FASD\b/i, /\bthis child (has|probably has|likely has) FASD\b/i, /\bscor(e|ed|ing)\b/i, /\beligib/i,
  /\bmother (drank|was drinking)\b/i, /\balcohol abuse\b/i, /\bin care\b[^.]*\blikely\b/i, /\bworks offline\b/i];
const EDU = 'An educational resource, not a diagnostic tool';

for (const p of PAGES) {
  ok(p + ' exists', exists(p + '/index.html'));
  const h = read(p + '/index.html'), t = main(h);
  const tb = t.replace(/do not score, diagnose or rule out FASD/g, '').replace(/It does not score, diagnose or rule out FASD/g, '');
  ok(p + ' version 1.2.8 assets', h.includes('v=1.2.8') && !/v=1\.2\.[0-7]\b/.test(h));
  ok(p + ' footer links clinical toolkit', h.includes('<li><a href="/clinical-toolkit/">Clinical Toolkit</a></li>'));
  ok(p + ' clinicians tab active', h.includes('<a class="aud-btn active" href="/clinicians/">'));
  ok(p + ' canonical', h.includes('https://fasdcompass.co.uk/' + p + '/'));
  ok(p + ' byline', t.includes('Dr Inyang Takon, Consultant Neurodevelopmental Paediatrician'));
  ok(p + ' educational disclaimer', t.includes(EDU) && /do not decide who should be referred/.test(t));
  ok(p + ' no em dash in new prose', !/\u2014/.test(t), (t.match(/.{30}\u2014.{30}/) || [''])[0]);
  ok(p + ' no semicolons in new prose', !/;/.test(t.replace(/&[a-z]+;|&#\d+;/g, '')), (t.match(/.{30};.{30}/) || [''])[0]);
  for (const b of BANNED) ok(p + ' avoids ' + b, !b.test(tb), (tb.match(new RegExp('.{0,40}' + b.source + '.{0,40}', 'i')) || [''])[0]);
  ok(p + ' no inputs that collect identifiers', !/<input[^>]+(type="(text|date|email|tel)"|name=)/i.test(h));
  ok(p + ' no external scripts', !/<script[^>]+src="https?:/i.test(h));
  ok(p + ' in sitemap', read('sitemap.xml').includes('https://fasdcompass.co.uk/' + p + '/'));
}

// Checklist: 9 required sections
const ck = main(read('clinical-assessment-checklist/index.html'));
['1. Developmental history', '2. Prenatal alcohol exposure, where available', '3. Growth and physical examination', '4. Neurodevelopmental assessment domains',
 '5. Functional difficulties', '6. Co-occurring conditions', '7. Differential diagnoses', '8. Multidisciplinary assessment', '9. Referral and management planning']
  .forEach(s => ok('checklist section ' + s, ck.includes(s)));
ok('checklist: exposure not inferred from care history', ck.includes('Not inferred from lifestyle, other drug use, care history or exposure in a previous pregnancy alone'));
ok('checklist: confirmed / absent / unknown', ck.includes('confirmed, confirmed absent, or unknown'));
ok('checklist: 10 areas', ['Motor skills', 'Cognition', 'Language', 'Academic achievement', 'Memory', 'Attention', 'Affect regulation'].every(a => ck.includes(a)));
ok('checklist: genetics in line with local guidance', ck.includes('Genetic testing considered, in line with local genetics guidance'));
ok('checklist: genetic factors in all cases', ck.includes('Genetic factors, which should be considered in all cases'));
ok('no named genetic syndromes', !/22q|Noonan|Williams|Cornelia|fragile X/i.test(ck));
ok('checklist microcephaly below 3rd centile', ck.includes('Microcephaly is OFC below the 3rd centile'));

// Quick reference: 6 questions and key safety lines
const qr = main(read('clinical-quick-reference/index.html'));
['When to consider FASD', 'What information to gather', 'When to refer', 'What to assess', 'When the alcohol history is unavailable', 'Supporting a child while they wait']
  .forEach(s => ok('quick ref ' + s, qr.includes(s)));
ok('quick ref: QS204 S3 verbatim', qr.includes('Children and young people with probable prenatal alcohol exposure and significant physical, developmental or behavioural difficulties are referred for assessment.'));
ok('quick ref: unknown not absent', qr.includes('Record the exposure as unknown, not as absent'));
ok('quick ref: no guessing from care history', qr.includes('Do not guess about exposure from care history or social circumstances'));
ok('quick ref: looked-after is not evidence', qr.includes('Being in one of these groups is not evidence of exposure.'));
ok('quick ref microcephaly below 3rd centile', qr.includes('Microcephaly is OFC below the 3rd centile'));
ok('quick ref: needs-led support', qr.includes('Support should be based on needs, not on a diagnosis'));

// Learning: 6 modules
const lh = read('clinician-learning/index.html');
ok('learning has 6 modules', (lh.match(/<details class="mod"/g) || []).length === 6);
const lt = main(lh);
['Recognising possible FASD', 'Sensitive history taking', 'Diagnostic frameworks', 'FASD and co-occurring neurodevelopmental conditions', 'Communication with families', 'Coordinating support']
  .forEach(s => ok('module ' + s, lt.includes(s)));

// Downloads
const hub = read('clinical-toolkit/index.html');
['fasd-clinical-assessment-checklist', 'fasd-clinical-quick-reference'].forEach(f => {
  const p = 'assets/downloads/' + f + '.pdf';
  ok('pdf ' + f, exists(p) && fs.readFileSync(path.join(root, p)).slice(0, 5).toString() === '%PDF-');
});
['fasd-referral-letter-template', 'fasd-developmental-assessment-template', 'fasd-mdt-summary-template', 'fasd-family-feedback-letter-template', 'fasd-management-plan-template'].forEach(f => {
  const p = 'assets/downloads/' + f + '.docx';
  ok('docx ' + f, exists(p) && fs.readFileSync(path.join(root, p)).slice(0, 2).toString() === 'PK');
  ok('hub links ' + f, hub.includes('/assets/downloads/' + f + '.docx'));
});
ok('hub has templates anchor', hub.includes('id="templates"'));

// Clinicians page keeps existing content and links the toolkit
const cp = read('clinicians/index.html');
['NICE QS204: Key Standards for Clinical Practice', 'SIGN 156 Diagnostic Framework', 'SIGN 156 Screening Triggers', 'SIGN 156 Assessment Pathway', 'Official SIGN 156 Downloads', 'FASD Training for Clinicians']
  .forEach(s => ok('clinicians keeps ' + s, cp.includes(s)));
['/clinical-assessment-checklist/', '/clinical-quick-reference/', '/clinician-learning/', '/clinical-toolkit/#templates'].forEach(l => ok('clinicians links ' + l, cp.includes('href="' + l + '"')));
ok('toolkit section before QS204', cp.indexOf('FASD Clinical Toolkit</h2>') > 0 && cp.indexOf('FASD Clinical Toolkit</h2>') < cp.indexOf('NICE QS204: Key Standards'));

console.log(`clinical tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
