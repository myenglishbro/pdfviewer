(() => {
  const titleEl = document.getElementById('viewTitle');
  const descEl = document.getElementById('viewDescription');
  const cardContainer = document.getElementById('cardContainer');
  const frame = document.getElementById('pdfFrame');
  const viewerInfo = document.getElementById('viewerInfo');
  const splash = document.getElementById('splash');
  const splashTitle = document.getElementById('splashTitle');
  const splashLabel = document.getElementById('splashLabel');
  const mask = document.querySelector('.iframe-mask');
  const resourcePanel = document.querySelector('.resource-panel');
  const VIEWED_KEY = 'viewerHistory';
  const COLLAPSE_KEY = 'sidebarCollapsed';

  if (!titleEl || !descEl || !cardContainer) {
    return;
  }

  setupSidebarToggle();

  function showSplash(label) {
    if (!splash || !splashTitle || !splashLabel) {
      return;
    }
    splashLabel.textContent = 'Welcome Ace Student';
    splashTitle.textContent = `Let's practice ${label}`;
    splash.classList.remove('hidden');
    clearTimeout(showSplash.timeoutId);
    showSplash.timeoutId = setTimeout(() => {
      splash.classList.add('hidden');
    }, 1500);
  }

  function unlockViewer() {
    const code = prompt('Ingresa el código para desbloquear:');
    if (code && code.trim() === 'acelingua!') {
      if (mask) mask.classList.add('unlocked');
      alert('Visor desbloqueado. Puedes interactuar con el PDF.');
    } else if (code !== null) {
      alert('Código incorrecto.');
    }
  }

  if (mask) {
    mask.addEventListener('click', unlockViewer);
  }

  function readCollapsePreference() {
    try {
      return localStorage.getItem(COLLAPSE_KEY);
    } catch (err) {
      return null;
    }
  }

  function writeCollapsePreference(collapsed) {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? 'true' : 'false');
    } catch (err) {
      // ignore when storage is unavailable
    }
  }

  function setupSidebarToggle() {
    if (!resourcePanel || !document.body) {
      return;
    }

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = [
      'sidebar-toggle',
      'group',
      'inline-flex',
      'items-center',
      'gap-3',
      'rounded-2xl',
      'border',
      'border-slate-200/80',
      'bg-white/80',
      'px-4',
      'py-3',
      'text-left',
      'text-slate-700',
      'font-semibold',
      'shadow-lg',
      'shadow-blue-100/80',
      'transition',
      'duration-200',
      'hover:-translate-y-0.5',
      'hover:bg-white/90',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-blue-500',
    ].join(' ');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Ocultar panel lateral');
    toggle.title = 'Ocultar panel lateral';
    toggle.innerHTML = `
      <span class="toggle-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="presentation" focusable="false">
          <path d="M4 6.75h9.5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M4 12h9.5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M4 17.25h9.5" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
          <path d="M16.25 8l3 4-3 4" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </span>
      <span class="toggle-label">
        <span class="toggle-title">Panel lateral</span>
        <span class="toggle-state">Ocultar panel</span>
      </span>
    `;

    resourcePanel.insertBefore(toggle, resourcePanel.firstChild);
    const stateEl = toggle.querySelector('.toggle-state');

    const storedValue = readCollapsePreference();
    let hasStoredPreference = storedValue !== null;
    const mq = typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 900px)')
      : null;
    let collapsed = storedValue === 'true';
    if (!hasStoredPreference && mq && mq.matches) {
      collapsed = true;
    }

    function applyCollapseState(nextCollapsed) {
      document.body.classList.toggle('sidebar-collapsed', nextCollapsed);
      toggle.setAttribute('aria-expanded', String(!nextCollapsed));
      toggle.classList.toggle('is-collapsed', nextCollapsed);
      const labelText = nextCollapsed ? 'Mostrar panel' : 'Ocultar panel';
      if (stateEl) {
        stateEl.textContent = labelText;
      }
      const helperText = nextCollapsed ? 'Mostrar panel lateral' : 'Ocultar panel lateral';
      toggle.setAttribute('aria-label', helperText);
      toggle.title = helperText;
    }

    applyCollapseState(collapsed);

    toggle.addEventListener('click', () => {
      collapsed = !collapsed;
      applyCollapseState(collapsed);
      hasStoredPreference = true;
      writeCollapsePreference(collapsed);
    });

    if (mq) {
      const handleMqChange = (event) => {
        if (hasStoredPreference) {
          return;
        }
        collapsed = event.matches;
        applyCollapseState(collapsed);
      };

      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', handleMqChange);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(handleMqChange);
      }
    }
  }

  function normalizePdfUrl(url) {
    if (!url) return null;
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    return url;
  }

  function loadPdf(url, title) {
    const src = normalizePdfUrl(url);
    if (!src || !frame) return;
    frame.src = src;
    if (viewerInfo) {
      viewerInfo.textContent = `Mostrando: ${title}`;
    }
  }

  function getLinkId(link, resourceTitle, index) {
    if (!link) {
      return `${resourceTitle || 'recurso'}-${index}`;
    }
    return link.id || link.uid || link.url || `${resourceTitle || 'recurso'}-${index}`;
  }

  const viewedDocs = new Set(readViewedDocs());
  let totalDocs = 0;
  let currentDocIds = new Set();

  function readViewedDocs() {
    try {
      const data = JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }

  function writeViewedDocs() {
    try {
      localStorage.setItem(VIEWED_KEY, JSON.stringify([...viewedDocs]));
    } catch (err) {
      // ignore
    }
  }

  function updateProgress() {
    if (!resourcePanel) return;
    let shell = resourcePanel.querySelector('.resource-progress');
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'resource-progress';
      shell.innerHTML = `
        <div class="progress-meta">
          <div class="progress-info">
            <span class="progress-label">Seguimiento</span>
            <span class="progress-detail"></span>
          </div>
          <span class="progress-count"></span>
        </div>
        <div class="progress-shell"><span></span></div>
      `;
      resourcePanel.insertBefore(shell, resourcePanel.querySelector('.resource-board'));
    }
    const detailEl = shell.querySelector('.progress-detail');
    const countEl = shell.querySelector('.progress-count');
    const bar = shell.querySelector('.progress-shell span');
    const relevantIds = [...currentDocIds];
    const total = relevantIds.length || totalDocs;
    const viewed = relevantIds.filter((id) => viewedDocs.has(id)).length;
    const percent = total > 0 ? Math.round((viewed / total) * 100) : 0;
    if (countEl) countEl.textContent = `${percent}%`;
    if (detailEl) detailEl.textContent = `${viewed} de ${total} vistos`;
    if (bar) bar.style.setProperty('--progress', `${percent}%`);
  }

  function setDocSeen(id, seen = true) {
    if (!id) return;
    if (seen) {
      viewedDocs.add(id);
    } else {
      viewedDocs.delete(id);
    }
    writeViewedDocs();
    updateProgress();
  }

  function createLinkItem(link, index, resourceTitle) {
    const wrapper = document.createElement('div');
    wrapper.className = 'link-item';
    const linkId = getLinkId(link, resourceTitle, index);
    const hasUrl = Boolean(link && link.url);
    if (hasUrl) {
      currentDocIds.add(linkId);
      totalDocs = currentDocIds.size;
    }
    const isSeen = viewedDocs.has(linkId);

    const titleText = link && link.titulo ? link.titulo : `Recurso ${index + 1}`;
    const content = document.createElement('div');
    content.className = 'link-content';

    const heading = document.createElement('h4');
    heading.textContent = titleText;

    const titleBlock = document.createElement('div');
    titleBlock.className = 'link-title-block';
    titleBlock.appendChild(heading);

    const statusRow = document.createElement('div');
    statusRow.className = 'link-status-row';

    const checkLabel = document.createElement('label');
    checkLabel.className = 'resource-check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isSeen;
    checkbox.setAttribute('aria-label', `Marcar ${titleText} como visto`);
    const indicator = document.createElement('span');
    indicator.className = 'check-indicator';
    indicator.setAttribute('aria-hidden', 'true');

    const checkText = document.createElement('span');
    checkText.className = 'check-text';

    checkLabel.appendChild(checkbox);
    checkLabel.appendChild(indicator);
    statusRow.appendChild(checkLabel);
    statusRow.appendChild(checkText);
    titleBlock.appendChild(statusRow);

    content.appendChild(titleBlock);
    wrapper.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'link-actions';
    wrapper.appendChild(actions);

    const syncCheckState = (checked) => {
      wrapper.classList.toggle('is-seen', checked);
      indicator.classList.toggle('is-checked', checked);
      checkText.textContent = checked ? 'Visto' : 'Pendiente';
    };
    syncCheckState(isSeen);

    checkbox.addEventListener('change', () => {
      const next = checkbox.checked;
      syncCheckState(next);
      setDocSeen(linkId, next);
    });

    if (link.url) {
      const viewBtn = document.createElement('button');
      viewBtn.className = 'resource-action primary';
      viewBtn.type = 'button';
      viewBtn.title = 'Ver en visor';
      viewBtn.setAttribute('aria-label', `Ver ${titleText} en visor`);
      viewBtn.innerHTML = `
        <span class="btn-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <path d="M2 12s2.7-6 10-6 10 6 10 6-2.7 6-10 6-10-6-10-6Z" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
            <circle cx="12" cy="12" r="2.5" stroke-width="1.6"></circle>
          </svg>
        </span>
      `;
      viewBtn.addEventListener('click', () => {
        loadPdf(link.url, titleText);
        if (!checkbox.checked) {
          checkbox.checked = true;
          syncCheckState(true);
        }
        setDocSeen(linkId, true);
      });
      actions.appendChild(viewBtn);
    }

    if (link.url3) {
      const yt = document.createElement('a');
      yt.className = 'resource-action secondary';
      yt.textContent = 'Video';
      yt.href = link.url3;
      yt.title = 'Abrir video';
      yt.setAttribute('aria-label', `Abrir video de ${titleText}`);
      yt.target = '_blank';
      yt.rel = 'noopener';
      actions.appendChild(yt);
    }

    if (link.url4) {
      const extra = document.createElement('a');
      extra.className = 'resource-action secondary';
      extra.textContent = 'Recurso extra';
      extra.href = link.url4;
      extra.title = 'Abrir recurso externo';
      extra.setAttribute('aria-label', `Abrir recurso adicional de ${titleText}`);
      extra.target = '_blank';
      extra.rel = 'noopener';
      actions.appendChild(extra);
    }

    return wrapper;
  }

  function renderAccordion(data) {
    cardContainer.innerHTML = '';
    const accordionCards = [];
    totalDocs = 0;
    currentDocIds = new Set();

    data.forEach((resource, index) => {
      const card = document.createElement('details');
      card.className = 'resource-card';
      if (index === 0) {
        card.open = true;
        card.classList.add('active');
      }

      const summary = document.createElement('summary');
      summary.className = 'resource-summary';

      const summaryText = document.createElement('div');
      summaryText.className = 'summary-text';

      const counter = document.createElement('span');
      counter.className = 'summary-count';
      counter.textContent = `Bloque ${index + 1}`;
      summaryText.appendChild(counter);

      const header = document.createElement('div');
      header.className = 'summary-header';

      const title = document.createElement('h3');
      title.textContent = resource.title;
      header.appendChild(title);

      const subtitle = document.createElement('span');
      subtitle.className = 'summary-subtitle';
      subtitle.textContent = resource.subtitle || 'Actividad guiada';
      header.appendChild(subtitle);

      const metaRow = document.createElement('div');
      metaRow.className = 'summary-meta';

      const metaInfo = document.createElement('span');
      metaInfo.textContent = resource.dateAdded || 'Roadmap general';
      metaRow.appendChild(metaInfo);

      summaryText.appendChild(header);
      summaryText.appendChild(metaRow);

      summary.appendChild(summaryText);

      const body = document.createElement('div');
      body.className = 'accordion-body';

      const linksWrapper = document.createElement('div');
      linksWrapper.className = 'link-grid';
      (resource.enlaces || []).forEach((link, linkIndex) => {
        const item = createLinkItem(link, linkIndex, resource.title);
        if (item) {
          linksWrapper.appendChild(item);
        }
      });
      body.appendChild(linksWrapper);

      card.appendChild(summary);
      card.appendChild(body);
      cardContainer.appendChild(card);
      accordionCards.push(card);
    });
    totalDocs = currentDocIds.size;
    updateProgress();

    accordionCards.forEach((card) => {
      card.addEventListener('toggle', () => {
        if (card.open) {
          card.classList.add('active');
          accordionCards.forEach((other) => {
            if (other !== card) {
              other.open = false;
              other.classList.remove('active');
            }
          });
        } else {
          card.classList.remove('active');
        }
      });
    });
  }

  function initializeView(config) {
    if (!config || !Array.isArray(config.data)) {
      return;
    }

    if (config.key) {
      document.body.dataset.view = config.key;
    }

    showSplash(config.label || '');
    titleEl.textContent = config.label || 'Vista';
    descEl.textContent = config.description || '';
    if (viewerInfo && config.viewerMessage) {
      viewerInfo.textContent = config.viewerMessage;
    }

    renderAccordion(config.data);
  }

  window.initializeView = initializeView;
})();






