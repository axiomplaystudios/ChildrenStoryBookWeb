import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateStory } from '../src/story.js';
import { storyAssets } from '../src/scene-schema.js';

export async function buildCatalog(root) {
  const books = [];
  for (const dir of (await readdir(root, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!dir.isDirectory() || dir.name.startsWith('.')) continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dir.name)) throw new Error(`Invalid book folder: ${dir.name}`);
    const story = validateStory(JSON.parse(await readFile(join(root, dir.name, 'story.json'), 'utf8')));
    for (const file of storyAssets(story)) {
      try { await access(join(root, dir.name, file)); } catch { throw new Error(`${dir.name}: missing asset ${file}`); }
    }
    books.push({ ...story, id: dir.name });
  }
  return books;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const books = await buildCatalog(resolve('public/books'));
  if (!books.length) throw new Error('No books found');
  await writeFile('public/books/catalog.json', JSON.stringify(books, null, 2) + '\n');
  console.log(`Validated ${books.length} books; wrote public/books/catalog.json`);
}
