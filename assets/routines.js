/* FASD Compass Visual Routine Builder (v1.2.9)
   Everything stays on this device. Nothing is sent to a server. */
(function () {
  'use strict';
  var root = document.getElementById('rb-app');
  if (!root) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(t) { var d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  var ICONS = [
    ['⏰', 'alarm clock'], ['🛏️', 'bed'], ['🚽', 'toilet'], ['🧼', 'soap'], ['🚿', 'shower'], ['🛁', 'bath'], ['🪥', 'toothbrush'], ['💇', 'brush hair'],
    ['👕', 'clothes'], ['👚', 'pyjamas'], ['🧦', 'socks'], ['👟', 'shoes'], ['🧥', 'coat'], ['🎒', 'school bag'], ['🥣', 'breakfast'], ['🍎', 'snack'],
    ['🥪', 'lunch'], ['🍽️', 'dinner'], ['💧', 'drink of water'], ['💊', 'medicine'], ['🏠', 'home'], ['🏫', 'school'], ['🚗', 'car'], ['🚌', 'bus'],
    ['🚶', 'walk'], ['🩺', 'doctor or nurse'], ['🦷', 'dentist'], ['🏥', 'hospital'], ['🪑', 'sit down'], ['⏳', 'wait'], ['⏲️', 'timer'], ['🔔', 'bell or alarm'],
    ['📝', 'homework'], ['✏️', 'pencil'], ['📚', 'books'], ['📖', 'story'], ['🙋', 'ask for help'], ['🧃', 'break'], ['🧸', 'toy'], ['🎮', 'games'],
    ['📺', 'TV'], ['📵', 'screens off'], ['🎧', 'music'], ['⚽', 'play outside'], ['🎨', 'drawing'], ['🧩', 'puzzle'], ['🫧', 'breathe'], ['🛋️', 'quiet time'],
    ['🌙', 'night time'], ['😴', 'sleep'], ['📦', 'tidy up'], ['▶️', 'now'], ['⏭️', 'next'], ['👋', 'hello'], ['🖼️', 'look at pictures'], ['👂', 'listen'],
    ['👀', 'look'], ['👍', 'well done'], ['⭐', 'reward'], ['❤️', 'love'], ['✅', 'done'], ['🐶', 'pet']
  ];
  var NAME = {}; ICONS.forEach(function (i) { NAME[i[0]] = i[1]; });
  var TEMPLATES = {
    morning: { title: 'My morning routine', steps: [['⏰', 'Wake up'], ['🚽', 'Toilet'], ['🧼', 'Wash face'], ['👕', 'Get dressed'], ['🥣', 'Breakfast'], ['🪥', 'Brush teeth'], ['🧥', 'Shoes and coat'], ['🎒', 'Bag ready']] },
    afterschool: { title: 'After school', steps: [['🏠', 'Home, shoes off'], ['🍎', 'Snack and drink'], ['🛋️', 'Quiet time'], ['⚽', 'Play or go outside'], ['📝', 'Homework, if any'], ['🍽️', 'Dinner'], ['🎮', 'Free time']] },
    homework: { title: 'Homework steps', steps: [['🍎', 'Snack and break'], ['🪑', 'Sit at my table'], ['✏️', 'Get what I need'], ['⏲️', 'Set the timer'], ['📝', 'Do one task'], ['🧃', 'Short break'], ['🙋', 'Ask for help'], ['🎒', 'Put it in my bag']] },
    bedtime: { title: 'My bedtime routine', steps: [['📵', 'Screens off'], ['🛁', 'Bath or wash'], ['👚', 'Pyjamas on'], ['🪥', 'Brush teeth'], ['🚽', 'Toilet'], ['📖', 'Story time'], ['🌙', 'Lights low'], ['😴', 'Sleep']] },
    appointment: { title: 'Going to an appointment', steps: [['🖼️', 'Look at pictures of where we are going'], ['🎒', 'Pack my bag and something to do'], ['🚗', 'Travel there'], ['⏳', 'Wait for my turn'], ['🩺', 'See the doctor or nurse'], ['👂', 'They may look, listen or ask questions'], ['🏠', 'Go home'], ['⭐', 'Something nice afterwards']] },
    transition: { title: 'Changing activity', steps: [['▶️', 'Now: '], ['⏳', '5 minutes left'], ['🔔', 'Timer finishes'], ['📦', 'Put things away'], ['⏭️', 'Next: '], ['👍', 'Well done']] },
    blank: { title: 'My routine', steps: [['✅', ''], ['✅', ''], ['✅', '']] }
  };
  var KEY = 'fasdc-routine-';
  var MAX = 12;
  var state = { kind: 'morning', title: '', ticks: true, steps: [] };
  var list = $('#rb-steps'), live = $('#rb-live'), preview = $('#rb-preview'), titleIn = $('#rb-title'), tickIn = $('#rb-ticks'), msg = $('#rb-msg');
  var picker = $('#rb-picker'), pickerFor = -1, pickerReturn = null;

  function announce(t) { live.textContent = ''; setTimeout(function () { live.textContent = t; }, 30); }
  function load(kind, fresh) {
    state.kind = kind;
    var saved = !fresh && store(KEY + kind);
    var t = TEMPLATES[kind];
    if (saved && saved.steps) { state.title = saved.title; state.ticks = saved.ticks !== false; state.steps = saved.steps; }
    else { state.title = t.title; state.ticks = true; state.steps = t.steps.map(function (s) { return { icon: s[0], text: s[1] }; }); }
    titleIn.value = state.title; tickIn.checked = state.ticks;
    draw(); 
  }
  function label(i) { return state.steps[i].text.trim() || 'step ' + (i + 1); }
  function draw(focusSel) {
    list.innerHTML = state.steps.map(function (s, i) {
      var n = i + 1, last = i === state.steps.length - 1;
      return '<li class="rb-step" data-i="' + i + '">' +
        '<span class="rb-num" aria-hidden="true">' + n + '</span>' +
        '<button type="button" class="rb-icon" data-act="icon" aria-haspopup="dialog" aria-label="Change picture for step ' + n + '. Current picture: ' + esc(NAME[s.icon] || 'picture') + '">' + s.icon + '</button>' +
        '<label class="sr-only" for="rb-text-' + i + '">Words for step ' + n + '</label>' +
        '<input class="rb-text" id="rb-text-' + i + '" type="text" maxlength="60" value="' + esc(s.text) + '" autocomplete="off"/>' +
        '<span class="rb-moves">' +
        '<button type="button" class="rb-mini" data-act="up" aria-label="Move step ' + n + ' up"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
        '<button type="button" class="rb-mini" data-act="down" aria-label="Move step ' + n + ' down"' + (last ? ' disabled' : '') + '>↓</button>' +
        '<button type="button" class="rb-mini rb-del" data-act="del" aria-label="Remove step ' + n + '"' + (state.steps.length < 2 ? ' disabled' : '') + '>✕</button>' +
        '</span></li>';
    }).join('');
    $('#rb-add').disabled = state.steps.length >= MAX;
    $('#rb-count').textContent = state.steps.length + ' of ' + MAX + ' steps';
    renderPreview();
    if (focusSel) { var el = list.querySelector(focusSel); if (el) el.focus(); }
  }
  function visualHTML() {
    var two = state.steps.length <= 2 ? ' two' : '';
    return '<h2>' + esc(state.title || 'My routine') + '</h2><div class="v-sub">' + (state.ticks ? 'Tick each one when it is done' : 'One step at a time') + '</div>' +
      '<div class="board' + two + (state.ticks ? '' : ' no-ticks') + '">' + state.steps.map(function (s, i) {
        return '<div class="tile"><span class="t-num">' + (i + 1) + '</span><span class="t-ico">' + s.icon + '</span>' + (esc(s.text) || '&nbsp;') + '<span class="t-box"></span></div>';
      }).join('') + '</div>';
  }
  function renderPreview() { preview.innerHTML = visualHTML(); }

  list.addEventListener('input', function (e) {
    if (!e.target.classList.contains('rb-text')) return;
    var i = +e.target.closest('.rb-step').getAttribute('data-i'); state.steps[i].text = e.target.value; renderPreview();
  });
  list.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var i = +b.closest('.rb-step').getAttribute('data-i'), act = b.getAttribute('data-act'), s = state.steps;
    if (act === 'up' && i > 0) { var t = s[i - 1]; s[i - 1] = s[i]; s[i] = t; draw('[data-i="' + (i - 1) + '"] [data-act="' + (i - 1 === 0 ? 'down' : 'up') + '"]'); announce('Moved ' + label(i - 1) + ' to step ' + i + '.'); }
    else if (act === 'down' && i < s.length - 1) { var u = s[i + 1]; s[i + 1] = s[i]; s[i] = u; draw('[data-i="' + (i + 1) + '"] [data-act="' + (i + 1 === s.length - 1 ? 'up' : 'down') + '"]'); announce('Moved ' + label(i + 1) + ' to step ' + (i + 2) + '.'); }
    else if (act === 'del' && s.length > 1) { var gone = label(i); s.splice(i, 1); draw('[data-i="' + Math.min(i, s.length - 1) + '"] .rb-text'); announce('Removed ' + gone + '.'); }
    else if (act === 'icon') openPicker(i, b);
  });
  $('#rb-add').addEventListener('click', function () {
    if (state.steps.length >= MAX) return;
    state.steps.push({ icon: '✅', text: '' }); draw('[data-i="' + (state.steps.length - 1) + '"] .rb-text'); announce('Added step ' + state.steps.length + '.');
  });
  titleIn.addEventListener('input', function () { state.title = titleIn.value; renderPreview(); });
  tickIn.addEventListener('change', function () { state.ticks = tickIn.checked; renderPreview(); });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="rb-kind"]'), function (r) {
    r.addEventListener('change', function () { if (r.checked) { load(r.value); announce('Showing ' + (state.title || 'routine') + '.'); } });
  });

  /* Picture picker */
  picker.querySelector('.rb-grid').innerHTML = ICONS.map(function (ic) { return '<button type="button" class="rb-pick" data-ic="' + ic[0] + '" aria-label="' + ic[1] + '" title="' + ic[1] + '">' + ic[0] + '</button>'; }).join('');
  function openPicker(i, btn) {
    pickerFor = i; pickerReturn = btn; picker.hidden = false;
    $('#rb-picker-title').textContent = 'Choose a picture for step ' + (i + 1);
    var cur = picker.querySelector('[data-ic="' + state.steps[i].icon + '"]') || picker.querySelector('.rb-pick');
    cur.focus();
  }
  function closePicker() { picker.hidden = true; if (pickerReturn) { var i = pickerFor; var b = list.querySelector('[data-i="' + i + '"] .rb-icon'); (b || pickerReturn).focus(); } pickerFor = -1; }
  picker.addEventListener('click', function (e) {
    var b = e.target.closest('.rb-pick');
    if (b && pickerFor > -1) { state.steps[pickerFor].icon = b.getAttribute('data-ic'); var i = pickerFor; draw(); pickerFor = i; announce('Picture changed to ' + b.getAttribute('aria-label') + '.'); closePicker(); return; }
    if (e.target.closest('.rb-close')) closePicker();
  });
  picker.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); closePicker(); return; }
    var btns = Array.prototype.slice.call(picker.querySelectorAll('.rb-pick')), k = btns.indexOf(document.activeElement);
    if (k < 0) return;
    var cols = Math.round(picker.querySelector('.rb-grid').clientWidth / (btns[0].offsetWidth + 6)) || 8;
    var to = { ArrowRight: k + 1, ArrowLeft: k - 1, ArrowDown: k + cols, ArrowUp: k - cols, Home: 0, End: btns.length - 1 }[e.key];
    if (to != null) { e.preventDefault(); btns[Math.max(0, Math.min(btns.length - 1, to))].focus(); }
    if (e.key === 'Tab') { var f = picker.querySelectorAll('button'); if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  });

  /* Print, save, reset */
  function say(t) { msg.textContent = t; setTimeout(function () { msg.textContent = ''; }, 3000); }
  $('#rb-print').addEventListener('click', function () {
    var area = document.getElementById('print-area');
    if (!area) { area = document.createElement('div'); area.id = 'print-area'; document.body.appendChild(area); }
    area.innerHTML = '<div class="visual-print">' + visualHTML() + '<div class="vp-foot">FASD Compass · fasdcompass.co.uk/routine-builder/</div></div>';
    document.body.classList.add('printing-one');
    var old = document.title; document.title = (state.title || 'My routine') + ' · FASD Compass';
    var done = function () { document.body.classList.remove('printing-one'); area.innerHTML = ''; document.title = old; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); setTimeout(done, 1500); }, 50);
  });
  $('#rb-save').addEventListener('click', function () { store(KEY + state.kind, { title: state.title, ticks: state.ticks, steps: state.steps }); say('Saved on this device only.'); });
  $('#rb-reset').addEventListener('click', function () {
    if (!confirm('Go back to the starting steps for this routine? Your changes to it will be removed from this device.')) return;
    store(KEY + state.kind, null); load(state.kind, true); say('Back to the starting steps.');
  });

  var start = (location.hash || '').replace('#', '');
  if (TEMPLATES[start]) { var r = document.querySelector('input[name="rb-kind"][value="' + start + '"]'); if (r) r.checked = true; load(start); }
  else load('morning');
  window.fasdRoutineState = function () { return JSON.parse(JSON.stringify(state)); };
})();
