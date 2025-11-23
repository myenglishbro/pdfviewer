(() => {
  const DATA_URL = '../assets/data/test-center.json';
  const menuEl = document.getElementById('tcMenu');
  const itemsEl = document.getElementById('tcItems');
  const labelEl = document.getElementById('tcCategoryLabel');
  const titleEl = document.getElementById('tcCategoryTitle');
  const descEl = document.getElementById('tcCategoryDesc');

  let categories = [];
  let activeId = null;

  fetch(DATA_URL)
    .then((res) => res.json())
    .then((data) => {
      categories = Array.isArray(data?.categories) ? data.categories : [];
      renderMenu(categories);
      if (categories.length > 0) {
        setActive(categories[0].id);
      } else {
        renderEmpty('No hay categorías disponibles.');
      }
    })
    .catch(() => {
      renderEmpty('No se pudo cargar el Test Center. Verifica el archivo JSON.');
    });

  function renderMenu(list) {
    if (!menuEl) return;
    menuEl.innerHTML = '';
    list.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tc-btn';
      btn.dataset.categoryId = cat.id;
      btn.innerHTML = `
        <span>${cat.title}</span>
        <span class="tag">${(cat.items?.length || 0)} items</span>
      `;
      btn.addEventListener('click', () => setActive(cat.id));
      menuEl.appendChild(btn);
    });
  }

  function setActive(id) {
    activeId = id;
    const cat = categories.find((entry) => entry.id === id);
    document.querySelectorAll('.tc-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.categoryId === id);
    });
    if (!cat) {
      renderEmpty('Selecciona una categoría para ver ejercicios.');
      return;
    }
    if (labelEl) labelEl.textContent = cat.title || 'Categoría';
    if (titleEl) titleEl.textContent = cat.title || 'Categoría';
    if (descEl) descEl.textContent = cat.description || '';
    renderItems(cat.items || []);
  }

  function renderItems(items) {
    if (!itemsEl) return;
    if (!items || items.length === 0) {
      renderEmpty('Sin ejercicios cargados para esta categoría.');
      return;
    }
    itemsEl.innerHTML = '';
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'item-card';
      const type = item.type ? item.type.toString().toUpperCase() : 'EJERCICIO';
      const duration = item.duration ? String(item.duration) : '';
      const notes = Array.isArray(item.notes) ? item.notes : [];

      card.innerHTML = `
        <div class="item-header">
          <h3 style="margin:0 0 4px; font-size:1.05rem;">${item.title || 'Ejercicio'}</h3>
          <div class="item-meta">
            <span class="pill">${type}</span>
            ${duration ? `<span>${duration}</span>` : ''}
          </div>
        </div>
      `;

      const actions = document.createElement('div');
      actions.className = 'item-actions';
      if (item.link) {
        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'Abrir recurso';
        actions.appendChild(link);
      }

      if (notes.length > 0) {
        const list = document.createElement('ul');
        list.className = 'notes';
        notes.forEach((note) => {
          const li = document.createElement('li');
          li.textContent = note;
          list.appendChild(li);
        });
        card.appendChild(list);
      }

      if (actions.children.length > 0) {
        card.appendChild(actions);
      }

      itemsEl.appendChild(card);
    });
  }

  function renderEmpty(message) {
    if (!itemsEl) return;
    itemsEl.innerHTML = `<div class="empty-state">${message}</div>`;
  }
})();
