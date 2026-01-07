#!/usr/bin/env node
/**
 * Regenerate asset registry from ALL lesson content
 * - Dialog steps → scene images
 * - New-word steps → vocabulary images
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = 'content/de-fa/A1';
const REGISTRY_PATH = 'apps/web/src/lib/data/asset-registry.json';

// Category mapping for vocabulary
const CATEGORY_KEYWORDS = {
  'greetings': ['Hallo', 'Hi', 'Tschüss', 'Wiedersehen', 'Guten Tag', 'Guten Morgen', 'Guten Abend', 'Gute Nacht'],
  'numbers': ['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig', 'hundert', 'tausend', 'null'],
  'food': ['Kaffee', 'Tee', 'Wasser', 'Brot', 'Apfel', 'Frühstück', 'Mittagessen', 'Abendessen', 'essen', 'trinken', 'Croissant', 'Pizza', 'Salat', 'Suppe', 'Kuchen', 'Obst', 'Gemüse', 'Fleisch', 'Fisch', 'Reis', 'Nudeln', 'Käse', 'Butter', 'Milch', 'Saft', 'Bier', 'Wein', 'Cola', 'Restaurant', 'Café', 'Hunger', 'Durst'],
  'family': ['Mutter', 'Vater', 'Bruder', 'Schwester', 'Sohn', 'Tochter', 'Oma', 'Opa', 'Onkel', 'Tante', 'Cousin', 'Cousine', 'Kind', 'Kinder', 'Eltern', 'Familie', 'Großeltern', 'Enkel'],
  'places': ['Haus', 'Wohnung', 'Schule', 'Universität', 'Büro', 'Bahnhof', 'Flughafen', 'Krankenhaus', 'Apotheke', 'Supermarkt', 'Bank', 'Post', 'Kino', 'Theater', 'Museum', 'Park', 'Bibliothek', 'Kirche', 'Stadt', 'Dorf', 'Land', 'Straße'],
  'transport': ['Auto', 'Bus', 'Zug', 'U-Bahn', 'S-Bahn', 'Fahrrad', 'Taxi', 'Flugzeug', 'Schiff', 'fahren', 'fliegen'],
  'furniture': ['Tisch', 'Stuhl', 'Bett', 'Sofa', 'Schrank', 'Lampe', 'Fenster', 'Tür', 'Regal', 'Küche', 'Bad', 'Zimmer', 'Wohnzimmer', 'Schlafzimmer'],
  'people': ['Mann', 'Frau', 'Junge', 'Mädchen', 'Freund', 'Freundin', 'Kollege', 'Kollegin', 'Chef', 'Lehrer', 'Schüler', 'Student', 'Arzt', 'Kellner', 'Verkäufer'],
  'weather': ['Wetter', 'Sonne', 'Regen', 'Schnee', 'Wind', 'Wolke', 'warm', 'kalt', 'heiß', 'kühl', 'sonnig', 'regnerisch', 'bewölkt', 'Frühling', 'Sommer', 'Herbst', 'Winter', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  'daily-life': ['Tag', 'Morgen', 'Abend', 'Nacht', 'Woche', 'Monat', 'Jahr', 'heute', 'morgen', 'gestern', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag', 'Uhr', 'Zeit', 'Stunde', 'Minute', 'aufstehen', 'schlafen', 'arbeiten', 'Geburtstag', 'Wochenende'],
  'professions': ['Beruf', 'Arbeit', 'Ingenieur', 'Arzt', 'Lehrer', 'Architekt', 'Programmierer', 'Manager', 'Sekretär'],
  'hobbies': ['Sport', 'Musik', 'Fußball', 'Tennis', 'schwimmen', 'lesen', 'kochen', 'tanzen', 'singen', 'spielen', 'Gitarre', 'Klavier', 'Film', 'Buch', 'Hobby'],
  'expressions': ['ja', 'nein', 'danke', 'bitte', 'Entschuldigung', 'gut', 'schlecht', 'schön', 'toll', 'super', 'prima', 'okay', 'richtig', 'falsch', 'vielleicht', 'natürlich', 'gern', 'lieber', 'Freut mich'],
  'actions': ['machen', 'gehen', 'kommen', 'sehen', 'hören', 'sprechen', 'lesen', 'schreiben', 'lernen', 'verstehen', 'wissen', 'kennen', 'mögen', 'wollen', 'können', 'müssen', 'sollen', 'dürfen', 'haben', 'sein', 'werden', 'geben', 'nehmen', 'kaufen', 'bezahlen', 'kosten', 'brauchen'],
  'introductions': ['Name', 'heißen', 'kommen', 'wohnen', 'sprechen', 'Land', 'Sprache', 'Deutsch', 'Englisch', 'Persisch', 'Deutschland', 'Iran', 'Berlin', 'München', 'Wien']
};

function categorizeWord(word) {
  const wordLower = word.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (wordLower.includes(keyword.toLowerCase()) || word.includes(keyword)) {
        return category;
      }
    }
  }
  // Default category based on word characteristics
  if (word.match(/^(der|die|das) /)) return 'objects';
  if (word.match(/en$/)) return 'actions';
  return 'expressions';
}

function generateAssetId(lessonId, stepId, word) {
  // Clean word for ID
  const cleanWord = word
    .replace(/^(der|die|das) /, '')
    .replace(/[^a-zA-ZäöüÄÖÜß]/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20);
  return `img-${lessonId.toLowerCase()}-${stepId}-${cleanWord}`;
}

function main() {
  const assets = {};
  const categories = {};

  // Keep existing completed assets
  if (fs.existsSync(REGISTRY_PATH)) {
    const existing = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    for (const [id, asset] of Object.entries(existing.assets || {})) {
      if (asset.status === 'completed') {
        assets[id] = asset;
        const cat = asset.category || 'other';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(id);
      }
    }
  }

  // Scan all lessons
  const modules = fs.readdirSync(CONTENT_DIR).filter(d => d.startsWith('module-'));

  for (const mod of modules) {
    const modPath = path.join(CONTENT_DIR, mod);
    const files = fs.readdirSync(modPath).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const lessonPath = path.join(modPath, file);
      const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
      const lessonId = file.replace('.json', '');

      for (const step of (lesson.steps || [])) {
        // Handle new-word steps
        if (step.type === 'new-word' && step.word?.de) {
          const word = step.word.de;
          const category = categorizeWord(word);
          const assetId = generateAssetId(lessonId, step.id, word);

          // Skip if already exists
          if (assets[assetId]) continue;

          assets[assetId] = {
            id: assetId,
            type: 'image',
            category: category,
            path: `/images/shared/${category}/${assetId}.jpg`,
            description: `${word} - ${step.word.fa || ''}`,
            word: { de: word, fa: step.word.fa },
            tags: [category, 'A1', 'vocabulary'],
            specs: {
              dimensions: '400x300',
              format: 'jpg',
              style: 'clear, simple illustration'
            },
            usedIn: [{
              lessonId: lessonId,
              stepId: step.id,
              context: `Vocabulary: ${word}`
            }],
            status: 'pending',
            createdAt: new Date().toISOString().split('T')[0]
          };

          if (!categories[category]) categories[category] = [];
          categories[category].push(assetId);
        }

        // Handle dialog steps
        if (step.type === 'dialog' && step.lines?.length > 0) {
          const speakers = [...new Set(step.lines.map(l => l.speaker))];
          const speakerStr = speakers.join('-').toLowerCase().replace(/[^a-z-]/g, '');
          const assetId = `img-${lessonId.toLowerCase()}-${step.id}-${speakerStr}`;

          // Skip if already exists
          if (assets[assetId]) continue;

          const firstLine = step.lines[0]?.text?.de || '';
          const title = step.title || step.context || '';
          const category = speakers.some(s => ['Kellner', 'Verkäufer', 'Arzt'].includes(s)) ? 'scenes' : 'dialogs';

          assets[assetId] = {
            id: assetId,
            type: 'image',
            category: category,
            path: `/images/shared/${category}/${assetId}.jpg`,
            description: `${speakers.join(' & ')} - ${title}. Scene: "${firstLine.substring(0, 50)}"`,
            tags: [category, 'A1', 'dialog'],
            specs: {
              dimensions: '800x600',
              format: 'jpg',
              style: 'friendly, modern German setting'
            },
            usedIn: [{
              lessonId: lessonId,
              stepId: step.id,
              context: title
            }],
            speakers: speakers,
            status: 'pending',
            createdAt: new Date().toISOString().split('T')[0]
          };

          if (!categories[category]) categories[category] = [];
          categories[category].push(assetId);
        }
      }
    }
  }

  // Build registry
  const registry = {
    version: '3.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    generatedFrom: 'lesson content (vocabulary + dialogs)',
    assets: assets,
    categories: categories
  };

  // Write registry
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));

  // Stats
  const totalAssets = Object.keys(assets).length;
  const completed = Object.values(assets).filter(a => a.status === 'completed').length;
  const vocabAssets = Object.values(assets).filter(a => a.tags?.includes('vocabulary')).length;
  const dialogAssets = Object.values(assets).filter(a => a.tags?.includes('dialog')).length;

  console.log('✅ Regenerated asset registry');
  console.log(`   Total assets: ${totalAssets}`);
  console.log(`   - Vocabulary images: ${vocabAssets}`);
  console.log(`   - Dialog/scene images: ${dialogAssets}`);
  console.log(`   Completed: ${completed}`);
  console.log(`   Pending: ${totalAssets - completed}`);
  console.log('');
  console.log('Categories:');
  for (const [cat, ids] of Object.entries(categories).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`   ${cat}: ${ids.length}`);
  }
}

main();
