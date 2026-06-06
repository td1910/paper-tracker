/*
  Warnings:

  - The primary key for the `Favorite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `paperId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Favorite` table. All the data in the column will be lost.
  - The primary key for the `PaperTopic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `paperId` on the `PaperTopic` table. All the data in the column will be lost.
  - You are about to drop the column `topicId` on the `PaperTopic` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Topic` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `fk_paperId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fk_userId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fk_paperId` to the `PaperTopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fk_topicId` to the `PaperTopic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fk_userId` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Favorite" (
    "fk_userId" TEXT NOT NULL,
    "fk_paperId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("fk_userId", "fk_paperId"),
    CONSTRAINT "Favorite_fk_userId_fkey" FOREIGN KEY ("fk_userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_fk_paperId_fkey" FOREIGN KEY ("fk_paperId") REFERENCES "Paper" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Favorite" ("createdAt") SELECT "createdAt" FROM "Favorite";
DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE TABLE "new_PaperTopic" (
    "fk_paperId" INTEGER NOT NULL,
    "fk_topicId" INTEGER NOT NULL,

    PRIMARY KEY ("fk_paperId", "fk_topicId"),
    CONSTRAINT "PaperTopic_fk_paperId_fkey" FOREIGN KEY ("fk_paperId") REFERENCES "Paper" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaperTopic_fk_topicId_fkey" FOREIGN KEY ("fk_topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
DROP TABLE "PaperTopic";
ALTER TABLE "new_PaperTopic" RENAME TO "PaperTopic";
CREATE TABLE "new_Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "fk_userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Topic_fk_userId_fkey" FOREIGN KEY ("fk_userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Topic" ("createdAt", "id", "keywords", "name") SELECT "createdAt", "id", "keywords", "name" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "passwordHash") SELECT "createdAt", "email", "id", "passwordHash" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
