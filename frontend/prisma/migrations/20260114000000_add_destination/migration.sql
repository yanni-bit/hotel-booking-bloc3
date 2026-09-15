-- CreateTable
CREATE TABLE IF NOT EXISTS "destination" (
    "id_destination" SERIAL NOT NULL,
    "nom_ville" VARCHAR(100) NOT NULL,
    "nom_pays" VARCHAR(100) NOT NULL,
    "url_image" VARCHAR(500) NOT NULL,
    "badge" VARCHAR(20),
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destination_pkey" PRIMARY KEY ("id_destination")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "destination_nom_ville_key" ON "destination"("nom_ville");