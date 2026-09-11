// One-time mechanical migration of legacy labels and captions.
import {readFile,writeFile} from 'node:fs/promises';
for(const path of ['public/app.js','public/index.html','analysis/reproducibility/README.md']) {
 let s=await readFile(path,'utf8');
 s=s.replaceAll('Response criteria','Biomarker-confirmed, approved agents, ≥10 CL reduction')
 .replaceAll('Response-criteria','Selected-agent')
 .replaceAll('response-conforming primary analysis','investigator-defined sensitivity analysis')
 .replaceAll('The response-conforming primary analysis','An investigator-defined sensitivity analysis')
 .replaceAll('meeting the response criteria','meeting the investigator-defined inclusion rules')
 .replaceAll('Evidence v0.1.1','Evidence v0.2.0')
 .replaceAll('**0.1.1**','**0.2.0**')
 .replaceAll('**16 August 2026**','**11 September 2026**')
 .replaceAll('Current through the Cochrane evidence package · Corrected 16 August 2026','Literature search through 7 August 2025 · Analysis release 11 September 2026')
 .replaceAll('current through ${evidence.generated}','released ${evidence.generated}; literature search through ${evidence.searchThrough}')
 .replaceAll('SCarlet RoAD; Marguerite RoAD; CLARITY AD; GRADUATE','SCarlet RoAD; CLARITY AD; GRADUATE');
 if(path.endsWith('app.js')) {
  s=s.replaceAll('a 2-point treatment–placebo difference is','a 2-point individual-change benchmark is').replaceAll('a 3-point treatment–placebo difference is','a 3-point individual-change benchmark is').replaceAll('a 4-point treatment–placebo difference is','a 4-point individual-change benchmark is').replaceAll('a 1-point treatment–placebo difference is','a 1-point individual-change benchmark is');
  s=s.replaceAll('Negative values indicate less worsening with treatment.','This individual-change reference is not a validated minimum between-group benefit at 18 months. Negative values indicate less worsening with treatment.');
  s=s.replaceAll('Positive values indicate better performance with treatment.','This individual-change reference is not a validated minimum between-group benefit at 18 months. Positive values indicate better performance with treatment.');
  s=s.replace('ENVISION is not included because','The 10 CL cutoff was introduced by this reanalysis and was not specified by Snyder et al. ENVISION is not included because');
  s=s.replace('Trials without a matched CL estimate are excluded rather than assigned an assumed value.','Unknown or quarantined PET values are excluded from this condition; they do not establish absent target engagement. Matching dose, phase and population remains an explicit audit limitation.');
 }
 if(path.endsWith('index.html')) {
  s=s.replace('<script src="app.js" defer></script>','<script src="app.js" defer></script>\n<script src="traceability.js" defer></script>');
  s=s.replace('Primary report <span>PDF ↗</span>','Historical v0.1.1 primary report <span>PDF ↗</span>').replace('Extended report <span>PDF ↗</span>','Historical v0.1.1 extended report <span>PDF ↗</span>');
  s=s.replace('<div class="download-links">','<div class="download-links"><a href="downloads/methods-results.md">Current Methods and Results <span>Markdown ↓</span></a><a href="downloads/release-differences.csv">Changes from v0.1.1 <span>CSV ↓</span></a>');
 }
 await writeFile(path,s);
}
