import { REFERENCES } from '../data/references.mjs';
import { HARDWARE } from '../data/hardware.mjs';
import { SCIENTIFIC_GAPS, EQUATIONS } from '../data/science.mjs';
import { architectureMarkup, setupArchitecture } from './architecture-view.mjs';
import { distanceMarkup, setupDistance } from './distance-view.mjs';
import { costMarkup, setupCost } from './cost-view.mjs';
import { setupClearanceLearning } from './learning-view.mjs';
import { localized as l, citation as cite, tr, setUiLanguage, escapeHtml as e, renderMath } from './ui.mjs';

function integrityMarkup(){
  return `<section class="evidence-strip page-width" aria-label="Scientific evidence status"><div><span class="evidence-tag established">${l('ESTABLISHED','ETABLERET')}</span><p>${l('Event sensors and on-chip plasticity exist.','Hændelsessensorer og plasticitet på chip findes.')} ${cite('7','8')}</p></div><div><span class="evidence-tag proposed">${l('PROPOSED','FORESLÅET')}</span><p>${l('The integrated control architecture is a research proposal.','Den integrerede kontrolarkitektur er et forskningsforslag.')} ${cite('poster')}</p></div><div><span class="evidence-tag theory">${l('THEORETICAL','TEORETISK')}</span><p>${l('Power, range and switching calculations use stated assumptions.','Effekt, rækkevidde og overtagelse beregnes ud fra angivne antagelser.')} ${cite('poster')}</p></div><div><span class="evidence-tag unknown">${l('NOT YET VALIDATED','ENDNU IKKE VALIDERET')}</span><p>${l('No integrated SpikeNav flight results are reported.','Ingen integrerede SpikeNav-flyveresultater er rapporteret.')} ${cite('poster')}</p></div></section>`;
}

function referencesMarkup(){
  return `<section class="references-section section-space page-width" id="references" aria-labelledby="references-title"><div class="section-heading"><div><p class="eyebrow">${l('FOLLOW THE EVIDENCE','FØLG DOKUMENTATIONEN')}</p><h2 id="references-title">${l('Every claim\nhas a provenance.','Hver påstand\nhar en oprindelse.')}</h2></div><p>${l('The poster is the primary source. Manufacturer documents and primary research constrain the details. Unknowns and discrepancies are part of the record. Last reviewed 24 November 2026.','Posteren er den primære kilde. Producentdokumenter og original forskning afgrænser detaljerne. Ukendte forhold og afvigelser er en del af dokumentationen. Senest kontrolleret 24. november 2026.')}</p></div>
    <div class="review-register"><div class="panel-heading"><h3>${l('Scientific review · open questions','Videnskabelig gennemgang · åbne spørgsmål')}</h3><span class="evidence-tag unknown">${l('RESEARCH IN PROGRESS','FORSKNING I GANG')}</span></div>${SCIENTIFIC_GAPS.map(gap=>`<details id="gap-${gap.id}"><summary>${l(gap.en.split('. ')[0]+'.',gap.da.split('. ')[0]+'.')}</summary><p>${l(gap.en,gap.da)} ${cite(...gap.sources)}</p></details>`).join('')}</div>
    <div class="reference-toolbar"><label for="reference-search">${l('Search the source ledger','Søg i kilderegisteret')}</label><input id="reference-search" type="search" placeholder="Title, author, source or DOI" aria-controls="reference-list"><span id="reference-count" role="status"></span></div><div id="reference-list" class="reference-list"></div><p class="source-hierarchy">${l('Source hierarchy: poster and its references; official manufacturer documentation; peer-reviewed research; official distributors; explicitly identified engineering assumptions. AI-generated prose is never used as evidence. Original references retain their poster numbering; additional sources start at [15].','Kildehierarki: poster og dens referencer; officiel producentdokumentation; fagfællebedømt forskning; officielle forhandlere; eksplicit markerede tekniske antagelser. AI-genereret tekst bruges aldrig som dokumentation. Originale referencer bevarer posterens nummerering; ekstra kilder starter ved [15].')}</p><div class="source-downloads"><a href="data/science.mjs">${l('Scientific parameters','Videnskabelige parametre')}</a><a href="data/hardware.mjs">${l('Hardware data','Hardwaredata')}</a><a href="data/pricing.mjs">${l('Pricing assumptions','Prisantagelser')}</a><a href="data/references.mjs">${l('Reference data','Referencedata')}</a><a href="data/link-review.json">${l('Dated link review','Dateret linkkontrol')}</a><a href="data/poster-transcript.txt">${l('Poster transcript','Postertransskription')}</a></div>
  </section>`;
}

function renderHardware(){
  const selected=document.querySelector('[data-component][aria-pressed=true]')?.dataset.component ?? 'event';
  document.querySelector('.component-detail').innerHTML=HARDWARE.map(h=>`<article id="product-${h.id}" data-product-panel="${h.id}" aria-labelledby="${h.id}-title" ${h.id===selected?'':'hidden'}><div class="product-top"><span class="eyebrow">${e(h.maker)}</span><span class="evidence-tag established">${tr('SOURCED HARDWARE','DOKUMENTERET HARDWARE')}</span></div><div class="hardware-product-layout"><div><h3 id="${h.id}-title">${e(h.name)}</h3><p class="part-number">${e(tr(h.variant,h.daVariant))}</p></div><figure class="hardware-photo">${h.image?`<img src="${h.image}" alt="${e(tr(h.imageCaption,h.daImageCaption))}" loading="lazy" width="240" height="180"><figcaption>${e(tr(h.imageCaption,h.daImageCaption))} ${cite(h.imageSource)}</figcaption>`:`<svg aria-hidden="true" viewBox="0 0 32 32"><use href="#i-${h.icon}"/></svg><figcaption>${tr('Could not be verified: exact-model product photograph.','Kunne ikke verificeres: produktfoto af præcis model.')}</figcaption>`}</figure></div><p class="product-description">${e(tr(h.role,h.daRole))} ${cite('poster')}</p><dl class="spec-grid">${h.specs.map(s=>`<div><dt>${e(tr(s.en,s.da))}</dt><dd>${s.value===null?tr('Not publicly available','Ikke offentligt tilgængelig'):e(s.value)}</dd></div>`).join('')}</dl><div class="hardware-assessment"><div><h4>${tr('Why it is a candidate','Hvorfor den er en kandidat')}</h4><p>${e(tr(h.benefit,h.daBenefit))}</p></div><div><h4>${tr('Limits & integration gaps','Begrænsninger og integrationshuller')}</h4><p>${e(tr(h.limit,h.daLimit))}</p></div></div><div class="product-sources">${h.sources.map(id=>{const r=REFERENCES.find(r=>r.id===id);return `<a href="${r.url}" target="_blank" rel="noopener">[${id}] ${e(r.author)} · ${tr('documentation','dokumentation')}</a>`;}).join('')}<span>${tr('Reviewed 24 Nov 2026','Kontrolleret 24. nov. 2026')}</span></div></article>`).join('');
  // If a manufacturer download was blocked, expose an honest fallback instead of a broken image.
  document.querySelectorAll('.hardware-photo img').forEach(img=>img.addEventListener('error',()=>{
    img.hidden=true;
    img.closest('figure').querySelector('figcaption').textContent=tr('Could not be verified: product image could not be loaded.','Kunne ikke verificeres: produktfoto kunne ikke indlæses.');
  }));
}

function setupReferences(){
  const search=document.querySelector('#reference-search');
  function render(){
    const query=search.value.trim().toLocaleLowerCase();
    const matches=REFERENCES.filter(r=>Object.values(r).filter(Boolean).join(' ').toLocaleLowerCase().includes(query));
    document.querySelector('#reference-list').innerHTML=matches.map(r=>`<article class="reference-entry" id="ref-${r.id}"><span class="reference-id">[${r.id==='poster'?'Poster':r.id}]</span><div><div class="reference-meta"><span>${e(r.type)}</span><span>${e(r.year)}</span></div><h3>${r.url?`<a href="${r.url}" target="_blank" rel="noopener">${e(r.title)}</a>`:e(r.title)}</h3><p class="reference-author">${e(r.author)}</p><p class="reference-status">${e(r.status)}${r.note?` · ${e(r.note)}`:''}</p><div class="reference-identifiers">${r.doi?`<a href="https://doi.org/${r.doi}" target="_blank" rel="noopener">DOI: ${r.doi}</a>`:''}${r.identifier?`<span>${e(r.identifier)}</span>`:''}${r.extra?`<a href="${r.extra}" target="_blank" rel="noopener">${tr('Additional source / document','Ekstra kilde / dokument')}</a>`:''}</div></div></article>`).join('');
    document.querySelector('#reference-count').textContent=tr(`${matches.length} sources`,`${matches.length} kilder`);
    search.placeholder=tr('Title, author, source or DOI','Titel, forfatter, kilde eller DOI');
  }
  search.addEventListener('input',render);
  document.addEventListener('click',event=>{
    const anchor=event.target.closest('a[href^="#ref-"]');
    if(anchor && search.value){search.value='';render();}
  });
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#ref-') && search.value){search.value='';render();document.querySelector(location.hash)?.scrollIntoView();}});
  render();return {render};
}

function setupPrompt(){
  const dialog=document.querySelector('#prompt-dialog');
  const open=document.querySelector('#prompt-open');
  const close=document.querySelector('#prompt-close');
  let cached=null;
  open.addEventListener('click',async()=>{
    dialog.showModal();close.focus();
    if(cached!==null){document.querySelector('#prompt-text').textContent=cached;return;}
    document.querySelector('#prompt-text').textContent=tr('Loading the original prompt…','Indlæser den oprindelige prompt…');
    try{
      const response=await fetch('original-prompt.txt');
      if(!response.ok)throw new Error('Prompt file unavailable');
      cached=await response.text();document.querySelector('#prompt-text').textContent=cached;
    }catch{
      document.querySelector('#prompt-text').textContent=tr('The prompt could not be loaded. Use the “Download original prompt” link to open the plain-text file.','Prompten kunne ikke indlæses. Brug linket til den oprindelige tekstfil.');
    }
  });
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>open.focus({preventScroll:true}));
}

export function initResearch(){
  document.querySelector('.hero').insertAdjacentHTML('afterend',integrityMarkup());
  document.querySelector('#mission').insertAdjacentHTML('beforebegin',architectureMarkup()+distanceMarkup());
  document.querySelector('#project').insertAdjacentHTML('beforebegin',costMarkup()+referencesMarkup());
  document.querySelector('[data-i18n="contextText"]').insertAdjacentHTML('afterend',`<p class="context-citations">${cite('2','3','4')}</p>`);
  const architecture=setupArchitecture();
  const distance=setupDistance();
  const cost=setupCost();
  const references=setupReferences();
  const learning=setupClearanceLearning();
  setupPrompt();
  document.querySelector('.learning-equation').dataset.equation=EQUATIONS.learning;
  document.querySelector('.model-notes-grid > div').insertAdjacentHTML('afterbegin',`<div class="poster-equations"><span class="evidence-tag theory">${tr('EXACT POSTER EQUATIONS','POSTERENS PRÆCISE LIGNINGER')}</span><div data-equation="${EQUATIONS.baseline}"></div><div data-equation="${EQUATIONS.proposed}"></div><div data-equation="${EQUATIONS.gain}"></div>${cite('poster')}</div>`);
  document.querySelector('.model-notes-grid > div > h3').insertAdjacentHTML('beforebegin',`<p class="field-hint">${l('The editable extension below separates the per-unit LiDAR power and adds inactive power; the original equations above use the combined two-sensor budget and assume zero inactive power.','Den redigerbare udvidelse nedenfor adskiller LiDAR-effekt pr. enhed og tilføjer inaktiv effekt. De oprindelige ligninger ovenfor bruger det samlede budget for to sensorer og antager nul inaktiv effekt.')}</p>`);
  renderMath();
  return {
    setLanguage(language){
      setUiLanguage(language);
      renderHardware(); architecture.render(); distance.render(); cost.render(); references.render(); learning.render(); renderMath();
    },
  };
}
