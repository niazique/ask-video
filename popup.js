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
let laughScene = null; // the YouTube Shorts scene
let readScene = null; // the first screen for web pages
let shorts = false;
let mode = null; // 'video' (a YouTube video, from its subtitles) or 'page' (any page, from its text)
let chatId = null; // the video id, or "page:" + the page address
let page = null; // { title, url, text, cut } read from the page
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

// ---------- Minimal, safe markdown: paragraphs, lists, **bold**, `code`, [mm:ss], [[quote]] ----------

const toSeconds = (stamp) => stamp.replace(/[[\]]/g, '').split(':').reduce((acc, n) => acc * 60 + Number(n), 0);

function inline(parent, text) {
  // Videos get [mm:ss] timestamps, pages get [[quoted fragments]]; both are links.
  const re = mode === 'page'
    ? /(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]\n]{2,300}\]\])/g
    : /(\*\*[^*]+\*\*|`[^`]+`|\[(?:\d{1,2}:)?\d{1,2}:\d{2}\])/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) parent.append(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) parent.append(el('strong', null, tok.slice(2, -2)));
    else if (tok.startsWith('`')) parent.append(el('code', null, tok.slice(1, -1)));
    else if (tok.startsWith('[[')) {
      const b = el('button', 'ql', tok.slice(2, -2).trim());
      b.title = t('Show this place on the page');
      parent.append(b);
    }
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
    lead: 'ASK answers through Claude Code on this Mac, but it is not signed in.',
    steps: [
      ['Open the Terminal app.'],
      ['Run this command:', 'claude auth login'],
      ['Sign in with your Claude account in the browser that opens.'],
      ['Come back here and press Check again.'],
    ],
  },
  'no-claude': {
    title: 'Install Claude Code',
    lead: 'ASK answers through Claude Code, but it was not found on this Mac.',
    steps: [
      ['Install it in Terminal:', 'npm install -g @anthropic-ai/claude-code'],
      ['Sign in:', 'claude auth login'],
      ['Run the helper installer again from the extension folder:', './native/install.sh'],
      ['Come back here and press Check again.'],
    ],
  },
  'no-helper': {
    title: 'Install the ASK helper',
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

// The same screens for Windows: PowerShell instead of Terminal, install.cmd instead of install.sh.
const SETUP_WIN = {
  'signed-out': {
    title: 'Sign in to Claude Code',
    lead: 'ASK answers through Claude Code on this computer, but it is not signed in.',
    steps: [
      ['Open PowerShell (Start menu → type "PowerShell").'],
      ['Run this command:', 'claude auth login'],
      ['Sign in with your Claude account in the browser that opens.'],
      ['Come back here and press Check again.'],
    ],
  },
  'no-claude': {
    title: 'Install Claude Code',
    lead: 'ASK answers through Claude Code, but it was not found on this computer.',
    steps: [
      ['Install it in PowerShell:', 'irm https://claude.ai/install.ps1 | iex'],
      ['Sign in:', 'claude auth login'],
      ['Run the helper installer again: double-click native\\install.cmd in the extension folder.'],
      ['Come back here and press Check again.'],
    ],
  },
  'no-helper': {
    title: 'Install the ASK helper',
    lead: 'The helper connects the extension to Claude Code and copies .srt files.',
    steps: [
      ['In the extension folder, open the native folder and double-click install.cmd.'],
      ['Reload the extension at chrome://extensions.'],
      ['Come back here and press Check again.'],
    ],
  },
  error: {
    title: 'Could not check Claude Code',
    lead: 'Something went wrong while checking Claude Code.',
    steps: [
      ['Make sure it works in PowerShell:', 'claude auth status'],
      ['Come back here and press Check again.'],
    ],
  },
};

// The helper (and so the answers) exists for macOS and Windows; other systems get
// their own screen: what does not work yet, and what still does.
const OS_NAMES = { win: 'Windows', linux: 'Linux', cros: 'ChromeOS', openbsd: 'OpenBSD', fuchsia: 'Fuchsia' };
let OS = 'mac'; // from chrome.runtime.getPlatformInfo(): mac | win | linux | cros | …
const hasHelper = () => OS === 'mac' || OS === 'win';
const SETUP_NOT_MAC = {
  title: 'Answers are not available on {0} yet',
  lead: 'ASK answers through Claude Code using a small helper app, and the helper works only on macOS and Windows for now.',
  steps: [
    ['You can still copy the subtitles: click .SRT at the top, or right-click on a YouTube page.'],
    ['Paste them into Claude (claude.ai or the Claude app) and ask your question there.'],
  ],
};

function setupPanel() {
  const screens = OS === 'win' ? SETUP_WIN : OS === 'mac' ? SETUP : null;
  const s = screens ? screens[claude.state] || screens.error : SETUP_NOT_MAC;
  const box = el('div', 'setup');
  box.append(el('h3', null, t(s.title, OS_NAMES[OS] || OS)), el('p', null, t(s.lead)));
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
  box.append(ol);
  if (!screens) return box;
  const again = el('button', 'recheck', t('Check again'));
  again.addEventListener('click', () => { again.disabled = true; again.textContent = t('Checking…'); checkClaude(); });
  box.append(again);
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
    if (shorts) { if (typeof createLaughScene === 'function') e.append(laughScene ||= createLaughScene()); }
    else if (typeof createIdleScene === 'function') e.append(idleScene ||= createIdleScene());
    e.append(el('p', null, t(unavailable)));
    body.append(e);
  }
  else if (notReady) body.append(setupPanel());
  else if (!chat.messages.length && !chat.pending) {
    // First screen: the scene, intro text and the summary suggestion, gone after the first question.
    const e = el('div', 'first');
    if (mode === 'page') {
      if (typeof createReadScene === 'function') e.append(readScene ||= createReadScene());
      e.append(el('p', null, t('Claude has already read this page and is ready to answer any question about it!')));
    } else {
      if (typeof createTvScene === 'function') e.append(scene ||= createTvScene());
      e.append(el('p', null, t('Claude has already watched this video and is ready to answer any question about it!')));
    }
    const chip = el('button', 'chip', t('Summarize it'));
    chip.dataset.q = mode === 'page' ? 'Summarize this page.' : 'Summarize this video.';
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
  ta.style.height = '30px';
  ta.style.height = Math.min(ta.scrollHeight, 96) + 'px';
}

function ask(question) {
  question = question.trim();
  if (!question || chat.pending || unavailable || !chatId) return;
  $('input').value = '';
  autosize();
  // Show it right away; the background script owns the real state and will update it.
  chat = { messages: [...chat.messages, { role: 'user', text: question }], pending: true };
  render();
  chrome.runtime.sendMessage({ type: 'ask', tabId, id: chatId, kind: mode, question, page });
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

// Quoted fragments in answers about a page scroll the page there and highlight it.
$('body').addEventListener('click', async (e) => {
  const b = e.target.closest('.ql');
  if (!b || tabId == null) return;
  const [res] = await chrome.scripting.executeScript({ target: { tabId }, func: showQuote, args: [b.textContent] }).catch(() => [null]);
  if (!res?.result) toast('Could not find this place on the page');
});

// ---------- Reading the page (these two run inside the page) ----------

function readPage() {
  // The main text: the biggest article / main block, or the whole page.
  let root = document.body, best = 0;
  for (const c of document.querySelectorAll('article, main, [role="main"]')) {
    const n = c.innerText.length;
    if (n > best) { best = n; root = c; }
  }
  if (best < 600) root = document.body;
  let text = (root?.innerText || '').replace(/[ \t\u00a0]+/g, ' ').replace(/ *\n[ \n]*\n */g, '\n\n').trim();
  const MAX = 300000; // about 75k tokens
  const cut = text.length > MAX;
  if (cut) text = text.slice(0, MAX);
  return { title: document.title, url: location.href.split('#')[0], text, cut };
}

function showQuote(quote) {
  // Search the visible text, ignoring case, quote marks and runs of whitespace.
  const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|TEMPLATE)$/;
  const QUOTES = /[\u2018\u2019\u201a\u201c\u201d\u201e\u00ab\u00bb"'`]/;
  const fold = (c) => c.toLowerCase()[0];
  const chars = [], map = [];
  let space = true;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement && !SKIP.test(n.parentElement.tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  for (let n; (n = walker.nextNode());) {
    const v = n.nodeValue;
    for (let i = 0; i < v.length; i++) {
      const c = v[i];
      if (QUOTES.test(c)) continue;
      if (/\s/.test(c)) { if (space) continue; space = true; chars.push(' '); }
      else { space = false; chars.push(fold(c)); }
      map.push([n, i]);
    }
  }
  const hay = chars.join('');
  const norm = (s) => [...s].filter((c) => !QUOTES.test(c)).map((c) => (/\s/.test(c) ? ' ' : fold(c))).join('').replace(/ +/g, ' ').trim();
  const visible = (r) => { const b = r.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
  const rangeAt = (at, len) => {
    const r = document.createRange();
    r.setStart(map[at][0], map[at][1]);
    const [en, eo] = map[at + len - 1];
    r.setEnd(en, eo + 1);
    return r;
  };
  // An ellipsis inside the fragment: search for its longest piece.
  const part = quote.split(/…|\.\.\./).sort((a, b) => b.length - a.length)[0];
  // Try the whole fragment first, then shorter starts of it.
  const words = norm(part).split(' ');
  let found = null;
  for (const k of [words.length, 6, 4, 3]) {
    if (k > words.length || found) continue;
    const needle = words.slice(0, k).join(' ');
    if (needle.length < 8 && k < words.length) continue;
    let firstHit = null;
    for (let at = hay.indexOf(needle); at >= 0; at = hay.indexOf(needle, at + 1)) {
      const r = rangeAt(at, needle.length);
      if (visible(r)) { found = r; break; }
      firstHit ||= r;
    }
    found ||= firstHit;
  }
  if (!found) return false;

  // Bring it into view inside any scrolling box, then centre the fragment itself in the window.
  (found.startContainer.parentElement || document.body).scrollIntoView({ block: 'nearest' });
  const box = found.getBoundingClientRect();
  window.scrollBy({ top: box.top + box.height / 2 - innerHeight / 2, behavior: 'smooth' });
  if (window.CSS?.highlights && window.Highlight) {
    if (!document.getElementById('ask-quote-style')) {
      const st = document.createElement('style');
      st.id = 'ask-quote-style';
      st.textContent = '::highlight(ask-quote) { background: #ffe066; color: inherit; }';
      document.documentElement.appendChild(st);
    }
    CSS.highlights.set('ask-quote', new Highlight(found));
    clearTimeout(window.__askQuoteTimer);
    window.__askQuoteTimer = setTimeout(() => CSS.highlights.delete('ask-quote'), 6000);
  } else {
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(found);
  }
  return true;
}

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
      toast(hasHelper() ? 'Copied as text: the file-copy helper is not installed' : 'Subtitles copied as text');
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
  if (area !== 'session' || !chatId) return;
  const c = changes[`chat:${chatId}`];
  if (!c) return;
  chat = c.newValue || { messages: [], pending: false };
  render();
  // An answer failed because Claude Code is not set up: show the instructions.
  const last = chat.messages[chat.messages.length - 1];
  if (last?.role === 'error' && /not signed in|was not found|helper is not installed/i.test(last.text)) checkClaude();
});

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  if (/^https:\/\/(www|m)\.youtube\.com\/shorts\//.test(url)) {
    shorts = true;
    unavailable = "Shorts? Ha! Claude doesn't do Shorts. Open a regular video.";
    return render();
  }
  if (/^https:\/\/www\.youtube\.com\/watch/.test(url)) return initVideo(tab);
  if (/^https?:/.test(url)) return initPage(tab);
  unavailable = 'Open a web page or a YouTube video to ask Claude about it.';
  render();
}

async function openChat() {
  const key = `chat:${chatId}`;
  chat = (await chrome.storage.session.get(key))[key] || { messages: [], pending: false };
  render();
  $('input').focus();
  checkClaude();
}

async function initVideo(tab) {
  mode = 'video';
  tabId = tab.id;
  $('dl').closest('.dl-wrap').hidden = false;
  const res = await chrome.tabs.sendMessage(tabId, { type: 'list' }).catch(() => null);
  if (!res) { unavailable = 'Reload the video tab (it was opened before the extension was installed).'; return render(); }
  if (!res.ok) { unavailable = res.error; return render(); }
  info = res;
  chatId = info.videoId;
  $('dl').disabled = false;
  fillTrackNames();
  return openChat();
}

async function initPage(tab) {
  mode = 'page';
  tabId = tab.id;
  const input = $('input');
  input.dataset.i18nPlaceholder = 'Ask anything about this page…';
  input.placeholder = t(input.dataset.i18nPlaceholder);
  // activeTab: clicking the toolbar icon lets the popup read this tab.
  const [res] = await chrome.scripting.executeScript({ target: { tabId }, func: readPage }).catch(() => [null]);
  page = res?.result;
  if (!page) { unavailable = 'Chrome does not let extensions read this page.'; return render(); }
  if (page.text.length < 200) { unavailable = 'There is not enough text on this page to ask about.'; return render(); }
  chatId = 'page:' + page.url;
  return openChat();
}

loadLang().then(async () => {
  try { OS = (await chrome.runtime.getPlatformInfo()).os; } catch {}
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
