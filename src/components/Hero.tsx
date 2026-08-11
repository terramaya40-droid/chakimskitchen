type HeroProps = {
  title: string;
  subtitle: string;
};

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="bg-plum-deep px-4 py-12 text-cream sm:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold sm:mb-3 sm:text-sm">
          Nairobi · Fresh daily
        </p>
        <h1 className="mb-3 max-w-2xl font-display text-3xl font-bold leading-tight sm:mb-4 sm:text-5xl">
          {title}
        </h1>
        <p className="mb-6 max-w-xl text-base text-cream/80 sm:mb-8 sm:text-lg">{subtitle}</p>
        <a
          href="#menu"
          className="inline-block rounded-full bg-gold px-6 py-3 text-sm font-medium text-plum-deep transition hover:brightness-110 sm:text-base active:scale-95"
        >
          Browse the menu
        </a>
      </div>
    </section>
  );
}
