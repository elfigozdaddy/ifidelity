// brands.js - Database curato dei brand
// Puoi estendere questo oggetto o in futuro scaricarlo da un repository GitHub (Raw JSON)

export const BRAND_PRESETS = {
  eurospin: {
    id: 'eurospin',
    name: 'Eurospin',
    colors: ['#003399', '#001A4D'],
    textColor: '#FFFFFF',
    // Logo specifico verificato (può essere un URL diretto o un file locale)
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Eurospin_logo.svg/512px-Eurospin_logo.svg.png',
    keywords: ['eurospin', 'euro spin'],
  },
  coop: {
    id: 'coop',
    name: 'Coop',
    colors: ['#E30613', '#900008'],
    textColor: '#FFFFFF',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Coop_italia_logo.svg/512px-Coop_italia_logo.svg.png',
    keywords: ['coop', 'ipercoop', 'incoop'],
  },
  conad: {
    id: 'conad',
    name: 'Conad',
    colors: ['#FFD600', '#E65100'],
    textColor: '#000000',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Logo_Conad.svg/512px-Logo_Conad.svg.png',
    keywords: ['conad', 'conad city', 'spazio conad'],
  },
  esselunga: {
    id: 'esselunga',
    name: 'Esselunga',
    colors: ['#004B87', '#001A35'],
    textColor: '#FFFFFF',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Esselunga_logo.svg/512px-Esselunga_logo.svg.png',
    keywords: ['esselunga'],
  },
  lidl: {
    id: 'lidl',
    name: 'Lidl',
    colors: ['#0050AA', '#E30613'],
    textColor: '#FFFFFF',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lidl-Logo.svg/512px-Lidl-Logo.svg.png',
    keywords: ['lidl'],
  },
  decathlon: {
    id: 'decathlon',
    name: 'Decathlon',
    colors: ['#0082C3', '#003E6B'],
    textColor: '#FFFFFF',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Decathlon_Logo.svg/512px-Decathlon_Logo.svg.png',
    keywords: ['decathlon'],
  },
  ikea: {
    id: 'ikea',
    name: 'IKEA',
    colors: ['#0051BA', '#FFDA1A'],
    textColor: '#FFFFFF',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ikea_logo.svg/512px-Ikea_logo.svg.png',
    keywords: ['ikea'],
  }
};

/**
 * Funzione di ricerca intelligente nei preset locali
 */
export const findBrandPreset = (inputName) => {
  if (!inputName) return null;
  const cleanInput = inputName.trim().toLowerCase();

  // 1. Controllo diretto per chiave
  if (BRAND_PRESETS[cleanInput]) {
    return BRAND_PRESETS[cleanInput];
  }

  // 2. Controllo per keywords/alias
  for (const key in BRAND_PRESETS) {
    const brand = BRAND_PRESETS[key];
    if (brand.keywords && brand.keywords.some(k => cleanInput.includes(k) || k.includes(cleanInput))) {
      return brand;
    }
  }

  return null;
};