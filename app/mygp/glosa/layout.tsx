// The parent /mygp layout already provides sidebar + auth.
// This layout adds no additional chrome — each page applies its own
// PermissionGuard with the specific permissions required for that route.
// A shared module-level guard would be too restrictive (e.g. KAM lacks GLOSA_GLOSADOR_BANDEJA).
export default function GlosaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
