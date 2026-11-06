/* FASD Compass family tools (v1.2.11)
   Everything stays on this device. Nothing is sent to a server. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ---------- Print one block only ---------- */
  function printOnly(html, title) {
    var area = document.getElementById('print-area');
    if (!area) { area = document.createElement('div'); area.id = 'print-area'; document.body.appendChild(area); }
    area.innerHTML = html;
    document.body.classList.add('printing-one');
    var old = document.title; if (title) document.title = title;
    var done = function () { document.body.classList.remove('printing-one'); area.innerHTML = ''; document.title = old; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); setTimeout(done, 1500); }, 50);
  }
  window.fasdPrintVisual = function (id) {
    var v = document.getElementById(id); if (!v) return;
    printOnly('<div class="visual-print">' + v.innerHTML + '<div class="vp-foot">FASD Compass · fasdcompass.co.uk/everyday-solutions/</div></div>', v.getAttribute('data-title') || 'FASD Compass visual');
  };

  /* ---------- Download a plan as PDF or Word ---------- */
  function planBlocks(root) {
    var out = [];
    function txt(el) { return (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim(); }
    (function walk(el) {
      Array.prototype.forEach.call(el.children, function (c) {
        var cl = c.classList, tag = c.tagName;
        if (cl.contains('no-print')) return;
        if (cl.contains('plan-eyebrow')) out.push({ t: 'eyebrow', s: txt(c) });
        else if (tag === 'H2') out.push({ t: 'title', s: txt(c) });
        else if (cl.contains('plan-meta')) out.push({ t: 'meta', s: txt(c) });
        else if (cl.contains('plan-notice')) out.push({ t: 'notice', s: txt(c) });
        else if (cl.contains('plan-foot')) out.push({ t: 'foot', s: txt(c) });
        else if (tag === 'H3') out.push({ t: 'h2', s: txt(c) });
        else if (tag === 'H4') out.push({ t: 'h3', s: txt(c) });
        else if (tag === 'LI') out.push({ t: 'li', s: txt(c) });
        else if (tag === 'P') out.push({ t: 'p', s: txt(c) });
        else walk(c);
      });
    })(root);
    return out.filter(function (b) { return b.s && b.s !== '...'; });
  }
  function saveBytes(bytes, filename, type) {
    var blob = new Blob([bytes], { type: type }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
  function wireExport(pdfSel, docSel, out, slug, title, msgSel) {
    var iso = function () { return new Date().toISOString().slice(0, 10); };
    var say = function (t) { var m = $(msgSel); if (m) { m.textContent = t; setTimeout(function () { m.textContent = ''; }, 5000); } };
    var pb = $(pdfSel), db = $(docSel);
    if (pb) pb.addEventListener('click', function () {
      if (!window.FASDSummaryPDF) { printOnly(out.innerHTML, title + ' · FASD Compass'); return; }
      saveBytes(window.FASDSummaryPDF.blocks(planBlocks(out), title), 'fasd-compass-' + slug + '-' + iso() + '.pdf', 'application/pdf');
      say('PDF downloaded. It is saved only on this device.');
    });
    if (db) db.addEventListener('click', function () {
      if (!window.FASDDocx) { say('Sorry, the Word download did not load. Please use Print instead.'); return; }
      saveBytes(window.FASDDocx.build(planBlocks(out), title), 'fasd-compass-' + slug + '-' + iso() + '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      say('Word document downloaded. It is saved only on this device.');
    });
  }
  window.fasdPlanBlocks = planBlocks;
  window.fasdWireExport = wireExport;
  window.fasdPrintOnly = printOnly;

  /* ---------- Tabs ---------- */
  $$('.tabs').forEach(function (tabs) {
    var btns = $$('.tab-btn', tabs);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
        b.classList.add('active'); b.setAttribute('aria-selected', 'true');
        var group = tabs.getAttribute('data-group');
        $$('.tab-panel[data-group="' + group + '"]').forEach(function (p) { p.hidden = p.id !== b.getAttribute('aria-controls'); });
      });
    });
  });

  /* ---------- Support plan ---------- */
  var planForm = document.getElementById('plan-form');
  if (planForm) {
    var KEY = 'fasdc-support-plan';
    var out = document.getElementById('plan-output');
    var DOMAINS = [
      ['memory', 'Memory and learning'], ['communication', 'Communication and understanding'],
      ['regulation', 'Feelings and emotional regulation'], ['sensory', 'Sensory needs'], ['daily', 'Daily life']
    ];
    function collect() {
      var d = { fields: {}, checks: [] };
      $$('input[type=text], textarea, select', planForm).forEach(function (el) { d.fields[el.name] = el.value; });
      $$('input[type=checkbox]:checked', planForm).forEach(function (el) { d.checks.push(el.value); });
      return d;
    }
    function restore(d) {
      if (!d) return;
      Object.keys(d.fields || {}).forEach(function (k) { var el = planForm.elements[k]; if (el) el.value = d.fields[k]; });
      $$('input[type=checkbox]', planForm).forEach(function (el) { el.checked = (d.checks || []).indexOf(el.value) > -1; });
    }
    function li(t) { return '<li>' + t + '</li>'; }
    function ul(arr) { return '<ul contenteditable="true">' + (arr.length ? arr.map(li).join('') : li('...')) + '</ul>'; }
    var LIB = {
      memory: { env: ['Keep things in the same place every time, with labels or pictures on drawers, hooks and boxes.', 'Put reminders where they are needed, such as a checklist by the front door.'],
        school: ['A visual timetable and picture checklists for tasks.', 'Regular reteaching and practice of key skills, expecting that learning may need repeating.'],
        goal: 'Uses a picture checklist for one daily routine, needing fewer reminders from an adult.' },
      communication: { env: ['Cut down background noise, such as the TV or radio, when you need to talk.'],
        school: ['Check understanding by asking the pupil to show you or explain in their own words.', 'Extra time to answer, and key words or instructions written down.'],
        goal: 'Uses pictures, a feelings scale or agreed words to show how they feel.' },
      regulation: { env: ['A calm space they can go to, agreed in advance, at home and at school.', 'Predictable routines, with changes explained early and shown visually.'],
        school: ['An agreed way to ask for a break, such as a card, and a calm place to go.', 'Warning before changes, including new staff, supply teachers and trips.'],
        goal: 'Uses an agreed calming strategy, or asks for a break, before feelings get too big.' },
      sensory: { env: ['Reduce noise, clutter and bright light where they work, eat and sleep.', 'Allow ear defenders, fidget toys or comfortable clothes.'],
        school: ['Seating away from doors, windows and busy areas.', 'Movement breaks built into the day.', 'A plan for noisy times, such as assemblies, lunch and fire drills.'],
        goal: 'Uses an agreed sensory support, such as ear defenders or a movement break, when needed.' },
      attention: { env: ['A tidy place to work, with only what is needed for the task.', 'A visual timer, so they can see how long a task or a break will last.'],
        school: ['Short tasks with a clear start and finish, and breaks between them.', 'Seating near the teacher and away from distractions.', 'Help to get started, then regular check-ins.'],
        goal: 'Finishes a short task with a visual timer and no more than one reminder.' },
      daily: { env: ['Picture routines on the wall where they are used, such as the bathroom or by the front door.', 'A calm, dark and quiet bedroom, with screens out of the room at night.'],
        school: ['Understanding that a poor night can affect the next day, with information shared between home and school.'],
        goal: 'Follows a picture routine for one hard part of the day, such as mornings or bedtime.' },
      school: { env: [], school: ['A named key adult and a short regular check-in.', 'Support at unstructured times, such as break, lunch and moving between lessons.', 'Regular contact between home and school, such as a home-school book.', 'Support written into a plan, with regular reviews, whether or not there is a diagnosis.'],
        goal: 'Has a named key adult and a plan for the hardest times of the school day, reviewed each term.' }
    };
    var NAMES = { memory: 'Memory and learning', communication: 'Communication and understanding', regulation: 'Feelings and emotional regulation', sensory: 'Sensory needs', attention: 'Attention and executive functioning', daily: 'Sleep and daily living', school: 'School, nursery or college' };
    var ORDER = ['memory', 'communication', 'attention', 'regulation', 'sensory', 'daily', 'school'];
    var STAGE = {
      '0 to 5': 'Share this plan with nursery, pre-school or the childminder, and with your health visitor.',
      '6 to 11': 'Share this plan with the class teacher and the SENCO, and ask for it to be passed to every adult who works with your child.',
      '12 to 17': 'Share this plan with the SENCO, form tutor and subject teachers. Plan carefully for moving between lessons, homework and exams.',
      '18 and over': 'With the young person\u2019s agreement, share this plan with college, university disability services, an employer or adult services.'
    };
    var COMM = ['Say their name and get their attention before you speak.', 'Use short sentences and give one instruction at a time.', 'Wait before repeating a question, to give time to think.', 'Show as well as tell, using pictures, gestures or a demonstration.'];
    function uniq(arr) { var seen = {}; return arr.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); }
    function build(d) {
      var f = d.fields;
      var who = esc(f.name || '').trim() || 'my child';
      var strengths = $$('input[name=strength]:checked', planForm).map(function (el) { return esc(el.value); });
      var hard = {}, helps = {}, used = [];
      $$('input[data-domain]:checked', planForm).forEach(function (el) {
        var dm = el.getAttribute('data-domain');
        if (used.indexOf(dm) < 0) used.push(dm);
        (hard[dm] = hard[dm] || []).push(esc(el.value));
        (helps[dm] = helps[dm] || []).push(esc(el.getAttribute('data-help')));
      });
      used.sort(function (a, b) { return ORDER.indexOf(a) - ORDER.indexOf(b); });
      var stage = f.age ? ({ '0 to 5': 'Early years (0 to 5)', '6 to 11': 'Primary age (6 to 11)', '12 to 17': 'Secondary age (12 to 17)', '18 and over': 'Young adult (18 and over)' }[f.age] || esc(f.age)) : '';
      var review = f.review ? new Date(f.review).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '...........';
      var h = '<div class="plan-doc">';
      h += '<div class="plan-head"><div class="plan-eyebrow">FASD Compass · Support plan</div><h2 contenteditable="true">All about ' + who + '</h2>';
      h += '<div class="plan-meta" contenteditable="true">' + (stage ? 'Developmental stage: ' + stage + ' · ' : '') + 'Made by: ' + (esc(f.madeby) || '...........') + ' · Date: ' + new Date().toLocaleDateString('en-GB') + '</div>';
      if (f.devnotes) h += '<div class="plan-meta" contenteditable="true">Notes on development: ' + esc(f.devnotes) + '</div>';
      h += '</div>';
      h += '<p class="plan-notice">This plan is based on what a parent or carer chose. It gives general ideas that help many children. It is not an individual clinical assessment and does not replace advice from professionals who know the child.</p>';
      h += '<div class="plan-grid">';
      h += '<section class="plan-box sage"><h3>Strengths and interests</h3>' + ul(strengths.concat(f.interests ? [esc(f.interests)] : [])) + '</section>';
      h += '<section class="plan-box amber"><h3>Areas where I need support</h3>';
      if (!used.length && !f.otherhard) h += ul([]);
      used.forEach(function (dm) { h += '<h4>' + NAMES[dm] + '</h4>' + ul(hard[dm]); });
      if (f.otherhard) h += '<h4>Other things I find hard</h4>' + ul([esc(f.otherhard)]);
      h += '</section></div>';
      h += '<section class="plan-box"><h3>Practical strategies</h3>';
      var any = false;
      used.forEach(function (dm) { if (dm === 'communication' || dm === 'school') return; any = true; h += '<h4>' + NAMES[dm] + '</h4>' + ul(helps[dm]); });
      if (f.helps) { any = true; h += '<h4>Other things that work</h4>' + ul([esc(f.helps)]); }
      if (!any) h += ul([]);
      h += '</section>';
      var env = []; used.forEach(function (dm) { env = env.concat(LIB[dm].env); });
      h += '<div class="plan-grid"><section class="plan-box"><h3>Changes to the environment</h3>' + ul(uniq(env)) + '</section>';
      h += '<section class="plan-box navy"><h3>How to talk with me</h3>' + ul(uniq(COMM.concat(helps.communication || []))) + '</section></div>';
      var sch = []; if (STAGE[f.age]) sch.push(STAGE[f.age]);
      sch = sch.concat(helps.school || []); used.forEach(function (dm) { sch = sch.concat(LIB[dm].school); });
      h += '<section class="plan-box"><h3>Suggested support at school, nursery or college</h3>' + ul(uniq(sch)) + '</section>';
      h += '<div class="plan-grid">';
      h += '<section class="plan-box coral"><h3>Signs I am getting stressed</h3><p contenteditable="true">' + (esc(f.signs) || '...') + '</p></section>';
      h += '<section class="plan-box navy"><h3>When I am upset, please</h3><p contenteditable="true">' + (esc(f.calm) || 'Use few words, keep your voice calm and low, give me space and time, and talk about it later when I am calm.') + '</p></section>';
      h += '<section class="plan-box"><h3>Please avoid</h3><p contenteditable="true">' + (esc(f.avoid) || '...') + '</p></section>';
      h += '<section class="plan-box"><h3>Contacts</h3><p contenteditable="true">' + (esc(f.contacts) || '...') + '</p></section>';
      h += '</div>';
      var goals = (f.goal ? [esc(f.goal)] : []).concat(used.map(function (dm) { return LIB[dm].goal; }));
      h += '<section class="plan-box sage"><h3>Review goals</h3><p class="plan-small" contenteditable="true">Suggested goals to change or remove. Pick one or two to start with.</p>' + ul(goals);
      h += '<p contenteditable="true"><strong>Review date:</strong> ' + review + ' · <strong>Who will review it:</strong> ...........</p></section>';
      h += '<p class="plan-foot" contenteditable="true">Review this plan every term, or sooner if things change. Made with FASD Compass (fasdcompass.co.uk/support-plan/). It does not replace advice from professionals.</p></div>';
      return h;
    }
    function render() {
      out.innerHTML = build(collect());
      document.getElementById('plan-result').hidden = false;
      document.getElementById('plan-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
      var t = out.querySelector('h2'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    }
    restore(store(KEY));
    var saved = store(KEY + '-html');
    if (saved) { out.innerHTML = saved; document.getElementById('plan-result').hidden = false; }
    $('#plan-make').addEventListener('click', render);
    $('#plan-print').addEventListener('click', function () { printOnly(out.innerHTML, 'Support plan · FASD Compass'); });
    wireExport('#plan-pdf', '#plan-docx', out, 'support-plan', 'Support plan', '#plan-msg');
    $('#plan-save').addEventListener('click', function () {
      store(KEY, collect()); store(KEY + '-html', out.innerHTML);
      var m = $('#plan-msg'); m.textContent = 'Saved on this device only.'; setTimeout(function () { m.textContent = ''; }, 3000);
    });
    $('#plan-clear').addEventListener('click', function () {
      if (!confirm('Clear your answers and the plan from this device?')) return;
      store(KEY, null); store(KEY + '-html', null); planForm.reset(); out.innerHTML = ''; document.getElementById('plan-result').hidden = true;
    });
  }

  /* ---------- Regulation support plan ---------- */
  var regForm = document.getElementById('reg-form');
  if (regForm) {
    var RK = 'fasdc-regulation-plan';
    var rout = document.getElementById('reg-output'), rres = document.getElementById('reg-result');
    function rcollect() { var d = { fields: {}, checks: [] };
      $$('input[type=text], input[type=date], textarea', regForm).forEach(function (el) { d.fields[el.name] = el.value; });
      $$('input[type=checkbox]:checked', regForm).forEach(function (el) { d.checks.push(el.name + '|' + el.value); }); return d; }
    function rrestore(d) { if (!d) return;
      Object.keys(d.fields || {}).forEach(function (k) { var el = regForm.elements[k]; if (el) el.value = d.fields[k]; });
      $$('input[type=checkbox]', regForm).forEach(function (el) { el.checked = (d.checks || []).indexOf(el.name + '|' + el.value) > -1; }); }
    function picked(name, other) { var a = $$('input[name="' + name + '"]:checked', regForm).map(function (el) { return esc(el.value); });
      var o = (regForm.elements[other] && regForm.elements[other].value || '').trim(); if (o) a.push(esc(o)); return a; }
    function rul(a) { return '<ul contenteditable="true">' + (a.length ? a.map(function (t) { return '<li>' + t + '</li>'; }).join('') : '<li>...</li>') + '</ul>'; }
    function rbuild() {
      var f = rcollect().fields, who = esc(f.name || '').trim();
      var review = f.review ? new Date(f.review).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '...........';
      var talk = picked('rp-talk', 'words'); if (f.words) { talk.pop(); talk.push('Words that help: ' + esc(f.words)); }
      var h = '<div class="plan-doc">';
      h += '<div class="plan-head"><div class="plan-eyebrow">FASD Compass · Regulation support plan</div><h2 contenteditable="true">Helping ' + (who || 'my child') + ' with big feelings</h2>';
      h += '<div class="plan-meta" contenteditable="true">Made by: ' + (esc(f.madeby) || '...........') + ' · Date: ' + new Date().toLocaleDateString('en-GB') + ' · Review by: ' + review + '</div></div>';
      h += '<p class="plan-notice">This plan describes what usually helps. It is not a clinical assessment. Every episode can be different, and not every difficulty is caused by FASD. If anyone is at serious risk of harm, call 999.</p>';
      h += '<div class="plan-grid">';
      h += '<section class="plan-box coral"><h3>Early signs</h3><p contenteditable="true">' + (esc(f.signs) || '...') + '</p></section>';
      h += '<section class="plan-box amber"><h3>Things that can build up</h3>' + rul(picked('rp-trig', 'trigother')) + '</section>';
      h += '<section class="plan-box"><h3>Reducing demands and stimulation</h3>' + rul(picked('rp-lower', 'lowerother')) + '</section>';
      h += '<section class="plan-box navy"><h3>How to talk to me when I am upset</h3>' + rul(talk) + '</section>';
      h += '<section class="plan-box sage"><h3>What helps me calm down</h3>' + rul(picked('rp-calm', 'calmother')) + '</section>';
      h += '<section class="plan-box"><h3>Helping me recover</h3>' + rul(picked('rp-rec', 'recother')) + '</section>';
      h += '<section class="plan-box"><h3>Keeping everyone safe</h3><p contenteditable="true">' + (esc(f.safety) || '...') + '</p></section>';
      h += '<section class="plan-box"><h3>Who to tell</h3><p contenteditable="true">' + (esc(f.contacts) || '...') + '</p></section>';
      h += '</div>';
      h += '<section class="plan-box"><h3>After an episode</h3>' + rul(['Check the basics: food, drink, rest, and whether they are unwell or in pain.', 'When everyone is calm, think about what happened before, what helped and what made it worse.', 'Write it down, so patterns are easier to see over time.', 'Change this plan if something new works, or stops working.']) + '</section>';
      h += '<p class="plan-foot" contenteditable="true">Made with FASD Compass (fasdcompass.co.uk/regulation-toolkit/). It does not replace advice from professionals who know the child.</p></div>';
      return h;
    }
    rrestore(store(RK));
    var rsaved = store(RK + '-html'); if (rsaved) { rout.innerHTML = rsaved; rres.hidden = false; }
    $('#reg-make').addEventListener('click', function () { rout.innerHTML = rbuild(); rres.hidden = false; rres.scrollIntoView({ behavior: 'smooth', block: 'start' }); var t = rout.querySelector('h2'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } });
    $('#reg-print').addEventListener('click', function () { printOnly(rout.innerHTML, 'Regulation support plan · FASD Compass'); });
    wireExport('#reg-pdf', '#reg-docx', rout, 'regulation-plan', 'Regulation support plan', '#reg-msg');
    $('#reg-save').addEventListener('click', function () { store(RK, rcollect()); store(RK + '-html', rout.innerHTML); var m = $('#reg-msg'); m.textContent = 'Saved on this device only.'; setTimeout(function () { m.textContent = ''; }, 3000); });
    $('#reg-clear').addEventListener('click', function () { if (!confirm('Clear your answers and the plan from this device?')) return; store(RK, null); store(RK + '-html', null); regForm.reset(); rout.innerHTML = ''; rres.hidden = true; });
  }

  /* ---------- Pattern tracker ---------- */
  var tForm = document.getElementById('tracker-form');
  if (tForm) {
    var TK = 'fasdc-pattern-tracker';
    var list = store(TK) || [];
    var body = document.getElementById('tracker-rows');
    var sum = document.getElementById('tracker-summary');
    function period(t) { if (!t) return ''; var h = parseInt(t.split(':')[0], 10); return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'; }
    function draw() {
      if (!list.length) { body.innerHTML = '<tr><td colspan="7" class="tr-empty">No entries yet.</td></tr>'; sum.innerHTML = ''; return; }
      body.innerHTML = list.map(function (e, i) {
        return '<tr><td>' + esc(e.date) + '<br><span class="tr-sub">' + esc(e.time) + '</span></td><td>' + esc(e.where) + '</td><td>' + esc(e.before) + '</td><td>' + esc((e.triggers || []).join(', ')) + '</td><td>' + esc(e.helped) + '</td><td>' + esc(e.length) + '</td><td class="no-print"><button type="button" class="tr-del" data-i="' + i + '" aria-label="Delete entry">✕</button></td></tr>';
      }).join('');
      var c = {}, p = {};
      list.forEach(function (e) { (e.triggers || []).forEach(function (t) { c[t] = (c[t] || 0) + 1; }); var pp = period(e.time); if (pp) p[pp] = (p[pp] || 0) + 1; });
      var top = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).slice(0, 3);
      var tp = Object.keys(p).sort(function (a, b) { return p[b] - p[a]; })[0];
      sum.innerHTML = '<strong>' + list.length + ' ' + (list.length === 1 ? 'entry' : 'entries') + ' so far.</strong> ' +
        (top.length ? 'Possible triggers you have ticked most often: ' + top.map(function (t) { return esc(t) + ' (' + c[t] + ')'; }).join(', ') + '. ' : '') +
        (tp ? 'Most entries were in the ' + tp.toLowerCase() + '. ' : '') +
        (list.length < 5 ? 'Patterns are easier to see after a few weeks.' : 'These are clues to talk through, not answers.');
    }
    tForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var e = { triggers: [] };
      ['date', 'time', 'where', 'before', 'signs', 'helped', 'length'].forEach(function (k) { e[k] = (tForm.elements[k].value || '').trim(); });
      $$('input[name=trigger]:checked', tForm).forEach(function (el) { e.triggers.push(el.value); });
      if (!e.date) { e.date = new Date().toLocaleDateString('en-GB'); } else { e.date = new Date(e.date).toLocaleDateString('en-GB'); }
      list.unshift(e); store(TK, list); tForm.reset(); draw();
      var m = $('#tracker-msg'); m.textContent = 'Entry saved on this device.'; setTimeout(function () { m.textContent = ''; }, 3000);
    });
    body.addEventListener('click', function (ev) {
      var b = ev.target.closest('.tr-del'); if (!b) return;
      if (!confirm('Delete this entry?')) return;
      list.splice(+b.getAttribute('data-i'), 1); store(TK, list); draw();
    });
    $('#tracker-print').addEventListener('click', function () {
      printOnly('<div class="plan-doc"><div class="plan-head"><div class="plan-eyebrow">FASD Compass · Pattern tracker</div><h2>Emotional regulation diary</h2></div><p>' + sum.innerHTML + '</p><table class="tracker-table">' + $('#tracker-table').innerHTML + '</table><p class="plan-foot">Printed from fasdcompass.co.uk/regulation-toolkit/. Share with your GP, school or assessment team.</p></div>', 'Pattern tracker · FASD Compass');
    });
    $('#tracker-clear').addEventListener('click', function () {
      if (!confirm('Delete all tracker entries from this device?')) return;
      list = []; store(TK, null); draw();
    });
    draw();
  }
})();
