// generateLogos.js
const fs = require('fs');
const path = require('path');

const LOGOS_DIR = path.join(__dirname, 'assets', 'logos');
const OUTPUT_FILE = path.join(LOGOS_DIR, 'logosIndex.js');

if (!fs.existsSync(LOGOS_DIR)) {
  console.log('Cartella logos non trovata.');
  process.exit(0);
}

// Legge tutti i file immagine nella cartella assets/logos
const files = fs.readdirSync(LOGOS_DIR).filter(file => {
  return /\.(png|jpe?g|svg)$/i.test(file) && file !== 'logosIndex.js';
});

let imports = '';
let dictionaryEntries = '';
let arrayEntries = '';

files.forEach((file) => {
  const nameWithoutExt = path.parse(file).name;
  // Key pulita in minuscolo (es. "Starbucks" -> "starbucks")
  const key = nameWithoutExt.trim().toLowerCase().replace(/\s+/g, '');

  dictionaryEntries += `  '${key}': require('./${file}'),\n`;
  arrayEntries += `  { id: '${key}', name: '${nameWithoutExt}', image: require('./${file}') },\n`;
});

const content = `// FILE GENERATO AUTOMATICAMENTE - NON MODIFICARE MANUALMENTE
export const LOCAL_LOGOS = {
${dictionaryEntries}};

export const getLocalLogo = (brandName) => {
  if (!brandName) return null;
  const cleanKey = brandName.trim().toLowerCase().replace(/\\s+/g, '');
  return LOCAL_LOGOS[cleanKey] || null;
};

export const ALL_LOGOS = [
${arrayEntries}];
`;

fs.writeFileSync(OUTPUT_FILE, content);
console.log(`✅ logosIndex.js generato con successo! (${files.length} loghi trovati)`);