// ─── NAVIGATION (multi-page) ───
const ROUTES = {"overview": "/", "parents": "/parents/", "teachers": "/teachers/", "clinicians": "/clinicians/", "children": "/for-children/", "podcast": "/podcast/", "quiz": "/screening-tool/", "chat": "/ask-fasd-ai/", "resources": "/resources/", "about": "/about/"};
function switchAudience(id) { window.location.href = ROUTES[id] || '/'; }
function switchNav(navItem, section) { window.location.href = ROUTES[section] || '/'; }

function toggleExpand(el) { el.classList.toggle('open'); }

// ─── PODCAST PLAYER (real audio) ───
const speeds = [1,1.25,1.5,2,0.75];
function formatTime(secs) {
  secs = Math.max(0, Math.floor(secs || 0));
  return `${Math.floor(secs/60)}:${(secs%60).toString().padStart(2,'0')}`;
}
function podAudio(id) { return document.getElementById('audio'+id); }
function podUpdate(id) {
  const a = podAudio(id); if (!a) return;
  const pct = a.duration ? (a.currentTime / a.duration) * 100 : 0;
  document.getElementById('p'+id+'-fill').style.width = pct + '%';
  document.getElementById('t'+id+'-current').textContent = formatTime(a.currentTime);
  const bar = document.getElementById('p'+id+'-fill').parentElement;
  if (bar) bar.setAttribute('aria-valuenow', Math.round(pct));
}
function podSetButton(id, playing) {
  const btn = document.getElementById('play'+id); if (!btn) return;
  btn.textContent = playing ? '⏸️' : '▶️';
  btn.setAttribute('aria-label', playing ? 'Pause episode' : 'Play episode');
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('audio[id^="audio"]').forEach(a => {
    const id = a.id.replace('audio','');
    a.addEventListener('timeupdate', () => podUpdate(id));
    a.addEventListener('play', () => podSetButton(id, true));
    a.addEventListener('pause', () => podSetButton(id, false));
    a.addEventListener('ended', () => podSetButton(id, false));
  });
});
function togglePlay(id) {
  const a = podAudio(id); if (!a) return;
  document.querySelectorAll('audio[id^="audio"]').forEach(o => { if (o !== a && !o.paused) o.pause(); });
  if (a.paused) { a.play().catch(() => podSetButton(id, false)); } else { a.pause(); }
}
function skipPodcast(id, secs) {
  const a = podAudio(id); if (!a) return;
  const max = a.duration || Infinity;
  a.currentTime = Math.max(0, Math.min(max, a.currentTime + secs));
  podUpdate(id);
}
function seekPodcast(id, e, bar) {
  const a = podAudio(id); if (!a) return;
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const go = () => { a.currentTime = pct * a.duration; podUpdate(id); };
  if (a.duration) go(); else { a.addEventListener('loadedmetadata', go, { once: true }); a.load(); }
}
function cycleSpeed(id) {
  const a = podAudio(id); if (!a) return;
  const next = speeds[(speeds.indexOf(a.playbackRate) + 1) % speeds.length] || 1;
  a.playbackRate = next;
  document.getElementById('speed'+id).textContent = next + '×';
}

// ─── DEVELOPMENTAL CONCERNS GUIDE (formerly the screening quiz) ───
// Not a validated screening tool. No scores, weights, thresholds or risk levels.
// Each area is reported as: concern reported / no concern reported / not sure.
// Nothing is stored or sent. The summary is printed or saved as PDF in the browser.
const PAE_OPTS = [
  { t: 'Confirmed prenatal alcohol exposure', k: 'confirmed' },
  { t: 'Possible exposure, not confirmed', k: 'possible' },
  { t: 'Reliable information indicating no alcohol exposure', k: 'none' },
  { t: 'Unknown or unavailable information', k: 'unknown' },
  { t: 'Prefer not to answer', k: 'declined' }
];
const AREA_OPTS = [
  { t: 'Yes, often', s: 'concern' },
  { t: 'Sometimes', s: 'concern' },
  { t: 'No, not usually', s: 'none' },
  { t: 'Not sure', s: 'unsure' }
];
const quizQuestions = [
  { num: 1, domain: 'Pregnancy information', pae: true,
    text: 'Do you have any information about alcohol use during the pregnancy?',
    sub: 'Many families do not know. Choose the answer that fits what you know. There is no right or wrong answer.', opts: PAE_OPTS },
  { num: 2, domain: 'Memory and learning', text: 'Does your child find it hard to remember instructions or things they have recently learned?',
    sub: 'For example, forgetting a rule they were told a few minutes ago.', tip: 'Give one instruction at a time, and use pictures or a checklist.', link: ['/everyday-solutions/', 'Everyday Parenting Solutions'] },
  { num: 3, domain: 'Impulse control and behaviour', text: 'Does your child often act before thinking, or find it hard to learn from what happened last time?',
    tip: 'Keep routines predictable, plan ahead for tricky situations, and expect to supervise more than for other children of the same age.', link: ['/everyday-solutions/', 'Everyday Parenting Solutions'] },
  { num: 4, domain: 'Attention', text: 'Compared with children of the same age, does your child find it hard to concentrate, even on things they enjoy?',
    tip: 'Break tasks into short chunks with movement breaks in between.', link: ['/everyday-solutions/', 'Everyday Parenting Solutions'] },
  { num: 5, domain: 'Language and communication', text: 'Does your child have difficulties with language or with understanding what is said to them?',
    sub: 'For example, seeming to understand but not following through, or taking things very literally.', tip: 'Use short sentences, add visuals, and ask your child to show you what to do rather than asking if they understand.', link: ['/everyday-solutions/', 'Everyday Parenting Solutions'] },
  { num: 6, domain: 'Social skills', text: 'Does your child find friendships or social situations hard?',
    sub: 'For example, being overly friendly with strangers or missing social cues.', tip: 'Practise social situations in advance and explain unwritten rules simply.', link: ['/everyday-solutions/', 'Everyday Parenting Solutions'] },
  { num: 7, domain: 'Emotions and regulation', text: 'Does your child have big emotional reactions or meltdowns that are hard to recover from?',
    tip: 'Notice early signs, reduce demands and stay calm. Look for patterns over several weeks, as causes can differ each time.', link: ['/regulation-toolkit/', 'Meltdowns and Big Feelings'] },
  { num: 8, domain: 'Movement and coordination', text: 'Does your child have difficulties with coordination, handwriting, cutting or sport?',
    tip: 'Allow extra time, and ask school about alternatives to a lot of handwriting.', link: ['/school-toolkit/', 'School Advocacy Toolkit'] },
  { num: 9, domain: 'School and daily living', text: 'Is your child finding school work, or everyday skills such as dressing and getting organised, harder than expected for their age?',
    tip: 'Ask the school SENCO about SEN support. A diagnosis is not needed for support.', link: ['/school-toolkit/', 'School Advocacy Toolkit'] },
  { num: 10, domain: 'Growth and physical features', text: 'Has a health professional mentioned concerns about your child’s growth, head size or facial features?',
    sub: 'Only some children with FASD have the facial features linked with alcohol exposure.',
    opts: [{ t: 'Yes, this has been mentioned', s: 'concern' }, { t: 'No', s: 'none' }, { t: 'Not sure', s: 'unsure' }],
    tip: 'Ask your GP or health visitor to check and record growth and head size.', link: ['/gp-checklist/', 'Before You See the GP checklist'] }
];
quizQuestions.forEach(q => { if (!q.opts) q.opts = AREA_OPTS; });

let quizAnswers = [];
let quizNotes = [];
let currentQ = 0;

function initQuiz() {
  quizAnswers = new Array(quizQuestions.length).fill(null);
  quizNotes = new Array(quizQuestions.length).fill('');
  currentQ = 0;
  document.getElementById('quiz-body').style.display = 'block';
  document.getElementById('quiz-result').style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  const q = quizQuestions[currentQ];
  const pct = (currentQ / quizQuestions.length) * 100;
  document.getElementById('quizProgressFill').style.width = pct + '%';
  document.getElementById('quizStepLabel').textContent = `Question ${currentQ + 1} of ${quizQuestions.length}`;
  document.getElementById('qNum').textContent = `QUESTION ${q.num} OF ${quizQuestions.length} · ${q.domain.toUpperCase()}`;
  document.getElementById('qText').textContent = q.text;
  document.getElementById('qSub').textContent = q.sub || '';
  document.getElementById('qSub').style.display = q.sub ? 'block' : 'none';
  const optEl = document.getElementById('qOptions');
  optEl.innerHTML = '';
  optEl.setAttribute('role', 'group');
  optEl.setAttribute('aria-label', q.text);
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-opt' + (quizAnswers[currentQ] === i ? ' selected' : '');
    btn.setAttribute('aria-pressed', quizAnswers[currentQ] === i ? 'true' : 'false');
    btn.innerHTML = `<span class="opt-check" aria-hidden="true">${quizAnswers[currentQ] === i ? '✓' : ''}</span><span>${escHTML(opt.t)}</span>`;
    btn.onclick = () => selectOpt(i);
    optEl.appendChild(btn);
  });
  let note = document.getElementById('qNoteWrap');
  if (!note) {
    note = document.createElement('div'); note.id = 'qNoteWrap'; note.className = 'quiz-note';
    note.innerHTML = '<label for="qNote">Add an example (optional)</label><textarea id="qNote" rows="2" placeholder="For example, what happens and how often. Please do not include names."></textarea>';
    document.getElementById('quizCard').appendChild(note);
    document.getElementById('qNote').addEventListener('input', e => { quizNotes[currentQ] = e.target.value; });
  }
  note.style.display = q.pae ? 'none' : 'block';
  document.getElementById('qNote').value = quizNotes[currentQ] || '';
  document.getElementById('quizNext').disabled = quizAnswers[currentQ] === null;
  document.getElementById('quizNext').textContent = currentQ === quizQuestions.length - 1 ? 'See summary →' : 'Next →';
  document.getElementById('quizBack').style.visibility = currentQ === 0 ? 'hidden' : 'visible';
}

function selectOpt(i) {
  quizAnswers[currentQ] = i;
  document.querySelectorAll('.quiz-opt').forEach((b, idx) => {
    b.classList.toggle('selected', idx === i);
    b.setAttribute('aria-pressed', idx === i ? 'true' : 'false');
    b.querySelector('.opt-check').textContent = idx === i ? '✓' : '';
  });
  document.getElementById('quizNext').disabled = false;
}

function quizNext() {
  if (quizAnswers[currentQ] === null) return;
  if (currentQ < quizQuestions.length - 1) { currentQ++; renderQuestion(); }
  else { showQuizResults(); return; }
  focusQuestion();
}
function focusQuestion() {
  const t = document.getElementById('qText'); if (!t) return;
  t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
  const card = document.getElementById('quizCard'); if (card) card.scrollIntoView({ block: 'nearest' });
}

function quizBack() { if (currentQ > 0) { currentQ--; renderQuestion(); focusQuestion(); } }

const STATUS_LABEL = { concern: 'Concern reported', none: 'No concern reported', unsure: 'Not sure or insufficient information' };
const PAE_TEXT = {
  confirmed: 'You told us there was confirmed alcohol exposure in pregnancy. Please tell the professional you see. NICE Quality Standard QS204 says children with probable prenatal alcohol exposure and significant difficulties should be referred for assessment.',
  possible: 'You told us alcohol exposure in pregnancy is possible but not confirmed. Tell the professional what you know and where the information comes from. Records held by a GP, midwife or social worker may help.',
  none: 'You told us there is reliable information that there was no alcohol exposure. The difficulties you have described still matter and deserve attention, as they can have many causes.',
  unknown: 'You told us information about alcohol in the pregnancy is unknown or unavailable. This is common, particularly for adopted, fostered and kinship children. Unknown does not mean there was exposure, and it does not mean there was none. Your child’s needs can still be assessed.',
  declined: 'You chose not to answer the question about pregnancy. That is fine. You can decide later what to share with a professional.'
};

function quizSummaryData() {
  const pae = PAE_OPTS[quizAnswers[0]] ? PAE_OPTS[quizAnswers[0]].k : 'declined';
  const areas = quizQuestions.slice(1).map((q, idx) => {
    const i = idx + 1, opt = q.opts[quizAnswers[i]];
    return { q, domain: q.domain, answer: opt ? opt.t : 'Not answered', status: opt ? opt.s : 'unsure', note: (quizNotes[i] || '').trim() };
  });
  return { pae, areas, concerns: areas.filter(a => a.status === 'concern'), unsure: areas.filter(a => a.status === 'unsure') };
}

function showQuizResults() {
  const d = quizSummaryData();
  document.getElementById('quiz-body').style.display = 'none';
  const resultEl = document.getElementById('quiz-result');
  resultEl.style.display = 'block';
  const icon = { concern: '●', none: '○', unsure: '?' };
  const rows = d.areas.map(a => `<li class="cs-row cs-${a.status}"><span class="cs-ico" aria-hidden="true">${icon[a.status]}</span><span class="cs-area">${escHTML(a.domain)}</span><span class="cs-status">${STATUS_LABEL[a.status]}</span>${a.note ? `<span class="cs-note">Your example: ${escHTML(a.note)}</span>` : ''}</li>`).join('');
  let meaning;
  if (d.concerns.length) {
    meaning = `<p>You reported concerns in <strong>${d.concerns.length} of ${d.areas.length}</strong> areas. This is a record of what you have noticed. It is not a score, and it does not measure how likely FASD is.</p><p>Difficulties like these can have many causes. These include FASD, ADHD, autism, language disorder, learning difficulties, hearing or vision problems, sleep problems and the effects of early experiences. Some children have more than one. Only a professional assessment can find out what is behind them.</p>`;
  } else {
    meaning = `<p>You did not report concerns in these areas. This does not rule out FASD or any other condition. Needs can change as children grow.</p><p>If you are still worried, trust your instincts and talk to your GP, health visitor or school.</p>`;
  }
  if (d.unsure.length) meaning += `<p>You were not sure about ${d.unsure.length} area${d.unsure.length > 1 ? 's' : ''}. It can help to ask school or nursery what they notice.</p>`;
  const tips = d.concerns.map(a => `<li><strong>${escHTML(a.domain)}:</strong> ${escHTML(a.q.tip)} <a href="${a.q.link[0]}">${escHTML(a.q.link[1])}</a></li>`).join('');
  resultEl.innerHTML = `
    <div class="cs-wrap">
      <div class="cs-notice" role="note"><strong>This is not a diagnosis or a validated FASD screening result.</strong> It cannot confirm or rule out FASD. It is a summary of what you have noticed, to help you talk to a professional.</div>
      <h2 class="cs-title">Your Child’s Developmental Concerns Summary</h2>
      <h3 class="cs-h">Areas you told us about</h3>
      <ul class="cs-list">${rows}</ul>
      <h3 class="cs-h">What your answers mean</h3>
      ${meaning}
      <h3 class="cs-h">Pregnancy information</h3>
      <p>${PAE_TEXT[d.pae]}</p>
      <h3 class="cs-h">Talking to a professional</h3>
      <p>${d.concerns.length ? 'Because you have noticed difficulties, it would be reasonable to talk to your GP or health visitor. They can decide whether a referral to a paediatrician or neurodevelopmental team is needed.' : 'If concerns come up later, your GP or health visitor is a good place to start.'} Take the summary below with you.</p>
      <ul class="bullet-list"><li><a href="/gp-checklist/">Before You See the GP</a>: a checklist of what to bring</li><li><a href="/journey-tracker/">Your FASD Journey Tracker</a>: what happens at each step</li><li><a href="/template-letters/#letter-gp">Template letter for your GP</a></li></ul>
      ${tips ? `<h3 class="cs-h">Things you can try now</h3><ul class="bullet-list">${tips}</ul>` : ''}
      <h3 class="cs-h">Support at school</h3>
      <p>Your child does not need a diagnosis to get support at school. Support should be based on their needs. Talk to the class teacher or SENCO, and use the <a href="/school-toolkit/">School Advocacy Toolkit</a>.</p>
      <h3 class="cs-h" id="csSummaryH">Summary for your GP or paediatrician</h3>
      <p>Download a one-page summary to take to an appointment. You can add a few optional details first. Please do not include your child’s name or anything that could identify them.</p>
      <div class="cs-extras">
        <div class="cs-field"><label for="csWho">Completed by (optional)</label><select id="csWho"><option value="">Parent or carer</option><option>Birth parent</option><option>Adoptive parent</option><option>Foster carer</option><option>Kinship carer or special guardian</option><option>Other carer</option></select></div>
        <div class="cs-field"><label for="csAge">Child’s age range (optional)</label><select id="csAge"><option value="">Not given</option><option>Under 2</option><option>2 to 4</option><option>5 to 11</option><option>12 to 17</option><option>18 or over</option></select></div>
        <div class="cs-field cs-wide"><label for="csStrengths">What your child is good at or enjoys (optional)</label><textarea id="csStrengths" rows="2" maxlength="400"></textarea></div>
        <div class="cs-field cs-wide"><label for="csNotes">Anything else you want the professional to know (optional)</label><textarea id="csNotes" rows="2" maxlength="400"></textarea></div>
      </div>
      <div class="cs-actions">
        <button type="button" class="quiz-btn primary" onclick="downloadQuizPDF()">⬇️ Download summary (PDF)</button>
        <button type="button" class="quiz-btn secondary" onclick="printQuizSummary()">🖨️ Print summary</button>
      </div>
      <p class="cs-small" id="csMsg" role="status" aria-live="polite"></p>
      <div class="cs-actions"><button type="button" class="quiz-btn secondary" onclick="initQuiz()">Start again</button></div>
      <p class="cs-small">Nothing you entered is saved or sent anywhere. It is cleared when you leave this page. If you need help urgently, see <a href="/urgent-help/">urgent help</a>.</p>
    </div>`;
  const h = resultEl.querySelector('.cs-title'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  resultEl.scrollIntoView({ block: 'start' });
}

const SUMMARY_DISCLAIMER = 'This is not a diagnosis or a validated screening result. It cannot confirm or rule out FASD. It records what a parent or carer has noticed, to support a conversation with a professional.';
const PAE_LINE = { confirmed: 'Confirmed prenatal alcohol exposure', possible: 'Possible exposure, not confirmed', none: 'Reliable information indicating no alcohol exposure', unknown: 'Unknown or unavailable information', declined: 'Not shared' };

function summaryExtras() {
  const v = id => { const el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
  return { completedBy: v('csWho'), ageRange: v('csAge'), strengths: redactSummary(v('csStrengths')), notes: redactSummary(v('csNotes')) };
}
function redactSummary(t) { return (typeof redactPII === 'function' && t) ? redactPII(t).text : t; }

function clinicianSummary() {
  const d = quizSummaryData(), x = summaryExtras();
  const qs = [
    'Could these difficulties be assessed by a paediatrician or neurodevelopmental team?',
    'What could explain these difficulties, and should other causes such as hearing, vision or sleep be checked?'
  ];
  if (d.pae === 'confirmed' || d.pae === 'possible') qs.push('Can the information about alcohol in the pregnancy be recorded in my child’s notes, and should FASD be considered?');
  qs.push('What support can we get while we wait?', 'Could you share information with my child’s school or nursery?');
  return {
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    completedBy: x.completedBy || 'Parent or carer', ageRange: x.ageRange, strengths: x.strengths, notes: x.notes,
    disclaimer: SUMMARY_DISCLAIMER,
    areas: d.areas.map(a => ({ domain: a.domain, status: STATUS_LABEL[a.status], note: redactSummary(a.note), concern: a.status === 'concern' })),
    pae: PAE_LINE[d.pae],
    concerns: d.concerns.length ? d.concerns.map(a => a.domain).join(', ') : 'None reported in these areas, but the parent or carer would like to talk about their child’s development.',
    questions: qs,
    footer: 'From fasdcompass.co.uk, the FASD Developmental Concerns and Assessment Guide. Educational information only. Clinical lead: Dr Inyang Takon, Consultant Neurodevelopmental Paediatrician.'
  };
}

function downloadQuizPDF() {
  const s = clinicianSummary();
  if (!window.FASDSummaryPDF) { printQuizSummary(); return; }
  const iso = new Date().toISOString().slice(0, 10);
  window.FASDSummaryPDF.download(s, `developmental-concerns-summary-${iso}.pdf`);
  const m = document.getElementById('csMsg'); if (m) m.textContent = 'Your PDF has been downloaded. It is saved only on this device.';
}

function printQuizSummary() {
  const s = clinicianSummary();
  const rows = s.areas.map(a => `<tr><td>${escHTML(a.domain)}</td><td>${a.concern ? '<strong>' + a.status + '</strong>' : a.status}</td><td>${escHTML(a.note)}</td></tr>`).join('');
  let area = document.getElementById('print-area');
  if (!area) { area = document.createElement('div'); area.id = 'print-area'; document.body.appendChild(area); }
  area.innerHTML = `<div class="plan-doc cs-print">
    <div class="plan-head"><div class="plan-eyebrow">FASD Compass · Developmental concerns summary</div><h2>Developmental concerns to discuss</h2></div>
    <p><strong>Date completed:</strong> ${s.date} &nbsp; <strong>Completed by:</strong> ${escHTML(s.completedBy)}${s.ageRange ? ` &nbsp; <strong>Child’s age range:</strong> ${escHTML(s.ageRange)}` : ''}</p>
    <p class="cs-print-notice">${s.disclaimer}</p>
    <table class="tracker-table"><thead><tr><th>Area</th><th>What was reported</th><th>Parent or carer example</th></tr></thead><tbody>${rows}</tbody></table>
    <p><strong>Information about alcohol in pregnancy:</strong> ${s.pae}</p>
    <p><strong>Concerns to discuss:</strong> ${escHTML(s.concerns)}</p>
    ${s.strengths ? `<p><strong>Strengths and interests:</strong> ${escHTML(s.strengths)}</p>` : ''}
    ${s.notes ? `<p><strong>Other notes:</strong> ${escHTML(s.notes)}</p>` : ''}
    <p><strong>Questions for the clinician</strong></p><ul>${s.questions.map(q => `<li>${escHTML(q)}</li>`).join('')}</ul>
    <p class="plan-foot">${s.footer}</p>
  </div>`;
  document.body.classList.add('printing-one');
  const done = () => { document.body.classList.remove('printing-one'); area.innerHTML = ''; window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => { window.print(); setTimeout(done, 1500); }, 50);
}

// ─── CHATBOT ───
// (Unused SYSTEM_PROMPT removed in v1.2.3. The assistant uses the pre-written answers below.)

// ─── FASD COMPASS AI (rules-based, works offline) ───
// The knowledge base and safety checks live in assets/ai-kb.js and assets/ai-engine.js,
// which load only on the Ask FASD AI page. assets/ai-live.js adds the optional live AI
// layer, which is switched off.
function escHTML(t) {
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

let chatLoading = false;
let chatAudience = 'parent'; // not saved anywhere

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 90)+'px';
}

function setAudience(btn) {
  chatAudience = btn.getAttribute('data-aud');
  document.querySelectorAll('.ask-aud-btn').forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
  renderSuggestions();
  const note = document.getElementById('audNote');
  if (note) note.textContent = 'Answers and example questions are now set for ' + btn.textContent.trim().toLowerCase() + '.';
}

function renderSuggestions() {
  const box = document.getElementById('chatSuggestions');
  if (!box || !window.FASDAI) return;
  box.innerHTML = '';
  (window.FASDAI.SUGGESTIONS[chatAudience] || []).forEach(q => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chat-sug'; b.textContent = q;
    b.addEventListener('click', () => sendSuggestion(b));
    box.appendChild(b);
  });
}

function sendSuggestion(el) {
  document.getElementById('chatInput').value = el.textContent;
  sendMessage();
}

function sendMessage() {
  if(chatLoading || !window.FASDAI) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;

  input.value='';
  input.style.height='auto';
  chatLoading=true;

  appendMsg('user', window.FASDAI.redactPII(text).text);
  showTyping();

  // Brief pause so the reply does not appear before the question
  setTimeout(() => {
    removeTyping();
    const reply = window.FASDAI.respondFull(text, chatAudience);
    const bubble = appendMsg('bot', reply.text);
    if (reply.options) appendOptions(bubble, reply.options);
    if (window.FASDLive) window.FASDLive.offer(bubble, reply, chatAudience);
    chatLoading=false;
  }, 500 + Math.random()*300);
}

function appendOptions(bubble, options) {
  const wrap = document.createElement('div');
  wrap.className = 'chat-options';
  options.forEach(q => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chat-sug'; b.textContent = q;
    b.addEventListener('click', () => sendSuggestion(b));
    wrap.appendChild(b);
  });
  bubble.appendChild(wrap);
}

function formatBotHTML(text) {
  // Text is escaped first. Only bold and known safe addresses become HTML.
  return escHTML(text)
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n/g,'<br>')
    .replace(/\bfasdcompass\.co\.uk\/([a-z0-9-]+)\/?/g, '<a href="/$1/">fasdcompass.co.uk/$1/</a>')
    .replace(/\bgov\.uk\/report-child-abuse-to-local-council\b/g, '<a href="https://www.gov.uk/report-child-abuse-to-local-council" target="_blank" rel="noopener">gov.uk/report-child-abuse-to-local-council</a>')
    .replace(/\bhelp@nspcc\.org\.uk\b/g, '<a href="mailto:help@nspcc.org.uk">help@nspcc.org.uk</a>')
    .replace(/\bnationalfasd\.org\.uk\b/g, '<a href="https://nationalfasd.org.uk/" target="_blank" rel="noopener">nationalfasd.org.uk</a>');
}

function appendMsg(role, text, label) {
  const msgs = document.getElementById('chatMessages');
  const isUser = role==='user';
  const div = document.createElement('div');
  div.className = 'msg'+(isUser?' user':'');
  const now = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  const html = isUser ? escHTML(text).replace(/\n/g,'<br>') : formatBotHTML(text);
  div.innerHTML = `
    <div class="msg-avatar">${isUser?'👤':'🤖'}</div>
    <div>
      ${label ? `<div class="msg-label">${escHTML(label)}</div>` : ''}
      <div class="msg-bubble">${html}</div>
      <div class="msg-time">${now}</div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div.querySelector('.msg-bubble');
}

function showTyping() {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className='msg';div.id='typingIndicator';
  div.innerHTML=`<div class="msg-avatar">🤖</div><div class="msg-bubble" style="padding:8px 14px;"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if(t) t.remove();
}

// Init quiz on first load in case user lands there
// ─── Hash-based deep linking (for manifest shortcuts) ───
function handleHashRoute() {
  const hash = window.location.hash.replace('#','');
  if (hash && ROUTES[hash] && ROUTES[hash] !== window.location.pathname) {
    window.location.replace(ROUTES[hash]);
  }
}
window.addEventListener('hashchange', handleHashRoute);

document.addEventListener('DOMContentLoaded', () => { handleHashRoute(); if (document.getElementById('quiz-body')) initQuiz(); if (document.getElementById('chatSuggestions')) renderSuggestions(); });

// ─── Service Worker Registration ───
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('FASD Compass SW registered:', reg.scope);
        // Check for updates every 60 seconds
        setInterval(() => reg.update(), 60000);
      })
      .catch(err => console.warn('SW registration failed:', err));
  });
}



// ─── Install prompt banner ───
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const banner = document.getElementById('installBanner');
  if(banner) banner.style.display = 'flex';
});
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('installBtn');
  if(btn) btn.addEventListener('click', async () => {
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('installBanner').style.display = 'none';
  });
  document.getElementById('installDismiss')?.addEventListener('click', () => {
    document.getElementById('installBanner').style.display = 'none';
  });
});

// Keep the current section tab visible in the scrolling tab bar
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('audienceBar');
  const act = bar && bar.querySelector('.aud-btn.active');
  if (act) bar.scrollLeft = act.offsetLeft - (bar.clientWidth - act.offsetWidth) / 2;
});
