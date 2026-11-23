import { calculate } from './energy-model.mjs';
import { t, localeFor } from './i18n.mjs';
import { createModelSwitch } from './model-switch.mjs';

const form = document.querySelector('#energy-form');
const inputs = [...form.querySelectorAll('input')];
const outputs = [...document.querySelectorAll('[data-out]')];
const error = document.querySelector('#form-error');
const resultStatus = document.querySelector('#result-status');
const awakeLabel = document.querySelector('#awake-value');
const mission = createModelSwitch(document.querySelector('.mission-explorer'));
const rewards = [...document.querySelectorAll('[data-reward]')];
const components = [...document.querySelectorAll('[data-component]')];
let language = 'en';
let reward = 1;
let format;
let signed;
let percent;

function put(key, value) {
  outputs.filter(element => element.dataset.out === key).forEach(element => { element.textContent = value; });
}

function renderReward() {
  rewards.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.reward) === reward)));
  const key = reward === 1 ? 'rewardNeeded' : reward === -0.2 ? 'rewardFalse' : 'rewardMissed';
  document.querySelector('#reward-description').textContent = t(language, key);
  document.querySelector('#reward-delta').textContent = 'Δw = ' + signed(reward * 0.1 * 0.8, 3);
}

function clearResults(message) {
  outputs.forEach(element => { element.textContent = '—'; });
  document.querySelectorAll('.bar-track > span').forEach(element => { element.style.width = '0%'; });
  error.hidden = false;
  error.textContent = message;
  resultStatus.textContent = t(language, 'invalidStatus');
  resultStatus.dataset.state = 'warning';
}

function renderEnergy() {
  const values = Object.fromEntries(inputs.map(input => [input.name, input.valueAsNumber]));
  awakeLabel.value = Number.isFinite(values.awake) ? percent.format(values.awake / 100) : '—';
  form.elements.awake.setAttribute('aria-valuetext', awakeLabel.value);
  form.elements.awake.style.setProperty('--awake-percent', values.awake + '%');
  document.querySelectorAll('[data-preset]').forEach(button => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.preset) === values.propulsion));
  });
  const invalid = inputs.filter(input => !input.validity.valid || !Number.isFinite(input.valueAsNumber));
  inputs.forEach(input => input.setAttribute('aria-invalid', String(invalid.includes(input))));
  if (invalid.length) {
    const input = invalid[0];
    const disclosure = input.closest('details');
    if (disclosure) disclosure.open = true;
    const label = input.closest('label').querySelector(':scope > span:first-child').textContent;
    clearResults(t(language, 'invalid', { field: label, min: format(Number(input.min)), max: format(Number(input.max)) }));
    return;
  }
  let result;
  try { result = calculate(values); }
  catch { clearResults(t(language, 'invalidGeneric')); return; }
  error.hidden = true;
  error.textContent = '';
  put('gain', signed(result.rangeGain, 1));
  document.querySelector('.gain-number').dataset.density = signed(result.rangeGain, 1).length > 7 ? 'compact' : 'normal';
  put('flight', format(result.flightMinutes, 1));
  put('baseline-flight', format(result.baselineMinutes, 1));
  put('radius', format(result.radius, 1));
  put('baseline-radius', format(result.baselineRadius, 1));
  put('navigation', format(result.navigation, 2));
  put('baseline-nav', format(result.baselineNavigation, 2));
  put('nav-saving', format(Math.abs(result.navigationSaving), 1));
  document.querySelector('[data-i18n="less"]').textContent = t(language, result.navigationSaving >= 0 ? 'less' : 'more');
  put('baseline-total', format(result.baselinePower, 2));
  put('total', format(result.totalPower, 2));
  put('reserve-note', t(language, 'reserveNote', { reserve: percent.format(values.reserve / 100) }));
  put('equation', t(language, 'equationResult', { base: format(result.baselineNavigation, 3), ours: format(result.navigation, 3) }));
  const scale = Math.max(result.baselineNavigation, result.navigation);
  document.querySelector('.baseline-bar').style.width = result.baselineNavigation / scale * 100 + '%';
  document.querySelector('.gated-bar').style.width = result.navigation / scale * 100 + '%';
  resultStatus.dataset.state = result.rangeGain > 0 ? 'ready' : 'warning';
  resultStatus.textContent = t(language, result.rangeGain > 0 ? 'positiveStatus' : 'negativeStatus');
}

function setLanguage(next, persist = false) {
  language = next === 'da' ? 'da' : 'en';
  const locale = localeFor(language);
  const formats = [0, 1, 2, 3].map(digits => new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  }));
  format = (value, digits = 0) => formats[digits].format(value);
  const signedFormats = [0, 1, 2, 3].map(digits => new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits, maximumFractionDigits: digits, signDisplay: 'exceptZero',
  }));
  signed = (value, digits = 1) => signedFormats[digits].format(value);
  percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  document.documentElement.lang = language;
  document.title = t(language, 'pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(language, element.dataset.i18n); });
  for (const attribute of ['aria-label', 'content', 'alt']) {
    document.querySelectorAll('[data-i18n-' + attribute + ']').forEach(element => {
      element.setAttribute(attribute, t(language, element.getAttribute('data-i18n-' + attribute)));
    });
  }
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  mission.setLanguage(language);
  renderReward();
  renderEnergy();
  if (persist) {
    try { localStorage.setItem('spikenav-language', language); } catch { /* Works without local storage. */ }
  }
}

components.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.component;
  components.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelectorAll('[data-product-panel]').forEach(panel => { panel.hidden = panel.dataset.productPanel !== selected; });
}));
rewards.forEach(button => button.addEventListener('click', () => { reward = Number(button.dataset.reward); renderReward(); }));
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language, true)));
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  form.elements.propulsion.value = button.dataset.preset;
  renderEnergy();
}));
form.addEventListener('input', renderEnergy);
form.addEventListener('change', renderEnergy);
form.addEventListener('reset', () => requestAnimationFrame(renderEnergy));
form.addEventListener('submit', event => { event.preventDefault(); renderEnergy(); form.reportValidity(); });

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); navigation.dataset.open = 'false'; }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.dataset.open = String(open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
const sectionLinks = [...navigation.querySelectorAll('a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const entry = entries.filter(item => item.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!entry) return;
    sectionLinks.forEach(link => {
      if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-12% 0px -60% 0px', threshold: 0 });
  sectionLinks.forEach(link => observer.observe(document.querySelector(link.hash)));
}

let initialLanguage = 'en';
try { initialLanguage = localStorage.getItem('spikenav-language') || localStorage.getItem('death-energy-language') || 'en'; } catch { /* Default to English. */ }
const requestedLanguage = new URLSearchParams(location.search).get('lang');
if (requestedLanguage === 'en' || requestedLanguage === 'da') initialLanguage = requestedLanguage;
setLanguage(initialLanguage);
