'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Plus, Edit } from 'lucide-react';
import Link from 'next/link';

interface Word {
  id: string;
  word: string;
  clue: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  timesUsed: number;
  createdAt: string;
}

export default function AdminPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', clue: '', difficulty: 'medium' as const });
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Load words on component mount
  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const response = await fetch('http://localhost:3001/words?activeOnly=false');
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      }
    } catch (error) {
      setMessage('Failed to load words');
      setMessageType('error');
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setMessage('Please select a CSV file');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await fetch('http://localhost:3001/words/import-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message);
        setMessageType('success');
        loadWords(); // Reload words
        setCsvFile(null);
      } else {
        setMessage(result.message || 'Failed to import CSV');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to import CSV');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.word || !newWord.clue) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWord),
      });

      if (response.ok) {
        setMessage('Word added successfully');
        setMessageType('success');
        setNewWord({ word: '', clue: '', difficulty: 'medium' });
        setShowAddForm(false);
        loadWords();
      } else {
        setMessage('Failed to add word');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to add word');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWords.length === 0) {
      setMessage('Please select words to delete');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/words/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedWords }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message);
        setMessageType('success');
        setSelectedWords([]);
        loadWords();
      } else {
        setMessage('Failed to delete words');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to delete words');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWordSelection = (wordId: string) => {
    setSelectedWords(prev => 
      prev.includes(wordId) 
        ? prev.filter(id => id !== wordId)
        : [...prev, wordId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600">Manage your quiz content and settings</p>
          </div>
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>

        {/* Message Display */}
        {message && (
          <Alert className={`mb-6 rounded-2xl border-4 shadow-xl ${
            messageType === 'success' ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' : 
            messageType === 'error' ? 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50' : 
            'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50'
          }`}>
            <AlertDescription className={`text-lg font-semibold text-center py-4 ${
              messageType === 'success' ? 'text-green-800' : 
              messageType === 'error' ? 'text-red-800' : 
              'text-blue-800'
            }`}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* CSV Import Section */}
        <Card className="mb-8 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Upload className="mr-2" />
              Import Words from CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-800 mb-2">
                <strong>CSV Format:</strong> word, clue, difficulty (optional)
              </p>
              <p className="text-sm text-blue-600">
                Example: "ocean,A large body of water,easy"
              </p>
            </div>
            <div className="flex space-x-4">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                onClick={handleCsvUpload}
                disabled={!csvFile || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                {isLoading ? 'Importing...' : 'Import CSV'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Word Section */}
        <Card className="mb-8 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Plus className="mr-2" />
              Add New Word
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                Add New Word
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Word"
                    value={newWord.word}
                    onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                  />
                  <Input
                    placeholder="Clue"
                    value={newWord.clue}
                    onChange={(e) => setNewWord({...newWord, clue: e.target.value})}
                  />
                  <select
                    value={newWord.difficulty}
                    onChange={(e) => setNewWord({...newWord, difficulty: e.target.value as any})}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddWord} disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Word'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Words List */}
        <Card className="shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">
                Words ({words.length})
              </CardTitle>
              {selectedWords.length > 0 && (
                <Button 
                  onClick={handleBulkDelete}
                  variant="destructive"
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2" />
                  Delete Selected ({selectedWords.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {words.map((word) => (
                <div 
                  key={word.id} 
                  className={`p-4 border rounded-xl flex items-center justify-between ${
                    selectedWords.includes(word.id) ? 'bg-blue-50 border-blue-300' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedWords.includes(word.id)}
                      onChange={() => toggleWordSelection(word.id)}
                      className="w-4 h-4"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">{word.word}</span>
                        <Badge className={getDifficultyColor(word.difficulty)}>
                          {word.difficulty}
                        </Badge>
                        {!word.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{word.clue}</p>
                      <p className="text-sm text-gray-500">
                        Used {word.timesUsed} times
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}