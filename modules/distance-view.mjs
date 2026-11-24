import { DISTANCE_PARAMETERS, EQUATIONS } from '../data/science.mjs';
import { calculateDistances, proposedState } from './distance-model.mjs';
import { localized as l, citation as cite, tr, number, renderMath } from './ui.mjs';

const labels = {
  speed:['Approach speed · v','Nærmehastighed · v'], reaction:['Reaction time · tᵣ','Reaktionstid · tᵣ'],
  deceleration:['Maximum deceleration · a','Maksimal deceleration · a'], minimum:['Hard limit · d_min','Fast grænse · d_min'],
  clearance:['Target clearance · c*','Målafstand · c*'],
};

export function distanceMarkup() {
  return `<section class="section-space page-width distance-section" id="distance" aria-labelledby="distance-title">
    <div class="section-heading"><div><p class="eyebrow">${l('THE THRESHOLD LABORATORY','LABORATORIUM FOR GRÆNSER')}</p><h2 id="distance-title">${l('When should\nthe network take over?','Hvornår skal\nnetværket overtage?')}</h2></div><p>${l('Explore the exact switching equation from the poster. Every example input below is an engineering assumption, not a measured flight parameter.','Udforsk den præcise overtagelsesligning fra posteren. Alle eksempelinput nedenfor er tekniske antagelser, ikke målte flyveparametre.')} ${cite('poster','9')}</p></div>
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
    <div class="live-lab science-panel" id="live-lab" data-state="cruise"><div class="panel-heading"><div><p class="eyebrow">${l('FOLLOW THE SIGNAL','FØLG SIGNALET')}</p><h3>${l('Bring an obstacle closer','Flyt en forhindring tættere på')}</h3></div><button id="signal-play" class="small-button" type="button" aria-pressed="false">${l('Play signal sequence','Afspil signalsekvens')}</button></div>
      <p class="simulation-notice">Illustrative simulation — not an experimentally validated flight model.</p>
      <div class="proximity-controls"><label for="obstacle-distance">${l('Synthetic obstacle distance','Syntetisk afstand til forhindring')} <output id="obstacle-value">14.00 m</output></label><input type="range" id="obstacle-distance" min="0" max="20" step="0.05" value="14"><label class="looming-toggle"><input type="checkbox" id="looming">${l('Illustrate SNN looming detection','Illustrér SNN-detektion af nærmende objekt')}</label></div>
      <svg class="proximity-scene" viewBox="0 0 900 200" role="img" aria-labelledby="proximity-title"><title id="proximity-title">Schematic relative obstacle position and switching thresholds; not a flight trajectory</title><defs><pattern id="proximity-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" stroke="#243544" stroke-width=".7"/></pattern></defs><rect width="900" height="200" fill="url(#proximity-grid)"/><rect id="hard-zone" x="100" y="20" height="145" fill="#f1787830"/><rect id="takeover-zone" y="20" height="145" fill="#69e3c118"/><path d="M100 165H870" stroke="#647887"/><path id="minimum-marker" stroke="#fa9393" stroke-dasharray="3 5"/><path id="switch-marker" stroke="#6be1c2" stroke-dasharray="3 5"/><g transform="translate(100 93)" stroke="#dae7ed" stroke-width="3"><path d="m-20-8 40 16m-40 0 40-16"/><ellipse cx="-26" cy="-12" rx="19" ry="5"/><ellipse cx="26" cy="-12" rx="19" ry="5"/><ellipse cx="-26" cy="12" rx="19" ry="5"/><ellipse cx="26" cy="12" rx="19" ry="5"/><rect x="-10" y="-8" width="20" height="17" fill="#6ae2c0" stroke="#6ae2c0" rx="3"/></g><g id="obstacle-marker"><rect x="-7" y="49" width="14" height="95" rx="4" fill="#b4c2cd"/><path d="m-25 65 18 10m32-10-18 10" stroke="#92a3b3" stroke-width="3"/></g><g class="plot-labels"><text x="52" y="190">0 m</text><text x="750" y="190" id="scene-scale"></text></g></svg>
      <div class="threshold-labels"><span class="mono">d_min <b id="scene-min"></b></span><span class="mono">c* <b id="scene-clearance"></b></span><span class="mono">d_switch <b id="scene-switch"></b></span></div>
      <div class="signal-chain"><div class="signal-node sensor"><span>${l('SENSOR INPUT','SENSORINPUT')}</span><strong id="signal-sensor"></strong></div><span class="flow-connector" aria-hidden="true"></span><div class="signal-node snn"><span>${l('SPIKING NETWORK','SPIKENDE NETVÆRK')}</span><strong id="signal-snn"></strong><svg id="spike-raster" viewBox="0 0 180 36" aria-hidden="true"></svg></div><span class="flow-connector" aria-hidden="true"></span><div class="signal-node command"><span>${l('COMMAND SOURCE','KOMMANDOKILDE')}</span><strong id="signal-command"></strong></div><span class="flow-connector" aria-hidden="true"></span><div class="signal-node controller"><span>${l('FLIGHT CONTROLLER','FLYVECONTROLLER')}</span><strong>${l('Stabilization active','Stabilisering aktiv')}</strong></div></div>
      <div class="simulation-explanation"><div><span id="sim-state" class="evidence-tag proposed"></span><p id="sim-explanation"></p></div><div class="gpu-indicator"><span>GPU + VLM</span><strong id="sim-gpu"></strong></div></div><p id="sim-status" class="sr-only" role="status" aria-live="polite"></p><p class="field-hint">${l('Distances share the calculator above. The spike raster and corrective commands are scripted illustrations. Out-of-range distances are synthetic scenario values, not LiDAR returns. N = 2 s of clearance is an editable demonstration assumption, not a poster value. A looming signal can request take-over outside d_switch. Planned descent is a separate proposed trigger.','Afstandene følger beregneren ovenfor. Spikegrafen og korrektive kommandoer er illustrationer. Afstande uden for sensorens specifikationer er syntetiske scenarieværdier, ikke LiDAR-målinger. N = 2 s med fri bane er en redigerbar demoantagelse, ikke en posterværdi. Looming kan anmode om overtagelse uden for d_switch. Planlagt nedstigning er en separat foreslået udløser.')} ${cite('poster')}</p><label class="dwell-field" for="clear-dwell">${l('Clearance dwell · N','Ventetid med fri bane · N')}<input id="clear-dwell" type="number" min="0.1" max="10" step="any" value="2">s</label>
    </div>
  </section>`;
}

export function setupDistance() {
  const form = document.querySelector('#distance-form');
  const root = document.querySelector('#live-lab');
  const obstacle = document.querySelector('#obstacle-distance');
  const looming = document.querySelector('#looming');
  const dwell = document.querySelector('#clear-dwell');
  const play = document.querySelector('#signal-play');
  let calculation;
  let values;
  let valid = true;
  let previous = 'cruise';
  let clearSince = null;
  let animation = null;
  let playing = false;
  let started = 0;
  let lastState = '';
  const element = id => document.getElementById(id);
  const put = (id, value) => { element(id).textContent = value; };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function stop() {
    playing = false;
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
    play.setAttribute('aria-pressed','false');
    play.textContent = tr('Play signal sequence','Afspil signalsekvens');
  }

  function renderSimulation(announce=false) {
    if (!valid || !calculation?.clearanceValid || !dwell.validity.valid || !Number.isFinite(dwell.valueAsNumber)) {
      stop();
      root.dataset.state = 'invalid';
      put('sim-state',tr('Configuration needs attention','Konfigurationen skal justeres'));
      put('sim-explanation',tr('Correct the marked inputs before exploring the proposed response.','Ret de markerede input for at udforske den foreslåede reaktion.'));
      for (const id of ['signal-sensor','signal-snn','signal-command','sim-gpu']) put(id,'—');
      element('spike-raster').replaceChildren();
      play.disabled = true;
      return;
    }
    play.disabled = false;
    const distance = obstacle.valueAsNumber;
    let state = proposedState(distance, calculation.switchDistance, values.minimum, looming.checked);
    if (state === 'cruise' && previous !== 'cruise') {
      if (clearSince === null) clearSince = performance.now();
      if (performance.now() - clearSince < dwell.valueAsNumber * 1000) state = 'clearing';
    } else if (state !== 'cruise') clearSince = null;
    if (state !== 'clearing') previous = state;
    root.dataset.state = state;
    const title = {
      cruise:tr('Sparse mode','Sparsom tilstand'), avoidance:tr('SNN take-over','SNN overtager'),
      override:tr('Safety override','Sikkerhedsfallback'), clearing:tr('Waiting for a clear route','Venter på fri bane'),
    }[state];
    const description = {
      cruise:tr('Autopilot follows waypoints. The SNN watches; the GPU and frame cameras are inactive in the poster’s power assumption.','Autopiloten følger waypoints. SNN’et overvåger; GPU og billedkameraer er inaktive i posterens effektantagelse.'),
      avoidance:tr('The SNN would supply corrective velocity commands to the flight controller. This schematic shows command ownership; it does not calculate a collision-free trajectory.','SNN’et skal levere korrigerende hastighedskommandoer til flyvecontrolleren. Skitsen viser kommandokilden; den beregner ikke en kollisionsfri bane.'),
      override:tr('The fixed hard limit has been reached. The poster proposes stop/hover and GPU activation so the VLM can plan a route out. Successful braking or hovering is not demonstrated here.','Den faste grænse er nået. Posteren foreslår stop/hover og GPU-aktivering, så VLM kan planlægge en vej ud. Vellykket bremsning eller hover demonstreres ikke her.'),
      clearing:tr('Hold the avoidance/fallback command source until the route has been clear for N seconds. This example then hands control back to the waypoint autopilot.','Behold undvigelses-/fallbackkommandoerne, indtil ruten har været fri i N sekunder. Derefter leverer autopiloten igen waypointkommandoer.'),
    }[state];
    put('obstacle-value',number(distance)+' m');
    const sensorLabel=distance<0.1
      ? tr('Below 0.1 m specification','Under specifikationen på 0,1 m')
      : distance>12
        ? tr('Beyond 12 m specification','Uden for specifikationen på 12 m')
        : number(distance)+' m'+(distance>7 ? tr(' · reflectivity-dependent',' · afhænger af reflektivitet') : '');
    put('signal-sensor',sensorLabel+(looming.checked ? ' · looming' : ''));
    put('signal-snn',state === 'cruise' ? tr('Watching','Overvåger') : state === 'override' ? tr('Override event','Fallbackhændelse') : tr('Avoidance activity','Undvigelsesaktivitet'));
    put('signal-command',state === 'cruise' ? tr('Waypoint autopilot','Waypoint-autopilot') : state === 'override' || (state === 'clearing' && previous === 'override') ? tr('Stop / hover request','Stop-/hoveranmodning') : tr('SNN velocity request','SNN-hastighedsanmodning'));
    put('sim-state',title); put('sim-explanation',description);
    put('sim-gpu',state === 'override' || (state === 'clearing' && previous === 'override') ? tr('Requested on','Anmodet aktiveret') : tr('Inactive','Inaktiv'));
    const scale = Math.max(20,calculation.switchDistance*1.15);
    obstacle.max = String(Math.ceil(scale));
    const position = d => 100+Math.min(d/scale,1)*750;
    element('hard-zone').setAttribute('width',String(position(values.minimum)-100));
    element('takeover-zone').setAttribute('x',String(position(values.minimum)));
    element('takeover-zone').setAttribute('width',String(position(calculation.switchDistance)-position(values.minimum)));
    element('minimum-marker').setAttribute('d',`M${position(values.minimum)} 20V165`);
    element('switch-marker').setAttribute('d',`M${position(calculation.switchDistance)} 20V165`);
    element('obstacle-marker').setAttribute('transform',`translate(${position(distance)} 0)`);
    put('scene-scale',number(scale,1)+' m'); put('scene-min',number(values.minimum)+' m');
    put('scene-clearance',number(values.clearance)+' m'); put('scene-switch',number(calculation.switchDistance)+' m');
    const dense = state !== 'cruise';
    element('spike-raster').innerHTML = Array.from({length:dense ? 26 : 7},(_,i) => {
      const x=5+(i*37)%170, y=4+(i*11)%27;
      return `<path d="M${x} ${y+5}v-5l2-3 2 8h5"/>`;
    }).join('');
    if ((announce || lastState !== state) && !playing) put('sim-status',title+'. '+description);
    lastState = state;
  }

  function render() {
    values = Object.fromEntries(Object.keys(DISTANCE_PARAMETERS).map(key => [key,form.elements[key].valueAsNumber]));
    const invalid = [...form.querySelectorAll('input[type=number]')].filter(input => !input.validity.valid || !Number.isFinite(input.valueAsNumber));
    [...form.querySelectorAll('input[type=number]')].forEach(input=>input.setAttribute('aria-invalid',String(invalid.includes(input))));
    valid = invalid.length === 0;
    if (!valid) {
      stop(); element('distance-error').hidden = false;
      put('distance-error',tr('Enter finite numbers within the displayed ranges. Deceleration and distances must be positive.','Indtast endelige tal inden for de viste intervaller. Deceleration og afstande skal være positive.'));
      for (const id of ['switch-result','minimum-result','step-reaction','step-braking','step-minimum','distance-substitution']) put(id,'—');
      element('switch-curve').setAttribute('points',''); element('current-point').setAttribute('visibility','hidden');
      element('minimum-curve').setAttribute('d','');
      put('clearance-note',''); put('sensor-range-note','');
      renderSimulation(); return;
    }
    calculation = calculateDistances(values);
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
      : tr('Invalid target clearance: the poster requires d_min < c* < d_switch. Adjust c*, speed or the other assumptions; the demonstration is disabled.','Ugyldig målafstand: posteren kræver d_min < c* < d_switch. Justér c*, hastighed eller øvrige antagelser; demonstrationen er deaktiveret.'));
    put('sensor-range-note',calculation.exceedsBrightRange
      ? tr('Threshold exceeds 12 m, the TFmini-S datasheet range at 90% reflectivity. Detection at this threshold is not supported by that sensor specification.','Grænsen overstiger 12 m, TFmini-S-databladets rækkevidde ved 90 % reflektivitet. Detektion ved denne grænse understøttes ikke af specifikationen.')
      : calculation.exceedsDarkRange
        ? tr('Threshold exceeds the specified 7 m range for a 10%-reflective target. The 12 m figure applies to 90% reflectivity. Neither is d_max.','Grænsen overstiger 7 m for et mål med 10 % reflektivitet. 12 m gælder ved 90 % reflektivitet. Ingen af værdierne er d_max.')
        : tr('TFmini-S reference ranges: 7 m at 10% reflectivity; 12 m at 90%, under datasheet conditions. Narrow 2° coverage and real detection uncertainty are not modelled. Neither range defines d_max.','TFmini-S-reference: 7 m ved 10 % og 12 m ved 90 % reflektivitet under databladets betingelser. Det smalle synsfelt på 2° og detektionsusikkerhed modelleres ikke. Ingen af rækkevidderne definerer d_max.'));
    renderSimulation();
  }
  form.querySelectorAll('[data-pair]').forEach(slider=>slider.addEventListener('input',()=>{
    stop(); form.elements[slider.dataset.pair].value=slider.value; render();
  }));
  form.querySelectorAll('input[type=number]').forEach(input=>input.addEventListener('input',()=>{
    stop();
    if (input.validity.valid && Number.isFinite(input.valueAsNumber)) form.querySelector(`[data-pair="${input.name}"]`).value=input.value;
    render();
  }));
  form.addEventListener('reset',()=>requestAnimationFrame(()=>{ stop(); render(); }));
  form.addEventListener('submit',event=>{event.preventDefault();render();});
  obstacle.addEventListener('input',()=>{stop(); renderSimulation(true);});
  looming.addEventListener('change',()=>{stop();renderSimulation(true);});
  dwell.addEventListener('input',()=>{dwell.setAttribute('aria-invalid',String(!dwell.validity.valid));clearSince=null;renderSimulation();});
  play.addEventListener('click',()=>{
    if (playing) {stop();return;}
    playing=true; started=performance.now(); clearSince=null; previous='cruise'; looming.checked=false;
    play.setAttribute('aria-pressed','true'); play.textContent=tr('Pause sequence','Sæt på pause');
    function tick(now) {
      const elapsed=(now-started)/1000;
      if (elapsed >= 18) {stop();return;}
      const phase=Math.floor(elapsed/4);
      // Explicitly scripted stages; these positions do not integrate speed or acceleration.
      obstacle.value=String(phase===0 || phase>=3 ? Math.min(Number(obstacle.max),calculation.switchDistance+5) : phase===1 ? (values.minimum+calculation.switchDistance)/2 : values.minimum*0.75);
      renderSimulation();
      animation=requestAnimationFrame(tick);
    }
    animation=requestAnimationFrame(tick);
  });
  const timer=setInterval(()=>{if(clearSince!==null && !playing && !document.hidden)renderSimulation();},200);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden){stop();clearSince=null;} });
  window.addEventListener('pagehide',()=>{stop();clearInterval(timer);});
  reducedMotion.addEventListener('change',stop);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(root);
  renderMath(element('distance')); render();
  return { render(){stop();render();} };
}
