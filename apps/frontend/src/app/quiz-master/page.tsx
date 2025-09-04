'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WordData {
  word: {
    id: string;
    word: string;
    clue: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  scrambled: string;
}

interface QuizSession {
  id: string;
  name: string;
  status: string;
  currentWordIndex: number;
  totalWords: number;
  correctAnswers: number;
  totalAttempts: number;
}

export default function QuizMasterPage() {
  const [sessionName, setSessionName] = useState('');
  const [totalWords, setTotalWords] = useState(10);
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [timeSpent, setTimeSpent] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [projectionMode, setProjectionMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 seconds
  const [showTimeSetup, setShowTimeSetup] = useState(true);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && currentWord && !showAnswer) {
      setTimeSpent(0);
      interval = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          // Auto-reveal answer when time limit is reached
          if (newTime >= timeLimit) {
            setShowAnswer(true);
            setMessage('Time\'s up! Answer revealed automatically.');
            setMessageType('info');
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, currentWord, showAnswer, timeLimit]);

  // Load a random word when page loads (only if time setup is complete)
  useEffect(() => {
    const loadRandomWord = async () => {
      try {
        const response = await fetch('http://localhost:3001/words/random/word');
        if (response.ok) {
          const wordData = await response.json();
          setCurrentWord(wordData);
          setGameStarted(true);
          setTimeSpent(0);
        }
      } catch (error) {
        console.error('Failed to load word:', error);
      }
    };

    if (!currentWord && !showTimeSetup) {
      loadRandomWord();
    }
  }, [currentWord, showTimeSetup]);

  const handleTimeSetup = () => {
    setShowTimeSetup(false);
    setMessage(`Time limit set to ${timeLimit} seconds per word.`);
    setMessageType('success');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const createSession = async () => {
    if (!sessionName.trim()) {
      setMessage('Please enter a session name');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/quiz/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sessionName,
          totalWords: totalWords
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const newSession = await response.json();
      setSession(newSession);
      setMessage(`Session "${sessionName}" created successfully!`);
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to create session. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    if (!session) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:3001/quiz/sessions/${session.id}/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const startedSession = await response.json();
      setSession(startedSession);

      // Get first word
      const wordResponse = await fetch(`http://localhost:3001/quiz/sessions/${session.id}/current-word`);
      const wordData = await wordResponse.json();
      
      setCurrentWord(wordData);
      setGameStarted(true);
      setTimeSpent(0);
      setMessage('Session started! First word is ready.');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to start session. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const startWord = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Get random word
      const response = await fetch('http://localhost:3001/words/random/word');
      if (response.ok) {
        const wordData = await response.json();
        setCurrentWord(wordData);
        setShowAnswer(false);
        setTimeSpent(0);
        setGameStarted(true);
        setMessage('New word started! Timer is running.');
        setMessageType('success');
      } else {
        throw new Error('Failed to get word');
      }
    } catch (error) {
      setMessage('Failed to start new word. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const nextWord = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // Get random word
      const response = await fetch('http://localhost:3001/words/random/word');
      if (response.ok) {
        const wordData = await response.json();
        setCurrentWord(wordData);
        setShowAnswer(false);
        setTimeSpent(0);
        setMessage('Next word loaded!');
        setMessageType('success');
      } else {
        throw new Error('Failed to get word');
      }
    } catch (error) {
      setMessage('Failed to get next word. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const revealAnswer = () => {
    setShowAnswer(true);
    setMessage('Answer revealed to contestants!');
    setMessageType('info');
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
                <div className="ml-12 inline-flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl px-8 py-4 border-4 border-green-300 shadow-2xl">
                  <span className="text-3xl mr-3">⏱️</span>
                  <span className="text-4xl font-bold text-green-800">
                    {formatTime(timeSpent)}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-3xl text-gray-600 font-medium">Unscramble the word!</p>
          </div>

          {/* Main Game Area */}
          <div className="text-center space-y-12">
            {/* HUGE Scrambled Word Display */}
            <div className="w-full">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-none md:rounded-2xl lg:rounded-4xl shadow-2xl p-4 md:p-8 lg:p-12 mb-6 border-0 md:border-4 lg:border-6 border-blue-200 relative overflow-visible w-full min-h-[150px] md:min-h-[250px] lg:min-h-[350px] flex items-center justify-center">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-300 rounded-full opacity-60"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 bg-green-300 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 left-4 w-6 h-6 bg-pink-300 rounded-full opacity-60"></div>
                
                <div className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent tracking-wider drop-shadow-lg whitespace-nowrap text-center overflow-visible">
                  {currentWord.scrambled}
                </div>
              </div>
            </div>

            {/* Clue Display */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-4xl p-12 mb-12 border-6 border-blue-300 shadow-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4 text-6xl opacity-30">💡</div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-8">
                Clue:
              </h2>
              <p className="text-4xl text-blue-800 font-semibold leading-relaxed">
                {currentWord.word.clue}
              </p>
            </div>

          </div>

          {/* Quiz Master Controls (Bottom) */}
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gray-200">
            <div className="flex space-x-4">
              <Button 
                onClick={revealAnswer}
                disabled={showAnswer}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg rounded-xl"
              >
                {showAnswer ? 'Answer Revealed' : 'Reveal Answer'}
              </Button>
              <Button 
                onClick={nextWord}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg rounded-xl"
              >
                Next Word
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
                  Great job! The word was "{currentWord.word.word}"
                </p>
                
                <div className="flex justify-center space-x-6">
                  <Button 
                    onClick={nextWord}
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
              <div className="ml-12 inline-flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl px-8 py-4 border-4 border-green-300 shadow-2xl">
                <span className="text-3xl mr-3">⏱️</span>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-800">
                    {formatTime(timeSpent)}
                  </div>
                  <div className="text-sm text-green-600 font-semibold">
                    / {formatTime(timeLimit)}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-3xl text-gray-600 font-medium">Unscramble the word!</p>
        </div>

        {/* Main Game Area */}
        <div className="text-center space-y-12">
          {/* HUGE Scrambled Word Display */}
          <div className="w-full">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-none md:rounded-2xl lg:rounded-4xl shadow-2xl p-4 md:p-8 lg:p-12 mb-6 border-0 md:border-4 lg:border-6 border-blue-200 relative overflow-visible w-full min-h-[150px] md:min-h-[250px] lg:min-h-[350px] flex items-center justify-center">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-300 rounded-full opacity-60"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-green-300 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 left-4 w-6 h-6 bg-pink-300 rounded-full opacity-60"></div>
              
              <div className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent tracking-wider drop-shadow-lg whitespace-nowrap text-center overflow-visible">
                {currentWord ? currentWord.scrambled : 'Loading...'}
              </div>
            </div>
          </div>

          {/* Clue Display */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-4xl p-12 mb-12 border-6 border-blue-300 shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 right-4 text-6xl opacity-30">💡</div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-8">
              Clue:
            </h2>
            <p className="text-4xl text-blue-800 font-semibold leading-relaxed">
              {currentWord ? currentWord.word.clue : 'Loading clue...'}
            </p>
          </div>

        </div>

        {/* Quiz Master Controls (Bottom) */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-gray-200">
          <div className="flex space-x-4">
            <Button 
              onClick={startWord}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg rounded-xl"
            >
              Start Word
            </Button>
            <Button 
              onClick={revealAnswer}
              disabled={showAnswer}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 text-lg rounded-xl"
            >
              {showAnswer ? 'Answer Revealed' : 'Reveal Answer'}
            </Button>
            <Button 
              onClick={nextWord}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg rounded-xl"
            >
              Next Word
            </Button>
          </div>
        </div>
      </div>

      {/* Answer Reveal Modal */}
      {showAnswer && currentWord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-4xl p-16 max-w-6xl w-full border-6 border-green-300 shadow-2xl relative overflow-hidden">
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
              
              <div className="bg-white rounded-3xl p-12 border-4 border-green-200 shadow-xl mb-8 w-full">
                <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent tracking-wider whitespace-nowrap text-center overflow-visible">
                  {currentWord.word.word}
                </div>
              </div>
              
              <p className="text-3xl text-green-700 font-semibold mb-8">
                Great job! The word was "{currentWord.word.word}"
              </p>
              
              <div className="flex justify-center space-x-6">
                <Button 
                  onClick={nextWord}
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
