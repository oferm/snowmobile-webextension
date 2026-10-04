const fs = require('node:fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const manifestPath = 'manifest.json';
const manifest = fs.readFileSync(manifestPath, 'utf8');
const updatedManifest = manifest.replace(
  /("version"\s*:\s*)"[^"]+"/,
  `$1"${packageJson.version}"`,
);

if (updatedManifest === manifest) {
  throw new Error('Could not find the version field in manifest.json.');
}

fs.writeFileSync(manifestPath, updatedManifest);
console.log(`Synchronized manifest.json to ${packageJson.version}`);
