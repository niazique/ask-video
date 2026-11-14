// Isolated content script: bridge between the extension and main.js, plus on-page notifications.
(() => {
  let seq = 0;
  const pending = new Map();

  window.addEventListener('message', (e) => {
    const m = e.data;
    if (e.source !== window || !m || m.src !== 'srtcopy-main') return;
    pending.get(m.id)?.(m.reply);
    pending.delete(m.id);
  });

  function askPage(cmd, spec) {
    return new Promise((resolve) => {
      const id = `${Date.now()}-${++seq}`;
      pending.set(id, resolve);
      window.postMessage({ src: 'srtcopy-cs', id, cmd, spec }, location.origin);
      setTimeout(() => {
        if (pending.delete(id)) resolve({ ok: false, error: 'The page did not respond. Reload the tab' });
      }, 15000);
    });
  }

  let toastEl, toastTimer;
  function toast(text, isError) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:2147483647;' +
        'padding:10px 16px;border-radius:8px;font:500 14px/1.4 system-ui,sans-serif;color:#fff;' +
        'box-shadow:0 4px 16px rgba(0,0,0,.35);max-width:80vw;pointer-events:none;transition:opacity .2s';
      document.documentElement.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.style.background = isError ? '#b3261e' : '#1f1f1f';
    toastEl.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.style.opacity = '0'; }, isError ? 5000 : 2500);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.documentElement.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      ta.remove();
      return ok;
    }
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'list') askPage('list').then(sendResponse);
    else if (msg.type === 'get') askPage('get', msg.spec).then(sendResponse);
    else if (msg.type === 'transcript') askPage('transcript').then(sendResponse);
    else if (msg.type === 'seek') askPage('seek', { seconds: msg.seconds }).then(sendResponse);
    else if (msg.type === 'toast') { toast(msg.text, msg.isError); sendResponse({ ok: true }); }
    else if (msg.type === 'copyText') copyText(msg.text).then((ok) => sendResponse({ ok }));
    else return false;
    return true;
  });
})();
