-- DropForeignKey
ALTER TABLE "public"."WaitingUser" DROP CONSTRAINT "WaitingUser_adminId_fkey";

-- AddForeignKey
ALTER TABLE "public"."WaitingUser" ADD CONSTRAINT "WaitingUser_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
