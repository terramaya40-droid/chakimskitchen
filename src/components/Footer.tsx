type FooterProps = {
  phone: string;
  hours: string;
  storyTitle: string;
  storyBody: string;
};

export function Footer({ phone, hours, storyTitle, storyBody }: FooterProps) {
  return (
    <>
      <section id="story" className="bg-white px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-3 font-display text-2xl sm:text-3xl font-bold text-plum-deep">{storyTitle}</h2>
          <p className="text-sm sm:text-base text-plum/70 leading-relaxed">{storyBody}</p>
        </div>
      </section>

      <section className="border-t border-plum/10 bg-plum-deep px-4 py-10 sm:py-12 text-cream">
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-6 font-display text-xl sm:text-2xl font-bold text-center sm:text-left">How to order</h3>
          <ol className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {[
              { step: "1", text: "Browse the menu and add items to your cart" },
              { step: "2", text: "Pick your date and fill in your details" },
              { step: "3", text: "Confirm on WhatsApp — we'll take it from there" },
            ].map(({ step, text }) => (
              <li key={step} className="rounded-xl bg-plum/30 p-4 sm:p-5 border border-plum/20">
                <span className="mb-1 block font-display text-2xl font-bold text-gold">{step}</span>
                <p className="text-sm text-cream/90">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-plum/10 bg-cream px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-display font-bold text-plum-deep text-lg">Chef Chakim's Yummys</p>
          <div className="text-center text-sm text-plum/70 sm:text-right">
            <p>
              WhatsApp:{" "}
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="font-medium text-plum hover:underline">
                +{phone}
              </a>
            </p>
            <p className="mt-0.5">{hours}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
