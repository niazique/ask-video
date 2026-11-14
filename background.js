importScripts('i18n.js');

const HOST = 'com.srtcopy.host';
const WATCH = ['https://www.youtube.com/watch*'];
const MENU = [
  { id: 'srt-root', title: 'Copy subtitles file' },
  { id: 'srt-native', parentId: 'srt-root', title: 'Original language' },
  { id: 'srt-en', parentId: 'srt-root', title: 'English' },
];

chrome.runtime.onInstalled.addListener(async () => {
  await loadLang();
  chrome.contextMenus.removeAll(() => {
    for (const m of MENU) chrome.contextMenus.create({ ...m, title: t(m.title), contexts: ['all'], documentUrlPatterns: WATCH });
  });
});

// The popup's language switch also renames the context menu.
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local' || !changes.lang) return;
  await loadLang();
  for (const m of MENU) chrome.contextMenus.update(m.id, { title: t(m.title) }, () => void chrome.runtime.lastError);
});

// Puts the .srt on the clipboard as a file via the native helper (see native/install.sh).
function copyAsFile(filename, content) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendNativeMessage(HOST, { filename, content }, (res) => {
        if (chrome.runtime.lastError) resolve({ ok: false, error: chrome.runtime.lastError.message });
        else resolve(res?.ok ? res : { ok: false, error: res?.error || 'The helper returned an error' });
      });
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

const send = (tabId, msg) => chrome.tabs.sendMessage(tabId, msg).catch(() => null);

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || (info.menuItemId !== 'srt-native' && info.menuItemId !== 'srt-en')) return;
  await loadLang();
  const spec = { kind: info.menuItemId === 'srt-en' ? 'en' : 'native' };
  const res = await send(tab.id, { type: 'get', spec });
  if (!res) return; // no content script: the tab was opened before the extension was installed
  if (!res.ok) return send(tab.id, { type: 'toast', text: t(res.error), isError: true });

  const file = await copyAsFile(res.filename, res.srt);
  if (file.ok) return send(tab.id, { type: 'toast', text: t('File copied: {0}', res.filename) });

  const text = await send(tab.id, { type: 'copyText', text: res.srt });
  send(tab.id, text?.ok
    ? { type: 'toast', text: t('Copied as text ({0}): the file helper is not installed', t(res.label)) }
    : { type: 'toast', text: t('Could not copy subtitles'), isError: true });
});

// ---------- Ask Claude ----------
// The chat for each video lives in chrome.storage.session, so the answer is kept even
// if the popup is closed while Claude is thinking. The popup just renders that state.

const SYSTEM = [
  'You answer questions about a YouTube video using its subtitles, which the user provides.',
  'Answer in the language the user writes in.',
  'When you refer to a moment in the video, cite its timestamp in square brackets exactly like [12:34] or [1:02:03].',
  'If the subtitles do not contain the answer, say so briefly; you may add general knowledge but mark it as such.',
].join(' ');

// Answer length, chosen with the segments under the input: tl;dr · normal · lecture.
// Each level also sets the format, so a lecture gets headings while tl;dr stays one line.
const LENGTH = [
  'Length: exactly one sentence — the single most important point. No lists, no headings, no preamble.',
  'Length: a few short paragraphs (or a short paragraph and a few bullets) covering the main points, with timestamps where useful. No headings.',
  'Length: a full lecture — a thorough, well-structured answer with section headings (markdown "## Heading"), several paragraphs per section, bullet lists where they help, and timestamps throughout.',
];

const chatKey = (videoId) => `chat:${videoId}`;
const trKey = (videoId) => `tr:${videoId}`;

async function getChat(videoId) {
  const key = chatKey(videoId);
  const chat = (await chrome.storage.session.get(key))[key] || { messages: [], pending: false };
  // A request lost to a service-worker restart must not block the chat forever.
  if (chat.pending && Date.now() - (chat.since || 0) > 5 * 60 * 1000) chat.pending = false;
  return chat;
}
const saveChat = (videoId, chat) => chrome.storage.session.set({ [chatKey(videoId)]: chat });

// A native port (unlike sendNativeMessage) keeps the service worker alive while Claude thinks.
function askHelper(system, prompt, model) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (res) => { if (!done) { done = true; resolve(res); } };
    let port;
    try {
      port = chrome.runtime.connectNative(HOST);
    } catch (e) {
      return finish({ ok: false, error: e.message });
    }
    port.onMessage.addListener((res) => { finish(res || { ok: false, error: 'No answer from the helper' }); port.disconnect(); });
    port.onDisconnect.addListener(() => {
      const err = chrome.runtime.lastError?.message || '';
      finish({ ok: false, error: /not found|forbidden/i.test(err)
        ? 'The ASK Video helper is not installed. Run native/install.sh'
        : err || 'The helper stopped without an answer' });
    });
    port.postMessage({ type: 'ask', system, prompt, model });
  });
}

async function getTranscript(tabId, videoId) {
  const key = trKey(videoId);
  const cached = (await chrome.storage.session.get(key))[key];
  if (cached) return cached;
  const res = await send(tabId, { type: 'transcript' });
  if (!res) throw new Error('Reload the video tab (it was opened before the extension was installed)');
  if (!res.ok) throw new Error(res.error);
  if (res.videoId !== videoId) throw new Error('The video changed. Reopen the popup');
  const tr = { title: res.title, lang: res.lang, transcript: res.transcript };
  await chrome.storage.session.set({ [key]: tr }).catch(() => {}); // too big to cache: just skip it
  return tr;
}

function buildPrompt(tr, history, question) {
  const past = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n\n');
  return [
    `Video title: ${tr.title}`,
    `Subtitles (language: ${tr.lang}):`,
    '<subtitles>', tr.transcript, '</subtitles>',
    past ? `\nConversation so far:\n${past}` : '',
    `\nUser: ${question}`,
  ].join('\n');
}

async function ask(tabId, videoId, question) {
  const chat = await getChat(videoId);
  if (chat.pending) return;
  const history = chat.messages.slice();
  chat.messages.push({ role: 'user', text: question });
  chat.pending = true;
  chat.since = Date.now();
  await saveChat(videoId, chat);

  let reply;
  try {
    const tr = await getTranscript(tabId, videoId);
    // Both chosen in the popup: model (empty = Claude Code default) and answer length.
    const { model, verbosity } = await chrome.storage.local.get(['model', 'verbosity']);
    const length = LENGTH[Number.isInteger(verbosity) ? Math.max(0, Math.min(LENGTH.length - 1, verbosity)) : 1];
    const res = await askHelper(`${SYSTEM} ${length}`, buildPrompt(tr, history, question), model);
    reply = res.ok ? { role: 'assistant', text: res.answer } : { role: 'error', text: res.error };
  } catch (e) {
    reply = { role: 'error', text: e.message };
  }
  const done = await getChat(videoId);
  if (!done.messages.length) return; // the chat was cleared meanwhile
  done.messages.push(reply);
  done.pending = false;
  await saveChat(videoId, done);
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'copyAsFile') {
    copyAsFile(msg.filename, msg.content).then(sendResponse);
    return true;
  }
  if (msg.type === 'ask') {
    ask(msg.tabId, msg.videoId, msg.question);
    sendResponse({ ok: true });
    return false;
  }
  if (msg.type === 'claudeStatus') {
    chrome.runtime.sendNativeMessage(HOST, { type: 'status' }, (res) => {
      const err = chrome.runtime.lastError?.message;
      if (err) sendResponse({ state: /not found|forbidden/i.test(err) ? 'no-helper' : 'error', detail: err });
      else if (!res?.state) sendResponse({ state: 'error', detail: res?.error || 'No answer from the helper' });
      else sendResponse(res);
    });
    return true;
  }
  if (msg.type === 'clearChat') {
    saveChat(msg.videoId, { messages: [], pending: false }).then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});
