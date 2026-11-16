import { calculate } from './energy-model.mjs';
import { t, localeFor } from './i18n.mjs';
import { createForestDemo } from './forest-demo.mjs';

const form = document.querySelector('#energy-form');
const inputs = [...form.querySelectorAll('input')];
const outputs = new Map([...document.querySelectorAll('[data-out]')].map(el => [el.dataset.out, el]));
const error = document.querySelector('#form-error');
const status = document.querySelector('#result-status');
const put = (key, value) => { outputs.get(key).textContent = value; };
const awake = form.elements.awake;
let language = 'en';
let format;
let percent;
let signed;
const demo = createForestDemo(document.querySelector('#training-demo'));

function clearResults(message) {
  demo.update({ language, valid: false });
  outputs.forEach(el => { el.textContent = '—'; });
  document.querySelectorAll('.bar-track > span').forEach(el => { el.style.width = '0%'; });
  error.hidden = false;
  error.textContent = message;
  status.textContent = t(language, 'invalidStatus');
  status.dataset.state = 'warning';
}

function render() {
  const values = Object.fromEntries(inputs.map(input => [input.name, input.valueAsNumber]));
  document.querySelector('#awake-value').value = percent.format(values.awake / 100);
  awake.style.setProperty('--awake-percent', `${values.awake}%`);
  document.querySelectorAll('[data-preset]').forEach(button => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.preset) === values.propulsion));
  });
  const invalid = inputs.filter(input => !input.validity.valid || !Number.isFinite(input.valueAsNumber));
  inputs.forEach(input => { input.setAttribute('aria-invalid', String(invalid.includes(input))); });
  if (invalid.length) {
    const input = invalid[0];
    const details = input.closest('details');
    if (details) details.open = true;
    clearResults(t(language, 'invalid', {
      field: input.closest('label').querySelector('span').textContent,
      min: format(Number(input.min)), max: format(Number(input.max)),
    }));
    return;
  }
  let result;
  try { result = calculate(values); }
  catch { clearResults(t(language, 'invalidGeneric')); return; }
  error.hidden = true;
  error.textContent = '';
  demo.update({ language, valid: true, ...values });
  put('gain', signed.format(result.rangeGain));
  put('flight', format(result.flightMinutes));
  put('baseline-flight', format(result.baselineMinutes));
  put('radius', format(result.radius));
  put('baseline-radius', format(result.baselineRadius));
  put('navigation', format(result.navigation, 2));
  put('baseline-nav', format(values.heavy));
  put('nav-saving', format(result.navigationSaving));
  put('wh-km', format(result.energyPerKm, 2));
  put('reserve-note', t(language, 'reserveNote', { reserve: percent.format(values.reserve / 100) }));
  const duty = values.awake / 100;
  put('equation', `${format(values.camera / 1000, 3)} + ${format(values.snn / 1000, 3)} + ${format(duty, 2)} × ${format(values.heavy)} + ${format(1 - duty, 2)} × ${format(values.sleep)} = ${format(result.navigation, 3)} W`);
  const scale = Math.max(values.heavy, result.navigation);
  document.querySelector('.baseline-bar').style.width = `${values.heavy / scale * 100}%`;
  document.querySelector('.gated-bar').style.width = `${result.navigation / scale * 100}%`;
  status.dataset.state = result.rangeGain > 0 ? 'ready' : 'warning';
  status.textContent = t(language, result.rangeGain > 0 ? 'positiveStatus' : 'negativeStatus', {
    baseline: format(result.baselinePower, 2), gated: format(result.totalPower, 2),
  });
}

function setLanguage(next, persist = false) {
  language = next === 'da' ? 'da' : 'en';
  const locale = localeFor(language);
  const formats = [0, 1, 2, 3].map(digits => new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits > 1 ? digits : 0, maximumFractionDigits: digits,
  }));
  format = (value, digits = 1) => formats[digits].format(value);
  percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  signed = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'exceptZero' });
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(language, el.dataset.i18n); });
  for (const attribute of ['aria-label', 'content']) {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(el => {
      el.setAttribute(attribute, t(language, el.getAttribute(`data-i18n-${attribute}`)));
    });
  }
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
  if (persist) {
    try { localStorage.setItem('death-energy-language', language); } catch { /* Language switching also works without storage. */ }
  }
  render();
}

let initialLanguage = 'en';
try { initialLanguage = localStorage.getItem('death-energy-language') || 'en'; } catch { /* Default to English. */ }
const requestedLanguage = new URLSearchParams(location.search).get('lang');
if (requestedLanguage === 'en' || requestedLanguage === 'da') initialLanguage = requestedLanguage;
setLanguage(initialLanguage);

document.querySelectorAll('[data-language]').forEach(button => {
  button.addEventListener('click', () => setLanguage(button.dataset.language, true));
});
document.querySelectorAll('[data-preset]').forEach(button => {
  button.addEventListener('click', () => { form.elements.propulsion.value = button.dataset.preset; render(); });
});
form.addEventListener('input', render);
form.addEventListener('change', render);
form.addEventListener('reset', () => requestAnimationFrame(render));
form.addEventListener('submit', event => { event.preventDefault(); render(); form.reportValidity(); });
