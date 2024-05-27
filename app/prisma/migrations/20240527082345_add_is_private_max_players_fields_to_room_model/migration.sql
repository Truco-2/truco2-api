-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "is_private" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_players" INTEGER NOT NULL DEFAULT 2;
