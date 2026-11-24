import { localized as l, citation as cite, tr, number } from './ui.mjs';

export function setupClearanceLearning(){
  const root=document.querySelector('.synapse-demo');
  root.insertAdjacentHTML('beforeend',`<div class="gain-feedback"><h3>${l('Correction gain also has feedback','Korrektionsstyrken får også feedback')}</h3><p>${l('The poster proposes a separate gain-synapse population: compare closest approach c_min with the target c*. This is distinct from rewarding a take-over decision.','Posteren foreslår en separat population af synapser for korrektionsstyrke: sammenlign mindste opnåede afstand c_min med målet c*. Dette adskiller sig fra belønning af en overtagelsesbeslutning.')} ${cite('poster')}</p><label for="closest-approach">${l('Illustrative closest approach · c_min','Illustrativ mindste opnåede afstand · c_min')}<span><input type="number" id="closest-approach" min="0" max="100" step="any" value="1.5"> m</span></label><div class="gain-learning-result" id="gain-learning-result" role="status" aria-live="polite"></div><p class="field-hint">${l('c* is shared with the threshold laboratory. Only the qualitative direction is specified. Numeric gain rewards, eligibility dynamics and clipping bounds are not supplied, so no quantitative gain update is calculated.','c* følger afstandslaboratoriet. Kun den kvalitative retning er angivet. Numeriske belønninger for styrke, sporets dynamik og vægtgrænser er ikke angivet, så der beregnes ingen kvantitativ opdatering af korrektionsstyrken.')}</p></div>`);
  const input=document.querySelector('#closest-approach');
  function render(){
    const target=document.querySelector('#distance-clearance').valueAsNumber;
    const value=input.valueAsNumber;
    const valid=input.validity.valid && Number.isFinite(value) && Number.isFinite(target);
    input.setAttribute('aria-invalid',String(!valid));
    const text=!valid?tr('Enter a valid closest approach and target clearance.','Indtast en gyldig mindste afstand og målafstand.')
      : value<target?tr('Closer than target: propose stronger corrective behaviour.','Tættere på end målet: foreslå stærkere korrektion.')
        : value>target?tr('Beyond target: propose weaker correction to reduce needless detours.','Længere fra end målet: foreslå svagere korrektion for at reducere unødige omveje.')
          : tr('At the target: the poster specifies no equality-case update.','Ved målafstanden: posteren angiver ingen opdateringsregel for lighed.');
    document.querySelector('#gain-learning-result').textContent=(valid?`c_min = ${number(value)} m · c* = ${number(target)} m. `:'')+text;
  }
  input.addEventListener('input',render);
  document.querySelector('#distance-form').addEventListener('input',render);
  document.querySelector('#distance-form').addEventListener('reset',()=>requestAnimationFrame(render));
  render();return {render};
}
