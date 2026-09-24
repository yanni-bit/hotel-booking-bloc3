// src/modules/admin/components/StatutBadge.tsx
// ============================================================================
// Badge de statut de réservation, couleur pilotée par la colonne statut.couleur
// (warning / success / danger / info / secondary — héritée du Bloc 2 Bootstrap)
// ============================================================================

interface StatutBadgeProps {
  statut: { nom_statut: string; couleur: string } | null;
}

const COLOR_CLASSES: Record<string, string> = {
  warning: "bg-yellow-100 text-yellow-800",
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  secondary: "bg-gray-100 text-gray-700",
};

export default function StatutBadge({ statut }: StatutBadgeProps) {
  if (!statut) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
        —
      </span>
    );
  }
  const classes = COLOR_CLASSES[statut.couleur] ?? COLOR_CLASSES.secondary;
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${classes}`}
    >
      {statut.nom_statut}
    </span>
  );
}
