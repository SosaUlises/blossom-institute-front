interface AuthRecoverySidePanelProps {
  imageUrl: string
  imageAlt?: string
  imagePosition?: string
}

export function AuthRecoverySidePanel({
  imageUrl,
  imageAlt = 'Blossom Institute',
  imagePosition = 'center center',
}: AuthRecoverySidePanelProps) {
  return (
    <section
      className="relative hidden lg:block"
      aria-label={imageAlt}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundPosition: imagePosition,
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,24,40,0.04)_0%,rgba(20,24,40,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(36,59,123,0.14),transparent_28%)]" />

      <div className="relative h-full min-h-full w-full" />
    </section>
  )
}