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

  if (!titleEl || !descEl || !cardContainer) {
    return;
  }

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
    if (!mask) return;
    const code = prompt('Ingresa el código para desbloquear:');
    if (code && code.trim() === 'acelingua!') {
      mask.classList.add('unlocked');
      alert('Visor desbloqueado. Puedes interactuar con el PDF.');
    } else if (code !== null) {
      alert('Código incorrecto.');
    }
  }

  if (mask) {
    mask.addEventListener('click', unlockViewer);
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

  function createLinkItem(link) {
    const wrapper = document.createElement('div');
    wrapper.className = 'link-item';

    const icon = document.createElement('span');
    icon.className = 'link-icon';
    icon.textContent = '📄';
    wrapper.appendChild(icon);

    const content = document.createElement('div');
    content.className = 'link-content';

    const heading = document.createElement('h4');
    heading.textContent = link.titulo;
    content.appendChild(heading);

    if (link.descripcion) {
      const desc = document.createElement('p');
      desc.textContent = link.descripcion;
      content.appendChild(desc);
    }

    wrapper.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'link-actions';

    if (link.url) {
      const viewBtn = document.createElement('button');
      viewBtn.className = 'pill';
      viewBtn.type = 'button';
      viewBtn.title = 'Ver en visor';
      viewBtn.setAttribute('aria-label', `Ver ${link.titulo} en visor`);
      viewBtn.innerHTML = '<span aria-hidden="true">📄</span>';
      viewBtn.addEventListener('click', () => loadPdf(link.url, link.titulo));
      actions.appendChild(viewBtn);
    }

    if (link.url3) {
      const yt = document.createElement('a');
      yt.className = 'pill secondary';
      yt.innerHTML = '<span aria-hidden="true">▶️</span>';
      yt.href = link.url3;
      yt.title = 'Abrir video';
      yt.setAttribute('aria-label', `Abrir video de ${link.titulo}`);
      yt.target = '_blank';
      yt.rel = 'noopener';
      actions.appendChild(yt);
    }

    if (link.url4) {
      const extra = document.createElement('a');
      extra.className = 'pill secondary';
      extra.innerHTML = '<span aria-hidden="true">🔗</span>';
      extra.href = link.url4;
      extra.title = 'Abrir recurso externo';
      extra.setAttribute('aria-label', `Abrir recurso adicional de ${link.titulo}`);
      extra.target = '_blank';
      extra.rel = 'noopener';
      actions.appendChild(extra);
    }

    wrapper.appendChild(actions);
    return wrapper;
  }

  function renderAccordion(data) {
    cardContainer.innerHTML = '';
    const accordionCards = [];

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
      counter.textContent = `Recurso ${index + 1}`;
      summaryText.appendChild(counter);

      const header = document.createElement('h3');
      header.textContent = resource.title;
      summaryText.appendChild(header);

      const meta = document.createElement('div');
      meta.className = 'card-meta';
      meta.innerHTML = `
        <span>${resource.subtitle || ''}</span>
        <span>${resource.dateAdded || ''}</span>
        <span>${resource.channel || ''}</span>
      `;
      summaryText.appendChild(meta);

      const icon = document.createElement('span');
      icon.className = 'summary-icon';
      icon.innerHTML = '&#709;';

      summary.appendChild(summaryText);
      summary.appendChild(icon);

      const body = document.createElement('div');
      body.className = 'accordion-body';

      if (resource.description) {
        const desc = document.createElement('p');
        desc.className = 'card-desc';
        desc.textContent = resource.description;
        body.appendChild(desc);
      }

      const linksWrapper = document.createElement('div');
      linksWrapper.className = 'link-grid';
      (resource.enlaces || []).forEach((link) => {
        linksWrapper.appendChild(createLinkItem(link));
      });
      body.appendChild(linksWrapper);

      card.appendChild(summary);
      card.appendChild(body);
      cardContainer.appendChild(card);
      accordionCards.push(card);
    });

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
