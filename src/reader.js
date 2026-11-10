import { createIllustration } from './illustration.js';

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const landscape = matchMedia('(orientation: landscape)');

export function createReader({ frame, onPage, onNext, onBack, speedForPage = () => 1 }) {
  let book, page = 0, flip, loading, active = false, failed = false, layoutKey = '', suppress = false;
  const native = document.createElement('div'); native.className = 'plain-book';
  const curled = document.createElement('div'); curled.className = 'flip-book';
  frame.append(curled, native);
  const spread = () => landscape.matches ? 2 : 1;
  const fallback = () => motion.matches || failed || !flip;
  let plainPages = [], flipPages = [], plainKey = '', visibleScenes = new Set();
  const scenes = new Map();
  let userPaused = false;
  const scenePages = new Map();
  function pages() {
    return book.pages.map((entry, index) => {
      const el = document.createElement('article'); el.className = 'story-page';
      el.setAttribute('aria-label', `Page ${index + 1}`);
      const illustration = createIllustration({ bookId: book.id, page: entry });
      illustration.setReducedMotion(motion.matches); scenes.set(el, illustration); scenePages.set(illustration, index);
      illustration.setSpeed(speedForPage(book.id, index));
      const text = document.createElement('p'); text.textContent = entry.text;
      const number = document.createElement('span'); number.className = 'page-number'; number.textContent = index + 1;
      const content = document.createElement('div'); content.className = 'page-content';
      content.append(illustration.element, text, number); el.append(content); return el;
    });
  }
  function sync() {
    if (!book) return;
    native.hidden = !fallback(); curled.hidden = fallback();
    if (fallback()) {
      const key = `${page}-${spread()}`;
      if (key !== plainKey) { native.replaceChildren(...plainPages.slice(page, page + spread())); plainKey = key; }
      native.style.setProperty('--spread', spread());
    }
    // Hidden page text must not be read by assistive technology.
    curled.querySelectorAll('.story-page').forEach((el, index) => el.setAttribute('aria-hidden', String(index < page || index >= page + spread())));
    syncScenes();
    onPage(page, spread());
  }
  function syncScenes(turnState = flip?.getState()) {
    const shown = active ? (fallback() ? plainPages : flipPages).slice(page, page + spread()) : [];
    const current = new Set(shown.map(el => scenes.get(el)));
    const paused = userPaused || document.hidden || motion.matches || (!fallback() && turnState !== 'read');
    for (const controller of scenes.values()) {
      controller.setReducedMotion(motion.matches);
      if (!current.has(controller)) controller.pause();
      else {
        if (!visibleScenes.has(controller)) controller.reset();
        if (paused) controller.pause(); else controller.activate();
      }
    }
    visibleScenes = current;
  }
  function dimensions() {
    const expanded = frame.parentElement.classList.contains('is-expanded');
    const w = Math.max(1, Math.floor((expanded ? frame.clientWidth : Math.min(1000, frame.clientWidth)) / spread()));
    const h = expanded ? Math.max(1, Math.floor(frame.clientHeight)) : Math.max(420, Math.min(680, innerHeight - 230));
    return { w, h, key: `${w}-${h}-${spread()}` };
  }
  function finishTurn() {
    if (!flip) return;
    const wasSuppressed = suppress;
    suppress = true;
    try {
      if (flip.getState() === 'user_fold') flip.getFlipController().stopMove();
      flip.getRender().finishAnimation();
    } finally { suppress = wasSuppressed; }
  }
  function resize() {
    if (!active || !book) return;
    const { w, h, key } = dimensions();
    frame.style.setProperty('--page-height', `${h}px`);
    if (flip && key !== layoutKey) {
      layoutKey = key;
      const desired = page;
      finishTurn();
      Object.assign(flip.getSettings(), { width: w, height: h });
      curled.style.minWidth = `${w}px`; curled.style.minHeight = `${h}px`;
      curled.style.width = `${w * spread()}px`; curled.style.height = `${h}px`;
      suppress = true;
      flip.update(); flip.turnToPage(desired);
      suppress = false;
      page = flip.getCurrentPageIndex();
    }
    sync();
  }
  async function loadFlip() {
    if (motion.matches || failed || flip || loading) return;
    loading = true;
    try {
      const { PageFlip } = await import('page-flip');
      if (!active) return;
      const { w, h, key } = dimensions(); layoutKey = key;
      curled.style.width = `${w * spread()}px`; curled.style.height = `${h}px`;
      curled.hidden = false;
      flip = new PageFlip(curled, { width: w, height: h, size: 'fixed', autoSize: false, usePortrait: true, showCover: false, startPage: page, flippingTime: 450, maxShadowOpacity: 0.15, mobileScrollSupport: true, showPageCorners: false, disableFlipByClick: true });
      flip.on('flip', event => { if (suppress) return; page = event.data; if (active) sync(); });
      flip.on('init', () => { if (active) sync(); });
      // The library emits before updating getState(); use the announced state.
      flip.on('changeState', event => syncScenes(event.data));
      flipPages = pages(); flip.loadFromHTML(flipPages);
      sync();
    } catch { failed = true; sync(); }
    finally { loading = false; }
  }
  // Keep one PageFlip instance: its upstream render loop has no stop API.
  // Reusing it avoids accumulating loops when moving between books.
  function open(story, initialPage = 0) {
    finishTurn();
    for (const controller of scenes.values()) controller.destroy();
    scenes.clear(); scenePages.clear(); visibleScenes.clear(); userPaused = false; plainKey = ''; flipPages = [];
    book = story; page = initialPage; active = true;
    plainPages = pages();
    if (flip) {
      suppress = true; flip.turnToPage(0); flipPages = pages(); flip.updateFromHtml(flipPages); flip.turnToPage(page); suppress = false;
    }
    resize(); void loadFlip();
  }
  function go(direction) {
    if (!active || (flip && !fallback() && flip.getState() !== 'read')) return;
    if (direction > 0 && page + spread() >= book.pages.length) return onNext();
    if (direction < 0 && page === 0) return;
    if (fallback()) {
      page = Math.max(0, Math.min(book.pages.length - 1, page + direction * spread())); sync();
    } else if (direction > 0) flip.flipNext(); else flip.flipPrev();
  }
  frame.addEventListener('click', event => {
    if (!active || event.target.closest('button, a')) return;
    const bounds = frame.getBoundingClientRect(); const x = event.clientX - bounds.left;
    if (x < bounds.width * 0.18) onBack();
    else if (x > bounds.width * 0.82) onNext();
  });
  // StPageFlip has no page beyond the last spread. A final forward swipe
  // proceeds to questions, just like a forward edge tap.
  let finalSwipeStart;
  frame.addEventListener('touchstart', e => {
    finalSwipeStart = active && !fallback() && page + spread() >= book.pages.length
      ? e.changedTouches[0] : null;
  }, { passive: true });
  frame.addEventListener('touchend', e => {
    if (!finalSwipeStart) return;
    const end = e.changedTouches[0];
    const dx = end.clientX - finalSwipeStart.clientX;
    const dy = end.clientY - finalSwipeStart.clientY;
    finalSwipeStart = null;
    if (active && dx < -45 && Math.abs(dy) < Math.abs(dx)) onNext();
  }, { passive: true });
  frame.addEventListener('touchcancel', () => { finalSwipeStart = null; });
  let start;
  native.addEventListener('touchstart', e => { start = e.changedTouches[0]; }, { passive: true });
  native.addEventListener('touchend', e => {
    if (!start) return;
    const end = e.changedTouches[0]; const dx = end.clientX - start.clientX;
    if (Math.abs(dx) > 45 && Math.abs(end.clientY - start.clientY) < Math.abs(dx)) dx < 0 ? onNext() : onBack();
    start = null;
  }, { passive: true });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => syncScenes());
  window.visualViewport?.addEventListener('resize', resize);
  const observer = new ResizeObserver(resize);
  observer.observe(frame);
  motion.addEventListener('change', () => {
    if (!active) return;
    finishTurn();
    if (flip && !motion.matches) {
      suppress = true;
      flip.turnToPage(page);
      suppress = false;
      page = flip.getCurrentPageIndex();
    }
    resize();
    void loadFlip();
  });
  return { open,
    refreshSpeeds() { for (const controller of scenes.values()) controller.setSpeed(speedForPage(book.id, scenePages.get(controller))); },
    setPaused(value) { userPaused = value; syncScenes(); },
    replay() { userPaused = false; for (const controller of visibleScenes) controller.reset(); syncScenes(); },
    close() { active = false; finishTurn(); syncScenes(); }, go, spread, resize };

}
