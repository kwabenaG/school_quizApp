import Link from 'next/link';
import {
  ArrowRight,
  ChartColumnIncreasing,
  MonitorPlay,
  KeyRound,
  Lightbulb,
  ListChecks,
  Shuffle,
  Sparkles,
  Timer,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JoinForm } from '@/components/landing/join-form';
import { Reveal } from '@/components/landing/reveal';
import { ScrabbleTiles } from '@/components/landing/scrabble-tiles';

const PLAYER_PERKS = [
  {
    icon: Lightbulb,
    title: 'Clues when you need them',
    body: 'Every word comes with hints, so you are never staring at a dead end.',
  },
  {
    icon: Timer,
    title: 'Beat your own clock',
    body: 'A live timer runs on each word. Solve it faster than you did last time.',
  },
  {
    icon: Trophy,
    title: 'Know instantly',
    body: 'Submit an answer and find out right away whether you nailed it.',
  },
];

const STEPS = [
  {
    icon: KeyRound,
    title: 'Enter the code',
    body: 'Your teacher shares a session code. Type it in with your name.',
  },
  {
    icon: Shuffle,
    title: 'Unscramble the word',
    body: 'Letters arrive jumbled. Read the clue and work out the real word.',
  },
  {
    icon: Sparkles,
    title: 'Lock in your answer',
    body: 'Submit, see if you are right, and roll straight on to the next word.',
  },
];

const TEACHER_TOOLS = [
  {
    icon: ListChecks,
    title: 'Build your word list',
    body: 'Add words with clues and difficulty levels, or import them in bulk.',
  },
  {
    icon: MonitorPlay,
    title: 'Run the room',
    body: 'Open a session, share the code, and drive the pace from one screen.',
  },
  {
    icon: ChartColumnIncreasing,
    title: 'See who is getting it',
    body: 'Watch answers, accuracy and timings land as the round plays out.',
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
              href="/quiz-master"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Quiz Master
            </Link>
            <Link
              href="/admin"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Admin
            </Link>
            <Link href="/start">
              <Button className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
                Play now
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-[32rem] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-indigo-200)_0%,transparent_70%)] opacity-70 dark:bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-indigo-600)_0%,transparent_70%)] dark:opacity-25"
          />

          <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-20 sm:px-6 sm:pt-20 sm:pb-28">
            <Reveal className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-700 uppercase dark:border-indigo-400/25 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Sparkles className="size-3.5" />
                Word game for junior school
              </span>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
                Unscramble the word.
                <span className="block text-indigo-600 dark:text-indigo-400">
                  Beat the clock.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-lg text-pretty text-slate-600 sm:text-xl dark:text-slate-300">
                Jumbled letters, a helpful clue, and a timer counting up. Get a code
                from your teacher and see how fast you can solve it.
              </p>
            </Reveal>

            <Reveal delay={120} className="mt-12">
              <ScrabbleTiles />
            </Reveal>

            <Reveal delay={220} className="mx-auto mt-12 max-w-2xl">
              <JoinForm />
            </Reveal>
          </div>
        </section>

        {/* How a round works */}
        <section className="border-y border-slate-200/70 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                A round takes about a minute
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Three steps, then you are playing.
              </p>
            </Reveal>

            <ol className="mt-14 grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, i) => (
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

        {/* What players get */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Built so you keep going
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              No dead ends, no waiting to find out how you did.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {PLAYER_PERKS.map((perk, i) => (
              <Reveal key={perk.title} delay={i * 110}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                  <span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <perk.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{perk.title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">{perk.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Teachers - deliberately secondary */}
        <section className="border-t border-slate-200/70 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <Reveal>
                <span className="text-xs font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-400">
                  For teachers
                </span>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  You run the round from one screen
                </h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                  Set up the words ahead of the lesson, then open a session and read
                  the room as answers come in.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/admin">
                    <Button className="h-11 w-full rounded-xl bg-slate-900 px-6 font-semibold text-white hover:bg-slate-800 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                      Manage words
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link href="/quiz-master">
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl border-slate-300 px-6 font-semibold sm:w-auto dark:border-white/20"
                    >
                      Open Quiz Master
                    </Button>
                  </Link>
                </div>
              </Reveal>

              <div className="grid gap-4">
                {TEACHER_TOOLS.map((tool, i) => (
                  <Reveal key={tool.title} delay={i * 110}>
                    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                        <tool.icon className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-semibold">{tool.title}</h3>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">
                          {tool.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
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
                  Ready for your first word?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-lg text-pretty text-indigo-100">
                  Try a practice round right now - no code, no sign-up.
                </p>
                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/start">
                    <Button className="h-12 w-full rounded-xl bg-white px-8 text-base font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50 sm:w-auto">
                      Start practising
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
            <Link href="/start" className="transition-colors hover:text-slate-900 dark:hover:text-white">
              Play
            </Link>
            <Link href="/quiz-master" className="transition-colors hover:text-slate-900 dark:hover:text-white">
              Quiz Master
            </Link>
            <Link href="/admin" className="transition-colors hover:text-slate-900 dark:hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
