import './style.css';
import { animationSpeeds, loadAnimationSettings, saveAnimationSettings, resolveSpeed, setSpeed } from './animation-settings.js';
import { registerSW } from 'virtual:pwa-register';
import { validateStory } from './story.js';
import { createSession, advance, back, revealAnswer, setPage } from './session.js';
import { loadPreferences, savePreferences } from './storage.js';
import { createBedtimeServices } from './services.js';
import { createReader } from './reader.js';
import { createFullscreen } from './fullscreen.js';

const main = document.querySelector('#main');
const readerView = document.querySelector('#reader');
let storage;
try { storage = window.localStorage; } catch {}
const preferences = loadPreferences(storage);
const animationSettings = loadAnimationSettings(storage);
const services = createBedtimeServices();
let books = [], session = null, installPrompt, updateSW, updateAvailable = false;
const el = (tag, className, text) => {
  const node = document.createElement(tag); if (className) node.className = className;
  if (text !== undefined) node.textContent = text; return node;
};
function button(text, handler, className = 'button') {
  const node = el('button', className, text); node.type = 'button'; node.addEventListener('click', handler); return node;
}
function focusHeading(container = main) {
  const heading = container.querySelector('h1');
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  window.scrollTo(0, 0);
}
function persist() { savePreferences(storage, preferences); }
function syncPreferences() {
  document.body.classList.toggle('warm', preferences.warm);
  document.querySelector('#warm-toggle').setAttribute('aria-pressed', String(preferences.warm));
  const sound = document.querySelector('#sound-toggle');
  sound.setAttribute('aria-pressed', String(preferences.sound)); sound.textContent = preferences.sound ? '♪ Sound on' : '♪ Sound off';
}
document.querySelector('#warm-toggle').addEventListener('click', () => { preferences.warm = !preferences.warm; syncPreferences(); persist(); });
document.querySelector('#sound-toggle').addEventListener('click', () => { preferences.sound = !preferences.sound; syncPreferences(); persist(); services.sound('chime', preferences.sound); });
document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); showShelf(); });
syncPreferences();

// The reader DOM stays mounted so PageFlip can reuse its single render loop.
const readerBar = el('div', 'reader-bar');
const shelfButton = button('← Bookshelf', showShelf, 'text-button');
const readerTitle = el('h1', 'reader-title');
const progress = el('span', 'page-progress'); progress.dataset.testid = 'page-progress'; progress.setAttribute('role', 'status');
const fullscreenButton = el('button', 'quiet-button fullscreen-toggle', 'Full screen');
fullscreenButton.type = 'button'; fullscreenButton.setAttribute('aria-controls', 'reader');
readerBar.append(shelfButton, readerTitle, progress, fullscreenButton);
const frame = el('div', 'book-frame');
const readerControls = el('nav', 'reader-controls'); readerControls.setAttribute('aria-label', 'Turn pages');
const previous = button('← Previous page', () => turn(-1), 'quiet-button'); previous.setAttribute('aria-label', 'Previous page');
const dots = el('div', 'page-dots'); dots.setAttribute('aria-hidden', 'true');
const next = button('Next page →', () => turn(1)); next.setAttribute('aria-label', 'Next page');
readerControls.append(previous, dots, next);
const readerTip = el('p', 'reader-tip', 'Read slowly. Point at the pictures. Enjoy being here together.');
const fullscreenStatus = el('p', 'fullscreen-status'); fullscreenStatus.setAttribute('role', 'status'); fullscreenStatus.hidden = true;
const animationPanel = el('details', 'animation-settings');
animationPanel.append(el('summary', '', 'Illustration settings'));
const animationFields = el('div', 'animation-fields');
function settingSelect(label, inherit = false) {
  const wrapper = el('label', '', label);
  const select = el('select');
  if (inherit) { const option = el('option', '', 'Inherit'); option.value = ''; select.append(option); }
  for (const speed of animationSpeeds) { const option = el('option', '', `${speed}×`); option.value = speed; select.append(option); }
  wrapper.append(select); animationFields.append(wrapper); return select;
}
const globalSpeed = settingSelect('Default speed');
const bookSpeed = settingSelect('This book', true);
const pageChoiceLabel = el('label', '', 'Choose page');
const pageChoice = el('select'); pageChoiceLabel.append(pageChoice); animationFields.append(pageChoiceLabel);
const pageSpeed = settingSelect('This page', true);
let illustrationsPaused = false;
const pauseIllustrations = button('Pause illustrations', () => {
  illustrationsPaused = !illustrationsPaused; reader.setPaused(illustrationsPaused); syncPause();
}, 'quiet-button');
function syncPause() {
  pauseIllustrations.textContent = illustrationsPaused ? 'Resume illustrations' : 'Pause illustrations';
  pauseIllustrations.setAttribute('aria-pressed', String(illustrationsPaused));
}
const replayIllustrations = button('Replay illustrations', () => { illustrationsPaused = false; reader.replay(); syncPause(); }, 'quiet-button');
animationFields.append(pauseIllustrations, replayIllustrations);
const motionNote = el('p', 'animation-note', 'Reduced motion keeps pictures still when enabled on your device.');
animationPanel.append(animationFields, motionNote);
readerView.append(readerBar, animationPanel, frame, readerControls, readerTip, fullscreenStatus);
function syncAnimationFields() {
  if (!session) return;
  globalSpeed.value = String(animationSettings.global);
  bookSpeed.value = String(animationSettings.books[session.story.id] ?? '');
  pageSpeed.value = String(animationSettings.pages[session.story.id]?.[pageChoice.value] ?? '');
}
for (const [select, scope] of [[globalSpeed, 'global'], [bookSpeed, 'book'], [pageSpeed, 'page']]) select.addEventListener('change', () => {
  if (!session) return;
  setSpeed(animationSettings, scope, select.value === '' ? null : Number(select.value), session.story.id, Number(pageChoice.value));
  saveAnimationSettings(storage, animationSettings); reader.refreshSpeeds(); syncAnimationFields();
});
pageChoice.addEventListener('change', syncAnimationFields);
const reader = createReader({ frame, speedForPage: (id, page) => resolveSpeed(animationSettings, id, page), onPage: updatePage, onNext: () => turn(1), onBack: () => turn(-1) });
const fullscreen = createFullscreen({ element: readerView, button: fullscreenButton, status: fullscreenStatus, onChange: () => reader.resize() });
function updatePage(page, spread) {
  if (!session || session.view !== 'reader') return;
  const changed = page !== session.page;
  session = setPage(session, page);
  const end = Math.min(page + spread, session.story.pages.length);
  progress.textContent = `${spread > 1 && end > page + 1 ? `${page + 1}–${end}` : page + 1} / ${session.story.pages.length}`;
  previous.disabled = page === 0;
  const selected = Number(pageChoice.value);
  pageChoice.replaceChildren(...session.story.pages.slice(page, end).map((_, offset) => {
    const option = el('option', '', `Page ${page + offset + 1}`); option.value = page + offset; return option;
  }));
  pageChoice.value = String(selected >= page && selected < end ? selected : page);
  syncAnimationFields();
  const last = end === session.story.pages.length;
  next.textContent = last ? 'Let’s talk' : 'Next page →'; next.setAttribute('aria-label', last ? 'Let’s talk' : 'Next page');
  dots.replaceChildren(...session.story.pages.map((_, i) => el('span', i >= page && i < end ? 'active' : '')));
  readerView.style.setProperty('--wind-down', String((page / Math.max(1, session.story.pages.length - 1)) * 0.13));
  if (changed) services.sound('turn', preferences.sound);
}
function startBook(story) {
  session = createSession(story);
  illustrationsPaused = false; syncPause();
  main.hidden = true; readerView.hidden = false; document.body.classList.add('reading');
  readerTitle.textContent = story.title;
  reader.open(story); void services.setReading(true); focusHeading(readerView);
}
function turn(direction) {
  if (!session || session.view !== 'reader') return;
  if (direction > 0 && session.page + reader.spread() >= session.story.pages.length) {
    session = advance(session, reader.spread()); reader.close(); void fullscreen.exit({ restoreFocus: false });
    readerView.hidden = true; main.hidden = false; document.body.classList.remove('reading');
    services.sound('chime', preferences.sound); showQuestion();
  } else reader.go(direction);
}
window.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select')) return;
  if (session?.view === 'reader' && ['ArrowRight', 'ArrowLeft'].includes(event.key)) { event.preventDefault(); turn(event.key === 'ArrowRight' ? 1 : -1); }
  if (session && event.key === 'Escape') {
    if (fullscreen.isExpanded()) { event.preventDefault(); void fullscreen.exit(); }
    else showShelf();
  }
});

function creditPanel(story, open = false) {
  const details = el('details', 'credits'); details.open = open;
  details.append(el('summary', '', 'About this book & credits'));
  if (story.logo) { const logo = el('img', 'publisher-logo'); logo.src = `./books/${story.id}/${story.logo}`; logo.alt = 'Book Dash'; details.append(logo); }
  details.append(el('p', '', story.credit));
  if (story.sourceUrl) { const link = el('a', '', 'Read the original book'); link.href = story.sourceUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; details.append(link); }
  if (story.licenseUrl) { const link = el('a', '', 'Creative Commons licence'); link.href = story.licenseUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; details.append(document.createTextNode(' · '), link); }
  return details;
}
function showShelf() {
  session = null; reader.close(); void fullscreen.exit({ restoreFocus: false }); void services.setReading(false);
  readerView.hidden = true; main.hidden = false; document.body.classList.remove('reading');
  main.replaceChildren();
  const hero = el('section', 'shelf-hero');
  const copy = el('div', 'hero-copy');
  copy.append(el('p', 'eyebrow', 'A QUIET LITTLE RITUAL'), el('h1', '', 'One more story,\nthen sweet dreams.'), el('p', 'hero-description', 'Snuggle in. Choose a book. Let the day drift away, one page at a time.'));
  const moon = el('div', 'moon-scene'); moon.setAttribute('aria-hidden', 'true');
  moon.innerHTML = '<span class="tiny-star star-one">✧</span><span class="tiny-star star-two">✦</span><span class="tiny-star star-three">✧</span><span class="moon-orb"></span><span class="cloud cloud-one"></span><span class="cloud cloud-two"></span>';
  hero.append(copy, moon);
  const shelf = el('section', 'shelf-section');
  const shelfHeading = el('div', 'section-heading'); shelfHeading.append(el('h2', '', 'Tonight’s bookshelf'), el('span', '', `${books.length} little adventures`));
  const grid = el('div', 'book-grid');
  books.forEach(story => {
    const complete = preferences.completed.includes(story.id);
    const card = el('article', 'book-card');
    const cover = button('', () => startBook(story), 'cover-button');
    cover.setAttribute('aria-label', `Read ${story.title}${complete ? ' · Finished' : ''}`);
    const img = el('img', 'cover-image'); img.src = `./books/${story.id}/${story.cover}`; img.alt = story.title;
    const coverArt = el('span', 'cover-art'); coverArt.append(img);
    const badge = el('span', 'cover-badge', complete ? '✦ A goodnight shared' : 'Open a little adventure');
    coverArt.append(badge); cover.append(coverArt);
    card.append(cover, el('p', 'book-category', story.origin === 'original' ? (story.category || 'ORIGINAL STORY') : story.sample ? 'OUR LITTLE SAMPLE STORY' : 'FROM BOOK DASH'), el('h3', '', story.title), el('p', 'book-description', story.subtitle || 'A story to read and wonder about together.'));
    card.append(el('p', 'book-meta', `${story.pages.length} pages  ·  4 things to wonder about`), creditPanel(story)); grid.append(card);
  });
  shelf.append(shelfHeading, grid);
  const ritual = el('section', 'ritual-note'); ritual.append(el('span', 'ritual-icon', '☾'), el('div'));
  ritual.lastChild.append(el('h2', '', 'No rush. Just the two of you.'), el('p', '', 'You read the story. Your little one brings the wonder. A few gentle questions come at the end.'));
  const install = el('details', 'install-note'); install.append(el('summary', '', 'Keep your bookshelf close'), el('p', '', 'On iPad: open in Safari, tap Share, then Add to Home Screen. On Android: use your browser’s Install app or Add to Home screen option. Installation and offline reading need HTTPS or localhost.'));
  if (installPrompt) install.append(button('Install bookshelf', async () => { await installPrompt.prompt(); installPrompt = null; showShelf(); }));
  if (updateAvailable) install.append(button('Update bookshelf', () => updateSW?.(true)));
  main.append(hero, shelf, ritual, install);
  focusHeading();
}
function showQuestion() {
  const q = session.story.questions[session.question];
  const hint = session.story.pages[q.hintPage - 1];
  const section = el('section', 'question-screen');
  const top = el('div', 'question-top'); top.append(button('← Bookshelf', showShelf, 'text-button'), el('span', 'eyebrow', `A LITTLE WONDER · ${session.question + 1} OF 4`));
  const layout = el('div', 'question-layout');
  const picture = el('figure', 'hint-picture'); const img = el('img'); img.src = `./books/${session.story.id}/${hint.image}`; img.alt = hint.alt;
  picture.append(img, el('figcaption', '', `A little reminder from page ${q.hintPage}`));
  const copy = el('div', 'question-copy');
  copy.append(el('p', 'eyebrow', q.type === 'personal' ? 'YOUR LITTLE WORLD' : 'LET’S TALK TOGETHER'), el('h1', '', q.q), el('p', 'question-help', 'Ask aloud and give your little one time to wonder. There’s no hurry.'));
  const answer = el('p', 'answer', q.a); answer.dataset.testid = 'answer'; answer.id = 'answer'; answer.hidden = !session.answerVisible;
  const peek = button(session.answerVisible ? 'Hide the answer' : 'Peek at an answer', () => {
    session = revealAnswer(session); answer.hidden = !session.answerVisible;
    peek.textContent = session.answerVisible ? 'Hide the answer' : 'Peek at an answer'; peek.setAttribute('aria-expanded', String(session.answerVisible));
  }, 'peek-button'); peek.setAttribute('aria-expanded', String(session.answerVisible)); peek.setAttribute('aria-controls', 'answer');
  copy.append(peek, answer);
  const nav = el('div', 'question-nav');
  const prev = button('Previous question', () => { session = back(session); showQuestion(); }, 'text-button'); prev.disabled = session.question === 0;
  nav.append(prev, button(session.question === 3 ? 'Say goodnight' : 'Next question', () => {
    session = advance(session); session.view === 'goodnight' ? showGoodnight() : showQuestion();
  })); copy.append(nav); layout.append(picture, copy); section.append(top, layout); main.replaceChildren(section); focusHeading();
}
function showGoodnight() {
  preferences.completed = [...new Set([...preferences.completed, session.story.id])]; persist(); void services.setReading(false);
  const section = el('section', 'goodnight-screen');
  section.append(el('div', 'goodnight-moon', '☾'), el('p', 'eyebrow', 'A STORY SHARED. A MEMORY MADE.'), el('h1', '', 'Goodnight, little dreamer.'), el('p', 'goodnight-copy', 'The story is resting now. Time for you to rest, too.'), el('p', 'star-note', '✦ A little star is waiting on your bookshelf.'), button('Back to the bookshelf', showShelf), creditPanel(session.story, true));
  main.replaceChildren(section); focusHeading();
}
async function load() {
  try {
    const response = await fetch('./books/catalog.json'); if (!response.ok) throw Error('Catalog unavailable');
    const data = await response.json(); if (!Array.isArray(data) || !data.length) throw Error('Empty catalog');
    books = data.map(story => {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(story.id)) throw Error('Invalid book ID');
      return validateStory(story);
    });
    showShelf();
  } catch {
    const error = el('section', 'error-screen'); error.append(el('h1', '', 'The bookshelf needs a moment.'), el('p', '', 'We couldn’t open the books. Check your connection, then try again.'), button('Try again', load)); main.replaceChildren(error);
  }
}
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; if (!session && books.length) showShelf(); });
window.addEventListener('pagehide', () => { void services.setReading(false); });
if ('serviceWorker' in navigator) {
  updateSW = registerSW({
    onOfflineReady() { document.querySelector('#offline-status').textContent = '✓ Ready for offline reading'; },
    onNeedRefresh() { updateAvailable = true; document.querySelector('#offline-status').textContent = 'A bookshelf update is ready'; if (!session && books.length) showShelf(); },
    onRegisterError() { document.querySelector('#offline-status').textContent = 'Offline saving unavailable'; },
  });
}
void load();
