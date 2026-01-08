import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const charactersDir = path.join(root, "content", "characters");
const outputPath = path.join(root, "apps", "web", "src", "lib", "data", "character-profiles.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

const profiles = {};

for (const entry of fs.readdirSync(charactersDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const profilePath = path.join(charactersDir, entry.name, "profile.json");
  if (!fs.existsSync(profilePath)) continue;
  const profile = readJson(profilePath);
  if (profile?.id) {
    profiles[profile.id] = profile;
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(profiles, null, 2) + "\n");

console.log(`Generated ${Object.keys(profiles).length} profiles -> ${outputPath}`);
