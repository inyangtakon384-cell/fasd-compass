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

// ─── SELF-CONTAINED FAQ CHATBOT (no API key needed) ───
// Comprehensive knowledge base drawn from SIGN 156 and NICE QS204

const FAQ_KB = [
  {
    tags:["toddler","toddlers","baby","babies","preschool","nursery","early signs","signs in","young child","under 5","under five"],
    answer:"**Possible signs in babies and young children**\n\nSigns of FASD in young children are often not specific, and many have other causes. Families and professionals sometimes notice:\n\n• feeding or sleeping difficulties, and being very unsettled\n• slow growth, or a small head size\n• delays in talking, walking or other milestones\n• being very active, easily overwhelmed or hard to settle\n• difficulty following simple routines as they get older\n\nNone of these on its own means a child has FASD. If you are worried about your child's development, talk to your health visitor or GP, and tell them anything you know about alcohol in the pregnancy. Our Age-Based Support Pathways page has ideas for ages 0 to 5."
  },
  {
    tags:["forget","forgets","forgetting","forgot","remember","memory","instructions","told them","told him","told her"],
    answer:"**Why might a child forget instructions?**\n\nMany children with FASD, and children with other conditions such as ADHD or language difficulties, find it hard to hold several steps in their head. They may understand an instruction when they hear it and lose it a minute later. This is not laziness or defiance.\n\n• **Give one step at a time,** and wait until it is done before giving the next.\n• **Show as well as tell.** Use pictures, checklists or a demonstration.\n• **Ask them to show you** what to do, rather than asking \"Do you understand?\"\n• **Keep routines the same** so they rely less on memory.\n\nForgetting can have several causes. If it is affecting school or daily life, talk to the school SENCO or your GP. Our Everyday Parenting Solutions page has more ideas."
  },
  {
    tags:["support from school","ask the school","request from school","ask school","sen support","school support","ehcp","ehc plan","senco","reasonable adjustment","without a diagnosis"],
    answer:"**What support can I ask the school for?**\n\nYour child does not need a diagnosis to get support at school. Support should be based on their needs.\n\n• **SEN support:** ask the SENCO whether your child should be recorded as needing SEN support, with a plan that is reviewed regularly.\n• **Reasonable adjustments:** for example, instructions broken into steps, visual timetables, a named adult and a quiet space.\n• **Advice from other professionals:** such as an educational psychologist or speech and language therapist.\n• **An EHC needs assessment (England):** if SEN support is not enough, you can ask the local authority yourself.\n\nWales, Scotland and Northern Ireland have different systems. Our School Advocacy Toolkit and Template Letters pages can help you prepare."
  },
  {
    tags:["don't know if","do not know if","unknown exposure","exposure is unknown","no records","no information about the pregnancy","not sure if she drank","not sure if the birth mother","don't know whether","birth mother drank","birth history"],
    answer:"**When alcohol exposure in pregnancy is unknown**\n\nMany families, including adoptive, foster and kinship families, do not know whether a child was exposed to alcohol before birth. Unknown does not mean there was exposure, and it does not mean there was none.\n\n• **Your child can still be assessed** for their developmental needs, and support should be based on those needs.\n• **For an FASD diagnosis,** SIGN 156 usually needs confirmed alcohol exposure. The exception is when all three sentinel facial features are present.\n• **Ask for records.** A social worker or adoption agency may hold birth, medical or court records that mention alcohol.\n• **Tell the GP or paediatrician what you know and what you don't know.** Don't guess.\n\nOur guide for adoptive, foster and kinship families explains which records to ask for."
  },
  // WHAT IS FASD
  { tags:['what is fasd','what does fasd','fasd mean','about fasd','fetal alcohol spectrum','define','meaning of fasd'],
    answer:"**What is FASD?**\n\nFetal Alcohol Spectrum Disorder (FASD) is a lifelong neurodevelopmental condition caused by exposure to alcohol before birth. It affects brain structure and function, leading to challenges across cognition, memory, attention, language, behaviour, and daily living.\n\nFASD is categorised into two presentations (SIGN 156, NICE QS204):\n• **FASD with sentinel facial features** — all three characteristic facial features present\n• **FASD without sentinel facial features** — the majority of cases; no visible facial features but significant brain impairment\n\nFASD is one of the most common neurodevelopmental conditions in the UK, and it is often missed. Estimates suggest around 3.2% of people in the UK may have FASD (SIGN 156)." },

  // PREVALENCE
  { tags:['how common','prevalence','how many','scotland','affected by fasd'],
    answer:"**How common is FASD?**\n\nEstimates suggest around 3.2% of people in the UK may have FASD. In Scotland alone, up to 172,000 people may be affected.\n\nDespite this, FASD remains significantly underdiagnosed. Between 2010–2015, only 41 cases of FAS were identified in Scotland in children under six — far below what population data would predict.\n\nUnder-diagnosis occurs because:\n• PAE is frequently not considered as a cause of neurodevelopmental difficulties\n• Most children with FASD have no visible facial features\n• Healthcare professionals may lack confidence in making the diagnosis\n• FASD is often misdiagnosed as ADHD, ASD, or conduct disorder\n\n*(SIGN 156, 2019)*" },

  // SENTINEL FACIAL FEATURES
  { tags:['facial','face','features','sentinel','philtrum','lip','palpebral','fissure','eye'],
    answer:"**What are the sentinel facial features of FASD?**\n\nThree specific facial features have such high specificity to prenatal alcohol exposure that, when all three are present simultaneously, confirmation of alcohol exposure is not required for diagnosis.\n\nThe three sentinel features (assessed using the University of Washington Lip-Philtrum Guides):\n• **Smooth philtrum** — ranked 4 or 5 on the UW Lip-Philtrum Guide\n• **Thin vermillion border (upper lip)** — ranked 4 or 5 on the UW Lip-Philtrum Guide\n• **Short palpebral fissures** — ≥2 standard deviations below the mean\n\n**Important:** Around 90% of people with FASD do NOT have visible facial features. The absence of facial features does not mean the diagnosis is milder or less significant.\n\nAssociated features (mid-face hypoplasia, epicanthal folds, etc.) should be recorded but do NOT contribute to confirming or refuting an FASD diagnosis. *(SIGN 156, Rec. 3.2)*" },

  // DIAGNOSIS
  { tags:['diagnos','criteria','how','assess','test'],
    answer:"**How is FASD diagnosed?**\n\nFASD diagnosis requires a multidisciplinary team assessment. Per SIGN 156, a diagnosis is made when:\n\n**FASD with sentinel facial features:**\n• All 3 sentinel facial features present simultaneously\n• PAE confirmed or unknown\n• Severe impairment in ≥3 of the 10 neurodevelopmental areas of assessment\n• (In infants: microcephaly may substitute for the domain criteria)\n\n**FASD without sentinel facial features:**\n• Confirmed prenatal alcohol exposure (reliable evidence essential)\n• Severe impairment in ≥3 of the 10 neurodevelopmental areas\n\nSevere impairment = a global score or major subdomain score ≥2 standard deviations below the mean on a standardised measure.\n\nOther causes, including genetic conditions, should be considered as part of the assessment." },

  // 10 DOMAINS
  { tags:['domain','area','assessment','10','ten','neuro','brain'],
    answer:"**The 10 SIGN 156 Neurodevelopmental Areas of Assessment**\n\nSevere impairment in 3 or more of these areas = pervasive brain dysfunction:\n\n1. **Brain structure / Neuroanatomy / Neurophysiology** (e.g. microcephaly, corpus callosum agenesis)\n2. **Motor skills** (fine/gross motor, coordination, graphomotor)\n3. **Cognition** (IQ, processing, reasoning)\n4. **Language** (receptive and expressive)\n5. **Academic achievement** (reading, maths, writing)\n6. **Memory** (verbal and visual memory)\n7. **Attention** (sustained/selective attention — NOT impulse control)\n8. **Executive function** (impulse control, hyperactivity, working memory, planning, flexibility)\n9. **Affect regulation** (long-standing emotional dysregulation, anxiety, mood disorders)\n10. **Adaptive behaviour, social skills & social communication**\n\nNote: Affect regulation impairment must be long-standing and not solely attributable to adverse life events (e.g. multiple foster placements). *(SIGN 156, Section 3.4)*" },

  // PAE CONFIRMATION
  { tags:['alcohol','pregnancy','exposure','pae','confirm','history','drinking'],
    answer:"**How is prenatal alcohol exposure confirmed?**\n\nPer SIGN 156 Recommendation 2.2, confirmation of PAE requires documentation that the biological mother consumed alcohol during the pregnancy based on:\n• Reliable clinical observation\n• Self-report or reports by a reliable source\n• Medical records documenting positive blood alcohol concentrations\n• Alcohol treatment or other social, legal, or medical problems related to drinking during the pregnancy\n\nUnsubstantiated information, lifestyle alone, other drug use, or history of alcohol in previous pregnancies **cannot in isolation** confirm PAE in the index pregnancy.\n\n**Key point:** When all three sentinel facial features are present, PAE confirmation is NOT required — the features alone have sufficient specificity.\n\nWhere facial features are absent, reliable PAE evidence is essential for the FASD without SFF diagnosis.\n\nFor screening in pregnancy, SIGN 156 recommends: **T-ACE, TWEAK, or AUDIT-C** tools, with consideration of biomarkers (CDT, PEth)." },

  // NICE QS204
  { tags:['nice','qs204','quality','standard','england','wales','statement'],
    answer:"**NICE QS204 — The Five Quality Statements**\n\nNICE Quality Standard QS204 (March 2022) is a quality standard for England. Wales, Scotland and Northern Ireland have their own arrangements. It sets out what high-quality FASD care looks like:\n\n**QS1** — Pregnant women are advised throughout pregnancy not to drink alcohol (UK CMO guidance)\n\n**QS2** — Alcohol use is asked about and recorded throughout pregnancy\n\n**QS3** — Children with probable prenatal alcohol exposure and significant physical, developmental, or behavioural difficulties are **referred for assessment**\n\n**QS4** — Children with confirmed PAE or all 3 sentinel facial features have a **neurodevelopmental assessment** if there are clinical concerns\n\n**QS5** — Children with a diagnosis of FASD have a **management plan** to address their needs\n\nSupport should be based on need and should not wait for a diagnosis." },

  // PARENTS CONCERNED
  { tags:['parent','carer','worried','concerned','suspect','think my child','refer','gp','my gp','doctor','discuss','referral'],
    answer:"**What should parents do if they are concerned?**\n\n**Step 1 — Talk to your GP or health visitor.** Share your concerns clearly. You do not need confirmed alcohol exposure — probable PAE with significant difficulties is enough to request a referral (NICE QS3).\n\n**Step 2 — Ask for a referral to a paediatrician.** Request specifically that prenatal alcohol exposure is considered as a possible cause of your child's difficulties.\n\n**Step 3 — Request an FASD-informed MDT assessment.** This involves a paediatrician, psychologist, speech and language therapist, and occupational therapist.\n\n**Step 4 — Don't wait for diagnosis to ask for support.** Schools can put interim strategies in place while assessment is pending. Support should be based on need and should not wait for a diagnosis.\n\n**Step 5 — Contact National FASD** (nationalfasd.org.uk) for peer support, guidance, and signposting to local services.\n\nYou are not alone. An early diagnosis is one of the most protective factors for long-term outcomes." },

  // TEACHERS CONCERNED
  { tags:['teacher','school','senco','educator','classroom','concern','refer'],
    answer:"**What should teachers do if they are concerned?**\n\n**Step 1** — Speak sensitively to the child's parent or carer. Ask open questions about history, health, and any known concerns.\n\n**Step 2** — Refer to the school's **SENCO** (Special Educational Needs Coordinator). They can coordinate support, initiate an EHCP assessment, and liaise with external specialists.\n\n**Step 3** — Where there are significant concerns with probable PAE, a health referral should be made via the school nurse, health visitor, or safeguarding lead (NICE QS3).\n\n**Step 4** — Implement interim classroom strategies now — do not wait for a diagnosis. Key strategies include: one instruction at a time, visual timetables, movement breaks, seating near the teacher, no copying from the board, calm-down space, and avoiding punitive responses to regulation difficulties.\n\n**Step 5** — Teachers are valued members of the MDT (SIGN 156, Section 3.7). Provide written school reports and behaviour observations when requested.\n\n**Remember:** Inconsistency in performance is neurological, not deliberate. A child performing well one day and struggling the next is common in FASD." },

  // HOME STRATEGIES
  { tags:['strateg','home','parent','tip','manage','help child','routine','visual'],
    answer:"**Home strategies for children with FASD**\n\n1. **Predictable routines** — Use consistent daily schedules with visual timetables. Give warnings before transitions: 'Five more minutes, then bath time.'\n\n2. **Visual supports** — Pair all verbal instructions with pictures or written steps. A picture checklist for morning routine reduces cognitive load significantly.\n\n3. **One instruction at a time** — Use short, concrete language. Ask your child to repeat back what they heard to confirm understanding.\n\n4. **Regulation before reasoning** — When your child is dysregulated, their thinking brain is offline. Help them calm first (quiet space, sensory tool, deep breathing) before reasoning or consequences.\n\n5. **'Can't, not won't'** — Many FASD behaviours reflect neurological inability, not deliberate non-compliance. Consequences-based discipline alone rarely works.\n\n6. **Celebrate strengths** — Many children with FASD are creative, kind, and artistic. Build on what they can do.\n\n7. **Seek your own support** — Connect with FASD support groups. Caring for a child with FASD is demanding — your wellbeing matters too." },

  // SCHOOL STRATEGIES
  { tags:['classroom','school strateg','teach','learn','sitting','support','inclusion','sen'],
    answer:"**Classroom strategies for children with FASD (SIGN 156 based)**\n\n**Environment:** Seat near the teacher and away from distractions. Reduce visual clutter. Allow fidget tools and movement breaks. Provide an accessible calm-down space.\n\n**Instructions:** Give one instruction at a time and check for understanding. Use concrete, literal language — avoid sarcasm, idioms, and implied expectations. Pair verbal with visual cues. Allow extra processing time.\n\n**Routines:** Use a visual daily timetable on the desk. Give advance warnings before transitions. Prepare the child for changes in routine the day before.\n\n**Workload:** Break tasks into small chunks. Allow oral responses instead of written where possible. Extra time for tests. Provide pre-printed notes — avoid copying from the board.\n\n**Behaviour:** Avoid punitive approaches. Confabulation (apparent lying) is neurological, not intentional. Identify triggers and create a regulation plan with the family. Use calm-down spaces, not exclusion.\n\n**Collaboration:** Maintain regular, brief, positive communication with parents. Share what worked, not just what didn't." },

  // MELTDOWNS
  { tags:['meltdown','outburst','tantrum','emotional','dysregulat','angry','behaviour','explode'],
    answer:"**Understanding and managing emotional meltdowns in FASD**\n\nEmotional dysregulation in FASD is neurological — it reflects impaired affect regulation across multiple brain systems, not deliberate behaviour. It is listed as one of the 10 SIGN 156 neurodevelopmental areas of assessment.\n\n**Why meltdowns happen:**\n• The brain's regulation systems were affected by prenatal alcohol\n• Transitions, unexpected changes, sensory overload, fatigue, or frustration are common triggers\n• The child's 'window of tolerance' is often much narrower than typical\n\n**What helps:**\n• Identify and reduce triggers where possible\n• Give transition warnings well in advance\n• Create a calm, predictable environment\n• Have a designated calm-down space the child can access independently\n• After the child has calmed — not during — briefly and calmly acknowledge what happened\n• Never try to reason during a meltdown — the thinking brain is offline\n\n**Remember:** Consequences-based approaches alone rarely work for FASD. Proactive environment design is more effective than reactive discipline." },

  // MANAGEMENT PLAN
  { tags:['management','plan','after diagnosis','support','services','what next'],
    answer:"**What happens after an FASD diagnosis?**\n\nNICE QS204 Statement 5 says children with a diagnosis of FASD have a **management plan** to address their needs. SIGN 156 describes what it can cover:\n\n• Immediate and longer-term therapy needs (SLT, OT, psychology, CAMHS)\n• School adjustments and EHCP/IEP coordination\n• Family psychoeducation and support\n• Signposting to local and national resources\n• Regular review schedule\n• Reassessment at all transition stages (new class, secondary school, adulthood)\n\n**Ask your paediatrician to:**\n• Share the plan with school, health visitor, and all involved professionals\n• Schedule a review within a specified timeframe\n• Link your family to FASD support organisations\n\nFASD is a lifelong condition. The management plan should evolve as your child grows. SIGN 156 emphasises that reassessment and care plan revision are particularly important at transition stages.\n\nContact **National FASD** (nationalfasd.org.uk) for resources after diagnosis." },

  // COOCCURRING
  { tags:['adhd','autism','asd','comorbid','anxiety','mental health','condition','together','also'],
    answer:"**FASD and co-occurring conditions**\n\nFASD is associated with over 400 co-occurring conditions across 18 ICD-10 chapters. Over 90% of individuals with FASD have at least one co-occurring condition.\n\nMost commonly seen alongside FASD:\n• **ADHD** — frequently the first diagnosis given; medication response may be atypical\n• **Autism spectrum features** — social communication difficulties overlap\n• **Anxiety disorders** — extremely common\n• **Depression** — particularly in adolescence and adulthood\n• **Sleep disorders**\n• **Attachment disorders** — especially in children in care\n• **Conduct disorder / ODD**\n• **Substance misuse** in adolescence/adulthood\n\n**Important:** A child with ADHD that is not responding as expected to medication, or whose presentation is broader than ADHD alone, should be assessed for FASD. The two conditions can and do coexist, but FASD requires its own specific support strategies.\n\nTreat the whole child. Comorbid conditions need their own diagnosis and management plan alongside FASD." },

  // PREVENTION
  { tags:['prevent','safe','drink','alcohol','pregnancy','safe amount','no safe'],
    answer:"**Preventing FASD**\n\nThe UK Chief Medical Officers' guidance is clear:\n\n*'If you are pregnant or think you could become pregnant, the safest approach is not to drink alcohol at all, to keep risks to your baby to a minimum.'*\n\nThere is **no known safe level, safe type, or safe time** during pregnancy to drink alcohol. The developing brain is vulnerable throughout all trimesters.\n\nIf you find out you are pregnant after drinking during early pregnancy:\n• Stop drinking now\n• In most cases, the risk to the baby is likely to be low from small amounts\n• Talk to your GP or midwife if you are worried\n\nFor clinicians: SIGN 156 recommends screening all pregnant women using **T-ACE, TWEAK, or AUDIT-C** tools. Women drinking above the low-risk guideline should be offered brief interventions.\n\n*(UK CMO Low Risk Drinking Guidelines; SIGN 156)*" },

  // AT RISK
  { tags:['at risk','young baby','infant','too young','incomplete'],
    answer:"**'At risk for neurodevelopmental disorder and FASD' — what does this mean?**\n\nThis designation (SNOMED CT: 2078801000000102) is used for children who:\n• Have confirmed prenatal alcohol exposure\n• Do not yet meet the full CNS criteria for an FASD diagnosis (e.g. too young for complete assessment)\n• Show some indication of neurodevelopmental concern\n\nIt is **not a diagnosis** — it is a formal designation ensuring the child is monitored and supported while awaiting a more comprehensive assessment as they grow.\n\nPer SIGN 156, this designation:\n• Should never be used when PAE is confirmed absent\n• Should be recorded and available to all professionals involved in developmental surveillance\n• Should prompt referral to a clinical geneticist if all 3 sentinel features are present but no microcephaly\n• Should lead to re-assessment when the child is older\n\n**Support should be based on need and should not wait for a diagnosis.** Children designated 'at risk' should receive early intervention and monitoring." },

  // FOSTER / ADOPTION
  { tags:['foster','adopt','care','kinship','looked after','unknown history','birth mother'],
    answer:"**FASD in children in foster care, kinship care, or adoption**\n\nChildren in care are at significantly higher risk of FASD:\n• Birth history and PAE history may be unknown\n• SIGN 156 specifically lists 'child in foster/kinship/adoptive care with unknown birth history' as a key screening trigger\n• Multiple placement breakdowns and school exclusions are common secondary consequences of undiagnosed FASD\n\n**What to do:**\n• Unknown birth history alone is sufficient reason to consider FASD in a child with developmental or behavioural difficulties\n• Request a referral for FASD assessment — you do not need a confirmed alcohol history\n• All 3 sentinel facial features present = PAE confirmation not required\n• Significant difficulties + probable PAE = sufficient for NICE QS3 referral\n\n**Carers:** Many foster and adoptive carers carry the family history of the birth mother and are uniquely placed to provide PAE information. Your input is invaluable to the MDT assessment.\n\nContact **National FASD** (nationalfasd.org.uk) for carer-specific resources and support groups." },
];


// ─── SAFETY LAYER (runs before the knowledge base) ───
// Clinically reviewed wording. Keep crisis replies short and actionable.
const CRISIS_PATTERNS = [
  /suicid/, /kill (?:my|him|her|them|your)sel(?:f|ves)/, /\bkill myself\b/, /want(?:s|ed)? to die/, /end (?:my|his|her|their) li(?:fe|ves)/,
  /self[ -]?harm/, /\bcutting (?:my|him|her|them)sel/, /(?:has|have|is|been|started|keeps?) cutting/, /hurt(?:ing)? (?:my|him|her|them)sel(?:f|ves)/,
  /harm(?:ing)? (?:my|him|her|them)sel(?:f|ves)/, /overdos/, /took (?:too many|a lot of) (?:pills|tablets)/, /can'?t go on/, /no reason to live/,
  /can'?t cope any ?more/, /not safe (?:with|from) (?:my|him|her)sel/
];
const SAFEGUARDING_PATTERNS = [
  /\babuse/, /being (?:hurt|hit|beaten|harmed) at home/, /hurt at home/, /scared to go home/, /afraid to go home/, /\bneglect/,
  /domestic (?:violence|abuse)/, /sexual(?:ly)? (?:abuse|touch|assault)/, /touched (?:him|her|them|me) inappropriately/, /bruis(?:e|es|ing) (?:on|all over)/,
  /(?:hits|hitting|beats|beating) (?:him|her|them|my child|my son|my daughter)/, /unsafe at home/, /safeguarding/, /being groomed|grooming/, /exploit/
];
const EMERGENCY_PATTERNS = [/not breathing/, /unconscious/, /won'?t wake/, /seizure (?:now|right now|happening)/, /swallowed/, /choking/, /collapsed/];

const URGENT_HELP_LINK = 'More help: fasdcompass.co.uk/urgent-help/';
const REPLY_CRISIS = "**I'm sorry you are dealing with this. Please get help from a person now.**\n\n• **If someone is in immediate danger or has seriously hurt themselves, call 999** or go to A&E.\n• **For urgent advice, call NHS 111.** In Northern Ireland, contact your GP or the GP out-of-hours service.\n• **Samaritans:** call 116 123, free, any time of day or night.\n• **Shout:** text SHOUT to 85258, free and 24 hours.\n• **Childline (for children and young people):** call 0800 1111.\n\nIf your child is already known to a mental health team (CAMHS), contact them too.\n\nI'm an information tool and can't help in an emergency. You don't have to manage this on your own.\n\n" + URGENT_HELP_LINK;
const REPLY_SAFEGUARDING = "**If you are worried a child is being harmed, please tell someone who can act.**\n\n• **If a child is in immediate danger, call 999.**\n• **If you work in a school or service,** tell your Designated Safeguarding Lead today and follow your safeguarding procedures.\n• **Contact the local council's children's services** where the child lives. You can find them at gov.uk/report-child-abuse-to-local-council.\n• **NSPCC Helpline (adults worried about a child):** call 0808 800 5000, Monday to Friday 10am to 4pm, or email help@nspcc.org.uk.\n• **Childline (for children and young people):** call 0800 1111.\n\nPlease don't share names or details here. I'm an information tool, and I can't pass on concerns or act on them.\n\n" + URGENT_HELP_LINK;
const REPLY_EMERGENCY = "**This sounds like an emergency. Call 999 now.**\n\nIf it is less urgent, call NHS 111 for advice. I'm an information tool and can't give emergency medical help.\n\n" + URGENT_HELP_LINK;

const PII_PATTERNS = [
  { re: /\b\d{3}[ -]?\d{3}[ -]?\d{4}\b/g, label: 'NHS number' },
  { re: /\b(?:0|\+44 ?)7\d{3}[ -]?\d{3}[ -]?\d{3}\b/g, label: 'phone number' },
  { re: /\b0\d{2,4}[ -]?\d{3,4}[ -]?\d{3,4}\b/g, label: 'phone number' },
  { re: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, label: 'email address' },
  { re: /\b(?:0?[1-9]|[12]\d|3[01])[\/.-](?:0?[1-9]|1[0-2])[\/.-](?:19|20)?\d{2}\b/g, label: 'date of birth' },
  { re: /\b(?:dob|d\.o\.b\.?|date of birth|born on)\b[:\s]*\d{1,2}(?:st|nd|rd|th)?[\s\/.-]+[a-z0-9]+[\s\/.-]+\d{2,4}/gi, label: 'date of birth' },
  { re: /\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b/gi, label: 'postcode' },
  { re: /\b(?:my (?:son|daughter|child|grandson|granddaughter|pupil|patient)(?:'s name)? is|(?:he|she) is called|named|called) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/g, label: 'name', group: 1 }
];
function redactPII(text) {
  const found = new Set(); let out = text;
  PII_PATTERNS.forEach(p => {
    out = out.replace(p.re, (m, g1) => {
      found.add(p.label);
      if (p.group && g1) return m.replace(g1, '[name removed]');
      return '[' + p.label + ' removed]';
    });
  });
  return { text: out, found: [...found] };
}
const PII_NOTICE = "**Please don't share personal details here,** such as names, dates of birth, NHS numbers, addresses or phone numbers. I've hidden what I spotted. Nothing you type is stored or sent anywhere, but it is safer to keep questions general.\n\n";

const QUIZ_PATTERNS = [/(?:questionnaire|quiz|screening tool|checklist|guide|test|result)s?.{0,40}(?:mean|confirm|show|prove|tell|diagnos|rule out|say)/, /(?:does|do|can|will) (?:the |my |this )?(?:questionnaire|quiz|screening|checklist|result|score).{0,40}(?:have|has|got) fasd/, /(?:high|low|moderate) (?:concern|score|risk)/];
const REPLY_QUIZ = "**No. The questionnaire cannot confirm or rule out FASD.**\n\nIt is a checklist to help you notice developmental concerns and get ready to talk to a professional. It has not been validated as a screening or diagnostic tool, and it does not give a risk score.\n\nOnly a full multidisciplinary assessment can diagnose FASD, following SIGN 156. Many things can cause similar difficulties, and some children have more than one condition.\n\nIf you have concerns, take the summary from the questionnaire to your GP or health visitor. The **Before You See the GP** checklist can help you prepare.";

function safetyReply(q) {
  if (EMERGENCY_PATTERNS.some(r => r.test(q))) return REPLY_EMERGENCY;
  if (CRISIS_PATTERNS.some(r => r.test(q))) return REPLY_CRISIS;
  if (SAFEGUARDING_PATTERNS.some(r => r.test(q))) return REPLY_SAFEGUARDING;
  return null;
}
function respond(raw) {
  const q = raw.toLowerCase().replace(/[’‘]/g, "'");
  const safe = safetyReply(q);
  if (safe) return safe;
  const pii = redactPII(raw);
  const prefix = pii.found.length ? PII_NOTICE : '';
  if (QUIZ_PATTERNS.some(r => r.test(q))) return prefix + REPLY_QUIZ;
  return prefix + findAnswer(pii.text);
}
function escHTML(t) { return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

function findAnswer(query) {
  const q = query.toLowerCase();
  let best = null, bestScore = 0;
  const STOP = ['what','is','how','mean','also','help','care','test','10','ten','uk','eye','lip','safe','together','condition','support','area','plan','rate','common','concern','home','tip','learn','manage','services','think my child','what do i','not sure','sitting','define'];
  FAQ_KB.forEach(item => {
    let score = 0;
    item.tags.forEach(tag => {
      if (STOP.includes(tag)) return;
      const re = new RegExp('(^|[^a-z])' + tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      if (re.test(q)) score += Math.max(tag.length, 4);
    });
    if(score > bestScore) { bestScore = score; best = item; }
  });
  if(bestScore >= 4) return best.answer;
  // Fallback
  return "I don't have an answer to that in my FASD information yet. I can only answer general questions about FASD, and I can't give advice about an individual child.\n\n• **For your child's health:** speak to your GP, health visitor or school nurse.\n• **For FASD support:** National FASD runs a helpline and has information at nationalfasd.org.uk.\n• **For school support:** talk to the school SENCO.\n\nTry asking in a different way, for example \"How can I help with meltdowns?\" or \"What should I tell my GP?\"";
}

let chatHistory = [];
let chatLoading = false;

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 90)+'px';
}

function sendSuggestion(el) {
  document.getElementById('chatInput').value = el.textContent;
  sendMessage();
}

function sendMessage() {
  if(chatLoading) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;

  input.value='';
  input.style.height='auto';
  chatLoading=true;

  appendMsg('user', redactPII(text).text);
  showTyping();

  // Simulate brief thinking delay for natural feel
  setTimeout(() => {
    removeTyping();
    const reply = respond(text);
    appendMsg('bot', reply);
    chatLoading=false;
  }, 600 + Math.random()*400);
}


function appendMsg(role, text) {
  const msgs = document.getElementById('chatMessages');
  const isUser = role==='user';
  const div = document.createElement('div');
  div.className = 'msg'+(isUser?' user':'');
  const now = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  // Convert markdown-style bold and bullets to HTML
  let html = escHTML(text)
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/^• /gm,'• ')
    .replace(/\n/g,'<br>');
  if (!isUser) {
    // Make known safe addresses clickable. Text is already escaped above.
    html = html
      .replace(/\bfasdcompass\.co\.uk\/([a-z0-9-]+)\/?/g, '<a href="/$1/">fasdcompass.co.uk/$1/</a>')
      .replace(/\bgov\.uk\/report-child-abuse-to-local-council\b/g, '<a href="https://www.gov.uk/report-child-abuse-to-local-council" target="_blank" rel="noopener">gov.uk/report-child-abuse-to-local-council</a>')
      .replace(/\bhelp@nspcc\.org\.uk\b/g, '<a href="mailto:help@nspcc.org.uk">help@nspcc.org.uk</a>');
  }
  div.innerHTML = `
    <div class="msg-avatar">${isUser?'👤':'🤖'}</div>
    <div>
      <div class="msg-bubble">${html}</div>
      <div class="msg-time">${now}</div>
    </div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
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

document.addEventListener('DOMContentLoaded', () => { handleHashRoute(); if (document.getElementById('quiz-body')) initQuiz(); });

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
