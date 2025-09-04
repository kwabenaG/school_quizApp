'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
      const response = await fetch(`http://localhost:3001/quiz/sessions/${sessionId}/current-word`);
      
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
      const response = await fetch('http://localhost:3001/words/random/word');
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
      const response = await fetch(`http://localhost:3001/quiz/sessions/${sessionId}/submit-answer`, {
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
          <CardContent className="p-10">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl">🎓</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                School Quiz
              </h1>
              <p className="text-xl text-gray-600 font-medium">Enter your details to start the fun!</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-lg font-semibold text-gray-700">Session ID</label>
                <Input
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter session ID"
                  className="w-full text-center text-xl py-4 h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-lg font-semibold text-gray-700">Your Name</label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full text-center text-xl py-4 h-14 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <Button 
                onClick={startQuiz} 
                disabled={isLoading}
                className="w-full text-xl py-4 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isLoading ? 'Starting...' : '🚀 Start Quiz'}
              </Button>
              <div className="text-center">
                <p className="text-lg text-gray-500 mb-4 font-medium">Or try a practice word:</p>
                <Button 
                  variant="outline" 
                  onClick={getRandomWord}
                  disabled={isLoading}
                  className="w-full text-lg py-3 h-12 border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-xl"
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

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Beautiful Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
            <span className="text-5xl">🎓</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            School Quiz
          </h1>
          <p className="text-2xl text-gray-600 font-medium">Unscramble the word and have fun!</p>
          
          {/* Timer Display */}
          {currentWord && !showAnswer && (
            <div className="mt-6 inline-flex items-center justify-center bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl px-8 py-4 border-2 border-green-300 shadow-lg">
              <span className="text-3xl mr-3">⏱️</span>
              <span className="text-3xl font-bold text-green-800">
                {formatTime(timeSpent)}
              </span>
            </div>
          )}
        </div>

        {/* Main Game Area */}
        {currentWord && (
          <div className="text-center space-y-8">
            {/* HUGE Beautiful Scrambled Word Display */}
            <div className="relative">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-16 mb-8 border-4 border-blue-200 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-300 rounded-full opacity-60"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-green-300 rounded-full opacity-60"></div>
                <div className="absolute top-1/2 left-4 w-4 h-4 bg-pink-300 rounded-full opacity-60"></div>
                
                <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-gray-800 to-blue-800 bg-clip-text text-transparent tracking-widest mb-6 drop-shadow-lg">
                  {currentWord.scrambled}
                </div>
                <p className="text-3xl text-gray-600 font-semibold">
                  Can you unscramble this word?
                </p>
              </div>
            </div>

            {/* Beautiful Clue Display */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl p-10 mb-8 border-4 border-blue-300 shadow-xl relative overflow-hidden">
              <div className="absolute top-2 right-2 text-4xl opacity-30">💡</div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
                Clue:
              </h2>
              <p className="text-3xl text-blue-800 font-semibold leading-relaxed">
                {currentWord.word.clue}
              </p>
            </div>

            {/* Beautiful Answer Input */}
            <div className="max-w-lg mx-auto space-y-8">
              <div className="relative">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                  placeholder="Type your answer here..."
                  className="text-center text-3xl font-bold py-6 h-20 border-4 border-gray-300 focus:border-blue-500 rounded-2xl shadow-lg bg-white/90 backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && !showAnswer && submitAnswer()}
                  disabled={showAnswer}
                />
              </div>
              
              {!showAnswer ? (
                <Button 
                  onClick={submitAnswer}
                  disabled={isLoading || !userAnswer.trim()}
                  className="w-full text-2xl py-6 h-20 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  {isLoading ? '⏳ Checking...' : '✅ Submit Answer'}
                </Button>
              ) : (
                <div className="space-y-6">
                  <Button 
                    onClick={nextWord}
                    className="w-full text-2xl py-6 h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    🎯 Next Word
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full text-xl py-4 h-16 border-3 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-2xl"
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
          <div className="mt-12 max-w-3xl mx-auto">
            <Alert className={`rounded-2xl border-4 shadow-xl ${
              messageType === 'success' ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' : 
              messageType === 'error' ? 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50' : 
              'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50'
            }`}>
              <AlertDescription className={`text-2xl font-semibold text-center py-4 ${
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
