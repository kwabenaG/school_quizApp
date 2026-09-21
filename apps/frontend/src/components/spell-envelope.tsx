'use client';

/**
 * One envelope in the Spell Challenge pack picker.
 *
 * This replaces four near-identical copies of the same markup, each of which
 * derived its colours by substring-matching Tailwind class names
 * (`colors.bg.includes('blue') ? '#3b82f6' : ...`). Colours are now data.
 *
 * It renders a real <button>: the originals were click-handled <div>s, so the
 * page told people to "click on the sliding envelopes" while giving keyboard
 * and screen-reader users nothing to click.
 */

export interface EnvelopeTone {
  body: string;
  flap: string;
  ring: string;
}

/** One tone per pack, so a pack stays recognisable as it moves around. */
export const ENVELOPE_TONES: EnvelopeTone[] = [
  { body: '#4f46e5', flap: '#4338ca', ring: '#6366f1' }, // indigo
  { body: '#7c3aed', flap: '#6d28d9', ring: '#8b5cf6' }, // violet
  { body: '#db2777', flap: '#be185d', ring: '#ec4899' }, // pink
  { body: '#ea580c', flap: '#c2410c', ring: '#f97316' }, // orange
  { body: '#0d9488', flap: '#0f766e', ring: '#14b8a6' }, // teal
];

type EnvelopeSize = 'sm' | 'md' | 'lg' | 'fluid';

const SIZES: Record<EnvelopeSize, { box: string; label: string; radius: string }> = {
  sm: { box: 'h-20 w-16', label: 'text-[0.65rem]', radius: 'rounded-lg' },
  md: {
    box: 'h-32 w-24 sm:h-44 sm:w-32 lg:h-56 lg:w-44',
    label: 'text-sm sm:text-base lg:text-lg',
    radius: 'rounded-xl sm:rounded-2xl',
  },
  lg: {
    box: 'h-64 w-48 sm:h-80 sm:w-60 lg:h-[26rem] lg:w-80',
    label: 'text-xl sm:text-2xl lg:text-3xl',
    radius: 'rounded-2xl sm:rounded-3xl',
  },
  // Fills whatever cell it is given, so a row of packs spans the screen
  // instead of wrapping at a fixed width.
  fluid: {
    box: 'w-full aspect-[3/4]',
    label: 'text-sm sm:text-lg lg:text-xl',
    radius: 'rounded-xl sm:rounded-2xl',
  },
};

interface SpellEnvelopeProps {
  label: string;
  /** Index into ENVELOPE_TONES; wraps if there are more packs than tones. */
  toneIndex: number;
  size?: EnvelopeSize;
  selected?: boolean;
  onSelect?: () => void;
  /** Non-interactive rendering, e.g. inside the selected-packs list. */
  asStatic?: boolean;
  className?: string;
}

export function SpellEnvelope({
  label,
  toneIndex,
  size = 'md',
  selected = false,
  onSelect,
  asStatic = false,
  className = '',
}: SpellEnvelopeProps) {
  const tone = ENVELOPE_TONES[toneIndex % ENVELOPE_TONES.length];
  const dims = SIZES[size];

  const body = (
    <span
      className={`relative block ${dims.box} ${dims.radius} shadow-lg transition-transform duration-300`}
      style={{ backgroundColor: tone.body }}
    >
      {/* Flap: a real V rather than the old skewed bar */}
      <span
        className="absolute inset-x-0 top-0 block h-[62%]"
        style={{
          backgroundColor: tone.flap,
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        }}
      />
      {/* Seam catching the light along the flap edge */}
      <span
        className="pointer-events-none absolute inset-0 block"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.14), rgba(255,255,255,0) 62%)',
        }}
      />
      <span
        className={`absolute inset-x-0 bottom-0 block px-2 pb-2 text-center font-bold text-white ${dims.label}`}
      >
        {label}
      </span>
      <span
        className={`pointer-events-none absolute inset-0 block ${dims.radius} border border-white/25`}
      />
    </span>
  );

  if (asStatic) {
    return (
      <span className={`inline-block ${className}`} aria-hidden>
        {body}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={selected ? `${label}, opened` : `Open ${label}`}
      className={`group block w-full rounded-2xl transition-transform duration-300 hover:scale-105 focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100 ${className}`}
      style={{ ['--tw-ring-color' as string]: tone.ring }}
    >
      {body}
    </button>
  );
}
