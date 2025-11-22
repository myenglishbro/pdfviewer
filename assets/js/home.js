(() => {
  const modal = document.getElementById('loginModal');
  const form = document.getElementById('loginForm');
  const closeTargets = document.querySelectorAll('[data-login-close]');
  const loginCard = document.querySelector('.login-card');
  const errorBox = document.getElementById('loginError');
  const successBox = document.getElementById('loginSuccess');
  const submitBtn = document.getElementById('loginSubmit');
  const submitLabel = submitBtn?.querySelector('.login-submit-label');
  const spinner = submitBtn?.querySelector('.login-spinner');
  const userInput = document.getElementById('loginUser');
  const passInput = document.getElementById('loginPass');
  const campusLinks = document.querySelectorAll('[data-campus-target]');
  const passwordToggle = document.getElementById('passwordToggle');
  const capsWarning = document.getElementById('capsWarning');
  const DEFAULT_URL = 'vista 1/index.html';
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const userDirectory =
    Array.isArray(window.campusUsers) && window.campusUsers.length > 0
      ? window.campusUsers
      : [{ username: 'myenglishbro', password: 'acelingua', role: 'demo' }];
  const validateUser =
    typeof window.findCampusUser === 'function'
      ? window.findCampusUser
      : (username, password) => {
          const normalize = (value) => (value || '').trim().toLowerCase();
          const user = normalize(username);
          const pass = (password || '').trim();
          return (
            userDirectory.find(
              (entry) =>
                normalize(entry.username) === user &&
                (entry.password || '').trim() === pass
            ) || null
          );
        };
  let targetUrl = DEFAULT_URL;

  if (!modal || !form || !userInput || !passInput || !submitBtn) {
    return;
  }

  const openModal = (destination) => {
    targetUrl = destination || DEFAULT_URL;
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    window.setTimeout(() => userInput.focus(), 50);
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    form.reset();
    errorBox.textContent = '';
    successBox.textContent = '';
    if (capsWarning) {
      capsWarning.textContent = '';
    }
    passInput.type = 'password';
    if (passwordToggle) {
      passwordToggle.textContent = 'Mostrar';
    }
    setLoadingState(false);
  };

  const setLoadingState = (isLoading) => {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitLabel && (submitLabel.textContent = 'Validando...');
      spinner?.classList.add('visible');
    } else {
      submitLabel && (submitLabel.textContent = 'Entrar');
      spinner?.classList.remove('visible');
    }
  };

  const triggerShake = () => {
    if (!loginCard) return;
    loginCard.classList.remove('shake');
    void loginCard.offsetWidth;
    loginCard.classList.add('shake');
  };

  campusLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const destination = link.dataset.campusTarget || link.getAttribute('href') || DEFAULT_URL;
      openModal(destination);
    });
  });

  closeTargets.forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  passwordToggle?.addEventListener('click', () => {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    passwordToggle.textContent = isHidden ? 'Ocultar' : 'Mostrar';
  });

  const handleCapsWarning = (event) => {
    if (!capsWarning) return;
    const isCapsOn = event.getModifierState && event.getModifierState('CapsLock');
    capsWarning.textContent = isCapsOn ? 'Bloq Mayus activado' : '';
  };

  passInput.addEventListener('keydown', handleCapsWarning);
  passInput.addEventListener('keyup', handleCapsWarning);
  passInput.addEventListener('blur', () => {
    capsWarning.textContent = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = userInput.value.trim();
    const password = passInput.value.trim();

    const match = validateUser(username, password);

    if (match) {
      errorBox.textContent = '';
      successBox.textContent = 'Acceso verificado. Cargando tu vista personalizada...';
      setLoadingState(true);
      setTimeout(() => {
        window.location.href = match.target || match.url || targetUrl;
      }, 900);
    } else {
      successBox.textContent = '';
      errorBox.textContent = 'Usuario o contrasena incorrectos. Hint: revisa la guia de onboarding';
      triggerShake();
      setLoadingState(false);
    }
  });

  // Toggle menú móvil del header
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = !mobileNav.classList.contains('hidden');
      mobileNav.classList.toggle('hidden');
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Cerrar al hacer click en cualquier link dentro del menú
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.add('hidden');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
