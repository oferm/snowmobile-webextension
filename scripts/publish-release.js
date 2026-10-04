const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: yarn publish-release <version> (for example: 1.4.0)');
  process.exit(1);
}

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });
const output = (command, args) => execFileSync(command, args, { encoding: 'utf8' }).trim();

if (output('git', ['status', '--porcelain'])) {
  console.error('Working tree is not clean. Commit or stash existing changes first.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.version = version;
fs.writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);

const manifestPath = 'manifest.json';
const manifest = fs.readFileSync(manifestPath, 'utf8');
const updatedManifest = manifest.replace(
  /("version"\s*:\s*)"[^"]+"/,
  `$1"${version}"`,
);

if (updatedManifest === manifest) {
  console.error('Could not find the version field in manifest.json.');
  process.exit(1);
}

fs.writeFileSync(manifestPath, updatedManifest);

run('yarn', ['lint']);
run('git', ['add', 'package.json', 'manifest.json']);
run('git', ['commit', '-m', `Release ${version}`]);
run('git', ['tag', `v${version}`]);
run('git', ['push', 'origin', 'HEAD', `v${version}`]);
run('gh', ['release', 'create', `v${version}`, '--title', `v${version}`, '--generate-notes']);
