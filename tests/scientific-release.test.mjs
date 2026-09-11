import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../public/evidence.json',import.meta.url)));
test('CREAD and CREAD 2 require biomarker confirmation',()=>{
 for(const study of ['CREAD 2022','CREAD 2 2022']) {
  const rows=data.conditionRegistry.filter(r=>r.study===study); assert.ok(rows.length);
  assert.ok(rows.every(r=>r.biomarker_confirmed));
 }
});
test('public registry is exactly the verified release snapshot',()=>{
 const snapshot=JSON.parse(readFileSync(new URL('../analysis/reproducibility/site/evidence.json',import.meta.url)));
 assert.deepEqual(data,snapshot);
});
test('quarantined PET does not discard randomized clinical evidence',()=>{
 const rows=data.conditionRegistry.filter(r=>r.study==='Marguerite RoAD 2024');assert.ok(rows.length);
 assert.ok(rows.every(r=>r.amyloid_change_cl===null&&!r.demonstrated_clearance&&r.biomarker_confirmed));
 assert.ok(data.filterSensitivities.some(r=>r.cutoff_cl===null&&r.studies.includes('Marguerite RoAD')));
 assert.ok(data.filterSensitivities.filter(r=>r.cutoff_cl!==null).every(r=>!r.studies.includes('Marguerite RoAD')));
});
test('symptomatic ARIA-H remains distinct from any ARIA',()=>{
 const x=data.conditionRegistry.filter(r=>r.analysis_id==='4.10');assert.ok(x.length);
 assert.ok(x.every(r=>r.outcome.includes('Symptomatic ARIA H')));
});
test('independent filters reproduce retained condition estimates',()=>{
 for(const r of data.outcomeSensitivities) {
  if(r.scenario!=='Biomarker-confirmed')continue;
  const x=data.filterSensitivities.find(x=>x.analysis_id===r.analysis_id&&x.biomarker==='TRUE'&&x.approved==='FALSE'&&x.cutoff_cl===null&&x.time_match==='FALSE');
  assert.equal(x.k,r.k);assert.ok(Math.abs(x.estimate-r.estimate)<1e-8);
 }
});
test('empty conditions and source dates are explicit',()=>{
 assert.ok(data.filterSensitivities.some(r=>r.k===0&&r.estimate===null));
 assert.equal(data.searchThrough,'2025-08-07');assert.notEqual(data.generated,data.searchThrough);
 assert.equal(data.calculationInputs.length,data.conditionRegistry.length);
});
