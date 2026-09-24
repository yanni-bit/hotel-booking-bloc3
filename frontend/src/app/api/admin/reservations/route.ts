// src/app/api/admin/reservations/route.ts
// ============================================================================
// API Admin: GET /api/admin/reservations (liste paginée, recherche, filtre statut)
// Auth : cookie JWT + rôle admin (voir @lib/admin)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@lib/prisma";
import { requireAdmin, unauthorized } from "@lib/admin";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return unauthorized();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const statut = searchParams.get("statut") || "";
    const search = searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * limit;

    const where: Prisma.ReservationWhereInput = {};

    if (statut && statut !== "all") {
      const idStatut = parseInt(statut);
      if (Number.isInteger(idStatut)) where.id_statut = idStatut;
    }

    if (search) {
      where.OR = [
        { num_confirmation: { contains: search, mode: "insensitive" } },
        { user: { nom_user: { contains: search, mode: "insensitive" } } },
        { user: { prenom_user: { contains: search, mode: "insensitive" } } },
        { user: { email_user: { contains: search, mode: "insensitive" } } },
        { hotel: { nom_hotel: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [reservations, total, statuts] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date_reservation: "desc" },
        include: {
          user: {
            select: {
              id_user: true,
              nom_user: true,
              prenom_user: true,
              email_user: true,
            },
          },
          hotel: {
            select: { id_hotel: true, nom_hotel: true, ville_hotel: true },
          },
          chambre: { select: { id_chambre: true, type_room: true } },
          statut: true,
        },
      }),
      prisma.reservation.count({ where }),
      prisma.statut.findMany({ orderBy: { id_statut: "asc" } }),
    ]);

    return NextResponse.json({
      reservations,
      statuts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin reservations GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
