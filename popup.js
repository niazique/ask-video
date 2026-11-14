const $ = (id) => document.getElementById(id);
// clamp() comes from scene.js, loaded before this file.

const ICON_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 19h14"/></svg>';
const ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON_SPARK = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>';

let tabId = null;
let info = null;
let chat = { messages: [], pending: false };
let unavailable = '';
let scene = null; // the TV scene <svg>, created once and kept between renders
let idleScene = null; // the "not on YouTube" scene
let claude = null; // Claude Code status from the helper: { state: 'ready' | 'signed-out' | 'no-claude' | 'no-helper' | 'error' }

$('dlIcon').innerHTML = ICON_DL;

// ---------- Small helpers ----------

let toastTimer;
function toast(text) {
  document.querySelector('.toast')?.remove();
  const box = el('div', 'toast', t(text));
  document.body.appendChild(box);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.remove(), 3500);
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// ---------- Minimal, safe markdown: paragraphs, lists, **bold**, `code`, [mm:ss] ----------

const toSeconds = (stamp) => stamp.replace(/[[\]]/g, '').split(':').reduce((acc, n) => acc * 60 + Number(n), 0);

function inline(parent, text) {
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[(?:\d{1,2}:)?\d{1,2}:\d{2}\])/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) parent.append(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) parent.append(el('strong', null, tok.slice(2, -2)));
    else if (tok.startsWith('`')) parent.append(el('code', null, tok.slice(1, -1)));
    else {
      const b = el('button', 'ts', tok.slice(1, -1));
      b.title = t('Jump to this moment');
      b.dataset.seconds = toSeconds(tok);
      parent.append(b);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parent.append(text.slice(last));
}

function markdown(text) {
  const root = el('div', 'a');
  let list = null, para = null;
  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const num = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (bullet || num) {
      const tag = bullet ? 'ul' : 'ol';
      if (!list || list.tagName.toLowerCase() !== tag) { list = el(tag); root.append(list); }
      para = null;
      const li = el('li');
      inline(li, (bullet || num)[1]);
      list.append(li);
    } else if (!line.trim()) {
      list = null; para = null;
    } else if (heading) {
      list = null; para = null;
      const h = el('h4');
      inline(h, heading[1]);
      root.append(h);
    } else {
      list = null;
      if (!para) { para = el('p'); root.append(para); } else para.append(el('br'));
      inline(para, line);
    }
  }
  return root;
}

// ---------- Rendering ----------

function emptyState(text) {
  const e = el('div', 'empty');
  e.innerHTML = ICON_SPARK;
  e.append(text);
  return e;
}

// ---------- Claude Code setup instructions ----------

const SETUP = {
  'signed-out': {
    title: 'Sign in to Claude Code',
    lead: 'ASK Video answers through Claude Code on this Mac, but it is not signed in.',
    steps: [
      ['Open the Terminal app.'],
      ['Run this command:', 'claude auth login'],
      ['Sign in with your Claude account in the browser that opens.'],
      ['Come back here and press Check again.'],
    ],
  },
  'no-claude': {
    title: 'Install Claude Code',
    lead: 'ASK Video answers through Claude Code, but it was not found on this Mac.',
    steps: [
      ['Install it in Terminal:', 'npm install -g @anthropic-ai/claude-code'],
      ['Sign in:', 'claude auth login'],
      ['Run the helper installer again from the extension folder:', './native/install.sh'],
      ['Come back here and press Check again.'],
    ],
  },
  'no-helper': {
    title: 'Install the ASK Video helper',
    lead: 'The helper connects the extension to Claude Code and copies .srt files.',
    steps: [
      ['In Terminal, open the extension folder and run:', './native/install.sh'],
      ['Reload the extension at chrome://extensions.'],
      ['Come back here and press Check again.'],
    ],
  },
  error: {
    title: 'Could not check Claude Code',
    lead: 'Something went wrong while checking Claude Code.',
    steps: [
      ['Make sure it works in Terminal:', 'claude auth status'],
      ['Come back here and press Check again.'],
    ],
  },
};

function setupPanel() {
  const s = SETUP[claude.state] || SETUP.error;
  const box = el('div', 'setup');
  box.append(el('h3', null, t(s.title)), el('p', null, t(s.lead)));
  const ol = el('ol');
  for (const [text, cmd] of s.steps) {
    const li = el('li', null, t(text));
    if (cmd) {
      const b = el('button', 'cmd');
      b.dataset.cmd = cmd;
      b.append(el('span', null, cmd), el('small', null, t('Click to copy')));
      li.append(b);
    }
    ol.append(li);
  }
  const again = el('button', 'recheck', t('Check again'));
  again.addEventListener('click', () => { again.disabled = true; again.textContent = t('Checking…'); checkClaude(); });
  box.append(ol, again);
  if (claude.state === 'error' && claude.detail) box.append(el('p', 'detail', claude.detail));
  return box;
}

async function checkClaude() {
  claude = await chrome.runtime.sendMessage({ type: 'claudeStatus' }).catch((e) => ({ state: 'error', detail: e.message }));
  render();
}

$('body').addEventListener('click', async (e) => {
  const b = e.target.closest('.cmd');
  if (!b) return;
  await navigator.clipboard.writeText(b.dataset.cmd).catch(() => {});
  toast('Copied');
});

function render() {
  const body = $('body');
  body.replaceChildren();
  const notReady = !!claude && claude.state !== 'ready';

  if (unavailable) {
    // Not on a YouTube video (or the page is not ready): the puzzled critter.
    const e = el('div', 'first');
    if (typeof createIdleScene === 'function') e.append(idleScene ||= createIdleScene());
    e.append(el('p', null, t(unavailable)));
    body.append(e);
  }
  else if (notReady) body.append(setupPanel());
  else if (!chat.messages.length && !chat.pending) {
    // First screen: the TV scene, intro text and the summary suggestion, gone after the first question.
    const e = el('div', 'first');
    if (typeof createTvScene === 'function') e.append(scene ||= createTvScene());
    e.append(el('p', null, t('Claude has already watched this video and is ready to answer any question about it!')));
    const chip = el('button', 'chip', t('Summarize it'));
    chip.dataset.q = 'Summarize this video.';
    e.append(chip);
    body.append(e);
  }
  else {
    for (const m of chat.messages) {
      if (m.role === 'user') body.append(el('div', 'q', m.text));
      else if (m.role === 'assistant') body.append(markdown(m.text));
      else body.append(el('div', 'err', t(m.text)));
    }
    if (chat.pending) body.append(el('div', 'thinking', t('Claude is thinking')));
  }
  // Keep the latest question at the top, so the answer is read from its start.
  const lastQ = [...body.querySelectorAll('.q')].pop();
  body.scrollTop = lastQ ? lastQ.offsetTop - 8 : 0;

  const busy = !!unavailable || notReady || chat.pending;
  $('ask').disabled = busy;
  $('input').disabled = !!unavailable || notReady;
}

// ---------- Ask ----------

function autosize() {
  const ta = $('input');
  ta.style.height = '32px';
  ta.style.height = Math.min(ta.scrollHeight, 96) + 'px';
}

function ask(question) {
  question = question.trim();
  if (!question || chat.pending || unavailable || !info) return;
  $('input').value = '';
  autosize();
  // Show it right away; the background script owns the real state and will update it.
  chat = { messages: [...chat.messages, { role: 'user', text: question }], pending: true };
  render();
  chrome.runtime.sendMessage({ type: 'ask', tabId, videoId: info.videoId, question });
}

$('input').addEventListener('input', autosize);
$('input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    ask($('input').value);
  }
});
$('ask').addEventListener('click', () => ask($('input').value));
$('body').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (chip) ask(t(chip.dataset.q));
});

// Timestamps in answers jump the video to that moment.
$('body').addEventListener('click', async (e) => {
  const b = e.target.closest('.ts');
  if (!b || tabId == null) return;
  const res = await chrome.tabs.sendMessage(tabId, { type: 'seek', seconds: Number(b.dataset.seconds) }).catch(() => null);
  if (!res?.ok) toast(res?.error || 'Could not jump to this moment');
});

// ---------- Copy .srt ----------

const DROPDOWNS = [['dl', 'menu'], ['lang', 'langMenu'], ['model', 'modelMenu']];

function closeMenu() {
  for (const [btn, menu] of DROPDOWNS) {
    $(menu).hidden = true;
    $(btn).classList.remove('open');
  }
}

for (const [btn, menu] of DROPDOWNS) {
  $(btn).addEventListener('click', (e) => {
    e.stopPropagation();
    const open = $(menu).hidden;
    closeMenu();
    $(menu).hidden = !open;
    $(btn).classList.toggle('open', open);
  });
}
document.addEventListener('click', (e) => { if (!e.target.closest('.dl-wrap')) closeMenu(); });

// ---------- Interface language ----------

function applyI18n() {
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach((e) => { e.title = t(e.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((e) => { e.placeholder = t(e.dataset.i18nPlaceholder); });
  $('lang').textContent = LANG.toUpperCase();
  $('langItems').replaceChildren(...I18N_LANGS.map((l) => {
    const b = el('button', 'item' + (l.code === LANG ? ' on' : ''));
    b.dataset.lang = l.code;
    const name = el('span', null, l.name);
    b.append(name, el('span', 'check', '✓'));
    return b;
  }));
  fillTrackNames();
  renderModel();
  renderVerb();
}

// ---------- Claude model ----------

const MODELS = [
  // Exact model IDs, so the label always matches the model that answers.
  { id: '', name: 'Auto' }, // Claude Code's own default model
  { id: 'claude-opus-5-5', name: 'Opus 5.5' },
  { id: 'claude-sonnet-5-5', name: 'Sonnet 5.5' },
  { id: 'claude-haiku-5-5', name: 'Haiku 5.5' },
];
// Earlier versions saved short aliases.
const LEGACY_MODELS = { opus: 'claude-opus-5-5', sonnet: 'claude-sonnet-5-5', haiku: 'claude-haiku-5-5' };
let MODEL = '';

function renderModel() {
  const cur = MODELS.find((m) => m.id === MODEL) || MODELS[0];
  $('model').textContent = t(cur.name);
  $('modelItems').replaceChildren(...MODELS.map((m) => {
    const b = el('button', 'item' + (m.id === cur.id ? ' on' : ''));
    b.dataset.model = m.id;
    b.append(el('span', null, t(m.name)), el('span', 'check', '✓'));
    return b;
  }));
}

$('modelMenu').addEventListener('click', async (e) => {
  const item = e.target.closest('.item');
  if (!item) return;
  closeMenu();
  MODEL = item.dataset.model;
  await chrome.storage.local.set({ model: MODEL });
  renderModel();
});

// ---------- Answer length ----------
// Three segments under the input: tl;dr · normal · lecture. Saved and sent with
// every question (background.js turns the level into an instruction for Claude).

const VERB_LEVELS = ['tl;dr', 'normal', 'lecture'];
const VERB_DEFAULT = 1;
let VERB = VERB_DEFAULT;

function renderVerb() {
  $('verb').replaceChildren(...VERB_LEVELS.map((name, i) => {
    const b = el('button', i === VERB ? 'on' : '', t(name));
    b.type = 'button';
    b.dataset.level = i;
    b.setAttribute('aria-pressed', i === VERB);
    return b;
  }));
}

$('verb').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  VERB = +b.dataset.level;
  chrome.storage.local.set({ verbosity: VERB });
  renderVerb();
});

$('langMenu').addEventListener('click', async (e) => {
  const item = e.target.closest('.item');
  if (!item) return;
  closeMenu();
  LANG = item.dataset.lang;
  await chrome.storage.local.set({ lang: LANG });
  applyI18n();
  render();
});

$('menu').addEventListener('click', async (e) => {
  const item = e.target.closest('.item');
  if (!item || item.disabled) return;
  closeMenu();
  $('dl').disabled = true;
  try {
    const res = await chrome.tabs.sendMessage(tabId, { type: 'get', spec: { kind: item.dataset.kind } });
    if (!res?.ok) return toast(res?.error || 'Could not get subtitles');
    const file = await chrome.runtime.sendMessage({ type: 'copyAsFile', filename: res.filename, content: res.srt });
    if (!file?.ok) {
      await navigator.clipboard.writeText(res.srt);
      toast('Copied as text: the file-copy helper is not installed');
    }
    $('dlIcon').innerHTML = ICON_OK;
    setTimeout(() => { $('dlIcon').innerHTML = ICON_DL; }, 1500);
  } catch (err) {
    toast(err.message);
  } finally {
    $('dl').disabled = false;
  }
});

// ---------- Init ----------

function fillTrackNames() {
  if (!info) return;
  $('nativeName').textContent = info.tracks[info.nativeIndex].name;
  const enItem = $('menu').querySelector('[data-kind="en"]');
  if (info.enIndex >= 0) $('enName').textContent = info.tracks[info.enIndex].name;
  else if (info.canTranslateToEn) $('enName').textContent = t('auto-translated');
  else { enItem.disabled = true; $('enName').textContent = t('not available'); }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'session' || !info) return;
  const c = changes[`chat:${info.videoId}`];
  if (!c) return;
  chat = c.newValue || { messages: [], pending: false };
  render();
  // An answer failed because Claude Code is not set up: show the instructions.
  const last = chat.messages[chat.messages.length - 1];
  if (last?.role === 'error' && /not signed in|was not found|helper is not installed/i.test(last.text)) checkClaude();
});

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // The url is only visible for youtube.com (host_permissions); for other sites it is empty.
  if (!tab?.url || !/^https:\/\/www\.youtube\.com\/watch/.test(tab.url)) {
    unavailable = 'Open a YouTube video to ask Claude about it.';
    return render();
  }
  tabId = tab.id;
  const res = await chrome.tabs.sendMessage(tabId, { type: 'list' }).catch(() => null);
  if (!res) { unavailable = 'Reload the video tab (it was opened before the extension was installed).'; return render(); }
  if (!res.ok) { unavailable = res.error; return render(); }
  info = res;

  $('dl').disabled = false;
  fillTrackNames();

  const key = `chat:${info.videoId}`;
  chat = (await chrome.storage.session.get(key))[key] || { messages: [], pending: false };
  render();
  $('input').focus();
  checkClaude();
}

loadLang().then(async () => {
  const saved = await chrome.storage.local.get(['model', 'verbosity']);
  MODEL = saved.model || '';
  VERB = Number.isInteger(saved.verbosity) ? clamp(saved.verbosity, 0, VERB_LEVELS.length - 1) : VERB_DEFAULT;
  if (LEGACY_MODELS[MODEL]) {
    MODEL = LEGACY_MODELS[MODEL];
    await chrome.storage.local.set({ model: MODEL });
  }
  applyI18n();
  render();
  return init();
}).catch((e) => { unavailable = e.message; render(); });
