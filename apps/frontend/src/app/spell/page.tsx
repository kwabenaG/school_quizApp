'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
    @keyframes slide-in-out {
      0% {
        transform: translateX(100%);
        opacity: 0;
      }
      10% {
        transform: translateX(0%);
        opacity: 1;
      }
      90% {
        transform: translateX(0%);
        opacity: 1;
      }
      100% {
        transform: translateX(-100%);
        opacity: 0;
      }
    }
    .animate-slide-in-out {
      animation: slide-in-out 3s ease-in-out infinite;
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
  `;
  const [envelopes, setEnvelopes] = useState<EnvelopePack[]>([
    { id: 1, label: 'Pack 1', isSelected: false, isShuffled: false },
    { id: 2, label: 'Pack 2', isSelected: false, isShuffled: false },
    { id: 3, label: 'Pack 3', isSelected: false, isShuffled: false },
    { id: 4, label: 'Pack 4', isSelected: false, isShuffled: false },
    { id: 5, label: 'Pack 5', isSelected: false, isShuffled: false },
  ]);
  
  const [selectedPack, setSelectedPack] = useState<EnvelopePack | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimatingIndex, setCurrentAnimatingIndex] = useState(-1);
  const [envelopePositions, setEnvelopePositions] = useState<{[key: number]: {x: number, y: number}}>({});
  const [currentEnvelopeIndex, setCurrentEnvelopeIndex] = useState(0);

  // Start infinite carousel animation when component mounts
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const timer = setTimeout(() => {
      cleanup = startSlidingAnimation();
    }, 1000); // Start after 1 second delay

    return () => {
      clearTimeout(timer);
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const startSlidingAnimation = () => {
    setIsAnimating(true);
    setCurrentAnimatingIndex(-1);
    setEnvelopePositions({});
    setCurrentEnvelopeIndex(0);
    
    // Get non-selected envelopes for carousel animation
    const nonSelectedEnvelopes = envelopes.filter(env => !env.isSelected);
    
    if (nonSelectedEnvelopes.length === 0) {
      setIsAnimating(false);
      return;
    }
    
    // Cycle through envelopes one at a time using JavaScript
    let currentIndex = 0;
    const interval = setInterval(() => {
      setCurrentEnvelopeIndex(currentIndex);
      currentIndex = (currentIndex + 1) % nonSelectedEnvelopes.length;
    }, 2000); // Change envelope every 2 seconds
    
    return () => {
      clearInterval(interval);
    };
  };

  const selectEnvelope = (envelope: EnvelopePack) => {
    setEnvelopes(prev => 
      prev.map(env => ({ 
        ...env, 
        isSelected: env.id === envelope.id ? !env.isSelected : env.isSelected // Toggle selection
      }))
    );
    setSelectedPack(envelope);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      {/* Inject CSS animation styles */}
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      
      {/* Top Header - Fixed at top */}
      <div className="w-full bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          {/* Home Button */}
          <Link href="/">
            <Button className="px-6 py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-gray-500/25 transition-all duration-300">
              🏠 Home
            </Button>
          </Link>

          {/* Title */}
          <h1 className="flex items-center gap-3">
            <span className="text-3xl md:text-4xl">🎯</span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-blue-600 text-2xl md:text-3xl font-bold">
              Spell Bound Challenge
            </span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center p-8 pt-16">
        <div className="text-center mb-8">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6">
            Choose your envelope pack!
          </h2>
          <p className="text-3xl md:text-4xl text-gray-600">
            Select from the cycling envelopes below
          </p>
        </div>


      {/* Envelopes Container - Single Row */}
      <div className="flex items-center justify-center h-80 relative">
        {/* Selected Envelopes - Show in same row */}
        {envelopes.filter(env => env.isSelected).map((envelope) => (
          <div
            key={envelope.id}
            onClick={() => selectEnvelope(envelope)}
            className="relative cursor-pointer transform hover:scale-105 scale-110 mx-4"
          >
            {/* Envelope */}
            <div className="w-48 h-60 rounded-xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-emerald-500 to-emerald-700 ring-4 ring-yellow-400 shadow-yellow-400/50 hover:scale-105 transition-all duration-300">
              {/* Envelope Flap */}
              <div className="absolute top-0 left-0 w-full h-20 transform -skew-y-1 origin-top bg-gradient-to-b from-emerald-600 to-emerald-800"></div>
              
              {/* Envelope Content */}
              <div className="relative z-10 text-center mt-12">
                <div className="text-6xl mb-4">✉️</div>
                <div className="text-white font-bold text-2xl">
                  {envelope.label}
                </div>
              </div>
              
              {/* Selection Indicator */}
              <div className="absolute inset-0 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                <div className="text-8xl animate-pulse">🎯</div>
              </div>
            </div>
            
            {/* Pack Label */}
            <div className="text-center mt-6">
              <div className="text-gray-800 font-semibold text-2xl">
                {envelope.label}
              </div>
              <div className="text-blue-600 font-bold text-lg animate-pulse">
                SELECTED!
              </div>
            </div>
          </div>
        ))}

        {/* Spacer between selected and non-selected envelopes */}
        {envelopes.some(env => env.isSelected) && (
          <div className="w-32 h-1"></div>
        )}

        {/* One-by-One Carousel Animation for Non-Selected Envelopes */}
        {isAnimating && (() => {
          const nonSelectedEnvelopes = envelopes.filter(env => !env.isSelected);
          const currentEnvelope = nonSelectedEnvelopes[currentEnvelopeIndex];
          
          if (!currentEnvelope) return null;
          
          // Define different colors for each envelope
          const envelopeColors = [
            { bg: 'from-blue-500 to-blue-700', flap: 'from-blue-600 to-blue-800', shadow: 'shadow-blue-500/50' },
            { bg: 'from-purple-500 to-purple-700', flap: 'from-purple-600 to-purple-800', shadow: 'shadow-purple-500/50' },
            { bg: 'from-pink-500 to-pink-700', flap: 'from-pink-600 to-pink-800', shadow: 'shadow-pink-500/50' },
            { bg: 'from-orange-500 to-orange-700', flap: 'from-orange-600 to-orange-800', shadow: 'shadow-orange-500/50' },
            { bg: 'from-teal-500 to-teal-700', flap: 'from-teal-600 to-teal-800', shadow: 'shadow-teal-500/50' }
          ];
          
          const colorIndex = currentEnvelope.id - 1; // Convert 1-based ID to 0-based index
          const colors = envelopeColors[colorIndex % envelopeColors.length];
          
          return (
            <div
              key={currentEnvelope.id}
              onClick={() => selectEnvelope(currentEnvelope)}
              className="cursor-pointer transform hover:scale-105 transition-all duration-500 flex flex-col items-center animate-fade-in mx-4"
            >
              {/* Envelope */}
              <div className={`w-48 h-60 rounded-xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b ${colors.bg} hover:${colors.shadow} hover:scale-105 transition-all duration-300`}>
                {/* Envelope Flap */}
                <div className={`absolute top-0 left-0 w-full h-20 transform -skew-y-1 origin-top bg-gradient-to-b ${colors.flap}`}></div>
                
                {/* Envelope Content */}
                <div className="relative z-10 text-center mt-12">
                  <div className="text-6xl mb-4">✉️</div>
                  <div className="text-white font-bold text-2xl">
                    {currentEnvelope.label}
                  </div>
                </div>
              </div>
              
              {/* Pack Label */}
              <div className="text-center mt-6">
                <div className="text-gray-800 font-semibold text-2xl">
                  {currentEnvelope.label}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Selection Status */}
      {envelopes.some(env => env.isSelected) && (
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl">
            <div className="text-2xl font-bold mb-2">🎉 Packs Selected!</div>
            <div className="text-xl">
              Selected: {envelopes.filter(env => env.isSelected).map(env => env.label).join(', ')}
            </div>
            <div className="text-lg mt-2">
              {envelopes.filter(env => env.isSelected).length} of 5 packs chosen
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
