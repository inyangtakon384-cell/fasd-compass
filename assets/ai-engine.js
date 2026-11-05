// FASD Compass AI engine. v1.2.10
// Runs entirely in the browser. No network requests, no storage.
// Needs assets/ai-kb.js loaded first. The same file is used by the tests and by the
// optional live AI worker, so the safety checks are identical everywhere.
(function (root) {
const KB = root.FASD_KB || (typeof require !== 'undefined' ? require('./ai-kb.js').KB : []);
const SUGGESTIONS = root.FASD_SUGGESTIONS || (typeof require !== 'undefined' ? require('./ai-kb.js').SUGGESTIONS : {});
const AUDIENCES = ['parent', 'teacher', 'clinician'];

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
// Phrases about alcohol or drug misuse. These describe the cause of FASD, not harm to a child,
// so they are removed before the safeguarding check. Other safeguarding words still apply.
const MISUSE_PHRASES = /\b(?:alcohol|substance|drug|drugs|solvent|drink|drinking)[ -](?:ab|mis)use\b|\b(?:ab|mis)use of (?:alcohol|drugs?|substances?)\b/g;
const EMERGENCY_PATTERNS = [/not breathing/, /unconscious/, /won'?t wake/, /seizure (?:now|right now|happening)/, /swallowed/, /choking/, /collapsed/];

const URGENT_HELP_LINK = 'More help: fasdcompass.co.uk/urgent-help/';
const REPLY_CRISIS = "**I'm sorry you are dealing with this. Please get help from a person now.**\n\n• **If someone is in immediate danger or has seriously hurt themselves, call 999** or go to A&E.\n• **For urgent advice, call NHS 111.** In Northern Ireland, contact your GP or the GP out-of-hours service.\n• **Samaritans:** call 116 123, free, any time of day or night.\n• **Shout:** text SHOUT to 85258, free and 24 hours.\n• **Childline (for children and young people):** call 0800 1111.\n\nIf your child is already known to a mental health team (CAMHS), contact them too.\n\nI'm an information tool and can't help in an emergency. You don't have to manage this on your own.\n\n" + URGENT_HELP_LINK;
const REPLY_SAFEGUARDING = "**If you are worried a child is being harmed, please tell someone who can act.**\n\n• **If a child is in immediate danger, call 999.**\n• **If you work in a school or service,** tell your Designated Safeguarding Lead today and follow your safeguarding procedures.\n• **Contact the local council's children's services** where the child lives. You can find them at gov.uk/report-child-abuse-to-local-council.\n• **NSPCC Helpline (adults worried about a child):** call 0808 800 5000, Monday to Friday 10am to 4pm, or email help@nspcc.org.uk.\n• **Childline (for children and young people):** call 0800 1111.\n\nPlease don't share names or details here. I'm an information tool, and I can't pass on concerns or act on them.\n\n" + URGENT_HELP_LINK;
const REPLY_EMERGENCY = "**This sounds like an emergency. Call 999 now.**\n\nIf it is less urgent, call NHS 111 for advice. I'm an information tool and can't give emergency medical help.\n\n" + URGENT_HELP_LINK;

// ─── PERSONAL DETAILS ───
// Words that can follow "my son" etc. but are not names.
const NOT_NAMES = new Set(('i he she they it we you this that who which what when where why how is has was were are am be been being does did do doesn doesn\'t didn\'t can can\'t cannot won\'t will would should could may might must keeps keep kept gets got goes went says said ' +
  'always never often just also still sometimes now then usually constantly really actually literally definitely probably generally frequently regularly even only mostly currently apparently clearly suddenly rarely seldom barely hardly totally completely simply certainly honestly basically normally typically recently finally already ever too so very well and or but if because since aged age year years old who\'s ' +
  'forgets forgot struggles struggled finds found seems seemed likes loves hates refuses won wont cant isn isn\'t wasn\'t hasn\'t has\'t had having lies steals hits screams cries runs takes took needs needed wants wanted').split(' '));
const NAME_STOP_CAPS = new Set(['I', 'He', 'She', 'They', 'It', 'This', 'That', 'We', 'You', 'My', 'Our', 'His', 'Her', 'Their', 'Who', 'What', 'When', 'Where', 'Why', 'How', 'Year', 'Stage', 'Key', 'Step', 'Section', 'Statement', 'Page', 'Age', 'Aged', 'Under', 'Over', 'About', 'Around', 'Only', 'Just', 'Now', 'Since', 'Sign', 'Nice', 'Fasd', 'Adhd', 'Then', 'There', 'Here', 'And', 'But', 'Mum', 'Dad', 'Mummy', 'Daddy', 'Nan', 'Grandma', 'Grandad', 'Miss', 'Sir', 'Mrs', 'Mr', 'Ms', 'Dr']);
const REL = '(?:son|daughter|child|boy|girl|grandson|granddaughter|niece|nephew|pupil|student|patient|stepson|stepdaughter|foster (?:son|daughter|child)|adopted (?:son|daughter|child)|little one|toddler|baby|teenager)';
const PII_PATTERNS = [
  { re: /\b\d{3}[ -]?\d{3}[ -]?\d{4}\b/g, label: 'NHS number' },
  { re: /\b(?:0|\+44 ?)7\d{3}[ -]?\d{3}[ -]?\d{3}\b/g, label: 'phone number' },
  { re: /\b0\d{2,4}[ -]?\d{3,4}[ -]?\d{3,4}\b/g, label: 'phone number' },
  { re: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, label: 'email address' },
  { re: /\b(?:0?[1-9]|[12]\d|3[01])[\/.-](?:0?[1-9]|1[0-2])[\/.-](?:19|20)?\d{2}\b/g, label: 'date of birth' },
  { re: /\b(?:dob|d\.o\.b\.?|date of birth|born on)\b[:\s]*\d{1,2}(?:st|nd|rd|th)?[\s\/.-]+[a-z0-9]+[\s\/.-]+\d{2,4}/gi, label: 'date of birth' },
  { re: /\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b/gi, label: 'postcode' },
  { re: /\b(?:my (?:son|daughter|child|grandson|granddaughter|pupil|patient)(?:'s name)? is|(?:he|she) is called|named|called) ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/g, label: 'name', group: 1 },
  // "my daughter Lily", "my son, Jack Smith,"
  { re: new RegExp('\\b[Mm]y ' + REL + ',? ([A-Z][a-z]+(?: [A-Z][a-z]+)?)\\b', 'g'), label: 'name', group: 1, caps: true },
  // "my son jack forgets..." (lower case). Only when the next word is not an everyday word.
  { re: new RegExp('\\bmy ' + REL + ',? ([a-z]{2,})\\b(?=,? (?:is|was|has|had|keeps|kept|gets|got|forgets|forgot|struggles|finds|loses|lost|hits|kicks|bites|screams|shouts|cries|runs|lies|steals|takes|took|refuses|won\'t|can\'t|cannot|doesn\'t|didn\'t|isn\'t|wasn\'t|never|always|often|still|really|just|also|seems|goes|went|says|said|wakes|sleeps|eats|needs|aged|age|who)\\b)', 'gi'), label: 'name', group: 1, lower: true },
  // "Lily is 7", "Lily, aged 7", "Lily (7)"
  { re: /\b([A-Z][a-z]{2,})(?:,? (?:is|was|turned|has just turned|aged|age) | \()(\d{1,2})\b/g, label: 'name', group: 1, caps: true }
];
function redactPII(text) {
  const found = new Set(); let out = String(text);
  PII_PATTERNS.forEach(p => {
    out = out.replace(p.re, (m, g1) => {
      if (p.group && g1) {
        const first = g1.split(' ')[0];
        if (p.caps && NAME_STOP_CAPS.has(first)) return m;
        if (p.lower && (NOT_NAMES.has(first.toLowerCase()) || /(?:s|ed|ing|ly|n't)$/i.test(first) || NAME_STOP_CAPS.has(first))) return m;
        found.add(p.label);
        const i = m.lastIndexOf(g1);
        return m.slice(0, i) + '[name removed]' + m.slice(i + g1.length);
      }
      found.add(p.label);
      return '[' + p.label + ' removed]';
    });
  });
  return { text: out, found: [...found] };
}
const PII_NOTICE = "**Please don't share personal details here,** such as names, dates of birth, NHS numbers, addresses or phone numbers. I've hidden what I spotted. Nothing you type is stored or sent anywhere, but it is safer to keep questions general.\n\n";

const QUIZ_PATTERNS = [/(?:questionnaire|quiz|screening tool|checklist|concerns guide|test|result)s?.{0,40}(?:mean|confirm|show|prove|tell|diagnos|rule out|say)/, /(?:does|do|can|will) (?:the |my |this )?(?:questionnaire|quiz|screening|checklist|result|score).{0,40}(?:have|has|got) fasd/, /(?:high|low|moderate) (?:concern|score|risk)/];
const REPLY_QUIZ = "**No. The questionnaire cannot confirm or rule out FASD.**\n\nIt is a checklist to help you notice developmental concerns and get ready to talk to a professional. It has not been validated as a screening or diagnostic tool, and it does not give a risk score.\n\nOnly a full multidisciplinary assessment can diagnose FASD, following SIGN 156. Many things can cause similar difficulties, and some children have more than one condition.\n\nIf you have concerns, take the summary from the questionnaire to your GP or health visitor. The **Before You See the GP** checklist can help you prepare.\n\n**Read more:** fasdcompass.co.uk/screening-tool/";

// Requests to judge an individual: answered generally, with a clear statement first.
const INDIVIDUAL_PATTERNS = [/\b(?:does|has|could|might|will|would|is) (?:my|our|this|the) (?:son|daughter|child|boy|girl|pupil|student|patient|grandson|granddaughter|baby|toddler)\b.{0,30}\b(?:have|got|be|has)\b.{0,10}\bfasd\b/, /\b(?:does|has|could) (?:he|she|they) (?:have|got) fasd\b/, /\bis it fasd\b/, /\bdoes (?:that|this|it) mean (?:he|she|they|my \w+) (?:has|have|might have|could have) fasd\b/, /\bwhat are the chances\b|\bhow likely\b|\bwhat is the risk\b|\bpercentage chance\b/];
const REPLY_INDIVIDUAL_PREFIX = "**I can't tell whether an individual child has FASD.** Only a full assessment by a qualified team can do that, and many different things can cause the same difficulties. I also can't estimate a child's risk. Here is some general information that may help.\n\n";

function normalise(raw) { return String(raw).toLowerCase().replace(/[’‘]/g, "'"); }

function safetyReply(q) {
  if (EMERGENCY_PATTERNS.some(r => r.test(q))) return { kind: 'emergency', text: REPLY_EMERGENCY };
  if (CRISIS_PATTERNS.some(r => r.test(q))) return { kind: 'crisis', text: REPLY_CRISIS };
  const sq = q.replace(MISUSE_PHRASES, ' ');
  if (SAFEGUARDING_PATTERNS.some(r => r.test(sq))) return { kind: 'safeguarding', text: REPLY_SAFEGUARDING };
  return null;
}

// ─── MATCHING ───
const STOP = new Set(['what', 'is', 'how', 'help', 'the', 'my', 'a', 'and', 'or', 'of', 'to', 'in', 'for', 'fasd', 'child', 'with']);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const TAG_RE = new Map();
function tagRe(tag) {
  if (!TAG_RE.has(tag)) TAG_RE.set(tag, new RegExp('(?:^|[^a-z])' + esc(tag)));
  return TAG_RE.get(tag);
}
function scoreAll(query, audience) {
  const q = normalise(query);
  return KB.map(item => {
    let score = 0, hits = 0;
    item.tags.forEach(tag => {
      if (STOP.has(tag)) return;
      if (tagRe(tag).test(q)) { hits++; score += tag.includes(' ') ? Math.round(tag.length * 1.5) : Math.max(tag.length, 4); }
    });
    // Asking the example question itself always finds its answer.
    if (normalise(item.q).replace(/[?."]/g, '') === q.trim().replace(/[?."]/g, '')) score += (audience && item.aud && !item.aud.includes(audience)) ? 10 : 100;
    if (score > 0 && audience && item.aud) score = item.aud.includes(audience) ? score + 6 : Math.round(score * 0.7);
    return { item, score, hits };
  }).sort((a, b) => b.score - a.score);
}

const LINE_GENERAL = {
  parent: 'This is general information, not advice about your child.',
  teacher: 'This is general information, not advice about an individual pupil.',
  clinician: 'This is general education, not advice about an individual patient. Check the full guideline before making clinical decisions.'
};
function render(item, audience) {
  const a = AUDIENCES.includes(audience) ? audience : 'parent';
  let t = item.answer;
  if (item.unc) t += '\n\n**How sure is this?** ' + item.unc;
  t += '\n\n**Source:** ' + item.src + '\n**Read more:** fasdcompass.co.uk/' + item.page + '/';
  t += '\n\n' + LINE_GENERAL[a];
  return t;
}

const FALLBACK = "I don't have an answer to that in my FASD information yet. I can only answer general questions about FASD, and I can't give advice about an individual child.\n\n• **For your child's health:** speak to your GP, health visitor or school nurse.\n• **For FASD support:** National FASD runs a helpline and has information at nationalfasd.org.uk.\n• **For school support:** talk to the school SENCO.\n\nTry asking in a different way, or choose one of the example questions.";
const NEAR_MISS = "I don't have an answer that matches your question exactly. These topics might be close. Choose one, or try asking in a different way.";

function findAnswer(query, audience) {
  const ranked = scoreAll(query, audience);
  const best = ranked[0];
  const second = ranked[1] ? ranked[1].score : 0;
  if (best && (best.score >= 8 || (best.score >= 5 && second * 2 <= best.score))) return { kind: 'answer', id: best.item.id, item: best.item, text: render(best.item, audience) };
  const near = ranked.filter(r => r.score > 0).slice(0, 3).map(r => r.item);
  if (near.length) return { kind: 'near', text: NEAR_MISS, options: near.map(i => i.q), ids: near.map(i => i.id) };
  return { kind: 'fallback', text: FALLBACK };
}

// Full reply with details for the page. respond() returns only the text.
function respondFull(raw, audience) {
  const q = normalise(raw);
  const safe = safetyReply(q);
  if (safe) return safe;
  const pii = redactPII(raw);
  const prefix = pii.found.length ? PII_NOTICE : '';
  if (QUIZ_PATTERNS.some(r => r.test(q))) return { kind: 'quiz', text: prefix + REPLY_QUIZ, redacted: pii.text };
  const ind = INDIVIDUAL_PATTERNS.some(r => r.test(q)) ? REPLY_INDIVIDUAL_PREFIX : '';
  let r = findAnswer(pii.text, audience);
  if (ind && r.kind !== 'answer') {
    const item = KB.find(i => i.id === (audience === 'clinician' ? 'diagnosis' : 'diagnosis-plain'));
    r = { kind: 'answer', id: item.id, item, text: render(item, audience) };
  }
  r.text = prefix + ind + r.text;
  r.redacted = pii.text;
  return r;
}
function respond(raw, audience) { return respondFull(raw, audience).text; }

const api = { KB, SUGGESTIONS, AUDIENCES, respond, respondFull, redactPII, safetyReply, findAnswer, scoreAll, render, normalise,
  REPLY_CRISIS, REPLY_SAFEGUARDING, REPLY_EMERGENCY, FALLBACK, LINE_GENERAL };
root.FASDAI = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis);
