'use client';

import { useEffect, useState } from 'react';

const WORDS = ['SPELL', 'LEARN', 'QUIZ', 'WORDS'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const SCRAMBLE_MS = 70;
const SCRAMBLE_LEAD_MS = 650;
const LOCK_MS = 160;
const HOLD_MS = 2200;

const randomLetter = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)];

/** Letter values, purely decorative — matches the scrabble-tile look. */
const TILE_VALUE: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10,
};

/**
 * A row of scrabble tiles that scrambles, then locks letter by letter into a
 * real word before cycling to the next one — the same mechanic students see in
 * the quiz itself.
 */
export function ScrabbleTiles() {
  const [wordIndex, setWordIndex] = useState(0);
  const [letters, setLetters] = useState<string[]>(() => WORDS[0].split(''));
  const [lockedCount, setLockedCount] = useState(WORDS[0].length);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const target = WORDS[wordIndex];
    const size = target.length;

    if (!animate) {
      setLetters(target.split(''));
      setLockedCount(size);
      const slowCycle = setTimeout(
        () => setWordIndex((i) => (i + 1) % WORDS.length),
        HOLD_MS * 2
      );
      return () => clearTimeout(slowCycle);
    }

    let locked = 0;
    setLockedCount(0);
    setLetters(Array.from({ length: size }, randomLetter));

    const scramble = setInterval(() => {
      setLetters((prev) =>
        prev.map((ch, i) => (i < locked ? target[i] : randomLetter()))
      );
    }, SCRAMBLE_MS);

    let advance: ReturnType<typeof setTimeout>;
    let lock: ReturnType<typeof setInterval>;

    const startLocking = setTimeout(() => {
      lock = setInterval(() => {
        locked += 1;
        setLockedCount(locked);
        setLetters((prev) => prev.map((ch, i) => (i < locked ? target[i] : ch)));

        if (locked >= size) {
          clearInterval(lock);
          clearInterval(scramble);
          advance = setTimeout(
            () => setWordIndex((i) => (i + 1) % WORDS.length),
            HOLD_MS
          );
        }
      }, LOCK_MS);
    }, SCRAMBLE_LEAD_MS);

    return () => {
      clearInterval(scramble);
      clearTimeout(startLocking);
      clearInterval(lock);
      clearTimeout(advance);
    };
  }, [wordIndex, animate]);

  const solved = lockedCount >= letters.length;

  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-3"
      role="img"
      aria-label={`Scrambled letter tiles spelling ${WORDS[wordIndex]}`}
    >
      {letters.map((letter, i) => {
        const isLocked = i < lockedCount;
        return (
          <span
            key={i}
            data-locked={isLocked}
            className={[
              'relative grid h-14 w-14 place-items-center rounded-xl border text-2xl font-bold',
              'shadow-sm transition-all duration-300 ease-out select-none',
              'sm:h-[4.5rem] sm:w-[4.5rem] sm:rounded-2xl sm:text-4xl',
              isLocked
                ? 'border-indigo-200 bg-white text-indigo-950 shadow-indigo-200/60 dark:border-indigo-400/30 dark:bg-indigo-950 dark:text-indigo-50'
                : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-500',
              isLocked && solved ? '-translate-y-1' : '',
            ].join(' ')}
            style={{ transitionDelay: isLocked && solved ? `${i * 45}ms` : '0ms' }}
          >
            {letter}
            <span
              className={[
                'absolute right-1.5 bottom-1 text-[0.55rem] font-semibold tabular-nums transition-opacity sm:right-2 sm:text-[0.65rem]',
                isLocked ? 'text-indigo-400 opacity-100' : 'opacity-0',
              ].join(' ')}
            >
              {TILE_VALUE[letter] ?? 1}
            </span>
          </span>
        );
      })}
    </div>
  );
}
