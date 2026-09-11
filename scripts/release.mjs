// Assemble artifacts only from the checked-in analysis source tree.
// Run after analysis reproduction. --accept-snapshots is an intentional release action.
import {readFile,writeFile,cp,mkdir,readdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..');
const p=resolve(root,'analysis/reproducibility');
const accept=process.argv.includes('--accept-snapshots');
const release=JSON.parse(await readFile(resolve(p,'config/release.json'),'utf8'));
const current=JSON.parse(await readFile(resolve(p,'generated/site/evidence.json'),'utf8'));
const prior=JSON.parse(execFileSync('git',['show',`${release.baselineCommit}:public/evidence.json`],{cwd:root,encoding:'utf8'}));
const quote=v=>`"${String(v??'').replaceAll('"','""')}"`;
const changes=['dataset,outcome,scenario,old_k,new_k,old_estimate,new_estimate,reason'];
for(const key of ['outcomeSensitivities','rawMeanDifferences','metaRegressions']) {
 const id=r=>[r.outcome,r.scenario,r.measure].join('|');
 const old=new Map(prior[key].map(r=>[id(r),r])); const fresh=new Map(current[key].map(r=>[id(r),r]));
 for(const k of new Set([...old.keys(),...fresh.keys()])) {
  const a=old.get(k),b=fresh.get(k); if(JSON.stringify(a)===JSON.stringify(b))continue;
  changes.push([key,(b||a).outcome,(b||a).scenario||'',a?.k,b?.k,a?.estimate??a?.slope_per_10cl,b?.estimate??b?.slope_per_10cl,'Marguerite RoAD incompatible PET mapping quarantined'].map(quote).join(','));
 }
}
await writeFile(resolve(p,'manifest/release-differences.csv'),changes.join('\n')+'\n');
if(accept) {
 for(const stage of ['primary','extended','audit']) {
  const target=resolve(p,`results/${stage}/tables`);await mkdir(target,{recursive:true});
  for(const f of await readdir(resolve(p,`generated/${stage}`))) if(/\.(csv|json)$/.test(f)) await copyFile(resolve(p,`generated/${stage}/${f}`),resolve(target,f));
  if(stage !== 'audit') await cp(resolve(p,`generated/${stage}/figures`),resolve(p,`results/${stage}/figures`),{recursive:true});
 }
 await copyFile(resolve(p,'generated/site/evidence.json'),resolve(p,'site/evidence.json'));
}
execFileSync('sh',['verify.sh'],{cwd:p,stdio:'inherit'});
execFileSync('Rscript',['code/07_integrity_audit.R'],{cwd:p,stdio:'inherit'});
execFileSync('node',['code/09_manuscript.mjs'],{cwd:p,stdio:'inherit'});
const downloads=resolve(root,'public/downloads');
await copyFile(resolve(p,'generated/site/evidence.json'),resolve(root,'public/evidence.json'));
await writeFile(resolve(root,'public/evidence-inline.js'),`window.__EVIDENCE__ = ${JSON.stringify(current)};\n`);
for(const [src,dst] of [
 ['generated/primary/all_outcome_sensitivity_results.csv','outcome-sensitivities.csv'],
 ['generated/primary/continuous_clearance_meta_regression.csv','centiloid-meta-regressions.csv'],
 ['generated/extended/agent_results.csv','agent-results.csv'],
 ['generated/extended/absolute_safety.csv','absolute-safety.csv'],
 ['generated/audit/calculation_inputs.csv','calculation-inputs.csv'],
 ['generated/audit/pet_clinical_pairings.csv','pet-clinical-pairings.csv'],
 ['generated/audit/independent_filter_sensitivities.csv','independent-filter-sensitivities.csv'],
 ['manifest/release-differences.csv','release-differences.csv'],
 ['generated/manuscript/methods-results.md','methods-results.md']
]) await copyFile(resolve(p,src),resolve(downloads,dst));
await mkdir(resolve(p,'manuscript'),{recursive:true});
await copyFile(resolve(p,'generated/manuscript/methods-results.md'),resolve(p,'manuscript/methods-results.md'));
await copyFile(resolve(p,'generated/manuscript/extended-results.md'),resolve(p,'manuscript/extended-results.md'));
await copyFile(resolve(p,'README.md'),resolve(root,'REPRODUCIBILITY_PACKAGE.md'));
await copyFile(resolve(root,'CORRECTIONS.md'),resolve(p,'CORRECTIONS.md'));
execFileSync('node',['code/06_write_manifest.mjs'],{cwd:p,stdio:'inherit'});
// Exclude generated scratch output and installed libraries from the single ZIP.
const archive=resolve(downloads,'reproducibility-package.zip');
const temp=resolve(downloads,'reproducibility-package.next.zip');
execFileSync('zip',['-qr',temp,'.','-x','generated/*','environment/library/*','environment/renv-cache/*','renv/library/*','renv/staging/*','.DS_Store'],{cwd:p});
const {rename}=await import('node:fs/promises');await rename(temp,archive);
console.log(`Assembled evidence ${release.version}; prior release preserved at ${release.baselineCommit}.`);
