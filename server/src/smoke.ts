import { prisma } from "./lib/prisma.js";

const data = { title: "Test Song", artists: "Test Artist", durationMs: 200000 };

for (let i = 0; i < 2; i++) {
  await prisma.track.upsert({
    where: { spotifyId: "test123" },
    update: data,
    create: { spotifyId: "test123", ...data },
  });
}

console.log("Tracks with that ID:", await prisma.track.count());

await prisma.track.deleteMany({ where: { spotifyId: "test123" } });
await prisma.$disconnect();