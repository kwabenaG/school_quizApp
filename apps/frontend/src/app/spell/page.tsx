'use client';

import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
      height: 500px;
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
        height: 300px;
      }
    }
    @media (min-width: 640px) {
      .envelope-container {
        height: 550px;
        border-radius: 2.5rem;
      }
    }
    @media (min-width: 1024px) {
      .envelope-container {
        height: 580px;
        border-radius: 3rem;
        margin: 0 auto;
      }
    }
    @media (min-width: 1280px) {
      .envelope-container {
        height: 600px;
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
  const [whirlSoundInterval, setWhirlSoundInterval] = useState<NodeJS.Timeout | null>(null);
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
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        setAudioContext(ctx);
        setAudioContextReady(true);
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

  // Function to play whirling sound
  const playWhirlSound = () => {
    console.log('🔍 🔊 playWhirlSound called - audioContext:', !!audioContext, 'state:', audioContext?.state);
    
    if (!audioContext) {
      console.log('🔍 ❌ Cannot play whirl sound - no audio context');
      return;
    }
    
    if (audioContext.state === 'closed') {
      console.log('🔍 ❌ Cannot play whirl sound - audio context is closed');
      return;
    }
    
    if (audioContext.state === 'suspended') {
      console.log('🔍 ⏸️ Audio context is suspended, attempting to resume...');
      audioContext.resume().then(() => {
        console.log('🔍 ✅ Audio context resumed, retrying sound');
        playWhirlSound();
      }).catch(error => {
        console.log('🔍 ❌ Could not resume audio context:', error);
      });
      return;
    }
    
    try {
      console.log('🔍 🎵 Creating oscillator...');
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a very simple, loud sound
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      
      // Very loud volume
      gainNode.gain.setValueAtTime(1.0, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('🔍 🔊✅ Playing simple sound - should be very loud');
    } catch (error) {
      console.log('🔍 ❌ Could not play whirling sound:', error);
    }
  };

  // Function to play selection sound
  const playSelectionSound = () => {
    if (!audioContext || audioContext.state === 'closed') return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a selection sound
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('🔍 Could not play selection sound:', error);
    }
  };

  // Function to play completion sound
  const playCompletionSound = () => {
    if (!audioContext || audioContext.state === 'closed') return;
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a completion sound
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.4);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('🔍 Could not play completion sound:', error);
    }
  };

  // Function to start whirling sound
  const startWhirlSound = async () => {
    console.log('🔍 ===== startWhirlSound CALLED =====');
    console.log('🔍 Current state - isBeatPlaying:', isBeatPlaying, 'whirlSoundInterval exists:', !!whirlSoundInterval);
    
    // Always stop any existing beat first
    console.log('🔍 Stopping any existing beat...');
    stopWhirlSound();
    
    // Create new audio context if needed
    if (!audioContext || audioContext.state === 'closed') {
      console.log('🔍 Creating new audio context...');
      try {
        const newContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        setAudioContext(newContext);
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

  // Separate function to start the actual sound loop
  const startWhirlSoundLoop = () => {
    const currentContext = audioContext;
    if (!currentContext || currentContext.state === 'closed') {
      console.log('🔍 ❌ Cannot start sound loop - no valid audio context');
      return;
    }
    
    console.log('🔍 ✅ Starting beat loop, audio context state:', currentContext.state);
    setIsBeatPlaying(true);
    
    // Use setInterval instead of setTimeout recursion
    const interval = setInterval(() => {
      console.log('🔍 🔊 Beat tick - playing sound');
      playWhirlSound();
    }, 200);
    
    setWhirlSoundInterval(interval as unknown as NodeJS.Timeout);
    console.log('🔍 ✅ Beat interval set, isBeatPlaying should be true');
    console.log('🔍 ===== startWhirlSound COMPLETE =====');
  };

  // Function to stop whirling sound
  const stopWhirlSound = () => {
    console.log('🔍 stopWhirlSound called');
    if (whirlSoundInterval) {
      clearInterval(whirlSoundInterval as unknown as NodeJS.Timeout);
      setWhirlSoundInterval(null);
      console.log('🔍 Cleared whirl sound interval');
    }
    setIsBeatPlaying(false);
    console.log('🔍 Whirl sound stopped');
  };

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
  }, [isAnimating, audioContextReady, audioContext, startWhirlSound]); // Include all dependencies

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
    // Clear existing interval
    if (animationInterval) {
      clearInterval(animationInterval);
    }
    
    // Set animating state to true
    setIsAnimating(true);
    
    const interval = setInterval(() => {
      setCurrentEnvelopeIndex(prevIndex => {
    const nonSelectedEnvelopes = envelopes.filter(env => !env.isSelected);
        if (nonSelectedEnvelopes.length === 0) return prevIndex;
        
        const currentIndex = (prevIndex + 1) % nonSelectedEnvelopes.length;
        
        // When we reach the last envelope, show all envelopes
        if (currentIndex === 0 && nonSelectedEnvelopes.length > 1) {
          setShowAllEnvelopes(true);
          // After showing all envelopes for 3 seconds, go back to carousel
          setTimeout(() => {
            setShowAllEnvelopes(false);
          }, 3000);
        }
        
        return currentIndex;
      });
    }, 2000); // Change envelope every 2 seconds
    
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
    
    // Clear any existing animation interval
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
    
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
    const nonSelectedEnvelopes = envelopes.filter(env => !env.isSelected);
    
    const envelopeColors = [
      { bg: 'from-blue-500 to-blue-700', flap: 'from-blue-600 to-blue-800', shadow: 'shadow-blue-500/50' },
      { bg: 'from-purple-500 to-purple-700', flap: 'from-purple-600 to-purple-800', shadow: 'shadow-purple-500/50' },
      { bg: 'from-pink-500 to-pink-700', flap: 'from-pink-600 to-pink-800', shadow: 'shadow-pink-500/50' },
      { bg: 'from-orange-500 to-orange-700', flap: 'from-orange-600 to-orange-800', shadow: 'shadow-orange-500/50' },
      { bg: 'from-teal-500 to-teal-700', flap: 'from-teal-600 to-teal-800', shadow: 'shadow-teal-500/50' }
    ];
    
    // Show all envelopes when showAllEnvelopes is true
    if (showAllEnvelopes) {
      return (
        <div className="flex flex-nowrap items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 h-full overflow-x-auto">
          {nonSelectedEnvelopes.map((envelope, index) => {
            const colorIndex = envelope.id - 1;
            const colors = envelopeColors[colorIndex % envelopeColors.length];

  return (
              <div
                key={envelope.id}
                onClick={() => selectEnvelope(envelope)}
                className="cursor-pointer transform hover:scale-105 transition-all duration-300"
                style={{
                  animationName: 'fadeInUp',
                  animationDuration: '0.5s',
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'both',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Envelope */}
                <div className={`w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 lg:w-36 lg:h-44 xl:w-40 xl:h-48 2xl:w-44 2xl:h-52 relative transform hover:scale-105 transition-all duration-300 cursor-pointer`}>
                  {/* Envelope Body */}
                  <div className={`absolute inset-0 rounded-xl lg:rounded-2xl shadow-xl bg-gradient-to-b ${colors.bg} hover:${colors.shadow} transition-all duration-300`}
                       style={{
                         background: `linear-gradient(135deg, ${colors.bg.includes('blue') ? '#3b82f6' : colors.bg.includes('purple') ? '#8b5cf6' : colors.bg.includes('pink') ? '#ec4899' : colors.bg.includes('orange') ? '#f97316' : '#14b8a6'}, ${colors.bg.includes('blue') ? '#1e40af' : colors.bg.includes('purple') ? '#7c3aed' : colors.bg.includes('pink') ? '#db2777' : colors.bg.includes('orange') ? '#ea580c' : '#0d9488'})`,
                         boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                       }}>
                    
                    {/* Envelope Flap */}
                    <div className={`absolute top-0 left-0 w-full h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 2xl:h-18 transform -skew-y-1 origin-top rounded-t-xl lg:rounded-t-2xl`}
                         style={{
                           background: `linear-gradient(135deg, ${colors.flap.includes('blue') ? '#1e40af' : colors.flap.includes('purple') ? '#7c3aed' : colors.flap.includes('pink') ? '#db2777' : colors.flap.includes('orange') ? '#ea580c' : '#0d9488'}, ${colors.flap.includes('blue') ? '#1e3a8a' : colors.flap.includes('purple') ? '#6d28d9' : colors.flap.includes('pink') ? '#be185d' : colors.flap.includes('orange') ? '#c2410c' : '#0f766e'})`,
                           boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                         }}>
                      {/* Flap Fold Line */}
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20"></div>
                    </div>
          
                    {/* Envelope Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-14 2xl:pt-16">
                      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mb-2 sm:mb-3 md:mb-4 lg:mb-5 drop-shadow-lg">✉️</div>
                      <div className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl drop-shadow-lg text-center px-2">
                        {envelope.label}
        </div>
      </div>

                    {/* Envelope Edge Highlight */}
                    <div className="absolute inset-0 rounded-xl lg:rounded-2xl border border-white/20 pointer-events-none"></div>
                    
                    {/* Bottom Shadow */}
                    <div className="absolute -bottom-1 left-2 right-2 h-2 bg-black/10 rounded-b-xl lg:rounded-b-2xl blur-sm"></div>
                  </div>
        </div>

                {/* Pack Label */}
                <div className="text-center mt-2 sm:mt-3 md:mt-4 lg:mt-5 xl:mt-6">
                  <div className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
                    {envelope.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Show single sliding envelope
    const currentEnvelope = nonSelectedEnvelopes[currentEnvelopeIndex];
    if (!currentEnvelope) {
      // All envelopes selected - show completion message
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">All Packs Selected!</h3>
          <p className="text-gray-600">You&apos;ve selected all available envelope packs.</p>
        </div>
      );
    }
    
    const colorIndex = currentEnvelope.id - 1;
    const colors = envelopeColors[colorIndex % envelopeColors.length];
    
    return (
      <div
        key={currentEnvelope.id}
        onClick={() => selectEnvelope(currentEnvelope)}
        className="sliding-envelope cursor-pointer transform hover:scale-105 transition-all duration-500 animate-slide-in-out"
          >
            {/* Envelope */}
        <div className={`w-35 h-44 sm:w-40 sm:h-48 md:w-48 md:h-56 lg:w-52 lg:h-60 xl:w-56 xl:h-64 2xl:w-60 2xl:h-68 relative transform hover:scale-105 transition-all duration-300 cursor-pointer`}>
          {/* Envelope Body */}
          <div className={`absolute inset-0 rounded-2xl lg:rounded-3xl shadow-2xl bg-gradient-to-b ${colors.bg} hover:${colors.shadow} transition-all duration-300`}
               style={{
                 background: `linear-gradient(135deg, ${colors.bg.includes('blue') ? '#3b82f6' : colors.bg.includes('purple') ? '#8b5cf6' : colors.bg.includes('pink') ? '#ec4899' : colors.bg.includes('orange') ? '#f97316' : '#14b8a6'}, ${colors.bg.includes('blue') ? '#1e40af' : colors.bg.includes('purple') ? '#7c3aed' : colors.bg.includes('pink') ? '#db2777' : colors.bg.includes('orange') ? '#ea580c' : '#0d9488'})`,
                 boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
               }}>
            
              {/* Envelope Flap */}
            <div className={`absolute top-0 left-0 w-full h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 2xl:h-22 transform -skew-y-1 origin-top rounded-t-2xl lg:rounded-t-3xl`}
                 style={{
                   background: `linear-gradient(135deg, ${colors.flap.includes('blue') ? '#1e40af' : colors.flap.includes('purple') ? '#7c3aed' : colors.flap.includes('pink') ? '#db2777' : colors.flap.includes('orange') ? '#ea580c' : '#0d9488'}, ${colors.flap.includes('blue') ? '#1e3a8a' : colors.flap.includes('purple') ? '#6d28d9' : colors.flap.includes('pink') ? '#be185d' : colors.flap.includes('orange') ? '#c2410c' : '#0f766e'})`,
                   boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                 }}>
              {/* Flap Fold Line */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20"></div>
            </div>
              
              {/* Envelope Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-8 sm:pt-10 md:pt-12 lg:pt-14 xl:pt-16 2xl:pt-18">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl mb-3 sm:mb-4 md:mb-5 lg:mb-6 drop-shadow-lg">✉️</div>
              <div className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl drop-shadow-lg text-center px-2">
                {currentEnvelope.label}
                </div>
              </div>
              
            {/* Envelope Edge Highlight */}
            <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border border-white/20 pointer-events-none"></div>
            
            {/* Bottom Shadow */}
            <div className="absolute -bottom-1 left-2 right-2 h-2 bg-black/10 rounded-b-2xl lg:rounded-b-3xl blur-sm"></div>
              </div>
            </div>
            
            {/* Pack Label */}
        <div className="text-center mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12">
          <div className="text-gray-800 font-semibold text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl">
            {currentEnvelope.label}
          </div>
        </div>
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

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100"
      onClick={() => {
        // Start audio on first click if not already started
        if (!audioContextReady && !audioContext) {
          try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            setAudioContext(ctx);
            setAudioContextReady(true);
            setShowAudioPrompt(false);
            console.log('🔍 Audio context initialized on click');
          } catch (error) {
            console.log('🔍 Audio not supported:', error);
          }
        }
      }}
    >
      {/* Inject CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-800 hover:text-blue-600 transition-colors">
              <span className="text-lg sm:text-xl md:text-2xl">🏠</span>
              <span className="text-sm sm:text-base md:text-lg font-semibold">Home</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/quiz-master" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base font-medium">
                Quiz Master
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base font-medium">
                Admin
              </Link>
              </div>
            </div>
          </div>
      </nav>

      {/* Audio Prompt */}
      {showAudioPrompt && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2 text-yellow-800 text-sm font-medium z-50">
          Click anywhere to start the beat!
        </div>
      )}

      {/* Main Content */}
      <div className="h-screen flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 pt-4 sm:pt-6 md:pt-8 lg:pt-10 xl:pt-12">
        <div className="text-center mb-1 sm:mb-2 md:mb-3 lg:mb-4 xl:mb-5 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-1 sm:mb-2 md:mb-3 lg:mb-4">
            Choose your envelope pack!
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-4">
            Click on the sliding envelopes to select them
          </p>
          
          {/* Selection Counter */}
        {envelopes.some(env => env.isSelected) && (
            <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 text-sm font-semibold text-blue-800 mb-4">
              <span className="mr-2">📦</span>
              Selected: {envelopes.filter(env => env.isSelected).length} of {envelopes.length} packs
            </div>
          )}
          
          {/* Start Carousel Button */}
          <div className="text-center mb-6">
            <button
              onClick={async () => {
                console.log('🔍 ===== BUTTON CLICKED =====');
                console.log('🔍 Current state - isAnimating:', isAnimating, 'isBeatPlaying:', isBeatPlaying);
                console.log('🔍 Audio context state:', audioContext?.state, 'audioContextReady:', audioContextReady);
                console.log('🔍 Whirl sound interval exists:', !!whirlSoundInterval);
                
                // Ensure audio context is ready
                if (!audioContext || audioContext.state === 'closed') {
                  console.log('🔍 Creating new audio context...');
                  try {
                    const newContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                    setAudioContext(newContext);
                    setAudioContextReady(true);
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
                  
                  // Start carousel
                  console.log('🔍 Starting sliding animation...');
                  startSlidingAnimation();
                  
                  // Start beat after a short delay to ensure audio context is ready
                  setTimeout(async () => {
                    console.log('🔍 Starting whirl sound...');
                    await startWhirlSound();
                    console.log('🔍 Whirl sound started, isBeatPlaying should be true');
                  }, 300);
                } else {
                  console.log('🔍 === RESTARTING EXISTING CAROUSEL ===');
                  // If carousel is already running, restart it
                  restartCarousel();
                  console.log('🔍 Restart completed');
                }
                console.log('🔍 ===== BUTTON CLICK COMPLETE =====');
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {isAnimating ? '🔄 Restart Carousel & Sound' : '🎠 Start Carousel & Sound'}
            </button>
            <div className="mt-2 text-sm text-gray-600">
              {isAnimating 
                ? 'Click to restart the carousel with whirling sound' 
                : 'Click to start the carousel with whirling sound'
              }
            </div>
          </div>

          {/* Audio Status */}
          {audioContextReady && (
            <div className="mb-4 text-center">
              <div className="text-xs text-gray-500 mb-2">
                {isBeatPlaying ? (
                  <span className="text-green-600 font-bold animate-pulse">🔊 Beat is playing - you should hear sound!</span>
                ) : (
                  'Audio ready - click "Start Carousel & Sound" to begin'
                )}
              </div>
              
            </div>
          )}

        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-7xl mx-auto px-4 mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            
            {/* Sliding Envelopes Container */}
            <div className="flex-1">
              <div className="envelope-container w-full max-w-6xl">
                {!isAnimating ? (
                  // Always show remaining envelopes when carousel is stopped
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">Remaining Envelopes</h3>
                    <p className="text-xl text-gray-600 mb-6">
                      {envelopes.filter(env => !env.isSelected).length} of {envelopes.length} packs available
                    </p>
                    
                    {/* Show remaining envelopes */}
                    <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                      {envelopes.filter(env => !env.isSelected).map((envelope) => {
                        const envelopeColors = [
                          { bg: 'from-blue-500 to-blue-700', flap: 'from-blue-600 to-blue-800', shadow: 'shadow-blue-500/50' },
                          { bg: 'from-purple-500 to-purple-700', flap: 'from-purple-600 to-purple-800', shadow: 'shadow-purple-500/50' },
                          { bg: 'from-pink-500 to-pink-700', flap: 'from-pink-600 to-pink-800', shadow: 'shadow-pink-500/50' },
                          { bg: 'from-orange-500 to-orange-700', flap: 'from-orange-600 to-orange-800', shadow: 'shadow-orange-500/50' },
                          { bg: 'from-teal-500 to-teal-700', flap: 'from-teal-600 to-teal-800', shadow: 'shadow-teal-500/50' }
                        ];
                        const colorIndex = envelope.id - 1;
                        const colors = envelopeColors[colorIndex % envelopeColors.length];
                        
                        return (
                          <div key={envelope.id} className="flex flex-col items-center">
                            <div className="w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 relative transform hover:scale-105 transition-all duration-300 cursor-pointer"
                                 onClick={() => selectEnvelope(envelope)}>
                              {/* Envelope Body */}
                              <div className={`absolute inset-0 rounded-xl lg:rounded-2xl shadow-xl bg-gradient-to-b ${colors.bg} hover:${colors.shadow} transition-all duration-300`}
                                   style={{
                                     background: `linear-gradient(135deg, ${colors.bg.includes('blue') ? '#3b82f6' : colors.bg.includes('purple') ? '#8b5cf6' : colors.bg.includes('pink') ? '#ec4899' : colors.bg.includes('orange') ? '#f97316' : '#14b8a6'}, ${colors.bg.includes('blue') ? '#1e40af' : colors.bg.includes('purple') ? '#7c3aed' : colors.bg.includes('pink') ? '#db2777' : colors.bg.includes('orange') ? '#ea580c' : '#0d9488'})`,
                                     boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                                   }}>
                                
                                {/* Envelope Flap */}
                                <div className={`absolute top-0 left-0 w-full h-6 sm:h-8 md:h-10 transform -skew-y-1 origin-top rounded-t-xl lg:rounded-t-2xl`}
                                     style={{
                                       background: `linear-gradient(135deg, ${colors.flap.includes('blue') ? '#1e40af' : colors.flap.includes('purple') ? '#7c3aed' : colors.flap.includes('pink') ? '#db2777' : colors.flap.includes('orange') ? '#ea580c' : '#0d9488'}, ${colors.flap.includes('blue') ? '#1e3a8a' : colors.flap.includes('purple') ? '#6d28d9' : colors.flap.includes('pink') ? '#be185d' : colors.flap.includes('orange') ? '#c2410c' : '#0f766e'})`,
                                       boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                     }}>
                                  {/* Flap Fold Line */}
                                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20"></div>
                                </div>
                      
                                {/* Envelope Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-4 sm:pt-6 md:pt-8">
                                  <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 drop-shadow-lg">✉️</div>
                                  <div className="text-white font-bold text-xs sm:text-sm md:text-base drop-shadow-lg text-center px-1">
                                    {envelope.label}
                                  </div>
                                </div>
                                
                                {/* Envelope Edge Highlight */}
                                <div className="absolute inset-0 rounded-xl lg:rounded-2xl border border-white/20 pointer-events-none"></div>
                                
                                {/* Bottom Shadow */}
                                <div className="absolute -bottom-1 left-2 right-2 h-2 bg-black/10 rounded-b-xl lg:rounded-b-2xl blur-sm"></div>
                              </div>
                            </div>
                            
                            {/* Pack Label */}
                            <div className="text-center mt-2 sm:mt-3">
                              <div className="text-gray-800 font-semibold text-sm sm:text-base">
                                {envelope.label}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8">
                      <button
                        onClick={restartCarousel}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 shadow-lg"
                      >
                        🔄 Restart Carousel
                      </button>
                    </div>
                  </div>
                ) : isAnimating ? (
                  renderCarouselContent()
                ) : null}
              </div>
            </div>

            {/* Selected Envelopes Side Panel */}
            {envelopes.some(env => env.isSelected) && (
              <div className="lg:w-80 xl:w-96 flex-shrink-0">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-4 border-green-300 shadow-xl h-full">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Selected Packs</h3>
                    <p className="text-green-600 text-sm">
                      {envelopes.filter(env => env.isSelected).length} of {envelopes.length} selected
                    </p>
                  </div>
                  
                  {/* Selected Envelopes Display */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {envelopes.filter(env => env.isSelected).map((envelope) => {
                      const envelopeColors = [
                        { bg: 'from-green-500 to-green-700', flap: 'from-green-600 to-green-800', shadow: 'shadow-green-500/50' },
                        { bg: 'from-emerald-500 to-emerald-700', flap: 'from-emerald-600 to-emerald-800', shadow: 'shadow-emerald-500/50' },
                        { bg: 'from-teal-500 to-teal-700', flap: 'from-teal-600 to-teal-800', shadow: 'shadow-teal-500/50' },
                        { bg: 'from-cyan-500 to-cyan-700', flap: 'from-cyan-600 to-cyan-800', shadow: 'shadow-cyan-500/50' },
                        { bg: 'from-lime-500 to-lime-700', flap: 'from-lime-600 to-lime-800', shadow: 'shadow-lime-500/50' }
                      ];
                      const colorIndex = envelope.id - 1;
                      const colors = envelopeColors[colorIndex % envelopeColors.length];
                      
                      return (
                        <div key={envelope.id} className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-white/30">
                          {/* Selected Envelope */}
                          <div className="w-12 h-16 relative flex-shrink-0">
                            <div className={`absolute inset-0 rounded-lg shadow-lg bg-gradient-to-b ${colors.bg}`}
                                 style={{
                                   background: `linear-gradient(135deg, ${colors.bg.includes('green') ? '#10b981' : colors.bg.includes('emerald') ? '#059669' : colors.bg.includes('teal') ? '#14b8a6' : colors.bg.includes('cyan') ? '#06b6d4' : '#84cc16'}, ${colors.bg.includes('green') ? '#047857' : colors.bg.includes('emerald') ? '#047857' : colors.bg.includes('teal') ? '#0d9488' : colors.bg.includes('cyan') ? '#0891b2' : '#65a30d'})`,
                                   boxShadow: '0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                                 }}>
                              
                              {/* Envelope Flap */}
                              <div className={`absolute top-0 left-0 w-full h-3 transform -skew-y-1 origin-top rounded-t-lg`}
                                   style={{
                                     background: `linear-gradient(135deg, ${colors.flap.includes('green') ? '#047857' : colors.flap.includes('emerald') ? '#047857' : colors.flap.includes('teal') ? '#0d9488' : colors.flap.includes('cyan') ? '#0891b2' : '#65a30d'}, ${colors.flap.includes('green') ? '#065f46' : colors.flap.includes('emerald') ? '#065f46' : colors.flap.includes('teal') ? '#0f766e' : colors.flap.includes('cyan') ? '#0e7490' : '#4d7c0f'})`,
                                     boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                   }}>
                                {/* Flap Fold Line */}
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20"></div>
                              </div>
                    
                              {/* Envelope Content */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-3">
                                <div className="text-xs drop-shadow-lg">✉️</div>
                              </div>
                              
                              {/* Envelope Edge Highlight */}
                              <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none"></div>
                              
                              {/* Bottom Shadow */}
                              <div className="absolute -bottom-0.5 left-1 right-1 h-1 bg-black/10 rounded-b-lg blur-sm"></div>
                            </div>
                          </div>
                          
                          {/* Pack Label */}
                          <div className="flex-1">
                            <div className="text-gray-800 font-semibold text-sm">
                              {envelope.label}
                            </div>
                            <div className="text-green-600 text-xs">
                              Selected
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Restart Button */}
                  <div className="mt-6 pt-4 border-t border-green-200">
                    <button
                      onClick={restartCarousel}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition-all duration-200 shadow-lg w-full text-sm"
                    >
                      🔄 Select Another Pack
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}