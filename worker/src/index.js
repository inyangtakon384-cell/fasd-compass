// FASD Compass live AI service (Cloudflare Worker). v1.2.10
// SWITCHED OFF by default: LIVE_AI_ENABLED must be "true" in the Worker settings.
// This service:
//  - accepts requests only from fasdcompass.co.uk
//  - runs the same safety checks and redaction as the website, again, on the server
//  - never sends crisis, safeguarding, emergency or questionnaire questions to the model
//  - gives the model only approved FASD Compass passages and tells it to use nothing else
//  - checks the reply and blocks it if it breaks a rule
//  - does not log or store questions or answers
import '../../assets/ai-kb.js';
import '../../assets/ai-engine.js';

const AI = globalThis.FASDAI;
const ALLOWED_ORIGINS = ['https://fasdcompass.co.uk', 'https://www.fasdcompass.co.uk'];
const MAX_BODY = 4000;
const MAX_QUESTION = 500;
const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const DEFAULT_DAILY_CAP = 300;
const AUDIENCE_TEXT = {
  parent: 'parents and carers. Use plain, warm, everyday language and avoid medical terms where possible',
  teacher: 'teachers and SENCOs. Focus on practical classroom support and school processes',
  clinician: 'clinicians. You may use clinical terms and should name the guideline section where the passage gives it'
};
const LINK_ALLOW = ['fasdcompass.co.uk', 'nationalfasd.org.uk', 'nhs.uk', 'gov.uk', 'nice.org.uk', 'sign.ac.uk', 'samaritans.org', 'childline.org.uk', 'nspcc.org.uk', 'ipsea.org.uk', 'fasd.me'];
const SAFE_NUMBERS = ['999', '111', '116123', '85258', '08001111', '08088005000'];

function corsHeaders(origin) {
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin' };
  if (ALLOWED_ORIGINS.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type';
    h['Access-Control-Max-Age'] = '86400';
  }
  return h;
}
const json = (obj, status, origin) => new Response(JSON.stringify(obj), { status, headers: corsHeaders(origin) });

export function systemPrompt(audience) {
  return [
    'You are FASD Compass AI, an education assistant on a UK website about Fetal Alcohol Spectrum Disorder (FASD).',
    'Answer ONLY from the approved passages in the user message. Rules:',
    '1. Use only facts that are in the passages. If the passages do not answer the question, reply with exactly NO_ANSWER and nothing else.',
    '2. Cite each passage you use with its label in square brackets, for example [S1].',
    '3. Never say or suggest that a particular person has, probably has, may have or does not have FASD. Never give a risk, chance, percentage or score for an individual.',
    '4. Never assume a child was exposed to alcohol because of their care history, adoption, family or social circumstances.',
    '5. Do not say that a behaviour or difficulty is caused by FASD. Say that difficulties can have many causes.',
    '6. Do not blame parents, carers or birth mothers.',
    '7. Do not ask for, or repeat, names, dates of birth, addresses or other personal details.',
    '8. If the question suggests anyone may be in danger or at risk of harm, say only: "Please call 999 if anyone is in immediate danger." and stop.',
    '9. Say clearly when the passages say evidence is limited or uncertain.',
    '10. For advice about an individual, suggest speaking to the GP, health visitor, SENCO or the child\'s clinician.',
    '11. Do not include web links or phone numbers that are not in the passages. Do not give medicine names or doses.',
    '12. Write in British English for ' + (AUDIENCE_TEXT[audience] || AUDIENCE_TEXT.parent) + '. Keep it under 250 words. Use short paragraphs, or bullet points that start with "• ". Do not use headings or tables.'
  ].join('\n');
}

function plain(t) { return String(t).replace(/\*\*/g, ''); }

export function retrieve(question, audience, ids) {
  const picked = [];
  const add = item => { if (item && !picked.includes(item) && picked.length < 3) picked.push(item); };
  (Array.isArray(ids) ? ids : []).slice(0, 3).forEach(id => add(AI.KB.find(i => i.id === id)));
  AI.scoreAll(question, audience).filter(r => r.score >= 5).forEach(r => add(r.item));
  return picked;
}

export function buildMessages(question, audience, passages) {
  const ctx = passages.map((p, i) => `[S${i + 1}] ${p.q}\n${plain(p.answer)}${p.unc ? '\nHow sure is this: ' + p.unc : ''}\nSource: ${p.src}`).join('\n\n');
  return [
    { role: 'system', content: systemPrompt(audience) },
    { role: 'user', content: `Approved passages:\n\n${ctx}\n\nQuestion: ${question}` }
  ];
}

// ─── OUTPUT CHECKS ───
const NEG = /\b(?:not|cannot|can't|can not|never|no one|doesn't|does not|won't|unable to|isn't)\b[^.]{0,40}$/;
const RULES = [
  ['diagnosis', /\b(?:your|the|this|that) (?:child|son|daughter|pupil|student|patient|baby|boy|girl)(?: probably| likely| definitely| clearly| may| might| could)? (?:has|have|does have|doesn't have|does not have|hasn't got|has got) fasd\b/],
  ['diagnosis', /\b(?:he|she|they|you)(?: probably| likely| definitely| clearly| may| might| could)? (?:has|have|does have|doesn't have|does not have) fasd\b/],
  ['diagnosis', /\b(?:sounds like|consistent with|suggests|indicates|is likely to be|is probably) fasd\b/],
  ['diagnosis', /\b(?:confirms?|rules? out|excludes?) (?:fasd|a diagnosis|the diagnosis)\b/, true],
  ['risk', /\b\d{1,3} ?(?:%|per ?cent)[^.]{0,25}\b(?:chance|risk|likely|likelihood|probability)\b/],
  ['risk', /\b(?:chance|risk|likelihood|probability) (?:is|of)\b[^.]{0,30}\b\d{1,3} ?(?:%|per ?cent)/],
  ['risk', /\b(?:high|low|moderate|significant) (?:risk|chance|likelihood) (?:of|that)\b[^.]{0,30}\bfasd\b/],
  ['risk', /\b(?:risk|concern) score\b/, true],
  ['blame', /\b(?:your|her|the mother's|the birth mother's|mum's) fault\b/, true],
  ['blame', /\bshould have (?:known|stopped|avoided)\b|\birresponsible\b|\bselfish\b|\bnegligen/],
  ['attribution', /\b(?:all|every|everything)\b[^.]{0,30}\b(?:is|are) (?:caused by|because of|due to|explained by) (?:fasd|alcohol)\b/],
  ['attribution', /\b(?:this|that|these|those|his|her|their|your child's) (?:behaviou?rs?|difficult(?:y|ies)|problems?|meltdowns?|lying|stealing)\b[^.]{0,15}\b(?:is|are) (?:caused by|because of|due to) (?:fasd|alcohol)\b/],
  ['care-inference', /\b(?:because|since|as) (?:he|she|they|your child|the child)\b[^.]{0,20}\b(?:in care|adopted|fostered|looked after)\b[^.]{0,40}\b(?:exposed|exposure|fasd)\b/],
  ['dose', /\b\d+(?:\.\d+)? ?(?:mg|mcg|micrograms?|milligrams?|ml)\b/],
  ['personal-data', /\b(?:what is|tell me|share|send me|give me) (?:your|his|her|their|the child's|your child's|your son's|your daughter's) (?:full )?(?:name|date of birth|address|nhs number|postcode)\b/]
];
function urlsIn(t) { return t.match(/\b(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+(?:co\.uk|org\.uk|gov\.uk|nhs\.uk|ac\.uk|org|com|net|uk|me|io|ai)\b(?:\/\S*)?/gi) || []; }
function hostAllowed(u) {
  const host = u.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  return LINK_ALLOW.some(a => host === a || host.endsWith('.' + a));
}

export function checkOutput(text, passages) {
  const problems = [];
  const t = String(text || '');
  const low = t.toLowerCase().replace(/[’‘]/g, "'");
  if (!t.trim()) problems.push('empty');
  if (t.length > 3000) problems.push('too-long');
  for (const [name, re, allowNeg] of RULES) {
    const g = new RegExp(re.source, 'g');
    let m;
    while ((m = g.exec(low))) {
      const before = low.slice(Math.max(0, m.index - 60), m.index);
      if (allowNeg && NEG.test(before)) continue;
      if (name === 'diagnosis' && /\b(?:does|do|can|could|might|whether|if)\b[^.]{0,10}$/.test(before)) continue; // a question, not a claim
      problems.push(name); break;
    }
  }
  for (const u of urlsIn(t)) if (!hostAllowed(u)) { problems.push('link'); break; }
  const allowedNums = new Set(SAFE_NUMBERS);
  passages.forEach(p => (plain(p.answer + ' ' + (p.unc || '') + ' ' + p.src).match(/\d[\d ]{2,}\d/g) || []).forEach(n => allowedNums.add(n.replace(/\D/g, ''))));
  for (const n of (t.match(/\b\d[\d ]{4,}\d\b/g) || [])) {
    const d = n.replace(/\D/g, '');
    if (d.length >= 5 && !allowedNums.has(d) && !/^(?:19|20)\d\d$/.test(d)) { problems.push('number'); break; }
  }
  const cited = [...new Set((t.match(/\[S(\d)\]/g) || []).map(x => +x.replace(/\D/g, '')))].filter(i => i >= 1 && i <= passages.length);
  if (!cited.length) problems.push('no-citation');
  return { ok: problems.length === 0, problems: [...new Set(problems)], cited };
}

export function finish(text, passages, cited, audience) {
  let body = String(text).replace(/\s*\[S\d\](?:\s*\[S\d\])*/g, '').replace(/\s*—\s*/g, ', ').trim();
  const used = cited.map(i => passages[i - 1]);
  body += '\n\n**Based on:** ' + used.map(p => p.src).join('. ');
  body += '\n**Read more:** ' + [...new Set(used.map(p => 'fasdcompass.co.uk/' + p.page + '/'))].join(' ');
  body += '\n\n' + (AI.LINE_GENERAL[audience] || AI.LINE_GENERAL.parent);
  return body;
}

function modelText(r) {
  if (!r) return '';
  if (typeof r === 'string') return r;
  if (typeof r.response === 'string') return r.response;
  if (r.choices && r.choices[0] && r.choices[0].message) return r.choices[0].message.content || '';
  if (typeof r.output_text === 'string') return r.output_text;
  return '';
}

async function underDailyCap(env) {
  if (!env.USAGE) return true; // optional KV namespace. Without it, rely on the account spending limit.
  const key = 'count:' + new Date().toISOString().slice(0, 10);
  const n = parseInt(await env.USAGE.get(key) || '0', 10);
  const cap = parseInt(env.DAILY_CAP || DEFAULT_DAILY_CAP, 10);
  if (n >= cap) return false;
  await env.USAGE.put(key, String(n + 1), { expirationTtl: 172800 });
  return true;
}

export async function handle(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (request.method === 'OPTIONS') return new Response(null, { status: ALLOWED_ORIGINS.includes(origin) ? 204 : 403, headers: corsHeaders(origin) });
  if (!ALLOWED_ORIGINS.includes(origin)) return json({ ok: false, error: 'origin' }, 403, origin);
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405, origin);
  if (String(env.LIVE_AI_ENABLED) !== 'true') return json({ ok: false, error: 'disabled' }, 503, origin);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'too-large' }, 413, origin);
  let body; try { body = JSON.parse(raw); } catch (e) { return json({ ok: false, error: 'bad-json' }, 400, origin); }
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  if (!question || question.length > MAX_QUESTION) return json({ ok: false, error: 'bad-question' }, 400, origin);
  const audience = AI.AUDIENCES.includes(body.audience) ? body.audience : 'parent';

  if (env.RATE_LIMITER) {
    const { success } = await env.RATE_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') || 'anon' });
    if (!success) return json({ ok: false, error: 'rate' }, 429, origin);
  }

  // Safety first, on the server too. These never reach the model.
  const local = AI.respondFull(question, audience);
  if (['emergency', 'crisis', 'safeguarding', 'quiz'].includes(local.kind)) return json({ ok: true, ai: false, kind: local.kind, text: local.text }, 200, origin);

  const clean = AI.redactPII(question).text;
  const passages = retrieve(clean, audience, body.ids);
  if (!passages.length) return json({ ok: true, ai: false, kind: 'no-passages', text: AI.FALLBACK }, 200, origin);

  if (!(await underDailyCap(env))) return json({ ok: false, error: 'daily-cap' }, 503, origin);

  let out;
  try {
    const r = await env.AI.run(env.MODEL || DEFAULT_MODEL, { messages: buildMessages(clean, audience, passages), max_tokens: 600, temperature: 0.2 });
    out = modelText(r).trim();
  } catch (e) {
    return json({ ok: false, error: 'model' }, 502, origin);
  }
  if (!out || /^NO_ANSWER\b/.test(out) || out.includes('NO_ANSWER')) {
    return json({ ok: true, ai: false, kind: 'no-answer', text: "I don't have more information on that than the answer above. For advice about an individual child, please speak to your GP, health visitor or the school SENCO." }, 200, origin);
  }
  const check = checkOutput(out, passages);
  if (!check.ok) return json({ ok: false, error: 'blocked', problems: check.problems }, 200, origin);
  return json({ ok: true, ai: true, kind: 'ai', text: finish(out, passages, check.cited, audience) }, 200, origin);
}

export default { fetch: handle };
