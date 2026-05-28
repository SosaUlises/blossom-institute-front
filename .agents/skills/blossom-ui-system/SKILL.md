---
name: blossom-ui-system
description: Use for Blossom UI/UX analysis, redesigns, dashboard/course/settings/auth polish, and visual consistency across Student, Teacher and Admin. Do not use for backend-only tasks.
---

# Blossom UI System Skill

You are working on Blossom Institute, an academic management platform.

Use this skill when improving or analyzing UI/UX for:
- Student views
- Teacher views
- Admin views
- dashboards
- course detail
- settings
- auth screens
- grading
- attendance
- submissions
- publications
- rosters
- activity feeds

## Product direction

Blossom should feel like a modern academic workspace, not a generic admin template.

The visual language should be:
- clean
- editorial
- operational
- calm
- premium but not decorative
- dense enough to be useful
- readable in light and dark mode

## Role-specific UX

### Student

Student should feel:
- warm
- guided
- human
- supportive
- learning-oriented

Use:
- friendly copy
- teacher avatars for human messages
- compact learning feeds
- clear next steps
- emotional but controlled visual elements

Avoid:
- cold dashboards
- corporate KPIs
- too many technical labels

### Teacher

Teacher should feel:
- operational
- fast
- focused
- professional
- daily-work oriented

Prioritize:
- what to do today
- attendance
- submissions
- feedback
- grading
- course workspaces
- rosters

Avoid:
- marketing heroes
- decorative illustrations
- oversized widgets
- redundant metrics

### Admin

Admin should feel:
- institutional
- academic
- decision-oriented
- compact
- strategic

Prioritize:
- academic risk
- students needing follow-up
- courses with low performance
- low attendance
- institutional health
- agenda
- fast management actions

Avoid:
- generic SaaS dashboards
- decorative KPIs
- fake activity feeds
- duplicated agenda/activity content
- empty widgets

## Layout rules

Prefer:
- compact workspace headers
- contextual subtitles
- clear action slots
- 2-column layouts when useful
- rows/feeds for operational content
- cards only when they clarify grouping
- inline metadata over large stat blocks

Avoid:
- oversized hero sections
- dashboard widget overload
- too many nested cards
- large gradients
- deep shadows
- text floating without structure
- huge vertical gaps

## Visual tokens

Prefer:
- `rounded-xl`
- `rounded-2xl`
- `border-border/60`
- `bg-card/95`
- `bg-background/75`
- `shadow-sm` or very soft custom shadows
- inputs/buttons around `h-10`
- compact badges
- subtle hover states

Avoid:
- `rounded-[28px]` unless already established in that exact area
- heavy radial gradients
- giant KPI numbers
- red/rose hover unless destructive
- excessive borders/dividers

## Avatar rules

Use avatars when the UI answers:
- who posted?
- who gave feedback?
- who submitted?
- who is this student/teacher?
- who performed a human action?

Use icons when the UI answers:
- what state is this?
- what type is this?
- is this a metric?
- is this a file?
- is this a system event?

Fallback:
- avatar URL if available
- initials if name exists
- semantic icon only when there is no person context

## Copy rules

Use Spanish consistently.

Prefer:
- “Configuración”
- “Calificaciones”
- “Asistencia”
- “Seguimiento académico”
- “Salud institucional”
- “Agenda inmediata”
- “Crear alumno”
- “Crear docente”
- “Crear curso”

Avoid:
- English residual labels
- placeholder copy
- “Instituto” as a fake user name
- vague text like “indicadores generales sin protagonismo”

Use accents and ñ correctly.

## Dashboard rules

Dashboards must communicate decisions, not decoration.

Student dashboard:
- next step
- learning feed
- course access
- progress context

Teacher dashboard:
- today
- classes
- submissions
- corrections
- active courses
- recent useful activity

Admin dashboard:
- academic attention
- students at risk
- critical courses
- institutional health
- immediate agenda
- quick actions

Do not invent activity feeds without real data.

## Forms and settings

Forms should be compact and task-oriented.

Prefer:
- section title
- short helper text
- fields
- action

Avoid:
- intro cards
- meta cards above forms
- form dashboards
- excessive vertical space

## Implementation behavior

When asked to analyze:
- do not modify files
- map current structure
- identify data availability
- recommend lots/roadmap

When asked to implement:
- make small scoped diffs
- preserve API contracts
- reuse existing components
- do not change backend unless explicitly requested
- run typecheck/build when relevant

Always report:
- files touched
- what changed
- what was intentionally not changed
- build/typecheck result