(() => {
  const DATA_URL = '../../assets/data/speaking-part4.json';
  const listEl = document.getElementById('promptList');
  const tagEl = document.getElementById('detailTag');
  const titleEl = document.getElementById('detailTitle');
  const instructionEl = document.getElementById('detailInstruction');
  const goalEl = document.getElementById('detailGoal');
  const bulletsEl = document.getElementById('detailBullets');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const timerChip = document.getElementById('timerChip');
  const timerBar = document.getElementById('timerBar');
  const recStatus = document.getElementById('recStatus');
  const recDot = document.getElementById('recDot');
  const recDownload = document.getElementById('recDownload');
  const transcript = document.getElementById('transcript');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const emptyState = document.getElementById('emptyState');

  let prompts = [];
  let idx = 0;
  let timer = { total: 0, remaining: 0, interval: null };
  let mediaRecorder = null;
  let audioChunks = [];
  let recognition = null;
  let isRecording = false;

  fetch(DATA_URL)
    .then((res) => res.json())
    .then((data) => {
      prompts = Array.isArray(data?.prompts) ? data.prompts : [];
      if (!prompts.length) {
        showEmpty('Sin prompts disponibles.');
        return;
      }
      renderMenu();
      renderPrompt(0);
    })
    .catch(() => showEmpty('No se pudo cargar el JSON de prompts.'));

  function renderMenu() {
    if (!listEl) return;
    listEl.innerHTML = '';
    prompts.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prompt-btn';
      btn.innerHTML = `<span>${p.tag || `Task ${i + 1}`}</span>${p.title || `Prompt ${i + 1}`}`;
      btn.addEventListener('click', () => renderPrompt(i));
      listEl.appendChild(btn);
    });
  }

  function syncActiveButton() {
    const buttons = listEl?.querySelectorAll('.prompt-btn') || [];
    buttons.forEach((btn, i) => btn.classList.toggle('is-active', i === idx));
  }

  function renderPrompt(nextIdx) {
    if (!prompts[nextIdx]) return;
    idx = nextIdx;
    stopAll(true);
    syncActiveButton();
    const item = prompts[idx];
    if (emptyState) emptyState.style.display = 'none';
    tagEl.textContent = item.tag || `Task ${idx + 1}`;
    titleEl.textContent = item.title || `Prompt ${idx + 1}`;
    instructionEl.textContent = item.instruction || '';
    goalEl.textContent = item.goal || '';
    bulletsEl.innerHTML = '';
    (item.bullets || []).forEach((b) => {
      const li = document.createElement('li');
      li.textContent = b;
      bulletsEl.appendChild(li);
    });
    const secs = Number(item.timeLimitSec) || 75;
    timerChip.textContent = formatTime(secs);
    timerBar.style.width = '0%';
    if (transcript) transcript.value = '';
    if (recDownload) {
      recDownload.style.display = 'none';
      recDownload.removeAttribute('href');
    }
  }

  function showEmpty(msg) {
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.textContent = msg;
    }
  }

  function formatTime(secs) {
    const total = Math.max(0, Number(secs) || 0);
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function startTimer(secs) {
    clearInterval(timer.interval);
    timer.total = secs;
    timer.remaining = secs;
    updateTimer();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    timer.interval = setInterval(() => {
      timer.remaining -= 1;
      updateTimer();
      if (timer.remaining <= 0) {
        stopAll();
      }
    }, 1000);
  }

  function updateTimer() {
    timerChip.textContent = formatTime(Math.max(timer.remaining, 0));
    const pct =
      timer.total > 0
        ? Math.max(0, Math.min(100, (timer.remaining / timer.total) * 100))
        : 0;
    timerBar.style.width = `${pct}%`;
  }

  function stopTimer(resetToPrompt = false) {
    clearInterval(timer.interval);
    timer.interval = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    if (resetToPrompt) {
      const secs = Number(prompts[idx]?.timeLimitSec) || 75;
      timerChip.textContent = formatTime(secs);
      timerBar.style.width = '0%';
    }
  }

  function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecStatus('Mic no disponible', false);
      return;
    }
    audioChunks = [];
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = handleRecordingStop;
        mediaRecorder.start();
        startRecognition();
        isRecording = true;
        setRecStatus('Grabando...', true);
      })
      .catch(() => setRecStatus('Permiso de micrófono denegado', false));
  }

  function stopRecording() {
    if (!isRecording) return;
    isRecording = false;
    try { mediaRecorder?.stop(); } catch { setRecStatus('No se pudo detener la grabación', false); }
    stopRecognition();
    setRecStatus('Procesando audio...', false);
  }

  function handleRecordingStop() {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    if (recDownload) {
      recDownload.href = url;
      recDownload.style.display = 'inline-flex';
    }
    setRecStatus('Listo. Revisa el transcript o descarga el audio.', false);
  }

  function startRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      let finalText = transcript?.value || '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += (finalText ? ' ' : '') + txt.trim();
        }
      }
      if (transcript) transcript.value = finalText;
    };
    recognition.start();
  }

  function stopRecognition() {
    try { recognition?.stop(); } catch { /* ignore */ }
  }

  function setRecStatus(text, recording) {
    if (recStatus) recStatus.innerHTML = `<span class="status-dot ${recording ? 'is-recording' : ''}"></span> ${text}`;
    const dot = recStatus?.querySelector('.status-dot') || recDot;
    if (dot) dot.classList.toggle('is-recording', recording);
  }

  function stopAll(resetTimer = false) {
    stopTimer(resetTimer);
    stopRecording();
  }

  startBtn?.addEventListener('click', () => {
    const secs = Number(prompts[idx]?.timeLimitSec) || 75;
    stopAll(true);
    startRecording();
    startTimer(secs);
  });
  stopBtn?.addEventListener('click', () => stopAll(true));
  prevBtn?.addEventListener('click', () => renderPrompt((idx - 1 + prompts.length) % prompts.length));
  nextBtn?.addEventListener('click', () => renderPrompt((idx + 1) % prompts.length));
})();
