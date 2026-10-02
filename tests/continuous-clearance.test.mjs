import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data = JSON.parse(readFileSync(new URL('../public/evidence.json', import.meta.url)));
const models = data.continuousClearance;
const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);

test('continuous models reproduce all existing SMD regressions without clearance selection', () => {
  assert.equal(models.length, 6);
  for (const model of models.filter(m => m.scope === 'all_pet')) {
    const original = data.metaRegressions.find(m => m.outcome === model.outcome && m.measure === 'SMD');
    assert.equal(model.k, original.k);
    for (const [a,b] of [['slope_per_10cl','slope_per_10cl'],['ci_low','slope_ci_low'],['ci_high','slope_ci_high'],['p_value','slope_p']]) close(model[a], original[b]);
    const eligible = data.conditionRegistry.filter(t => t.outcome === model.outcome && t.amyloid_change_cl !== null);
    assert.deepEqual(model.trials.filter(t => t.included).map(t => t.study).sort(), eligible.map(t => t.study).sort());
    for (const trial of model.trials) {
      const source = data.conditionRegistry.find(t => t.outcome === model.outcome && t.study === trial.study);
      assert.equal(trial.reduction_cl === null, source.amyloid_change_cl === null);
      if (trial.reduction_cl !== null) close(trial.reduction_cl, -source.amyloid_change_cl);
      close(trial.effect, source.effect);
    }
  }
  const adas = models.find(m => m.analysis_id === '1.1' && m.scope === 'all_pet');
  assert.ok(adas.trials.some(t => t.included && t.reduction_cl < 0));
  assert.ok(adas.trials.some(t => t.included && t.reduction_cl > 0 && t.reduction_cl < 10));
  assert.ok(adas.trials.filter(t => t.reduction_cl === null).every(t => !t.included && t.weight_percent === null));
});

test('timing sensitivity does not silently treat missing timing as compatible', () => {
  for (const model of models.filter(m => m.scope === 'time_screen')) {
    for (const trial of model.trials) assert.equal(trial.included, trial.reduction_cl !== null && trial.pet_week !== null && Math.abs(trial.pet_week - 78) <= 13);
  }
  const mmse = models.find(m => m.analysis_id === '1.4' && m.scope === 'time_screen');
  assert.equal(mmse.k, 3);
  assert.equal(mmse.status, 'not_estimable');
  assert.equal(mmse.slope_per_10cl, null);
  assert.equal(mmse.curve, undefined);
});

test('weights, fitted lines and confidence bands agree with model inputs', () => {
  for (const model of models.filter(m => m.status === 'estimated')) {
    const trials = model.trials.filter(t => t.included);
    const weightSum = trials.reduce((s,t) => s + 1/(t.variance + model.tau2), 0);
    let sw=0, sx=0, sy=0, sxx=0, sxy=0;
    for (const t of trials) {
      const w = 1/(t.variance + model.tau2), x = t.reduction_cl/10;
      close(t.weight_percent, 100*w/weightSum);
      sw+=w; sx+=w*x; sy+=w*t.effect; sxx+=w*x*x; sxy+=w*x*t.effect;
    }
    // Independently reconstruct weighted least-squares coefficients at the fitted tau².
    const slope = (sw*sxy-sx*sy)/(sw*sxx-sx*sx);
    close(slope, model.slope_per_10cl);
    close((sy-slope*sx)/sw, model.intercept);
    assert.equal(model.df, model.k - 2);
    assert.equal(model.curve.length, 81);
    close(model.curve[0].reduction_cl, Math.min(...trials.map(t=>t.reduction_cl)));
    close(model.curve.at(-1).reduction_cl, Math.max(...trials.map(t=>t.reduction_cl)));
    for (const p of model.curve) {
      close(p.estimate, model.intercept + model.slope_per_10cl*p.reduction_cl/10);
      assert.ok(p.ci_low <= p.estimate && p.estimate <= p.ci_high);
      close(p.estimate - p.ci_low, p.ci_high - p.estimate);
    }
  }
});

test('every trial and drug omission is reported, including insufficient data', () => {
  for (const model of models) {
    const included = model.trials.filter(t => t.included);
    assert.equal(model.k, included.length);
    assert.equal(model.sensitivity.length, included.length + new Set(included.map(t => t.agent)).size);
    for (const row of model.sensitivity) {
      const kept = included.filter(t => (row.unit === 'trial' ? t.study : t.agent) !== row.omitted);
      assert.equal(row.k, kept.length);
      if (kept.length < 4) { assert.equal(row.status, 'not_estimable'); assert.equal(row.slope_per_10cl, null); }
      else {
        assert.equal(row.status, 'estimated');
        assert.ok(row.ci_low <= row.slope_per_10cl && row.ci_high >= row.slope_per_10cl);
      }
    }
  }
  const adas = models.find(m=>m.analysis_id==='1.1' && m.scope==='all_pet');
  assert.equal(adas.sensitivity.find(r=>r.unit==='drug' && r.omitted==='Aducanumab').k, 6);
});
