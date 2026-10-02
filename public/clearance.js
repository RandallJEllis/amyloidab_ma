/* Displays R-generated models only. No regression is fitted in the browser. */
(() => {
  const $ = selector => document.querySelector(selector);
  const number = (value, digits = 3) => Number.isFinite(value) ? fmt(value, digits) : "—";
  const table = (caption, headers, body) => `<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(caption)}"><table><caption>${esc(caption)}</caption><thead><tr>${headers.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div>`;
  let models, current, selectedTrial;

  function drawPlot(model) {
    const trials = model.trials.filter(t => t.included);
    if (!trials.length) return "<p>No eligible PET–clinical pairs for this selection.</p>";
    const curve = model.curve || [];
    const width = Math.max(280, Math.min(680, $("#clearance-plot").clientWidth || 680));
    const compact = width < 500;
    const height = compact ? 350 : 420, left = compact ? 52 : 72, right = 26, top = compact ? 60 : 40, bottom = 65;
    const observedX = trials.map(t => t.reduction_cl);
    const xMin = Math.min(0, ...observedX) - 8, xMax = Math.max(0, ...observedX) + 8;
    const bounds = [...trials, ...curve].flatMap(t => [t.ci_low, t.ci_high]);
    const lo = Math.min(0, ...bounds), hi = Math.max(0, ...bounds), pad = Math.max(.05, (hi - lo) * .08);
    const yMin = lo - pad, yMax = hi + pad;
    const x = value => left + (value - xMin) / (xMax - xMin) * (width - left - right);
    const y = value => top + (yMax - value) / (yMax - yMin) * (height - top - bottom);
    const ticks = Array.from({length: 5}, (_, i) => yMin + (yMax - yMin) * i / 4);
    const xTicks = Array.from({length: Math.floor(xMax / 20) + 1}, (_, i) => i * 20);
    if (xMin <= -20) xTicks.unshift(-20);
    const path = (points, key) => points.map((p, i) => `${i ? "L" : "M"}${x(p.reduction_cl).toFixed(2)},${y(p[key]).toFixed(2)}`).join(" ");
    const band = curve.length ? `${path(curve, "ci_low")} ${path([...curve].reverse(), "ci_high").replace(/^M/, "L")} Z` : "";
    const maxWeight = Math.max(...trials.map(t => t.weight_percent || 0), 1);
    return `<svg class="clearance-chart" viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="clearance-chart-title clearance-chart-description">
      <title id="clearance-chart-title">${esc(outcomeShort[model.outcome])}: amyloid removal and clinical effect</title>
      <desc id="clearance-chart-description">Horizontal axis: placebo-adjusted amyloid removal in Centiloids. Vertical axis: treatment minus placebo effect in standardized units. Select a numbered trial to inspect its measurements and reference. All values are also available in the trial table below.</desc>
      ${ticks.map(t => `<line class="grid-line" x1="${left}" x2="${width - right}" y1="${y(t)}" y2="${y(t)}"/><text x="${left - 12}" y="${y(t) + 5}" text-anchor="end">${number(t, 2)}</text>`).join("")}
      ${xTicks.map(t => `<text x="${x(t)}" y="${height - bottom + 25}" text-anchor="middle">${t}</text>`).join("")}
      <line class="zero-line" x1="${left}" x2="${width - right}" y1="${y(0)}" y2="${y(0)}"/>
      <line class="zero-line" x1="${x(0)}" x2="${x(0)}" y1="${top}" y2="${height - bottom}"/>
      ${curve.length ? `<path class="confidence-band" d="${band}"/><path class="regression-line" d="${path(curve, "estimate")}"/>` : ""}
      <text class="plot-label" x="${left}" y="20">${compact ? "Clinical effect (SMD)" : `Clinical effect (SMD) · ${/MMSE/.test(model.outcome) ? "higher" : "lower"} favors treatment`}</text>
      ${compact ? `<text x="${left}" y="40">${/MMSE/.test(model.outcome) ? "Higher" : "Lower"} favors treatment</text>` : ""}
      <text class="plot-label" x="${(left + width - right) / 2}" y="${height - 12}" text-anchor="middle">${compact ? "Amyloid removed (CL) →" : "Placebo-adjusted amyloid removal (CL) →"}</text>
      ${trials.map((t, index) => {
        const radius = t.weight_percent == null ? 12 : 23 * Math.sqrt(t.weight_percent / maxWeight);
        return `<line class="trial-interval" x1="${x(t.reduction_cl)}" x2="${x(t.reduction_cl)}" y1="${y(t.ci_low)}" y2="${y(t.ci_high)}"/>
          <g class="clearance-dot" role="button" tabindex="0" data-trial-index="${index}" aria-label="Trial ${index + 1}: ${esc(t.study)}, ${number(t.reduction_cl, 2)} CL removal, ${number(t.effect)} SMD" aria-pressed="${t.study === selectedTrial}" aria-controls="clearance-trial-detail"><title>${esc(t.study)}</title><circle class="clearance-hit-target" cx="${x(t.reduction_cl)}" cy="${y(t.effect)}" r="${Math.max(14, radius)}"/><circle cx="${x(t.reduction_cl)}" cy="${y(t.effect)}" r="${radius}"/><text class="${radius < 9 ? "small-bubble-label" : ""}" x="${x(t.reduction_cl) + (radius < 9 ? 13 : 0)}" y="${y(t.effect) + 4}" text-anchor="middle">${index + 1}</text></g>`;
      }).join("")}
    </svg>`;
  }

  function showTrial(study) {
    const t = current.trials.find(t => t.study === study && t.included);
    if (!t) { $("#clearance-trial-detail").innerHTML = "<p>No contributing trial.</p>"; return; }
    selectedTrial = t.study;
    $("#clearance-trial").value = t.study;
    document.querySelectorAll(".clearance-dot").forEach(dot => dot.setAttribute("aria-pressed", current.trials.filter(t => t.included)[Number(dot.dataset.trialIndex)].study === t.study ? "true" : "false"));
    const paper = trialPaperForStudy(t.study);
    $("#clearance-trial-detail").innerHTML = `<h3>${esc(t.study)}</h3><p>${esc(t.agent)}</p><dl>
      <dt>Placebo-adjusted amyloid removal</dt><dd>${number(t.reduction_cl, 2)} CL${t.reduction_cl < 0 ? " (more amyloid than placebo)" : ""}</dd>
      <dt>Clinical effect · treatment minus placebo</dt><dd>${number(t.effect)} SMD<br>95% CI ${number(t.ci_low)} to ${number(t.ci_high)}</dd>
      <dt>Regression weight</dt><dd>${t.weight_percent == null ? "Not available: model not estimable" : `${t.weight_percent.toFixed(1)}%`}</dd>
      <dt>PET timing</dt><dd>${t.pet_week == null ? "Unverified" : `Week ${t.pet_week}`}</dd></dl>
      <p><strong>${esc(t.pairing_status)}</strong></p><p>${esc(t.mapping_note)}</p><p>PET source: ${esc(t.amyloid_source)}</p>
      <p><a href="${esc(paper.url)}" target="_blank" rel="noopener">${esc(paper.label)} ↗</a></p>`;
  }

  function renderMembership(model) {
    const included = model.trials.filter(t => t.included).length;
    $("#clearance-membership-summary").textContent = `Trial membership & references (${included} included, ${model.trials.length - included} excluded)`;
    $("#clearance-membership").innerHTML = `<p>Every trial reporting this clinical endpoint in the source registry is listed. Other trials may report the outcome at a different follow-up. Links open in a new tab.</p>` + table("Trial measurements and inclusion decisions", ["Trial / reference", "Decision", "Removal (CL)", "Clinical effect (SMD; 95% CI)", "PET pairing"], model.trials.map(t => {
      const paper = trialPaperForStudy(t.study);
      return `<tr><th scope="row">${esc(t.study)}<span class="clearance-trial-note">${esc(t.agent)}</span><a href="${esc(paper.url)}" target="_blank" rel="noopener">${esc(paper.label)} ↗</a></th><td><strong>${t.included ? "Included" : "Excluded"}</strong><span class="clearance-trial-note">${esc(t.reason)}</span></td><td>${number(t.reduction_cl, 2)}</td><td>${number(t.effect)}<span class="clearance-trial-note">${number(t.ci_low)} to ${number(t.ci_high)}</span></td><td>${esc(t.pairing_status)}<span class="clearance-trial-note">${esc(t.mapping_note)}</span></td></tr>`;
    }).join(""));
  }

  function renderSensitivity(model) {
    $("#clearance-sensitivity").innerHTML = `<p>Each row refits the selected model after removing one trial or all trials of one drug. Compare the slopes and intervals with the full selected model; these are overlapping exploratory analyses, not independent significance tests. All omissions are shown, including those leaving too few trials to estimate a slope.</p>` + ["trial", "drug"].map(unit => table(`Omit one ${unit} at a time`, [`Omitted ${unit}`, "Trials left", "Slope per 10 CL", "95% CI", "Status"], model.sensitivity.filter(row => row.unit === unit).map(row => `<tr><th scope="row">${esc(row.omitted)}</th><td>${row.k}</td><td>${number(row.slope_per_10cl)}</td><td>${row.status === "estimated" ? `${number(row.ci_low)} to ${number(row.ci_high)}` : "—"}</td><td>${row.status === "estimated" ? "Exploratory estimate" : esc(row.reason)}</td></tr>`).join(""))).join("");
  }

  function render() {
    current = models.find(m => m.outcome === $("#clearance-outcome").value && m.scope === $("#clearance-scope").value);
    const trials = current.trials.filter(t => t.included);
    if (!trials.some(t => t.study === selectedTrial)) selectedTrial = trials[0]?.study;
    $("#clearance-scope-note").textContent = current.scope === "all_pet"
      ? "Includes every recorded numeric PET value for this outcome, including small reductions and increases. No minimum clearance or approval requirement. Some PET measurements have uncertain or mismatched timing; inspect the trial details below."
      : "Sensitivity analysis: retains PET measurements within ±13 weeks of the nominal 78-week clinical endpoint. Unknown PET timing is excluded. This approximate screen does not verify dose, population or the underlying source measurement.";
    const direction = /MMSE/.test(current.outcome) ? "Positive" : "Negative";
    const spansZero = current.ci_low <= 0 && current.ci_high >= 0;
    $("#clearance-status").innerHTML = `<div class="clearance-metrics"><div><span>Clinical effect per additional 10 CL removed</span><strong class="clearance-slope">${number(current.slope_per_10cl)}</strong><span>${current.status === "estimated" ? "SMD / 10 CL" : "Slope not estimable"}</span></div><div><span>95% confidence interval</span><strong>${current.status === "estimated" ? `${number(current.ci_low)} to ${number(current.ci_high)}` : "—"}</strong></div><div><span>Contributing trials / drugs</span><strong>${current.k} / ${current.agents}</strong></div><div><span>P value</span><strong>${current.p_value == null ? "—" : fmtP(current.p_value)}</strong></div></div><p class="clearance-direction">${current.status === "estimated" ? `${direction} slopes favor greater benefit with greater removal. ${spansZero ? "The confidence interval includes zero." : "The confidence interval excludes zero in this exploratory specification."}` : esc(current.reason)} Few trials: interpret the slope and its uncertainty together.</p>`;
    $("#clearance-chart-note").textContent = `${current.status === "estimated" ? "Line: fitted association. Shading: pointwise 95% confidence interval for the mean association. Bubble area: regression weight." : "No fitted line: too few trials to estimate this model. Bubbles are equal size."} Vertical bars: trial clinical-effect 95% intervals. Select a numbered bubble or use the trial menu to inspect its source.`;
    $("#clearance-trial").innerHTML = trials.map((t, i) => `<option value="${esc(t.study)}">${i + 1}. ${esc(t.study)}</option>`).join("");
    $("#clearance-trial").disabled = !trials.length;
    renderPlot();
    showTrial(selectedTrial);
    renderMembership(current);
    renderSensitivity(current);
    const url = new URL(location.href);
    url.searchParams.set("clearanceOutcome", current.outcome);
    url.searchParams.set("clearanceScope", current.scope);
    try { history.replaceState(null, "", url); } catch { /* Offline previews may disallow history updates. */ }
  }

  function renderPlot() {
    $("#clearance-plot").innerHTML = drawPlot(current);
    const trials = current.trials.filter(t => t.included);
    document.querySelectorAll(".clearance-dot").forEach(dot => {
      const activate = () => showTrial(trials[Number(dot.dataset.trialIndex)].study);
      dot.addEventListener("click", activate);
      dot.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(); } });
    });
  }

  function initializeClearance(data) {
    models = data.continuousClearance;
    if (!models?.length) { $("#clearance-status").textContent = "Continuous-clearance results are unavailable in this evidence release."; return; }
    const outcomes = [...new Set(models.map(m => m.outcome))];
    $("#clearance-outcome").innerHTML = outcomes.map(o => `<option value="${esc(o)}">${esc(outcomeShort[o] || o)}</option>`).join("");
    const params = new URL(location.href).searchParams;
    if (outcomes.includes(params.get("clearanceOutcome"))) $("#clearance-outcome").value = params.get("clearanceOutcome");
    if (["all_pet", "time_screen"].includes(params.get("clearanceScope"))) $("#clearance-scope").value = params.get("clearanceScope");
    $("#clearance-outcome").addEventListener("change", render);
    $("#clearance-scope").addEventListener("change", render);
    $("#clearance-trial").addEventListener("change", event => showTrial(event.target.value));
    render();
    // Reflow the SVG coordinates and labels when the layout crosses a breakpoint.
    let plotWidth = $("#clearance-plot").clientWidth;
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      if (Math.abs(width - plotWidth) > 1) { plotWidth = width; renderPlot(); }
    }).observe($("#clearance-plot"));
  }
  if (typeof evidence !== "undefined" && evidence) initializeClearance(evidence);
  else document.addEventListener("evidence-ready", event => initializeClearance(event.detail), {once: true});
})();
