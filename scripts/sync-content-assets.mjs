import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url).pathname;

const assetCollections = [
  { name: 'design', source: 'src/content/design', target: 'public/generated/design' },
  { name: 'story', source: 'src/content/story', target: 'public/generated/story' },
];

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findAssetDirs(baseDir) {
  const found = [];

  async function walk(currentDir, relativeDir = '') {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

      const absolute = path.join(currentDir, entry.name);
      const relative = path.join(relativeDir, entry.name);

      if (entry.name === 'assets') {
        found.push({ source: absolute, slug: relativeDir });
        continue;
      }

      await walk(absolute, relative);
    }
  }

  if (await pathExists(baseDir)) {
    await walk(baseDir);
  }

  return found;
}

for (const collection of assetCollections) {
  const sourceBase = path.join(root, collection.source);
  const targetBase = path.join(root, collection.target);

  await rm(targetBase, { recursive: true, force: true });
  await mkdir(targetBase, { recursive: true });

  for (const assetDir of await findAssetDirs(sourceBase)) {
    if (!assetDir.slug) {
      throw new Error(`${collection.name} assets directory must be inside an entry folder.`);
    }

    await cp(assetDir.source, path.join(targetBase, assetDir.slug), {
      recursive: true,
      force: true,
    });
  }
}
