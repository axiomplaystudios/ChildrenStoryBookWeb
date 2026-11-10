import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {checkPackage} from '../scripts/prepare-book.mjs';
const text=[
'Mouse was looking for a new house.',
'This looks like a nice house.',
'“You can come and sleep with me,” said Puppy. “Thank you,” said Mouse.',
'That night, Mouse’s dreams were bouncy and muddy.',
'“You can come and sleep with me,” said Parrot. “Thank you,” said Mouse.',
'That night, Mouse’s dreams were noisy and wild.',
'“You can come and sleep with me,” said Fish. “Thank you,” said Mouse.',
'That night, Mouse’s dreams were cold and wet.',
'Mouse needed somewhere warm and dry.',
'Mouse found a bookshelf nearby.',
'That night, Mouse had warm and cosy dreams.',
];
test('assisted Mouse package preserves source wording and installs all eleven animated story beats',async()=>{
 const draft=await checkPackage('authoring/a-house-for-mouse');
 const book=JSON.parse(await readFile('public/books/a-house-for-mouse/story.json','utf8'));
 assert.deepEqual(book,draft.story);
 assert.deepEqual(book.pages.map(p=>p.text.replace(/\s+/g,' ').trim()),text);
 assert.equal(book.pages.length,11);
 assert.match(book.credit,/Michele Fry/);assert.match(book.credit,/Jennifer Jacobs/);assert.match(book.credit,/Amy/);
 for(const file of draft.files.keys())assert.deepEqual(await readFile(`public/books/a-house-for-mouse/${file}`),draft.files.get(file));
});
