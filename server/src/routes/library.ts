import { Router } from "express";
import { prisma } from "./db.js";
import { scanFolder } from "../services/scanner.js";

export const libraryRouter = Router();

libraryRouter.post("/scan", async (_req, res) => {
  const dir = process.env.MUSIC_DIR;
  if (!dir) return res.status(500).json({ error: "MUSIC_DIR not set" });
  try {
    res.json(await scanFolder(dir));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scan failed" });
  }
});

libraryRouter.get("/tracks", async (_req, res) => {
  const tracks = await prisma.track.findMany({ orderBy: { title: "asc" } });
  res.json(tracks);
});

libraryRouter.get("/duplicates", async (_req, res) => {
  const groups = await prisma.track.groupBy({
    by: ["matchKey"],
    where: { matchKey: { not: null } },
    having: { matchKey: { _count: { gt: 1 } } },
  });
  const keys = groups.map((g) => g.matchKey!);
  const tracks = await prisma.track.findMany({
    where: { matchKey: { in: keys } },
    orderBy: { matchKey: "asc" },
  });
  res.json(tracks);
});