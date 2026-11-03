// FASD Compass optional live AI layer. v1.2.8
// SWITCHED OFF. Nothing in this file sends data unless LIVE_AI_ENABLED is true AND an
// endpoint is set AND the device is online. Turning it on also needs the page's
// Content-Security-Policy connect-src to allow the endpoint, the privacy page update
// and DPIA sign-off. See worker/README.md.
(function () {
  const LIVE_AI_ENABLED = false;
  const LIVE_AI_ENDPOINT = ''; // for example https://ai.fasdcompass.co.uk/ask
  const TIMEOUT_MS = 20000;
  const ELIGIBLE = ['answer', 'near', 'fallback']; // never crisis, safeguarding, emergency or questionnaire replies
  const LABEL = 'AI-written answer based on FASD Compass content. It may contain mistakes. Check anything important with a professional.';
  const DISCLOSURE = ' If you choose "Ask for a fuller answer", your question is sent over the internet to an AI service, with the personal details we spot removed first. It is not stored by FASD Compass or used to train AI. See our privacy page.';

  function available() {
    return LIVE_AI_ENABLED === true && !!LIVE_AI_ENDPOINT && typeof navigator !== 'undefined' && navigator.onLine === true;
  }

  async function ask(payload) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(LIVE_AI_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), signal: ctrl.signal, credentials: 'omit', cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data && data.ok && typeof data.text === 'string' ? data : null;
    } catch (e) { return null; } finally { clearTimeout(t); }
  }

  function offer(bubble, reply, audience) {
    if (!available() || !reply || !ELIGIBLE.includes(reply.kind) || !reply.redacted) return;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'chat-live-btn';
    btn.textContent = 'Ask for a fuller answer (uses live AI, needs internet)';
    btn.addEventListener('click', async () => {
      if (!navigator.onLine) { btn.textContent = 'You are offline. The answer above is from our approved information.'; btn.disabled = true; return; }
      btn.disabled = true; btn.textContent = 'Getting a fuller answer…';
      const ids = reply.id ? [reply.id] : (reply.ids || []);
      const data = await ask({ question: reply.redacted.slice(0, 500), audience, ids });
      btn.remove();
      if (data) appendMsg('bot', data.text, data.ai === true ? LABEL : '');
      else appendMsg('bot', "I couldn't get a fuller answer just now. The answer above is from our approved FASD Compass information.");
    });
    bubble.appendChild(btn);
  }

  function init() {
    if (!(LIVE_AI_ENABLED === true && LIVE_AI_ENDPOINT)) return;
    const chip = document.querySelector('.disclaimer-chip');
    if (chip && !chip.dataset.live) { chip.dataset.live = '1'; chip.appendChild(document.createTextNode(DISCLOSURE)); }
  }
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', init);

  window.FASDLive = { offer, available, config: { enabled: LIVE_AI_ENABLED, endpoint: LIVE_AI_ENDPOINT } };
})();
