-- DropIndex
DROP INDEX "public"."Admin_roomName_key";

-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
