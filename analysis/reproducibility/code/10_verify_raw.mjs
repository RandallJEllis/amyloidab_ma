import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifest = await readFile('manifest/SHA256SUMS.txt','utf8');
let count=0;
for(const line of manifest.trim().split('\n')) {
 const match=line.match(/^([0-9a-f]{64})  (data\/raw\/cochrane\/.+)$/);
 if(!match) continue;
 const [,expected,path]=match;
 const actual=createHash('sha256').update(await readFile(path)).digest('hex');
 if(actual!==expected) throw new Error(`Raw source checksum mismatch: ${path}`);
 count++;
}
if(!count) throw new Error('No raw Cochrane checksums found');
console.log(`Verified ${count} raw Cochrane file checksums.`);
