import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validatePair} from '../../src/interactive/schema.js';
import {validateAsset} from '../../src/scene-schema.js';
import {localFile} from '../package-safety.mjs';
import {digest} from './prepare-pair.mjs';

// Authoring helper only: existing drawings are supplied by the author. Reviews
// always start false; regenerating a package invalidates earlier review claims.
export async function writePairPackage(folder,input,{source={}}={}){
 const pair=structuredClone(input),root=resolve(folder);await mkdir(root,{recursive:true});
 for(const asset of pair.assets){
  // Validate the basename before reading, including before metadata is rebuilt.
  validateAsset(asset.file);
  const bytes=await localFile(root,asset.file);asset.bytes=bytes.length;asset.sha256=digest(bytes);
 }
 validatePair(pair);
 const provenance={kind:'original',...source,title:pair.title,reviewed:false};
 const review={reviewed:false,assets:pair.assets.map(a=>({assetId:a.id,reviewed:false})),scenes:pair.scenes.map(s=>({sceneId:s.id,rest:false,motion:false,outcomes:false,guidance:false}))};
 for(const [file,data]of [['pair.json',pair],['source.json',provenance],['visual-review.json',review]])await writeFile(`${root}/${file}`,JSON.stringify(data,null,2)+'\n');
 return pair;
}
