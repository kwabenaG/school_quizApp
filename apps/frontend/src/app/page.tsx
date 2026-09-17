import Link from 'next/link';
import {
  ArrowRight,
  ChartColumnIncreasing,
  Eye,
  ListChecks,
  MonitorPlay,
  Presentation,
  Shuffle,
  Sparkles,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/landing/reveal';
import { ScrabbleTiles } from '@/components/landing/scrabble-tiles';

const LESSON_STEPS = [
  {
    icon: ListChecks,
    title: 'Load your words',
    body: 'Add words with clues and difficulty levels before the lesson, or import a list in bulk.',
  },
  {
    icon: Presentation,
    title: 'Project the round',
    body: 'Switch to projection mode and the scrambled word fills the screen for the whole room.',
  },
  {
    icon: Eye,
    title: 'Reveal on your cue',
    body: 'The class works it out against the clock. You reveal the answer when they are ready.',
  },
];

const ROOM_FEATURES = [
  {
    icon: MonitorPlay,
    title: 'Made for the projector',
    body: 'Full-screen display sized to be read from the back row, with the timer always in view.',
  },
  {
    icon: Timer,
    title: 'A clock the room can see',
    body: 'A countdown runs beside the word, so everyone knows how long is left on it.',
  },
  {
    icon: Shuffle,
    title: 'Fresh scramble every time',
    body: 'Words are jumbled differently on each run, so the same list stays useful across classes.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/80">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-600/25">
              S
            </span>
            <span className="text-lg font-bold tracking-tight">School Quiz</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/admin"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Words
            </Link>
            <Link
              href="/spell"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Spell Challenge
            </Link>
            <Link href="/quiz-master">
              <Button className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
                Start a session
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-[32rem] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-indigo-200)_0%,transparent_70%)] opacity-70 dark:bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-indigo-600)_0%,transparent_70%)] dark:opacity-25"
          />

          <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
            <Reveal className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-700 uppercase dark:border-indigo-400/25 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Sparkles className="size-3.5" />
                Word game for the whole class
              </span>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
                Put the word on the wall.
                <span className="block text-indigo-600 dark:text-indigo-400">
                  Let the class crack it.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-lg text-pretty text-slate-600 sm:text-xl dark:text-slate-300">
                Project a scrambled word, start the clock, and reveal the answer when
                the room is ready. You run it all from one screen.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/quiz-master">
                  <Button className="h-12 w-full rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-transform hover:bg-indigo-700 active:scale-[0.98] sm:w-auto motion-reduce:transition-none">
                    Start a session
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-xl border-slate-300 px-8 text-base font-semibold sm:w-auto dark:border-white/20"
                  >
                    Manage words
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={160} className="mt-16">
              <ScrabbleTiles />
            </Reveal>
          </div>
        </section>

        {/* How a lesson runs */}
        <section className="border-y border-slate-200/70 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                How a lesson runs
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Three steps from a word list to a room full of hands up.
              </p>
            </Reveal>

            <ol className="mt-14 grid gap-6 sm:grid-cols-3">
              {LESSON_STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 110}>
                  <li className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/25">
                        <step.icon className="size-5" />
                      </span>
                      <span className="font-mono text-sm font-semibold text-slate-400 tabular-nums">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{step.body}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Built for the front of the room */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Built for the front of the room
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Everything sized and paced for a projector and thirty pairs of eyes.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {ROOM_FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 110}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                  <span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">{feature.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Prep and results */}
        <section className="border-t border-slate-200/70 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                  Before and after
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  Prep once, reuse all term
                </h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                  Build the word bank ahead of time and it is ready whenever you need a
                  starter or a filler. Afterwards, see how the round actually went.
                </p>
                <div className="mt-8">
                  <Link href="/admin">
                    <Button className="h-11 rounded-xl bg-slate-900 px-6 font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                      Open the word bank
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </Reveal>

              <div className="grid gap-4">
                <Reveal delay={110}>
                  <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                      <ListChecks className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">Words, clues and difficulty</h3>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        Set up each word with its own clues, or import a whole list at once.
                      </p>
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={220}>
                  <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                      <ChartColumnIncreasing className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">How the round went</h3>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        Accuracy and timings per word, so you know what to revisit.
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-14 text-center shadow-2xl shadow-indigo-600/20 sm:px-12 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(255,255,255,0.22)_0%,transparent_70%)]"
              />
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
                  Ready to run your first round?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-lg text-pretty text-indigo-100">
                  Open Quiz Master, pick a word, and put it on the wall.
                </p>
                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/quiz-master">
                    <Button className="h-12 w-full rounded-xl bg-white px-8 text-base font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50 sm:w-auto">
                      Start a session
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link href="/spell">
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-xl border-white/35 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white sm:w-auto dark:bg-transparent"
                    >
                      Try Spell Challenge
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-indigo-600 text-sm font-bold text-white">
              S
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              School Quiz Platform
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/quiz-master" className="transition-colors hover:text-slate-900 dark:hover:text-white">
              Quiz Master
            </Link>
            <Link href="/admin" className="transition-colors hover:text-slate-900 dark:hover:text-white">
              Words
            </Link>
            <Link href="/start" className="transition-colors hover:text-slate-900 dark:hover:text-white">
              Practice
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
