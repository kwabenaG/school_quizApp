import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Quiz</h1>
          </div>
          <div className="flex space-x-4">
            <Link href="/quiz-master">
              <Button variant="outline">Quiz Master</Button>
            </Link>
            <Link href="/start">
              <Button>Practice Mode</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Interactive Word Quiz
            <span className="block text-4xl text-blue-600 dark:text-blue-400 mt-2">
              for Junior School Students
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Challenge your students with fun, educational word puzzles! Teachers can create and manage 
            scrabble-style quizzes while students guess scrambled words with helpful clues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quiz-master">
              <Button size="lg" className="w-full sm:w-auto">
                🎯 Quiz Master Control
              </Button>
            </Link>
            <Link href="/start">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                🎮 Practice Mode
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📝</span>
              </div>
              <CardTitle>Easy Word Management</CardTitle>
              <CardDescription>
                Teachers can easily add, edit, and organize words with clues and difficulty levels
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎲</span>
              </div>
              <CardTitle>Smart Word Scrambling</CardTitle>
              <CardDescription>
                Advanced algorithm scrambles words differently each time for varied challenges
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Track student progress, accuracy rates, and quiz performance in real-time
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How it Works */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold mb-2">Teacher Creates Quiz</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Add words with clues and set difficulty levels
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold mb-2">Start Session</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Launch quiz and share session code with students
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold mb-2">Students Play</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Guess scrambled words using provided clues
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h4 className="font-semibold mb-2">Track Progress</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Monitor results and celebrate achievements
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Start Your First Quiz?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join thousands of teachers making learning fun and interactive
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" className="w-full sm:w-auto">
                Create Your First Quiz
              </Button>
            </Link>
            <Link href="/start">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Try Demo Quiz
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-sm">🎓</span>
              </div>
              <span className="text-gray-600 dark:text-gray-300">School Quiz Platform</span>
            </div>
            <div className="flex space-x-6">
              <Badge variant="secondary">Made with ❤️ for Education</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
