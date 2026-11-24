import { COST_ITEMS, EXCHANGE } from '../data/pricing.mjs';
import { calculateCost } from './cost-model.mjs';
import { localized as l, tr, money, citation as cite, escapeHtml } from './ui.mjs';

function costTable(items, caption) {
  return `<div class="cost-table-wrap"><table class="cost-table"><caption class="sr-only">${caption}</caption><thead><tr><th scope="col">${l('Component / price evidence','Komponent / prisgrundlag')}</th><th scope="col">${l('Qty','Antal')}</th><th scope="col">${l('Unit · USD','Enhed · USD')}</th><th scope="col">${l('Line total','Linjetotal')}</th></tr></thead><tbody>${items.map(item=>`<tr data-cost-row="${item.id}"><td><small>${l(item.category,item.daCategory)}</small><strong>${l(item.name,item.daName)}</strong><details><summary>${l('Source & uncertainty','Kilde og usikkerhed')} <span class="mono">[${item.source==='poster'?'Poster':item.source}]</span></summary><p>${l(item.note,item.daNote)} ${cite(item.source)}</p><p class="price-date">${l('Reviewed 24 Nov 2026. Tax, delivery and import duties excluded. Listings may change; recheck with the seller.','Kontrolleret 24. nov. 2026. Moms, fragt og importafgifter er udeladt. Priser kan ændre sig; kontrollér hos sælgeren.')}</p></details><span class="price-basis" data-price-basis="${item.id}"></span></td><td><label for="quantity-${item.id}"><span class="mobile-cost-label" aria-hidden="true">${l('Quantity','Antal')}</span><span class="sr-only">${l('Quantity — '+item.name,'Antal — '+(item.daName??item.name))}</span></label><input type="number" id="quantity-${item.id}" name="quantity-${item.id}" value="${item.quantity}" min="1" max="100" step="1" required></td><td><label for="price-${item.id}"><span class="mobile-cost-label" aria-hidden="true">${l('Unit · USD','Enhed · USD')}</span><span class="sr-only">${l('Unit price in USD — '+item.name,'Enhedspris i USD — '+(item.daName??item.name))}</span></label><input type="number" id="price-${item.id}" name="price-${item.id}" min="0" max="100000000" step="any" inputmode="decimal" placeholder="Unknown" ${item.usd===null?'':`value="${item.usd}"`}></td><td><span class="mobile-cost-label" aria-hidden="true">${l('Line total','Linjetotal')}</span><output data-line-total="${item.id}">—</output></td></tr>`).join('')}</tbody></table></div>`;
}

export function costMarkup() {
  return `<section class="cost-band section-space" id="cost" aria-labelledby="cost-title"><div class="page-width">
    <div class="section-heading"><div><p class="eyebrow">${l('HYPOTHETICAL IMPLEMENTATION','HYPOTETISK IMPLEMENTERING')}</p><h2 id="cost-title">${l('Hardware budget','Hardwarebudget')}</h2></div><p>${l('Edit unit prices in USD. Blank prices are unknown and excluded from the subtotal. No complete prototype price can be established from the available evidence.','Redigér enhedspriser i USD. Tomme priser er ukendte og udeladt fra subtotalen. De tilgængelige kilder fastlægger ikke prisen på en komplet prototype.')}</p></div>
    <div class="cost-disclaimer"><strong>${l('Estimated hardware cost — not an official quotation','Anslået hardwarepris — ikke et officielt tilbud')}</strong><p>${l('These figures are illustrative engineering estimates. They do not represent confirmed manufacturer pricing, production costs, or the actual cost of a completed SpikeNav prototype.','Tallene er illustrative tekniske estimater. De repræsenterer hverken bekræftede producentpriser, produktionsomkostninger eller den faktiske pris på en færdig SpikeNav-prototype.')}</p></div>
    <div class="cost-running-total" aria-label="Current budget"><strong data-cost-label>${l('Subtotal for entered items','Subtotal for udfyldte poster')}</strong><div><output data-cost-usd></output><output data-cost-dkk></output></div><p data-cost-state></p></div>
    <div class="cost-layout"><div class="cost-worksheet"><div class="panel-heading"><h3>${l('Hardware worksheet','Hardwareberegning')}</h3><button type="button" class="reset-button" id="cost-reset">${l('Reset prices','Nulstil priser')}</button></div>
      <form id="cost-form" novalidate>${costTable(COST_ITEMS.slice(0,6),l('Poster hardware; unit prices in USD','Posterens hardware; enhedspriser i USD'))}
        <details class="integration-costs compact-details" id="integration-costs"><summary>${l('Drone, flight controller & integration · 4 more items','Drone, flyvecontroller og integration · 4 ekstra poster')}</summary><p class="field-hint">${l('These are required budget categories, not additional hardware selected by the poster. They remain unpriced until you enter assumptions.','Nødvendige budgetkategorier, ikke yderligere hardware valgt i posteren. Priserne forbliver ukendte, indtil du indtaster antagelser.')}</p>${costTable(COST_ITEMS.slice(6),l('Integration assumptions; unit prices in USD','Integrationsantagelser; enhedspriser i USD'))}</details><p id="cost-error" class="error-message" role="alert" hidden></p>
      </form>
    </div><aside class="cost-summary science-panel"><div class="cost-summary-totals"><span class="evidence-tag assumption">${l('ILLUSTRATIVE BUDGET','ILLUSTRATIVT BUDGET')}</span><h3 id="cost-total-label" data-cost-label>${l('Subtotal for entered items','Subtotal for udfyldte poster')}</h3><output id="cost-usd" data-cost-usd class="cost-total"></output><output id="cost-dkk" data-cost-dkk class="cost-dkk"></output></div><p id="cost-completeness" data-cost-state role="status" aria-live="polite"></p>
      <details class="compact-details" id="cost-breakdown"><summary>${l('Currency, breakdown & export','Valuta, fordeling og eksport')}</summary><div class="cost-composition" id="cost-composition"></div><div class="exchange-control"><label for="exchange-rate">${l('DKK per 1 USD','DKK pr. 1 USD')}</label><input type="number" id="exchange-rate" min="0.0001" max="1000" step="any" value="${EXCHANGE.dkkPerUsd.toFixed(6)}" required><p id="exchange-basis"></p>${cite('20')}</div><button type="button" id="cost-export" class="small-button">${l('Download this scenario · JSON','Download dette scenarie · JSON')}</button></details><p class="field-hint">${l('No labour, software development, test flights, certification, spares or clinical logistics are included. Avoid counting the same controller or carrier twice.','Arbejde, softwareudvikling, testflyvninger, certificering, reservedele og klinisk logistik indgår ikke. Tæl ikke samme controller eller bærekort to gange.')}</p>
    </aside></div>
    <details class="chip-cost-note compact-details"><summary>${l('Loihi 2 price: not publicly available','Loihi 2-pris: ikke offentligt tilgængelig')}</summary><div><p>${l('Intel’s brief describes a research-access ecosystem, not commercial per-chip pricing. Oheo Gulch (one chip plus FPGA) and Kapoho Point (eight chips) are research platforms, not price-equivalent single chips.','Intel beskriver adgang gennem forskning, ikke kommerciel pris pr. chip. Oheo Gulch (én chip plus FPGA) og Kapoho Point (otte chips) er forskningsplatforme og kan ikke sidestilles med én chip i pris.')} ${cite('7')}</p><p>${l('There is insufficient evidence for credible low, central and high Loihi 2 estimates. OpenMV and Jetson listings establish costs for different products; they cannot justify a Loihi price. Any number you enter is explicitly a user-supplied engineering assumption, with no implied manufacturer endorsement.','Der er utilstrækkeligt grundlag for troværdige lave, centrale og høje Loihi 2-estimater. OpenMV- og Jetson-priser gælder andre produkter og begrunder ikke en Loihi-pris. Alle tal, du indtaster, er dine egne tekniske antagelser uden producentbekræftelse.')}</p></div></details>
  </div></section>`;
}

export function setupCost() {
  const form=document.querySelector('#cost-form');
  const rate=document.querySelector('#exchange-rate');
  let current;
  let customRate=false;
  const getItems=()=>COST_ITEMS.map(item=>({ ...item, quantity:form.elements[`quantity-${item.id}`].valueAsNumber, usd:form.elements[`price-${item.id}`].value.trim()==='' ? null : form.elements[`price-${item.id}`].valueAsNumber }));
  const put=(selector,value)=>document.querySelectorAll(selector).forEach(element=>{element.textContent=value;});
  function render() {
    const items=getItems();
    const invalid=[...form.querySelectorAll('input')].filter(input=>!input.validity.valid || (input.value!=='' && !Number.isFinite(input.valueAsNumber)));
    [...form.querySelectorAll('input')].forEach(input=>input.setAttribute('aria-invalid',String(invalid.includes(input))));
    const rateValid=rate.validity.valid && Number.isFinite(rate.valueAsNumber);
    rate.setAttribute('aria-invalid',String(!rateValid));
    const error=document.querySelector('#cost-error');
    error.hidden=invalid.length===0 && rateValid;
    const exportButton=document.querySelector('#cost-export');
    document.querySelector('.cost-running-total').setAttribute('aria-label',tr('Current budget','Aktuelt budget'));
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
      put('[data-cost-label]',tr('Check budget inputs','Kontrollér budgetinput'));
      put('[data-cost-usd]','—'); put('[data-cost-dkk]','—');
      put('[data-cost-state]',tr('Correct the marked inputs to calculate.','Ret de markerede input for at beregne.'));
      document.querySelector('#cost-composition').replaceChildren();
      exportButton.disabled=true; return;
    }
    current=calculateCost(items,rate.valueAsNumber);
    exportButton.disabled=false;
    put('[data-cost-label]',current.complete?tr('Scenario total','Scenariets total'):tr('Subtotal for entered items','Subtotal for udfyldte poster'));
    put('[data-cost-usd]',money(current.subtotal));
    put('[data-cost-dkk]',money(current.dkk,'DKK'));
    document.querySelector('.cost-running-total [data-cost-state]').textContent=current.complete
      ? tr('All items filled · engineering scenario', 'Alle poster udfyldt · teknisk scenarie')
      : tr(`${current.missing.length} unpriced items excluded · full cost unknown`,`${current.missing.length} uprissatte poster udeladt · fuld pris ukendt`);
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
