import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const heroImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85";

const features = [
  {
    icon: MapPin,
    title: "Pin meaningful places",
    copy: "Drop memories on a map and return to the exact streets, parks, and corners that mattered.",
  },
  {
    icon: Camera,
    title: "Keep the whole feeling",
    copy: "Add a title, story, and photo so the place carries more than coordinates.",
  },
  {
    icon: Lock,
    title: "Choose what stays yours",
    copy: "Save privately by default or publish selected memories for others to discover.",
  },
];

export default function LandingPage() {
  return (
    <main className="bg-paper text-ink">
      <section
        className="relative flex min-h-[86svh] overflow-hidden bg-ink text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(36, 33, 31, 0.78), rgba(36, 33, 31, 0.3)), url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <nav className="absolute inset-x-0 top-0 z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <Link className="flex items-center gap-3" href="/">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-ink">
                A
              </span>
              <span>
                <span className="block text-sm font-bold leading-none">APOO</span>
                <span className="block text-xs text-white/70">A Place of Our Own</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                className="rounded-lg px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
                href="/login"
              >
                Log in
              </Link>
              <Link
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white/90"
                href="/signup"
              >
                Sign up
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl items-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Your memories, mapped.
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-normal sm:text-6xl lg:text-7xl">
              A Place of Our Own
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/82">
              APOO turns the places you love into a private, living map of photos,
              stories, and moments worth keeping.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button
                  className="w-full sm:w-auto"
                  icon={<ArrowRight className="h-4 w-4" />}
                  variant="light"
                >
                  Start your map
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full sm:w-auto" variant="glass">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-paper px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                className="rounded-lg border border-ink/10 bg-white/75 p-5 shadow-sm"
                key={feature.title}
              >
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-clay/12 text-clay">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-semibold text-ink">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink/65">{feature.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-tide">
              <ShieldCheck className="h-4 w-4" />
              Built for private-first memory keeping
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-ink">
              Begin with one place you never want to lose.
            </h2>
          </div>
          <Link href="/signup">
            <Button icon={<ArrowRight className="h-4 w-4" />}>Create account</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
