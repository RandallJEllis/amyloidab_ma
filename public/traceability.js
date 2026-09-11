/* Reads precomputed release data; performs no meta-analysis in the browser. */
const originalRenderExplorer = renderExplorer;
renderExplorer = function () {
  originalRenderExplorer();
  renderTraceability();
};

function selectedMembership(row) {
  return selectedScenario === 'Cochrane class pool' ||
    (selectedScenario === 'Biomarker-confirmed' && row.biomarker_confirmed) ||
    (selectedScenario === 'Demonstrated clearance: >=10 CL' && row.demonstrated_clearance) ||
    (selectedScenario.includes('Response primary') && row.response_primary) ||
    (selectedScenario.includes('Currently active') && row.active_2026);
}

function renderTraceability() {
  let panel = document.querySelector('#traceability');
  if (!panel) {
    panel = document.createElement('section'); panel.id = 'traceability'; panel.className = 'threshold-note';
    document.querySelector('#selected-result').after(panel);
  }
  const rows = evidence.conditionRegistry.filter(r => r.outcome === selectedOutcome);
  const selected = rowsForOutcome().find(r => r.scenario === selectedScenario);
  const inputs = evidence.calculationInputs || [];
  const lookup = r => inputs.find(x=>x.study===r.study && x.analysis_id===r.analysis_id);
  const isRaw = Boolean(thresholdFor(selectedOutcome)) && selected?.measure === 'MD';
  const variance = r => Number(isRaw ? lookup(r)?.raw_variance : r.variance);
  const hasInputs = r => !isRaw || (lookup(r)?.raw_md != null && lookup(r)?.raw_variance != null && Number.isFinite(variance(r)) && variance(r) > 0);
  const eligible = rows.filter(r => selectedMembership(r) && hasInputs(r));
  const weightSum = eligible.reduce((s,r)=>s+1/(variance(r)+(selected?.tau2||0)),0);
  const body = rows.map(r => {
    const input = lookup(r); const included = selectedMembership(r) && hasInputs(r);
    const reasons = [];
    if (!included) {
      if (selectedMembership(r) && !hasInputs(r)) reasons.push('Raw MD inputs unavailable');
      if ((selectedScenario.includes('Response primary') || selectedScenario==='Biomarker-confirmed') && !r.biomarker_confirmed) reasons.push('Biomarker confirmation not required');
      if (selectedScenario.includes('Response primary') && !r.approved_generation) reasons.push('Outside approved-agent set');
      if ((selectedScenario.includes('Response primary') || selectedScenario.includes('>=10 CL')) && !r.demonstrated_clearance) reasons.push(r.amyloid_change_cl == null ? 'PET unknown / quarantined' : 'Reduction below 10 CL');
      if(selectedScenario.includes('Currently active')) reasons.push('Outside lecanemab/donanemab set');
    }
    const weight = included ? (100/(variance(r)+(selected?.tau2||0))/weightSum).toFixed(1)+'%' : '—';
    return `<tr><td>${esc(r.study)}</td><td>${included?'Included':esc(reasons.join('; '))}</td><td>${r.experimental_n ?? 'NA'} / ${r.control_n ?? 'NA'}</td><td>${esc(isRaw?input?.raw_md:r.effect)}</td><td>${weight}</td><td>${esc(input?.pairing_status)}</td><td>${esc(r.mapping_note)}</td></tr>`;
  }).join('');
  panel.innerHTML = `<details><summary>How was this calculated? Inputs, weights and exclusions</summary><p>Effect measure: ${esc(selected?.measure)}. Random-effects REML; ${selected?.k>=3?'Hartung–Knapp':'normal'} inference. Weights use this specification’s sampling variances and estimated heterogeneity. Counts are source analysis denominators, not necessarily all randomized participants. Overlapping conditions are descriptive comparisons.</p><div style="overflow-x:auto"><table><thead><tr><th>Study</th><th>Decision</th><th>Active / control N</th><th>Input effect</th><th>Weight</th><th>PET pairing</th><th>Mapping note</th></tr></thead><tbody>${body}</tbody></table></div><p>Exact scale versions and adjusted-estimate compatibility require further source verification; raw MD companions are provisional. <a href="downloads/calculation-inputs.csv">Download all means, SDs, variances and source locators</a> · <a href="downloads/pet-clinical-pairings.csv">PET pairing ledger</a></p></details>`;
  const url = new URL(location.href);
  url.searchParams.set('outcome',selectedOutcome); url.searchParams.set('scenario',selectedScenario); url.searchParams.set('version',evidence.evidenceVersion);
  try { history.replaceState(null,'',url); } catch { /* file previews may disallow history writes */ }
}

function renderIndependentFilters() {
  const host = document.querySelector('#independent-filters');
  const outcome = host.querySelector('select[name=outcome]').value;
  const biomarker = host.querySelector('[name=biomarker]').checked;
  const approved = host.querySelector('[name=approved]').checked;
  const time = host.querySelector('[name=time]').checked;
  const cutoff = host.querySelector('[name=cutoff]').value;
  const row = evidence.filterSensitivities.find(r=>r.outcome===outcome&&r.biomarker===(biomarker?'TRUE':'FALSE')&&r.approved===(approved?'TRUE':'FALSE')&&r.time_match===(time?'TRUE':'FALSE')&&(cutoff==='none'?r.cutoff_cl===null:r.cutoff_cl===Number(cutoff)));
  host.querySelector('[role=status]').innerHTML = row?.k ? `<strong>${fmt(row.estimate)} ${esc(row.measure)}</strong> (95% CI ${fmt(row.ci_low)} to ${fmt(row.ci_high)}); ${row.k} contributing units.<p>${esc(row.studies)}</p>` : 'No contributing studies for this combination.';
  const url = new URL(location.href);
  for (const [key,value] of Object.entries({filterOutcome:outcome,biomarker:String(biomarker),approved:String(approved),petTime:String(time),cutoff})) url.searchParams.set(key,value);
  try { history.replaceState(null,'',url); } catch { /* Local file preview. */ }
}

if (typeof evidence !== 'undefined' && evidence?.filterSensitivities) {
  const params = new URL(location.href).searchParams;
  if (params.has('version') && params.get('version')!==evidence.evidenceVersion) {
    const notice=document.createElement('p');notice.setAttribute('role','alert');notice.textContent=`This link requested evidence ${params.get('version')}; the displayed release is ${evidence.evidenceVersion}. Historical releases are available in the repository history.`;document.querySelector('main').prepend(notice);
  }
  if(Object.hasOwn(outcomeShort,params.get('outcome'))) selectedOutcome=params.get('outcome');
  if(scenarioOrder.includes(params.get('scenario'))) selectedScenario=params.get('scenario');
  document.querySelector('#outcome-select').value=selectedOutcome;
  const host=document.createElement('section');host.id='independent-filters';host.className='threshold-note';
  host.innerHTML=`<h2>Independent inclusion sensitivities</h2><p>These investigator-defined exploratory specifications separate enrollment, approval and plaque reduction. Snyder et al. supplied no numerical clearance definition. The time screen is approximate and does not certify matching dose or population. PET unknowns are excluded only when PET is required.</p><label>Outcome <select name="outcome">${[...new Set(evidence.filterSensitivities.map(r=>r.outcome))].map(o=>`<option>${esc(o)}</option>`).join('')}</select></label> <label><input type="checkbox" name="biomarker"> Require biomarker confirmation</label> <label><input type="checkbox" name="approved"> Restrict to approved-generation agents</label> <label>Minimum reduction <select name="cutoff"><option value="none">No PET restriction</option>${[5,10,20,30].map(n=>`<option value="${n}">${n} CL</option>`).join('')}</select></label> <label><input type="checkbox" name="time"> Approximate PET time match</label><p role="status" aria-live="polite"></p><p><a href="downloads/independent-filter-sensitivities.csv">Download all specifications, including empty sets</a></p>`;
  document.querySelector('#conditions').append(host);
  const filterOutcome = params.get('filterOutcome');
  if (evidence.filterSensitivities.some(r=>r.outcome===filterOutcome)) host.querySelector('[name=outcome]').value=filterOutcome;
  for (const [name,key] of [['biomarker','biomarker'],['approved','approved'],['time','petTime']]) host.querySelector(`[name=${name}]`).checked=params.get(key)==='true';
  if (['none','5','10','20','30'].includes(params.get('cutoff'))) host.querySelector('[name=cutoff]').value=params.get('cutoff');
  host.addEventListener('change',renderIndependentFilters);
  renderIndependentFilters(); renderExplorer();
}
