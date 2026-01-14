-- Fonction pour mettre à jour le compteur d'avis
CREATE OR REPLACE FUNCTION update_hotel_avis_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hotel SET nbre_avis_hotel = nbre_avis_hotel + 1 WHERE id_hotel = NEW.id_hotel;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hotel SET nbre_avis_hotel = nbre_avis_hotel - 1 WHERE id_hotel = OLD.id_hotel;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur la table avis
DROP TRIGGER IF EXISTS trigger_update_avis_count ON avis;
CREATE TRIGGER trigger_update_avis_count
AFTER INSERT OR DELETE ON avis
FOR EACH ROW EXECUTE FUNCTION update_hotel_avis_count();

-- Mise à jour initiale des compteurs
UPDATE hotel h SET nbre_avis_hotel = (
  SELECT COUNT(*) FROM avis a WHERE a.id_hotel = h.id_hotel
);