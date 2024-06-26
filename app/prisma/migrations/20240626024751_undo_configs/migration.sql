/*
  Warnings:

  - The `status` column on the `rooms` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `card` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `play` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "play" DROP CONSTRAINT "play_card_id_fkey";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "status",
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "card";

-- DropTable
DROP TABLE "play";

-- DropEnum
DROP TYPE "room_status";

-- DropEnum
DROP TYPE "suit";
