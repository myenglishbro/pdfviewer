(() => {
  const defaultReadingData = [
    {
      id: 1,
      title: 'Complete First Reading Worksheet 1',
      subtitle: 'Reading',
      dateAdded: 'Practice Pack',
      channel: ' ',
      description: 'Completa los desafios para dominar el Ingles',
      enlaces: [
        {
          titulo: 'Reading Worksheet 1',
          descripcion: '',
          url: 'https://drive.google.com/file/d/1skyBIxAWdIbCVZuGMMqHQZuE8FRWvD3T/view?usp=sharing',
        },
      ],
    },
    {
      id: 2,
      title: 'Complete First Reading Worksheet 2',
      subtitle: 'Reading',
      dateAdded: 'Practice Pack',
      channel: ' ',
      description: 'Completa los desafios para dominar el Ingles',
      enlaces: [
        {
          titulo: 'Reading Worksheet 2',
          descripcion: '',
          url: 'https://drive.google.com/file/d/1s2Ate5_0px6Kjr-bQ4hNGvDxpzxQUD0x/view?usp=sharing',
        },
      ],
    },
    {
      id: 3,
      title: 'Complete First Reading Worksheet 3',
      subtitle: 'Reading',
      dateAdded: 'Practice Pack',
      channel: '2025',
      description: 'Completa los desafios para dominar el Ingles',
      enlaces: [
        {
          titulo: 'Reading Worksheet 3',
          descripcion: '',
          url: 'https://drive.google.com/file/d/1dUBuDdBpLSjXs9ktXmuYAvy39Rj73xQU/view?usp=sharing',
        },
      ],
    },
    {
      id: 4,
      title: 'Complete First Reading Worksheet 4',
      subtitle: 'Reading',
      dateAdded: 'Practice Pack',
      channel: 'ACE',
      description: 'Completa los desafios para dominar el Ingles',
      enlaces: [
        {
          titulo: 'Reading Worksheet 4',
          descripcion: '',
          url: 'https://drive.google.com/file/d/1lhiUqfC9dJ-RpzlLZNFixylhCD9BARJi/view?usp=sharing',
        },
      ],
    },
    {
      id: 5,
      title: 'Complete First Reading Worksheet 5',
      subtitle: 'Reading',
      dateAdded: 'Practice Pack',
      channel: 'ACE',
      description: 'Completa los desafios para dominar el Ingles',
      enlaces: [
        {
          titulo: 'Reading Worksheet 5',
          descripcion: '',
          url: 'https://drive.google.com/file/d/1oLhcH8uUW3846NsUN43uleaKVMeTAlTF/view?usp=sharing',
        },
      ],
    },
    {
      id: 6,
      title: 'Complete First Reading Worksheet 6',
      subtitle: 'Reading',
      dateAdded: 'Practice Pack',
      channel: 'ACE',
      description: 'Completa los desafios para dominar el Ingles',
      enlaces: [
        {
          titulo: 'Reading Worksheet 6',
          descripcion: '',
          url: 'https://drive.google.com/file/d/1aWFRrOjSV35bo5QWNikmwA57wwZ7H59E/view?usp=sharing',
        },
      ],
    },
  ];

  const recursosData = Array.isArray(window.readingResourcesData)
    ? window.readingResourcesData
    : defaultReadingData;

  window.initializeView({
    key: 'vista1',
    label: 'Reading',
    description: 'Roadmap general con recursos de lectura B2/C1.',
    viewerMessage: 'Elige un recurso para visualizarlo.',
    data: recursosData,
  });
})();
