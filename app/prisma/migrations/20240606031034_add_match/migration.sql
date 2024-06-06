-- CreateTable
CREATE TABLE "matchs" (
    "id" SERIAL NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "duration" TIMESTAMP(3),
    "room_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matchs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_matchs" (
    "user_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_matchs_pkey" PRIMARY KEY ("user_id","match_id")
);

-- AddForeignKey
ALTER TABLE "matchs" ADD CONSTRAINT "matchs_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_matchs" ADD CONSTRAINT "users_matchs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_matchs" ADD CONSTRAINT "users_matchs_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matchs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
