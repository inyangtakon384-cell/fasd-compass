/* FASD Compass school tools (v1.2.10)
   Everything stays on this device. Nothing is sent to a server. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function printOnly(html, title) { if (window.fasdPrintOnly) window.fasdPrintOnly(html, title); else window.print(); }

  /* ---------- Classroom support plan ---------- */
  var form = document.getElementById('csp-form');
  if (form) {
    var KEY = 'fasdc-classroom-plan';
    var out = document.getElementById('csp-output');
    var DOMAINS = [['learn', 'Learning and memory'], ['proc', 'Processing and communication'], ['sens', 'Sensory environment'],
      ['attn', 'Attention'], ['reg', 'Emotional regulation'], ['trans', 'Transitions']];
    function collect() {
      var d = { fields: {}, checks: [] };
      $$('input[type=text], input[type=date], select', form).forEach(function (el) { d.fields[el.name] = el.value; });
      $$('input[type=checkbox]:checked', form).forEach(function (el) { d.checks.push(el.name + '|' + el.value); });
      return d;
    }
    function restore(d) {
      if (!d) return;
      Object.keys(d.fields || {}).forEach(function (k) { var el = form.elements[k]; if (el && el.tagName) el.value = d.fields[k]; });
      $$('input[type=checkbox]', form).forEach(function (el) { el.checked = (d.checks || []).indexOf(el.name + '|' + el.value) > -1; });
    }
    function ul(arr) { return '<ul contenteditable="true">' + (arr.length ? arr.map(function (t) { return '<li>' + t + '</li>'; }).join('') : '<li>...</li>') + '</ul>'; }
    function vals(name) { return $$('input[name="' + name + '"]:checked', form).map(function (el) { return esc(el.value); }); }
    function build() {
      var f = {}; $$('input[type=text], input[type=date], select', form).forEach(function (el) { f[el.name] = el.value.trim(); });
      var who = esc(f.initials) || 'this pupil';
      var review = f.review ? new Date(f.review).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '...........';
      var h = '<div class="plan-doc">';
      h += '<div class="plan-head"><div class="plan-eyebrow">FASD Compass · Classroom support plan</div><h2 contenteditable="true">Classroom support plan for ' + who + '</h2>';
      h += '<div class="plan-meta" contenteditable="true">' + (f.year ? 'Year or class: ' + esc(f.year) + ' · ' : '') + 'Made by: ' + (esc(f.madeby) || '...........') + ' · Date: ' + new Date().toLocaleDateString('en-GB') + '</div></div>';
      h += '<p class="plan-notice">This plan is based on the needs that school staff selected. It is not a clinical assessment and does not diagnose or rule out FASD or any other condition. Support should be based on the pupil’s needs and does not depend on a diagnosis.</p>';
      var s = vals('strength'); if (f.interests) s.push(esc(f.interests));
      h += '<section class="plan-box sage"><h3>1. Strengths</h3>' + ul(s);
      if (f.voice) h += '<h4>What the pupil says helps</h4>' + ul([esc(f.voice)]);
      h += '</section>';
      DOMAINS.forEach(function (d, i) {
        var boxes = $$('input[name="' + d[0] + '"]:checked', form);
        var seen = boxes.map(function (el) { return esc(el.value); });
        var dos = boxes.map(function (el) { return esc(el.getAttribute('data-help')); });
        if (f['other-' + d[0]]) seen.push(esc(f['other-' + d[0]]));
        h += '<section class="plan-box' + (i % 2 ? ' amber' : '') + '"><h3>' + (i + 2) + '. ' + d[1] + '</h3>';
        if (!seen.length) h += '<p contenteditable="true">No needs selected in this area. Add notes here if needed.</p>';
        else h += '<h4>What we have noticed</h4>' + ul(seen) + '<h4>What we will do</h4>' + ul(dos);
        h += '</section>';
      });
      h += '<section class="plan-box navy"><h3>8. Assessment adjustments</h3>' + ul(vals('assess')) + '<p class="plan-small" contenteditable="true">For formal exams, follow the access arrangements rules of the exam board.</p></section>';
      var home = vals('home');
      if (f.homefreq) home.unshift('How often: ' + esc(f.homefreq));
      if (f.contact) home.push('Named contact in school: ' + esc(f.contact));
      if (f.method) home.push('Family’s preferred contact method: ' + esc(f.method));
      h += '<section class="plan-box sage"><h3>9. Home-school communication</h3>' + ul(home) + '</section>';
      var rv = ['Review: ' + (esc(f.reviewfreq) || 'every term, or sooner if things change'), 'First review date: ' + review,
        'Who will be involved: ' + (esc(f.who) || 'the pupil, parents or carers, class teacher or form tutor, and the SENCO or ALNCo')];
      if (f.goal) rv.push('What we hope will change: ' + esc(f.goal));
      rv.push('At the review, ask what has worked, what has not, and what the pupil and family think. If progress is limited with good support in place, consider specialist advice.');
      h += '<section class="plan-box coral"><h3>10. Review arrangements</h3>' + ul(rv) + '</section>';
      h += '<p class="plan-foot" contenteditable="true">Share this plan with every adult who works with the pupil. Made with FASD Compass (fasdcompass.co.uk/classroom-support-plan/). It does not replace advice from professionals who know the pupil.</p></div>';
      return h;
    }
    var say = function (t) { var m = $('#csp-msg'); if (m) { m.textContent = t; setTimeout(function () { m.textContent = ''; }, 5000); } };
    function show() { document.getElementById('csp-result').hidden = false; }
    restore(store(KEY));
    var saved = store(KEY + '-html');
    if (saved) { out.innerHTML = saved; show(); }
    $('#csp-make').addEventListener('click', function () {
      out.innerHTML = build(); show();
      document.getElementById('csp-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
      var t = out.querySelector('h2'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
    $('#csp-print').addEventListener('click', function () { printOnly(out.innerHTML, 'Classroom support plan · FASD Compass'); });
    if (window.fasdWireExport) window.fasdWireExport('#csp-pdf', '#csp-docx', out, 'classroom-support-plan', 'Classroom support plan', '#csp-msg');
    $('#csp-save').addEventListener('click', function () { store(KEY, collect()); store(KEY + '-html', out.innerHTML); say('Saved on this device only.'); });
    $('#csp-clear').addEventListener('click', function () {
      store(KEY, null); store(KEY + '-html', null); form.reset(); out.innerHTML = '';
      document.getElementById('csp-result').hidden = true; say('Cleared.');
    });
  }

  /* ---------- What does this behaviour mean? ---------- */
  var chips = document.getElementById('bg-chips');
  if (chips) {
    var cards = $$('.bg-card'), all = $('#bg-all');
    function pick(id, focus) {
      cards.forEach(function (c) { c.hidden = c.id !== 'bg-' + id; });
      $$('.bg-chip', chips).forEach(function (a) { var on = a.getAttribute('data-bg') === id; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      all.hidden = false;
      var c = document.getElementById('bg-' + id);
      if (c && focus) { c.scrollIntoView({ behavior: 'smooth', block: 'start' }); c.focus({ preventScroll: true }); }
    }
    function showAll() {
      cards.forEach(function (c) { c.hidden = false; });
      $$('.bg-chip', chips).forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
      all.hidden = true;
    }
    $$('.bg-chip', chips).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault(); var id = a.getAttribute('data-bg');
        pick(id, true);
        if (history.replaceState) history.replaceState(null, '', '#bg-' + id);
      });
    });
    all.addEventListener('click', function () { showAll(); if (history.replaceState) history.replaceState(null, '', location.pathname); });
    $('#bg-print').addEventListener('click', function () { window.print(); });
    window.addEventListener('hashchange', function () { var h = /^#bg-([a-z]+)$/.exec(location.hash); if (h && document.getElementById('bg-' + h[1])) pick(h[1], true); });
    var m = /^#bg-([a-z]+)$/.exec(location.hash);
    if (m && document.getElementById('bg-' + m[1])) pick(m[1], false);
    else { cards.forEach(function (c, i) { c.hidden = i > 0; }); pick(cards[0].id.slice(3), false); }
  }
})();
