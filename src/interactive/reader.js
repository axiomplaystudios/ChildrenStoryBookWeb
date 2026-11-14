import { dispatch, deriveScene } from './state.js';
import { renderActivity } from './activities.js';
import { node, button, picture } from './dom.js';
import { createIllustration } from '../illustration.js';
import { createFullscreen } from '../fullscreen.js';
import {
  animationSpeeds,
  loadAnimationSettings,
  saveAnimationSettings,
  resolveSpeed,
  setSpeed,
} from '../animation-settings.js';

export function mountInteractiveReader({
  root,
  pair,
  bundle,
  run: initialRun,
  onSave,
  onExit,
  speedForPage,
  animationSettings,
  storage,
}) {
  let run = initialRun,
    disposed = false,
    activity,
    illustration,
    paused = false,
    feedback = '';
  const settings = animationSettings ?? loadAnimationSettings(storage);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('interactive-reader');
  root.setAttribute('aria-label', 'Interactive story reader');
  root.replaceChildren();
  const bar = node('div', 'reader-bar'),
    heading = node('h1', 'reader-title', pair.title),
    progress = node('span', 'page-progress'),
    full = button('Full screen', () => {}),
    status = node('p', 'fullscreen-status');
  status.setAttribute('role', 'status');
  bar.append(
    button('Bookshelf', onExit, 'text-button'),
    heading,
    progress,
    full,
  );
  const mode = node(
    'p',
    'edition-name',
    run.edition === 'together'
      ? 'Read Together · Your adult reads aloud'
      : 'Play by Myself · Your adult reads aloud',
  );
  const stage = node('div', 'interactive-stage');
  root.append(bar, mode, stage, status);
  const fullscreen = createFullscreen({
    element: root,
    button: full,
    status,
    onChange: () => {},
  });
  const onMotion = () => illustration?.setReducedMotion(motion.matches);
  motion.addEventListener('change', onMotion);
  function clear() {
    activity?.destroy();
    activity = null;
    illustration?.destroy();
    illustration = null;
    stage.replaceChildren();
  }
  function save() {
    onSave(run);
  }
  function act(action) {
    if (disposed) return;
    const result = dispatch(run, pair, action);
    if (result.reason === 'confirmation-required') {
      const effect = result.effects.find(
        (e) => e.type === 'confirm-choice-edit',
      );
      confirmEdit(effect);
      return;
    }
    if (result.accepted) {
      run = result.run;
      save();
      feedback = '';
      if (action.type === 'ANSWER' && !deriveScene(pair, run).activity.complete)
        feedback = deriveScene(pair, run).guidance.feedback.retry;
      if (action.type === 'CHOOSE' || action.type === 'CONFIRM_CHANGE')
        feedback = pair.scenes
          .find((s) => s.activity?.id === action.activityId)
          .activity.options.find((o) => o.id === action.optionId).feedback;
      render();
    } else {
      feedback =
        result.reason === 'save-that-piece'
          ? 'Save that piece for its other place. Choose another piece.'
          : deriveScene(pair, run).guidance.feedback.retry;
      announce();
    }
  }
  function announce() {
    const message = stage.querySelector('.activity-feedback');
    if (message) message.textContent = feedback;
  }
  function confirmEdit(effect) {
    stage.querySelector('.change-confirmation')?.remove();
    const panel = node('div', 'change-confirmation');
    panel.setAttribute('role', 'alert');
    panel.append(
      node(
        'p',
        '',
        'Changing this choice clears the later activities. Change it?',
      ),
      button('Confirm change', () =>
        act({
          type: 'CONFIRM_CHANGE',
          activityId: effect.activityId,
          optionId: effect.optionId,
          token: effect.token,
        }),
      ),
      button('Keep my choice', () => panel.remove()),
    );
    stage.append(panel);
    panel.querySelector('button').focus();
  }
  function restart() {
    const panel = node('div', 'change-confirmation');
    panel.setAttribute('role', 'alert');
    panel.append(
      node(
        'p',
        '',
        'Start this edition again? Its saved activities will be cleared.',
      ),
      button('Restart this edition', () => act({ type: 'RESTART' })),
      button('Keep reading', () => panel.remove()),
    );
    stage.append(panel);
  }
  function render() {
    const focused = document.activeElement?.getAttribute('aria-label');
    clear();
    if (disposed) return;
    const view = deriveScene(pair, run),
      index = pair.scenes.findIndex((s) => s.id === run.sceneId),
      scene = view.scene;
    progress.textContent = `Scene ${index + 1} / ${pair.scenes.length}`;
    const section = node('section', 'interactive-scene');
    section.dataset.sceneId = scene.id;
    illustration = createIllustration({
      bookId: pair.id,
      page: scene,
      resolveAsset: bundle.resolveAsset,
    });
    illustration.setLayerVisibility(
      Object.keys(view.visibility).filter((id) => view.visibility[id]),
    );
    illustration.setReducedMotion(motion.matches);
    illustration.setSpeed(
      speedForPage?.(pair.id, index) ?? resolveSpeed(settings, pair.id, index),
    );
    if (!paused) illustration.activate();
    const art = node('figure', 'interactive-art');
    art.append(illustration.element);
    const copy = node('div', 'interactive-copy');
    copy.append(
      node('p', 'scene-narrative', view.ending?.text ?? scene.narrative),
      node('p', 'activity-instruction', view.guidance.instruction),
    );
    const demo = node('div', 'demonstration');
    demo.hidden = true;
    let step = 0;
    function demoStep() {
      demo.replaceChildren();
      const d = view.guidance.demonstration[step];
      demo.append(
        picture(d, bundle.resolveAsset),
        node(
          'p',
          '',
          `${step + 1} / ${view.guidance.demonstration.length}: ${d.label}`,
        ),
      );
      if (step < view.guidance.demonstration.length - 1)
        demo.append(
          button('Next picture', () => {
            step++;
            demoStep();
          }),
        );
      demo.append(
        button('Close example', () => {
          demo.hidden = true;
        }),
      );
    }
    copy.append(
      button('Show me', () => {
        step = 0;
        demo.hidden = false;
        demoStep();
      }),
      demo,
    );
    if (scene.activity) {
      activity = renderActivity({
        activity: scene.activity,
        view: { ...view.activity, resolveAsset: bundle.resolveAsset },
        onAction: act,
      });
      copy.append(activity.element);
    }
    if (!feedback && view.activity?.complete) {
      feedback =
        scene.activity.kind === 'choice'
          ? scene.activity.options.find((o) => o.id === view.activity.optionId)
              ?.feedback
          : view.guidance.feedback.complete;
    }
    const live = node('p', 'activity-feedback', feedback);
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    copy.append(live);
    if (view.ending?.complete) {
      const ending = node('section', 'interactive-ending');
      ending.append(
        node('h2', '', 'A story to remember'),
        node('p', '', view.ending.text),
      );
      for (const beat of view.ending.recap)
        ending.append(node('p', '', beat.text));
      if (run.edition === 'independent')
        ending.append(node('p', '', pair.editions.independent.reflection));
      else {
        ending.append(
          node(
            'p',
            '',
            'Four optional things to talk about. Take any you like.',
          ),
        );
        for (const prompt of pair.editions.together.prompts) {
          const hint = pair.scenes.find((s) => s.id === prompt.sceneId);
          const details = node('details', 'discussion-prompt');
          details.append(
            node('summary', '', prompt.question),
            picture({ image: hint.image }, bundle.resolveAsset),
            node('p', '', hint.narrative),
            node('p', '', prompt.answer),
          );
          ending.append(details);
        }
      }
      ending.append(
        button('Finish story', onExit),
        button('Replay story', restart),
      );
      copy.append(ending);
    }
    section.append(art, copy);
    stage.append(section);
    const nav = node('nav', 'interactive-navigation');
    nav.setAttribute('aria-label', 'Story scenes');
    const prev = button('Previous scene', () => {
      feedback = '';
      act({ type: 'NAVIGATE', sceneId: pair.scenes[index - 1].id });
    });
    prev.disabled = index === 0;
    nav.append(prev);
    if (index < pair.scenes.length - 1) {
      const next = button('Next scene', () => {
        feedback = '';
        act({ type: 'NAVIGATE', sceneId: pair.scenes[index + 1].id });
      });
      next.disabled = Boolean(view.activity && !view.activity.complete);
      nav.append(next);
    }
    nav.append(button('Restart edition', restart));
    stage.append(nav);
    const controls = node('details', 'animation-settings');
    controls.append(node('summary', '', 'Illustration settings'));
    const fields = node('div', 'animation-fields');
    for (const [scope, label, current] of [
      ['global', 'Default speed', settings.global],
      ['book', 'This book', settings.books[pair.id]],
      ['page', 'This scene', settings.pages[pair.id]?.[index]],
    ]) {
      const wrapper = node('label', '', label),
        select = node('select');
      select.setAttribute('aria-label', label);
      if (scope !== 'global') {
        const inherit = node('option', '', 'Inherit');
        inherit.value = '';
        select.append(inherit);
      }
      for (const speed of animationSpeeds) {
        const option = node('option', '', `${speed}×`);
        option.value = String(speed);
        select.append(option);
      }
      select.value = String(current ?? '');
      select.addEventListener('change', () => {
        setSpeed(
          settings,
          scope,
          select.value === '' ? null : Number(select.value),
          pair.id,
          index,
        );
        saveAnimationSettings(storage, settings);
        illustration.setSpeed(resolveSpeed(settings, pair.id, index));
      });
      wrapper.append(select);
      fields.append(wrapper);
    }
    fields.append(
      button(paused ? 'Resume illustrations' : 'Pause illustrations', () => {
        paused = !paused;
        if (paused) illustration.pause();
        else illustration.resume();
        render();
      }),
      button('Replay illustrations', () => {
        illustration.reset();
        if (!paused) illustration.resume();
      }),
    );
    controls.append(
      fields,
      node(
        'p',
        '',
        'Reduced motion keeps the picture still. Your choices and examples stay visible.',
      ),
    );
    stage.append(controls);
    if (focused)
      for (const b of stage.querySelectorAll('button[aria-label]'))
        if (b.getAttribute('aria-label') === focused) {
          b.focus({ preventScroll: true });
          break;
        }
  }
  const onKey = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      if (fullscreen.isExpanded()) void fullscreen.exit();
      else onExit();
    }
  };
  root.addEventListener('keydown', onKey);
  heading.tabIndex = -1;
  render();
  heading.focus({ preventScroll: true });
  return {
    destroy() {
      if (disposed) return;
      disposed = true;
      root.removeEventListener('keydown', onKey);
      clear();
      motion.removeEventListener('change', onMotion);
      fullscreen.destroy();
      root.replaceChildren();
    },
  };
}
