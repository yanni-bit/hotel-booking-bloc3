// src/app/[countryCode]/(main)/hotels/page.tsx
// ============================================================================
// Page liste des hôtels (par ville ou recherche)
// Équivalent de hotels-list.component Angular
// URL: /fr/hotels?city=Paris OU /fr/hotels?search=plage
// ============================================================================

import { Suspense } from "react";
import { getHotels, searchHotels } from "@lib/hotels";
import HotelCard from "@modules/hotels-list/components/hotel-card/HotelCard";
import Link from "next/link";
import { FaHome, FaSearch } from "react-icons/fa";

interface HotelsPageProps {
  params: Promise<{ countryCode: string }>;
  searchParams: Promise<{
    city?: string;
    country?: string;
    stars?: string;
    page?: string;
    search?: string;
  }>;
}

export async function generateMetadata({ searchParams }: HotelsPageProps) {
  const { city, search } = await searchParams;

  if (search) {
    return {
      title: `Résultats pour "${search}" | Hotel Booking`,
      description: `Résultats de recherche pour "${search}". Trouvez votre hôtel idéal.`,
    };
  }

  return {
    title: city
      ? `Hôtels à ${city} | Hotel Booking`
      : "Tous les hôtels | Hotel Booking",
    description: city
      ? `Découvrez les meilleurs hôtels à ${city}. Réservez au meilleur prix.`
      : "Trouvez et réservez votre hôtel idéal parmi notre sélection.",
  };
}

export default async function HotelsPage({
  params,
  searchParams,
}: HotelsPageProps) {
  const { countryCode } = await params;
  const { city, country, stars, page, search } = await searchParams;

  // Utiliser searchHotels si recherche textuelle, sinon getHotels
  const result = search
    ? await searchHotels({
        query: search,
        city: city || undefined,
        stars: stars ? [parseInt(stars)] : undefined,
        page: page ? parseInt(page) : 1,
        limit: 12,
      })
    : await getHotels({
        city: city || undefined,
        country: country || undefined,
        minStars: stars ? parseInt(stars) : undefined,
        page: page ? parseInt(page) : 1,
        limit: 12,
      });

  const { hotels, pagination } = result;
  const { total, totalPages, page: currentPage } = pagination;

  // Construire les query params pour la pagination
  const buildQueryString = (pageNum: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (stars) params.set("stars", stars);
    params.set("page", String(pageNum));
    return params.toString();
  };

  return (
    <section className="hotels-list-section py-8 min-h-screen bg-gray-50">
      <div className="content-container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href={`/${countryCode}`}
                className="text-turquoise hover:underline flex items-center"
              >
                <FaHome className="mr-1" /> Accueil
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">
              {search
                ? `Recherche : "${search}"`
                : city
                  ? `Hôtels à ${city}`
                  : "Tous les hôtels"}
            </li>
          </ol>
        </nav>

        {/* En-tête de page */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {search
              ? `Résultats pour "${search}"`
              : city
                ? `Hôtels à ${city}`
                : "Tous les hôtels"}
          </h1>
          <p className="text-gray-500 mt-2">
            {total} établissement{total > 1 ? "s" : ""} trouvé
            {total > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtres actifs */}
        {(search || city || country || stars) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                Recherche: {search}
                <Link
                  href={`/${countryCode}/hotels`}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </Link>
              </span>
            )}
            {city && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-turquoise/10 text-turquoise">
                Ville: {city}
                <Link
                  href={`/${countryCode}/hotels${search ? `?search=${search}` : ""}`}
                  className="ml-2 hover:text-turquoise-dark"
                >
                  ×
                </Link>
              </span>
            )}
            {stars && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                {stars}+ étoiles
                <Link
                  href={`/${countryCode}/hotels?${new URLSearchParams({
                    ...(search && { search }),
                    ...(city && { city }),
                  }).toString()}`}
                  className="ml-2 hover:text-yellow-800"
                >
                  ×
                </Link>
              </span>
            )}
          </div>
        )}

        {/* Aucun hôtel trouvé */}
        {hotels.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-lg text-center">
            <FaSearch className="text-4xl mx-auto mb-3 text-blue-400" />
            <p className="text-lg font-medium">Aucun hôtel trouvé</p>
            <p className="mt-2">
              {search
                ? `Aucun résultat pour "${search}".`
                : city
                  ? `Aucun établissement disponible à ${city}.`
                  : "Aucun établissement ne correspond à vos critères."}
            </p>
            <Link
              href={`/${countryCode}/hotels`}
              className="inline-block mt-4 px-6 py-2 bg-turquoise text-white rounded-lg hover:bg-turquoise-dark transition-colors"
            >
              Voir tous les hôtels
            </Link>
          </div>
        )}

        {/* Grille des hôtels */}
        {hotels.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {hotels.map((hotel: (typeof hotels)[number]) => (
                <HotelCard
                  key={hotel.id_hotel}
                  hotel={hotel}
                  countryCode={countryCode}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {/* Bouton précédent */}
                {currentPage > 1 && (
                  <Link
                    href={`/${countryCode}/hotels?${buildQueryString(currentPage - 1)}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ← Précédent
                  </Link>
                )}

                {/* Numéros de page */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/${countryCode}/hotels?${buildQueryString(pageNum)}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-turquoise text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {/* Bouton suivant */}
                {currentPage < totalPages && (
                  <Link
                    href={`/${countryCode}/hotels?${buildQueryString(currentPage + 1)}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Suivant →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}