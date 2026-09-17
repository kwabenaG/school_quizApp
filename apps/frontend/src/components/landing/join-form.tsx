'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * The primary student action: hand over a session ID and a name, and land
 * straight in the quiz. Both are carried to /start as query params so the
 * student never has to type them twice.
 */
export function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!code.trim() || !name.trim()) {
      setError('Enter your session ID and your name to join.');
      return;
    }

    setError('');
    const params = new URLSearchParams({ session: code.trim(), name: name.trim() });
    router.push(`/start?${params.toString()}`);
  };

  // Implicit submission is unreliable across browsers here, and pressing Enter
  // is the obvious thing to do after filling the fields — so wire it up explicitly.
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
          Got a session ID from your teacher? Jump in.
        </p>
      </div>

      {/* Session IDs are UUIDs, so the field gets its own full-width row —
          36 characters do not fit beside the name field. */}
      <div className="grid gap-3">
        <div>
          <label htmlFor="session-id" className="sr-only">
            Session ID
          </label>
          <input
            id="session-id"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your session ID"
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="none"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-xs text-slate-900 sm:text-sm placeholder:font-sans placeholder:text-base placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
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

          <Button
            type="submit"
            className="h-12 rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-transform hover:bg-indigo-700 hover:shadow-indigo-600/35 active:scale-[0.98] motion-reduce:transition-none"
          >
            Join
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
        <Dices className="size-4 shrink-0 text-slate-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nothing to join yet?{' '}
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
