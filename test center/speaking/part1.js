(() => {
  const DATA_URL = '../../assets/data/speaking-part1.json';
  const listEl = document.getElementById('promptList');
  const empty = document.getElementById('scEmpty');
  const detail = {
    shell: document.getElementById('detailContent'),
    task: document.getElementById('detailTask'),
    title: document.getElementById('detailTitle'),
    type: document.getElementById('detailType'),
    question: document.getElementById('detailQuestion'),
    verbs: document.getElementById('detailVerbs'),
    examples: document.getElementById('detailExamples'),
    start: document.getElementById('detailStart'),
    stop: document.getElementById('detailStop'),
    timer: document.getElementById('detailTimer'),
    bar: document.getElementById('detailBar')
  };
  const recStatus = document.getElementById('recStatus');
  const recDot = document.getElementById('recDot');
  const recDownload = document.getElementById('recDownload');
  const transcriptArea = document.getElementById('scTranscript');

  let mediaRecorder = null;
  let audioChunks = [];
  let recognition = null;
  let isRecording = false;
  let prompts = [];
  let activeIndex = 0;
  let timerState = { interval: null, total: 0, remaining: 0, running: false };

  fetch(DATA_URL)
    .then((res) => res.json())
    .then((data) => {
      prompts = Array.isArray(data?.prompts) ? data.prompts : [];
      renderMenu();
      if (prompts.length > 0) {
        setActive(0);
      } else {
        showEmpty('No hay preguntas configuradas.');
      }
    })
    .catch(() => {
      showEmpty('No se pudo cargar el JSON de preguntas.');
    });

  function renderMenu() {
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!prompts.length) return;
    hideEmpty();
    prompts.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prompt-btn';
      btn.textContent = item.title || `Pregunta ${idx + 1}`;
      btn.addEventListener('click', () => setActive(idx));
      listEl.appendChild(btn);
    });
    syncActiveButton();
  }

  function syncActiveButton() {
    const buttons = listEl?.querySelectorAll('.prompt-btn') || [];
    buttons.forEach((btn, idx) => {
      btn.classList.toggle('is-active', idx === activeIndex);
    });
  }

  function setActive(index) {
    if (!prompts[index]) return;
    activeIndex = index;
    syncActiveButton();
    stopTimer(true);
    // Clear transcript when switching tasks to avoid mixing answers
    if (transcriptArea) transcriptArea.value = '';
    const item = prompts[index];
    if (!detail.shell) return;
    detail.shell.style.display = 'flex';
    empty.style.display = 'none';
    detail.task.textContent = item.task ? `Task ${item.task}` : 'Task';
    detail.title.textContent = item.title || `Pregunta ${index + 1}`;
    detail.type.textContent = (item.type || 'Prompt').toUpperCase();
    detail.question.textContent = item.question || '';
    if (Array.isArray(item.verbs) && item.verbs.length > 0) {
      detail.verbs.textContent = `Verbs: ${item.verbs.join(', ')}`;
      detail.verbs.style.display = 'block';
    } else {
      detail.verbs.style.display = 'none';
    }
    detail.examples.innerHTML = '';
    const examples = Array.isArray(item.examples) ? item.examples : item.questions || [];
    examples.forEach((ex) => {
      const li = document.createElement('li');
      li.textContent = ex;
      detail.examples.appendChild(li);
    });
    const secs = Number(item.timeLimitSec) || 60;
    detail.timer.textContent = formatTime(secs);
    detail.bar.style.width = '0%';
  }

  // Grabación + Web Speech
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
      .catch(() => {
        setRecStatus('Permiso de micrófono denegado', false);
      });
  }

  function stopRecording() {
    if (!isRecording) return;
    isRecording = false;
    setRecStatus('Procesando audio...', false);
    try {
      mediaRecorder?.stop();
    } catch {
      setRecStatus('No se pudo detener la grabación', false);
    }
    stopRecognition();
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
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      // Combine texto final + interino para mostrar mientras se habla
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          finalText += (finalText ? ' ' : '') + transcript;
        } else {
          interimText = transcript;
        }
      }
      if (transcriptArea) {
        transcriptArea.value = (finalText + ' ' + interimText).trim();
      }
    };
    recognition.start();
  }

  function stopRecognition() {
    try {
      recognition?.stop();
    } catch {
      // ignore
    }
  }

  function setRecStatus(text, recording) {
    if (recStatus) {
      recStatus.innerHTML = `<span class="status-dot ${recording ? 'is-recording' : ''}"></span> ${text}`;
    }
    const dot = recStatus?.querySelector('.status-dot') || recDot;
    if (dot) dot.classList.toggle('is-recording', recording);
  }

  // Timer único
  detail.start?.addEventListener('click', () => startTimerForActive());
  detail.stop?.addEventListener('click', stopTimer);

  function startTimerForActive() {
    const prompt = prompts[activeIndex];
    const secs = Number(prompt?.timeLimitSec) || 60;
    stopTimer(true);
    startRecording();
    timerState.total = secs;
    timerState.remaining = secs;
    timerState.running = true;
    updateTimerUI();
    detail.start.disabled = true;
    detail.stop.disabled = false;
    timerState.interval = setInterval(() => {
      timerState.remaining -= 1;
      updateTimerUI();
      if (timerState.remaining <= 0) {
        stopTimer();
        detail.timer.textContent = '¡Tiempo!';
        detail.bar.style.width = '0%';
      }
    }, 1000);
  }

  function stopTimer(silent) {
    clearInterval(timerState.interval);
    timerState.interval = null;
    timerState.running = false;
    detail.start && (detail.start.disabled = false);
    detail.stop && (detail.stop.disabled = true);
    stopRecording();
    if (!silent) {
      const prompt = prompts[activeIndex];
      const secs = Number(prompt?.timeLimitSec) || 60;
      detail.timer.textContent = formatTime(secs);
      detail.bar.style.width = '0%';
    }
  }

  function updateTimerUI() {
    detail.timer.textContent = formatTime(Math.max(timerState.remaining, 0));
    const pct =
      timerState.total > 0
        ? Math.max(0, Math.min(100, (timerState.remaining / timerState.total) * 100))
        : 0;
    detail.bar.style.width = `${pct}%`;
  }

  function formatTime(secs) {
    const total = Math.max(0, Number(secs) || 0);
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function showEmpty(msg) {
    if (empty) {
      empty.style.display = 'block';
      empty.textContent = msg;
    }
  }

  function hideEmpty() {
    if (empty) empty.style.display = 'none';
  }
})();
