-- CreateEnum
CREATE TYPE "TypeVoyageur" AS ENUM ('couple', 'famille', 'solo', 'business', 'groupe', 'autre');

-- CreateEnum
CREATE TYPE "TypePension" AS ENUM ('none', 'breakfast', 'half_board', 'full_board', 'all_inclusive');

-- CreateEnum
CREATE TYPE "TypeService" AS ENUM ('journalier', 'sejour', 'unitaire', 'par_personne');

-- CreateTable
CREATE TABLE "role" (
    "id_role" SERIAL NOT NULL,
    "code_role" VARCHAR(20) NOT NULL,
    "nom_role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "statut" (
    "id_statut" SERIAL NOT NULL,
    "nom_statut" VARCHAR(50) NOT NULL,
    "description_statut" TEXT,
    "couleur" VARCHAR(20) NOT NULL DEFAULT 'gray',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statut_pkey" PRIMARY KEY ("id_statut")
);

-- CreateTable
CREATE TABLE "adresse_user" (
    "id_adress_user" SERIAL NOT NULL,
    "rue_user" VARCHAR(255),
    "complement_user" VARCHAR(255),
    "code_postal_user" VARCHAR(10),
    "ville_user" VARCHAR(100),
    "pays_user" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adresse_user_pkey" PRIMARY KEY ("id_adress_user")
);

-- CreateTable
CREATE TABLE "utilisateur" (
    "id_user" SERIAL NOT NULL,
    "nom_user" VARCHAR(100) NOT NULL,
    "prenom_user" VARCHAR(100) NOT NULL,
    "email_user" VARCHAR(255) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "tel_user" VARCHAR(20),
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_role" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "email_verifie" BOOLEAN NOT NULL DEFAULT false,
    "derniere_connexion" TIMESTAMP(3),
    "id_adress_user" INTEGER,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "hotel" (
    "id_hotel" SERIAL NOT NULL,
    "hotel_id_api" VARCHAR(100),
    "nom_hotel" VARCHAR(255) NOT NULL,
    "description_hotel" TEXT,
    "rue_hotel" VARCHAR(255),
    "code_postal_hotel" VARCHAR(10),
    "ville_hotel" VARCHAR(100) NOT NULL,
    "pays_hotel" VARCHAR(100) NOT NULL,
    "tel_hotel" VARCHAR(20),
    "email_hotel" VARCHAR(255),
    "site_web_hotel" VARCHAR(255),
    "img_hotel" VARCHAR(500),
    "nbre_etoile_hotel" SMALLINT,
    "note_moy_hotel" DECIMAL(3,1),
    "nbre_avis_hotel" INTEGER NOT NULL DEFAULT 0,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "date_scraping" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "search_vector" tsvector,

    CONSTRAINT "hotel_pkey" PRIMARY KEY ("id_hotel")
);

-- CreateTable
CREATE TABLE "hotel_amenities" (
    "id_room_amenities" SERIAL NOT NULL,
    "id_hotel" INTEGER NOT NULL,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "restaurant" BOOLEAN NOT NULL DEFAULT false,
    "climatisation" BOOLEAN NOT NULL DEFAULT false,
    "non_fumeur" BOOLEAN NOT NULL DEFAULT false,
    "pet_allowed" BOOLEAN NOT NULL DEFAULT false,
    "wi_fi" BOOLEAN NOT NULL DEFAULT false,
    "television" BOOLEAN NOT NULL DEFAULT false,
    "mini_bar" BOOLEAN NOT NULL DEFAULT false,
    "coffre_fort" BOOLEAN NOT NULL DEFAULT false,
    "piscine" BOOLEAN NOT NULL DEFAULT false,
    "spa" BOOLEAN NOT NULL DEFAULT false,
    "salle_sport" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hotel_amenities_pkey" PRIMARY KEY ("id_room_amenities")
);

-- CreateTable
CREATE TABLE "chambre" (
    "id_chambre" SERIAL NOT NULL,
    "room_id_api" VARCHAR(100),
    "id_hotel" INTEGER NOT NULL,
    "type_room" VARCHAR(100) NOT NULL,
    "cat_room" VARCHAR(50),
    "type_lit" VARCHAR(100),
    "nbre_lit" SMALLINT,
    "nbre_adults_max" INTEGER NOT NULL,
    "nbre_children_max" INTEGER NOT NULL DEFAULT 0,
    "surface_m2" INTEGER,
    "vue" VARCHAR(100),
    "description_room" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chambre_pkey" PRIMARY KEY ("id_chambre")
);

-- CreateTable
CREATE TABLE "offre" (
    "id_offre" SERIAL NOT NULL,
    "offre_id_api" VARCHAR(100),
    "id_hotel" INTEGER NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "nom_offre" VARCHAR(100) NOT NULL,
    "prix_nuit" DECIMAL(10,2) NOT NULL,
    "devise" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "conditions_annulation" TEXT,
    "delai_annulation_gratuite" INTEGER,
    "frais_annulation" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "remboursable" BOOLEAN NOT NULL DEFAULT true,
    "petit_dejeuner_inclus" BOOLEAN NOT NULL DEFAULT false,
    "pension" "TypePension" NOT NULL DEFAULT 'none',
    "description_offre" TEXT,
    "date_scraping" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offre_pkey" PRIMARY KEY ("id_offre")
);

-- CreateTable
CREATE TABLE "avis" (
    "id_avis" SERIAL NOT NULL,
    "id_hotel" INTEGER NOT NULL,
    "id_user" INTEGER,
    "pseudo_user" VARCHAR(100) NOT NULL,
    "note" DECIMAL(3,1) NOT NULL,
    "titre_avis" VARCHAR(255),
    "commentaire" TEXT,
    "date_avis" DATE,
    "pays_origine" VARCHAR(3),
    "type_voyageur" "TypeVoyageur" NOT NULL DEFAULT 'autre',
    "langue" VARCHAR(2) NOT NULL DEFAULT 'fr',
    "date_scraping" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id_avis")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id_reservation" SERIAL NOT NULL,
    "booking_id_api" VARCHAR(100),
    "id_offre" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_hotel" INTEGER NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "id_paiement" INTEGER,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "nbre_nuits" INTEGER NOT NULL,
    "nbre_adults" INTEGER NOT NULL,
    "nbre_children" INTEGER NOT NULL DEFAULT 0,
    "ages_children" VARCHAR(50),
    "prix_nuit" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "devise" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "special_requests" TEXT,
    "num_confirmation" VARCHAR(50),
    "provider_reference" VARCHAR(100),
    "cancel_deadline" TIMESTAMP(3),
    "id_statut" INTEGER,
    "price" DECIMAL(10,2),
    "taxes" DECIMAL(10,2),
    "date_reservation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id_reservation")
);

-- CreateTable
CREATE TABLE "paiement" (
    "id_paiement" SERIAL NOT NULL,
    "id_offre" INTEGER,
    "id_user" INTEGER NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "devise" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "methode_paiement" VARCHAR(50),
    "statut_paiement" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "reference_externe" VARCHAR(100),
    "date_paiement" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiement_pkey" PRIMARY KEY ("id_paiement")
);

-- CreateTable
CREATE TABLE "services_additionnels" (
    "id_service" SERIAL NOT NULL,
    "nom_service" VARCHAR(100) NOT NULL,
    "description_service" TEXT,
    "type_service" "TypeService" NOT NULL DEFAULT 'sejour',
    "icone_service" VARCHAR(50),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_additionnels_pkey" PRIMARY KEY ("id_service")
);

-- CreateTable
CREATE TABLE "hotel_services" (
    "id_hotel_service" SERIAL NOT NULL,
    "id_hotel" INTEGER NOT NULL,
    "id_service" INTEGER NOT NULL,
    "prix" DECIMAL(10,2) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotel_services_pkey" PRIMARY KEY ("id_hotel_service")
);

-- CreateTable
CREATE TABLE "reservation_services" (
    "id_reservation_service" SERIAL NOT NULL,
    "id_reservation" INTEGER NOT NULL,
    "id_hotel_service" INTEGER NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 1,
    "prix_unitaire" DECIMAL(10,2) NOT NULL,
    "sous_total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_services_pkey" PRIMARY KEY ("id_reservation_service")
);

-- CreateTable
CREATE TABLE "favori" (
    "id_favori" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_hotel" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favori_pkey" PRIMARY KEY ("id_favori")
);

-- CreateTable
CREATE TABLE "img_hotel" (
    "id_img_hotel" SERIAL NOT NULL,
    "id_hotel" INTEGER NOT NULL,
    "url_img" VARCHAR(500) NOT NULL,
    "alt_img" VARCHAR(255),
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "img_hotel_pkey" PRIMARY KEY ("id_img_hotel")
);

-- CreateTable
CREATE TABLE "img_chambre" (
    "id_img_chambre" SERIAL NOT NULL,
    "id_chambre" INTEGER NOT NULL,
    "url_img" VARCHAR(500) NOT NULL,
    "alt_img" VARCHAR(255),
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "img_chambre_pkey" PRIMARY KEY ("id_img_chambre")
);

-- CreateTable
CREATE TABLE "messages_contact" (
    "id_message" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "sujet" VARCHAR(255),
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "date_envoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_contact_pkey" PRIMARY KEY ("id_message")
);

-- CreateTable
CREATE TABLE "password_reset" (
    "id_reset" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id_reset")
);

-- CreateIndex
CREATE UNIQUE INDEX "role_code_role_key" ON "role"("code_role");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_user_key" ON "utilisateur"("email_user");

-- CreateIndex
CREATE INDEX "hotel_ville_hotel_idx" ON "hotel"("ville_hotel");

-- CreateIndex
CREATE INDEX "hotel_pays_hotel_idx" ON "hotel"("pays_hotel");

-- CreateIndex
CREATE INDEX "hotel_note_moy_hotel_idx" ON "hotel"("note_moy_hotel" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "hotel_amenities_id_hotel_key" ON "hotel_amenities"("id_hotel");

-- CreateIndex
CREATE INDEX "chambre_id_hotel_idx" ON "chambre"("id_hotel");

-- CreateIndex
CREATE INDEX "offre_id_hotel_idx" ON "offre"("id_hotel");

-- CreateIndex
CREATE INDEX "offre_id_chambre_idx" ON "offre"("id_chambre");

-- CreateIndex
CREATE INDEX "avis_id_hotel_idx" ON "avis"("id_hotel");

-- CreateIndex
CREATE INDEX "avis_note_idx" ON "avis"("note" DESC);

-- CreateIndex
CREATE INDEX "reservation_id_user_idx" ON "reservation"("id_user");

-- CreateIndex
CREATE INDEX "reservation_id_hotel_idx" ON "reservation"("id_hotel");

-- CreateIndex
CREATE INDEX "reservation_date_reservation_idx" ON "reservation"("date_reservation" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "hotel_services_id_hotel_id_service_key" ON "hotel_services"("id_hotel", "id_service");

-- CreateIndex
CREATE UNIQUE INDEX "favori_id_user_id_hotel_key" ON "favori"("id_user", "id_hotel");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_key" ON "password_reset"("token");

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "role"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur" ADD CONSTRAINT "utilisateur_id_adress_user_fkey" FOREIGN KEY ("id_adress_user") REFERENCES "adresse_user"("id_adress_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_amenities" ADD CONSTRAINT "hotel_amenities_id_hotel_fkey" FOREIGN KEY ("id_hotel") REFERENCES "hotel"("id_hotel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chambre" ADD CONSTRAINT "chambre_id_hotel_fkey" FOREIGN KEY ("id_hotel") REFERENCES "hotel"("id_hotel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offre" ADD CONSTRAINT "offre_id_hotel_fkey" FOREIGN KEY ("id_hotel") REFERENCES "hotel"("id_hotel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offre" ADD CONSTRAINT "offre_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "chambre"("id_chambre") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_id_hotel_fkey" FOREIGN KEY ("id_hotel") REFERENCES "hotel"("id_hotel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilisateur"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_id_offre_fkey" FOREIGN KEY ("id_offre") REFERENCES "offre"("id_offre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilisateur"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_id_hotel_fkey" FOREIGN KEY ("id_hotel") REFERENCES "hotel"("id_hotel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "chambre"("id_chambre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_id_paiement_fkey" FOREIGN KEY ("id_paiement") REFERENCES "paiement"("id_paiement") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_id_statut_fkey" FOREIGN KEY ("id_statut") REFERENCES "statut"("id_statut") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_id_offre_fkey" FOREIGN KEY ("id_offre") REFERENCES "offre"("id_offre") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilisateur"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_services" ADD CONSTRAINT "hotel_services_id_hotel_fkey" FOREIGN KEY ("id_hotel") REFERENCES "hotel"("id_hotel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_services" ADD CONSTRAINT "hotel_services_id_service_fkey" FOREIGN KEY ("id_service") REFERENCES "services_additionnels"("id_service") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_services" ADD CONSTRAINT "reservation_services_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "reservation"("id_reservation") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_services" ADD CONSTRAINT "reservation_services_id_hotel_service_fkey" FOREIGN KEY ("id_hotel_service") REFERENCES "hotel_services"("id_hotel_service") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favori" ADD CONSTRAINT "favori_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favori" ADD CONSTRAINT "favori_id_hotel_fkey" FOREIGN KEY ("id_hotel") REFERENCES "hotel"("id_hotel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "img_hotel" ADD CONSTRAINT "img_hotel_id_hotel_fkey" FOREIGN KEY ("id_hotel") REFERENCES "hotel"("id_hotel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "img_chambre" ADD CONSTRAINT "img_chambre_id_chambre_fkey" FOREIGN KEY ("id_chambre") REFERENCES "chambre"("id_chambre") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "utilisateur"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
