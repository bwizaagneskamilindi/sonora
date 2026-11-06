-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "spotifyId" TEXT,
    "name" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL
);
INSERT INTO "new_Playlist" ("id", "name", "snapshotId", "spotifyId") SELECT "id", "name", "snapshotId", "spotifyId" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE UNIQUE INDEX "Playlist_spotifyId_key" ON "Playlist"("spotifyId");
CREATE TABLE "new_Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "spotifyId" TEXT,
    "title" TEXT NOT NULL,
    "artists" TEXT NOT NULL,
    "album" TEXT,
    "durationMs" INTEGER NOT NULL,
    "isrc" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Track" ("album", "artists", "createdAt", "durationMs", "id", "isrc", "spotifyId", "title") SELECT "album", "artists", "createdAt", "durationMs", "id", "isrc", "spotifyId", "title" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_spotifyId_key" ON "Track"("spotifyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
