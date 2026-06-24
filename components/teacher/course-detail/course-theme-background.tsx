export type CourseThemeGeometry =
  | 'waves'
  | 'ribbons'
  | 'diagonals'
  | 'arcs'
  | 'mosaic'
  | 'sunset'
export type CourseThemeColors = {
  primary: string
  secondary: string
  accent: string
}

type CourseThemeBackgroundProps = {
  geometry?: CourseThemeGeometry
  colors?: CourseThemeColors
}

type ThemeColorConfig = CourseThemeColors & {
  cutout: string
}

export const DEFAULT_COURSE_THEME_COLORS: CourseThemeColors = {
  primary: '#1d4ed8',
  secondary: '#dc2626',
  accent: '#172554',
}

function getThemeColorConfig(colors?: CourseThemeColors): ThemeColorConfig {
  return {
    primary: colors?.primary ?? DEFAULT_COURSE_THEME_COLORS.primary,
    secondary: colors?.secondary ?? DEFAULT_COURSE_THEME_COLORS.secondary,
    accent: colors?.accent ?? DEFAULT_COURSE_THEME_COLORS.accent,
    cutout: 'fill-card/95 dark:fill-card/85',
  }
}

function WavesPattern({ palette }: { palette: ThemeColorConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M 250,20 C 388,68 488,8 620,72 C 760,140 900,118 1120,158 L 1120,0 L 250,0 Z"
        fill={palette.secondary}
      />
      <path
        d="M 210,200 L 210,160 C 358,116 472,182 618,126 C 760,72 900,38 1120,28 L 1120,200 Z"
        fill={palette.primary}
      />
      <path
        d="M 320,112 C 448,84 548,102 666,120 C 796,140 950,104 1120,90 L 1120,142 C 950,132 800,160 680,158 C 540,156 438,128 320,146 Z"
        fill={palette.accent}
      />
    </svg>
  )
}

function RibbonsPattern({ palette }: { palette: ThemeColorConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M 270,0 L 1120,0 L 1120,58 C 900,40 748,18 620,44 C 498,68 410,114 270,82 Z"
        fill={palette.primary}
      />
      <path
        d="M 250,200 L 250,156 C 372,124 482,76 620,82 C 764,88 900,164 1120,138 L 1120,200 Z"
        fill={palette.secondary}
      />
      <path
        d="M 335,94 C 455,62 548,66 654,84 C 790,108 930,96 1120,116 L 1120,158 C 940,130 780,140 666,160 C 536,182 444,132 335,142 Z"
        fill={palette.accent}
      />
      <path
        d="M 360,122 C 482,100 564,106 674,122 C 808,142 952,124 1120,140 L 1120,154 C 940,136 788,146 676,164 C 542,186 460,142 360,154 Z"
        className={palette.cutout}
      />
    </svg>
  )
}

function DiagonalsPattern({ palette }: { palette: ThemeColorConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <polygon
        points="280,0 430,0 288,200 138,200"
        fill={palette.primary}
      />
      <polygon
        points="474,0 640,0 498,200 332,200"
        fill={palette.secondary}
      />
      <polygon
        points="690,0 846,0 704,200 548,200"
        fill={palette.accent}
      />
      <polygon
        points="880,0 1120,0 1120,200 738,200"
        fill={palette.primary}
      />
      <polygon
        points="612,0 670,0 528,200 470,200"
        className={palette.cutout}
      />
    </svg>
  )
}

function ArcsPattern({ palette }: { palette: ThemeColorConfig }) {
  return (
    <svg
      viewBox="0 0 1000 320"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle
        cx="780"
        cy="160"
        r="230"
        fill={palette.primary}
      />
      <circle
        cx="780"
        cy="160"
        r="150"
        className={palette.cutout}
      />
      <circle
        cx="948"
        cy="92"
        r="142"
        fill={palette.secondary}
      />
      <circle
        cx="968"
        cy="232"
        r="168"
        fill={palette.accent}
      />
      <circle
        cx="912"
        cy="188"
        r="72"
        className={palette.cutout}
      />
    </svg>
  )
}

function MosaicPattern({ palette }: { palette: ThemeColorConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <polygon points="280,0 520,0 450,88 310,80" fill={palette.primary} />
      <polygon
        points="520,0 742,0 664,112 450,88"
        fill={palette.secondary}
      />
      <polygon
        points="742,0 1120,0 1120,76 664,112"
        fill={palette.accent}
      />
      <polygon
        points="310,80 450,88 520,200 250,200"
        fill={palette.secondary}
      />
      <polygon
        points="450,88 664,112 740,200 520,200"
        fill={palette.accent}
      />
      <polygon
        points="664,112 1120,76 1120,200 740,200"
        fill={palette.primary}
      />
    </svg>
  )
}

function SunsetPattern({ palette }: { palette: ThemeColorConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle cx="760" cy="202" r="250" fill={palette.secondary} />
      <path
        d="M 240,92 C 388,64 492,128 630,96 C 770,62 920,40 1120,70 L 1120,0 L 240,0 Z"
        fill={palette.primary}
      />
      <path
        d="M 230,200 L 230,146 C 382,112 504,154 646,126 C 786,100 930,112 1120,134 L 1120,200 Z"
        fill={palette.accent}
      />
      <rect
        x="300"
        y="118"
        width="820"
        height="14"
        className={palette.cutout}
      />
    </svg>
  )
}

export function CourseThemeBackground({
  geometry = 'waves',
  colors,
}: CourseThemeBackgroundProps) {
  const paletteConfig = getThemeColorConfig(colors)

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent_0%,transparent_22%,black_54%)] md:[mask-image:linear-gradient(to_right,transparent_0%,transparent_10%,black_42%)]">
        {geometry === 'ribbons' ? (
          <RibbonsPattern palette={paletteConfig} />
        ) : geometry === 'diagonals' ? (
          <DiagonalsPattern palette={paletteConfig} />
        ) : geometry === 'arcs' ? (
          <ArcsPattern palette={paletteConfig} />
        ) : geometry === 'mosaic' ? (
          <MosaicPattern palette={paletteConfig} />
        ) : geometry === 'sunset' ? (
          <SunsetPattern palette={paletteConfig} />
        ) : (
          <WavesPattern palette={paletteConfig} />
        )}
      </div>
      <div className="absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-card via-card/95 to-card/0 md:w-[43%]" />
    </div>
  )
}
