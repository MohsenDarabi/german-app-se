#!/usr/bin/env node

/**
 * Generate Asset Registry from Multimedia Task Files
 *
 * Reads all A1-*.json, A2-*.json, B1-*.json, B2-*.json task files
 * and creates a centralized asset registry organized by concept
 */

const fs = require('fs');
const path = require('path');

const TASKS_DIR = path.join(__dirname, '../docs/multimedia-tasks');
const OUTPUT_FILE = path.join(__dirname, 'media-data/asset-registry.json');

// Category mappings based on keywords in descriptions
const categoryKeywords = {
  transport: ['U-Bahn', 'S-Bahn', 'Bus', 'Taxi', 'Zug', 'ICE', 'Straßenbahn', 'tram', 'Fahrrad', 'bicycle', 'Auto', 'car', 'Flughafen', 'airport', 'Haltestelle', 'transit', 'commute', 'train', 'station', 'Gleis', 'platform', 'delay', 'Verspätung', 'airplane', 'Flugzeug', 'landing', 'takeoff', 'luggage', 'Gepäck', 'Handgepäck'],
  food: ['Brot', 'bread', 'Obst', 'fruit', 'Gemüse', 'vegetable', 'Fleisch', 'meat', 'Restaurant', 'Speisekarte', 'menu', 'Frühstück', 'breakfast', 'Getränk', 'drink', 'Koch', 'cook', 'Supermarkt', 'lecker', 'Essen', 'food', 'dinner', 'lunch', 'waiter', 'tip'],
  places: ['Bahnhof', 'Apotheke', 'pharmacy', 'Bank', 'Krankenhaus', 'hospital', 'Marktplatz', 'Museum', 'Post', 'Supermarkt', 'Rathaus', 'town hall', 'city', 'Stadt', 'building'],
  greetings: ['greeting', 'handshake', 'hello', 'Hallo', 'goodbye', 'wave', 'introduction', 'vorstellen', 'Begrüßung'],
  people: ['hair', 'Haar', 'eyes', 'Augen', 'tall', 'short', 'groß', 'klein', 'glasses', 'Brille', 'beard', 'Bart', 'portrait', 'person', 'jung', 'alt', 'young', 'elderly', 'lockig', 'curly', 'glatt', 'straight'],
  weather: ['sunny', 'sonnig', 'cloudy', 'bewölkt', 'rain', 'Regen', 'snow', 'Schnee', 'hot', 'heiß', 'cold', 'kalt', 'Frühling', 'spring', 'Sommer', 'summer', 'Herbst', 'autumn', 'Winter', 'season', 'windig', 'neblig', 'stürmisch', 'weather', 'Wetter'],
  'daily-life': ['alarm', 'waking', 'breakfast', 'work', 'desk', 'lunch', 'dinner', 'bed', 'evening', 'morning', 'routine', 'Tagesablauf', 'schedule', 'clock', 'time'],
  family: ['family', 'Familie', 'mother', 'Mutter', 'father', 'Vater', 'parents', 'Eltern', 'siblings', 'brother', 'sister', 'grandparents', 'Großeltern', 'Bruder', 'Schwester'],
  professions: ['doctor', 'Arzt', 'teacher', 'Lehrer', 'engineer', 'Ingenieur', 'office', 'Büro', 'student', 'Student', 'chef', 'Koch', 'nurse', 'Krankenpfleger', 'job', 'profession', 'Beruf', 'workplace', 'colleague', 'Kollege', 'meeting', 'Besprechung', 'project manager'],
  hobbies: ['reading', 'Lesen', 'sports', 'Sport', 'music', 'Musik', 'cooking', 'Kochen', 'travel', 'Reisen', 'gaming', 'Spielen', 'hobby', 'Hobby', 'hiking', 'Wandern', 'climbing', 'Klettern', 'relaxing', 'entspannen', 'Freizeit', 'leisure'],
  furniture: ['sofa', 'Sofa', 'table', 'Tisch', 'chair', 'Stuhl', 'bed', 'Bett', 'wardrobe', 'Schrank', 'lamp', 'Lampe', 'furniture', 'Möbel', 'room', 'Zimmer', 'bedroom', 'kitchen', 'living'],
  bathroom: ['bathroom', 'Badezimmer', 'toothbrush', 'Zähne', 'shower', 'duschen', 'sink', 'mirror', 'Spiegel', 'towel', 'Handtuch', 'soap', 'shampoo', 'hygiene'],
  directions: ['direction', 'Richtung', 'left', 'links', 'right', 'rechts', 'straight', 'geradeaus', 'corner', 'Ecke', 'intersection', 'Kreuzung', 'traffic light', 'Ampel', 'walking', 'Fuß', 'map', 'navigate'],
  emotions: ['happy', 'glücklich', 'sad', 'traurig', 'tired', 'müde', 'sick', 'krank', 'cheerful', 'fröhlich', 'stress', 'emotion', 'feeling', 'Gefühl'],
  grammar: ['grammar', 'Grammatik', 'diagram', 'chart', 'article', 'Artikel', 'gender', 'educational', 'dativ', 'Dativ', 'adjective'],
  health: ['health', 'Gesundheit', 'headache', 'Kopfschmerzen', 'fever', 'Fieber', 'medicine', 'Medikament', 'doctor', 'patient', 'symptom', 'ambulance', 'Krankenwagen', 'hospital', 'fit', 'fitness', 'gym', 'Fitnessstudio', 'healthy', 'gesund'],
  technology: ['phone', 'Handy', 'smartphone', 'computer', 'laptop', 'internet', 'app', 'screen', 'Bildschirm', 'keyboard', 'Tastatur', 'battery', 'Akku', 'email', 'E-Mail', 'technology', 'digital'],
  media: ['news', 'Nachrichten', 'newspaper', 'Zeitung', 'TV', 'television', 'Fernsehen', 'radio', 'Radio', 'podcast', 'Podcast', 'streaming', 'Tagesschau', 'media'],
  celebrations: ['birthday', 'Geburtstag', 'party', 'Feier', 'invitation', 'Einladung', 'gift', 'Geschenk', 'guest', 'Gast', 'celebrate', 'feiern'],
  holidays: ['Christmas', 'Weihnachten', 'Easter', 'Ostern', 'New Year', 'Silvester', 'carnival', 'Karneval', 'festival', 'Fest', 'holiday', 'Feiertag', 'fireworks', 'Feuerwerk', 'costume', 'Kostüm', 'Weihnachtsmarkt'],
  travel: ['vacation', 'Urlaub', 'trip', 'Reise', 'sightseeing', 'tourist', 'beach', 'Strand', 'Meer', 'sea', 'mountain', 'Berg', 'Italy', 'Italien', 'Spain', 'Spanien', 'photography', 'fotografieren']
};

// Generate asset ID from description
function generateAssetId(description, type, existingIds) {
  // Extract key words for ID
  const words = description
    .toLowerCase()
    .replace(/[^a-zA-Z0-9äöüß\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .slice(0, 3)
    .join('-');

  let baseId = `${type === 'video' ? 'vid' : 'img'}-${words}`;
  baseId = baseId.replace(/[äöüß]/g, c => ({ä:'ae', ö:'oe', ü:'ue', ß:'ss'}[c]));

  // Ensure uniqueness
  let id = baseId;
  let counter = 1;
  while (existingIds.has(id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }

  return id;
}

// Determine category from description
function determineCategory(description, stepType) {
  const lowerDesc = description.toLowerCase();

  // Check stepType hints
  if (stepType === 'grammar-tip') return 'grammar';

  // Check keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return 'misc';
}

// Generate shared path from category
function generatePath(category, assetId, format) {
  const baseDir = format === 'mp4' ? 'videos' : 'images';
  return `/${baseDir}/shared/${category}/${assetId}.${format}`;
}

// Main function
function generateRegistry() {
  const taskFiles = fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.json') && (f.startsWith('A1-') || f.startsWith('A2-') || f.startsWith('B1-') || f.startsWith('B2-')));

  const registry = {
    version: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    assets: {},
    categories: {}
  };

  const existingIds = new Set();

  // Process each task file
  for (const file of taskFiles) {
    const filePath = path.join(TASKS_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
      continue;
    }

    const lessonId = data.lessonId;

    for (const task of data.tasks || []) {
      const category = determineCategory(task.description, task.stepType);
      const format = task.specs?.format || (task.type === 'video' ? 'mp4' : 'jpg');
      const assetId = generateAssetId(task.description, task.type, existingIds);
      existingIds.add(assetId);

      // Create asset entry
      registry.assets[assetId] = {
        id: assetId,
        type: task.type,
        category: category,
        path: generatePath(category, assetId, format),
        description: task.description,
        tags: [category, data.lessonId.split('-')[0], task.stepType].filter(Boolean),
        specs: task.specs || {},
        usedIn: [{
          lessonId: lessonId,
          stepId: task.stepId,
          taskId: task.id,
          context: task.context || ''
        }],
        originalTaskFile: file,
        createdAt: new Date().toISOString().split('T')[0],
        status: task.status || 'pending'
      };

      // Add to category index
      if (!registry.categories[category]) {
        registry.categories[category] = [];
      }
      registry.categories[category].push(assetId);
    }
  }

  // Write registry
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2));

  // Summary
  const stats = {
    totalAssets: Object.keys(registry.assets).length,
    images: Object.values(registry.assets).filter(a => a.type === 'image').length,
    videos: Object.values(registry.assets).filter(a => a.type === 'video').length,
    categories: Object.keys(registry.categories).length
  };

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('       ASSET REGISTRY GENERATED');
  console.log('═══════════════════════════════════════════════════════\n');
  console.log(`  Total Assets:  ${stats.totalAssets}`);
  console.log(`  ├── Images:    ${stats.images}`);
  console.log(`  └── Videos:    ${stats.videos}\n`);
  console.log('  Categories:');
  for (const [cat, assets] of Object.entries(registry.categories)) {
    console.log(`    ${cat}: ${assets.length} assets`);
  }
  console.log(`\n  Output: ${OUTPUT_FILE}\n`);
}

generateRegistry();
