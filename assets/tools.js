/* FASD Compass family tools (v1.1.8)
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
    function build(d) {
      var f = d.fields, name = esc(f.name || '').trim() || 'my child';
      var who = esc(f.name || '').trim() || 'Me';
      var strengths = $$('input[name=strength]:checked', planForm).map(function (el) { return esc(el.value); });
      var hard = [], helps = {};
      $$('input[data-domain]:checked', planForm).forEach(function (el) {
        var dm = el.getAttribute('data-domain');
        hard.push(esc(el.value));
        (helps[dm] = helps[dm] || []).push(el.getAttribute('data-help'));
      });
      var h = '<div class="plan-doc">';
      h += '<div class="plan-head"><div class="plan-eyebrow">FASD Compass · Support plan</div><h2 contenteditable="true">All about ' + who + '</h2>';
      h += '<div class="plan-meta" contenteditable="true">' + (f.age ? 'Age group: ' + esc(f.age) + ' · ' : '') + 'Made by: ' + (esc(f.madeby) || '...........') + ' · Date: ' + new Date().toLocaleDateString('en-GB') + '</div></div>';
      h += '<div class="plan-grid">';
      h += '<section class="plan-box sage"><h3>My strengths and interests</h3><ul contenteditable="true">' + (strengths.map(li).join('') || li('...')) + (f.interests ? li(esc(f.interests)) : '') + '</ul></section>';
      h += '<section class="plan-box amber"><h3>Things I find hard</h3><ul contenteditable="true">' + (hard.map(li).join('') || li('...')) + (f.otherhard ? li(esc(f.otherhard)) : '') + '</ul></section>';
      h += '</div><section class="plan-box"><h3>What helps me</h3>';
      var any = false;
      DOMAINS.forEach(function (dm) {
        if (!helps[dm[0]]) return; any = true;
        h += '<h4>' + dm[1] + '</h4><ul contenteditable="true">' + helps[dm[0]].map(li).join('') + '</ul>';
      });
      if (f.helps) { any = true; h += '<h4>Other things that work</h4><ul contenteditable="true">' + li(esc(f.helps)) + '</ul>'; }
      if (!any) h += '<ul contenteditable="true">' + li('...') + '</ul>';
      h += '</section><div class="plan-grid">';
      h += '<section class="plan-box coral"><h3>Signs I am getting stressed</h3><p contenteditable="true">' + (esc(f.signs) || '...') + '</p></section>';
      h += '<section class="plan-box navy"><h3>When I am upset, please</h3><p contenteditable="true">' + (esc(f.calm) || 'Use few words, keep your voice calm and low, give me space and time, and talk about it later when I am calm.') + '</p></section>';
      h += '<section class="plan-box"><h3>Please avoid</h3><p contenteditable="true">' + (esc(f.avoid) || '...') + '</p></section>';
      h += '<section class="plan-box"><h3>Contacts</h3><p contenteditable="true">' + (esc(f.contacts) || '...') + '</p></section>';
      h += '</div><p class="plan-foot" contenteditable="true">Review this plan every term, or sooner if things change. Made with FASD Compass (fasdcompass.co.uk/support-plan/). It does not replace advice from professionals.</p></div>';
      return h;
    }
    function render() {
      out.innerHTML = build(collect());
      document.getElementById('plan-result').hidden = false;
      document.getElementById('plan-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    restore(store(KEY));
    var saved = store(KEY + '-html');
    if (saved) { out.innerHTML = saved; document.getElementById('plan-result').hidden = false; }
    $('#plan-make').addEventListener('click', render);
    $('#plan-print').addEventListener('click', function () { printOnly(out.innerHTML, 'Support plan · FASD Compass'); });
    $('#plan-save').addEventListener('click', function () {
      store(KEY, collect()); store(KEY + '-html', out.innerHTML);
      var m = $('#plan-msg'); m.textContent = 'Saved on this device only.'; setTimeout(function () { m.textContent = ''; }, 3000);
    });
    $('#plan-clear').addEventListener('click', function () {
      if (!confirm('Clear your answers and the plan from this device?')) return;
      store(KEY, null); store(KEY + '-html', null); planForm.reset(); out.innerHTML = ''; document.getElementById('plan-result').hidden = true;
    });
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
