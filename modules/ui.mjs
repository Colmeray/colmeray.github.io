let language = 'en';
export const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
export const tr = (en, da) => language === 'da' ? (da ?? en) : en;
export const localized = (en, da) => `<span data-en="${escapeHtml(en)}" data-da="${escapeHtml(da ?? en)}">${escapeHtml(tr(en,da))}</span>`;
export const citation = (...ids) => `<span class="citations">${ids.map(id => `<a href="#ref-${id}" aria-label="Reference ${escapeHtml(id)}">[${id === 'poster' ? 'Poster' : id}]</a>`).join(' ')}</span>`;
export const number = (value, decimals=2) => new Intl.NumberFormat(language === 'da' ? 'da-DK' : 'en-US', { maximumFractionDigits:decimals, minimumFractionDigits:decimals }).format(value);
export const money = (value, currency='USD') => new Intl.NumberFormat(language === 'da' ? 'da-DK' : 'en-US', { style:'currency', currency, maximumFractionDigits:0 }).format(value);
export function setUiLanguage(next) {
  language = next;
  document.querySelectorAll('[data-en]').forEach(el => { el.textContent = el.dataset[next] ?? el.dataset.en; });
}
export function renderMath(root=document) {
  root.querySelectorAll('[data-equation]').forEach(el => {
    if (globalThis.katex) {
      globalThis.katex.render(el.dataset.equation, el, { displayMode:el.dataset.inline !== 'true', throwOnError:false, output:'htmlAndMathml', strict:'error' });
    } else el.textContent = el.dataset.equation;
  });
}
