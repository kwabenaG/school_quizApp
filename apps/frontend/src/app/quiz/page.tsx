"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface QuizData {
  word: {
    id: string;
    word: string;
    clues: string[];
    difficulty: 'easy' | 'medium' | 'hard';
  };
  scrambled: string;
  session: {
    id: string;
    name: string;
    currentWordIndex: number;
    totalWords: number;
    correctAnswers: number;
    totalAttempts: number;
  };
}

interface QuizResult {
  isCorrect: boolean;
  correctAnswer: string;
  nextWord?: QuizData;
  sessionComplete: boolean;
}

export default function QuizInterface() {
  const [sessionId, setSessionId] = useState('');
  const [contestantName, setContestantName] = useState('');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [answer, setAnswer] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeStarted, setTimeStarted] = useState<number | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [sessionComplete, setSessionComplete] = useState(false);

  // Mock quiz data for demonstration
  const mockQuizData: QuizData = {
    word: {
      id: '1',
      word: 'ELEPHANT',
      clues: ['A large animal with a trunk', 'Has a long nose', 'Lives in Africa and Asia'],
      difficulty: 'easy'
    },
    scrambled: 'HETNELPA',
    session: {
      id: '1',
      name: 'Grade 3 Word Challenge',
      currentWordIndex: 0,
      totalWords: 10,
      correctAnswers: 0,
      totalAttempts: 0
    }
  };

  const handleJoinQuiz = () => {
    if (!sessionId || !contestantName) return;
    
    // In a real app, this would make an API call to join the session
    setQuizData(mockQuizData);
    setIsJoined(true);
    setTimeStarted(Date.now());
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    // const timeSpent = timeStarted ? Math.round((Date.now() - timeStarted) / 1000) : 0;
    
    // Mock API call
    setTimeout(() => {
      const isCorrect = answer.toUpperCase().trim() === quizData?.word.word;
      const result: QuizResult = {
        isCorrect,
        correctAnswer: quizData?.word.word || '',
        sessionComplete: quizData?.session.currentWordIndex === (quizData?.session.totalWords || 0) - 1
      };
      
      setLastResult(result);
      setShowResult(true);
      setIsSubmitting(false);
      
      if (isCorrect && !result.sessionComplete) {
        // Move to next word
        setTimeout(() => {
          setQuizData({
            ...mockQuizData,
            word: {
              id: '2',
              word: 'BUTTERFLY',
              clues: ['A colorful insect that flies', 'Starts as a caterpillar', 'Has beautiful wings'],
              difficulty: 'medium'
            },
            scrambled: 'YFLETRUBT',
            session: {
              ...mockQuizData.session,
              currentWordIndex: 1,
              correctAnswers: 1,
              totalAttempts: 1
            }
          });
          setAnswer('');
          setShowResult(false);
          setTimeStarted(Date.now());
        }, 2000);
      } else if (result.sessionComplete) {
        setSessionComplete(true);
      }
    }, 1000);
  };

  const handleTryAgain = () => {
    setShowResult(false);
    setAnswer('');
    setTimeStarted(Date.now());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <CardTitle className="text-2xl text-green-600">Quiz Complete!</CardTitle>
            <CardDescription>
              Great job, {contestantName}! You&apos;ve finished the quiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{quizData?.session.correctAnswers}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Correct Answers</div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{quizData?.session.totalAttempts}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Attempts</div>
              </div>
            </div>
            <div className="pt-4">
              <Link href="/">
                <Button className="w-full">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span className="text-2xl sm:text-3xl">🎮</span>
            </div>
            <CardTitle className="text-lg sm:text-xl">Join Quiz Session</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Enter your details to join the quiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div>
              <Label htmlFor="sessionId" className="text-sm sm:text-base">Session Code</Label>
              <Input
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                placeholder="Enter session code"
                className="text-center text-base sm:text-lg font-mono h-10 sm:h-12"
              />
            </div>
            <div>
              <Label htmlFor="contestantName" className="text-sm sm:text-base">Your Name</Label>
              <Input
                id="contestantName"
                value={contestantName}
                onChange={(e) => setContestantName(e.target.value)}
                placeholder="Enter your name"
                className="h-10 sm:h-12"
              />
            </div>
            <Button 
              onClick={handleJoinQuiz} 
              className="w-full h-10 sm:h-12"
              disabled={!sessionId || !contestantName}
            >
              Join Quiz
            </Button>
            <div className="text-center">
              <Link href="/" className="text-xs sm:text-sm text-blue-600 hover:underline">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">🎓</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{quizData?.session.name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Welcome, {contestantName}!</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Badge variant="secondary" className="text-xs sm:text-sm">Word {(quizData?.session.currentWordIndex || 0) + 1} of {quizData?.session.totalWords || 0}</Badge>
              <Link href="/">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">Exit Quiz</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span>Progress</span>
            <span>{(quizData?.session.currentWordIndex || 0) + 1} / {quizData?.session.totalWords || 0}</span>
          </div>
          <Progress value={((quizData?.session.currentWordIndex || 0) + 1) / (quizData?.session.totalWords || 1) * 100} className="h-2 sm:h-3" />
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Quiz Card */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="text-center p-4 sm:p-6">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <Badge className={getDifficultyColor(quizData?.word.difficulty || 'medium')} variant="secondary">
                  {quizData?.word.difficulty?.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {quizData?.scrambled.length} letters
                </Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-mono tracking-wider text-gray-900 dark:text-white break-all">
                {quizData?.scrambled}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Clues:</h3>
                <div className="text-sm sm:text-base md:text-xl text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg space-y-1 sm:space-y-2">
                  {quizData?.word.clues.map((clue, index) => (
                    <p key={index} className="text-left">
                      {index + 1}. {clue}
                    </p>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="answer" className="text-base sm:text-lg">Your Answer:</Label>
                  <Input
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                    placeholder="Type your answer here..."
                    className="text-center text-lg sm:text-xl font-semibold mt-2 h-12 sm:h-14"
                    disabled={isSubmitting || showResult}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || isSubmitting}
                  className="w-full h-12 sm:h-14"
                  size="lg"
                >
                  {isSubmitting ? 'Checking...' : 'Submit Answer'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Display */}
          {showResult && lastResult && (
            <Card className={`border-2 mb-4 sm:mb-6 ${lastResult.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900' : 'border-red-500 bg-red-50 dark:bg-red-900'}`}>
              <CardContent className="text-center py-6 sm:py-8 px-4">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">
                  {lastResult.isCorrect ? '✅' : '❌'}
                </div>
                <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${lastResult.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {lastResult.isCorrect ? 'Correct!' : 'Not quite right'}
                </h3>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                  The correct answer is: <span className="font-bold">{lastResult.correctAnswer}</span>
                </p>
                {!lastResult.isCorrect && !lastResult.sessionComplete && (
                  <Button onClick={handleTryAgain} variant="outline" className="text-sm sm:text-base">
                    Try Again
                  </Button>
                )}
                {lastResult.isCorrect && !lastResult.sessionComplete && (
                  <p className="text-green-600 font-semibold text-sm sm:text-base">Moving to next word...</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <Card>
              <CardContent className="text-center py-3 sm:py-4">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{quizData?.session.correctAnswers}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Correct Answers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-3 sm:py-4">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{quizData?.session.totalAttempts}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Attempts</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
