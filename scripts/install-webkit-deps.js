// Installs the Linux shared libraries Playwright's WebKit build needs but that
// are missing on Fedora (Playwright ships an Ubuntu build and only auto-installs
// deps on Ubuntu). Libraries are extracted from Ubuntu .deb packages with the
// plain `ar`/`tar` tools, so no root and no apt/dpkg are required.
//
// Safe to re-run: libraries that are already present are skipped.

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const UBUNTU_POOL = "http://archive.ubuntu.com/ubuntu/pool/main";

// Ubuntu packages that provide the missing libraries. Each entry lists a glob
// for the extracted library names and candidate .deb filenames.
const PACKAGES = [
  {
    name: "libicu74",
    dir: `${UBUNTU_POOL}/i/icu`,
    debs: ["libicu74_74.2-1ubuntu3.1_amd64.deb", "libicu74_74.2-1ubuntu3_amd64.deb"],
    libs: ["libicudata.so.74", "libicui18n.so.74", "libicuuc.so.74", "libicuio.so.74", "libicutu.so.74"],
  },
  {
    name: "libjpeg-turbo8",
    dir: `${UBUNTU_POOL}/libj/libjpeg-turbo`,
    debs: ["libjpeg-turbo8_2.1.5-2ubuntu2_amd64.deb", "libjpeg-turbo8_2.1.5-2ubuntu1.1_amd64.deb"],
    libs: ["libjpeg.so.8"],
  },
];

function browsersRoot() {
  return process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), ".cache", "ms-playwright");
}

function webkitDirs() {
  const root = browsersRoot();
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((name) => name.startsWith("webkit-"))
    .map((name) => path.join(root, name));
}

// WebKit's launcher scripts force LD_LIBRARY_PATH to these folders, so the
// libraries have to live next to the bundled ones.
function targetLibDirs(webkitDir) {
  return ["minibrowser-wpe", "minibrowser-gtk"]
    .map((flavour) => path.join(webkitDir, flavour, "sys", "lib"))
    .filter((dir) => fs.existsSync(dir));
}

function missingLibs(dirs, libs) {
  const missing = new Set();
  for (const dir of dirs) {
    for (const lib of libs) {
      if (fs.existsSync(path.join(dir, lib))) continue;
      missing.add(lib);
    }
  }
  return [...missing];
}

function download(url, dest) {
  execFileSync("curl", ["-fsSL", "-o", dest, url], { stdio: "inherit" });
}

function extractDeb(debFile, into) {
  // dpkg-deb is not available on Fedora, so unpack manually.
  execFileSync("sh", ["-c", `cd '${into}' && ar x '${debFile}'`]);
  const dataArchive = fs
    .readdirSync(into)
    .find((f) => f.startsWith("data.tar"));
  if (!dataArchive) throw new Error(`No data.tar in ${debFile}`);
  execFileSync("tar", ["-xf", path.join(into, dataArchive), "-C", into]);
}

function install() {
  const dirs = webkitDirs();
  if (dirs.length === 0) {
    console.error("No Playwright WebKit build found. Run: npx playwright install webkit");
    process.exitCode = 1;
    return;
  }

  const workDir = path.join(os.tmpdir(), "snowmobile-webkit-deps");
  fs.mkdirSync(workDir, { recursive: true });

  for (const pkg of PACKAGES) {
    const libDirs = dirs.flatMap(targetLibDirs);
    const missing = missingLibs(libDirs, pkg.libs);
    if (missing.length === 0) {
      console.log(`${pkg.name}: already installed`);
      continue;
    }

    const pkgDir = path.join(workDir, pkg.name);
    fs.rmSync(pkgDir, { recursive: true, force: true });
    fs.mkdirSync(pkgDir, { recursive: true });

    let extracted = false;
    for (const deb of pkg.debs) {
      try {
        const debFile = path.join(pkgDir, deb);
        console.log(`${pkg.name}: downloading ${deb}`);
        download(`${pkg.dir}/${deb}`, debFile);
        extractDeb(debFile, pkgDir);
        extracted = true;
        break;
      } catch (error) {
        console.warn(`${pkg.name}: ${deb} failed (${error.message.split("\n")[0]}), trying next`);
      }
    }
    if (!extracted) {
      throw new Error(`Could not download a ${pkg.name} package`);
    }

    const searchRoot = pkgDir;
    const copied = [];
    for (const lib of pkg.libs) {
      const match = findFile(searchRoot, lib);
      if (!match) continue;
      for (const dir of libDirs) {
        fs.copyFileSync(match, path.join(dir, lib));
      }
      copied.push(lib);
    }
    console.log(`${pkg.name}: installed ${copied.join(", ")}`);
  }

  console.log("WebKit dependencies ready.");
}

function findFile(root, name) {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(full, name);
      if (found) return found;
    } else if (entry.name === name) {
      return full;
    }
  }
  return null;
}

install();