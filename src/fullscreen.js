// A native request must run directly from the user's tap. Unsupported or denied
// requests still provide a viewport-filling reader, without claiming to hide browser UI.
export function createFullscreen({ element, button, status, onChange }) {
  let wanted = false, disposed = false;
  let nativeActive = false;
  let generation = 0;
  let exiting;
  const current = () => document.fullscreenElement || document.webkitFullscreenElement;

  function render(mode) {
    const expanded = mode !== 'normal';
    element.classList.toggle('is-expanded', expanded);
    document.body.classList.toggle('reader-expanded', expanded);
    const label = mode === 'expanded' ? 'Exit expanded view' : expanded ? 'Exit full screen' : 'Full screen';
    button.setAttribute('aria-label', label);
    button.title = label;
    if (expanded) {
      button.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 9h5V4m11 5h-5V4M4 15h5v5m11-5h-5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else button.textContent = label;
    button.setAttribute('aria-pressed', String(expanded));
    status.hidden = mode !== 'expanded';
    status.textContent = mode === 'expanded'
      ? 'Your browser cannot hide its bars in full screen. Expanded view is on; Add to Home Screen for more space.'
      : '';
    onChange();
  }

  async function exitNative() {
    if (exiting) return exiting;
    if (current() !== element) return;
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!exit) return;
    try {
      exiting = Promise.resolve(exit.call(document));
      await exiting;
    } catch { /* The browser may have already exited. Keep the control usable. */ }
    finally { exiting = undefined; }
  }

  async function enter() {
    wanted = true;
    const requestGeneration = ++generation;
    render('pending');
    const request = element.requestFullscreen || element.webkitRequestFullscreen;
    try {
      if (request && document.fullscreenEnabled !== false) {
        await request.call(element, { navigationUI: 'hide' });
      }
    } catch { /* A refusal uses the same expanded layout as an unsupported browser. */ }
    if (!wanted || requestGeneration !== generation) {
      if (!wanted) await exitNative();
      return;
    }
    nativeActive = current() === element;
    render(nativeActive ? 'native' : 'expanded');
  }

  async function exit({ restoreFocus = true } = {}) {
    wanted = false;
    ++generation;
    render('normal');
    await exitNative();
    nativeActive = current() === element;
    if (nativeActive && !element.hidden && !disposed) {
      wanted = true;
      render('native');
    }
    if (restoreFocus && !element.hidden && !disposed) button.focus({ preventScroll: true });
  }

  function nativeChanged() {
    if (current() === element) {
      nativeActive = true;
      if (wanted) render('native');
      else void exitNative();
    } else if (nativeActive) {
      nativeActive = false;
      wanted = false;
      ++generation;
      render('normal');
      if (!element.hidden) button.focus({ preventScroll: true });
    }
  }
  document.addEventListener('fullscreenchange', nativeChanged);
  document.addEventListener('webkitfullscreenchange', nativeChanged);
  const toggle = () => { void (wanted ? exit() : enter()); };
  button.addEventListener('click', toggle);
  render('normal');
  return { exit, isExpanded: () => wanted, destroy() { if(disposed)return; void exit({ restoreFocus: false }); disposed=true; document.removeEventListener('fullscreenchange', nativeChanged); document.removeEventListener('webkitfullscreenchange', nativeChanged); button.removeEventListener('click', toggle); } };
}
