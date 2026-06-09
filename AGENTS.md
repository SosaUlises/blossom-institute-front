# Blossom Frontend Rules

Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui.

## Working rules

- Prefer small, scoped diffs.
- Do not modify files unless explicitly requested.
- Do not change API contracts unless requested.
- Avoid broad refactors.
- Reuse existing components, tokens and patterns.
- Keep Teacher, Student and Admin visually consistent.
- When asked to analyze, do not implement changes.
- When implementing, explain files touched and why.
- Run `npx tsc --noEmit` and `npm run build` when relevant.
- If build/typecheck cannot be run, say why.

## UI direction

- Favor operational workspace layouts over dashboard templates.
- Avoid oversized heroes, decorative gradients and KPI-heavy cards.
- Use compact headers, clear hierarchy and dense but readable content.
- Prefer `rounded-xl` / `rounded-2xl`, `border-border/60`, `bg-card/95`, soft shadows or no shadow.
- Use avatars for people; use icons for states, files, metrics and system events.
- Keep mobile, dark mode and overflow behavior in mind.