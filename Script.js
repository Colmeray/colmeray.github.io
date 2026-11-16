const form = document.querySelector('#drone-form');
const results = {
  flight: document.querySelector('[data-result="flight"]'),
  flightNote: document.querySelector('[data-result="flight-note"]'),
  energy: document.querySelector('[data-result="energy"]'),
  power: document.querySelector('[data-result="power"]'),
  ratio: document.querySelector('[data-result="ratio"]'),
  payload: document.querySelector('[data-result="payload"]'),
  liftNote: document.querySelector('[data-result="lift-note"]'),
};
const errorMessage = document.querySelector('#form-error');
const flightMeter = document.querySelector('.flight-meter');
const ratioTrack = document.querySelector('.ratio-track');
const numberFormat = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 1 });
const integerFormat = new Intl.NumberFormat('da-DK', { maximumFractionDigits: 0 });

function showEmptyResults() {
  results.flight.textContent = '—';
  results.energy.innerHTML = '— <small>Wh</small>';
  results.power.innerHTML = '— <small>W</small>';
  results.ratio.textContent = '—';
  results.payload.textContent = '—';
  results.flightNote.textContent = 'Beregnes ud fra gennemsnitligt strømforbrug.';
  results.liftNote.textContent = 'Nyttelast ved valgt forhold';
  flightMeter.style.setProperty('--meter-width', '0%');
  ratioTrack.style.setProperty('--ratio-width', '0%');
}

function updateResults() {
  if (!form.checkValidity()) {
    errorMessage.textContent = 'Kontrollér felterne — indtast gyldige tal inden for de angivne grænser.';
    showEmptyResults();
    return;
  }

  errorMessage.textContent = '';
  const values = Object.fromEntries(new FormData(form).entries());
  const capacityAh = Number(values.capacity) / 1000;
  const voltage = Number(values.voltage);
  const current = Number(values.current);
  const usablePercent = Number(values.usable);
  const weight = Number(values.weight);
  const thrust = Number(values.thrust);
  const targetRatio = Number(values.ratio);

  const flightMinutes = (capacityAh * (usablePercent / 100) / current) * 60;
  const energyWh = capacityAh * voltage;
  const powerW = voltage * current;
  const actualRatio = thrust / weight;
  const payloadAtTarget = (thrust / targetRatio) - weight;

  results.flight.textContent = numberFormat.format(flightMinutes);
  results.energy.innerHTML = `${numberFormat.format(energyWh)} <small>Wh</small>`;
  results.power.innerHTML = `${integerFormat.format(powerW)} <small>W</small>`;
  results.ratio.textContent = `${numberFormat.format(actualRatio)}:1`;
  results.flightNote.textContent = `Med ${integerFormat.format(usablePercent)} % brug af batteriet.`;
  flightMeter.style.setProperty('--meter-width', `${Math.min((flightMinutes / 30) * 100, 100)}%`);
  ratioTrack.style.setProperty('--ratio-width', `${Math.min((actualRatio / targetRatio) * 100, 100)}%`);

  if (payloadAtTarget >= 0) {
    results.liftNote.textContent = 'Mulig ekstra last ved valgt forhold';
    results.payload.textContent = `${integerFormat.format(payloadAtTarget)} g`;
  } else {
    results.liftNote.textContent = 'Vægtreduktion for valgt forhold';
    results.payload.textContent = `${integerFormat.format(Math.abs(payloadAtTarget))} g`;
  }
}

form.addEventListener('input', updateResults);
form.addEventListener('submit', (event) => {
  event.preventDefault();
  form.reportValidity();
});

document.querySelector('#year').textContent = new Date().getFullYear();
updateResults();
