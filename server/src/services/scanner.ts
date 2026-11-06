import fs from "node:fs/promises";
import path from "node:path";
import { parseFile } from "music-metadata";
import { prisma } from '../routes/db.js';
import { makeMatchKey } from "../lib/match.js";

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.toLowerCase().endsWith(".mp3")) yield full;
  }
}

export async function scanFolder(dir: string) {
  let scanned = 0;
  let failed = 0;

  for await (const file of walk(dir)) {
    try {
      const [meta, stat] = await Promise.all([parseFile(file), fs.stat(file)]);
      const title = meta.common.title ?? path.basename(file, path.extname(file));
      const artists =
        meta.common.artists?.join(", ") ?? meta.common.artist ?? "Unknown Artist";

      const data = {
        title,
        artists,
        album: meta.common.album ?? null,
        durationMs: meta.format.duration
          ? Math.round(meta.format.duration * 1000)
          : null,
        fileSize: stat.size,
        matchKey: makeMatchKey(artists, title),
      };

      await prisma.track.upsert({
        where: { filePath: file },
        create: { ...data, filePath: file },
        update: data,
      });
      scanned++;
    } catch (err) {
      console.error("Scan failed for", file, err);
      failed++;
    }
  }
  return { scanned, failed };
}