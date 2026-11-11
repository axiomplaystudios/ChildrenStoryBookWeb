import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateStory } from '../src/story.js';
import { buildCatalog } from '../scripts/catalog.mjs';

const story = () => ({ title: 'A quiet night', cover: 'cover.svg', credit: 'Original test story', pages: [{ image: 'page.svg', text: 'Goodnight.', alt: 'A moon' }], questions: ['literal', 'literal', 'feeling', 'personal'].map(type => ({ type, q: 'Who?', a: 'The moon.', hintPage: 1 })) });
test('accepts a complete story with local pictures and four spoken prompts', () => assert.doesNotThrow(() => validateStory(story())));
test('rejects missing attribution and hints outside the story', () => {
  assert.throws(() => validateStory({ ...story(), credit: '' }), /credit/i);
  const invalid = story(); invalid.questions[0].hintPage = 2;
  assert.throws(() => validateStory(invalid), /hintPage/);
});
test('rejects remote and traversal asset paths', () => {
  for (const cover of ['../secret.svg', 'https://example.com/a.png', '/root.png', 'a%2fb.png']) assert.throws(() => validateStory({ ...story(), cover }), /asset/i);
});
test('catalog discovers folders, rejects missing assets, and keeps valid book data', async () => {
  const root = await mkdtemp(join(tmpdir(), 'bookshelf-catalog-'));
  try {
    await mkdir(join(root, 'quiet-night'));
    await writeFile(join(root, 'quiet-night/story.json'), JSON.stringify(story()));
    await assert.rejects(buildCatalog(root), /missing asset/i);
    for (const file of ['cover.svg', 'page.svg']) await writeFile(join(root, 'quiet-night', file), '<svg/>');
    const books = await buildCatalog(root);
    assert.equal(books.length, 1); assert.equal(books[0].id, 'quiet-night');
    assert.equal(books[0].pages[0].text, 'Goodnight.');
  } finally { await rm(root, { recursive: true, force: true }); }
});
test('original learning metadata is explicit and validated',()=>{
 assert.doesNotThrow(()=>validateStory({...story(),origin:'original',category:'LEARN TOGETHER',learningTopic:'Shapes'}));
 for(const value of [{origin:'pretend-publisher'},{origin:'original',learningTopic:''},{origin:'original',category:123}])assert.throws(()=>validateStory({...story(),...value}),/origin|topic|category/i);
});
