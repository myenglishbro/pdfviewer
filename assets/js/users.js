(() => {
  // Lista unica de usuarios autorizados y sus contrasenas.
  // Agrega, elimina o edita entradas aqui mismo.
  const campusUsers = [
    { username: 'myenglishbro', password: 'acelingua', role: 'demo' },
     { username: 'zarela', password: 'cerdan', role: 'student' },
     { username: 'alhely', password: 'quispe', role: 'student' },
      { username: 'luis', password: 'amoreno', role: 'student' },
      { username: 'laxmi', password: 'aceb2', role: 'student' },
      { username: 'stephanie', password: 'carreño', role: 'student' },
      { username: 'cecilia', password: 'matta', role: 'student' },
       { username: 'maritza', password: 'aceb2', role: 'student' },
       { username: 'samantha', password: 'santa', role: 'student' },

  ];

  const normalize = (value) => (value || '').trim().toLowerCase();

  /**
   * Valida credenciales y devuelve el usuario encontrado o null.
   */
  const findUser = (username, password) => {
    const userNormalized = normalize(username);
    const pass = (password || '').trim();
    return (
      campusUsers.find(
        (user) =>
          normalize(user.username) === userNormalized &&
          (user.password || '') === pass
      ) || null
    );
  };

  window.campusUsers = campusUsers;
  window.findCampusUser = findUser;
})();
