export function createSession(story) {
  return { story, view: 'reader', page: 0, question: 0, answerVisible: false, completed: false };
}
export function setPage(session, page) {
  return { ...session, page: Math.max(0, Math.min(session.story.pages.length - 1, page)) };
}
export function advance(session, spread = 1) {
  if (session.view === 'reader') {
    if (session.page + spread >= session.story.pages.length) return { ...session, view: 'questions', question: 0, answerVisible: false };
    return setPage(session, session.page + spread);
  }
  if (session.view === 'questions') {
    if (session.question === session.story.questions.length - 1) return { ...session, view: 'goodnight', completed: true, answerVisible: false };
    return { ...session, question: session.question + 1, answerVisible: false };
  }
  return session;
}
export function back(session, spread = 1) {
  if (session.view === 'reader') return setPage(session, session.page - spread);
  if (session.view === 'questions' && session.question > 0) return { ...session, question: session.question - 1, answerVisible: false };
  return session;
}
export function revealAnswer(session) { return { ...session, answerVisible: !session.answerVisible }; }
