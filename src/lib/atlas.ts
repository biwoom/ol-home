import fs from 'node:fs';
import path from 'node:path';

interface AtlasBuild {
  fileName: string;
  filePath: string;
  version: string;
  fileBytes: number;
  fileSize: string;
}

const atlasFilePattern = /^ol-atlas_v(.+)\.html$/;

function compareVersions(a: string, b: string): number {
  const aParts = a.split(/[.-]/).map(part => Number.parseInt(part, 10) || 0);
  const bParts = b.split(/[.-]/).map(part => Number.parseInt(part, 10) || 0);
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return a.localeCompare(b);
}

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getLatestAtlasBuild(): AtlasBuild {
  const latestDir = path.join(process.cwd(), 'public/atlas/latest');
  const matches = fs.existsSync(latestDir)
    ? fs.readdirSync(latestDir)
      .map(fileName => {
        const match = fileName.match(atlasFilePattern);
        return match ? { fileName, version: match[1] } : null;
      })
      .filter((item): item is { fileName: string; version: string } => Boolean(item))
      .sort((a, b) => compareVersions(b.version, a.version))
    : [];

  const latest = matches[0] ?? { fileName: 'ol-atlas.html', version: '0.0.0' };
  const filePath = `/atlas/latest/${latest.fileName}`;
  const diskPath = path.join(latestDir, latest.fileName);
  const fileBytes = fs.existsSync(diskPath) ? fs.statSync(diskPath).size : 0;

  return {
    fileName: latest.fileName,
    filePath,
    version: latest.version,
    fileBytes,
    fileSize: formatBytes(fileBytes),
  };
}
