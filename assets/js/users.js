(() => {
  // Lista unica de usuarios autorizados y sus contrasenas.
  // Agrega, elimina o edita entradas aqui mismo.
  const campusUsers = [
    { username: 'myenglishbro', password: 'acelingua', role: 'demo' },
    // { username: 'usuario2', password: 'clave2', role: 'demo' },
    // { username: 'usuario3', password: 'clave3', role: 'coach' },
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
