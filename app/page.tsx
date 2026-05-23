import Link from "next/link";

const philosophy = [
  "The world is full of places. But it is made of moments.",
  "Some are too quiet to post, too delicate to share, yet too important to forget.",
  "APOO gives those moments a place to stay. A way to remain.",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-night text-ivory">
      <section className="apoo-ambient flex min-h-[88svh] flex-col px-5">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between py-6">
          <Link className="font-serif text-sm font-semibold tracking-[0.38em]" href="/">
            APOO
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.18em] text-ivory/75">
            <Link className="transition hover:text-ivory" href="/login">
              LOG IN
            </Link>
            <Link
              className="rounded-full border border-ivory/70 px-5 py-3 transition hover:bg-ivory hover:text-night"
              href="/register"
            >
              SIGN UP
            </Link>
          </div>
        </nav>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center pb-12 text-center">
          <p className="mb-5 font-serif text-xs font-semibold uppercase tracking-[0.46em] text-ivory/60">
            APOO
          </p>
          <h1 className="font-serif text-4xl font-semibold uppercase leading-tight tracking-[0.22em] text-ivory sm:text-6xl md:text-7xl">
            A Place Of Our Own
          </h1>
          <p className="mt-5 max-w-xl font-serif text-lg leading-8 text-ivory/70 sm:text-xl">
            For the memories that matter to us.
          </p>

          <div className="mt-9 flex flex-col items-center gap-5">
            <Link
              className="rounded-full border border-ivory/70 px-12 py-4 text-sm font-bold tracking-[0.28em] text-ivory transition hover:bg-ivory hover:text-night"
              href="/map"
            >
              ENTER APOO
            </Link>
            <a
              className="text-center text-[0.68rem] font-bold uppercase tracking-[0.34em] text-ivory/40 transition hover:text-ivory/75"
              href="#philosophy"
            >
              Philosophy
              <span className="mt-2 block text-base tracking-normal">↓</span>
            </a>
          </div>
        </div>

        <p className="pb-7 text-center font-serif text-sm italic text-ivory/60">
          Every memory deserves a place.
        </p>
      </section>

      <section
        className="mx-auto grid min-h-[54svh] max-w-5xl place-items-center px-5 py-16 text-center"
        id="philosophy"
      >
        <div>
          <p className="mb-8 text-xs font-semibold uppercase tracking-[0.42em] text-ivory/40">
            Back
          </p>
          <div className="space-y-7 font-serif text-xl leading-9 text-ivory/75 sm:text-2xl sm:leading-10">
            {philosophy.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p className="mt-10 font-serif text-2xl italic text-ivory">
            This mattered.
          </p>
          <Link
            className="mt-10 inline-flex rounded-full border border-ivory/45 px-8 py-3 text-xs font-bold uppercase tracking-[0.26em] text-ivory/75 transition hover:bg-ivory hover:text-night"
            href="/register"
          >
            Begin
          </Link>
        </div>
      </section>
    </main>
  );
}
