/*
  Warnings:

  - A unique constraint covering the columns `[filePath]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Track" ADD COLUMN "filePath" TEXT;
ALTER TABLE "Track" ADD COLUMN "fileSize" INTEGER;
ALTER TABLE "Track" ADD COLUMN "matchKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Track_filePath_key" ON "Track"("filePath");

-- CreateIndex
CREATE INDEX "Track_matchKey_idx" ON "Track"("matchKey");
