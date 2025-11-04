/* App interactions for Selective Silence */
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const modeList = document.getElementById('modeList');
  const activeProfile = document.getElementById('activeProfile');
  const ancToggle = document.getElementById('ancToggle');
  const transparency = document.getElementById('transparency');
  const batteryEl = document.getElementById('battery');
  const batteryLevelEl = document.getElementById('batteryLevel');
  const timeRemainingEl = document.getElementById('timeRemaining');
  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const volume = document.getElementById('volume');
  const volVal = document.getElementById('volVal');
  const timeBtns = Array.from(document.querySelectorAll('.time-btn'));
  const timerDisplay = document.getElementById('timerDisplay');
  const findBtn = document.getElementById('findBtn');
  const pairTeacherBtn = document.getElementById('pairTeacherBtn');
  const noiseBtn = document.getElementById('noiseBtn');
  const caseImage = document.getElementById('caseImage');
  const device = document.getElementById('device');

  // Dynamic data
  const MODES = [
    {id:'studying', label:'Studying', active:true},
    {id:'independent', label:'Independent Work'},
    {id:'lessons', label:'Lessons'},
    {id:'home', label:'Home'}
  ];

  // Render modes dynamically
  function renderModes(){
    modeList.innerHTML = '';
    MODES.forEach(m=>{
      const btn = document.createElement('button');
      btn.className = 'mode' + (m.active ? ' active' : '');
      btn.dataset.mode = m.id;
      btn.textContent = m.label;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode').forEach(x=>x.classList.remove('active'));
        btn.classList.add('active');
        updateProfile();
      });
      modeList.appendChild(btn);
    });
  }

  // Battery logic (start at 89% but allow small interactions)
  let battery = 89;
  function updateBatteryDisplay(){
    batteryEl.textContent = battery + '%';
    if (batteryLevelEl) {
      batteryLevelEl.style.width = Math.max(0, Math.min(100, battery)) + '%';
    }
    if (battery <= 20) batteryEl.closest('.battery').classList.add('low'); else batteryEl.closest('.battery').classList.remove('low');
    updateEstimatedTime();
  }

  // Estimate remaining time from battery% — simple linear model: battery% * 0.093 hours (~5.6% -> ~5.1min)
  function updateEstimatedTime(){
    // Assume full charge ~9.3 hours (so 100% -> 9h18m)
    const totalMinutes = Math.round(battery * 9.3 * 60 / 100);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    timeRemainingEl.textContent = `Estimated: ${h}h ${m}m`;
  }

  // Battery click simulates small drain for demo
  document.querySelector('.battery').addEventListener('click', () => {
    battery = Math.max(0, battery - 1);
    updateBatteryDisplay();
    // subtle pulse
    batteryLevelEl.animate([{opacity:0.8},{opacity:1}],{duration:380,iterations:1});
  });

  // Pair with teacher (simulated)
  pairTeacherBtn.addEventListener('click', () => {
    pairTeacherBtn.disabled = true;
    const orig = pairTeacherBtn.textContent;
    pairTeacherBtn.textContent = 'Pairing…';
    pairTeacherBtn.animate([{opacity:1},{opacity:0.6},{opacity:1}],{duration:900,iterations:2});
    setTimeout(() => {
      pairTeacherBtn.textContent = 'Paired ✓';
      pairTeacherBtn.style.borderColor = '#dfe';
    }, 1600);
    setTimeout(() => {
      pairTeacherBtn.disabled = false;
      pairTeacherBtn.textContent = orig;
      pairTeacherBtn.style.borderColor = '';
    }, 4200);
  });

  // Noise cancelling custom toggles visual state
  let noiseActive = false;
  noiseBtn.addEventListener('click', () => {
    noiseActive = !noiseActive;
    noiseBtn.textContent = noiseActive ? 'Custom NC (on)' : 'Custom Noise Cancelling';
    noiseBtn.style.background = noiseActive ? '#111' : '';
    noiseBtn.style.color = noiseActive ? '#fff' : '';
    // update profile text
    updateProfile();
  });

  // Mode switching / profile text
  function updateProfile() {
    const active = document.querySelector('.mode.active')?.dataset.mode || 'studying';
    const anc = ancToggle.checked ? 'ANC on' : 'ANC off';
    const trans = transparency.value;
    const noise = noiseActive ? ' · Custom NC' : '';
    activeProfile.textContent = `${capitalize(active)} · ${anc} · Transparency ${trans}%${noise}`;
  }

  // Render initial UI and wire controls
  renderModes();
  ancToggle.addEventListener('change', updateProfile);
  transparency.addEventListener('input', updateProfile);

  // Play/pause toggle (visual only)
  let isPlaying = false;
  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playBtn.setAttribute('aria-pressed', String(isPlaying));
    if (isPlaying) {
      playIcon.innerHTML = '<path d="M6 5v14l11-7z" fill="currentColor"/>';
    } else {
      playIcon.innerHTML = '<path d="M6 18V6l8.5 6L6 18zM16 6h2v12h-2z" fill="currentColor"/>';
    }
  });

  // Volume visual
  volume.addEventListener('input', () => volVal.textContent = volume.value);

  // Timer
  let timer = null;
  function startTimer(minutes) {
    clearTimer();
    let seconds = minutes * 60;
    updateTimerDisplay(seconds);
    timer = setInterval(() => {
      seconds--;
      updateTimerDisplay(seconds);
      if (seconds <= 0) clearTimer();
    }, 1000);
  }
  function updateTimerDisplay(sec) {
    if (sec <= 0) {
      timerDisplay.textContent = 'Done';
      return;
    }
    const m = Math.floor(sec / 60).toString().padStart(2,'0');
    const s = (sec % 60).toString().padStart(2,'0');
    timerDisplay.textContent = `${m}:${s}`;
  }
  function clearTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  timeBtns.forEach(btn => btn.addEventListener('click', () => {
    const minutes = Number(btn.dataset.min) || 25;
    startTimer(minutes);
  }));

  // Find earbuds (visual pulse on image)
  findBtn.addEventListener('click', () => {
    caseImage.animate([{filter:'drop-shadow(0 0 0 rgba(17,17,17,0.0))'},{filter:'drop-shadow(0 0 18px rgba(17,17,17,0.18))'},{filter:'drop-shadow(0 0 0 rgba(17,17,17,0.0))'}], {duration:900});
  });

  // Click image toggles case open/close (visual scale)
  let open = true;
  caseImage.addEventListener('click', () => {
    open = !open;
    caseImage.animate([{transform: open ? 'scale(0.96)' : 'scale(1.02)'},{transform:'scale(1)'}],{duration:240});
  });

  // Layout: switch device class for desktop mode (used by CSS)
  function applyLayout() {
    const isDesktop = window.matchMedia('(min-width:720px)').matches;
    device.dataset.layout = isDesktop ? 'desktop' : 'mobile';
  }
  window.addEventListener('resize', applyLayout);
  applyLayout();

  // Utility
  function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

  // initialize UI text/values
  updateBatteryDisplay();
  updateProfile();
  volVal.textContent = volume.value;
});