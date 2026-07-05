-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1,
    "refreshFrequency" TEXT NOT NULL DEFAULT 'daily',
    "keywordFilters" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "qualityScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "summary" TEXT,
    "author" TEXT,
    "platform" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dedupeHash" TEXT NOT NULL,
    CONSTRAINT "Item_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'local',
    "reaction" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Source_status_idx" ON "Source"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Source_type_url_key" ON "Source"("type", "url");

-- CreateIndex
CREATE UNIQUE INDEX "Item_dedupeHash_key" ON "Item"("dedupeHash");

-- CreateIndex
CREATE INDEX "Item_sourceId_idx" ON "Item"("sourceId");

-- CreateIndex
CREATE INDEX "Item_publishedAt_idx" ON "Item"("publishedAt");

-- CreateIndex
CREATE INDEX "Item_platform_idx" ON "Item"("platform");

-- CreateIndex
CREATE INDEX "Feedback_itemId_idx" ON "Feedback"("itemId");

-- CreateIndex
CREATE INDEX "Feedback_reaction_idx" ON "Feedback"("reaction");
