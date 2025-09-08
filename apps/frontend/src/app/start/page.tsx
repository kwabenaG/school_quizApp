'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiUrl } from '@/lib/config';

interface WordData {
  word: {
    id: string;
    word: string;
    clues: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  };
  scrambled: string;
}

export default function QuizStartPage() {
  const [sessionId, setSessionId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [currentWord, setCurrentWord] = useState<WordData | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [gameStarted, setGameStarted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && currentWord && !showAnswer) {
      setTimeSpent(0); // Reset timer for new word
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, currentWord, showAnswer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = async () => {
    if (!sessionId.trim() || !studentName.trim()) {
      setMessage('Please enter both session ID and your name');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Get current word for the session
      const response = await fetch(getApiUrl(`/quiz/sessions/${sessionId}/current-word`));
      
      if (!response.ok) {
        throw new Error('Session not found or not active');
      }

      const data = await response.json();
      setCurrentWord(data);
      setGameStarted(true);
      setTimeSpent(0);
      setMessage(`Welcome ${studentName}! Let's start the quiz!`);
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to start quiz. Please check your session ID.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomWord = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(getApiUrl('/words/random/word'));
      const data = await response.json();
      
      setCurrentWord(data);
      setGameStarted(true);
      setTimeSpent(0);
      setMessage('Here\'s a word to practice with!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to get random word. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      setMessage('Please enter your answer');
      setMessageType('error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl(`/quiz/sessions/${sessionId}/submit-answer`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contestantName: studentName,
          answer: userAnswer.trim(),
        }),
      });

      const result = await response.json();

      if (result.isCorrect) {
        setMessage(`🎉 Correct! The word was "${result.correctAnswer}"`);
        setMessageType('success');
      } else {
        setMessage(`❌ Not quite right. The correct answer was "${result.correctAnswer}"`);
        setMessageType('error');
      }

      setShowAnswer(true);

    } catch (error) {
      setMessage('Failed to submit answer. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const nextWord = async () => {
    setUserAnswer('');
    setShowAnswer(false);
    setMessage('');
    setTimeSpent(0);
    await getRandomWord();
  };

  // Beautiful entry form
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full opacity-10 animate-pulse delay-500"></div>
        </div>
        
        <Card className="w-full max-w-lg relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 lg:p-10">
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <span className="text-3xl sm:text-4xl">🎓</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                School Quiz
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 font-medium">Enter your details to start the fun!</p>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="block text-base sm:text-lg font-semibold text-gray-700">Session ID</label>
                <Input
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter session ID"
                  className="w-full text-center text-lg sm:text-xl py-3 sm:py-4 h-12 sm:h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-base sm:text-lg font-semibold text-gray-700">Your Name</label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full text-center text-lg sm:text-xl py-3 sm:py-4 h-12 sm:h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <Button 
                onClick={startQuiz} 
                disabled={isLoading}
                className="w-full text-lg sm:text-xl py-3 sm:py-4 h-12 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? 'Starting...' : '🚀 Start Quiz'}
              </Button>
              <div className="text-center">
                <p className="text-base sm:text-lg text-gray-500 mb-3 sm:mb-4 font-medium">Or try a practice word:</p>
                <Button 
                  variant="outline" 
                  onClick={getRandomWord}
                  disabled={isLoading}
                  className="w-full text-base sm:text-lg py-2 sm:py-3 h-10 sm:h-12 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
                >
                  🎯 Practice Word
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Beautiful main quiz interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-200 rounded-full opacity-30 animate-bounce delay-1000"></div>
        <div className="absolute top-1/3 left-10 w-16 h-16 bg-pink-200 rounded-full opacity-40 animate-bounce delay-500"></div>
        <div className="absolute bottom-1/3 right-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-bounce delay-700"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10 px-4">
        {/* Beautiful Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 sm:mb-6 shadow-2xl">
            <span className="text-3xl sm:text-4xl lg:text-5xl">🎓</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            School Quiz
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-medium">Unscramble the word and have fun!</p>
          
          {/* Timer Display */}
          {currentWord && !showAnswer && (
            <div className="mt-4 sm:mt-6 inline-flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-2 border-green-300 shadow-lg">
              <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">⏱️</span>
              <span className="text-2xl sm:text-3xl font-bold text-green-800">
                {formatTime(timeSpent)}
              </span>
            </div>
          )}
        </div>

        {/* Main Game Area */}
        {currentWord && (
          <div className="text-center space-y-6 sm:space-y-8">
            {/* HUGE Beautiful Scrambled Word Display */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 mb-6 sm:mb-8 border-2 sm:border-4 border-blue-200 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-300 rounded-full opacity-60"></div>
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-4 h-4 sm:w-6 sm:h-6 bg-green-300 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 left-2 sm:left-4 w-3 h-3 sm:w-4 sm:h-4 bg-pink-300 rounded-full opacity-60"></div>
                
                <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent tracking-widest mb-4 sm:mb-6 drop-shadow-lg break-all">
                  {currentWord.scrambled}
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-600 font-semibold">
                  Can you unscramble this word?
                </p>
              </div>
            </div>

            {/* Beautiful Clue Display */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 border-2 sm:border-4 border-blue-300 shadow-xl relative overflow-hidden">
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 text-2xl sm:text-4xl opacity-30">💡</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 sm:mb-6">
                Clues:
              </h2>
              <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-blue-800 font-semibold leading-relaxed space-y-1 sm:space-y-2">
                {currentWord.word.clues.map((clue, index) => (
                  <p key={index} className="text-left">
                    {index + 1}. {clue}
                  </p>
                ))}
              </div>
            </div>

            {/* Beautiful Answer Input */}
            <div className="max-w-lg mx-auto space-y-6 sm:space-y-8">
              <div className="relative">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                  placeholder="Type your answer here..."
                  className="text-center text-xl sm:text-2xl lg:text-3xl font-bold py-4 sm:py-6 h-16 sm:h-20 border-2 sm:border-4 border-gray-300 focus:border-blue-500 rounded-xl sm:rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && !showAnswer && submitAnswer()}
                  disabled={showAnswer}
                />
              </div>
              
              {!showAnswer ? (
                <Button 
                  onClick={submitAnswer}
                  disabled={isLoading || !userAnswer.trim()}
                  className="w-full text-lg sm:text-xl lg:text-2xl py-4 sm:py-6 h-16 sm:h-20 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-xl sm:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  {isLoading ? '⏳ Checking...' : '✅ Submit Answer'}
                </Button>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <Button 
                    onClick={nextWord}
                    className="w-full text-lg sm:text-xl lg:text-2xl py-4 sm:py-6 h-16 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl sm:rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    🎯 Next Word
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full text-base sm:text-lg lg:text-xl py-3 sm:py-4 h-12 sm:h-16 border-2 sm:border-3 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl sm:rounded-2xl"
                  >
                    🔄 New Quiz
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Beautiful Message Display */}
        {message && (
          <div className="mt-8 sm:mt-12 max-w-3xl mx-auto px-4">
            <Alert className={`rounded-xl sm:rounded-2xl border-2 sm:border-4 shadow-xl ${
              messageType === 'success' ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' : 
              messageType === 'error' ? 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50' : 
              'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50'
            }`}>
              <AlertDescription className={`text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-center py-3 sm:py-4 ${
                messageType === 'success' ? 'text-green-800' : 
                messageType === 'error' ? 'text-red-800' : 
                'text-blue-800'
              }`}>
                {message}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
