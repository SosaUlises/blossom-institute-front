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
      className="relative hidden min-h-0 lg:block"
      aria-label={imageAlt}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundPosition: imagePosition,
        }}
      />

      <div className="relative h-full min-h-full w-full" />
    </section>
  )
}
