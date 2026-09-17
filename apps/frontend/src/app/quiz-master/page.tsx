'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, MonitorPlay, RotateCcw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectionWord } from '@/components/projection-word';
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
        // No more words available. Clear the round state too: leaving showAnswer
        // set while currentWord is null renders neither the word nor the reveal
        // modal, which strands the screen on "Loading…" with no way out.
        setMessage('Every word has been used. Reset used words to start over.');
        setMessageType('info');
        setCurrentWord(null);
        setShowAnswer(false);
        setWordReady(false);
        setTimerStarted(false);
        setTimerPaused(false);
        setTimeSpent(0);
        setCountdown(0);
        setShowScrambledWord(false);
      } else {
        throw new Error('Failed to get word');
      }
    } catch (error) {
      console.error('🔍 Error loading next word:', error);
      setMessage('Could not load the next word. Check the connection and try again.');
      setMessageType('error');
      setShowAnswer(false);
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
    setShowAnswer(false);
    setMessage('Used words reset. All words are available again.');
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
    const outOfTime = timeSpent >= timeLimit;

    // Out of time wins over every other state: the timer stops when it expires,
    // so checking timerStarted first would paint the alarm state calm grey.
    const timerTone = outOfTime
      ? 'border-red-700 bg-red-600 text-white'
      : !timerStarted
        ? 'border-slate-300 bg-slate-100 text-slate-700'
        : timerPaused
          ? 'border-amber-500 bg-amber-100 text-amber-900'
          : 'border-slate-900 bg-white text-slate-900';

    const timerLabel = outOfTime
      ? "Time's up"
      : !timerStarted
        ? 'Ready'
        : timerPaused
          ? `Paused ${formatTime(timeSpent)}`
          : formatTime(timeSpent);

    return (
      <div className="relative flex min-h-screen flex-col bg-white">
        {/* Top bar — deliberately small. The word is the point, not the branding. */}
        <header className="flex shrink-0 items-center justify-between gap-6 px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-slate-900 text-xl font-bold text-white">
              S
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              School Quiz
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden rounded-full border-2 border-slate-200 px-4 py-2 text-lg font-semibold text-slate-600 tabular-nums lg:inline">
              {usedWordIds.size} used
            </span>

            {!showAnswer && (
              <div
                className={`inline-flex items-center rounded-2xl border-4 px-6 py-3 ${timerTone}`}
              >
                <span className="font-mono text-4xl font-bold tabular-nums sm:text-5xl">
                  {timerLabel}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* The word. Everything else gives way to it. */}
        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-44 text-center">
          {showScrambledWord ? (
            <>
              <p className="mb-6 text-xl font-bold tracking-[0.35em] text-slate-500 uppercase sm:mb-10 sm:text-3xl">
                Unscramble the word
              </p>
              <ProjectionWord
                text={currentWord.scrambled}
                className="text-slate-950"
              />
            </>
          ) : (
            <p className="text-3xl font-semibold text-slate-400 sm:text-5xl">
              Press &ldquo;Start Word Timer&rdquo; to begin
            </p>
          )}
        </main>

        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80">
            <div className="text-center">
              <div className="font-mono text-[14rem] leading-none font-black text-white tabular-nums">
                {countdown}
              </div>
              <div className="mt-6 text-4xl font-semibold tracking-wide text-slate-300">
                Get ready…
              </div>
            </div>
          </div>
        )}

        {/* Quiz master controls — for the operator, so visually quiet */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-6 py-4">
            {wordReady ? (
              outOfTime ? (
                <Button
                  onClick={revealAnswer}
                  className="h-14 rounded-xl bg-slate-900 px-8 text-xl font-semibold text-white hover:bg-slate-800"
                >
                  Reveal Answer
                </Button>
              ) : (
                <Button
                  onClick={startWordTimer}
                  className="h-14 rounded-xl bg-slate-900 px-8 text-xl font-semibold text-white hover:bg-slate-800"
                >
                  Start Word Timer
                </Button>
              )
            ) : (
              <Button
                onClick={revealAnswer}
                disabled={showAnswer || !wordReady}
                className="h-14 rounded-xl bg-slate-900 px-8 text-xl font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500"
              >
                {showAnswer ? 'Answer Revealed' : 'Reveal Answer'}
              </Button>
            )}

            <Button
              onClick={nextWord}
              variant="outline"
              className="h-14 rounded-xl border-2 border-slate-300 px-8 text-xl font-semibold text-slate-800"
            >
              Next Word
            </Button>
            <Button
              onClick={resetUsedWords}
              variant="outline"
              className="h-14 rounded-xl border-2 border-slate-300 px-8 text-xl font-semibold text-slate-800"
            >
              Reset Used Words
            </Button>
            <Button
              onClick={toggleProjection}
              variant="outline"
              className="h-14 rounded-xl border-2 border-slate-300 px-8 text-xl font-semibold text-slate-800"
            >
              Exit Projection
            </Button>
          </div>
        </div>

        {/* Answer reveal */}
        {showAnswer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-6">
            <div className="w-full max-w-5xl rounded-3xl bg-white p-10 text-center shadow-2xl sm:p-16">
              <p className="text-2xl font-bold tracking-[0.3em] text-emerald-700 uppercase sm:text-3xl">
                The word was
              </p>

              <div className="mt-8">
                <ProjectionWord
                  text={currentWord.word.word}
                  maxVw={12}
                  fill={0.9}
                  className="text-slate-950"
                />
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => {
                    console.log('🔍 Next Word button clicked in desktop modal');
                    nextWord();
                  }}
                  className="h-16 rounded-2xl bg-slate-900 px-12 text-2xl font-semibold text-white hover:bg-slate-800"
                >
                  Next Word
                </Button>
                <Button
                  onClick={() => setShowAnswer(false)}
                  variant="outline"
                  className="h-16 rounded-2xl border-2 border-slate-300 px-12 text-2xl font-semibold text-slate-800"
                >
                  Close
                </Button>
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
      <div className="min-h-screen bg-white text-slate-900">
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-600/25">
                S
              </span>
              <span className="text-lg font-bold tracking-tight">School Quiz</span>
            </Link>
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Words
            </Link>
          </nav>
        </header>

        <main className="mx-auto flex max-w-xl flex-col justify-center px-4 py-14 sm:px-6 sm:py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
              <Timer className="size-3.5" />
              New session
            </span>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              How long per word?
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              The clock counts up to this limit, then you can reveal the answer.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 p-6 sm:p-8">
            <fieldset>
              <legend className="text-sm font-semibold text-slate-700">
                Time limit
              </legend>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[15, 30, 45, 60, 90, 120].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setTimeLimit(time)}
                    aria-pressed={timeLimit === time}
                    className={`h-11 rounded-xl text-sm font-semibold transition-colors ${
                      timeLimit === time
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {time}s
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-6">
              <label
                htmlFor="custom-time"
                className="text-sm font-semibold text-slate-700"
              >
                Or set your own
              </label>
              <Input
                id="custom-time"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
                min="10"
                max="300"
                className="mt-2 h-12 rounded-xl border-slate-200 text-center font-mono text-lg font-bold tabular-nums"
              />
              <p className="mt-2 text-sm text-slate-500">
                Between 10 and 300 seconds.
              </p>
            </div>

            <Button
              onClick={handleTimeSetup}
              className="mt-8 h-12 w-full rounded-xl bg-indigo-600 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition-transform hover:bg-indigo-700 active:scale-[0.99] motion-reduce:transition-none"
            >
              Start session
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Live control screen
  const outOfTime = timeSpent >= timeLimit;

  const timerTone = outOfTime
    ? 'border-red-700 bg-red-600 text-white'
    : !timerStarted
      ? 'border-slate-300 bg-slate-100 text-slate-700'
      : timerPaused
        ? 'border-amber-500 bg-amber-100 text-amber-900'
        : 'border-slate-900 bg-white text-slate-900';

  const timerLabel = outOfTime
    ? "Time's up"
    : !timerStarted
      ? 'Ready'
      : timerPaused
        ? `Paused ${formatTime(timeSpent)}`
        : formatTime(timeSpent);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-600/25">
              S
            </span>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              School Quiz
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 tabular-nums lg:inline">
              {usedWordIds.size} used
            </span>
            {!showAnswer && (
              <div
                aria-live="polite"
                className={`inline-flex items-center rounded-xl border-2 px-4 py-2 ${timerTone}`}
              >
                <span className="font-mono text-xl font-bold tabular-nums sm:text-2xl">
                  {timerLabel}
                </span>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-10 pb-44 sm:px-6 sm:pt-14">
        {/* message was set throughout this file but never rendered, so a word
            bank running dry looked identical to the app hanging. */}
        {message && (
          <div
            role="status"
            className={`mb-8 rounded-xl border px-4 py-3 text-center text-sm font-medium ${
              messageType === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : messageType === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {message}
          </div>
        )}

        <p className="text-center text-sm font-bold tracking-[0.3em] text-slate-500 uppercase sm:text-base">
          Unscramble the word
        </p>

        {/* The word */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 px-6 py-14 sm:py-20">
          {currentWord ? (
            showScrambledWord ? (
              <ProjectionWord
                text={currentWord.scrambled}
                maxVw={11}
                className="text-slate-950"
              />
            ) : (
              <p className="text-center text-xl font-semibold text-slate-400 sm:text-3xl">
                Press &ldquo;Start word timer&rdquo; to begin
              </p>
            )
          ) : (
            // Not necessarily loading: the bank can simply be empty, and saying
            // "Loading…" there reads as a hang.
            <p className="text-center text-xl font-semibold text-slate-400 sm:text-3xl">
              No word loaded
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Put this on the projector with{' '}
          <span className="font-semibold text-slate-700">Project to screen</span>.
        </p>
      </main>

      {/* Countdown overlay */}
      {countdown > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80">
          <div className="text-center">
            <div className="font-mono text-[10rem] leading-none font-black text-white tabular-nums">
              {countdown}
            </div>
            <div className="mt-4 text-3xl font-semibold text-slate-300">
              Get ready&hellip;
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 px-4 py-4 sm:gap-3">
          {wordReady ? (
            <>
              <Button
                onClick={timerStarted ? pauseResumeTimer : startWordTimer}
                disabled={countdown > 0}
                className="h-12 rounded-xl bg-indigo-600 px-6 text-base font-semibold text-white hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {countdown > 0
                  ? `Starting in ${countdown}…`
                  : timerStarted
                    ? timerPaused
                      ? 'Resume timer'
                      : 'Pause timer'
                    : 'Start word timer'}
              </Button>
              <Button
                onClick={revealAnswer}
                disabled={showAnswer}
                variant="outline"
                className="h-12 rounded-xl border-slate-300 px-6 text-base font-semibold text-slate-800 disabled:text-slate-400"
              >
                {showAnswer ? 'Answer revealed' : 'Reveal answer'}
              </Button>
            </>
          ) : (
            <Button
              onClick={revealAnswer}
              disabled={showAnswer || !wordReady}
              variant="outline"
              className="h-12 rounded-xl border-slate-300 px-6 text-base font-semibold text-slate-800 disabled:text-slate-400"
            >
              {showAnswer ? 'Answer revealed' : 'Reveal answer'}
            </Button>
          )}

          <Button
            onClick={nextWord}
            variant="outline"
            className="h-12 rounded-xl border-slate-300 px-6 text-base font-semibold text-slate-800"
          >
            Next word
          </Button>

          {/* The only way back when every word has been used. Projection mode
              always had this; the control screen did not. */}
          <Button
            onClick={resetUsedWords}
            variant="outline"
            className="h-12 rounded-xl border-slate-300 px-6 text-base font-semibold text-slate-800"
          >
            <RotateCcw className="size-4" />
            Reset used words
          </Button>

          {/* Projection mode had no way in: toggleProjection was only wired to
              the Exit button, which renders only once you are already in it. */}
          <Button
            onClick={toggleProjection}
            className="h-12 rounded-xl bg-slate-900 px-6 text-base font-semibold text-white hover:bg-slate-800"
          >
            <MonitorPlay className="size-4" />
            Project to screen
          </Button>
        </div>
      </div>

      {/* Answer reveal */}
      {showAnswer && currentWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-6">
          <div className="w-full max-w-4xl rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-12">
            <p className="text-xl font-bold tracking-[0.3em] text-emerald-700 uppercase sm:text-2xl">
              The word was
            </p>

            <div className="mt-6">
              <ProjectionWord
                text={currentWord.word.word}
                maxVw={9}
                fill={0.9}
                className="text-slate-950"
              />
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => {
                  console.log('🔍 Next Word button clicked in mobile modal');
                  nextWord();
                }}
                className="h-12 rounded-xl bg-slate-900 px-8 text-base font-semibold text-white hover:bg-slate-800"
              >
                Next word
              </Button>
              <Button
                onClick={() => setShowAnswer(false)}
                variant="outline"
                className="h-12 rounded-xl border-slate-300 px-8 text-base font-semibold text-slate-800"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
