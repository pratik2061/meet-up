/*
  Warnings:

  - You are about to drop the `userProfile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[profileImageId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "userProfile" DROP CONSTRAINT "userProfile_userId_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "profileImageId" TEXT;

-- DropTable
DROP TABLE "userProfile";

-- CreateTable
CREATE TABLE "image" (
    "id" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profileImageId_key" ON "user"("profileImageId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
