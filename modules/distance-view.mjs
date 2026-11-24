import { DISTANCE_PARAMETERS, EQUATIONS } from '../data/science.mjs';
import { calculateDistances } from './distance-model.mjs';
import { localized as l, citation as cite, tr, number, renderMath } from './ui.mjs';

const labels = {
  speed:['Approach speed · v','Nærmehastighed · v'], reaction:['Reaction time · tᵣ','Reaktionstid · tᵣ'],
  deceleration:['Maximum deceleration · a','Maksimal deceleration · a'], minimum:['Hard limit · d_min','Fast grænse · d_min'],
  clearance:['Target clearance · c*','Målafstand · c*'],
};

export function distanceMarkup() {
  return `<section class="section-space page-width distance-section" id="distance" aria-labelledby="distance-title">
    <div class="section-heading"><div><p class="eyebrow">${l('POSTER EQUATION & ASSUMPTIONS','POSTERENS LIGNING OG ANTAGELSER')}</p><h2 id="distance-title">${l('Distance model','Afstandsmodel')}</h2></div><p>${l('Explore the exact switching equation from the poster. Every example input below is an engineering assumption, not a measured flight parameter.','Udforsk den præcise overtagelsesligning fra posteren. Alle eksempelinput nedenfor er tekniske antagelser, ikke målte flyveparametre.')} ${cite('poster','9')}</p></div>
    <div class="equation-banner"><span class="evidence-tag theory">${l('POSTER EQUATION','POSTERENS LIGNING')}</span><div data-equation="${EQUATIONS.switch}"></div><p>${l('Reaction distance + braking distance + fixed hard limit. This idealized one-dimensional calculation is not a guaranteed safe operating distance.','Reaktionsafstand + bremselængde + fast grænse. Denne idealiserede endimensionale beregning garanterer ikke en sikker driftsafstand.')}</p></div>
    <div class="distance-layout">
      <form id="distance-form" class="science-panel" novalidate><div class="panel-heading"><h3>${l('Set the assumptions','Vælg antagelser')}</h3><button class="reset-button" type="reset">${l('Reset','Nulstil')}</button></div>
        ${Object.entries(DISTANCE_PARAMETERS).map(([key,p]) => `<div class="parameter-field"><div class="parameter-heading"><label id="distance-${key}-label" for="distance-${key}">${l(...labels[key])}</label><div class="number-unit"><input id="distance-${key}" name="${key}" type="number" min="${p.min}" max="${p.max}" step="any" value="${p.value}" required aria-describedby="parameter-origin"><span>${p.unit}</span></div></div><input class="parameter-range" type="range" data-pair="${key}" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}" aria-labelledby="distance-${key}-label"><div class="range-labels"><span>${p.min} ${p.unit}</span><span>${p.max} ${p.unit}</span></div></div>`).join('')}
        <p class="field-hint" id="parameter-origin">${l('Defaults: v = 4 m/s; tᵣ = 0.2 s; a = 2 m/s²; d_min = 1 m; c* = 2 m. Chosen only to make the example explorable; none is specified numerically in the poster. a is the assumed positive magnitude of maximum constant deceleration.','Standard: v = 4 m/s; tᵣ = 0,2 s; a = 2 m/s²; d_min = 1 m; c* = 2 m. Valgt for at gøre eksemplet udforskeligt; ingen talværdi er angivet i posteren. a er den antagne positive størrelse af maksimal konstant deceleration.')}</p><p id="distance-error" class="error-message" role="alert" hidden></p>
      </form>
      <div class="distance-results science-panel"><div class="result-topline"><span>${l('THEORETICAL SWITCHING DISTANCE','TEORETISK OVERTAGELSESAFSTAND')}</span><span class="evidence-tag theory">${l('CALCULATED','BEREGNET')}</span></div><div class="distance-large"><output id="switch-result">5.80</output><span>m</span></div>
        <div class="distance-breakdown"><div><span>${l('Reaction','Reaktion')}</span><strong id="step-reaction">0.80 m</strong><small>v × tᵣ</small></div><b>+</b><div><span>${l('Braking','Bremsning')}</span><strong id="step-braking">4.00 m</strong><small>v² / (2a)</small></div><b>+</b><div><span>${l('Hard limit','Fast grænse')}</span><strong id="step-minimum">1.00 m</strong><small>d_min</small></div></div>
        <p id="distance-substitution" class="mono calculation-step"></p>
        <div class="distance-unresolved"><div><span class="mono">d_min</span><strong id="minimum-result">1.00 m</strong><p>${l('Designer-supplied hard limit. The poster gives no formula to calculate it.','Fast grænse valgt af konstruktøren. Posteren angiver ingen ligning til beregning.')}</p></div><div><span class="mono">d_max</span><strong>${l('Not defined','Ikke defineret')}</strong><p>${l('Could not be verified. No calculation is possible from the supplied sources. d_switch is a different quantity.','Kunne ikke verificeres. Kan ikke beregnes fra de angivne kilder. d_switch er en anden størrelse.')}</p></div></div>
        <div class="plot-heading"><h3>${l('Speed changes the threshold','Hastigheden ændrer grænsen')}</h3><span class="mono">a, tᵣ, d_min ${l('held fixed','holdes faste')}</span></div>
        <svg id="distance-plot" viewBox="0 0 560 240" role="img" aria-labelledby="plot-title"><title id="plot-title">Switching distance versus speed, with a fixed hard limit</title><path class="plot-grid" d="M52 18H538M52 68H538M52 118H538M52 168H538M52 218H538M173 18V218M295 18V218M417 18V218"/><path class="plot-axis" d="M52 18V218H538"/><path id="minimum-curve"/><polyline id="switch-curve"/><circle id="current-point" r="5"/><g class="plot-labels"><text x="52" y="237">0</text><text x="292" y="237">10</text><text x="507" y="237">20 m/s</text><text id="plot-max" x="7" y="25"></text><text x="18" y="218">0</text><text x="10" y="9">m</text></g></svg><div class="plot-legend"><span><i></i>d_switch</span><span><i></i>d_min (${l('input','input')})</span><span>d_max: ${l('unavailable','ikke tilgængelig')}</span></div>
        <p id="sensor-range-note" class="field-hint"></p><p id="clearance-note" class="validation-note" role="status"></p>
      </div>
    </div>
  </section>`;
}

export function setupDistance() {
  const form = document.querySelector('#distance-form');
  const element = id => document.getElementById(id);
  const put = (id, value) => { element(id).textContent = value; };

  function render() {
    const values = Object.fromEntries(Object.keys(DISTANCE_PARAMETERS).map(key => [key,form.elements[key].valueAsNumber]));
    const invalid = [...form.querySelectorAll('input[type=number]')].filter(input => !input.validity.valid || !Number.isFinite(input.valueAsNumber));
    [...form.querySelectorAll('input[type=number]')].forEach(input=>input.setAttribute('aria-invalid',String(invalid.includes(input))));
    if (invalid.length) {
      element('distance-error').hidden = false;
      put('distance-error',tr('Enter finite numbers within the displayed ranges. Deceleration and distances must be positive.','Indtast endelige tal inden for de viste intervaller. Deceleration og afstande skal være positive.'));
      for (const id of ['switch-result','minimum-result','step-reaction','step-braking','step-minimum','distance-substitution']) put(id,'—');
      element('switch-curve').setAttribute('points',''); element('current-point').setAttribute('visibility','hidden');
      element('minimum-curve').setAttribute('d','');
      put('clearance-note',''); put('sensor-range-note','');
      return;
    }
    const calculation = calculateDistances(values);
    element('distance-error').hidden = true;
    put('switch-result',number(calculation.switchDistance)); put('minimum-result',number(values.minimum)+' m');
    put('step-reaction',number(calculation.reactionDistance)+' m');
    put('step-braking',number(calculation.brakingDistance)+' m'); put('step-minimum',number(values.minimum)+' m');
    put('distance-substitution',`${number(values.speed)} × ${number(values.reaction)} + ${number(values.speed)}² / (2 × ${number(values.deceleration)}) + ${number(values.minimum)} = ${number(calculation.switchDistance)} m`);
    const maxY = Math.ceil((20*values.reaction+400/(2*values.deceleration)+values.minimum)/10)*10;
    const x = v => 52+v/20*486, y = d => 218-d/maxY*200;
    element('switch-curve').setAttribute('points',Array.from({length:81},(_,i)=>`${x(i/4)},${y((i/4)*values.reaction+(i/4)**2/(2*values.deceleration)+values.minimum)}`).join(' '));
    element('minimum-curve').setAttribute('d',`M52 ${y(values.minimum)}H538`);
    element('current-point').setAttribute('cx',String(x(values.speed))); element('current-point').setAttribute('cy',String(y(calculation.switchDistance)));
    element('current-point').removeAttribute('visibility'); put('plot-max',String(maxY));
    put('plot-title',tr('Switching distance versus speed; current example ','Overtagelsesafstand som funktion af hastighed; aktuelt eksempel ')+number(values.speed)+' m/s, '+number(calculation.switchDistance)+' m.');
    element('clearance-note').dataset.valid = String(calculation.clearanceValid);
    form.elements.clearance.setAttribute('aria-invalid',String(!calculation.clearanceValid));
    put('clearance-note',calculation.clearanceValid
      ? tr('Ordering holds: d_min < c* < d_switch. This checks only the proposed threshold ordering.','Rækkefølgen gælder: d_min < c* < d_switch. Dette kontrollerer kun den foreslåede rækkefølge.')
      : tr('Invalid target clearance: the poster requires d_min < c* < d_switch. Adjust c*, speed or the other assumptions to satisfy this ordering.','Ugyldig målafstand: posteren kræver d_min < c* < d_switch. Justér c*, hastighed eller øvrige antagelser for at opfylde rækkefølgen.'));
    put('sensor-range-note',calculation.exceedsBrightRange
      ? tr('Threshold exceeds 12 m, the TFmini-S datasheet range at 90% reflectivity. Detection at this threshold is not supported by that sensor specification.','Grænsen overstiger 12 m, TFmini-S-databladets rækkevidde ved 90 % reflektivitet. Detektion ved denne grænse understøttes ikke af specifikationen.')
      : calculation.exceedsDarkRange
        ? tr('Threshold exceeds the specified 7 m range for a 10%-reflective target. The 12 m figure applies to 90% reflectivity. Neither is d_max.','Grænsen overstiger 7 m for et mål med 10 % reflektivitet. 12 m gælder ved 90 % reflektivitet. Ingen af værdierne er d_max.')
        : tr('TFmini-S reference ranges: 7 m at 10% reflectivity; 12 m at 90%, under datasheet conditions. Narrow 2° coverage and real detection uncertainty are not modelled. Neither range defines d_max.','TFmini-S-reference: 7 m ved 10 % og 12 m ved 90 % reflektivitet under databladets betingelser. Det smalle synsfelt på 2° og detektionsusikkerhed modelleres ikke. Ingen af rækkevidderne definerer d_max.'));
  }
  form.querySelectorAll('[data-pair]').forEach(slider=>slider.addEventListener('input',()=>{
    form.elements[slider.dataset.pair].value=slider.value; render();
  }));
  form.querySelectorAll('input[type=number]').forEach(input=>input.addEventListener('input',()=>{
    if (input.validity.valid && Number.isFinite(input.valueAsNumber)) form.querySelector(`[data-pair="${input.name}"]`).value=input.value;
    render();
  }));
  form.addEventListener('reset',()=>requestAnimationFrame(render));
  form.addEventListener('submit',event=>{event.preventDefault();render();});
  renderMath(element('distance')); render();
  return { render };
}
