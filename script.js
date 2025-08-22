const form = document.getElementById('ageForm');
const input = document.getElementById('dob');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');

const yearsEl = document.getElementById('years');
const monthsEl = document.getElementById('months');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

const fromText = document.getElementById('fromText');
const toText = document.getElementById('toText');

let timer = null;

function pad2(n){ return String(n).padStart(2, '0'); }
function isValidDate(d){ return d instanceof Date && !isNaN(d.valueOf()); }

function diffYMDHMS(from, to){
  if(to < from) return null;

  // Years
  let years = to.getFullYear() - from.getFullYear();
  let anniversary = new Date(from);
  anniversary.setFullYear(from.getFullYear() + years);
  if(anniversary > to){
    years--;
    anniversary.setFullYear(anniversary.getFullYear() - 1);
  }

  // Months
  let months = to.getMonth() - anniversary.getMonth();
  if(months < 0) months += 12;
  let monthAnniv = new Date(anniversary);
  monthAnniv.setMonth(anniversary.getMonth() + months);

  if(monthAnniv > to){
    months--;
    monthAnniv.setMonth(monthAnniv.getMonth() - 1);
  }

  // Remaining exact time
  const deltaMs = to - monthAnniv;
  const totalSec = Math.floor(deltaMs / 1000);

  const days = Math.floor(totalSec / 86400);
  let rem = totalSec % 86400;

  const hours = Math.floor(rem / 3600);
  rem = rem % 3600;

  const minutes = Math.floor(rem / 60);
  const seconds = rem % 60;

  return { years, months, days, hours, minutes, seconds };
}

function formatDateTime(dt){
  try {
    return new Intl.DateTimeFormat(undefined, {
      year:'numeric', month:'short', day:'2-digit',
      hour:'2-digit', minute:'2-digit', second:'2-digit'
    }).format(dt);
  } catch {
    return dt.toLocaleString();
  }
}

function updateNowText(){
  toText.textContent = formatDateTime(new Date());
}
function render(diff){
  yearsEl.textContent = diff.years;
  monthsEl.textContent = diff.months;
  daysEl.textContent = diff.days;
  hoursEl.textContent = pad2(diff.hours);
  minutesEl.textContent = pad2(diff.minutes);
  secondsEl.textContent = pad2(diff.seconds);
}

function startTicker(birth){
  stopTicker();
  tick(birth);
  timer = setInterval(() => tick(birth), 1000);
}
function stopTicker(){
  if(timer){ clearInterval(timer); timer = null; }
}
function tick(birth){
  const now = new Date();
  const diff = diffYMDHMS(birth, now);
  if(!diff){
    errorEl.textContent = 'Birth date cannot be in the future.';
    stopTicker();
    resultEl.classList.add('hidden');
    return;
  }
  errorEl.textContent = '';
  render(diff);
  updateNowText();
  resultEl.classList.remove('hidden');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = input.value;
  if(!val){
    errorEl.textContent = 'Please select a valid birth date.';
    resultEl.classList.add('hidden');
    stopTicker();
    return;
  }

  // convert YYYY-MM-DD to Date object (midnight 00:00:00)
  const parts = val.split('-'); // [YYYY,MM,DD]
  const birth = new Date(parts[0], parts[1]-1, parts[2]);

  if(!isValidDate(birth)){
    errorEl.textContent = 'Please select a valid birth date.';
    resultEl.classList.add('hidden');
    stopTicker();
    return;
  }
  if(birth > new Date()){
    errorEl.textContent = 'Birth date cannot be in the future.';
    resultEl.classList.add('hidden');
    stopTicker();
    return;
  }

  fromText.textContent = formatDateTime(birth);
  startTicker(birth);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  stopTicker();
  input.value = '';
  errorEl.textContent = '';
  resultEl.classList.add('hidden');
  fromText.textContent = '—';
  toText.textContent = '—';
});

input.addEventListener('change', () => {
  if(input.value){
    form.dispatchEvent(new Event('submit'));
  }
});
