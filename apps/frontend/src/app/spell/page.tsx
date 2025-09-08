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
    .envelope-container {
      position: relative;
      width: 100%;
      height: 500px;
      overflow: hidden;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 50%, rgba(236, 72, 153, 0.08) 100%);
      border-radius: 2rem;
      margin: 0.5rem auto 0 auto;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.2);
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
      top: calc(50% + 0.4rem);
      left: 50%;
      transform: translate(-50%, -50%);
      width: 175px;
      height: 175px;
      z-index: 10;
      margin-top: 20px
    }
    @keyframes fadeInUp {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.8);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
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
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentEnvelopeIndex, setCurrentEnvelopeIndex] = useState(0);
  const [showAllEnvelopes, setShowAllEnvelopes] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      startSlidingAnimation();
    }
  }, [isAnimating]);

  const startSlidingAnimation = () => {
    const interval = setInterval(() => {
      setCurrentEnvelopeIndex(prevIndex => {
        const nonSelectedEnvelopes = envelopes.filter(env => !env.isSelected);
        if (nonSelectedEnvelopes.length === 0) return prevIndex;
        
        let currentIndex = (prevIndex + 1) % nonSelectedEnvelopes.length;
        
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
    }, 2000); // Change envelope every 2 seconds to match animation duration
    
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-2 sm:py-3 md:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-3 md:space-y-0">
            {/* Home Button */}
            <Link href="/">
              <Button className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-base font-semibold rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-gray-500/25 transition-all duration-300">
                🏠 Home
              </Button>
            </Link>

            {/* Title */}
            <h1 className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl">🎯</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-center">
                Spell Bound Challenge
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-screen flex flex-col items-center justify-start p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 pt-4 sm:pt-6 md:pt-8 lg:pt-10 xl:pt-12">
        <div className="text-center mb-1 sm:mb-2 md:mb-3 lg:mb-4 xl:mb-5 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-1 sm:mb-2 md:mb-3 lg:mb-4">
            Choose your envelope pack!
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
            Click on the sliding envelopes to select them
          </p>
        </div>

        {/* Main Content Area - Side by Side Layout */}
        <div className="w-full max-w-7xl mx-auto px-4 mb-2 sm:mb-3 md:mb-4 lg:mb-5 xl:mb-6 mt-4 sm:mt-6 md:mt-8 lg:mt-10 xl:mt-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-10 items-start">
            
            {/* Sliding Envelopes Container - Left Side */}
            <div className={`flex justify-center ${envelopes.some(env => env.isSelected) ? 'lg:flex-1' : 'flex-1'}`}>
              <div className={`envelope-container w-full ${
                !envelopes.some(env => env.isSelected) 
                  ? 'max-w-6xl' 
                  : envelopes.filter(env => env.isSelected).length >= 3 
                    ? 'max-w-3xl' 
                    : 'max-w-4xl'
              }`}>
                {isAnimating && (() => {
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
                                animationFillMode: 'forwards',
                                animationDelay: `${index * 0.1}s`
                              }}
                            >
                              {/* Envelope */}
                              <div className={`w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 lg:w-32 lg:h-36 xl:w-36 xl:h-40 relative transform hover:scale-105 transition-all duration-300 cursor-pointer`}>
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
                                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-14">
                                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-2 sm:mb-3 md:mb-4 lg:mb-5 drop-shadow-lg">✉️</div>
                                    <div className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl drop-shadow-lg text-center px-1">
                                      {envelope.label}
                                    </div>
                                  </div>
                                  
                                  
                                  {/* Envelope Edge Highlight */}
                                  <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border border-white/20 pointer-events-none"></div>
                                  
                                  {/* Bottom Shadow */}
                                  <div className="absolute -bottom-1 left-2 right-2 h-2 bg-black/10 rounded-b-2xl lg:rounded-b-3xl blur-sm"></div>
                                </div>
                              </div>
                                  
                              {/* Pack Label */}
                              <div className="text-center mt-2 sm:mt-3 md:mt-4 lg:mt-5 xl:mt-6">
                                <div className="text-gray-800 font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
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
                  if (!currentEnvelope) return null;
                  
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
                })()}
              </div>
            </div>

            {/* Selected Envelopes - Right Side */}
            {envelopes.some(env => env.isSelected) && (
              <div className={`flex-1 ${envelopes.filter(env => env.isSelected).length >= 3 ? 'lg:max-w-lg' : 'lg:max-w-md'}`}>
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 shadow-xl border border-white/20 h-full">
                  <div className="text-center mb-4 sm:mb-5 md:mb-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                      Selected Packs
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600">
                      Click to deselect
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
                    {envelopes.filter(env => env.isSelected).map((envelope) => (
                      <div
                        key={envelope.id}
                        onClick={() => selectEnvelope(envelope)}
                        className="relative cursor-pointer transform hover:scale-105 scale-100 transition-all duration-300 group"
                      >
                        {/* Envelope */}
                        <div className="w-20 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 lg:w-32 lg:h-36 relative transform hover:scale-105 transition-all duration-300 cursor-pointer">
                          {/* Envelope Body */}
                          <div className="absolute inset-0 rounded-lg lg:rounded-xl shadow-xl bg-gradient-to-b from-emerald-500 to-emerald-700 ring-1 sm:ring-2 md:ring-3 ring-yellow-400 shadow-yellow-400/50 hover:scale-105 transition-all duration-300 group-hover:shadow-xl"
                               style={{
                                 background: 'linear-gradient(135deg, #10b981, #047857)',
                                 boxShadow: '0 15px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)'
                               }}>
                            
                            {/* Envelope Flap */}
                            <div className="absolute top-0 left-0 w-full h-6 sm:h-8 md:h-10 lg:h-12 transform -skew-y-1 origin-top rounded-t-lg lg:rounded-t-xl"
                                 style={{
                                   background: 'linear-gradient(135deg, #047857, #065f46)',
                                   boxShadow: '0 3px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                 }}>
                              {/* Flap Fold Line */}
                              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20"></div>
                            </div>
                            
                            {/* Envelope Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pt-4 sm:pt-6 md:pt-8 lg:pt-10">
                              <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-1 drop-shadow-lg">✉️</div>
                              <div className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg drop-shadow-lg text-center px-1">
                                {envelope.label}
                              </div>
                            </div>
                            
                            {/* Selection Indicator */}
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-lg lg:rounded-xl flex items-center justify-center">
                              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl animate-pulse drop-shadow-lg">🎯</div>
                            </div>
                            
                            {/* Envelope Edge Highlight */}
                            <div className="absolute inset-0 rounded-lg lg:rounded-xl border border-white/20 pointer-events-none"></div>
                            
                            {/* Bottom Shadow */}
                            <div className="absolute -bottom-1 left-1 right-1 h-1.5 bg-black/10 rounded-b-lg lg:rounded-b-xl blur-sm"></div>
                          </div>
                        </div>
                        
                        {/* Pack Label */}
                        <div className="text-center mt-2 sm:mt-3">
                          <div className="text-gray-800 font-semibold text-xs sm:text-sm md:text-base">
                            {envelope.label}
                          </div>
                          <div className="text-emerald-600 font-bold text-xs sm:text-sm animate-pulse">
                            SELECTED
                          </div>
                        </div>
                      </div>
                    ))}
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