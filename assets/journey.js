/* FASD Compass journey tracker. Saved only in this browser (localStorage). Nothing is sent anywhere. */
(function () {
  var KEY = 'fasd-compass-journey-v1';
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var total = $$('.jr-step').length;
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); flash('Saved on this device.'); } catch (e) { flash('Could not save in this browser.'); } }
  var t; function flash(m) { var el = $('#jr-msg'); el.textContent = m; clearTimeout(t); t = setTimeout(function () { el.textContent = ''; }, 2000); }
  function collect() {
    var d = { done: {}, date: {}, notes: {}, leave: {} };
    $$('[data-done]').forEach(function (c) { if (c.checked) d.done[c.dataset.done] = 1; });
    $$('[data-date]').forEach(function (c) { if (c.value) d.date[c.dataset.date] = c.value; });
    $$('[data-notes]').forEach(function (c) { if (c.value.trim()) d.notes[c.dataset.notes] = c.value; });
    $$('[data-leave]').forEach(function (c) { if (c.checked) d.leave[c.dataset.leave] = 1; });
    return d;
  }
  function apply(d) {
    $$('[data-done]').forEach(function (c) { c.checked = !!(d.done && d.done[c.dataset.done]); });
    $$('[data-date]').forEach(function (c) { c.value = (d.date && d.date[c.dataset.date]) || ''; });
    $$('[data-notes]').forEach(function (c) { c.value = (d.notes && d.notes[c.dataset.notes]) || ''; });
    $$('[data-leave]').forEach(function (c) { c.checked = !!(d.leave && d.leave[c.dataset.leave]); });
  }
  function render() {
    var done = 0, current = null;
    $$('.jr-step').forEach(function (li) {
      var n = li.dataset.step, isDone = li.querySelector('[data-done]').checked;
      var started = isDone || li.querySelector('[data-date]').value || li.querySelector('[data-notes]').value.trim() || li.querySelector('[data-leave]:checked');
      if (isDone) done++;
      li.classList.toggle('done', isDone);
      li.classList.remove('current');
      if (!isDone && current === null) current = li;
      var st = li.querySelector('[data-status]');
      st.textContent = isDone ? 'Done' : (started ? 'In progress' : 'Not started');
      st.className = 'jr-status ' + (isDone ? 'is-done' : (started ? 'is-progress' : ''));
    });
    if (current) { current.classList.add('current'); if (!current.querySelector('.jr-status').classList.contains('is-progress')) current.querySelector('.jr-status').textContent = 'Next step'; }
    $('#jr-count').textContent = done + ' of ' + total + ' steps done';
    $('#jr-fill').style.width = (done / total * 100) + '%';
    document.querySelector('.jr-bar').setAttribute('aria-valuenow', done);
  }
  apply(load()); render();
  document.querySelector('.jr-map').addEventListener('change', function () { save(collect()); render(); });
  document.querySelector('.jr-map').addEventListener('input', function (ev) { if (ev.target.tagName === 'TEXTAREA') { save(collect()); render(); } });
  var allOpen = false;
  $('#jr-expand').addEventListener('click', function () { allOpen = !allOpen; $$('.jr-card').forEach(function (d) { d.open = allOpen; }); this.textContent = allOpen ? 'Close all steps' : 'Open all steps'; });
  $('#jr-clear').addEventListener('click', function () {
    if (!confirm('Clear your journey from this device? This cannot be undone.')) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    apply({}); render(); flash('Cleared.');
  });
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  $('#jr-print').addEventListener('click', function () {
    var rows = $$('.jr-step').map(function (li) {
      var n = li.dataset.step, title = li.querySelector('.jr-title').textContent;
      var date = li.querySelector('[data-date]').value, notes = li.querySelector('[data-notes]').value.trim();
      var got = $$('#step-' + n + ' [data-leave]').map(function (c) { return (c.checked ? '☑ ' : '☐ ') + esc(c.parentNode.textContent); }).join('<br>');
      if (date) date = new Date(date + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      return '<tr><td><strong>' + n + '. ' + esc(title) + '</strong><br>' + esc(li.querySelector('[data-status]').textContent) + '</td><td>' + esc(date || '') + '</td><td>' + got + '</td><td>' + esc(notes).replace(/\n/g, '<br>') + '</td></tr>';
    }).join('');
    var area = document.getElementById('print-area');
    if (!area) { area = document.createElement('div'); area.id = 'print-area'; document.body.appendChild(area); }
    area.innerHTML = '<div class="plan-doc"><div class="plan-head"><div class="plan-eyebrow">FASD Compass · Journey tracker</div><h2>Our FASD journey</h2></div><p>' + esc($('#jr-count').textContent) + '. Printed ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '.</p><table class="tracker-table jr-table"><thead><tr><th>Step</th><th>Date</th><th>What we left with</th><th>Notes</th></tr></thead><tbody>' + rows + '</tbody></table><p class="plan-foot">Printed from fasdcompass.co.uk/journey-tracker/. Take it to appointments.</p></div>';
    document.body.classList.add('printing-one');
    var done = function () { document.body.classList.remove('printing-one'); area.innerHTML = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); setTimeout(done, 1500); }, 50);
  });
})();
