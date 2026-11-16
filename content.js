// Isolated content script: bridge between the extension and main.js.
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

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'list') askPage('list').then(sendResponse);
    else if (msg.type === 'get') askPage('get', msg.spec).then(sendResponse);
    else if (msg.type === 'transcript') askPage('transcript').then(sendResponse);
    else if (msg.type === 'seek') askPage('seek', { seconds: msg.seconds }).then(sendResponse);
    else return false;
    return true;
  });
})();
