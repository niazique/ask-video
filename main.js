// Runs in the YouTube page context (world: MAIN): it needs access to the player API.
(() => {
  if (window.__srtCopyMain) return;
  window.__srtCopyMain = true;

  // YouTube only serves subtitles with a token (pot) that the player adds to its
  // own request. Remember such requests by video id.
  const playerRequests = new Map();
  const remember = (name) => {
    if (!name.includes('/api/timedtext')) return;
    try {
      const u = new URL(name);
      if (u.searchParams.get('pot')) playerRequests.set(u.searchParams.get('v'), u);
    } catch {}
  };
  try {
    new PerformanceObserver((list) => list.getEntries().forEach((e) => remember(e.name)))
      .observe({ type: 'resource', buffered: true });
  } catch {}

  const CLIENT_PARAMS = ['pot', 'potc', 'c', 'cver', 'cplayer', 'cbr', 'cbrver', 'cbrand',
    'cos', 'cosver', 'cplatform', 'xorb', 'xobt', 'xovt'];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const player = () => document.getElementById('movie_player');
  const trackName = (t) => t.name?.simpleText || (t.name?.runs || []).map((r) => r.text).join('') || t.languageCode;
  const isEn = (t) => /^en(-|$)/i.test(t.languageCode);

  function getInfo() {
    if (location.pathname !== '/watch') throw new Error('Open a video page');
    const mp = player();
    const pr = mp?.getPlayerResponse?.();
    if (!pr) throw new Error('The player has not loaded yet');
    const videoId = pr.videoDetails?.videoId;
    const urlId = new URLSearchParams(location.search).get('v');
    if (urlId && videoId !== urlId) throw new Error('The video is still loading (or an ad is playing). Try again in a few seconds');
    const tl = pr.captions?.playerCaptionsTracklistRenderer;
    const tracks = tl?.captionTracks || [];
    if (!tracks.length) throw new Error('This video has no subtitles');

    // Original language: the default caption track for the main audio track,
    // otherwise the auto-generated track, otherwise the first track.
    let nativeIndex = tl.audioTracks?.[tl.defaultAudioTrackIndex ?? 0]?.defaultCaptionTrackIndex;
    if (!(nativeIndex >= 0 && nativeIndex < tracks.length)) {
      nativeIndex = tracks.findIndex((t) => t.kind === 'asr');
      if (nativeIndex < 0) nativeIndex = 0;
    }
    // If the original track is auto-generated and a manual one exists in the same language, use the manual one.
    if (tracks[nativeIndex].kind === 'asr') {
      const manual = tracks.findIndex((t) => t.kind !== 'asr' && t.languageCode === tracks[nativeIndex].languageCode);
      if (manual >= 0) nativeIndex = manual;
    }

    let enIndex = tracks.findIndex((t) => isEn(t) && t.kind !== 'asr');
    if (enIndex < 0) enIndex = tracks.findIndex(isEn);

    return {
      mp, tracks, videoId, nativeIndex, enIndex,
      title: pr.videoDetails?.title || document.title.replace(/ - YouTube$/, ''),
      canTranslateToEn: !!tracks[nativeIndex].isTranslatable,
    };
  }

  // Get the player's tokenized request; if the player has not loaded subtitles yet,
  // briefly turn them on and then restore the previous state.
  async function getPlayerRequest(info) {
    if (playerRequests.has(info.videoId)) return playerRequests.get(info.videoId);
    const { mp } = info;
    const wasOn = !!mp.getOption?.('captions', 'track')?.languageCode;
    try { mp.loadModule?.('captions'); } catch {}
    const lang = info.tracks[info.nativeIndex].languageCode;
    // Right after a page load the player can take several seconds, so wait up to ~10 s.
    for (let i = 0; i < 70 && !playerRequests.has(info.videoId); i++) {
      // The captions module takes a moment to load, so keep retrying until it works.
      if (i % 5 === 0) { try { mp.setOption('captions', 'track', { languageCode: lang }); } catch {} }
      await sleep(150);
    }
    if (!wasOn) { try { mp.setOption('captions', 'track', {}); } catch {} }
    const req = playerRequests.get(info.videoId);
    if (!req) throw new Error('Could not get subtitles from the player. Reload the page and try again');
    return req;
  }

  const pad = (n, w = 2) => String(n).padStart(w, '0');
  function ts(ms) {
    ms = Math.max(0, Math.round(ms));
    const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60,
      s = Math.floor(ms / 1000) % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms % 1000, 3)}`;
  }

  function toCues(json) {
    const cues = [];
    for (const ev of json.events || []) {
      if (!ev.segs) continue;
      const text = ev.segs.map((s) => s.utf8 || '').join('').replace(/​/g, '')
        .split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
      if (!text) continue;
      const start = ev.tStartMs || 0;
      cues.push({ start, end: start + (ev.dDurationMs || 0), text });
    }
    // Auto-generated cues overlap in time, so trim each one at the start of the next.
    for (let i = 0; i < cues.length; i++) {
      const next = cues[i + 1];
      if (next && cues[i].end > next.start) cues[i].end = next.start;
      if (cues[i].end <= cues[i].start) cues[i].end = cues[i].start + 1000;
    }
    return cues;
  }

  const toSrt = (cues) => cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n');

  // Compact transcript for Claude: "[mm:ss] text", lines merged into ~20-second chunks.
  function clock(ms) {
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600);
    return h ? `${h}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  }
  function toTranscript(cues) {
    const out = [];
    let cur = null;
    for (const c of cues) {
      const text = c.text.replace(/\s+/g, ' ');
      if (!cur || c.start - cur.start > 20000) { cur = { start: c.start, parts: [] }; out.push(cur); }
      if (cur.parts[cur.parts.length - 1] !== text) cur.parts.push(text);
    }
    return out.map((p) => `[${clock(p.start)}] ${p.parts.join(' ')}`).join('\n');
  }

  function seek(seconds) {
    const mp = player();
    if (!mp?.seekTo) throw new Error('The player is not ready');
    mp.seekTo(Math.max(0, Number(seconds) || 0), true);
    mp.playVideo?.();
    return {};
  }

  function list() {
    const info = getInfo();
    return {
      videoId: info.videoId,
      title: info.title,
      nativeIndex: info.nativeIndex,
      enIndex: info.enIndex,
      canTranslateToEn: info.canTranslateToEn,
      tracks: info.tracks.map((t, index) => ({
        index, lang: t.languageCode, name: trackName(t), asr: t.kind === 'asr',
      })),
    };
  }

  // spec: {kind:'native'} | {kind:'en'} | {kind:'track', index}; as: 'srt' | 'transcript'
  async function getSrt(spec, as = 'srt') {
    const info = getInfo();
    let index, tlang = null;
    if (spec.kind === 'track') index = spec.index;
    else if (spec.kind === 'en') {
      if (info.enIndex >= 0) index = info.enIndex;
      else if (info.canTranslateToEn) { index = info.nativeIndex; tlang = 'en'; }
      else throw new Error('No English subtitles, and auto-translation is not available for this video');
    } else index = info.nativeIndex;
    const track = info.tracks[index];
    if (!track) throw new Error('Subtitle track not found');

    const req = await getPlayerRequest(info);
    const url = new URL(track.baseUrl, location.origin);
    for (const k of CLIENT_PARAMS) {
      const v = req.searchParams.get(k);
      if (v != null) url.searchParams.set(k, v);
    }
    url.searchParams.set('fmt', 'json3');
    if (tlang) url.searchParams.set('tlang', tlang);

    const res = await fetch(url);
    const body = await res.text();
    if (!res.ok || !body) throw new Error('YouTube did not return subtitles. Reload the page and try again');
    const cues = toCues(JSON.parse(body));
    if (!cues.length) throw new Error('The subtitles are empty');

    const lang = tlang || track.languageCode;
    if (as === 'transcript') {
      return { videoId: info.videoId, title: info.title, lang, transcript: toTranscript(cues) };
    }
    const srt = toSrt(cues);
    const safeTitle = info.title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100) || info.videoId;
    return {
      srt,
      lang,
      label: tlang ? 'English (auto-translated)' : trackName(track),
      filename: `${safeTitle}.${lang}.srt`,
    };
  }

  window.addEventListener('message', async (e) => {
    const m = e.data;
    if (e.source !== window || !m || m.src !== 'srtcopy-cs') return;
    let reply;
    try {
      const result = m.cmd === 'list' ? list()
        : m.cmd === 'seek' ? seek(m.spec?.seconds)
        : m.cmd === 'transcript' ? await getSrt({ kind: 'native' }, 'transcript')
        : await getSrt(m.spec || { kind: 'native' });
      reply = { ok: true, ...result };
    } catch (err) {
      reply = { ok: false, error: err?.message || String(err) };
    }
    window.postMessage({ src: 'srtcopy-main', id: m.id, reply }, location.origin);
  });
})();
