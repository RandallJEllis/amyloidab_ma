const scenarioOrder = ["Cochrane class pool", "Biomarker-confirmed", "Demonstrated clearance: >=10 CL", "Response primary: clearing approved-generation trials", "Currently active agents: lecanemab + donanemab"];
const scenarioShort = {"Cochrane class pool":"All antibodies","Biomarker-confirmed":"Biomarker confirmed","Demonstrated clearance: >=10 CL":"Clears ≥10 CL","Response primary: clearing approved-generation trials":"Response criteria","Currently active agents: lecanemab + donanemab":"Lecanemab + donanemab"};
const outcomeShort = {"ADAS-Cog scale at 18 months":"ADAS-Cog · 18 months","CDR-SB scale at 18 months":"CDR-SB · 18 months","MMSE scale at 18 months":"MMSE · 18 months","ADCS-ADL score at 18 months":"ADCS-ADL · 18 months","ADCS-ADL-MCI score at 18 months":"ADCS-ADL-MCI · 18 months","ADCS-iADL score at 18 months":"ADCS-iADL · 18 months","DAD total score at 18 months":"DAD · 18 months"};
let evidence;
let selectedOutcome = "ADAS-Cog scale at 18 months";
let selectedScenario = "Response primary: clearing approved-generation trials";

const fmt = (v, d=3) => `${v < 0 ? "−" : v > 0 ? "+" : ""}${Math.abs(v).toFixed(d)}`;
const fmtP = v => v < .001 ? "<.001" : v.toFixed(3).replace(/^0/, "");
const favorableDirection = outcome => /ADAS|CDR/.test(outcome) ? -1 : 1;
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function forestRow(row, range) {
  const low = Math.max(0, ((row.ci_low + range)/(range*2))*100);
  const high = Math.min(100, ((row.ci_high + range)/(range*2))*100);
  const point = ((row.estimate + range)/(range*2))*100;
  const label = row.scenario ? scenarioShort[row.scenario] || row.scenario : row.agent || row.target_class || "Estimate";
  const favorable = row.estimate * favorableDirection(row.outcome) > 0;
  return `<div class="forest-row"><div class="forest-label"><strong>${esc(label)}</strong><span>${row.k} ${row.k===1?"trial":"trials"}</span></div><div class="forest-track" aria-label="${esc(label)}, estimate ${fmt(row.estimate)}"><span class="null-line"></span><span class="ci-line" style="left:${low}%;width:${Math.max(0,high-low)}%"></span><span class="point ${favorable?"point-good":"point-neutral"}" style="left:${point}%"></span></div><div class="forest-value"><strong>${fmt(row.estimate)}</strong><span>${fmt(row.ci_low)} to ${fmt(row.ci_high)}</span></div></div>`;
}

function rowsForOutcome() {
  return evidence.outcomeSensitivities.filter(row => row.outcome === selectedOutcome && row.measure === "SMD").sort((a,b)=>scenarioOrder.indexOf(a.scenario)-scenarioOrder.indexOf(b.scenario));
}

function renderExplorer() {
  const rows = rowsForOutcome();
  if (!rows.some(row => row.scenario === selectedScenario)) selectedScenario = rows.find(row => row.scenario.includes("Response primary"))?.scenario || rows[0]?.scenario;
  const selected = rows.find(row => row.scenario === selectedScenario) || rows[0];
  const classRow = rows.find(row => row.scenario === "Cochrane class pool");
  const raw = evidence.rawMeanDifferences.find(row => row.outcome === selectedOutcome && row.scenario === selected.scenario);
  const range = Math.max(.35, ...rows.flatMap(row => [Math.abs(row.ci_low),Math.abs(row.ci_high)]))*1.08;
  const delta = classRow ? (selected.estimate-classRow.estimate)*favorableDirection(selectedOutcome) : 0;
  document.querySelector("#scenario-controls").innerHTML = rows.map(row => `<label class="radio-card ${row.scenario===selected.scenario?"radio-selected":""}"><input type="radio" name="scenario" value="${esc(row.scenario)}" ${row.scenario===selected.scenario?"checked":""}><span><strong>${esc(scenarioShort[row.scenario]||row.scenario)}</strong><small>${row.k} ${row.k===1?"trial":"trials"}</small></span></label>`).join("");
  document.querySelectorAll('input[name="scenario"]').forEach(input => input.addEventListener("change", event => { selectedScenario=event.target.value; renderExplorer(); }));
  document.querySelector("#selected-result").innerHTML = `<div class="result-topline"><div><p class="eyebrow">Selected specification</p><h3>${esc(scenarioShort[selected.scenario]||selected.scenario)}</h3></div><span class="analysis-id">Analysis ${esc(selected.analysis_id)}</span></div><div class="big-estimate"><span>${fmt(selected.estimate)}</span><div><strong>SMD</strong><small>95% CI ${fmt(selected.ci_low)} to ${fmt(selected.ci_high)}</small></div></div><div class="estimate-ruler"><span class="ruler-null"></span><span class="ruler-ci" style="left:${((selected.ci_low+range)/(2*range))*100}%;width:${((selected.ci_high-selected.ci_low)/(2*range))*100}%"></span><span class="ruler-point" style="left:${((selected.estimate+range)/(2*range))*100}%"></span></div><div class="metric-grid"><div><span>Trials</span><strong>${selected.k}</strong></div><div><span>Heterogeneity</span><strong>I² ${selected.i2==null?"—":Math.round(selected.i2)+"%"}</strong></div><div><span>P value</span><strong>${fmtP(selected.p_value)}</strong></div><div><span>Versus class pool</span><strong>${delta>.005?Math.round(delta/Math.abs(classRow.estimate)*100)+"% larger":delta<-.005?"smaller":"similar"}</strong></div></div><div class="interpretation"><strong>What changed?</strong><p>${selected.scenario==="Cochrane class pool"?"This is the locked class-wide reference and includes antibodies regardless of plaque clearance.":`${esc(scenarioShort[selected.scenario])} changes the evidence from ${classRow?.k||"the"} to ${selected.k} trials. ${delta>0?"The estimated benefit becomes larger.":"The estimated benefit does not become larger."}`}</p>${raw?`<p class="raw-note">On the original scale: <strong>${fmt(raw.estimate,2)} points</strong> (95% CI ${fmt(raw.ci_low,2)} to ${fmt(raw.ci_high,2)}).</p>`:""}</div>`;
  document.querySelector("#specification-forest").innerHTML = `<div class="forest-axis"><span style="left:0">${fmt(-range,2)}</span><span style="left:50%">0</span><span style="right:0">${fmt(range,2)}</span></div>${rows.map(row=>forestRow(row,range)).join("")}`;
  renderAgents();
}

function renderAgents() {
  const rows = evidence.agentResults.filter(row=>row.outcome===selectedOutcome && row.measure==="SMD").sort((a,b)=>a.estimate-b.estimate);
  if (!rows.length) { document.querySelector("#agent-forest").innerHTML="<p>No agent-level estimate is available for this endpoint.</p>"; return; }
  const range = Math.max(.5,...rows.flatMap(row=>[Math.abs(row.ci_low),Math.abs(row.ci_high)]))*1.05;
  document.querySelector("#agent-forest").innerHTML=rows.map(row=>forestRow(row,range)).join("");
}

function renderFixedSections() {
  const hero = evidence.outcomeSensitivities.filter(row=>row.outcome==="ADAS-Cog scale at 18 months" && ["Cochrane class pool","Response primary: clearing approved-generation trials","Currently active agents: lecanemab + donanemab"].includes(row.scenario));
  document.querySelector("#hero-forest").innerHTML=hero.map(row=>forestRow(row,.28)).join("");
  const regression=evidence.metaRegressions.filter(row=>row.measure==="SMD" && /ADAS|CDR/.test(row.outcome));
  document.querySelector("#biology-grid").innerHTML=regression.map(row=>`<article class="slope-card"><p class="eyebrow">${esc(outcomeShort[row.outcome]||row.outcome)}</p><div class="slope-number">${fmt(row.slope_per_10cl,3)}</div><p>SMD per additional 10-Centiloid reduction</p><div class="slope-meta"><span>95% CI ${fmt(row.ci_low,3)} to ${fmt(row.ci_high,3)}</span><strong>P ${fmtP(row.p_value)}</strong></div></article>`).join("")+`<article class="biology-note"><p class="eyebrow">Reading the result</p><h3>Suggestive, not definitive.</h3><p>Both slopes favor greater slowing with greater plaque removal. Their confidence intervals include no association under precision-weighted random-effects inference.</p></article>`;
  const safety=evidence.absoluteSafety.filter(row=>row.outcome==="Any ARIA E at 18 months" && ["Aducanumab","Donanemab","Lecanemab"].includes(row.agent)).sort((a,b)=>b.rd_per_1000-a.rd_per_1000);
  document.querySelector("#safety-grid").innerHTML=safety.map((row,index)=>`<article class="safety-card"><div class="safety-rank">0${index+1}</div><p class="eyebrow">${esc(row.agent)} · ARIA-E</p><div class="risk-number">+${Math.round(row.rd_per_1000)}</div><p class="risk-unit">additional events per 1,000 treated</p><div class="risk-bar"><span style="width:${Math.min(100,row.rd_per_1000/3.6)}%"></span></div><div class="risk-meta"><span>95% CI +${Math.round(row.rd_ci_low_per_1000)} to +${Math.round(row.rd_ci_high_per_1000)}</span><strong>NNH ${row.number_needed?.toFixed(1)||"—"}</strong></div></article>`).join("");
  const trialRows=evidence.trialAnnotations.map(trial=>({...trial,clearance:evidence.amyloidMapping.find(item=>item.Study===trial.Study)?.amyloid_change_cl??null}));
  document.querySelector("#trial-table").innerHTML=trialRows.map(trial=>`<tr><td><strong>${esc(trial.Study)}</strong></td><td>${esc(trial.agent)}</td><td>${esc(trial.target_class)}</td><td><span class="tag ${trial.biomarker_status==="Required"?"tag-teal":""}">${esc(trial.biomarker_status)}</span></td><td><span class="tag ${trial.termination_status==="Completed"?"tag-clear":"tag-warn"}">${esc(trial.termination_reason)}</span></td><td>${trial.clearance==null?'<span class="muted">Not matched</span>':`<strong>${fmt(trial.clearance,1)} CL</strong>`}</td></tr>`).join("");
}

function initialize(data) {
  evidence=data;
  const select=document.querySelector("#outcome-select");
  select.innerHTML=Object.keys(outcomeShort).filter(outcome=>evidence.outcomeSensitivities.some(row=>row.outcome===outcome&&row.measure==="SMD")).map(outcome=>`<option value="${esc(outcome)}">${esc(outcomeShort[outcome])}</option>`).join("");
  select.value=selectedOutcome;
  select.addEventListener("change",event=>{selectedOutcome=event.target.value;selectedScenario="Response primary: clearing approved-generation trials";renderExplorer();});
  renderFixedSections(); renderExplorer();
}

if (window.__EVIDENCE__) {
  initialize(window.__EVIDENCE__);
} else {
  fetch("evidence.json").then(response=>{if(!response.ok)throw new Error("Evidence registry unavailable");return response.json();}).then(initialize).catch(error=>{document.querySelector("#selected-result").innerHTML=`<p role="alert">${esc(error.message)}</p>`;});
}
