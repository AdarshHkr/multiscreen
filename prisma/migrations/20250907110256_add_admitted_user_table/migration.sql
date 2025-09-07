-- CreateTable
CREATE TABLE "public"."AdmittedUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmittedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdmittedUser_username_roomName_key" ON "public"."AdmittedUser"("username", "roomName");
