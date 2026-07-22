// FILE GENERATO AUTOMATICAMENTE - NON MODIFICARE MANUALMENTE
export const LOCAL_LOGOS = {
  'h&m': require('./H&M.png'),
  'h&m': require('./h&m.svg'),
  'hm': require('./HM.png'),
  'hm': require('./HM.svg'),
  'starbucks': require('./starbucks.png'),
  'starbucks': require('./starbucks.svg'),
};

export const getLocalLogo = (brandName) => {
  if (!brandName) return null;
  const cleanKey = brandName.trim().toLowerCase().replace(/\s+/g, '');
  return LOCAL_LOGOS[cleanKey] || null;
};

export const ALL_LOGOS = [
  { id: 'h&m', name: 'H&M', image: require('./H&M.png') },
  { id: 'h&m', name: 'h&m', image: require('./h&m.svg') },
  { id: 'hm', name: 'HM', image: require('./HM.png') },
  { id: 'hm', name: 'HM', image: require('./HM.svg') },
  { id: 'starbucks', name: 'starbucks', image: require('./starbucks.png') },
  { id: 'starbucks', name: 'starbucks', image: require('./starbucks.svg') },
];
