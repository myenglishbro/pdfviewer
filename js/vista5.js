(() => {
  const extraData = [
    {
      id: 1,
      title: 'Exam Strategy Toolkit',
      subtitle: 'Planning',
      dateAdded: 'Full Exam',
      channel: 'RoadB2C',
      description: 'Checklist general de repaso semanal.',
      enlaces: [
        {
          titulo: 'Weekly Planner',
          descripcion: 'Documento imprimible con objetivos diarios.',
          url: 'https://gahp.net/wp-content/uploads/2017/09/sample.pdf',
        },
      ],
    },
  ];

  window.initializeView({
    key: 'vista5',
    label: 'Extra Recursos',
    description: 'Herramientas adicionales para reforzar cada skill.',
    viewerMessage: 'Descarga recursos extra para tu plan.',
    data: extraData,
  });
})();
