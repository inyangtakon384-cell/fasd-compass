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

// ─── QUIZ ───
const quizQuestions = [
  {
    num:1, domain:"Background History",
    text:"Is there known or suspected prenatal alcohol exposure for this child?",
    sub:"This includes any alcohol use during pregnancy, even in the first trimester.",
    opts:[{t:"Yes — confirmed",w:3},{t:"Possibly / uncertain",w:2},{t:"No known exposure",w:0},{t:"Unknown (e.g. adopted/foster)",w:2}]
  },
  {
    num:2, domain:"Learning & Memory",
    text:"Does the child have significant difficulty remembering instructions or information, even when recently taught?",
    sub:"For example, forgetting a rule they were told 10 minutes ago.",
    opts:[{t:"Yes, consistently",w:3},{t:"Sometimes",w:1},{t:"Rarely or never",w:0}]
  },
  {
    num:3, domain:"Behaviour",
    text:"Does the child struggle with impulse control — acting before thinking, or not learning from consequences?",
    sub:"This is different from typical childhood impulsivity.",
    opts:[{t:"Yes, significantly",w:3},{t:"Somewhat",w:1},{t:"Not particularly",w:0}]
  },
  {
    num:4, domain:"Attention",
    text:"Does the child have marked difficulties with sustained attention, even for activities they enjoy?",
    opts:[{t:"Yes, major difficulty",w:3},{t:"Mild to moderate",w:1},{t:"Age-appropriate attention",w:0}]
  },
  {
    num:5, domain:"Communication",
    text:"Does the child have language or communication difficulties — including understanding spoken language?",
    sub:"May include seeming to understand but not following through, or taking things very literally.",
    opts:[{t:"Yes, notable difficulties",w:3},{t:"Mild concerns",w:1},{t:"Communication is on track",w:0}]
  },
  {
    num:6, domain:"Social Skills",
    text:"Does the child struggle with age-appropriate social understanding — e.g. being overly friendly with strangers, or not reading social cues?",
    opts:[{t:"Yes, significantly",w:3},{t:"Some difficulty",w:1},{t:"Socially on track",w:0}]
  },
  {
    num:7, domain:"Emotion Regulation",
    text:"Does the child have significant emotional outbursts or meltdowns that seem disproportionate to the situation?",
    opts:[{t:"Yes, frequently",w:3},{t:"Occasionally",w:1},{t:"Rarely",w:0}]
  },
  {
    num:8, domain:"Motor Development",
    text:"Has the child shown any difficulties with coordination, fine motor tasks (e.g. writing, cutting), or gross motor skills?",
    opts:[{t:"Yes, significant delay",w:3},{t:"Mild difficulties",w:1},{t:"No concerns",w:0}]
  },
  {
    num:9, domain:"School & Daily Living",
    text:"Is the child significantly below academic expectations, or struggling with age-appropriate daily living skills (e.g. dressing, organisation)?",
    opts:[{t:"Yes, significant gap",w:3},{t:"Mild gap",w:1},{t:"On track",w:0}]
  },
  {
    num:10, domain:"Physical Features",
    text:"Has anyone noted any of the following: growth restriction, small head size, or any unusual facial features?",
    sub:"Facial features are only present in a subset of FASD presentations.",
    opts:[{t:"Yes — one or more noted",w:3},{t:"Uncertain",w:1},{t:"None identified",w:0}]
  }
];

let quizAnswers = [];
let currentQ = 0;

function initQuiz() {
  quizAnswers = new Array(quizQuestions.length).fill(null);
  currentQ = 0;
  document.getElementById('quiz-body').style.display='block';
  document.getElementById('quiz-result').style.display='none';
  renderQuestion();
}

function renderQuestion() {
  const q = quizQuestions[currentQ];
  const pct = (currentQ/quizQuestions.length)*100;
  document.getElementById('quizProgressFill').style.width = pct+'%';
  document.getElementById('quizStepLabel').textContent = `Question ${currentQ+1} of ${quizQuestions.length}`;
  document.getElementById('qNum').textContent = `QUESTION ${q.num} OF ${quizQuestions.length} · ${q.domain.toUpperCase()}`;
  document.getElementById('qText').textContent = q.text;
  document.getElementById('qSub').textContent = q.sub || '';
  document.getElementById('qSub').style.display = q.sub ? 'block' : 'none';
  const optEl = document.getElementById('qOptions');
  optEl.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt' + (quizAnswers[currentQ]===i?' selected':'');
    btn.innerHTML = `<div class="opt-check">${quizAnswers[currentQ]===i?'✓':''}</div>${opt.t}`;
    btn.onclick = () => selectOpt(i);
    optEl.appendChild(btn);
  });
  document.getElementById('quizNext').disabled = quizAnswers[currentQ]===null;
  document.getElementById('quizBack').style.visibility = currentQ===0?'hidden':'visible';
}

function selectOpt(i) {
  quizAnswers[currentQ] = i;
  document.querySelectorAll('.quiz-opt').forEach((b,idx)=>{
    b.classList.toggle('selected', idx===i);
    b.querySelector('.opt-check').textContent = idx===i?'✓':'';
  });
  document.getElementById('quizNext').disabled = false;
}

function quizNext() {
  if(quizAnswers[currentQ]===null) return;
  if(currentQ < quizQuestions.length-1) {
    currentQ++;
    renderQuestion();
  } else {
    showQuizResults();
  }
}

function quizBack() {
  if(currentQ>0){ currentQ--; renderQuestion(); }
}

function showQuizResults() {
  let totalScore = 0;
  const domainScores = [];
  quizQuestions.forEach((q,i) => {
    const ans = quizAnswers[i];
    const weight = ans !== null ? q.opts[ans].w : 0;
    totalScore += weight;
    domainScores.push({domain: q.domain, weight});
  });
  const maxScore = 30;
  const pct = (totalScore/maxScore)*100;

  let level, emoji, label, title, body, colorClass;
  if(pct < 30) {
    level='low'; emoji='🟢'; label='Low Concern'; colorClass='low';
    title='Low Indicators at This Time';
    body='Responses suggest limited indicators of FASD at this time. Continue monitoring development. If concerns arise, consider reassessment.';
  } else if(pct < 60) {
    level='mid'; emoji='🟡'; label='Moderate Concern'; colorClass='mid';
    title='Some Indicators Present';
    body='Responses indicate some areas of concern that warrant further monitoring. Consider discussing with a GP, paediatrician, or early intervention service, particularly if prenatal alcohol exposure is known or suspected.';
  } else {
    level='high'; emoji='🔴'; label='High Concern'; colorClass='high';
    title='Significant Indicators — Seek Assessment';
    body='Responses suggest significant indicators across multiple domains associated with FASD. A multidisciplinary assessment is strongly recommended. Please discuss with a paediatrician or specialist FASD diagnostic service as soon as possible.';
  }

  document.getElementById('quiz-body').style.display='none';
  const resultEl = document.getElementById('quiz-result');
  resultEl.style.display='block';

  const domainHTML = domainScores.map(d => {
    const pctD = (d.weight/3)*100;
    const color = pctD<34?'green':pctD<67?'amber':'red';
    return `<div class="rb-domain">
      <div class="rbd-label">${d.domain}</div>
      <div class="rbd-bar-wrap"><div class="rbd-bar ${color}" style="width:${pctD}%"></div></div>
    </div>`;
  }).join('');

  resultEl.innerHTML = `
    <div class="result-score-card ${colorClass}">
      <div class="rs-emoji">${emoji}</div>
      <div class="rs-label ${colorClass}">${label}</div>
      <div class="rs-title">${title}</div>
      <div class="rs-body">${body}</div>
    </div>
    <div class="result-breakdown">
      <div style="font-weight:700;font-size:14px;color:var(--navy);margin-bottom:12px;">Domain Breakdown</div>
      ${domainHTML}
    </div>
    <div class="quiz-disclaimer">⚕️ This screening tool is not a diagnostic instrument. It is designed to help identify children who may benefit from a comprehensive FASD assessment. A formal diagnosis requires a multidisciplinary team evaluation. Results should be discussed with a qualified healthcare professional.</div>
    <div style="display:flex;gap:10px;margin-bottom:14px;">
      <button class="quiz-btn primary" onclick="initQuiz()" style="flex:1;">Retake Quiz</button>
      <button class="quiz-btn primary" style="background:var(--navy);flex:1;" onclick="window.location.href='/ask-fasd-ai/'">Ask the AI →</button>
    </div>
  `;
}

// ─── CHATBOT ───
const SYSTEM_PROMPT = `You are the FASD Compass AI — a warm, expert, and evidence-based assistant specialising in Fetal Alcohol Spectrum Disorder (FASD). You support parents, carers, teachers, clinicians, GPs, nurses, and community members with accurate, compassionate information.

Your knowledge is grounded in the current UK national guidelines:
- SIGN 156: Scottish Intercollegiate Guidelines Network, "Children and Young People Exposed Prenatally to Alcohol" (2019, revalidated 2022) — the primary UK clinical guideline
- NICE QS204: NICE Quality Standard for FASD (March 2022) — applies in England & Wales

═══════════════════════════════════════
DIAGNOSTIC CLASSIFICATIONS (SIGN 156)
═══════════════════════════════════════

TWO DIAGNOSTIC CATEGORIES:

1. FASD WITH SENTINEL FACIAL FEATURES (SNOMED CT: 1894471000000108)
All 3 sentinel features must be simultaneously present:
- Smooth philtrum — ranked 4 or 5 on UW Lip-Philtrum Guide
- Thin vermillion border (upper lip) — ranked 4 or 5 on UW Lip-Philtrum Guide
- Short palpebral fissures — ≥2 SDs below the mean (SIGN 156 removes percentile threshold due to lack of UK norms)
PLUS: PAE confirmed or unknown (all 3 SFF have such high specificity to PAE that confirmation is not required when all 3 are present)
PLUS: evidence of severe impairment in ≥3 of the 10 areas of assessment, OR in infants/young children, microcephaly (OFC <3rd centile or ≥2 SDs below mean)
Note: Genetic causes must be considered and excluded before diagnosis.

2. FASD WITHOUT SENTINEL FACIAL FEATURES (SNOMED CT: 1894461000000101)
- Fewer than 3 sentinel facial features present
- REQUIRES confirmed PAE (reliable evidence essential when facial features are absent)
- REQUIRES severe impairment in ≥3 of the 10 SIGN 156 areas of assessment
- Previously called pFAS, ARND, ARBD, ND-PAE — all superseded
- NOT a milder diagnosis

3. AT INCREASED RISK OF FASD (SNOMED CT: 2078801000000102)
- Confirmed PAE but CNS criteria not yet met, or assessment incomplete (child too young)
- Should never be applied when PAE is confirmed absent
- Must receive early support and re-assessment

ASSOCIATED FEATURES (NOT DIAGNOSTIC — per SIGN 156 Rec. 3.2):
Mid-face hypoplasia, micrognathia, abnormal ear position, high arched palate, epicanthal folds, limb abnormalities, palmar crease abnormalities, short upturned nose. Should be recorded but do not confirm or refute FASD diagnosis.

═══════════════════════════════════════
SIGN 156 — 10 AREAS OF ASSESSMENT
═══════════════════════════════════════
Severe impairment = global or major subdomain score ≥2 SDs below the mean. ≥3 areas severely impaired = pervasive brain dysfunction.

1. BRAIN STRUCTURE/NEUROANATOMY/NEUROPHYSIOLOGY: OFC <3rd centile; seizure disorder not due to postnatal causes; structural brain abnormalities on imaging (e.g. corpus callosum agenesis, cerebellar hypoplasia) after other aetiologies excluded.

2. MOTOR SKILLS: Composite below cut-off on fine motor, gross motor, graphomotor, or visual-motor integration. Tone, reflexes, balance, coordination may be considered alongside formal assessment.

3. COGNITION: Composite IQ/cognitive score below cut-off; major subdomain (verbal, nonverbal, fluid reasoning) below cut-off; or unusual discrepancy among major subdomains (base rate ≤3%, lower score ≥1 SD below mean).

4. LANGUAGE: Composite on core/receptive/expressive language below cut-off; multiple subtest scores on higher-level language below cut-off; or large receptive-expressive discrepancy (base rate <3%, lower score ≥1 SD below mean).

5. ACADEMIC ACHIEVEMENT: Standardised reading/maths/written expression below cut-off, or significant discrepancy between cognition and achievement (base rate <3%, achievement ≥1 SD below mean). Requires confirmation of consistent access to academic instruction.

6. MEMORY: Composite on overall/verbal/visual memory below cut-off; or large verbal-nonverbal memory discrepancy (base rate <3%, lower ≥1 SD below mean). NB: working memory is assessed under Executive Function.

7. ATTENTION: Defined as sustained/selective attention and resistance to distractions (NOT impulse control/hyperactivity — those are Executive Function). Direct: multiple subtest scores below cut-off on continuous processing tests. Indirect: converging evidence from interview, questionnaire, file review, direct observation.

8. EXECUTIVE FUNCTION (incl. impulse control and hyperactivity): Working memory, inhibition/impulse control, hyperactivity, planning and problem solving, shifting/cognitive flexibility. Direct: neuropsychological subtests below cut-off. Indirect: rating scales + clinical interview + file review + observation.

9. AFFECT REGULATION: Manifested by long-standing high levels of emotional expression causing significant clinical impairment: anxiety disorders (panic, phobic, separation anxiety, GAD), depressive disorders, oppositional defiant disorder, conduct disorder. IMPORTANT: must be long-standing and not solely attributable to adverse life events (e.g. multiple foster placements) or situationally specific.

10. ADAPTIVE BEHAVIOUR, SOCIAL SKILLS & SOCIAL COMMUNICATION: Direct: below cut-off on social language/pragmatic/social communication composite. Indirect: below cut-off on caregiver-rated global composite or major subdomain of standardised scale. Observations should be gathered across environments (home + school).

═══════════════════════════════════════
NICE QS204 — 5 QUALITY STATEMENTS
═══════════════════════════════════════
QS1: Advise pregnant women not to drink at every antenatal contact (UK CMO guidance)
QS2: Ask about and record alcohol use throughout pregnancy (use AUDIT-C, T-ACE, or TWEAK; consider CDT/PEth biomarkers)
QS3: Refer children with probable PAE and significant physical/developmental/behavioural difficulties for assessment — do not wait for confirmed PAE
QS4: Children with confirmed PAE or all 3 sentinel facial features have a neurodevelopmental assessment if clinical concerns
QS5: Children with a diagnosis of FASD have an individualised management plan

═══════════════════════════════════════
ASSESSMENT PATHWAY (SIGN 156)
═══════════════════════════════════════
MDT MUST INCLUDE:
- Neonatologist/paediatrician/physician with FASD competency
- Child development specialist (SLT, OT, clinical psychologist, educational psychologist)
Additional input: clinical geneticist, physiotherapist, neuropsychologist, CAMHS, nurses, social workers, family therapists

STEPS:
1. Gather PAE history (self-report, clinical records, alcohol treatment history, collateral)
2. Medical examination: sentinel features (UW Lip-Philtrum Guides), palpebral fissure length, OFC/height/weight on UK-WHO growth charts, family/social/medical history, consider genetics
3. Note associated features (not diagnostic)
4. Full neurodevelopmental assessment across all 10 areas
5. Apply SIGN 156 diagnostic algorithm (Annex 2)
6. Formulate diagnosis/descriptor + SNOMED CT code
7. Communicate findings + develop individualised management plan
8. Reassess at all transition points

FOR PARENTS CONCERNED:
- Talk to GP or health visitor first
- Probable PAE + significant difficulties = sufficient for referral (do not need confirmed PAE)
- Ask specifically for FASD to be considered
- Support should not wait for diagnosis
- Contact National FASD (nationalfasd.org.uk) for peer support

FOR TEACHERS CONCERNED:
- Speak to parents sensitively
- Refer to SENCO
- School nurse or safeguarding lead can initiate health referral
- Teachers are valued MDT members — provide school reports and observations
- Implement interim support strategies while awaiting assessment

═══════════════════════════════════════
COMMUNICATION STYLE
═══════════════════════════════════════
- Warm, non-judgmental, empathetic; tailor language to audience
- Plain language for families; clinical language for professionals
- Mobile-friendly: short paragraphs, bullet points
- Always recommend professional assessment for specific children
- Never diagnose individual children
- Cite SIGN 156 or NICE QS204 where relevant`;

// ─── SELF-CONTAINED FAQ CHATBOT (no API key needed) ───
// Comprehensive knowledge base drawn from SIGN 156 and NICE QS204

const FAQ_KB = [
  // WHAT IS FASD
  { tags:['what','fasd','is','fetal','alcohol','spectrum','disorder','define','mean'],
    answer:"**What is FASD?**\n\nFetal Alcohol Spectrum Disorder (FASD) is a lifelong neurodevelopmental condition caused by exposure to alcohol before birth. It affects brain structure and function, leading to challenges across cognition, memory, attention, language, behaviour, and daily living.\n\nFASD is categorised into two presentations (SIGN 156, NICE QS204):\n• **FASD with sentinel facial features** — all three characteristic facial features present\n• **FASD without sentinel facial features** — the majority of cases; no visible facial features but significant brain impairment\n\nFASD is the leading preventable cause of neurodevelopmental disability. It is estimated to affect approximately 3.2% of babies born in the UK — around three to four times the rate of autism." },

  // PREVALENCE
  { tags:['common','prevalence','how many','rate','uk','scotland'],
    answer:"**How common is FASD?**\n\nFASD affects approximately 3.2% of babies born in the UK, making it more common than autism spectrum disorder. In Scotland alone, up to 172,000 people may be affected.\n\nDespite this, FASD remains significantly underdiagnosed. Between 2010–2015, only 41 cases of FAS were identified in Scotland in children under six — far below what population data would predict.\n\nUnder-diagnosis occurs because:\n• PAE is frequently not considered as a cause of neurodevelopmental difficulties\n• Most children with FASD have no visible facial features\n• Healthcare professionals may lack confidence in making the diagnosis\n• FASD is often misdiagnosed as ADHD, ASD, or conduct disorder\n\n*(SIGN 156, 2019)*" },

  // SENTINEL FACIAL FEATURES
  { tags:['facial','face','features','sentinel','philtrum','lip','palpebral','fissure','eye'],
    answer:"**What are the sentinel facial features of FASD?**\n\nThree specific facial features have such high specificity to prenatal alcohol exposure that, when all three are present simultaneously, confirmation of alcohol exposure is not required for diagnosis.\n\nThe three sentinel features (assessed using the University of Washington Lip-Philtrum Guides):\n• **Smooth philtrum** — ranked 4 or 5 on the UW Lip-Philtrum Guide\n• **Thin vermillion border (upper lip)** — ranked 4 or 5 on the UW Lip-Philtrum Guide\n• **Short palpebral fissures** — ≥2 standard deviations below the mean\n\n**Important:** Around 90% of people with FASD do NOT have visible facial features. The absence of facial features does not mean the diagnosis is milder or less significant.\n\nAssociated features (mid-face hypoplasia, epicanthal folds, etc.) should be recorded but do NOT contribute to confirming or refuting an FASD diagnosis. *(SIGN 156, Rec. 3.2)*" },

  // DIAGNOSIS
  { tags:['diagnos','criteria','how','assess','test'],
    answer:"**How is FASD diagnosed?**\n\nFASD diagnosis requires a multidisciplinary team assessment. Per SIGN 156, a diagnosis is made when:\n\n**FASD with sentinel facial features:**\n• All 3 sentinel facial features present simultaneously\n• PAE confirmed or unknown\n• Severe impairment in ≥3 of the 10 neurodevelopmental areas of assessment\n• (In infants: microcephaly may substitute for the domain criteria)\n\n**FASD without sentinel facial features:**\n• Confirmed prenatal alcohol exposure (reliable evidence essential)\n• Severe impairment in ≥3 of the 10 neurodevelopmental areas\n\nSevere impairment = a global score or major subdomain score ≥2 standard deviations below the mean on a standardised measure.\n\nGenetic causes must be considered and excluded before diagnosis." },

  // 10 DOMAINS
  { tags:['domain','area','assessment','10','ten','neuro','brain'],
    answer:"**The 10 SIGN 156 Neurodevelopmental Areas of Assessment**\n\nSevere impairment in 3 or more of these areas = pervasive brain dysfunction:\n\n1. **Brain structure / Neuroanatomy / Neurophysiology** (e.g. microcephaly, corpus callosum agenesis)\n2. **Motor skills** (fine/gross motor, coordination, graphomotor)\n3. **Cognition** (IQ, processing, reasoning)\n4. **Language** (receptive and expressive)\n5. **Academic achievement** (reading, maths, writing)\n6. **Memory** (verbal and visual memory)\n7. **Attention** (sustained/selective attention — NOT impulse control)\n8. **Executive function** (impulse control, hyperactivity, working memory, planning, flexibility)\n9. **Affect regulation** (long-standing emotional dysregulation, anxiety, mood disorders)\n10. **Adaptive behaviour, social skills & social communication**\n\nNote: Affect regulation impairment must be long-standing and not solely attributable to adverse life events (e.g. multiple foster placements). *(SIGN 156, Section 3.4)*" },

  // PAE CONFIRMATION
  { tags:['alcohol','pregnancy','exposure','pae','confirm','history','drinking'],
    answer:"**How is prenatal alcohol exposure confirmed?**\n\nPer SIGN 156 Recommendation 2.2, confirmation of PAE requires documentation that the biological mother consumed alcohol during the pregnancy based on:\n• Reliable clinical observation\n• Self-report or reports by a reliable source\n• Medical records documenting positive blood alcohol concentrations\n• Alcohol treatment or other social, legal, or medical problems related to drinking during the pregnancy\n\nUnsubstantiated information, lifestyle alone, other drug use, or history of alcohol in previous pregnancies **cannot in isolation** confirm PAE in the index pregnancy.\n\n**Key point:** When all three sentinel facial features are present, PAE confirmation is NOT required — the features alone have sufficient specificity.\n\nWhere facial features are absent, reliable PAE evidence is essential for the FASD without SFF diagnosis.\n\nFor screening in pregnancy, SIGN 156 recommends: **T-ACE, TWEAK, or AUDIT-C** tools, with consideration of biomarkers (CDT, PEth)." },

  // NICE QS204
  { tags:['nice','qs204','quality','standard','england','wales','statement'],
    answer:"**NICE QS204 — The Five Quality Statements**\n\nNICE Quality Standard QS204 (March 2022) applies in England and Wales and sets out what high-quality FASD care looks like:\n\n**QS1** — Pregnant women are advised throughout pregnancy not to drink alcohol (UK CMO guidance)\n\n**QS2** — Alcohol use is asked about and recorded throughout pregnancy\n\n**QS3** — Children with probable prenatal alcohol exposure and significant physical, developmental, or behavioural difficulties are **referred for assessment**\n\n**QS4** — Children with confirmed PAE or all 3 sentinel facial features have a **neurodevelopmental assessment** if there are clinical concerns\n\n**QS5** — Children with a diagnosis of FASD have an **individualised management plan**\n\nImportant: NICE QS204 is based on and adopts the SIGN 156 diagnostic framework. Support should not wait for a formal diagnosis." },

  // PARENTS CONCERNED
  { tags:['parent','carer','worried','concerned','suspect','think my child','what do i','help','refer','gp'],
    answer:"**What should parents do if they are concerned?**\n\n**Step 1 — Talk to your GP or health visitor.** Share your concerns clearly. You do not need confirmed alcohol exposure — probable PAE with significant difficulties is enough to request a referral (NICE QS3).\n\n**Step 2 — Ask for a referral to a paediatrician.** Request specifically that prenatal alcohol exposure is considered as a possible cause of your child's difficulties.\n\n**Step 3 — Request an FASD-informed MDT assessment.** This involves a paediatrician, psychologist, speech and language therapist, and occupational therapist.\n\n**Step 4 — Don't wait for diagnosis to ask for support.** Schools can put interim strategies in place while assessment is pending. NICE QS204 is clear: support must not wait for a formal diagnosis.\n\n**Step 5 — Contact National FASD** (nationalfasd.org.uk) for peer support, guidance, and signposting to local services.\n\nYou are not alone. An early diagnosis is one of the most protective factors for long-term outcomes." },

  // TEACHERS CONCERNED
  { tags:['teacher','school','senco','educator','classroom','concern','refer'],
    answer:"**What should teachers do if they are concerned?**\n\n**Step 1** — Speak sensitively to the child's parent or carer. Ask open questions about history, health, and any known concerns.\n\n**Step 2** — Refer to the school's **SENCO** (Special Educational Needs Coordinator). They can coordinate support, initiate an EHCP assessment, and liaise with external specialists.\n\n**Step 3** — Where there are significant concerns with probable PAE, a health referral should be made via the school nurse, health visitor, or safeguarding lead (NICE QS3).\n\n**Step 4** — Implement interim classroom strategies now — do not wait for a diagnosis. Key strategies include: one instruction at a time, visual timetables, movement breaks, seating near the teacher, no copying from the board, calm-down space, and avoiding punitive responses to regulation difficulties.\n\n**Step 5** — Teachers are valued members of the MDT (SIGN 156, Section 3.7). Provide written school reports and behaviour observations when requested.\n\n**Remember:** Inconsistency in performance is neurological, not deliberate. A child performing well one day and struggling the next is a hallmark of FASD." },

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
    answer:"**What happens after an FASD diagnosis?**\n\nPer NICE QS5 and SIGN 156 Section 4, every child diagnosed with FASD must have an **individualised management plan** covering:\n\n• Immediate and longer-term therapy needs (SLT, OT, psychology, CAMHS)\n• School adjustments and EHCP/IEP coordination\n• Family psychoeducation and support\n• Signposting to local and national resources\n• Regular review schedule\n• Reassessment at all transition stages (new class, secondary school, adulthood)\n\n**Ask your paediatrician to:**\n• Share the plan with school, health visitor, and all involved professionals\n• Schedule a review within a specified timeframe\n• Link your family to FASD support organisations\n\nFASD is a lifelong condition. The management plan should evolve as your child grows. SIGN 156 emphasises that reassessment and care plan revision are particularly important at transition stages.\n\nContact **National FASD** (nationalfasd.org.uk) for resources after diagnosis." },

  // COOCCURRING
  { tags:['adhd','autism','asd','comorbid','anxiety','mental health','condition','together','also'],
    answer:"**FASD and co-occurring conditions**\n\nFASD is associated with over 400 co-occurring conditions across 18 ICD-10 chapters. Over 90% of individuals with FASD have at least one co-occurring condition.\n\nMost commonly seen alongside FASD:\n• **ADHD** — frequently the first diagnosis given; medication response may be atypical\n• **Autism spectrum features** — social communication difficulties overlap\n• **Anxiety disorders** — extremely common\n• **Depression** — particularly in adolescence and adulthood\n• **Sleep disorders**\n• **Attachment disorders** — especially in children in care\n• **Conduct disorder / ODD**\n• **Substance misuse** in adolescence/adulthood\n\n**Important:** A child with ADHD that is not responding as expected to medication, or whose presentation is broader than ADHD alone, should be assessed for FASD. The two conditions can and do coexist, but FASD requires its own specific support strategies.\n\nTreat the whole child. Comorbid conditions need their own diagnosis and management plan alongside FASD." },

  // PREVENTION
  { tags:['prevent','safe','drink','alcohol','pregnancy','safe amount','no safe'],
    answer:"**Preventing FASD**\n\nFASD is entirely preventable. The UK Chief Medical Officers' guidance is clear:\n\n*'If you are pregnant or think you could become pregnant, the safest approach is not to drink alcohol at all, to keep risks to your baby to a minimum.'*\n\nThere is **no known safe level, safe type, or safe time** during pregnancy to drink alcohol. The developing brain is vulnerable throughout all trimesters.\n\nIf you find out you are pregnant after drinking during early pregnancy:\n• Stop drinking now\n• In most cases, the risk to the baby is likely to be low from small amounts\n• Talk to your GP or midwife if you are worried\n\nFor clinicians: SIGN 156 recommends screening all pregnant women using **T-ACE, TWEAK, or AUDIT-C** tools. Women drinking above the low-risk guideline should be offered brief interventions.\n\n*(UK CMO Low Risk Drinking Guidelines; SIGN 156)*" },

  // AT RISK
  { tags:['at risk','not sure','young baby','infant','too young','incomplete'],
    answer:"**'At risk for neurodevelopmental disorder and FASD' — what does this mean?**\n\nThis designation (SNOMED CT: 2078801000000102) is used for children who:\n• Have confirmed prenatal alcohol exposure\n• Do not yet meet the full CNS criteria for an FASD diagnosis (e.g. too young for complete assessment)\n• Show some indication of neurodevelopmental concern\n\nIt is **not a diagnosis** — it is a formal designation ensuring the child is monitored and supported while awaiting a more comprehensive assessment as they grow.\n\nPer SIGN 156, this designation:\n• Should never be used when PAE is confirmed absent\n• Should be recorded and available to all professionals involved in developmental surveillance\n• Should prompt referral to a clinical geneticist if all 3 sentinel features are present but no microcephaly\n• Should lead to re-assessment when the child is older\n\nNICE QS204 is explicit: **support must not wait for a formal diagnosis.** Children designated 'at risk' should receive early intervention and monitoring." },

  // FOSTER / ADOPTION
  { tags:['foster','adopt','care','kinship','looked after','unknown history','birth mother'],
    answer:"**FASD in children in foster care, kinship care, or adoption**\n\nChildren in care are at significantly higher risk of FASD:\n• Birth history and PAE history may be unknown\n• SIGN 156 specifically lists 'child in foster/kinship/adoptive care with unknown birth history' as a key screening trigger\n• Multiple placement breakdowns and school exclusions are common secondary consequences of undiagnosed FASD\n\n**What to do:**\n• Unknown birth history alone is sufficient reason to consider FASD in a child with developmental or behavioural difficulties\n• Request a referral for FASD assessment — you do not need a confirmed alcohol history\n• All 3 sentinel facial features present = PAE confirmation not required\n• Significant difficulties + probable PAE = sufficient for NICE QS3 referral\n\n**Carers:** Many foster and adoptive carers carry the family history of the birth mother and are uniquely placed to provide PAE information. Your input is invaluable to the MDT assessment.\n\nContact **National FASD** (nationalfasd.org.uk) for carer-specific resources and support groups." },
];

function findAnswer(query) {
  const q = query.toLowerCase();
  let best = null, bestScore = 0;
  FAQ_KB.forEach(item => {
    let score = 0;
    item.tags.forEach(tag => { if(q.includes(tag)) score += tag.length; });
    if(score > bestScore) { bestScore = score; best = item; }
  });
  if(bestScore > 0) return best.answer;
  // Fallback
  return "That's a great question. I don't have a specific answer for that in my knowledge base, but here's where to find help:\n\n• **For general FASD information:** The content throughout this app covers most topics in depth — browse the Overview, Clinicians, Parents, and Teachers tabs\n• **For personal support:** Contact **National FASD** at nationalfasd.org.uk or call their helpline\n• **For clinical questions:** Your GP, paediatrician, or neurodevelopmental service can provide advice specific to your child\n• **For diagnosis:** A referral to a specialist FASD MDT is the most important step\n\nIs there something more specific I can try to help with?";
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

  appendMsg('user', text);
  showTyping();

  // Simulate brief thinking delay for natural feel
  setTimeout(() => {
    removeTyping();
    const reply = findAnswer(text);
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
  let html = text
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/^• /gm,'• ')
    .replace(/\n/g,'<br>');
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
