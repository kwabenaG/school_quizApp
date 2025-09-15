'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getApiUrl } from '@/lib/config';
import { getUsedWords, addUsedWord, resetUsedWords as globalResetUsedWords, setCurrentQuizWord } from '@/lib/wordTracking';
// Removed unused imports: Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription

interface WordData {
  word: {
    id: string;
    word: string;
    clues: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  };
  scrambled: string;
}


export default function QuizMasterPage() {
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [timeSpent, setTimeSpent] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [projectionMode, setProjectionMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 seconds
  const [showTimeSetup, setShowTimeSetup] = useState(true);
  const [wordReady, setWordReady] = useState(false); // Word is loaded but timer not started
  const [timerStarted, setTimerStarted] = useState(false); // Timer has started
  const [timerPaused, setTimerPaused] = useState(false); // Timer is paused
  const [countdown, setCountdown] = useState(0); // Countdown before timer starts
  // Clues functionality commented out
  // const [cluesVisible, setCluesVisible] = useState(false); // Clues should be visible
  // const [currentClueIndex, setCurrentClueIndex] = useState(0);
  // const [clueInterval, setClueInterval] = useState<NodeJS.Timeout | null>(null);
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set()); // Track used words
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null); // Track quiz session
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref to track timer interval

  // Load used words from global tracking on component mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        const globalUsedWords = getUsedWords();
        setUsedWordIds(globalUsedWords);
        console.log('🔍 Loaded used words from global tracking:', Array.from(globalUsedWords));
      } catch (error) {
        console.error('🔍 Error loading used words:', error);
        setUsedWordIds(new Set());
      }
    }
  }, []);

  // Sync local state with global tracking when it changes
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const globalUsedWords = getUsedWords();
      setUsedWordIds(globalUsedWords);
      console.log('🔍 Synced with global tracking, used words count:', globalUsedWords.size);
    }
  }, []); // Run once on mount

  // Listen for storage changes to sync when reset happens from admin page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'quizUsedWords') {
          const globalUsedWords = getUsedWords();
          setUsedWordIds(globalUsedWords);
          console.log('🔍 Storage change detected, synced used words count:', globalUsedWords.size);
        }
      };

      // Listen for custom reset event from admin page
      const handleResetEvent = () => {
        const globalUsedWords = getUsedWords();
        setUsedWordIds(globalUsedWords);
        console.log('🔍 Reset event detected, synced used words count:', globalUsedWords.size);
      };

      // Periodic sync as fallback (every 5 seconds)
      const syncInterval = setInterval(() => {
        const globalUsedWords = getUsedWords();
        if (globalUsedWords.size !== usedWordIds.size) {
          setUsedWordIds(globalUsedWords);
          console.log('🔍 Periodic sync detected change, used words count:', globalUsedWords.size);
        }
      }, 5000);

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('quizWordsReset', handleResetEvent);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('quizWordsReset', handleResetEvent);
        clearInterval(syncInterval);
      };
    }
  }, [usedWordIds.size]);
  const [showScrambledWord, setShowScrambledWord] = useState(false); // Control scrambled word visibility
  const [audioRef] = useState<HTMLAudioElement | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [beepInterval, setBeepInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to play timer start sound
  const playTimerStartSound = async () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Resume audio context if it's suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant beep sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1); // 1000Hz
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2); // 1200Hz
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported or blocked:', error);
    }
  };

  // Function to play continuous beeping while timer is running
  const playTimerBeep = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Resume audio context if it's suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a very short, sharp beep sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz for better clarity
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      console.log('Audio not supported or blocked:', error);
    }
  };

  // Function to play timer up sound - two beeps
  const playTimerUpSound = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Resume audio context if it's suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // First beep
      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();
      
      oscillator1.connect(gainNode1);
      gainNode1.connect(audioContext.destination);
      
      oscillator1.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz
      gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator1.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.2);
      
      // Second beep after a short pause
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz
        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.2);
      }, 300); // 300ms pause between beeps
      
    } catch (error) {
      console.log('Audio not supported or blocked:', error);
    }
  };

  // Timer effect with clues functionality - COMMENTED OUT
  /*
  useEffect(() => {
    console.log('Timer effect running:', { gameStarted, currentWord: !!currentWord, showAnswer, timerStarted, timerPaused }); // clueInterval commented out
    let interval: NodeJS.Timeout;
    
    // Define functions inside useEffect to avoid dependency issues
    const startClueRotation = () => {
      if (!currentWord || !currentWord.word.clues || currentWord.word.clues.length === 0) {
        console.log('No clues available for rotation');
        return;
      }
      
      // Clear any existing clue interval - COMMENTED OUT
      // if (clueInterval) {
      //   clearTimeout(clueInterval as NodeJS.Timeout);
      //   setClueInterval(null);
      // }
      
      const firstClueDelay = getFirstClueDelay();
      const totalClues = currentWord.word.clues.length;
      const remainingTime = (timeLimit * 1000) - (timeSpent * 1000) - firstClueDelay;
      
      console.log('Clue timing:', {
        totalClues: totalClues,
        clues: currentWord.word.clues,
        timeLimit: timeLimit,
        firstClueDelay: firstClueDelay,
        timeSpent: timeSpent,
        remainingTime: remainingTime
      });
      
      // Set initial delay before first clue appears
      const initialDelay = setTimeout(() => {
        // Only show clues if timer is still running
        if (timeSpent < timeLimit) {
          console.log('Starting clue sequence');
          // setCluesVisible(true);
          // setCurrentClueIndex(0); // Start with first clue
          
          // Calculate timing for each clue
          const clueDisplayTime = 3000; // Each clue shows for 3 seconds
          const timeBetweenClues = Math.max(1000, (remainingTime - (totalClues * clueDisplayTime)) / (totalClues - 1));
          
          console.log('Clue timing details:', {
            clueDisplayTime,
            timeBetweenClues,
            totalTimeNeeded: (totalClues * clueDisplayTime) + ((totalClues - 1) * timeBetweenClues)
          });
          
          let currentClue = 0;
          
          const showNextClue = () => {
            if (currentClue < totalClues && timeSpent < timeLimit) {
              console.log(`Showing clue ${currentClue + 1} of ${totalClues}`);
              setCurrentClueIndex(currentClue);
              
              // Hide clue after display time
              setTimeout(() => {
                if (timeSpent < timeLimit) {
                  console.log(`Hiding clue ${currentClue + 1}`);
                  // setCluesVisible(false);
                  
                  // Show next clue after delay
                  if (currentClue < totalClues - 1) {
                    setTimeout(() => {
                      currentClue++;
                      // setCluesVisible(true);
                      showNextClue();
                    }, timeBetweenClues);
                  }
                }
              }, clueDisplayTime);
            }
          };
          
          showNextClue();
        } else {
          console.log('Timer is up, not showing clues');
        }
      }, firstClueDelay);
      
      // Store the initial delay timeout for cleanup
      setClueInterval(initialDelay as unknown as NodeJS.Timeout);
    };

    const stopClueRotation = () => {
      if (clueInterval) {
        console.log('Stopping clue rotation, clearing interval/timeout:', clueInterval);
        // Clear both timeout and interval
        clearTimeout(clueInterval as NodeJS.Timeout);
        clearInterval(clueInterval as NodeJS.Timeout);
        setClueInterval(null);
      } else {
        console.log('No clue interval to stop');
      }
    };
    
    if (gameStarted && currentWord && !showAnswer && timerStarted && !timerPaused) {
      console.log('Timer conditions met, checking clue rotation', { 
        gameStarted, 
        currentWord: !!currentWord, 
        showAnswer, 
        timerStarted, 
        timerPaused,
        clueInterval: !!clueInterval,
        totalClues: currentWord?.word?.clues?.length || 0
      });
      // Start clue rotation with delay - don't set position immediately
      // Only start clue rotation if it's not already running
      if (!clueInterval) {
        console.log('Starting clue rotation');
        startClueRotation(); // This will handle the delay before first clue appears
      } else {
        console.log('Clue rotation already running');
      }
      
      interval = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          // Play beep sound synchronized with timer update
          // playTimerBeep();
          // Stop timer when time limit is reached, but don't auto-reveal
          if (newTime >= timeLimit) {
            setMessage('Timer is up!');
            setMessageType('info');
            // stopClueRotation(); // Stop clue rotation when time is up
            // setCluesVisible(false); // Hide clues when time is up
            // Timer stopped - no need to clear beep interval since it's integrated
            // Stop the timer but keep wordReady true so Reveal Answer button stays enabled
            setTimerStarted(false); // Reset timer started state
            setTimerPaused(false); // Reset paused state
            // Play timer up sound
            // playTimerUpSound();
          }
          return newTime;
        });
      }, 1000);
    } else {
      // stopClueRotation(); // Stop clue rotation when timer stops or is paused
      // setCluesVisible(false); // Hide clues when timer stops or is paused
      // No need to clear beep interval since it's integrated with timer
    }
    return () => {
      clearInterval(interval);
      // stopClueRotation();
    };
  }, [gameStarted, currentWord, showAnswer, timeLimit, timerStarted, timerPaused]); // eslint-disable-line react-hooks/exhaustive-deps
  */

  // Simplified timer effect without clues
  useEffect(() => {
    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (gameStarted && currentWord && !showAnswer && timerStarted && !timerPaused) {
      timerIntervalRef.current = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          
          if (newTime >= timeLimit) {
            // Clear the timer immediately
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            setMessage('Timer is up!');
            setMessageType('info');
            // Stop the timer when time is up
            setTimerStarted(false);
            setTimerPaused(false);
            // Play timer up sound when time is up
            playTimerUpSound().catch(console.error);
            return timeLimit;
          }
          return newTime;
        });
        
        // Play beep sound after state update for better timing
        playTimerBeep().catch(console.error);
      }, 1000);
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameStarted, currentWord, showAnswer, timeLimit, timerStarted, timerPaused]); // eslint-disable-line react-hooks/exhaustive-deps




  // Load a random word when page loads (only if time setup is complete)
  useEffect(() => {
    const loadRandomWord = async () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        console.log('🔍 Skipping word load during SSR');
        return;
      }
      
      try {
        const excludeIdsParam = usedWordIds.size > 0 ? `?excludeIds=${Array.from(usedWordIds).filter(id => id && id.trim()).join(',')}` : '';
        const apiUrl = getApiUrl(`/words/random/word${excludeIdsParam}`);
        console.log('🔍 Loading random word from:', apiUrl);
        console.log('🔍 Used word IDs:', Array.from(usedWordIds));
        console.log('🔍 Exclude IDs param:', excludeIdsParam);
        console.log('🔍 API URL constructed:', apiUrl);
        console.log('🔍 API_CONFIG.BASE_URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
        
        console.log('🔍 Making fetch request to:', apiUrl);
        console.log('🔍 Request headers:', {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        });
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          // Add timeout for production
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('🔍 Response URL:', response.url);
        
        if (response.ok) {
          const wordData = await response.json();
          console.log('🔍 Word data received:', wordData);
          
          // Add this word to global used words tracking
          const wordId = wordData.word.id;
          addUsedWord(wordId);
          setUsedWordIds(getUsedWords());
          
          setCurrentWord(wordData);
          setGameStarted(true);
          setTimeSpent(0);
          setWordReady(true); // Word is ready but timer not started
          // setCluesVisible(false); // Hide clues when loading new word
          setShowScrambledWord(false); // Hide scrambled word initially
          setMessage(''); // Clear any previous messages
          setMessageType('success');
          
          // Store current word for admin page
          console.log('🔍 [QUIZ MASTER] Setting current word for admin:', wordData.word.word);
          setCurrentQuizWord({
            word: wordData.word,
            scrambled: wordData.scrambled,
            correctWord: wordData.word.word
          });

          // Update quiz session with current word
          if (quizSessionId) {
            try {
              console.log('🔍 Updating quiz session with word ID:', wordData.word.id);
              const updateResponse = await fetch(getApiUrl(`/quiz/sessions/${quizSessionId}/current-word`), {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  wordId: wordData.word.id
                }),
              });
              
              console.log('🔍 Update response status:', updateResponse.status);
              
              if (updateResponse.ok) {
                console.log('🔍 Quiz session updated with current word');
              } else {
                const errorText = await updateResponse.text();
                console.error('Failed to update quiz session with current word:', updateResponse.status, errorText);
              }
            } catch (error) {
              console.error('Error updating quiz session:', error);
            }
          } else {
            console.warn('🔍 No quiz session ID available for updating current word');
          }
        } else if (response.status === 404) {
          // No more words available
          setMessage('No more words available! All words have been used.');
          setMessageType('info');
        } else {
          const errorText = await response.text();
          console.error('Failed to load word:', response.status, errorText);
          console.error('🔍 Full error details:', { 
            status: response.status, 
            statusText: response.statusText, 
            url: apiUrl, 
            errorText: errorText,
            response: response,
            headers: Object.fromEntries(response.headers.entries())
          });
          setMessage(`Failed to load word: ${response.status} ${response.statusText}`);
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error loading word:', error);
        
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          if (error.name === 'TimeoutError') {
            errorMessage = 'Request timed out. Please check your connection and try again.';
          } else if (error.name === 'AbortError') {
            errorMessage = 'Request was cancelled. Please try again.';
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          } else {
            errorMessage = error.message;
          }
        }
        
        setMessage(`Network error: ${errorMessage}`);
        setMessageType('error');
      }
    };

    if (!currentWord && !showTimeSetup && typeof window !== 'undefined') {
      loadRandomWord();
    }
  }, [currentWord, showTimeSetup, usedWordIds, quizSessionId]);

  const handleTimeSetup = async () => {
    try {
      // Create a quiz session
      const sessionResponse = await fetch(getApiUrl('/quiz/sessions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Quiz Session ${new Date().toLocaleTimeString()}`,
          totalWords: 10
        }),
      });

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setQuizSessionId(sessionData.id);
        console.log('🔍 Quiz session created:', sessionData.id);

        // Start the session
        const startResponse = await fetch(getApiUrl(`/quiz/sessions/${sessionData.id}/start`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (startResponse.ok) {
          console.log('🔍 Quiz session started');
          setShowTimeSetup(false);
          setMessage(`Quiz session started! Time limit set to ${timeLimit} seconds per word.`);
          setMessageType('success');
        } else {
          console.error('Failed to start quiz session');
          setMessage('Failed to start quiz session. Please try again.');
          setMessageType('error');
        }
      } else {
        console.error('Failed to create quiz session');
        setMessage('Failed to create quiz session. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error creating quiz session:', error);
      setMessage('Error creating quiz session. Please check your connection.');
      setMessageType('error');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate clue rotation timing - use a fixed interval for simplicity
  // const getClueRotationInterval = () => {
  //   if (!currentWord) return 3000; // Default 3 seconds
  //   
  //   const totalClues = currentWord.word.clues.length;
  //   if (totalClues <= 1) return 5000; // If only one clue, show it for 5 seconds
  //   
  //   // Use a fixed interval based on total clues
  //   // More clues = shorter interval to show them all
  //   if (totalClues <= 2) return 4000; // 4 seconds for 2 clues
  //   if (totalClues <= 3) return 3000; // 3 seconds for 3 clues
  //   if (totalClues <= 4) return 2500; // 2.5 seconds for 4 clues
  //   return 2000; // 2 seconds for 5+ clues
  // };

  // Calculate delay before first clue appears
  // Clues functionality commented out
  /*
  const getFirstClueDelay = () => {
    if (!currentWord) return 3000; // Default 3 seconds
    
    const totalClues = currentWord.word.clues.length;
    if (totalClues <= 1) return 2000; // If only one clue, show it quickly
    
    // First clue appears after 1/3 of the time limit or minimum 2 seconds
    const delay = Math.max(2000, timeLimit * 1000 / 3);
    return delay;
  };
  */




  const startWordTimer = () => {
    if (currentWord && wordReady) {
      setShowScrambledWord(true); // Show scrambled word when timer starts
      setTimeSpent(0);
      // setCurrentClueIndex(0);
      setCountdown(3); // Start countdown at 3
      
      // Show countdown message
      setMessage('Get ready... Timer starting in 3 seconds!');
      setMessageType('info');
      
      // Play initial countdown sound for "3"
      playTimerBeep().catch(console.error);
      
      // Countdown interval with proper timing synchronization
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Start the actual timer but keep wordReady true so Reveal Answer button stays enabled
            setTimerStarted(true);
            setTimerPaused(false);
            setMessage('Timer started! Good luck!');
            setMessageType('success');
            return 0;
          } else {
            return prev - 1;
          }
        });
        
        // Play countdown beep after state update for better timing
        playTimerBeep().catch(console.error);
      }, 1000);
      
      // Play timer start sound when countdown reaches 0
      setTimeout(() => {
        playTimerStartSound().catch(console.error);
      }, 3000); // 3 seconds for countdown
    }
  };

  const pauseResumeTimer = () => {
    if (timerStarted) {
      if (timerPaused) {
        // Resume timer
        setTimerPaused(false);
        setMessage('Timer resumed!');
        setMessageType('info');
        // Play timer resume sound
        playTimerStartSound().catch(console.error);
      } else {
        // Pause timer
        setTimerPaused(true);
        setMessage('Timer paused!');
        setMessageType('info');
        // Stop continuous beeping when paused
        if (beepInterval) {
          clearInterval(beepInterval);
          setBeepInterval(null);
        }
      }
    }
  };

  const nextWord = async () => {
    console.log('🔍 Next Word button clicked');
    // setIsLoading(true);
    setMessage('');

    try {
      // Mark current word as used before loading next word
      if (currentWord) {
        const wordId = currentWord.word.id;
        addUsedWord(wordId);
        console.log('🔍 Marked current word as used:', wordId);
      }

      // Get random word excluding used words
      const currentUsedWords = getUsedWords();
      const excludeIdsParam = currentUsedWords.size > 0 ? `?excludeIds=${Array.from(currentUsedWords).filter(id => id && id.trim()).join(',')}` : '';
      const response = await fetch(getApiUrl(`/words/random/word${excludeIdsParam}`));
      if (response.ok) {
        const wordData = await response.json();
        
        // Add this new word to global used words tracking
        const wordId = wordData.word.id;
        addUsedWord(wordId);
        setUsedWordIds(getUsedWords());
        
        setCurrentWord(wordData);
        setShowAnswer(false);
        setTimeSpent(0);
        // setCurrentClueIndex(0);
        setTimerStarted(false);
        setTimerPaused(false);
        setCountdown(0);
        setShowScrambledWord(false); // Hide scrambled word for new word
        
        setWordReady(true); // Word is ready but timer not started
        setMessage('Next word loaded! Click &quot;Start Word&quot; to begin timer.');
        setMessageType('success');
        console.log('🔍 Next word loaded successfully:', wordData.word.word);
        
        // Store current word for admin page
        setCurrentQuizWord({
          word: wordData.word,
          scrambled: wordData.scrambled,
          correctWord: wordData.word.word
        });

        // Update quiz session with current word
        if (quizSessionId) {
          try {
            console.log('🔍 Updating quiz session with word ID (next):', wordData.word.id);
            const updateResponse = await fetch(getApiUrl(`/quiz/sessions/${quizSessionId}/current-word`), {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                wordId: wordData.word.id
              }),
            });
            
            console.log('🔍 Update response status (next):', updateResponse.status);
            
            if (updateResponse.ok) {
              console.log('🔍 Quiz session updated with current word (next)');
            } else {
              const errorText = await updateResponse.text();
              console.error('Failed to update quiz session with current word (next):', updateResponse.status, errorText);
            }
          } catch (error) {
            console.error('Error updating quiz session (next):', error);
          }
        } else {
          console.warn('🔍 No quiz session ID available for updating current word (next)');
        }
      } else if (response.status === 404) {
        // No more words available
        setMessage('No more words available! All words have been used. Click &quot;Reset Used Words&quot; to start over.');
        setMessageType('info');
        setCurrentWord(null);
      } else {
        throw new Error('Failed to get word');
      }
    } catch (error) {
      console.error('🔍 Error loading next word:', error);
      setMessage('Failed to get next word. Please try again.');
      setMessageType('error');
    } finally {
      console.log('🔍 Next word function completed, setting loading to false');
      // setIsLoading(false);
    }
  };

  const revealAnswer = () => {
    setShowAnswer(true);
    // Keep wordReady as true so the button remains enabled
    setTimerStarted(false); // Reset timer started state
    setTimerPaused(false); // Reset paused state
    setCountdown(0); // Reset countdown
    // setCluesVisible(false); // Hide clues when revealing answer
    setMessage('Answer revealed to contestants!');
    setMessageType('info');
  };

  const resetUsedWords = () => {
    globalResetUsedWords(); // Reset global tracking
    setUsedWordIds(new Set()); // Reset local state
    setMessage('Used words reset. All words are now available again.');
    setMessageType('success');
    // Load a new word if none is currently loaded
    if (!currentWord) {
      const loadRandomWord = async () => {
        try {
          const response = await fetch(getApiUrl('/words/random/word'));
          if (response.ok) {
            const wordData = await response.json();
            
            // Add this word to global used words tracking
            const wordId = wordData.word.id;
            addUsedWord(wordId);
            setUsedWordIds(getUsedWords());
            
            setCurrentWord(wordData);
            setGameStarted(true);
            setTimeSpent(0);
            setWordReady(true);
            // setCluesVisible(false);
            setShowScrambledWord(false); // Hide scrambled word initially
            
            // Store current word for admin page
            setCurrentQuizWord({
              word: wordData.word,
              scrambled: wordData.scrambled,
              correctWord: wordData.word.word
            });

            // Update quiz session with current word
            if (quizSessionId) {
              try {
                console.log('🔍 Updating quiz session with word ID (reset):', wordData.word.id);
                const updateResponse = await fetch(getApiUrl(`/quiz/sessions/${quizSessionId}/current-word`), {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    wordId: wordData.word.id
                  }),
                });

                console.log('🔍 Update response status (reset):', updateResponse.status);

                if (updateResponse.ok) {
                  console.log('🔍 Quiz session updated with current word (reset)');
                } else {
                  const errorText = await updateResponse.text();
                  console.error('Failed to update quiz session with current word (reset):', updateResponse.status, errorText);
                }
              } catch (error) {
                console.error('Error updating quiz session (reset):', error);
              }
            } else {
              console.warn('🔍 No quiz session ID available for updating current word (reset)');
            }
          }
        } catch (error) {
          console.error('Failed to load word:', error);
        }
      };
      loadRandomWord();
    }
  };

  const toggleProjection = () => {
    setProjectionMode(!projectionMode);
  };

  // Projection Mode - Full Screen Display for Contestants
  if (projectionMode && currentWord) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-200 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-200 rounded-full opacity-30 animate-bounce delay-1000"></div>
          <div className="absolute top-1/3 left-10 w-16 h-16 bg-pink-200 rounded-full opacity-40 animate-bounce delay-500"></div>
          <div className="absolute bottom-1/3 right-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-bounce delay-700"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
              <span className="text-5xl">🎓</span>
            </div>
            
            {/* Title and Timer Row */}
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                School Quiz
              </h1>
              
              {/* Timer Display - Right Side */}
              {!showAnswer && (
                <div className={`ml-12 inline-flex items-center justify-center rounded-3xl px-8 py-4 border-4 shadow-2xl ${
                  timerStarted 
                    ? (timeSpent >= timeLimit 
                        ? 'bg-gradient-to-r from-red-100 to-red-200 border-red-400'
                        : timerPaused 
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400'
                          : 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-300'
                      )
                    : 'bg-gradient-to-r from-green-100 to-blue-100 border-green-300'
                }`}>
                  <span className="text-3xl mr-3">
                    {timerStarted 
                      ? (timeSpent >= timeLimit 
                          ? '⏰' 
                          : timerPaused 
                            ? '⏸️' 
                            : '⏱️'
                        ) 
                      : '⏸️'
                    }
                  </span>
                  <span className={`text-4xl font-bold ${
                    timerStarted 
                      ? (timeSpent >= timeLimit 
                          ? 'text-red-800' 
                          : timerPaused 
                            ? 'text-yellow-800'
                            : 'text-orange-800'
                        )
                      : 'text-green-800'
                  }`}>
                    {timerStarted 
                      ? (timeSpent >= timeLimit 
                          ? 'Timer is up!' 
                          : timerPaused 
                            ? `Paused ${formatTime(timeSpent)}`
                            : formatTime(timeSpent)
                        )
                      : (timeSpent >= timeLimit ? 'Timer is up!' : 'Ready')
                    }
                  </span>
                </div>
              )}
            </div>
            
            {/* Used Words Counter */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 text-sm font-semibold text-gray-700">
                <span className="mr-2">📚</span>
                Words Used: {usedWordIds.size}
              </div>
            </div>
            
            <p className="text-3xl text-gray-600 font-medium">Unscramble the word!</p>
          </div>

          {/* Main Game Area */}
          <div className="text-center space-y-12">
            {/* HUGE Scrambled Word Display with Rotating Clues */}
            <div className="w-full relative">
            {/* Countdown Display */}
            {countdown > 0 && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-2xl p-12 text-center shadow-2xl">
                  <div className="text-8xl font-bold text-blue-600 mb-4">{countdown}</div>
                  <div className="text-2xl text-gray-700">Get ready...</div>
                </div>
              </div>
            )}
            
              
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-none md:rounded-2xl lg:rounded-4xl shadow-2xl p-4 md:p-8 lg:p-12 pb-16 md:pb-20 lg:pb-24 mb-10 border-0 md:border-4 lg:border-6 border-blue-200 relative overflow-visible w-full min-h-[150px] md:min-h-[250px] lg:min-h-[350px] flex items-center justify-center">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-300 rounded-full opacity-60"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 bg-green-300 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 left-4 w-6 h-6 bg-pink-300 rounded-full opacity-60"></div>
                
                <div className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent tracking-wider drop-shadow-lg whitespace-nowrap text-center overflow-visible">
                  {showScrambledWord ? currentWord.scrambled : (
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-500 font-normal">
                      Click &quot;Start Word Timer&quot; to begin
                    </div>
                  )}
                </div>
              </div>
              
            </div>


          </div>

          {/* Clue Display - COMMENTED OUT */}
          {/*
          {cluesVisible && currentWord && timeSpent < timeLimit && (
            <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 border-4 border-green-300 shadow-xl max-w-5xl mx-auto z-40">
              <div className="text-4xl font-bold text-green-800 mb-4 text-center">💡 Clue:</div>
              <div className="text-2xl text-green-700 font-semibold break-words text-center leading-relaxed">
                {currentWord?.word?.clues?.[currentClueIndex] || 'No clue available'}
              </div>
              <div className="text-sm text-gray-500 mt-3 text-center">
                {currentClueIndex + 1} of {currentWord?.word?.clues?.length || 0} clues
              </div>
            </div>
          )}
          */}


          {/* Quiz Master Controls (Bottom) */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gray-200">
            <div className="flex space-x-4">
              {wordReady ? (
                timeSpent >= timeLimit ? (
                  <Button 
                    onClick={revealAnswer}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3 text-lg rounded-xl"
                  >
                    Reveal Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={startWordTimer}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg rounded-xl"
                  >
                    Start Word Timer
                  </Button>
                )
              ) : (
                <Button 
                  onClick={revealAnswer}
                  disabled={showAnswer || !wordReady}
                  className={`px-8 py-3 text-lg rounded-xl ${
                    showAnswer || !wordReady
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  }`}
                >
                  {showAnswer ? 'Answer Revealed' : 'Reveal Answer'}
                </Button>
              )}
              <Button 
                onClick={nextWord}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg rounded-xl"
              >
                Next Word
              </Button>
              <Button 
                onClick={resetUsedWords}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg rounded-xl"
              >
                Reset Used Words
              </Button>
              <Button 
                onClick={toggleProjection}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 text-lg rounded-xl"
              >
                Exit Projection
              </Button>
            </div>
          </div>
        </div>

        {/* Answer Reveal Modal */}
        {showAnswer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-4xl p-16 max-w-4xl w-full border-6 border-green-300 shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-8 right-8 w-20 h-20 bg-green-200 rounded-full opacity-60"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 bg-emerald-200 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 left-8 w-12 h-12 bg-green-300 rounded-full opacity-40"></div>
              
              <div className="text-center relative z-10">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <span className="text-5xl">✅</span>
                </div>
                
                <h2 className="text-6xl font-bold bg-gradient-to-r from-green-800 to-emerald-800 bg-clip-text text-transparent mb-8">
                  Correct Answer!
                </h2>
                
                <div className="bg-white rounded-3xl p-12 border-4 border-green-200 shadow-xl mb-8">
                  <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent tracking-widest">
                    {currentWord.word.word}
                  </div>
                </div>
                
                <p className="text-3xl text-green-700 font-semibold mb-8">
                  Great job! The word was &quot;{currentWord.word.word}&quot;
                </p>
                
                <div className="flex justify-center space-x-6">
                  <Button 
                    onClick={() => {
                      console.log('🔍 Next Word button clicked in desktop modal');
                      nextWord();
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-2xl rounded-2xl shadow-xl"
                  >
                    Next Word
                  </Button>
                  <Button 
                    onClick={() => setShowAnswer(false)}
                    variant="outline"
                    className="border-4 border-gray-300 text-gray-700 px-12 py-4 text-2xl rounded-2xl"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Time Setup Screen
  if (showTimeSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-200 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-200 rounded-full opacity-30 animate-bounce delay-1000"></div>
          <div className="absolute top-1/3 left-10 w-16 h-16 bg-pink-200 rounded-full opacity-40 animate-bounce delay-500"></div>
          <div className="absolute bottom-1/3 right-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-bounce delay-700"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white/90 backdrop-blur-sm rounded-4xl p-12 shadow-2xl border-4 border-blue-200 w-full max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
                <span className="text-4xl">⏱️</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Quiz Master Setup
              </h1>
              <p className="text-xl text-gray-600">Set the time limit for each word</p>
            </div>

            {/* Time Input */}
            <div className="space-y-6">
              <div>
                <label className="block text-2xl font-semibold mb-4 text-center">Time Limit (seconds)</label>
                <div className="flex justify-center space-x-4 mb-6">
                  {[15, 30, 45, 60, 90, 120].map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimeLimit(time)}
                      className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all ${
                        timeLimit === time
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}s
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <Input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                    min="10"
                    max="300"
                    className="text-2xl py-4 h-16 text-center font-bold border-4 border-blue-300 rounded-2xl"
                  />
                  <p className="text-sm text-gray-500 mt-2">Enter custom time (10-300 seconds)</p>
                </div>
              </div>

              <Button 
                onClick={handleTimeSetup}
                className="w-full text-2xl py-6 h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl shadow-xl"
              >
                Start Quiz Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show projection mode directly
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-200 rounded-full opacity-30 animate-bounce delay-1000"></div>
        <div className="absolute top-1/3 left-10 w-16 h-16 bg-pink-200 rounded-full opacity-40 animate-bounce delay-500"></div>
        <div className="absolute bottom-1/3 right-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-bounce delay-700"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Home Button - Extreme Right */}
        <div className="absolute top-2 sm:top-4 right-1 sm:right-4 z-20 mb-6 sm:mb-10">
          <Link href="/">
            <Button className="px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg hover:shadow-gray-500/25 transition-all duration-300">
              🏠 Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6 shadow-2xl">
            <span className="text-3xl sm:text-4xl lg:text-5xl">🎓</span>
          </div>
          
          {/* Title and Timer Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 space-y-4 sm:space-y-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              School Quiz
            </h1>
            
            {/* Timer Display - Right Side */}
            {!showAnswer && (
              <div className={`sm:ml-8 lg:ml-12 inline-flex items-center justify-center rounded-2xl sm:rounded-3xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-2 sm:border-4 shadow-2xl ${
                timerStarted 
                  ? (timeSpent >= timeLimit 
                      ? 'bg-gradient-to-r from-red-100 to-red-200 border-red-400'
                      : timerPaused 
                        ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400'
                        : 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-300'
                    )
                  : 'bg-gradient-to-r from-green-100 to-blue-100 border-green-300'
              }`}>
                <span className="text-xl sm:text-2xl lg:text-3xl mr-2 sm:mr-3">
                  {timerStarted 
                    ? (timeSpent >= timeLimit 
                        ? '⏰' 
                        : timerPaused 
                          ? '⏸️' 
                          : '⏱️'
                      ) 
                    : '⏸️'
                  }
                </span>
                <span className={`text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold ${
                  timerStarted 
                    ? (timeSpent >= timeLimit 
                        ? 'text-red-800' 
                        : timerPaused 
                          ? 'text-yellow-800'
                          : 'text-orange-800'
                      )
                    : 'text-green-800'
                }`}>
                  {timerStarted 
                    ? (timeSpent >= timeLimit 
                        ? 'Timer is up!' 
                        : timerPaused 
                          ? `Paused ${formatTime(timeSpent)}`
                          : formatTime(timeSpent)
                      )
                    : (timeSpent >= timeLimit ? 'Timer is up!' : 'Ready')
                  }
                </span>
              </div>
            )}
          </div>
          
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-600 font-medium">Unscramble the word!</p>
        </div>

        {/* Main Game Area */}
        <div className="text-center space-y-8 sm:space-y-12 px-4">
          {/* HUGE Scrambled Word Display with Rotating Clues */}
          <div className="w-full relative">
            {/* Countdown Display */}
            {countdown > 0 && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-2xl max-w-sm sm:max-w-md">
                  <div className="text-4xl sm:text-6xl lg:text-8xl font-bold text-blue-600 mb-3 sm:mb-4">{countdown}</div>
                  <div className="text-lg sm:text-xl lg:text-2xl text-gray-700">Get ready...</div>
                </div>
              </div>
            )}
            
            
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl lg:rounded-4xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 pb-12 sm:pb-14 md:pb-16 lg:pb-20 mb-4 sm:mb-6 border-2 sm:border-4 lg:border-6 border-blue-200 relative overflow-visible w-full min-h-[120px] sm:min-h-[150px] md:min-h-[200px] lg:min-h-[250px] xl:min-h-[350px] flex items-center justify-center">
              {/* Decorative elements */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-300 rounded-full opacity-60"></div>
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 bg-green-300 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 left-2 sm:left-4 w-4 h-4 sm:w-6 sm:h-6 bg-pink-300 rounded-full opacity-60"></div>
              
              <div className="text-2xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent tracking-wider drop-shadow-lg break-all text-center overflow-visible">
                {currentWord ? (showScrambledWord ? currentWord.scrambled : (
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl text-gray-500 font-normal">
                    Click &quot;Start Word Timer&quot; to begin
                  </div>
                )) : 'Loading...'}
              </div>
            </div>
            
          </div>


        </div>

        {/* Clue Display - COMMENTED OUT */}
        {/*
        {cluesVisible && currentWord && timeSpent < timeLimit && (
          <div className="fixed bottom-20 sm:bottom-32 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 sm:border-4 border-green-300 shadow-xl max-w-[95vw] sm:max-w-5xl mx-auto z-40">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-3 sm:mb-4 text-center">💡 Clue:</div>
            <div className="text-lg sm:text-xl lg:text-2xl text-green-700 font-semibold break-words text-center leading-relaxed">
              {currentWord?.word?.clues?.[currentClueIndex] || 'No clue available'}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center">
              {currentClueIndex + 1} of {currentWord?.word?.clues?.length || 0} clues
            </div>
          </div>
        )}
        */}


        {/* Quiz Master Controls (Bottom) */}
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-2xl border-2 border-gray-200 max-w-[95vw] sm:max-w-none">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {wordReady ? (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button 
                  onClick={timerStarted ? pauseResumeTimer : startWordTimer}
                  disabled={countdown > 0}
                  className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg sm:rounded-xl ${
                    countdown > 0
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : timerStarted
                        ? (timerPaused 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                            : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white'
                          )
                        : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'
                  }`}
                >
                  {countdown > 0 
                    ? `Starting in ${countdown}...` 
                    : timerStarted 
                      ? (timerPaused ? 'Resume Timer' : 'Pause Timer')
                      : 'Start Word Timer'
                  }
                </Button>
                <Button 
                  onClick={revealAnswer}
                  disabled={showAnswer}
                  className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg sm:rounded-xl ${
                    showAnswer
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  }`}
                >
                  {showAnswer ? 'Answer Revealed' : 'Reveal Answer'}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={revealAnswer}
                disabled={showAnswer || !wordReady}
                className={`px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg sm:rounded-xl ${
                  showAnswer || !wordReady
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                }`}
              >
                {showAnswer ? 'Answer Revealed' : 'Reveal Answer'}
              </Button>
            )}
            <Button 
              onClick={nextWord}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg rounded-lg sm:rounded-xl"
            >
              Next Word
            </Button>
          </div>
        </div>
      </div>

      {/* Answer Reveal Modal */}
      {showAnswer && currentWord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl sm:rounded-3xl lg:rounded-4xl p-6 sm:p-8 lg:p-12 xl:p-16 max-w-4xl lg:max-w-6xl w-full border-4 sm:border-6 border-green-300 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-green-200 rounded-full opacity-60"></div>
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-emerald-200 rounded-full opacity-60"></div>
            <div className="absolute top-1/2 left-4 sm:left-8 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-300 rounded-full opacity-40"></div>
            
            <div className="text-center relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 shadow-2xl">
                <span className="text-3xl sm:text-4xl lg:text-5xl">✅</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-green-800 to-emerald-800 bg-clip-text text-transparent mb-4 sm:mb-6 lg:mb-8">
                Correct Answer!
              </h2>
              
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border-2 sm:border-4 border-green-200 shadow-xl mb-4 sm:mb-6 lg:mb-8 w-full">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent tracking-wider break-all text-center overflow-visible">
                  {currentWord.word.word}
                </div>
              </div>
              
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-green-700 font-semibold mb-4 sm:mb-6 lg:mb-8">
                Great job! The word was &quot;{currentWord.word.word}&quot;
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                <Button 
                  onClick={() => {
                    console.log('🔍 Next Word button clicked in mobile modal');
                    nextWord();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 text-lg sm:text-xl lg:text-2xl rounded-xl sm:rounded-2xl shadow-xl"
                >
                  Next Word
                </Button>
                <Button 
                  onClick={() => setShowAnswer(false)}
                  variant="outline"
                  className="border-2 sm:border-4 border-gray-300 text-gray-700 px-6 sm:px-8 lg:px-12 py-3 sm:py-4 text-lg sm:text-xl lg:text-2xl rounded-xl sm:rounded-2xl"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
