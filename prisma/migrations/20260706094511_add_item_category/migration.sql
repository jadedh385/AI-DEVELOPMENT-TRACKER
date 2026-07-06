/*
  Warnings:

  - Added the required column `category` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "summary" TEXT,
    "author" TEXT,
    "platform" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dedupeHash" TEXT NOT NULL,
    CONSTRAINT "Item_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("author", "canonicalUrl", "category", "dedupeHash", "fetchedAt", "id", "platform", "publishedAt", "sourceId", "summary", "title") SELECT i."author", i."canonicalUrl", COALESCE(s."category", 'community'), i."dedupeHash", i."fetchedAt", i."id", i."platform", i."publishedAt", i."sourceId", i."summary", i."title" FROM "Item" i LEFT JOIN "Source" s ON i."sourceId" = s."id";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_dedupeHash_key" ON "Item"("dedupeHash");
CREATE INDEX "Item_sourceId_idx" ON "Item"("sourceId");
CREATE INDEX "Item_publishedAt_idx" ON "Item"("publishedAt");
CREATE INDEX "Item_platform_idx" ON "Item"("platform");
CREATE INDEX "Item_category_idx" ON "Item"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
