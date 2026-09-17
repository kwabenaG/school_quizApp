'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * The primary student action: hand over a session code and a name, and land
 * straight in the quiz. The code is carried to /start as a query param so the
 * student never has to type it twice.
 */
export function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!code.trim() || !name.trim()) {
      setError('Enter your session code and your name to join.');
      return;
    }

    setError('');
    const params = new URLSearchParams({ session: code.trim(), name: name.trim() });
    router.push(`/start?${params.toString()}`);
  };

  // Implicit submission is unreliable across browsers here, and pressing Enter
  // is the obvious thing to do after typing a code — so wire it up explicitly.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xl shadow-indigo-900/5 backdrop-blur sm:p-6 dark:border-white/10 dark:bg-white/5"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Got a code from your teacher? Jump in.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label htmlFor="session-code" className="sr-only">
            Session code
          </label>
          <input
            id="session-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SESSION CODE"
            autoComplete="off"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-center font-mono text-base tracking-[0.2em] text-slate-900 uppercase placeholder:tracking-[0.12em] placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="student-name" className="sr-only">
            Your name
          </label>
          <input
            id="student-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="given-name"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
          />
        </div>

        <Button
          type="submit"
          className="h-12 rounded-xl bg-indigo-600 px-6 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-transform hover:bg-indigo-700 hover:shadow-indigo-600/35 active:scale-[0.98] motion-reduce:transition-none"
        >
          Join
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
        <Dices className="size-4 shrink-0 text-slate-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No code?{' '}
          <a
            href="/start"
            className="font-semibold text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
          >
            Practise with a random word
          </a>
        </p>
      </div>
    </form>
  );
}
