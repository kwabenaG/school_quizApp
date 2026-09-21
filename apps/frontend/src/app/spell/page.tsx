'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mail, PartyPopper, Play, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpellEnvelope } from '@/components/spell-envelope';

interface EnvelopePack {
  id: number;
  label: string;
  isSelected: boolean;
  isShuffled: boolean;
}

export default function SpellPage() {
  // Add CSS animation styles
  const animationStyles = `
    @keyframes slide-in-from-right {
      0% {
        left: calc(100% + 200px);
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
      20% {
        left: 50%;
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      80% {
        left: 50%;
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        left: -200px;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
      }
    }
    .animate-slide-in-out {
      animation: slide-in-from-right 2s ease-in-out infinite;
    }
    @keyframes fade-in {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.5s ease-in-out;
    }
    @keyframes fadeInUp {
      0% {
        opacity: 0;
        transform: translateY(20px) scale(0.8);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .envelope-container {
      position: relative;
      width: 100%;
      height: 560px;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 50%, rgba(236, 72, 153, 0.08) 100%);
      border-radius: 2rem;
      border: 2px solid rgba(59, 130, 246, 0.2);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    @media (min-width: 375px) {
      .envelope-container {
        height: 380px;
      }
    }
    @media (min-width: 640px) {
      .envelope-container {
        height: 760px;
        border-radius: 2.5rem;
      }
    }
    @media (min-width: 1024px) {
      .envelope-container {
        height: 680px;
        border-radius: 3rem;
        margin: 0 auto;
      }
    }
    @media (min-width: 1280px) {
      .envelope-container {
        height: 720px;
        margin: 0 auto;
      }
    }
    @media (min-width: 1536px) {
      .envelope-container {
        height: 620px;
        margin: 0 auto;
      }
    }
    .sliding-envelope {
      position: absolute;
      top: calc(50% + 1rem);
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
    }
  `;

  const [envelopes, setEnvelopes] = useState<EnvelopePack[]>([
    { id: 1, label: 'Pack 1', isSelected: false, isShuffled: false },
    { id: 2, label: 'Pack 2', isSelected: false, isShuffled: false },
    { id: 3, label: 'Pack 3', isSelected: false, isShuffled: false },
    { id: 4, label: 'Pack 4', isSelected: false, isShuffled: false },
    { id: 5, label: 'Pack 5', isSelected: false, isShuffled: false }
  ]);
  
  const [selectedPack, setSelectedPack] = useState<EnvelopePack | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentEnvelopeIndex, setCurrentEnvelopeIndex] = useState(0);
  const [showAllEnvelopes, setShowAllEnvelopes] = useState(false);
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null);
  const [audioContextReady, setAudioContextReady] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isBeatPlaying, setIsBeatPlaying] = useState(false);

  // Initialize audio context on mount
  useEffect(() => {
    const initAudio = async () => {
      if (audioContext && audioContext.state !== 'closed') {
        return; // Already have a working audio context
      }
      
      try {
        const ctx = ensureAudioContext();
        if (!ctx) return;
        console.log('🔍 Audio context initialized, state:', ctx.state);
        
        // Resume context if suspended
        if (ctx.state === 'suspended') {
          await ctx.resume();
          console.log('🔍 Audio context resumed');
        }
      } catch (error) {
        console.log('🔍 Audio not supported:', error);
      }
    };

    // Try to initialize audio immediately
    initAudio();

    // Set up user interaction listeners
    const handleUserInteraction = async () => {
      if (!audioContextReady && !audioContext) {
        await initAudio();
      } else if (audioContext && audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
          console.log('🔍 Audio context resumed on user interaction');
        } catch (error) {
          console.log('🔍 Could not resume audio context:', error);
        }
      }
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Show prompt if audio not ready after 1 second
    const promptTimer = setTimeout(() => {
      if (!audioContextReady) {
        setShowAudioPrompt(true);
      }
    }, 1000);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      clearTimeout(promptTimer);
    };
  }, [audioContextReady, audioContext]);

  /**
   * Handles to the running whirl so it can be faded out cleanly.
   *
   * The previous version fired a 500ms note every 200ms at full gain, so two
   * or three notes overlapped at any moment and summed past 1.0 — that
   * clipping is what made it sound broken. It also jumped straight to full
   * volume with no attack, clicking on every note, and held a constant 440Hz,
   * which is a beep rather than anything whirling.
   *
   * This is one continuous oscillator instead: a triangle tone whose pitch is
   * wobbled by an LFO and rolled off with a lowpass, at a gain that leaves
   * plenty of headroom.
   */
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * The carousel sound is one wind pass per envelope rather than a held tone.
   *
   * A whoosh is filtered noise, not an oscillator: white noise swept through a
   * bandpass with a volume envelope. Each pass is shorter than the 2s slot, so
   * they never overlap — which is what wrecked the original, where 500ms notes
   * fired every 200ms and summed past full scale.
   */
  const soundOnRef = useRef(false);
  /**
   * The context also lives in a ref.
   *
   * It was held only in state, and the sound callbacks close over the value
   * from the render they were created in. Right after the click that builds
   * the context those closures still saw null, so the opening envelopes made
   * no sound at all and the wind only started three or four packs in.
   */
  const audioCtxRef = useRef<AudioContext | null>(null);

  /** Returns a usable context, creating or resuming it as needed. */
  const ensureAudioContext = (): AudioContext | null => {
    const existing = audioCtxRef.current;
    if (existing && existing.state !== 'closed') {
      if (existing.state === 'suspended') existing.resume().catch(() => {});
      return existing;
    }
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      setAudioContext(ctx);
      setAudioContextReady(true);
      return ctx;
    } catch (error) {
      console.log('🔍 Could not create audio context:', error);
      return null;
    }
  };
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  const getNoiseBuffer = (ctx: AudioContext) => {
    if (noiseBufferRef.current) return noiseBufferRef.current;
    const length = Math.floor(ctx.sampleRate * 0.8);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseBufferRef.current = buffer;
    return buffer;
  };

  /** One envelope going past. */
  const playWhoosh = () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.6;

    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    source.loop = true;

    // Sweeping the passband up then down is what reads as movement.
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.setValueAtTime(0.9, now);
    band.frequency.setValueAtTime(320, now);
    band.frequency.exponentialRampToValueAtTime(1900, now + duration * 0.45);
    band.frequency.exponentialRampToValueAtTime(300, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(band).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + duration + 0.02);
  };

  // Function to play selection sound
  const playSelectionSound = () => {
    const audioContext = ensureAudioContext();
    if (!audioContext) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'triangle';
      // Create a selection sound
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      
      // Ramp the attack: setting gain straight to its peak steps the signal
      // and clicks.
      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.14);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.log('🔍 Could not play selection sound:', error);
    }
  };

  // Function to play completion sound
  const playCompletionSound = () => {
    const audioContext = ensureAudioContext();
    if (!audioContext) return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'triangle';
      // Create a completion sound
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.45);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('🔍 Could not play completion sound:', error);
    }
  };

  // Function to start whirling sound
  const startWhirlSound = async () => {
    // Idempotent on purpose. The effect that calls this re-runs on most
    // renders, and the carousel re-renders constantly while spinning, so
    // tearing the whirl down and rebuilding it each time made it stutter.
    if (soundOnRef.current) {
      return;
    }
    
    // Create new audio context if needed
    if (!audioContext || audioContext.state === 'closed') {
      console.log('🔍 Creating new audio context...');
      try {
        const newContext = ensureAudioContext();
        if (!newContext) return;
        console.log('🔍 ✅ New audio context created, state:', newContext.state);
      } catch (error) {
        console.log('🔍 ❌ Could not create audio context:', error);
        return;
      }
    }
    
    // Get current audio context
    const currentContext = audioContext;
    if (!currentContext) {
      console.log('🔍 ❌ No audio context available');
      return;
    }
    
    console.log('🔍 Audio context state:', currentContext.state);
    
    // Resume audio context if suspended
    if (currentContext.state === 'suspended') {
      console.log('🔍 Resuming suspended audio context...');
      try {
        await currentContext.resume();
        console.log('🔍 ✅ Audio context resumed, new state:', currentContext.state);
      } catch (error) {
        console.log('🔍 ❌ Could not resume audio context:', error);
        return;
      }
    }
    
    startWhirlSoundLoop();
  };

  // Arm the carousel sound. Each envelope pass plays its own whoosh, driven
  // by the effect on currentEnvelopeIndex below.
  const startWhirlSoundLoop = () => {
    const ctx = ensureAudioContext();
    if (!ctx) {
      console.log('🔍 ❌ Cannot start carousel sound - no valid audio context');
      return;
    }

    soundOnRef.current = true;
    setIsBeatPlaying(true);
    playWhoosh(); // the pass already on screen
    console.log('🔍 ✅ Carousel sound armed');
  };

  const stopWhirlSound = () => {
    soundOnRef.current = false;
    setIsBeatPlaying(false);
  };

  // One wind pass per envelope. Keyed on the index so it fires exactly once
  // per change, in step with the slide.
  useEffect(() => {
    if (!soundOnRef.current || !isAnimating || showAllEnvelopes) return;
    playWhoosh();
    // playWhoosh reads refs and the audio context; re-running on index alone is
    // what keeps one sound per pass.
  }, [currentEnvelopeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to restart whirling sound (if all envelopes are deselected)
  const restartWhirlSound = () => {
    const hasSelectedEnvelopes = envelopes.some(env => env.isSelected);
    if (!hasSelectedEnvelopes && audioContextReady && !isBeatPlaying) {
      startWhirlSound();
    }
  };

  // Start beat when carousel starts
  useEffect(() => {
    console.log('🔍 useEffect triggered - isAnimating:', isAnimating, 'audioContextReady:', audioContextReady, 'audioContext state:', audioContext?.state);
    if (isAnimating && audioContext && audioContext.state !== 'closed') {
      console.log('🔍 Starting beat automatically - conditions met');
      // Add a small delay to ensure audio context is ready
      setTimeout(async () => {
        // Double-check audio context state before starting
        if (audioContext && audioContext.state === 'suspended') {
          try {
            await audioContext.resume();
            console.log('🔍 Audio context resumed in useEffect');
          } catch (error) {
            console.log('🔍 Could not resume audio context in useEffect:', error);
            return;
          }
        }
        await startWhirlSound();
      }, 100);
    } else {
      console.log('🔍 Beat not starting - isAnimating:', isAnimating, 'audioContextReady:', audioContextReady, 'audioContext:', !!audioContext, 'state:', audioContext?.state);
    }
    // startWhirlSound is deliberately not a dependency: it is recreated every
    // render, and starting is idempotent.
  }, [isAnimating, audioContextReady, audioContext]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isAnimating) {
      startSlidingAnimation();
    }
    
    // Cleanup on unmount
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
      stopWhirlSound();
      if (audioContext && audioContext.state !== 'closed') {
        try {
          audioContext.close();
          audioCtxRef.current = null;
        } catch (error) {
          console.log('🔍 AudioContext already closed or error closing:', error);
        }
      }
    };
  }, [isAnimating]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restart animation when selection changes
  useEffect(() => {
    if (isAnimating && animationInterval) {
      clearInterval(animationInterval);
      setCurrentEnvelopeIndex(0); // Reset to first available envelope
      startSlidingAnimation();
      // Don't restart whirling sound - it should stop when envelope is selected
    }
  }, [envelopes.filter(env => !env.isSelected).length]); // eslint-disable-line react-hooks/exhaustive-deps

  const startSlidingAnimation = () => {
    // Held in a ref as well as state: the state value is stale inside the
    // closures below, which previously let a second interval be created
    // without the first being cleared.
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }
    if (fanTimeoutRef.current) {
      clearTimeout(fanTimeoutRef.current);
      fanTimeoutRef.current = null;
    }

    setIsAnimating(true);

    const interval = setInterval(() => {
      // The fan-out lasts 3s while this ticks every 2s. Advancing underneath
      // it burned an envelope invisibly, so the next lap began on the second
      // pack and the first was never shown again.
      if (fanTimeoutRef.current) return;

      setCurrentEnvelopeIndex(prevIndex => {
        const nonSelectedEnvelopes = envelopes.filter(env => !env.isSelected);
        if (nonSelectedEnvelopes.length === 0) return prevIndex;

        const currentIndex = (prevIndex + 1) % nonSelectedEnvelopes.length;

        // Completed a lap: fan the remaining packs out, then start again from
        // the first one.
        if (currentIndex === 0 && nonSelectedEnvelopes.length > 1) {
          setShowAllEnvelopes(true);
          fanTimeoutRef.current = setTimeout(() => {
            fanTimeoutRef.current = null;
            setShowAllEnvelopes(false);
            setCurrentEnvelopeIndex(0);
            // Restart the timer so the new lap begins a fresh 2s slot. The 3s
            // fan does not divide into the 2s cadence, so without this the
            // first pack of every lap is cut to about one second.
            startSlidingAnimation();
          }, 3000);
        }

        return currentIndex;
      });
    }, 2000); // Change envelope every 2 seconds

    slideIntervalRef.current = interval;
    setAnimationInterval(interval);
  };

  // Function to restart the carousel
  const restartCarousel = () => {
    console.log('🔍 ===== RESTARTING CAROUSEL =====');
    console.log('🔍 Current state - isBeatPlaying:', isBeatPlaying, 'isAnimating:', isAnimating);
    
    // Always stop any existing beat first
    if (isBeatPlaying) {
      console.log('🔍 Stopping existing beat before restart');
      stopWhirlSound();
    }
    
    // Clear the interval and any pending fan-out; a fan timer left running
    // would reset the index after the restart had already set it.
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
      slideIntervalRef.current = null;
    }
    if (fanTimeoutRef.current) {
      clearTimeout(fanTimeoutRef.current);
      fanTimeoutRef.current = null;
    }
    setAnimationInterval(null);
    
    // Reset all states immediately
    setIsAnimating(false);
    setSelectedPack(null);
    setCurrentEnvelopeIndex(0);
    setShowAllEnvelopes(false);
    
    // Use a small delay to ensure state reset, then start everything
    setTimeout(() => {
      console.log('🔍 Starting animation and sound after reset');
      setIsAnimating(true);
      startSlidingAnimation();
      
      // Start the beat directly after animation starts
      setTimeout(async () => {
        console.log('🔍 Starting beat directly from restartCarousel');
        await startWhirlSound();
      }, 200);
    }, 100);
    
    console.log('🔍 ===== CAROUSEL RESTART INITIATED =====');
  };

  // Function to render carousel content
  const renderCarouselContent = () => {
    const nonSelectedEnvelopes = envelopes.filter((env) => !env.isSelected);

    if (showAllEnvelopes) {
      return (
        <div className="grid h-full w-full grid-cols-2 items-center gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {nonSelectedEnvelopes.map((envelope, index) => (
            <div
              key={envelope.id}
              className="flex flex-col items-center gap-3"
              style={{
                animationName: 'fadeInUp',
                animationDuration: '0.5s',
                animationTimingFunction: 'ease-out',
                animationFillMode: 'both',
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <SpellEnvelope
                label={envelope.label}
                toneIndex={envelope.id - 1}
                size="fluid"
                selected={envelope.isSelected}
                onSelect={() => selectEnvelope(envelope)}
              />
            </div>
          ))}
        </div>
      );
    }

    const currentEnvelope = nonSelectedEnvelopes[currentEnvelopeIndex];

    if (!currentEnvelope) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <PartyPopper className="size-8" />
          </span>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">
            All packs selected
          </h3>
          <p className="mt-2 text-slate-600">
            Every envelope has been opened. Restart to go again.
          </p>
        </div>
      );
    }

    return (
      <div
        key={currentEnvelope.id}
        className="sliding-envelope animate-slide-in-out flex flex-col items-center gap-5"
      >
        <SpellEnvelope
          label={currentEnvelope.label}
          toneIndex={currentEnvelope.id - 1}
          size="lg"
          onSelect={() => selectEnvelope(currentEnvelope)}
        />
      </div>
    );
  };

  const selectEnvelope = (envelope: EnvelopePack) => {
    setEnvelopes(prev => {
      const newEnvelopes = prev.map(env => ({ 
        ...env, 
        isSelected: env.id === envelope.id ? !env.isSelected : env.isSelected // Toggle selection
      }));
      
      // Set selected pack if envelope is being selected
      if (!envelope.isSelected) {
        setSelectedPack(envelope);
        // Stop the carousel when an envelope is selected
        setIsAnimating(false);
        // Clear animation interval
        if (animationInterval) {
          clearInterval(animationInterval);
          setAnimationInterval(null);
        }
        // Stop the beat and reset state
        stopWhirlSound();
      } else {
        // If deselecting, clear selected pack
        setSelectedPack(null);
      }
      
      // Check if all envelopes are now selected
      const allSelected = newEnvelopes.every(env => env.isSelected);
      if (allSelected) {
        // Stop whirling sound and play completion sound
        stopWhirlSound();
        setTimeout(() => playCompletionSound(), 100);
      } else {
        // Check if any envelope is selected
        const hasSelectedEnvelopes = newEnvelopes.some(env => env.isSelected);
        if (hasSelectedEnvelopes) {
          // Stop the whirling beat when any envelope is selected
          stopWhirlSound();
        } else {
          // Restart beat if no envelopes are selected
          setTimeout(() => restartWhirlSound(), 100);
        }
      }
      
      return newEnvelopes;
    });
    
    // Play selection sound
    playSelectionSound();
  };

  const selectedCount = envelopes.filter((env) => env.isSelected).length;
  const remaining = envelopes.filter((env) => !env.isSelected);

  return (
    <div
      className="min-h-screen bg-white text-slate-900"
      onClick={() => {
        // Start audio on first click if not already started
        if (!audioContextReady && !audioContext) {
          try {
            ensureAudioContext();
            setShowAudioPrompt(false);
            console.log('🔍 Audio context initialized on click');
          } catch (error) {
            console.log('🔍 Audio not supported:', error);
          }
        }
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      {/* Header — matches the rest of the app */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
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
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:block"
            >
              Words
            </Link>
            <Link
              href="/quiz-master"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Quiz Master
            </Link>
          </div>
        </nav>
      </header>

      {showAudioPrompt && (
        <div
          role="status"
          className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 shadow-sm"
        >
          Click anywhere to start the beat
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Intro */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
            <Mail className="size-3.5" />
            Spell Challenge
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Pick an envelope
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-pretty text-slate-600">
            Start the carousel and let the packs spin. Tap one to stop it and
            claim that envelope for the round.
          </p>

          {/* Progress */}
          <div className="mx-auto mt-8 max-w-xs">
            <div className="flex items-center justify-between text-sm font-medium text-slate-600">
              <span>{selectedCount} of {envelopes.length} opened</span>
              <span className="tabular-nums">{remaining.length} left</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={envelopes.length}
              aria-valuenow={selectedCount}
              aria-label="Envelope packs opened"
            >
              <div
                className="h-full rounded-full bg-indigo-600 transition-[width] duration-500"
                style={{ width: `${(selectedCount / envelopes.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Primary control */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button
              onClick={async () => {
                console.log('🔍 ===== BUTTON CLICKED =====');
                console.log('🔍 Current state - isAnimating:', isAnimating, 'isBeatPlaying:', isBeatPlaying);
                console.log('🔍 Audio context state:', audioContext?.state, 'audioContextReady:', audioContextReady);

                // Ensure audio context is ready
                if (!audioContext || audioContext.state === 'closed') {
                  console.log('🔍 Creating new audio context...');
                  try {
                    const newContext = ensureAudioContext();
                    if (!newContext) return;
                    console.log('🔍 ✅ New audio context created, state:', newContext.state);
                  } catch (error) {
                    console.log('🔍 ❌ Could not create audio context:', error);
                    return;
                  }
                } else if (audioContext.state === 'suspended') {
                  console.log('🔍 Resuming suspended audio context...');
                  try {
                    await audioContext.resume();
                    console.log('🔍 ✅ Audio context resumed, state:', audioContext.state);
                  } catch (error) {
                    console.log('🔍 ❌ Could not resume audio context:', error);
                    return;
                  }
                }

                if (!isAnimating) {
                  console.log('🔍 === STARTING NEW CAROUSEL ===');
                  console.log('🔍 Starting sliding animation...');
                  startSlidingAnimation();
                  setTimeout(async () => {
                    console.log('🔍 Starting whirl sound...');
                    await startWhirlSound();
                    console.log('🔍 Whirl sound started, isBeatPlaying should be true');
                  }, 300);
                } else {
                  console.log('🔍 === RESTARTING EXISTING CAROUSEL ===');
                  restartCarousel();
                  console.log('🔍 Restart completed');
                }
                console.log('🔍 ===== BUTTON CLICK COMPLETE =====');
              }}
              className="h-12 rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-transform hover:bg-indigo-700 active:scale-[0.98] motion-reduce:transition-none"
            >
              {isAnimating ? (
                <>
                  <RotateCw className="size-4" />
                  Restart carousel
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Start carousel
                </>
              )}
            </Button>

            {audioContextReady && (
              <p
                aria-live="polite"
                className="flex items-center gap-2 text-sm text-slate-500"
              >
                {isBeatPlaying ? (
                  <>
                    <Volume2 className="size-4 text-emerald-600" />
                    <span className="font-medium text-emerald-700">Beat playing</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="size-4" />
                    Audio ready
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Stage + selected list */}
        <div className="mt-12 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
            <div className={isAnimating ? 'envelope-container w-full' : 'w-full'}>
              {isAnimating ? (
                renderCarouselContent()
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  {remaining.length > 0 ? (
                    <>
                      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                        {remaining.length} {remaining.length === 1 ? 'envelope' : 'envelopes'} left
                      </h2>
                      <p className="mt-2 text-slate-600">
                        Start the carousel, or pick one straight from here.
                      </p>

                      <div className="mt-8 grid w-full grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
                        {remaining.map((envelope) => (
                          <div key={envelope.id} className="flex flex-col items-center gap-3">
                            <SpellEnvelope
                              label={envelope.label}
                              toneIndex={envelope.id - 1}
                              size="fluid"
                              onSelect={() => selectEnvelope(envelope)}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <PartyPopper className="size-8" />
                      </span>
                      <h2 className="mt-5 text-xl font-bold text-slate-900 sm:text-2xl">
                        Every pack is open
                      </h2>
                      <p className="mt-2 text-slate-600">
                        Restart to shuffle them back in.
                      </p>
                    </>
                  )}

                  <Button
                    onClick={restartCarousel}
                    variant="outline"
                    className="mt-8 h-11 rounded-xl border-slate-300 px-6 font-semibold"
                  >
                    <RotateCw className="size-4" />
                    Restart carousel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Opened packs */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">Opened packs</h2>
              <p className="text-sm text-slate-500">
                {selectedCount === 0
                  ? 'Nothing opened yet.'
                  : `${selectedCount} of ${envelopes.length} claimed.`}
                {selectedPack ? ` Latest: ${selectedPack.label}.` : ''}
              </p>
            </div>

            <ul className="mt-5 flex flex-wrap gap-3">
              {envelopes
                .filter((env) => env.isSelected)
                .map((envelope) => (
                  <li
                    key={envelope.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                  >
                    <SpellEnvelope
                      label={envelope.label}
                      toneIndex={envelope.id - 1}
                      size="sm"
                      asStatic
                    />
                    <div className="min-w-0">
                      <p className="font-semibold">{envelope.label}</p>
                      <p className="text-sm text-emerald-700">Opened</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectEnvelope(envelope)}
                      className="ml-auto rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Undo
                    </button>
                  </li>
                ))}
            </ul>

            {selectedCount === 0 && (
              <p className="mt-5 rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400">
                Opened envelopes collect here.
              </p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
