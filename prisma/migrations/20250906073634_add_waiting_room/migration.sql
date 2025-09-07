-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "isWaitingRoomEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."WaitingUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" TEXT NOT NULL,

    CONSTRAINT "WaitingUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitingUser_username_roomName_key" ON "public"."WaitingUser"("username", "roomName");

-- AddForeignKey
ALTER TABLE "public"."WaitingUser" ADD CONSTRAINT "WaitingUser_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
