export function RoleChipList({ roles }: { roles: string[] }) {
  if (roles.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">
        Sin roles asignados.
      </span>
    )
  }

  return (
    <>
      {roles.map((role) => (
        <span
          key={role}
          className="inline-flex max-w-full items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-primary/10"
        >
          {role}
        </span>
      ))}
    </>
  )
}
