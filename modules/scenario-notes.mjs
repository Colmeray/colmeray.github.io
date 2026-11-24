import { tr, number } from './ui.mjs';

export function setupScenarioNotes() {
  const distance=document.querySelector('#distance-form');
  const energy=document.querySelector('#energy-form');
  distance.querySelector('.panel-heading').insertAdjacentHTML('afterend','<p class="scenario-note" id="distance-scenario"></p>');
  energy.querySelector('.panel-heading').insertAdjacentHTML('afterend','<p class="scenario-note" id="energy-scenario"></p>');
  distance.elements.speed.setAttribute('aria-describedby','parameter-origin distance-scenario');
  energy.elements.speed.setAttribute('aria-describedby','energy-scenario');
  const speedText=(input,factor,unit,otherUnit)=>input.validity.valid && Number.isFinite(input.valueAsNumber)
    ? `${number(input.valueAsNumber,1)} ${unit} (${number(input.valueAsNumber*factor,1)} ${otherUnit})`
    : tr('invalid speed','ugyldig hastighed');
  function render() {
    const approach=speedText(distance.elements.speed,3.6,'m/s','km/h');
    const ground=speedText(energy.elements.speed,1/3.6,'km/h','m/s');
    document.querySelector('#distance-scenario').textContent=tr(
      `Independent example · approach speed ${approach}. This is motion toward an obstacle, not necessarily ground speed. The energy model has its own speed setting.`,
      `Uafhængigt eksempel · nærmehastighed ${approach}. Dette er bevægelse mod en forhindring, ikke nødvendigvis hastighed over jorden. Energimodellen har sin egen hastighed.`);
    document.querySelector('#energy-scenario').textContent=tr(
      `Independent example · ground speed ${ground}. Used for the range estimate. Changing it does not change the distance model’s approach speed.`,
      `Uafhængigt eksempel · hastighed over jorden ${ground}. Bruges til rækkeviddeestimatet. Ændringer påvirker ikke afstandsmodellens nærmehastighed.`);
  }
  for(const form of [distance,energy]) {
    form.addEventListener('input',render);
    form.addEventListener('reset',()=>requestAnimationFrame(render));
  }
  render();return {render};
}
