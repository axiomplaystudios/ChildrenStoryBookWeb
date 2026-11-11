import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {validateManifest as validate} from '../scripts/interactive/audio.mjs';

const script=resolve('scripts/interactive/audio.mjs');
const entry={id:'welcome',text:'Welcome to the bakery.',file:'clips/welcome.wav',voice:'local narrator',provider:'local recording',license:'Original recording; narrator permits redistribution.',reviewed:true};

// A hand-authored 0.25-second PCM tone tests media decoding, not speech quality.
function wav(frames=2000){
 const bytes=Buffer.alloc(44+frames*2);
 bytes.write('RIFF');bytes.writeUInt32LE(36+frames*2,4);bytes.write('WAVEfmt ',8);
 bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);
 bytes.writeUInt32LE(8000,24);bytes.writeUInt32LE(16000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);
 bytes.write('data',36);bytes.writeUInt32LE(frames*2,40);
 for(let i=0;i<frames;i++)bytes.writeInt16LE(Math.round(4000*Math.sin(2*Math.PI*440*i/8000)),44+i*2);
 return bytes;
}
async function fixture(t,entries=[entry],audio=wav()){
 const root=await mkdtemp(join(tmpdir(),'interactive-audio-'));
 t.after(()=>rm(root,{recursive:true,force:true}));
 await mkdir(join(root,'clips'));
 await writeFile(join(root,'clips/welcome.wav'),audio);
 const manifest=join(root,'manifest.json');await writeFile(manifest,JSON.stringify(entries));
 return {root,manifest};
}
test('accepts a locally supplied reviewed recording and reports decoded duration and bytes',async t=>{
 const {manifest}=await fixture(t);
 const result=await validate(manifest);
 assert.equal(result.clips.length,1);assert.equal(result.clips[0].id,'welcome');
 assert.equal(result.clips[0].bytes,4044);assert.equal(result.totalBytes,4044);
 assert.ok(Math.abs(result.clips[0].duration-0.25)<0.001);
 assert.ok(Math.abs(result.totalDuration-0.25)<0.001);
});

for(const field of ['id','text','file','voice','provider','license']){
 test(`rejects missing ${field}`,async t=>{
  const broken={...entry};delete broken[field];const {manifest}=await fixture(t,[broken]);
  await assert.rejects(validate(manifest),new RegExp(field,'i'));
 });
 test(`rejects blank ${field}`,async t=>{
  const {manifest}=await fixture(t,[{...entry,[field]:'  '}]);
  await assert.rejects(validate(manifest),new RegExp(field,'i'));
 });
}
for(const reviewed of [undefined,false,'true',1])test(`rejects review value ${reviewed}`,async t=>{
 const {manifest}=await fixture(t,[{...entry,reviewed}]);
 await assert.rejects(validate(manifest),/reviewed/i);
});
test('rejects duplicate clip IDs before decoding',async t=>{
 const {manifest}=await fixture(t,[entry,{...entry,file:'clips/another.wav'}]);
 await assert.rejects(validate(manifest),/duplicate.*welcome/i);
});
for(const file of ['../welcome.wav','/tmp/welcome.wav','clips/../welcome.wav','clips\\welcome.wav','https://example.com/a.wav','clips/%2e%2e/a.wav','clips/a.txt'])test(`rejects unsafe or unsupported path ${file}`,async t=>{
 const {manifest}=await fixture(t,[{...entry,file}]);
 await assert.rejects(validate(manifest),/path/i);
});
test('rejects missing audio files',async t=>{
 const {manifest}=await fixture(t,[{...entry,file:'clips/missing.wav'}]);
 await assert.rejects(validate(manifest),/missing.*clips\/missing.wav/i);
});
test('rejects a symlinked audio file',async t=>{
 const {root,manifest}=await fixture(t,[{...entry,file:'clips/link.wav'}]);
 await symlink(join(root,'clips/welcome.wav'),join(root,'clips/link.wav'));
 await assert.rejects(validate(manifest),/symlink/i);
});
test('rejects a symlinked parent directory',async t=>{
 const {root,manifest}=await fixture(t,[{...entry,file:'alias/welcome.wav'}]);
 await symlink(join(root,'clips'),join(root,'alias'));
 await assert.rejects(validate(manifest),/symlink/i);
});
test('rejects corrupt media even when its WAV header looks plausible',async t=>{
 const {manifest}=await fixture(t,[entry],wav().subarray(0,40));
 await assert.rejects(validate(manifest),/decode.*clips\/welcome.wav/i);
});
test('rejects an audio file with no playable frames',async t=>{
 const {manifest}=await fixture(t,[entry],wav(0));
 await assert.rejects(validate(manifest),/decode|duration/i);
});
for(const value of [[],{},null])test(`rejects invalid manifest shape ${JSON.stringify(value)}`,async t=>{
 const {manifest}=await fixture(t,value);
 await assert.rejects(validate(manifest),/non.?empty.*array/i);
});
test('rejects malformed JSON clearly',async t=>{
 const {manifest}=await fixture(t);await writeFile(manifest,'[');
 await assert.rejects(validate(manifest),/invalid.*json/i);
});
test('CLI validates a recording and reports bytes and browser-decoded duration',async t=>{
 const {manifest}=await fixture(t);
 const result=spawnSync(process.execPath,[script,'validate',manifest],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/1 clip/);
 assert.match(result.stdout,/4044 bytes/);assert.match(result.stdout,/0\.250 s/);
});
test('CLI exits unsuccessfully for an unreviewed manifest',async t=>{
 const {manifest}=await fixture(t,[{...entry,reviewed:false}]);
 const result=spawnSync(process.execPath,[script,'validate',manifest],{encoding:'utf8'});
 assert.equal(result.status,1);assert.match(result.stderr,/reviewed/i);assert.equal(result.stdout,'');
});
test('CLI explains its invocation when arguments are invalid',()=>{
 const result=spawnSync(process.execPath,[script,'other','extra'],{encoding:'utf8'});
 assert.equal(result.status,1);assert.match(result.stderr,/Usage:.*validate <manifest>/);
});
