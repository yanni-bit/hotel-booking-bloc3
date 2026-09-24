// src/app/api/admin/hotels/route.ts
// ============================================================================
// API Admin: GET /api/admin/hotels (liste paginée) + POST (créer)
// Auth : cookie JWT + rôle admin (voir @lib/admin)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@lib/prisma";
import { requireAdmin, unauthorized } from "@lib/admin";

// GET - Liste des hôtels avec pagination et recherche (nom ou ville)
export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return unauthorized();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const search = searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { nom_hotel: { contains: search, mode: "insensitive" as const } },
            { ville_hotel: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_hotel: "desc" },
        include: {
          _count: { select: { chambres: true, reservations: true } },
        },
      }),
      prisma.hotel.count({ where }),
    ]);

    return NextResponse.json({
      hotels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin hotels GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un hôtel
export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return unauthorized();

    const data = await request.json();

    if (!data.nom_hotel || !data.ville_hotel || !data.pays_hotel) {
      return NextResponse.json(
        { error: "Nom, ville et pays sont obligatoires" },
        { status: 400 },
      );
    }

    const hotel = await prisma.hotel.create({
      data: {
        nom_hotel: data.nom_hotel,
        description_hotel: data.description_hotel,
        rue_hotel: data.rue_hotel,
        code_postal_hotel: data.code_postal_hotel,
        ville_hotel: data.ville_hotel,
        pays_hotel: data.pays_hotel,
        tel_hotel: data.tel_hotel,
        email_hotel: data.email_hotel,
        site_web_hotel: data.site_web_hotel,
        nbre_etoile_hotel: data.nbre_etoile_hotel,
        img_hotel: data.img_hotel,
      },
    });

    return NextResponse.json({ hotel }, { status: 201 });
  } catch (error) {
    console.error("Admin hotels POST error:", error);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}
