/*
  Warnings:

  - You are about to drop the column `assigned_at` on the `users_rooms` table. All the data in the column will be lost.
  - Changed the type of `status` on the `rooms` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "suit" AS ENUM ('CLUBS', 'HEARTS', 'SPADES', 'DIAMONDS');

-- CreateEnum
CREATE TYPE "room_status" AS ENUM ('WAITING', 'STARTED', 'FINISHED');

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_owner_id_fkey";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "status",
ADD COLUMN     "status" "room_status" NOT NULL;

-- AlterTable
ALTER TABLE "users_rooms" DROP COLUMN "assigned_at";

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "suit" "suit" NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Play" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,

    CONSTRAINT "Play_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_value_key" ON "Card"("value");

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
