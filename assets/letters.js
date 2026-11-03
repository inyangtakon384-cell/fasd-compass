/* FASD Compass template letters. Nothing is stored or sent. */
(function () {
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  $$('.lt-date').forEach(function (d) { d.textContent = today; });
  $$('.lt-form input[data-key]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var k = inp.getAttribute('data-key'), v = inp.value.trim();
      $$('.lt-fill[data-f="' + k + '"]').forEach(function (s) {
        if (!s.hasAttribute('data-label')) s.setAttribute('data-label', s.textContent);
        s.textContent = v || s.getAttribute('data-label');
        s.classList.toggle('done', !!v);
      });
    });
  });
  function paper(id) { return document.querySelector('#' + id + ' .lt-paper'); }
  function msg(btn, t) { var m = btn.parentNode.querySelector('.lt-msg'); m.textContent = t; setTimeout(function () { m.textContent = ''; }, 3000); }
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var el = paper(btn.getAttribute('data-copy')), text = Array.prototype.map.call(el.children, function (c) {
        if (c.tagName === 'UL') return Array.prototype.map.call(c.children, function (li) { return '- ' + li.innerText.trim(); }).join('\n');
        return c.innerText.trim();
      }).filter(Boolean).join('\n\n');
      var fallback = function () {
        var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        try { document.execCommand('copy'); msg(btn, 'Copied.'); } catch (e) { msg(btn, 'Press Ctrl+C or Cmd+C to copy.'); }
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { msg(btn, 'Copied. Paste it into an email or document.'); }, fallback);
      else fallback();
    });
  });
  $$('[data-print]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var area = document.getElementById('print-area');
      if (!area) { area = document.createElement('div'); area.id = 'print-area'; document.body.appendChild(area); }
      area.innerHTML = '<div class="lt-paper lt-print">' + paper(btn.getAttribute('data-print')).innerHTML + '</div>';
      document.body.classList.add('printing-one');
      var done = function () { document.body.classList.remove('printing-one'); area.innerHTML = ''; window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      setTimeout(function () { window.print(); setTimeout(done, 1500); }, 50);
    });
  });
})();
