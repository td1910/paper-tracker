/*
  Warnings:

  - The primary key for the `Favorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fk_paperId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `fk_userId` on the `Favorite` table. All the data in the column will be lost.
  - The primary key for the `PaperTopic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fk_paperId` on the `PaperTopic` table. All the data in the column will be lost.
  - You are about to drop the column `fk_topicId` on the `PaperTopic` table. All the data in the column will be lost.
  - You are about to drop the column `fk_userId` on the `Topic` table. All the data in the column will be lost.
  - Added the required column `fkPaperId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fkUserId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fkPaperId` to the `PaperTopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fkTopicId` to the `PaperTopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fkUserId` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Favorite" (
    "fkUserId" TEXT NOT NULL,
    "fkPaperId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("fkUserId", "fkPaperId"),
    CONSTRAINT "Favorite_fkUserId_fkey" FOREIGN KEY ("fkUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_fkPaperId_fkey" FOREIGN KEY ("fkPaperId") REFERENCES "Paper" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Favorite" ("createdAt") SELECT "createdAt" FROM "Favorite";
DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE TABLE "new_PaperTopic" (
    "fkPaperId" INTEGER NOT NULL,
    "fkTopicId" INTEGER NOT NULL,

    PRIMARY KEY ("fkPaperId", "fkTopicId"),
    CONSTRAINT "PaperTopic_fkPaperId_fkey" FOREIGN KEY ("fkPaperId") REFERENCES "Paper" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaperTopic_fkTopicId_fkey" FOREIGN KEY ("fkTopicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
DROP TABLE "PaperTopic";
ALTER TABLE "new_PaperTopic" RENAME TO "PaperTopic";
CREATE TABLE "new_Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "fkUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Topic_fkUserId_fkey" FOREIGN KEY ("fkUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Topic" ("createdAt", "id", "keywords", "name") SELECT "createdAt", "id", "keywords", "name" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
