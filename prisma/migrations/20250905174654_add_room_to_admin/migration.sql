/*
  Warnings:

  - A unique constraint covering the columns `[roomName]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomName` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "roomName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_roomName_key" ON "public"."Admin"("roomName");
