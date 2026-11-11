import { node, button, picture } from './dom.js';

// Owns only the active scene. The reducer owns all persistent activity state.
export function renderActivity({ activity, view, onAction }) {
  const element = node('section', 'interactive-activity');
  element.setAttribute('aria-label', 'Story activity');
  const lifetime = new AbortController();
  const { signal } = lifetime;
  let selected = null,
    sequence = [];
  const send = (action) => {
    if (!signal.aborted) onAction({ activityId: activity.id, ...action });
  };
  function control(value, handler, pressed) {
    const b = button(value.label, handler, 'picture-button');
    b.prepend(picture(value, view.resolveAsset));
    b.setAttribute('aria-label', value.label);
    if (pressed !== undefined) b.setAttribute('aria-pressed', String(pressed));
    element.append(b);
    return b;
  }
  if (activity.kind === 'place') {
    element.append(
      node('p', '', 'Choose a piece, then its place. You can also drag it.'),
    );
    const selection = node('p', 'selection-status', 'Choose a piece.');
    selection.setAttribute('role', 'status');
    element.append(selection);
    for (const copy of view.remainingCopies) {
      const item = activity.items.find((i) => i.id === copy.itemId);
      const label = `${item.label}, copy ${copy.copyIndex + 1}`;
      const choose = () => {
        selected = { ...copy };
        selection.textContent = `Selected: ${label}. Choose its place.`;
        for (const b of element.querySelectorAll('[data-copy]'))
          b.setAttribute('aria-pressed', String(b === piece));
      };
      const piece = control({ ...item, label }, choose, false);
      piece.dataset.copy = '';
      piece.addEventListener(
        'pointerdown',
        (event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          piece.focus({ preventScroll: true });
          choose();
          const captured = { ...copy };
          let moved = false;
          const move = (e) => {
            if (
              Math.hypot(e.clientX - event.clientX, e.clientY - event.clientY) >
              8
            )
              moved = true;
          };
          const up = (e) => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', up);
            if (!moved || signal.aborted) return;
            const target = document
              .elementFromPoint(e.clientX, e.clientY)
              ?.closest('[data-target]');
            if (target && element.contains(target)) {
              selected = null;
              send({
                type: 'PLACE',
                ...captured,
                targetId: target.dataset.target,
              });
            }
          };
          document.addEventListener('pointermove', move, { signal });
          document.addEventListener('pointerup', up, { signal });
          document.addEventListener(
            'pointercancel',
            () => {
              document.removeEventListener('pointermove', move);
              document.removeEventListener('pointerup', up);
            },
            { once: true, signal },
          );
        },
        { signal },
      );
    }
    for (const target of activity.targets) {
      const state = view.targets.find((t) => t.targetId === target.id);
      const b = control(target, () => {
        if (selected) {
          const captured = selected;
          selected = null;
          send({ type: 'PLACE', ...captured, targetId: target.id });
        }
      });
      b.dataset.target = target.id;
      b.disabled = state.complete;
      b.append(node('span', '', `${state.placed} / ${state.required}`));
    }
  } else if (activity.kind === 'experiment') {
    element.append(
      node('p', '', `Change: ${activity.variable}`),
      node('p', '', `Keep the same: ${activity.fixed.join('; ')}`),
    );
    element.append(node('h3', '', '1. Choose a setup'));
    for (const c of activity.controls) {
      const b = control(
        c,
        () =>
          send({
            type: 'SELECT',
            controlId: c.id,
            trialIndex: view.trialIndex,
          }),
        view.controlId === c.id,
      );
      b.disabled = view.phase === 'tested';
    }
    element.append(node('h3', '', '2. Make a prediction'));
    for (const p of activity.predictions) {
      const b = control(
        p,
        () =>
          send({
            type: 'PREDICT',
            predictionId: p.id,
            trialIndex: view.trialIndex,
          }),
        view.predictionId === p.id,
      );
      b.disabled = view.phase === 'tested';
    }
    const test = button('Test', () =>
      send({ type: 'TEST', trialIndex: view.trialIndex }),
    );
    test.disabled =
      !view.controlId || !view.predictionId || view.phase === 'tested';
    element.append(test);
    if (view.phase === 'tested')
      element.append(
        button('Try again', () =>
          send({ type: 'RETRY', trialIndex: view.trialIndex }),
        ),
      );
    if (view.trials.length) {
      element.append(node('p', '', activity.comparison));
      const history = node('ol', 'trial-history');
      for (const trial of view.trials) {
        const li = node('li');
        li.append(
          picture(trial, view.resolveAsset),
          node(
            'p',
            '',
            `${activity.controls.find((c) => c.id === trial.controlId).label} · Prediction: ${activity.predictions.find((p) => p.id === trial.predictionId).label}`,
          ),
          node('p', '', trial.observation),
        );
        history.append(li);
      }
      element.append(history);
    }
  } else if (activity.kind === 'choice') {
    for (const option of activity.options)
      control(
        option,
        () => send({ type: 'CHOOSE', optionId: option.id }),
        view.optionId === option.id,
      );
  } else if (activity.kind === 'discover') {
    const screen = activity.screen;
    element.append(node('p', '', screen.label));
    element.append(picture(screen, view.resolveAsset));
    const answer = node('p', 'selection-status');
    answer.setAttribute('role', 'status');
    element.append(answer);
    for (const option of screen.options)
      control(option, () => {
        sequence =
          screen.mode === 'match'
            ? [option.id]
            : [...sequence, option.id].slice(0, 12);
        answer.textContent = sequence
          .map((id) => screen.options.find((o) => o.id === id).label)
          .join(' → ');
      });
    element.append(
      button('Clear answer', () => {
        sequence = [];
        answer.textContent = '';
      }),
      button('Check answer', () =>
        send({ type: 'ANSWER', optionIds: [...sequence] }),
      ),
    );
    const physical = node('div', 'physical-alternative');
    physical.append(
      node('p', '', activity.physicalPrompt),
      node('p', '', activity.adultHelp),
      button('We tried it together', () => send({ type: 'PHYSICAL' })),
      button('Skip this activity', () => send({ type: 'SKIP' })),
    );
    element.append(physical);
  }
  return {
    element,
    destroy() {
      lifetime.abort();
      element.replaceChildren();
    },
  };
}
