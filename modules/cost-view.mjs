import { COST_ITEMS, EXCHANGE } from '../data/pricing.mjs';
import { calculateCost } from './cost-model.mjs';
import { localized as l, tr, number, money, citation as cite, escapeHtml } from './ui.mjs';

export function costMarkup() {
  return `<section class="cost-band section-space" id="cost" aria-labelledby="cost-title"><div class="page-width">
    <div class="section-heading"><div><p class="eyebrow">${l('MAKE THE ASSUMPTIONS VISIBLE','GØR ANTAGELSERNE SYNLIGE')}</p><h2 id="cost-title">${l('What would\nit take to build?','Hvad kræver det\nat bygge systemet?')}</h2></div><p>${l('A reviewable bill of materials for a hypothetical prototype. Known listings start the worksheet; unknown prices stay blank until you supply an assumption.','En gennemskuelig stykliste til en hypotetisk prototype. Kendte prisangivelser indleder beregningen; ukendte priser er tomme, indtil du indtaster en antagelse.')}</p></div>
    <div class="cost-disclaimer"><strong>Estimated hardware cost — not an official quotation</strong><p>These figures are illustrative engineering estimates. They do not represent confirmed manufacturer pricing, production costs, or the actual cost of a completed SpikeNav prototype.</p></div>
    <div class="cost-layout"><div class="cost-worksheet"><div class="panel-heading"><h3>${l('Editable hardware worksheet','Redigerbar hardwareberegning')}</h3><button type="button" class="reset-button" id="cost-reset">${l('Reset prices','Nulstil priser')}</button></div>
      <form id="cost-form" novalidate><div class="cost-table-wrap"><table class="cost-table"><caption class="sr-only">${l('Unit prices in USD; blank prices remain unknown','Enhedspriser i USD; tomme priser forbliver ukendte')}</caption><thead><tr><th scope="col">${l('Component / price evidence','Komponent / prisgrundlag')}</th><th scope="col">${l('Qty','Antal')}</th><th scope="col">${l('Unit · USD','Enhed · USD')}</th><th scope="col">${l('Line total','Linjetotal')}</th></tr></thead><tbody>
        ${COST_ITEMS.map(item=>`<tr data-cost-row="${item.id}"><td><small>${l(item.category,item.daCategory)}</small><strong>${l(item.name,item.daName)}</strong><details><summary>${l('Source & uncertainty','Kilde og usikkerhed')} <span class="mono">[${item.source==='poster'?'Poster':item.source}]</span></summary><p>${l(item.note,item.daNote)} ${cite(item.source)}</p><p class="price-date">${l('Reviewed 24 Nov 2026. Tax, delivery and import duties excluded. Listings may change; recheck with the seller.','Kontrolleret 24. nov. 2026. Moms, fragt og importafgifter er udeladt. Priser kan ændre sig; kontrollér hos sælgeren.')}</p></details><span class="price-basis" data-price-basis="${item.id}"></span></td><td><label class="sr-only" for="quantity-${item.id}">${l('Quantity — '+item.name,'Antal — '+(item.daName??item.name))}</label><input type="number" id="quantity-${item.id}" name="quantity-${item.id}" value="${item.quantity}" min="1" max="100" step="1" required></td><td><label class="sr-only" for="price-${item.id}">${l('Unit price in USD — '+item.name,'Enhedspris i USD — '+(item.daName??item.name))}</label><input type="number" id="price-${item.id}" name="price-${item.id}" min="0" max="100000000" step="any" inputmode="decimal" placeholder="Unknown" ${item.usd===null?'':`value="${item.usd}"`}></td><td><output data-line-total="${item.id}">—</output></td></tr>`).join('')}
      </tbody></table></div><p id="cost-error" class="error-message" role="alert" hidden></p></form>
    </div><aside class="cost-summary science-panel"><span class="evidence-tag assumption">${l('ILLUSTRATIVE BUDGET','ILLUSTRATIVT BUDGET')}</span><h3 id="cost-total-label">${l('Known-price subtotal','Subtotal med kendte priser')}</h3><output id="cost-usd" class="cost-total">$963</output><output id="cost-dkk" class="cost-dkk"></output><p id="cost-completeness" role="status" aria-live="polite"></p><div class="cost-composition" id="cost-composition"></div>
      <div class="exchange-control"><label for="exchange-rate">${l('DKK per 1 USD','DKK pr. 1 USD')}</label><input type="number" id="exchange-rate" min="0.0001" max="1000" step="any" value="${EXCHANGE.dkkPerUsd.toFixed(6)}" required><p id="exchange-basis"></p>${cite('20')}</div><button type="button" id="cost-export" class="small-button">${l('Download this scenario · JSON','Download dette scenarie · JSON')}</button><p class="field-hint">${l('No labour, software development, test flights, certification, spares or clinical logistics are included. Avoid counting the same controller or carrier twice.','Arbejde, softwareudvikling, testflyvninger, certificering, reservedele og klinisk logistik indgår ikke. Tæl ikke samme controller eller bærekort to gange.')}</p>
    </aside></div>
    <div class="chip-cost-note"><div><span class="mono">LOIHI 2 / COST EVIDENCE</span><h3>${l('An unknown is a result.','En ukendt pris er et resultat.')}</h3></div><div><p>${l('Not publicly available. Intel’s brief describes a research-access ecosystem, not commercial per-chip pricing. Oheo Gulch (one chip plus FPGA) and Kapoho Point (eight chips) are research platforms, not price-equivalent single chips.','Ikke offentligt tilgængelig. Intel beskriver adgang gennem forskning, ikke kommerciel pris pr. chip. Oheo Gulch (én chip plus FPGA) og Kapoho Point (otte chips) er forskningsplatforme og kan ikke sidestilles med én chip i pris.')} ${cite('7')}</p><p>${l('There is insufficient evidence for credible low, central and high Loihi 2 estimates. OpenMV and Jetson listings establish costs for different products; they cannot justify a Loihi price. Any number you enter is explicitly a user-supplied engineering assumption, with no implied manufacturer endorsement.','Der er utilstrækkeligt grundlag for troværdige lave, centrale og høje Loihi 2-estimater. OpenMV- og Jetson-priser gælder andre produkter og begrunder ikke en Loihi-pris. Alle tal, du indtaster, er dine egne tekniske antagelser uden producentbekræftelse.')}</p></div></div>
  </div></section>`;
}

export function setupCost() {
  const form=document.querySelector('#cost-form');
  const rate=document.querySelector('#exchange-rate');
  let current;
  let customRate=false;
  const getItems=()=>COST_ITEMS.map(item=>({ ...item, quantity:form.elements[`quantity-${item.id}`].valueAsNumber, usd:form.elements[`price-${item.id}`].value.trim()==='' ? null : form.elements[`price-${item.id}`].valueAsNumber }));
  function render() {
    const items=getItems();
    const invalid=[...form.querySelectorAll('input')].filter(input=>!input.validity.valid || (input.value!=='' && !Number.isFinite(input.valueAsNumber)));
    [...form.querySelectorAll('input')].forEach(input=>input.setAttribute('aria-invalid',String(invalid.includes(input))));
    const rateValid=rate.validity.valid && Number.isFinite(rate.valueAsNumber);
    rate.setAttribute('aria-invalid',String(!rateValid));
    const error=document.querySelector('#cost-error');
    error.hidden=invalid.length===0 && rateValid;
    const exportButton=document.querySelector('#cost-export');
    items.forEach((item,i)=>{
      const original=COST_ITEMS[i];
      const input=form.elements[`price-${item.id}`];
      const isUser=item.usd!==original.usd || item.quantity!==original.quantity;
      const basis=document.querySelector(`[data-price-basis="${item.id}"]`);
      basis.dataset.basis=item.usd===null?'unknown':isUser?'user':'listed';
      basis.textContent=item.usd===null?tr('Price unknown · not counted','Pris ukendt · ikke medregnet'):isUser?tr('User engineering assumption','Brugerens tekniske antagelse'):tr('Observed listing · 24 Nov 2026','Observeret pris · 24. nov. 2026');
      input.placeholder=tr('Unknown','Ukendt');
      document.querySelector(`[data-line-total="${item.id}"]`).textContent=item.usd===null || !Number.isFinite(item.usd) || !Number.isInteger(item.quantity) || !input.validity.valid ? '—' : money(item.usd*item.quantity);
    });
    if (!error.hidden) {
      current=null;
      error.textContent=tr('Use non-negative finite unit prices, whole quantities from 1 to 100, and a positive exchange rate. Empty prices mean unknown, not zero.','Brug ikke-negative endelige enhedspriser, hele antal fra 1 til 100 og en positiv valutakurs. Tomme priser betyder ukendt, ikke nul.');
      document.querySelector('#cost-usd').textContent='—'; document.querySelector('#cost-dkk').textContent='—';
      document.querySelector('#cost-completeness').textContent=tr('Correct the marked inputs to calculate.','Ret de markerede input for at beregne.');
      document.querySelector('#cost-composition').replaceChildren();
      exportButton.disabled=true; return;
    }
    current=calculateCost(items,rate.valueAsNumber);
    exportButton.disabled=false;
    document.querySelector('#cost-total-label').textContent=current.complete?tr('User scenario total','Total for brugerscenarie'):tr('Known-price subtotal','Subtotal med kendte priser');
    document.querySelector('#cost-usd').textContent=money(current.subtotal);
    document.querySelector('#cost-dkk').textContent=money(current.dkk,'DKK');
    document.querySelector('#cost-completeness').textContent=current.complete
      ? tr('All lines filled. This is your hypothetical hardware scenario, not a quotation.','Alle poster udfyldt. Dette er dit hypotetiske hardwarescenarie, ikke et tilbud.')
      : tr(`${current.missing.length} unpriced lines excluded. Total system cost remains unknown.`,`${current.missing.length} uprissatte poster er udeladt. Den samlede systempris er stadig ukendt.`);
    document.querySelector('#exchange-basis').textContent=customRate
      ? tr('User-supplied exchange assumption; source date no longer applies.','Brugerangivet valutaantagelse; kildens dato gælder ikke længere.')
      : tr('ECB · 24 Nov 2026. 7.4744 DKK/EUR ÷ 1.0963 USD/EUR. Rounded to 6 decimals for this editable field.','ECB · 24. nov. 2026. 7,4744 DKK/EUR ÷ 1,0963 USD/EUR. Afrundet til 6 decimaler i dette redigerbare felt.');
    document.querySelector('#cost-composition').innerHTML=Object.entries(current.groups).map(([category,value])=>{
      const item=COST_ITEMS.find(i=>i.category===category);
      return `<div><span>${escapeHtml(tr(category,item.daCategory))}</span><strong>${money(value)}</strong><i style="--share:${current.subtotal>0?value/current.subtotal*100:0}%"></i></div>`;
    }).join('');
  }
  form.addEventListener('input',render);
  form.addEventListener('submit',e=>{e.preventDefault();render();});
  rate.addEventListener('input',()=>{customRate=true;render();});
  document.querySelector('#cost-reset').addEventListener('click',()=>{form.reset();rate.value=EXCHANGE.dkkPerUsd.toFixed(6);customRate=false;render();});
  document.querySelector('#cost-export').addEventListener('click',()=>{
    if(!current)return;
    const blob=new Blob([JSON.stringify({ disclaimer:'Estimated hardware cost — not an official quotation. Incomplete lines are not zero.', sourceReviewDate:EXCHANGE.date, exchange:{dkkPerUsd:rate.valueAsNumber,basis:customRate?'user assumption':'ECB cross-rate rounded to 6 decimals',date:customRate?null:EXCHANGE.date}, items:getItems(), calculation:current },null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url;link.download='spikenav-cost-scenario.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  render();
  return {render};
}
