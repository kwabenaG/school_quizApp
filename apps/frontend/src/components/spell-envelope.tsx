'use client';

/**
 * One envelope in the Spell Challenge pack picker.
 *
 * Drawn as an actual envelope rather than a rounded card: landscape, with the
 * four folded panels of a sealed envelope seen from the back — left and right
 * flaps meeting in the middle, the bottom flap over them, and the sealing flap
 * on top. An earlier version was a portrait rectangle with a single triangle,
 * which read as a playing card.
 *
 * It renders a real <button>. The originals were click-handled <div>s, so the
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

const SIZES: Record<EnvelopeSize, string> = {
  sm: 'h-14 w-20',
  md: 'h-24 w-36 sm:h-28 sm:w-44',
  lg: 'h-44 w-64 sm:h-56 sm:w-80 lg:h-72 lg:w-[26rem]',
  // Fills whatever cell it is given, so a row of packs spans the screen
  // instead of wrapping at a fixed width.
  fluid: 'w-full aspect-[3/2]',
};

interface SpellEnvelopeProps {
  label: string;
  /** Index into ENVELOPE_TONES; wraps if there are more packs than tones. */
  toneIndex: number;
  size?: EnvelopeSize;
  selected?: boolean;
  onSelect?: () => void;
  /** Non-interactive rendering, e.g. inside the opened-packs list. */
  asStatic?: boolean;
  className?: string;
}

// Envelope geometry, in viewBox units. Panels meet at (150, 104).
const W = 300;
const H = 200;
const MX = W / 2;
const MY = 104;
/** How far down the sealing flap reaches. Slightly past the panel meet. */
const FLAP_Y = 118;

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

  const body = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`block h-full w-full drop-shadow-lg ${asStatic ? '' : 'transition-transform duration-300'}`}
      role="presentation"
    >
      {/* Paper */}
      <rect x="0" y="0" width={W} height={H} rx="10" fill={tone.body} />

      {/* Side panels folded in. Shaded rather than recoloured so one tone
          drives the whole envelope. */}
      <path d={`M0 0 L${MX} ${MY} L0 ${H} Z`} fill="rgba(0,0,0,0.10)" />
      <path d={`M${W} 0 L${MX} ${MY} L${W} ${H} Z`} fill="rgba(0,0,0,0.10)" />

      {/* Bottom panel folded over them */}
      <path d={`M0 ${H} L${MX} ${MY} L${W} ${H} Z`} fill="rgba(0,0,0,0.04)" />
      <path
        d={`M0 ${H} L${MX} ${MY} L${W} ${H}`}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5"
      />

      {/* Sealing flap, last so it sits over everything */}
      <path d={`M0 0 L${MX} ${FLAP_Y} L${W} 0 Z`} fill={tone.flap} />
      <path
        d={`M0 0 L${MX} ${FLAP_Y} L${W} 0`}
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
      />
      {/* Light catching the fold */}
      <path
        d={`M0 2 L${MX} ${FLAP_Y - 3} L${W} 2`}
        fill="none"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="1.5"
      />

      {/* Seal at the point of the flap */}
      <circle cx={MX} cy={FLAP_Y - 8} r="13" fill="rgba(255,255,255,0.92)" />
      <circle
        cx={MX}
        cy={FLAP_Y - 8}
        r="13"
        fill="none"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1.5"
      />
      <text
        x={MX}
        y={FLAP_Y - 3}
        textAnchor="middle"
        fontSize="15"
        fontWeight="800"
        fill={tone.flap}
      >
        {label.replace(/\D/g, '') || '?'}
      </text>

      {/* Name, sitting on the bottom panel */}
      <text
        x={MX}
        y={H - 22}
        textAnchor="middle"
        fontSize="26"
        fontWeight="800"
        fill="#fff"
        style={{ letterSpacing: '0.02em' }}
      >
        {label}
      </text>

      <rect
        x="0.75"
        y="0.75"
        width={W - 1.5}
        height={H - 1.5}
        rx="10"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
    </svg>
  );

  if (asStatic) {
    return (
      <span className={`inline-block ${SIZES[size]} ${className}`} aria-hidden>
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
      className={`group block rounded-xl transition-transform duration-300 hover:scale-105 focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100 ${SIZES[size]} ${className}`}
      style={{ ['--tw-ring-color' as string]: tone.ring }}
    >
      {body}
    </button>
  );
}
