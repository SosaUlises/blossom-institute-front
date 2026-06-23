export type CourseThemeGeometry =
  | 'waves'
  | 'ribbons'
  | 'diagonals'
  | 'arcs'
  | 'mosaic'
  | 'sunset'
export type CourseThemePalette = 'blossom' | 'royal' | 'ember' | 'electric'

type CourseThemeBackgroundProps = {
  geometry?: CourseThemeGeometry
  palette?: CourseThemePalette
}

type PaletteConfig = {
  primary: string
  secondary: string
  accent: string
  cutout: string
}

const PALETTES: Record<CourseThemePalette, PaletteConfig> = {
  blossom: {
    primary: 'fill-blue-700/90 dark:fill-blue-500/65',
    secondary: 'fill-red-600/90 dark:fill-red-500/65',
    accent: 'fill-blue-950/70 dark:fill-blue-700/55',
    cutout: 'fill-card/95 dark:fill-card/85',
  },
  royal: {
    primary: 'fill-indigo-700/90 dark:fill-indigo-500/65',
    secondary: 'fill-fuchsia-600/85 dark:fill-fuchsia-500/65',
    accent: 'fill-sky-500/80 dark:fill-sky-400/60',
    cutout: 'fill-card/95 dark:fill-card/85',
  },
  ember: {
    primary: 'fill-orange-500/90 dark:fill-orange-400/65',
    secondary: 'fill-red-700/90 dark:fill-red-500/65',
    accent: 'fill-yellow-400/80 dark:fill-yellow-300/55',
    cutout: 'fill-card/95 dark:fill-card/85',
  },
  electric: {
    primary: 'fill-cyan-500/90 dark:fill-cyan-400/65',
    secondary: 'fill-violet-700/90 dark:fill-violet-500/65',
    accent: 'fill-pink-500/80 dark:fill-pink-400/60',
    cutout: 'fill-card/95 dark:fill-card/85',
  },
}

function WavesPattern({ palette }: { palette: PaletteConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M 250,20 C 388,68 488,8 620,72 C 760,140 842,118 1000,158 L 1000,0 L 250,0 Z"
        className={palette.secondary}
      />
      <path
        d="M 210,200 L 210,160 C 358,116 472,182 618,126 C 760,72 850,38 1000,28 L 1000,200 Z"
        className={palette.primary}
      />
      <path
        d="M 320,112 C 448,84 548,102 666,120 C 796,140 900,104 1000,90 L 1000,142 C 882,132 800,160 680,158 C 540,156 438,128 320,146 Z"
        className={palette.accent}
      />
    </svg>
  )
}

function RibbonsPattern({ palette }: { palette: PaletteConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M 270,0 L 1000,0 L 1000,58 C 844,40 748,18 620,44 C 498,68 410,114 270,82 Z"
        className={palette.primary}
      />
      <path
        d="M 250,200 L 250,156 C 372,124 482,76 620,82 C 764,88 846,164 1000,138 L 1000,200 Z"
        className={palette.secondary}
      />
      <path
        d="M 335,94 C 455,62 548,66 654,84 C 790,108 876,96 1000,116 L 1000,158 C 884,130 780,140 666,160 C 536,182 444,132 335,142 Z"
        className={palette.accent}
      />
      <path
        d="M 360,122 C 482,100 564,106 674,122 C 808,142 902,124 1000,140 L 1000,154 C 884,136 788,146 676,164 C 542,186 460,142 360,154 Z"
        className={palette.cutout}
      />
    </svg>
  )
}

function DiagonalsPattern({ palette }: { palette: PaletteConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <polygon
        points="280,0 430,0 288,200 138,200"
        className={palette.primary}
      />
      <polygon
        points="474,0 640,0 498,200 332,200"
        className={palette.secondary}
      />
      <polygon
        points="690,0 846,0 704,200 548,200"
        className={palette.accent}
      />
      <polygon
        points="880,0 1000,0 1000,200 738,200"
        className={palette.primary}
      />
      <polygon
        points="612,0 670,0 528,200 470,200"
        className={palette.cutout}
      />
    </svg>
  )
}

function ArcsPattern({ palette }: { palette: PaletteConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <ellipse
        cx="820"
        cy="104"
        rx="470"
        ry="160"
        className={palette.primary}
      />
      <ellipse
        cx="820"
        cy="104"
        rx="342"
        ry="112"
        className={palette.cutout}
      />
      <ellipse
        cx="900"
        cy="104"
        rx="312"
        ry="104"
        className={palette.secondary}
      />
      <ellipse
        cx="900"
        cy="104"
        rx="220"
        ry="70"
        className={palette.cutout}
      />
      <ellipse
        cx="970"
        cy="104"
        rx="180"
        ry="64"
        className={palette.accent}
      />
    </svg>
  )
}

function MosaicPattern({ palette }: { palette: PaletteConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <polygon points="280,0 520,0 450,88 310,80" className={palette.primary} />
      <polygon
        points="520,0 742,0 664,112 450,88"
        className={palette.secondary}
      />
      <polygon
        points="742,0 1000,0 1000,76 664,112"
        className={palette.accent}
      />
      <polygon
        points="310,80 450,88 520,200 250,200"
        className={palette.secondary}
      />
      <polygon
        points="450,88 664,112 740,200 520,200"
        className={palette.accent}
      />
      <polygon
        points="664,112 1000,76 1000,200 740,200"
        className={palette.primary}
      />
    </svg>
  )
}

function SunsetPattern({ palette }: { palette: PaletteConfig }) {
  return (
    <svg
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle cx="760" cy="202" r="250" className={palette.secondary} />
      <path
        d="M 240,92 C 388,64 492,128 630,96 C 770,62 858,40 1000,70 L 1000,0 L 240,0 Z"
        className={palette.primary}
      />
      <path
        d="M 230,200 L 230,146 C 382,112 504,154 646,126 C 786,100 882,112 1000,134 L 1000,200 Z"
        className={palette.accent}
      />
      <rect
        x="300"
        y="118"
        width="700"
        height="14"
        className={palette.cutout}
      />
    </svg>
  )
}

export function CourseThemeBackground({
  geometry = 'waves',
  palette = 'blossom',
}: CourseThemeBackgroundProps) {
  const paletteConfig = PALETTES[palette] ?? PALETTES.blossom

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent_0%,transparent_22%,black_54%)]">
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
      <div className="absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-card via-card/95 to-card/0" />
    </div>
  )
}
