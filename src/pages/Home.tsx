import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Menu } from "../components/Menu";
import { Cart } from "../components/Cart";
import { Footer } from "../components/Footer";
import { useShop } from "../hooks/useShop";
import { isConfigured } from "../lib/supabase";

export default function Home() {
  const { data, loading, error, text } = useShop();

  if (!isConfigured()) {
    return <SetupScreen />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-plum/60">Loading menu…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-4">
        <p className="text-red-600">{error ?? "Failed to load shop data"}</p>
        <p className="max-w-md text-center text-sm text-plum/60">
          Make sure Supabase is configured and you've run the migration in{" "}
          <code className="rounded bg-plum/10 px-1">supabase/migrations/001_schema.sql</code>
        </p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>
        <Hero
          title={text("hero_title", "Deliciously Yours Online")}
          subtitle={text(
            "hero_subtitle",
            "Fresh chapati, mandazi, samosas, yoghurt & celebration cakes — made with love in Nairobi.",
          )}
        />
        <Menu items={data.items} />
        <Footer
          phone={text("footer_phone", "254793547818")}
          hours={text("footer_hours", "Mon–Sat 8am–6pm · Sundays closed")}
          storyTitle={text("story_title", "Our Story")}
          storyBody={text(
            "story_body",
            "Chef Chakim started in a small kitchen with one goal: bring the warmth of home-cooked Kenyan food to every celebration.",
          )}
        />
      </main>
      <Cart availability={data.availability} content={data.content} />
    </>
  );
}

function SetupScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-4 text-center">
      <h1 className="font-display text-3xl font-bold text-plum-deep">Chef Chakim's Yummys</h1>
      <p className="max-w-md text-plum/70">
        Copy <code className="rounded bg-plum/10 px-1">.env.example</code> to{" "}
        <code className="rounded bg-plum/10 px-1">.env</code> and add your Supabase URL and anon key.
      </p>
      <ol className="max-w-sm space-y-2 text-left text-sm text-plum/60">
        <li>1. Create a project at supabase.com</li>
        <li>2. Run the SQL in <code>supabase/migrations/001_schema.sql</code></li>
        <li>3. Add your keys to <code>.env</code></li>
        <li>4. Run <code>npm install && npm run dev</code></li>
      </ol>
    </div>
  );
}
