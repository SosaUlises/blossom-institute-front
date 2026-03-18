export function AuthRecoverySidePanel() {
  return (
    <div className="relative hidden min-h-screen overflow-hidden lg:flex">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/recovery-london2.jpg')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(15,23,42,0.55),rgba(15,23,42,0.72))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,61,79,0.10),transparent_26%)]" />

            <div className="relative z-10 flex h-full w-full items-end px-16 py-16">
              <div className="max-w-lg space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/65">
                   Recuperación de acceso
                </p>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
                   Volvé a ingresar a tu cuenta de Blossom
                </h1>
                <p className="max-w-md text-base leading-7 text-white/78">
                 Recuperá tu acceso de forma simple y segura para seguir acompañando tu actividad académica dentro del instituto.
                </p>
              </div>
            </div>
    </div>
  )
}