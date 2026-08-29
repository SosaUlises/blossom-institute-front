# Codex Handoff - Blossom Institute Frontend

Este documento resume el contexto de trabajo para continuar el proyecto desde otra cuenta o una nueva conversación.

## Cómo empezar una nueva sesión

Mensaje recomendado para pegar en la nueva cuenta:

```text
Use AGENTS.md y CODEX_HANDOFF.md como contexto base.

Estoy trabajando en Blossom Institute Frontend.
Continuá respetando el sistema visual actual, sin rediseñar desde cero.
Antes de tocar archivos, revisá los componentes existentes y mantené diffs chicos.
Cuando implemente cambios, corré:
npx tsc --noEmit
npm run build

Prioridad actual:
mantener Student, Teacher y Admin alineados con el nuevo estilo workspace.
```

## Proyecto

- Repo frontend: `blossom-institute-front`
- Stack: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui.
- Backend separado: `blossom-institute-api`, BlossomInstitute API en .NET.
- Regla general: no cambiar contratos de API salvo que se pida explícitamente.

## Reglas base

Leer siempre:

- `AGENTS.md`
- este archivo
- skills relevantes si el usuario las menciona.

Reglas importantes:

- Preferir diffs chicos y seguros.
- No revertir cambios del usuario.
- No hacer refactors amplios sin necesidad.
- Usar componentes existentes.
- Validar con `npx tsc --noEmit` y `npm run build` cuando haya cambios de código.
- El warning de Next sobre `middleware` deprecado ya existía y no está relacionado con los cambios recientes.

## Filosofía visual actual

Blossom ya no debe sentirse como un admin panel tradicional.

Debe sentirse como:

- workspace académico
- claro
- calmo
- profesional
- operativo
- fácil para usuarios no técnicos

Evitar:

- KPI walls
- dashboards cargados
- hero sections gigantes
- gradientes decorativos
- cards enormes sin contenido
- acciones duplicadas
- alertas por trabajo rutinario

Preferir:

- headers compactos
- navegación lateral como estructura principal
- contenido cerca del inicio
- tabs claras
- cards compactas
- feeds humanos
- avatares cuando hay personas
- estados vacíos breves y útiles

Tokens visuales frecuentes:

- `rounded-xl`
- `rounded-2xl`
- `border-border/60`
- `bg-card/95`
- `bg-background/70`
- `shadow-sm` o sombra mínima
- badges compactos
- botones con jerarquía clara

## Admin

Admin evolucionó a un workspace operativo académico.

Cambios realizados:

- Se removió el topbar pesado desktop.
- Se mantuvo appbar mobile/tablet.
- Sidebar es navegación primaria.
- Sidebar soporta modo expandido y colapsado.
- Theme toggle vive en el área de usuario/sidebar.
- User/account menu contiene Mi cuenta, Apariencia y Cerrar sesión.
- Dashboard Admin se transformó en cola diaria:
  - Hoy en Blossom
  - Para revisar hoy
  - Agenda inmediata
  - Casos a monitorear
  - Snapshot institucional
- Teachers no deben aparecer como alerta principal por correcciones rutinarias.
- Student risk tiene prioridad sobre course risk.
- Seguimientos históricos van separados de prioridades actuales.
- Settings Admin quedó profile-first:
  - Header de perfil
  - Perfil
  - Seguridad
  - Sin Apariencia ni Institución como cards separadas.

## Reports Admin

Reports fue consolidado con arquitectura por tipo:

- `course`
- `student`
- `institutional`

Reglas:

- Reportes de curso: hero estándar, contexto opcional, nunca cards vacías.
- Reportes de alumno: hero compacto, filtros arriba, contexto después de generar.
- Institucional: infraestructura preparada para futuros reportes.

Se normalizaron exportaciones y avatares en reportes.

## Teacher

Teacher fue alineado al nuevo workspace.

Cambios realizados:

- Shell docente sin topbar desktop pesado.
- Sidebar docente con estilo workspace y navegación en español.
- Dashboard docente reorganizado:
  - Hoy en tus clases
  - Próxima clase
  - Para corregir
  - Alumnos que requieren atención
  - Últimos movimientos
- `Cursos activos` se quitó del dashboard docente.
- `/teacher/courses` quedó como selector de workspaces:
  - cards compactas
  - curso como espacio de trabajo
  - sin botón explícito `Abrir curso`
  - toda la card navega
- `/teacher/courses/[id]` quedó como workspace de curso:
  - header compacto con nombre y turno
  - tabs prominentes
  - Tablón tipo feed
  - Clases como historial de asistencias tomadas
  - Alumnos como roster académico
  - Docentes compacto
- Tabs del curso docente usan URL state.
- Tablón docente:
  - se parece a Google Classroom/Facebook Groups
  - composer arriba
  - posts con avatar, autor, fecha, tipo
  - tareas y anuncios tienen formato diferente
  - tareas muestran footer operativo con vencimiento/estado/CTA
  - anuncios son posts simples
  - recursos se previsualizan: imágenes visibles, archivos como filas
  - paginación estilo `Ver más publicaciones`

## Student

Student se está alineando con Teacher.

Cambios realizados:

- `/student/dashboard` fue llevado hacia estilo workspace del profesor.
- Se removió topbar desktop en Student.
- Mensaje principal usa:
  - `{Nombre}, hoy en tu aprendizaje`
- `/student/courses` fue alineado con `/teacher/courses`:
  - cards de curso similares
  - tema del curso compartido con el profesor
  - información del día
  - cantidad de compañeros
- `/student/courses/[id]` fue alineado con `/teacher/courses/[id]`:
  - se quitó navegación superior sobre banner
  - banner/header más similar al profesor
  - tabs con URL state:
    - default: `tablon`
    - `?tab=clases`
    - `?tab=calificaciones`
    - `?tab=personas`
  - Tablón alineado al feed docente.

## Estado actual del Tablón Student

Archivo principal:

- `components/student/courses/student-course-detail.tsx`

El Tablón del alumno ahora:

- usa cards tipo post con rail lateral
- diferencia anuncios y tareas como el profesor
- anuncios:
  - post simple
  - sin footer operativo
  - sin vencimiento
- tareas:
  - footer con estado, vencimiento y CTA
- muestra avatar del profesor si existe
- muestra fecha y tipo de publicación
- muestra preview de contenido
- previsualiza recursos como el profesor:
  - imágenes visibles
  - archivos como filas con icono, nombre y tipo/tamaño
  - ya no muestra `1 recurso adjunto` como badge genérico
- si el listado no trae recursos, pide el detalle de la publicación para enriquecerlos.

Último ajuste aplicado:

- imágenes únicas usan `object-contain`, `max-h-[420px]`, fondo suave.
- múltiples imágenes usan grid compacto con `object-cover`.
- este ajuste se aplicó tanto en:
  - `components/student/courses/student-course-detail.tsx`
  - `components/teacher/course-detail/teacher-course-tasks.tsx`

## Archivos clave recientes

Student:

- `components/student/courses/student-course-detail.tsx`
- `components/student/courses/student-course-ui.tsx`
- `components/student/courses/student-task-detail.tsx`
- `app/student/courses/[id]/page.tsx`
- `app/api/student/courses/[id]/tasks/route.ts`
- `app/api/student/courses/[id]/tasks/[taskId]/route.ts`

Teacher:

- `components/teacher/course-detail/teacher-course-tasks.tsx`
- `components/teacher/course-detail/teacher-course-tabs.tsx`
- `components/teacher/dashboard/*`
- `components/teacher/tasks/teacher-task-detail-view.tsx`
- `components/teacher/tasks/teacher-publication-composer.tsx`

Admin:

- `components/admin/dashboard/admin-dashboard-view.tsx`
- `components/admin/dashboard/open-follow-ups-section.tsx`
- `components/layout/app-sidebar.tsx`
- `components/layout/app-header.tsx`
- `components/admin/settings/*`

## Validaciones recientes

Las últimas validaciones después de cambios en Tablón Student/Teacher pasaron:

- `npx tsc --noEmit`: OK
- `npm run build`: OK

Build muestra warning existente:

- Next.js: `middleware` file convention is deprecated. Use `proxy`.

No está relacionado con los cambios del Tablón.

## Estilo de respuesta pedido por el usuario

El usuario pidió respuestas más acotadas para ahorrar tokens.

Responder:

- corto
- directo
- con archivos modificados
- con validación
- sin explicar de más salvo que lo pida.

## Próxima sesión

Si se continúa con UI:

1. Leer `AGENTS.md`.
2. Leer este archivo.
3. Revisar el componente antes de editar.
4. Mantener paridad Student/Teacher cuando aplique.
5. No tocar backend salvo pedido explícito.
6. Validar con typecheck/build.
