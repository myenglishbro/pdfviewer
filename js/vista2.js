(() => {
  const writingData = [
    {
      id: 1,
      title: 'Writing Mastery Pack',
      subtitle: 'Writing',
      dateAdded: 'Writing 02',
      channel: 'ACE',
      description: 'Plantillas y ejemplos reales para cada parte del examen.',
      enlaces: [
        {
          titulo: 'B2 First Writing Answer Sheet',
          descripcion: '',
          url: 'https://drive.google.com/file/d/1R9uFFckCWdYTdGE0DM6hvhJNAK1iNmBe/view?usp=sharing',
        },
        {
          titulo: 'Test and Train Practice Test 1',
          descripcion: ' ',
          url: 'https://drive.google.com/file/d/1sjMYn3QOvLrDBrtYTpIIyMWIV3qUZFTe/view?usp=sharing',
        },
        {
          titulo: 'Test _ Train Practice Test 1 B2 First Writing',
          descripcion: ' ',
          url: 'https://drive.google.com/file/d/1T3Mrm8qUHNBDnbv82NfJNWoXRmIOIWdL/view?usp=sharing',
        },
      ],
    },
  ];

  window.initializeView({
    key: 'vista2',
    label: 'Writing',
    description: 'Practicas y plantillas para escribir con confianza.',
    viewerMessage: 'Selecciona un PDF para empezar a escribir.',
    data: writingData,
  });
})();
