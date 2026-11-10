const assetPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(webp|png|jpe?g|svg)$/i;
export function validateStory(story) {
  const required = (value, label) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${label}`); };
  const asset = value => { if (typeof value !== 'string' || !assetPattern.test(value) || value.includes('..')) throw new Error(`Invalid local asset: ${value}`); };
  if (!story || typeof story !== 'object') throw new Error('Invalid story');
  required(story.title, 'title'); required(story.credit, 'credit'); asset(story.cover); if (story.logo) asset(story.logo);
  if (!Array.isArray(story.pages) || !story.pages.length) throw new Error('Story needs pages');
  story.pages.forEach(page => { asset(page.image); required(page.text, 'page text'); required(page.alt, 'image description'); });
  if (!Array.isArray(story.questions) || story.questions.length !== 4) throw new Error('Story needs four questions');
  const types = story.questions.map(q => q.type).sort().join(',');
  if (types !== 'feeling,literal,literal,personal') throw new Error('Questions need two literal, one feeling and one personal prompt');
  story.questions.forEach(q => {
    required(q.q, 'question'); required(q.a, 'answer');
    if (!Number.isInteger(q.hintPage) || q.hintPage < 1 || q.hintPage > story.pages.length) throw new Error('Invalid hintPage');
  });
  for (const key of ['sourceUrl', 'licenseUrl']) {
    if (story[key] && new URL(story[key]).protocol !== 'https:') throw new Error(`Invalid ${key}`);
  }
  return story;
}
