import { createBundleStore } from './bundles.js';
import { node, button } from './dom.js';

const validId = (value) =>
  typeof value === 'string' &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) &&
  value.length <= 80;
function validateCatalog(value) {
  if (!Array.isArray(value) || value.length > 100)
    throw Error('Invalid story catalog');
  const ids = new Set();
  for (const s of value) {
    if (
      !s ||
      !validId(s.id) ||
      !validId(s.version) ||
      ids.has(s.id) ||
      !['title', 'category', 'credit'].every(
        (k) =>
          typeof s[k] === 'string' && s[k].length > 0 && s[k].length <= 8000,
      ) ||
      s.manifestUrl !== `./${s.id}/${s.version}/bundle.json` ||
      !/^\.\/covers\/[a-z0-9.-]+\.(svg|webp|png|jpg|jpeg)$/.test(s.cover) ||
      !/^[a-f0-9]{64}$/.test(s.manifestSha256) ||
      !Number.isInteger(s.manifestBytes) ||
      s.manifestBytes <= 0 ||
      !Number.isInteger(s.totalBytes) ||
      s.totalBytes <= 0 ||
      s.totalBytes > 15 * 1024 * 1024
    )
      throw Error('Invalid story catalog');
    ids.add(s.id);
  }
  return value;
}
export function createInteractiveShelf({
  storage,
  onOpen,
  baseUrl = new URL(import.meta.env.BASE_URL, document.baseURI),
}) {
  const store = createBundleStore({ baseUrl }),
    catalogUrl = new URL('interactive/catalog.json', baseUrl),
    key = `interactive-catalog:${catalogUrl}`;
  const element = node('section', 'interactive-shelf');
  let summaries = [],
    active = false,
    generation = 0,
    refreshing = false,
    error = '',
    refreshAgain = false;
  const downloads = new Map();
  try {
    summaries = validateCatalog(JSON.parse(storage?.getItem(key) || '[]'));
  } catch {}
  function current(token) {
    return active && token === generation;
  }
  function render() {
    element.replaceChildren();
    element.hidden = !summaries.length && !error;
    if (element.hidden) return;
    element.append(
      node('h2', '', 'Stories to read and do'),
      node(
        'p',
        '',
        'Your adult reads both editions aloud. Choose how to take part.',
      ),
    );
    if (error) {
      const message = node('p', 'catalog-error', error);
      message.setAttribute('role', 'status');
      element.append(message, button('Retry story catalog', refresh));
    }
    const grid = node('div', 'book-grid interactive-grid');
    element.append(grid);
    const token = generation;
    for (const summary of summaries) {
      const card = node('article', 'interactive-card');
      card.append(node('h3', '', summary.title));
      const img = node('img', 'interactive-cover');
      img.src = new URL(summary.cover, catalogUrl);
      img.alt = summary.title;
      card.prepend(img);
      grid.append(card);
      void store
        .status(summary)
        .then((status) => {
          if (current(token) && card.isConnected)
            renderCard(card, summary, status, token);
        })
        .catch(() => {
          if (current(token))
            card.append(
              node('p', '', 'Download status unavailable. Please try again.'),
            );
        });
    }
  }
  function renderCard(card, summary, status, token) {
    if (!current(token)) return;
    card.querySelector('.download-controls')?.remove();
    const controls = node('div', 'download-controls');
    card.append(controls);
    const bytes = `${(summary.totalBytes / 1024).toFixed(1)} KB`,
      ready = status.status === 'ready';
    const label = ready
      ? 'Ready offline'
      : status.status === 'downloading'
        ? `Downloading ${(status.verifiedBytes / 1024).toFixed(1)} / ${bytes}`
        : status.status === 'update-available'
          ? 'Update available'
          : status.status === 'error'
            ? 'Download needs attention'
            : 'Not downloaded';
    const message = node('p', 'download-status', `${label} · ${bytes}`);
    message.setAttribute('role', 'status');
    controls.append(message);
    if (status.error)
      controls.append(
        node(
          'p',
          'download-error',
          `For your adult: ${status.error.name === 'QuotaExceededError' ? 'There is not enough storage. Remove an unused download and retry.' : status.error.name === 'AbortError' ? 'The download was cancelled. You can retry.' : 'Could not save this version. Check your connection and retry.'}${status.usable ? ' Your saved version is still available.' : ''}`,
        ),
      );
    if (!ready && status.status !== 'downloading')
      controls.append(
        button(
          status.status === 'error'
            ? 'Retry download'
            : status.usable
              ? 'Update download'
              : 'Download story',
          () => download(summary, card, token),
        ),
      );
    if (status.status === 'downloading')
      controls.append(
        button('Cancel download', () => downloads.get(summary.id)?.abort()),
      );
    for (const [edition, label] of [
      ['together', 'Read Together'],
      ['independent', 'Play by Myself'],
    ]) {
      const open = button(
        label,
        () =>
          onOpen({ summary, edition, store, version: status.installedVersion }),
        'quiet-button edition-button',
      );
      open.disabled = !status.usable;
      controls.append(open);
    }
    if (status.usable)
      controls.append(
        button('Remove download', () => {
          const confirmation = node('div', 'download-removal');
          confirmation.append(
            node(
              'p',
              '',
              'For your adult: remove this offline download? Saved activities will be kept.',
            ),
            button('Confirm removal', async () => {
              try {
                await store.remove(summary.id, status.installedVersion);
                if (current(token))
                  renderCard(card, summary, await store.status(summary), token);
              } catch {
                if (current(token))
                  confirmation.append(
                    node(
                      'p',
                      '',
                      'Could not remove the download. Please retry.',
                    ),
                  );
              }
            }),
            button('Keep download', () => confirmation.remove()),
          );
          controls.append(confirmation);
        }),
      );
  }
  async function download(summary, card, token) {
    const controller = new AbortController();
    downloads.set(summary.id, controller);
    try {
      const status = await store.install(summary, {
        signal: controller.signal,
        onProgress: (progress) => {
          if (current(token) && card.isConnected)
            renderCard(card, summary, progress, token);
        },
      });
      if (current(token) && card.isConnected)
        renderCard(card, summary, status, token);
    } catch {
      if (current(token) && card.isConnected)
        renderCard(card, summary, await store.status(summary), token);
    } finally {
      if (downloads.get(summary.id) === controller)
        downloads.delete(summary.id);
    }
  }
  async function refresh() {
    if (refreshing) {
      refreshAgain = true;
      return;
    }
    refreshing = true;
    const token = generation;
    try {
      const url = new URL(catalogUrl);
      url.searchParams.set('shelf', `${Date.now()}-${Math.random()}`);
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw Error('Catalog unavailable');
      const next = validateCatalog(await response.json());
      summaries = next;
      error = '';
      try {
        storage?.setItem(key, JSON.stringify(summaries));
      } catch {}
    } catch {
      error = 'Could not refresh interactive stories.';
    } finally {
      refreshing = false;
      if (current(token)) render();
      if (refreshAgain) {
        refreshAgain = false;
        if (active) void refresh();
      }
    }
  }
  const autoRefresh = () => {
    if (active) void refresh();
  };
  window.addEventListener('online', autoRefresh);
  window.addEventListener('focus', autoRefresh);
  return {
    element,
    refresh,
    attach(container) {
      active = true;
      ++generation;
      container.append(element);
      render();
      void refresh();
    },
    detach() {
      active = false;
      ++generation;
      for (const controller of downloads.values()) controller.abort();
      downloads.clear();
    },
    destroy() {
      this.detach();
      window.removeEventListener('online', autoRefresh);
      window.removeEventListener('focus', autoRefresh);
    },
  };
}
