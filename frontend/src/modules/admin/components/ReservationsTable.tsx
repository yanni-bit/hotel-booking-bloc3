// src/modules/admin/components/ReservationsTable.tsx
// ============================================================================
// Admin : tableau des réservations (recherche, filtre statut, pagination,
// changement de statut en ligne). Portage de l'ancienne page Medusa.
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import StatutBadge from "./StatutBadge";

interface Statut {
  id_statut: number;
  nom_statut: string;
  couleur: string;
}

interface Reservation {
  id_reservation: number;
  num_confirmation: string | null;
  check_in: string;
  check_out: string;
  nbre_nuits: number;
  total_price: string;
  devise: string;
  date_reservation: string;
  user: {
    id_user: number;
    nom_user: string;
    prenom_user: string;
    email_user: string;
  };
  hotel: { id_hotel: number; nom_hotel: string; ville_hotel: string };
  chambre: { id_chambre: number; type_room: string };
  statut: Statut | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ReservationsTableProps {
  initialStatut?: string; // id de statut pré-filtré (lien depuis le tableau de bord)
}

const PAGE_SIZE = 15;
const SEARCH_DELAY_MS = 300;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function ReservationsTable({
  initialStatut = "all",
}: ReservationsTableProps) {
  const router = useRouter();
  const { countryCode } = useParams<{ countryCode: string }>();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState(initialStatut);
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Chargement
  useEffect(() => {
    let cancelled = false;
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(statutFilter !== "all" && { statut: statutFilter }),
        });
        const response = await fetch(`/api/admin/reservations?${params}`);
        if (!response.ok) throw new Error(`Réponse ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setReservations(data.reservations);
          setStatuts(data.statuts);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Erreur chargement réservations:", err);
        if (!cancelled)
          setError("Impossible de charger les réservations. Réessayez.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReservations();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, statutFilter]);

  // Changement de statut en ligne : mise à jour optimiste, rollback si échec
  const handleStatutChange = async (
    reservationId: number,
    newStatutId: number,
  ) => {
    const previous = reservations;
    const newStatut = statuts.find((s) => s.id_statut === newStatutId) ?? null;
    setReservations((list) =>
      list.map((r) =>
        r.id_reservation === reservationId ? { ...r, statut: newStatut } : r,
      ),
    );
    setUpdatingId(reservationId);
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_statut: newStatutId }),
      });
      if (!response.ok) throw new Error(`Réponse ${response.status}`);
    } catch (err) {
      console.error("Erreur changement statut:", err);
      setReservations(previous);
      setError("Le changement de statut a échoué.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openReservation = (id: number) =>
    router.push(`/${countryCode}/admin/reservations/${id}`);

  const inputClass =
    "px-3 py-2 border border-gray-300 rounded-rounded text-sm focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise";

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="relative flex-1 max-w-sm">
          <span className="sr-only">Rechercher une réservation</span>
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="N° confirmation, client, hôtel"
            className={`w-full pl-9 ${inputClass}`}
          />
        </label>
        <label>
          <span className="sr-only">Filtrer par statut</span>
          <select
            value={statutFilter}
            onChange={(e) => {
              setStatutFilter(e.target.value);
              setPage(1);
            }}
            className={`${inputClass} bg-white`}
          >
            <option value="all">Tous les statuts</option>
            {statuts.map((s) => (
              <option key={s.id_statut} value={s.id_statut}>
                {s.nom_statut}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-gris-moyen">
          {pagination
            ? `${pagination.total} réservation${pagination.total > 1 ? "s" : ""}`
            : ""}
        </span>
      </div>

      {error && (
        <p
          role="alert"
          className="px-4 py-3 rounded-rounded text-sm bg-red-50 text-erreur"
        >
          {error}
        </p>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-rounded border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gris-clair text-left text-gris-moyen">
            <tr>
              <th className="px-4 py-3 font-medium">Confirmation</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Hôtel</th>
              <th className="px-4 py-3 font-medium">Chambre</th>
              <th className="px-4 py-3 font-medium">Séjour</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gris-moyen"
                >
                  Chargement…
                </td>
              </tr>
            )}
            {!loading && reservations.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gris-moyen"
                >
                  Aucune réservation ne correspond.
                </td>
              </tr>
            )}
            {!loading &&
              reservations.map((r) => (
                <tr
                  key={r.id_reservation}
                  onClick={() => openReservation(r.id_reservation)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && openReservation(r.id_reservation)
                  }
                  tabIndex={0}
                  className="cursor-pointer hover:bg-turquoise-light focus:outline-none focus:bg-turquoise-light"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gris-fonce">
                    {r.num_confirmation ?? `#${r.id_reservation}`}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gris-fonce">
                      {r.user.prenom_user} {r.user.nom_user}
                    </p>
                    <p className="text-xs text-gris-moyen">
                      {r.user.email_user}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gris-fonce">
                      {r.hotel.nom_hotel}
                    </p>
                    <p className="text-xs text-gris-moyen">
                      {r.hotel.ville_hotel}
                    </p>
                  </td>
                  <td className="px-4 py-3">{r.chambre.type_room}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(r.check_in)} → {formatDate(r.check_out)}
                    <span className="block text-xs text-gris-moyen">
                      {r.nbre_nuits} nuit{r.nbre_nuits > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                    {Number(r.total_price).toFixed(2)}{" "}
                    {r.devise === "EUR" ? "€" : r.devise}
                  </td>
                  {/* Le sélecteur ne doit pas déclencher l'ouverture de la ligne */}
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <StatutBadge statut={r.statut} />
                      <select
                        aria-label={`Changer le statut de la réservation ${r.num_confirmation ?? r.id_reservation}`}
                        value={r.statut?.id_statut ?? ""}
                        disabled={updatingId === r.id_reservation}
                        onChange={(e) =>
                          handleStatutChange(
                            r.id_reservation,
                            parseInt(e.target.value),
                          )
                        }
                        className="text-xs border border-gray-300 rounded-rounded px-1.5 py-1 bg-white disabled:opacity-50"
                      >
                        {statuts.map((s) => (
                          <option key={s.id_statut} value={s.id_statut}>
                            {s.nom_statut}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-3"
          aria-label="Pagination"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-rounded text-sm disabled:opacity-40 hover:border-turquoise hover:text-turquoise"
          >
            <FiChevronLeft aria-hidden="true" /> Précédent
          </button>
          <span className="text-sm text-gris-moyen">
            Page {page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-rounded text-sm disabled:opacity-40 hover:border-turquoise hover:text-turquoise"
          >
            Suivant <FiChevronRight aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
