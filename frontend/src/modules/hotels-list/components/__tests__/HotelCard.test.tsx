// src/modules/hotels-list/components/__tests__/HotelCard.test.tsx
// ============================================================================
// Tests unitaires : HotelCard (carte hôtel de la liste publique)
// Vérifie l'affichage conditionnel (étoiles, note, avis) et le lien généré.
// ============================================================================

import { render, screen } from "@testing-library/react";
import HotelCard from "../hotel-card/HotelCard";

const hotelComplet = {
  id_hotel: 42,
  nom_hotel: "Grand Hôtel Paris",
  description_hotel: "Un palace au cœur de Paris.",
  img_hotel: "/images/Paris/Paris-1.webp",
  ville_hotel: "Paris",
  pays_hotel: "France",
  nbre_etoile_hotel: 5,
  note_moy_hotel: "9.4",
  nbre_avis_hotel: 12,
};

describe("HotelCard", () => {
  it("affiche le nom, la localisation et la description", () => {
    render(<HotelCard hotel={hotelComplet} countryCode="fr" />);
    expect(
      screen.getByRole("heading", { name: "Grand Hôtel Paris" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
    expect(screen.getByText("Un palace au cœur de Paris.")).toBeInTheDocument();
  });

  it("affiche la note formatée, son label et le nombre d'avis", () => {
    render(<HotelCard hotel={hotelComplet} countryCode="fr" />);
    // La note apparaît deux fois (badge sur l'image + bloc note) : on en attend au moins une
    expect(screen.getAllByText("9.4/10").length).toBeGreaterThan(0);
    expect(screen.getByText("Exceptionnel")).toBeInTheDocument();
    expect(screen.getByText("(12 avis)")).toBeInTheDocument();
  });

  it("génère le lien vers la fiche hôtel avec le code pays", () => {
    render(<HotelCard hotel={hotelComplet} countryCode="fr" />);
    expect(
      screen.getByRole("link", { name: /voir les chambres/i }),
    ).toHaveAttribute("href", "/fr/hotels/42");
  });

  it("utilise l'image par défaut quand l'hôtel n'a pas d'image", () => {
    render(
      <HotelCard
        hotel={{ ...hotelComplet, img_hotel: null }}
        countryCode="fr"
      />,
    );
    // next/image ne sert pas le fichier directement : il passe par son service
    // d'optimisation, qui encode le chemin d'origine dans le paramètre url.
    expect(
      screen.getByRole("img", { name: "Grand Hôtel Paris" }),
    ).toHaveAttribute(
      "src",
      expect.stringContaining(encodeURIComponent("/images/default-room.jpg")),
    );
  });

  it("n'affiche ni note ni label quand il n'y a pas de note", () => {
    render(
      <HotelCard
        hotel={{ ...hotelComplet, note_moy_hotel: null, nbre_avis_hotel: 0 }}
        countryCode="fr"
      />,
    );
    expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
    expect(screen.queryByText("Exceptionnel")).not.toBeInTheDocument();
  });

  it.each([
    ["9.2", "Exceptionnel"],
    ["8.5", "Excellent"],
    ["7.3", "Très bien"],
    ["6.1", "Bien"],
    ["5.0", "Correct"],
  ])("traduit la note %s en « %s »", (note, label) => {
    render(
      <HotelCard
        hotel={{ ...hotelComplet, note_moy_hotel: note }}
        countryCode="fr"
      />,
    );
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
