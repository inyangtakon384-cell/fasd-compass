// Phase 4 school toolkit tests: content, disclaimers, privacy and links.
// Run: node tests/schools.test.js   (no dependencies)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const exists = p => fs.existsSync(path.join(root, p));
let pass = 0, fail = 0;
function ok(name, cond, extra) { if (cond) pass++; else { fail++; console.log('FAIL', name, extra || ''); } }
const strip = h => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const main = h => strip(h.slice(h.indexOf('<main'), h.indexOf('</main>')));

const PAGES = ['school-support-toolkit', 'classroom-support-plan', 'behaviour-guide', 'school-pathways'];
const BANNED = [/\bconfirms? (that )?(the (child|pupil) has )?FASD\b/i, /\brules? out FASD\b(?! or)/i, /\bdiagnostic of FASD\b(?!\.)/i,
  /\bsigns? of FASD\b(?! on its own)/i, /\bthis (child|pupil) (has|probably has|likely has) FASD\b/i, /\bscore\b/i, /\beligib/i,
  /\bmother (drank|was drinking)\b/i, /\bin care\b.*\bFASD\b.*\blikely\b/i];

for (const p of PAGES) {
  ok(p + ' exists', exists(p + '/index.html'));
  const h = read(p + '/index.html'), t = main(h), tb = t.replace(/does not (identify, confirm or )?(diagnose or )?rule out FASD/g, '').replace(/No behaviour is diagnostic of FASD/g, '');
  ok(p + ' version 1.2.11 assets', h.includes('v=1.2.11') && !/v=1\.2\.([0-9])\b/.test(h));
  ok(p + ' footer links toolkit', h.includes('<li><a href="/school-support-toolkit/">School Support Toolkit</a></li>'));
  ok(p + ' teachers tab active', h.includes('<a class="aud-btn active" href="/teachers/">Teachers</a>'));
  ok(p + ' canonical', h.includes('https://fasdcompass.co.uk/' + p + '/'));
  ok(p + ' byline', t.includes('Dr Inyang Takon, Consultant Neurodevelopmental Paediatrician'));
  ok(p + ' no em dash in new prose', !/\u2014/.test(t), (t.match(/.{30}\u2014.{30}/) || [''])[0]);
  ok(p + ' no semicolons in new prose', !/;/.test(t.replace(/&[a-z]+;|&#\d+;/g, '')), (t.match(/.{30};.{30}/) || [''])[0]);
  for (const b of BANNED) ok(p + ' avoids ' + b, !b.test(tb), (tb.match(new RegExp('.{0,40}' + b.source + '.{0,40}', 'i')) || [''])[0]);
  ok(p + ' no external scripts', !/<script[^>]+src="https?:/i.test(h));
  ok(p + ' no Works offline claim', !/works offline/i.test(h));
  ok(p + ' in sitemap', read('sitemap.xml').includes('https://fasdcompass.co.uk/' + p + '/'));
}

// 4.1 generator: ten areas, no identifiable info required
const csp = read('classroom-support-plan/index.html'), cspT = main(csp);
['1. Strengths', '2. Learning and memory', '3. Processing and communication', '4. Sensory environment', '5. Attention',
 '6. Emotional regulation', '7. Transitions', '8. Assessment adjustments', '9. Home-school communication', '10. Review arrangements']
  .forEach(d => ok('csp has ' + d, cspT.includes(d)));
ok('csp no required fields', !/\brequired\b/.test(csp.slice(csp.indexOf('id="csp-form"'), csp.indexOf('</form>'))));
ok('csp no date of birth field', !/name="(dob|birth|surname|fullname|nhs)/i.test(csp));
ok('csp initials only', /name="initials"[^>]*maxlength="6"/.test(csp));
ok('csp privacy note', cspT.includes('No identifiable information is needed'));
ok('csp not diagnostic', cspT.includes('does not diagnose or rule out FASD'));
ok('csp loads exports', ['tools.js', 'summary-pdf.js', 'docx-lite.js', 'school.js'].every(s => csp.includes('/assets/' + s + '?v=1.2.11')));
ok('csp needs extra time wording', cspT.includes('Needs extra time to process and answer'));
const js = read('assets/school.js');
ok('school.js no network', !/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\.sendBeacon/.test(js));
ok('school.js plan notice', js.includes('does not diagnose or rule out FASD'));
ok('school.js all ten headings', ['1. Strengths', "'Learning and memory'", "'Transitions'", '8. Assessment adjustments', '9. Home-school communication', '10. Review arrangements'].every(s => js.includes(s)));
ok('school.js local storage key', js.includes("'fasdc-classroom-plan'"));
ok('tools.js exposes export', read('assets/tools.js').includes('window.fasdWireExport = wireExport'));

// 4.3 behaviour guide: five parts per difficulty, caution on every card
const bg = read('behaviour-guide/index.html');
const cards = bg.split('<article class="bg-card"').slice(1);
ok('bg has at least 12 difficulties', cards.length >= 12, cards.length);
const PARTS = ['Possible underlying needs', 'Supportive teaching approaches', 'Environmental adjustments', 'Communication strategies', 'When more assessment may be needed'];
cards.forEach((c, i) => {
  PARTS.forEach(p => ok('bg card ' + i + ' has ' + p, c.includes(p)));
  ok('bg card ' + i + ' caution', c.includes('is not a sign of FASD on its own'));
});
ok('bg no-diagnosis banner', main(bg).includes('No behaviour is diagnostic of FASD'));
ok('bg other causes listed', /ADHD, autism, anxiety, trauma/.test(main(bg)));
ok('bg no inference from care history', main(bg).includes('Never guess about alcohol exposure in pregnancy'));
ok('bg safeguarding route', main(bg).includes('Follow your school’s safeguarding or child protection procedures'));

// 4.4 pathways: four nations, SEN vs safeguarding, needs-led
const sp = read('school-pathways/index.html'), spT = main(sp);
['np-eng', 'np-sco', 'np-wal', 'np-nir'].forEach(id => ok('pathways panel ' + id, sp.includes('id="' + id + '"')));
['designated safeguarding lead', 'designated safeguarding person', 'child protection coordinator', 'designated teacher for child protection'].forEach(r => ok('pathways role ' + r, spT.includes(r)));
['SENCO', 'ALNCo', 'Individual Development Plan', 'named person', 'Coordinated support plan', 'EHC'].forEach(r => ok('pathways term ' + r, spT.includes(r)));
ok('pathways needs-led', spT.includes('You do not need a diagnosis to give support'));
ok('pathways SEN vs safeguarding table', sp.includes('aria-label="SEN support compared with safeguarding"'));
ok('pathways possible FASD not safeguarding', spT.includes('Possible FASD on its own is not a safeguarding concern'));
ok('pathways QS204 verbatim', spT.includes('probable prenatal alcohol exposure and significant physical, developmental or behavioural difficulties are referred for assessment'));
ok('pathways white paper caveat', spT.includes('not in place yet'));

// 4.2 downloads
['pupil-profile', 'reasonable-adjustments-checklist', 'visual-timetable-template', 'transition-planning-template', 'home-school-communication-sheet', 'support-plan-review-form']
  .forEach(f => { const p = 'assets/downloads/' + f + '.pdf'; ok('download ' + f, exists(p) && fs.readFileSync(path.join(root, p)).slice(0, 5).toString() === '%PDF-'); ok('hub links ' + f, read('school-support-toolkit/index.html').includes('/assets/downloads/' + f + '.pdf')); });

// Teachers page keeps existing content and fixes step 3
const tp = read('teachers/index.html'), tpT = main(tp);
['Classroom Strategies', 'Environment & Seating', 'Instructions & Communication', 'Routines & Transitions', 'Assessment & Workload', 'Behaviour & Regulation', 'If You Are Concerned: Steps for Schools', 'Free Resources for Schools']
  .forEach(s => ok('teachers keeps ' + s, tp.includes(s)));
ok('teachers links toolkit', tp.includes('href="/school-support-toolkit/"'));
ok('teachers step 3 no safeguarding route for health referral', !tp.includes('raise concerns via the school\'s safeguarding lead to ensure a health referral'));
ok('teachers step 3 QS204 wording', tpT.includes('are referred for assessment'));
ok('school-toolkit links teacher toolkit', read('school-toolkit/index.html').includes('/school-support-toolkit/'));

console.log(`schools tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
