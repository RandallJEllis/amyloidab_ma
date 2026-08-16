const scenarioOrder = ["Cochrane class pool", "Biomarker-confirmed", "Demonstrated clearance: >=10 CL", "Response primary: clearing approved-generation trials", "Currently active agents: lecanemab + donanemab"];
const scenarioShort = {"Cochrane class pool":"All antibodies","Biomarker-confirmed":"Biomarker confirmed","Demonstrated clearance: >=10 CL":"Clears ≥10 CL","Response primary: clearing approved-generation trials":"Response criteria","Currently active agents: lecanemab + donanemab":"Lecanemab + donanemab"};
const outcomeShort = {"ADAS-Cog scale at 18 months":"ADAS-Cog · 18 months","CDR-SB scale at 18 months":"CDR-SB · 18 months","MMSE scale at 18 months":"MMSE · 18 months","ADCS-ADL score at 18 months":"ADCS-ADL · 18 months","ADCS-ADL-MCI score at 18 months":"ADCS-ADL-MCI · 18 months","ADCS-iADL score at 18 months":"ADCS-iADL · 18 months","DAD total score at 18 months":"DAD · 18 months"};
const clinicalThresholds = {
  "ADAS-Cog scale at 18 months": {
    measure: "MD",
    unit: "points",
    direction: -1,
    lines: [
      { value: -2, label: "2pt", title: "Lower MCI benchmark", explanation: "On ADAS-Cog, a 2-point treatment–placebo difference is the lower end of Cochrane’s MCI benchmark and the threshold Avgerinos et al. applied from Lansdall et al. Negative values indicate less worsening with treatment." },
      { value: -3, label: "3pt", title: "Upper MCI benchmark", explanation: "On ADAS-Cog, a 3-point treatment–placebo difference is the upper end of Cochrane’s benchmark for mild cognitive impairment. Negative values indicate less worsening with treatment." },
      { value: -4, label: "4pt", title: "Dementia benchmark", explanation: "On ADAS-Cog, a 4-point treatment–placebo difference is Cochrane’s cited benchmark for the dementia stage. Negative values indicate less worsening with treatment." },
    ],
    sources: "Avgerinos et al. (2024), applying Lansdall et al. (2023): 2 points; Cochrane (2026): 2–3 points in MCI and 4 points in dementia.",
    plotting: "ADAS-Cog is lower-is-better, so benefits and thresholds appear on the negative side of the axis.",
  },
  "CDR-SB scale at 18 months": {
    measure: "MD",
    unit: "points",
    direction: -1,
    lines: [
      { value: -1, label: "1pt", title: "MCI benchmark", explanation: "On CDR-SB, a 1-point treatment–placebo difference is Cochrane’s cited MCI benchmark and the threshold Avgerinos et al. applied from Lansdall et al. Negative values indicate less worsening with treatment." },
      { value: -2, label: "2pt", title: "Dementia benchmark", explanation: "On CDR-SB, a 2-point treatment–placebo difference is Cochrane’s cited benchmark for the dementia stage. Negative values indicate less worsening with treatment." },
    ],
    sources: "Avgerinos et al. (2024), applying Lansdall et al. (2023): 1 point; Cochrane (2026): 1 point in MCI and 2 points in dementia.",
    plotting: "CDR-SB is lower-is-better, so benefits and thresholds appear on the negative side of the axis.",
  },
  "MMSE scale at 18 months": {
    measure: "MD",
    unit: "points",
    direction: 1,
    lines: [{ value: 2, label: "2pt", title: "MMSE benchmark", explanation: "On MMSE, a 2-point treatment–placebo difference is the 12-month benchmark Avgerinos et al. applied from Lansdall et al. Positive values indicate better performance with treatment." }],
    sources: "Avgerinos et al. (2024), applying Lansdall et al. (2023): 2 points within 12 months.",
    plotting: "MMSE is higher-is-better, so benefits and the threshold appear on the positive side of the axis.",
  },
};
const conditionProfiles = {
  "Cochrane class pool": { description: "The Cochrane review’s prespecified class-wide comparison. It retains every eligible antibody trial for a given endpoint, regardless of amyloid biomarker entry, demonstrated plaque removal, regulatory generation, or current availability.", papers: ["aducanumab","bapineuzumab","crenezumab","gantenerumab","donanemab","lecanemab","solanezumab"] },
  "Biomarker-confirmed": { description: "Restricts the class pool to trials that required evidence of amyloid pathology at entry. It does not require a matched plaque-PET effect estimate or a particular magnitude of plaque reduction.", papers: ["aducanumab","crenezumab","gantenerumab","donanemab","lecanemab","solanezumab2018","envision"] },
  "Demonstrated clearance: >=10 CL": { description: "Restricts to trials with a matched, placebo-adjusted amyloid-PET reduction of at least 10 Centiloids (CL). Trials without a matched CL estimate are excluded rather than assigned an assumed value.", papers: ["aducanumab","gantenerumab","donanemab","lecanemab"] },
  "Response primary: clearing approved-generation trials": { description: "The response-conforming primary analysis: biomarker-confirmed trials of approved-generation antibodies with at least 10 CL placebo-adjusted amyloid reduction. ENVISION is not included because no matched trial-level CL estimate was available.", papers: ["aducanumab","donanemab","lecanemab"] },
  "Currently active agents: lecanemab + donanemab": { description: "A policy-relevant sensitivity analysis restricted to the two currently active agents in this evidence package, lecanemab and donanemab. It is not a randomized head-to-head comparison between them.", papers: ["donanemab","lecanemab"] },
};
const conditionPapers = {
  aducanumab: { label: "Budd Haeberlein et al., 2022 — EMERGE and ENGAGE", url: "https://doi.org/10.14283/jpad.2022.30" }, bapineuzumab: { label: "Salloway et al., 2014; Vandenberghe et al., 2016 — bapineuzumab phase 3 trials", url: "https://doi.org/10.1056/NEJMoa1304839" }, crenezumab: { label: "Ostrowitzki et al., 2022 — CREAD and CREAD 2", url: "https://doi.org/10.1001/jamaneurol.2022.2909" }, gantenerumab: { label: "Ostrowitzki et al., 2017 — SCarlet RoAD", url: "https://doi.org/10.1186/s13195-017-0318-y" }, donanemab: { label: "Sims et al., 2023 — TRAILBLAZER-ALZ 2", url: "https://doi.org/10.1001/jama.2023.13239" }, lecanemab: { label: "Van Dyck et al., 2023 — CLARITY AD", url: "https://doi.org/10.1056/NEJMoa2212948" }, solanezumab: { label: "Siemers et al., 2016; Honig et al., 2018 — EXPEDITION trials", url: "https://doi.org/10.1016/j.jalz.2015.06.1893" }, solanezumab2018: { label: "Honig et al., 2018 — EXPEDITION 3", url: "https://doi.org/10.1056/NEJMoa1705971" }, envision: { label: "NCT05310071 — ENVISION aducanumab verification study", url: "https://clinicaltrials.gov/study/NCT05310071" },
};
let evidence;
let selectedOutcome = "ADAS-Cog scale at 18 months";
let selectedScenario = "Response primary: clearing approved-generation trials";

const fmt = (v, d=3) => `${v < 0 ? "−" : v > 0 ? "+" : ""}${Math.abs(v).toFixed(d)}`;
const fmtP = v => v < .001 ? "<.001" : v.toFixed(3).replace(/^0/, "");
const favorableDirection = outcome => /ADAS|CDR/.test(outcome) ? -1 : 1;
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

const thresholdFor = outcome => clinicalThresholds[outcome] || null;
const position = (value, range) => ((value + range)/(range*2))*100;

function displayRows(rows, rawRows, outcome, key) {
  if (!thresholdFor(outcome)) return rows;
  const available = new Map(rawRows.filter(row => row.outcome === outcome && row.measure === "MD").map(row => [row[key], row]));
  return rows.map(row => available.get(row[key])).filter(Boolean);
}

function plotRange(rows, outcome, floor=.35) {
  const thresholds = thresholdFor(outcome)?.lines || [];
  return Math.max(floor, ...rows.flatMap(row => [Math.abs(row.ci_low), Math.abs(row.ci_high)]), ...thresholds.map(line => Math.abs(line.value))) * 1.1;
}

function thresholdLines(outcome, range, className="meaningful-line") {
  return (thresholdFor(outcome)?.lines || []).map(line => `<span class="${className} ${line.value<0?"tooltip-open-right":"tooltip-open-left"}" style="left:${position(line.value,range)}%" tabindex="0" aria-label="${esc(`${line.label}, ${line.title}. ${line.explanation}`)}"><span class="threshold-tooltip" aria-hidden="true"><strong>${esc(line.label)} · ${esc(line.title)}</strong><span>${esc(line.explanation)}</span></span></span>`).join("");
}

function forestAxis(outcome, range) {
  const labels = (thresholdFor(outcome)?.lines || []).map(line => `<span class="threshold-axis-label" style="left:${position(line.value,range)}%">${esc(line.label)}</span>`).join("");
  return `<div class="forest-axis"><span class="axis-limit" style="left:0">${fmt(-range,2)}</span><span class="axis-null" style="left:50%">0</span><span class="axis-limit axis-limit-right" style="right:0">${fmt(range,2)}</span>${labels}</div>`;
}

function thresholdNote(outcome) {
  const threshold = thresholdFor(outcome);
  if (!threshold) return `<div class="threshold-note threshold-none"><p><strong>Clinical-meaningfulness threshold:</strong> Neither the Cochrane review nor Avgerinos et al. specified an established point threshold for this scale, so no red reference line is shown.</p></div>`;
  const references = `<span class="threshold-sources"><a href="https://doi.org/10.1038/s41598-024-75204-8" target="_blank" rel="noopener">Avgerinos 2024</a> · <a href="https://doi.org/10.14283/jpad.2022.102" target="_blank" rel="noopener">Lansdall 2023</a> · <a href="https://doi.org/10.1002/14651858.CD016297" target="_blank" rel="noopener">Cochrane 2026</a></span>`;
  return `<div class="threshold-note"><p><strong>What the red dashed lines mean.</strong> They mark published point-scale benchmarks proposed as the smallest changes likely to be clinically meaningful—not tests of statistical significance and not values calculated from this meta-analysis. The Cochrane review describes its ADAS-Cog and CDR-SB values as anchor-based MCIDs, meaning score changes were related to an external clinical anchor used to judge meaningful change. Avgerinos et al. did not create a single cross-scale cutoff; it applied instrument-specific thresholds reported by Lansdall et al. An estimate or confidence interval can therefore exclude zero while still falling short of a cited benchmark. ${esc(threshold.sources)}</p><p><strong>How the values are placed on this plot.</strong> The estimate and threshold are both shown as raw mean differences in the original instrument’s points; no SMD back-conversion or cross-scale standardization is used. ${esc(threshold.plotting)} ADAS-Cog, CDR-SB, and MMSE points are therefore interpretable only within their own instruments, not as equivalent amounts of benefit across scales.</p><p><strong>Important limitation.</strong> The cited thresholds were largely derived for individual change over approximately 6–12 months, whereas these plots summarize between-group differences at 18 months. They are useful contextual reference values, not universal decision rules or proof that a smaller effect is unimportant to every patient.</p>${references}</div>`;
}

function thresholdAssessment(row) {
  const threshold = thresholdFor(row.outcome);
  if (!threshold) return "No established threshold was specified for this scale in the cited papers.";
  const transformed = [row.ci_low * threshold.direction, row.ci_high * threshold.direction].sort((a,b)=>a-b);
  const estimate = row.estimate * threshold.direction;
  const lowest = Math.min(...threshold.lines.map(line => Math.abs(line.value)));
  if (transformed[1] < lowest) return `The entire 95% CI remains below the lowest cited ${lowest}-point threshold.`;
  if (estimate < lowest) return `The point estimate remains below the lowest cited ${lowest}-point threshold; the CI reaches or crosses it.`;
  return `The point estimate reaches the lowest cited ${lowest}-point threshold; applicability still depends on disease stage and time horizon.`;
}

function forestRow(row, range) {
  const low = Math.max(0, ((row.ci_low + range)/(range*2))*100);
  const high = Math.min(100, ((row.ci_high + range)/(range*2))*100);
  const point = ((row.estimate + range)/(range*2))*100;
  const label = row.scenario ? scenarioShort[row.scenario] || row.scenario : row.agent || row.target_class || "Estimate";
  const favorable = row.estimate * favorableDirection(row.outcome) > 0;
  const unit = thresholdFor(row.outcome) ? "points" : "standardized units";
  return `<div class="forest-row"><div class="forest-label"><strong>${esc(label)}</strong><span>${row.k} ${row.k===1?"trial":"trials"}</span></div><div class="forest-track" aria-label="${esc(label)}, estimate ${fmt(row.estimate)} ${unit}, 95% confidence interval ${fmt(row.ci_low)} to ${fmt(row.ci_high)}">${thresholdLines(row.outcome,range)}<span class="null-line"></span><span class="ci-line" style="left:${low}%;width:${Math.max(0,high-low)}%"></span><span class="point ${favorable?"point-good":"point-neutral"}" style="left:${point}%"></span></div><div class="forest-value"><strong>${fmt(row.estimate)}</strong><span>${fmt(row.ci_low)} to ${fmt(row.ci_high)}</span></div></div>`;
}

function rowsForOutcome() {
  const smd = evidence.outcomeSensitivities.filter(row => row.outcome === selectedOutcome && row.measure === "SMD").sort((a,b)=>scenarioOrder.indexOf(a.scenario)-scenarioOrder.indexOf(b.scenario));
  return displayRows(smd, evidence.rawMeanDifferences, selectedOutcome, "scenario");
}

function renderExplorer() {
  const rows = rowsForOutcome();
  if (!rows.some(row => row.scenario === selectedScenario)) selectedScenario = rows.find(row => row.scenario.includes("Response primary"))?.scenario || rows[0]?.scenario;
  const selected = rows.find(row => row.scenario === selectedScenario) || rows[0];
  const classRow = rows.find(row => row.scenario === "Cochrane class pool");
  const standardized = evidence.outcomeSensitivities.find(row => row.outcome === selectedOutcome && row.measure === "SMD" && row.scenario === selected.scenario);
  const range = plotRange(rows, selectedOutcome);
  const delta = classRow ? (selected.estimate-classRow.estimate)*favorableDirection(selectedOutcome) : 0;
  document.querySelector("#scenario-controls").innerHTML = rows.map(row => `<label class="radio-card ${row.scenario===selected.scenario?"radio-selected":""}"><input type="radio" name="scenario" value="${esc(row.scenario)}" ${row.scenario===selected.scenario?"checked":""}><span><strong>${esc(scenarioShort[row.scenario]||row.scenario)}</strong><small>${row.k} ${row.k===1?"trial":"trials"}</small></span></label>`).join("");
  document.querySelectorAll('input[name="scenario"]').forEach(input => input.addEventListener("change", event => { selectedScenario=event.target.value; renderExplorer(); }));
  const measure = thresholdFor(selectedOutcome) ? "MD · points" : "SMD";
  const secondary = thresholdFor(selectedOutcome) && standardized ? `<p class="raw-note">Standardized estimate: <strong>${fmt(standardized.estimate)} SMD</strong> (95% CI ${fmt(standardized.ci_low)} to ${fmt(standardized.ci_high)}).</p>` : "";
  document.querySelector("#selected-result").innerHTML = `<div class="result-topline"><div><p class="eyebrow">Selected specification</p><h3>${esc(scenarioShort[selected.scenario]||selected.scenario)}</h3></div><span class="analysis-id">Analysis ${esc(selected.analysis_id)}</span></div><div class="big-estimate"><span>${fmt(selected.estimate)}</span><div><strong>${measure}</strong><small>95% CI ${fmt(selected.ci_low)} to ${fmt(selected.ci_high)}</small></div></div><div class="estimate-ruler">${thresholdLines(selectedOutcome,range,"meaningful-line ruler-meaningful")}<span class="ruler-null"></span><span class="ruler-ci" style="left:${position(selected.ci_low,range)}%;width:${position(selected.ci_high,range)-position(selected.ci_low,range)}%"></span><span class="ruler-point" style="left:${position(selected.estimate,range)}%"></span></div><div class="metric-grid"><div><span>Trials</span><strong>${selected.k}</strong></div><div><span>Heterogeneity</span><strong>I² ${selected.i2==null?"—":Math.round(selected.i2)+"%"}</strong></div><div><span>P value</span><strong>${fmtP(selected.p_value)}</strong></div><div><span>Versus class pool</span><strong>${delta>.005?Math.round(delta/Math.abs(classRow.estimate)*100)+"% larger":delta<-.005?"smaller":"similar"}</strong></div></div><div class="interpretation"><strong>What changed?</strong><p>${selected.scenario==="Cochrane class pool"?"This is the locked class-wide reference and includes antibodies regardless of plaque clearance.":`${esc(scenarioShort[selected.scenario])} changes the evidence from ${classRow?.k||"the"} to ${selected.k} trials. ${delta>0?"The estimated benefit becomes larger.":"The estimated benefit does not become larger."}`}</p><p><strong>Clinical context:</strong> ${esc(thresholdAssessment(selected))}</p>${secondary}</div>`;
  document.querySelector("#specification-forest").innerHTML = `${forestAxis(selectedOutcome,range)}${rows.map(row=>forestRow(row,range)).join("")}${thresholdNote(selectedOutcome)}`;
  renderAgents();
}

function renderAgents() {
  const smd = evidence.agentResults.filter(row=>row.outcome===selectedOutcome && row.measure==="SMD").sort((a,b)=>a.estimate-b.estimate);
  const rows = displayRows(smd, evidence.rawAgentResults, selectedOutcome, "agent").sort((a,b)=>a.estimate-b.estimate);
  if (!rows.length) { document.querySelector("#agent-forest").innerHTML="<p>No agent-level estimate is available for this endpoint.</p>"; return; }
  const range = plotRange(rows, selectedOutcome, .5);
  document.querySelector("#agent-forest").innerHTML=`${forestAxis(selectedOutcome,range)}${rows.map(row=>forestRow(row,range)).join("")}${thresholdNote(selectedOutcome)}`;
}

function renderFixedSections() {
  const heroSmd = evidence.outcomeSensitivities.filter(row=>row.outcome==="ADAS-Cog scale at 18 months" && row.measure==="SMD" && ["Cochrane class pool","Response primary: clearing approved-generation trials","Currently active agents: lecanemab + donanemab"].includes(row.scenario));
  const hero = displayRows(heroSmd, evidence.rawMeanDifferences, "ADAS-Cog scale at 18 months", "scenario");
  const heroRange = plotRange(hero, "ADAS-Cog scale at 18 months");
  document.querySelector("#hero-forest").innerHTML=`${forestAxis("ADAS-Cog scale at 18 months",heroRange)}${hero.map(row=>forestRow(row,heroRange)).join("")}${thresholdNote("ADAS-Cog scale at 18 months")}`;
  const regression=evidence.metaRegressions.filter(row=>row.measure==="SMD" && /ADAS|CDR/.test(row.outcome));
  document.querySelector("#biology-grid").innerHTML=regression.map(row=>`<article class="slope-card"><p class="eyebrow">${esc(outcomeShort[row.outcome]||row.outcome)}</p><div class="slope-number">${fmt(row.slope_per_10cl,3)}</div><p>SMD per additional 10-Centiloid reduction</p><div class="slope-meta"><span>95% CI ${fmt(row.slope_ci_low,3)} to ${fmt(row.slope_ci_high,3)}</span><strong>P ${fmtP(row.slope_p)}</strong></div></article>`).join("")+`<article class="biology-note"><p class="eyebrow">Reading the result</p><h3>Suggestive, not definitive.</h3><p>Both slopes favor greater slowing with greater plaque removal. Their confidence intervals include no association under precision-weighted random-effects inference.</p></article>`;
  const safety=evidence.absoluteSafety.filter(row=>row.outcome==="Any ARIA E at 18 months" && ["Aducanumab","Donanemab","Lecanemab"].includes(row.agent)).sort((a,b)=>b.rd_per_1000-a.rd_per_1000);
  document.querySelector("#safety-grid").innerHTML=safety.map((row,index)=>`<article class="safety-card"><div class="safety-rank">0${index+1}</div><p class="eyebrow">${esc(row.agent)} · ARIA-E</p><div class="risk-number">+${Math.round(row.rd_per_1000)}</div><p class="risk-unit">additional events per 1,000 treated</p><div class="risk-bar"><span style="width:${Math.min(100,row.rd_per_1000/3.6)}%"></span></div><div class="risk-meta"><span>95% CI +${Math.round(row.rd_ci_low_per_1000)} to +${Math.round(row.rd_ci_high_per_1000)}</span><strong>NNH ${row.number_needed?.toFixed(1)||"—"}</strong></div></article>`).join("");
  const trialRows=evidence.trialAnnotations.map(trial=>({...trial,clearance:evidence.amyloidMapping.find(item=>item.Study===trial.Study)?.amyloid_change_cl??null}));
  document.querySelector("#trial-table").innerHTML=trialRows.map(trial=>`<tr><td><strong>${esc(trial.Study)}</strong></td><td>${esc(trial.agent)}</td><td>${esc(trial.target_class)}</td><td><span class="tag ${trial.biomarker_status==="Required"?"tag-teal":""}">${esc(trial.biomarker_status)}</span></td><td><span class="tag ${trial.termination_status==="Completed"?"tag-clear":"tag-warn"}">${esc(trial.termination_reason)}</span></td><td>${trial.clearance==null?'<span class="muted">Not matched</span>':`<strong>${fmt(trial.clearance,1)} CL</strong>`}</td></tr>`).join("");
}

function conditionEstimate(outcome, scenario, measure) { return evidence.outcomeSensitivities.find(row => row.outcome === outcome && row.scenario === scenario && row.measure === measure); }
function conditionStatistic(row, kind="effect") { if (!row) return `<span class="muted">Not reported</span>`; if (kind === "trials") return `${row.k}`; const prefix = row.measure === "RR" ? "RR " : "SMD "; return `<strong>${prefix}${fmt(row.estimate)}</strong><small>95% CI ${fmt(row.ci_low)} to ${fmt(row.ci_high)} · ${row.k} trials</small>`; }
function renderAnalysisConditions() {
  const tableRows = scenarioOrder.map(scenario => { const adasRow = conditionEstimate("ADAS-Cog scale at 18 months", scenario, "SMD"); const cdrRow = conditionEstimate("CDR-SB scale at 18 months", scenario, "SMD"); const ariaRow = conditionEstimate("Any ARIA E at 18 months", scenario, "RR"); return `<tr><th scope="row">${esc(scenarioShort[scenario])}</th><td>${conditionStatistic(adasRow, "trials")}</td><td>${conditionStatistic(adasRow)}</td><td>${conditionStatistic(cdrRow)}</td><td>${conditionStatistic(ariaRow)}</td></tr>`; }).join("");
  document.querySelector("#condition-statistics").innerHTML = `<div class="table-wrap condition-table-wrap"><table><thead><tr><th>Condition</th><th>ADAS-Cog trials</th><th>ADAS-Cog · 18 mo</th><th>CDR-SB · 18 mo</th><th>ARIA-E · 18 mo</th></tr></thead><tbody>${tableRows}</tbody></table></div><p class="condition-table-note">Cognitive effects are standardized mean differences (SMDs); negative values favor treatment for ADAS-Cog and CDR-SB. ARIA-E is a risk ratio (RR); values above 1 indicate greater risk with treatment. Trial counts are outcome-specific, so they can differ across columns.</p>`;
  document.querySelector("#condition-cards").innerHTML = scenarioOrder.map(scenario => { const profile = conditionProfiles[scenario]; const refs = profile.papers.map(key => conditionPapers[key]).filter(Boolean).map(paper => `<li><a href="${paper.url}" target="_blank" rel="noopener">${esc(paper.label)}</a></li>`).join(""); return `<article class="condition-card"><p class="eyebrow">Analysis condition</p><h3>${esc(scenarioShort[scenario])}</h3><p>${esc(profile.description)}</p><div class="condition-references"><strong>Key references and trial reports</strong><ul>${refs}</ul></div></article>`; }).join("");
}

function initialize(data) {
  evidence=data;
  const select=document.querySelector("#outcome-select");
  select.innerHTML=Object.keys(outcomeShort).filter(outcome=>evidence.outcomeSensitivities.some(row=>row.outcome===outcome&&row.measure==="SMD")).map(outcome=>`<option value="${esc(outcome)}">${esc(outcomeShort[outcome])}</option>`).join("");
  select.value=selectedOutcome;
  select.addEventListener("change",event=>{selectedOutcome=event.target.value;selectedScenario="Response primary: clearing approved-generation trials";renderExplorer();});
  renderFixedSections(); renderAnalysisConditions(); renderExplorer();
}

if (window.__EVIDENCE__) {
  initialize(window.__EVIDENCE__);
} else {
  fetch("evidence.json").then(response=>{if(!response.ok)throw new Error("Evidence registry unavailable");return response.json();}).then(initialize).catch(error=>{document.querySelector("#selected-result").innerHTML=`<p role="alert">${esc(error.message)}</p>`;});
}
