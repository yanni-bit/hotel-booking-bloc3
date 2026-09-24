// src/modules/admin/components/RoleBadge.tsx
// ============================================================================
// Badge de rôle utilisateur (admin / provider / client)
// ============================================================================

interface RoleBadgeProps {
  role: { code_role: string; nom_role: string };
}

const ROLE_CLASSES: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  provider: "bg-yellow-100 text-yellow-800",
  client: "bg-turquoise-light text-turquoise",
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  const classes = ROLE_CLASSES[role.code_role] ?? "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${classes}`}
    >
      {role.nom_role}
    </span>
  );
}
