// Questionnaire tests: no scores, risk language or diagnostic claims in any output.
// Run: node tests/questionnaire.test.js   (no dependencies)
const fs = require('fs'), vm = require('vm'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
const quizSrc = src.slice(src.indexOf('// ─── DEVELOPMENTAL CONCERNS GUIDE'), src.indexOf('// ─── CHATBOT ───'));
const escSrc = src.match(/function escHTML[\s\S]*?\n}\n/)[0];
// Minimal DOM stub
function el(id) { return { id, style: {}, innerHTML: '', textContent: '', value: '', disabled: false, classList: { toggle() {}, add() {}, remove() {} },
  setAttribute() {}, appendChild() {}, addEventListener() {}, scrollIntoView() {}, querySelector() { return { textContent: '' }; } }; }
const els = {};
const document = { getElementById: id => (els[id] = els[id] || el(id)), createElement: () => el('x'), querySelectorAll: () => [], body: { classList: { add() {}, remove() {} }, appendChild() {} } };
let printed = '';
const ctx = { document, window: { print() { printed = els['print-area'] ? els['print-area'].innerHTML : ''; }, addEventListener() {}, removeEventListener() {} }, setTimeout: f => f(), console };
vm.createContext(ctx);
vm.runInContext(escSrc + quizSrc + ';this.api={initQuiz,selectOpt,quizNext,quizSummaryData,printQuizSummary,quizQuestions,get a(){return quizAnswers},set n(v){quizNotes=v}};', ctx);
const { api } = ctx;
const BANNED = [/\bscore[sd]?\b/i, /\d+\s*%/, /\brisk\b/i, /\blikely\b/i, /\bunlikely\b/i, /\bhigh\b/i, /\bmoderate\b/i, /\blow\b/i, /\bprobability\b/i, /\bconfirms? (?:fasd|diagnosis)/i, /\byour child has fasd\b/i, /🔴|🟠|🟢|🟡/];
const ALLOWED_PHRASES = [/It is not a score/, /does not give a score/, /does not measure how likely FASD is/, /not a validated FASD screening result/];
let pass = 0, fail = 0;
function check(name, html) {
  let t = html.replace(/<[^>]+>/g, ' ');
  ALLOWED_PHRASES.forEach(r => { t = t.replace(r, ''); });
  const hit = BANNED.filter(r => r.test(t));
  const needs = [/not a diagnosis or a validated FASD screening result/i, /cannot confirm or rule out FASD/i];
  const missing = needs.filter(r => !r.test(html.replace(/<[^>]+>/g, ' ')));
  if (hit.length || missing.length) { fail++; console.log('FAIL', name, hit.map(String), missing.map(String)); } else pass++;
}
function run(pae, areaIdx, label) {
  api.initQuiz();
  api.quizQuestions.forEach((q, i) => { api.selectOpt(i === 0 ? pae : Math.min(areaIdx, q.opts.length - 1)); api.quizNext(); });
  check(label + ' results', els['quiz-result'].innerHTML);
  api.printQuizSummary();
  const pr = printed;
  check(label + ' print', pr.replace('This is not a diagnosis or a validated screening result. It cannot confirm or rule out FASD.', 'not a diagnosis or a validated FASD screening result cannot confirm or rule out FASD'));
  if (/name of child|child’s name:/i.test(pr)) { fail++; console.log('FAIL', label, 'asks for child name'); }
  return api.quizSummaryData();
}
for (let p = 0; p < 5; p++) for (let a = 0; a < 4; a++) run(p, a, `pae${p}-area${a}`);
// Exposure must never be inferred: unknown answer is reported as unknown
const d = run(3, 0, 'unknown');
if (d.pae !== 'unknown') { fail++; console.log('FAIL unknown exposure mapped to', d.pae); } else pass++;
if (!/Unknown does not mean there was exposure/.test(els['quiz-result'].innerHTML)) { fail++; console.log('FAIL unknown wording'); } else pass++;
// Status mapping
const d2 = run(0, 3, 'unsure');
if (d2.areas.some(x => x.status !== 'unsure')) { fail++; console.log('FAIL unsure mapping'); } else pass++;
// Q1 options are exactly the approved five
const opts = api.quizQuestions[0].opts.map(o => o.t).join('|');
if (opts !== 'Confirmed prenatal alcohol exposure|Possible exposure, not confirmed|Reliable information indicating no alcohol exposure|Unknown or unavailable information|Prefer not to answer') { fail++; console.log('FAIL Q1 options', opts); } else pass++;
// Parent examples escaped
api.initQuiz();
api.n = api.quizQuestions.map(() => '<img src=x onerror=alert(1)>');
api.quizQuestions.forEach((q, i) => { api.selectOpt(0); api.quizNext(); });
if (/<img/.test(els['quiz-result'].innerHTML)) { fail++; console.log('FAIL XSS in examples'); } else pass++;
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
