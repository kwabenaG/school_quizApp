'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/config';

interface Word {
  id: string;
  word: string;
  clues: string[];
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
  const [newWord, setNewWord] = useState({ word: '', clues: [''], difficulty: 'medium' as 'easy' | 'medium' | 'hard' });
  const [csvFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editWord, setEditWord] = useState({ word: '', clues: [''], difficulty: 'medium' as 'easy' | 'medium' | 'hard' });

  // Load words on component mount
  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const response = await fetch(getApiUrl('/words?activeOnly=false'));
      if (response.ok) {
        const data = await response.json();
        setWords(data);
      }
    } catch {
      setMessage('Failed to load words');
      setMessageType('error');
    }
  };


  const handleAddWord = async () => {
    if (!newWord.word || newWord.clues.length === 0 || newWord.clues.every(clue => !clue.trim())) {
      setMessage('Please fill in word and at least one clue');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/words'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWord),
      });

      if (response.ok) {
        setMessage('Word added successfully');
        setMessageType('success');
        setNewWord({ word: '', clues: [''], difficulty: 'medium' });
        setShowAddForm(false);
        loadWords();
      } else {
        setMessage('Failed to add word');
        setMessageType('error');
      }
    } catch {
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
      const response = await fetch(getApiUrl('/words/bulk-delete'), {
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
    } catch {
      setMessage('Failed to delete words');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      setMessage('Please select an Excel file');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const response = await fetch(getApiUrl('/words/import-excel'), {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message);
        setMessageType('success');
        loadWords(); // Reload words
        setExcelFile(null);
      } else {
        setMessage(result.message || 'Failed to import Excel');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to import Excel');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTruncateDatabase = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL words and quiz data. This action cannot be undone. Are you sure?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/words/truncate'), {
        method: 'POST',
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message);
        setMessageType('success');
        loadWords(); // Reload words
      } else {
        setMessage('Failed to truncate database');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to truncate database');
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

  const handleEditWord = (word: Word) => {
    setEditingWord(word);
    setEditWord({
      word: word.word,
      clues: word.clues,
      difficulty: word.difficulty
    });
  };

  const handleUpdateWord = async () => {
    if (!editingWord || !editWord.word || editWord.clues.length === 0 || editWord.clues.every(clue => !clue.trim())) {
      setMessage('Please fill in word and at least one clue');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl(`/words/${editingWord.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editWord),
      });

      if (response.ok) {
        setMessage('Word updated successfully');
        setMessageType('success');
        setEditingWord(null);
        setEditWord({ word: '', clues: [''], difficulty: 'medium' });
        loadWords();
      } else {
        setMessage('Failed to update word');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to update word');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWord = async (wordId: string) => {
    if (!confirm('Are you sure you want to delete this word?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl(`/words/${wordId}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Word deleted successfully');
        setMessageType('success');
        loadWords();
      } else {
        setMessage('Failed to delete word');
        setMessageType('error');
      }
    } catch {
      setMessage('Failed to delete word');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingWord(null);
    setEditWord({ word: '', clues: [''], difficulty: 'medium' });
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">Manage your quiz content and settings</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="text-sm sm:text-base">← Back to Home</Button>
          </Link>
        </div>

        {/* Message Display */}
        {message && (
          <Alert className={`mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border-2 sm:border-4 shadow-xl ${
            messageType === 'success' ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' : 
            messageType === 'error' ? 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50' : 
            'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50'
          }`}>
            <AlertDescription className={`text-sm sm:text-base lg:text-lg font-semibold text-center py-3 sm:py-4 ${
              messageType === 'success' ? 'text-green-800' : 
              messageType === 'error' ? 'text-red-800' : 
              'text-blue-800'
            }`}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* CSV Import Section */}
        {/* <Card className="mb-6 sm:mb-8 shadow-2xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl flex items-center">
              <Upload className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
              Import Words from CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-xl">
              <p className="text-xs sm:text-sm text-blue-800 mb-2">
                <strong>CSV Format:</strong> Column 1: Word, Column 2: Clues (semicolon-separated), Column 3: Difficulty (optional)
              </p>
              <p className="text-xs sm:text-sm text-blue-600">
                Example: &quot;ocean,A large body of water;Where fish live;Blue and vast,easy&quot;
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Note: Save your Excel file as CSV format before uploading
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                onClick={handleCsvUpload}
                disabled={!csvFile || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-sm sm:text-base"
              >
                {isLoading ? 'Importing...' : 'Import CSV'}
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* Excel Import Section */}
        <Card className="mb-6 sm:mb-8 shadow-2xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl flex items-center">
              <Upload className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
              Import Words from Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="bg-green-50 p-3 sm:p-4 rounded-xl">
              <p className="text-xs sm:text-sm text-green-800 mb-2">
                <strong>Excel Format:</strong> Column A: Word, Column B: Clues (semicolon-separated), Column C: Difficulty (optional)
              </p>
              <p className="text-xs sm:text-sm text-green-600">
                Example: ocean | A large body of water;Where fish live;Blue and vast | easy
              </p>
              <p className="text-xs text-green-500 mt-1">
                Supports .xlsx and .xls files directly
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                onClick={handleExcelUpload}
                disabled={!excelFile || isLoading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-sm sm:text-base"
              >
                {isLoading ? 'Importing...' : 'Import Excel'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Management Section */}
        <Card className="mb-6 sm:mb-8 shadow-2xl border-red-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl flex items-center text-red-600">
              <Trash2 className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="bg-red-50 p-3 sm:p-4 rounded-xl">
              <p className="text-xs sm:text-sm text-red-800 mb-2">
                <strong>⚠️ DANGER ZONE:</strong> These actions will permanently delete data
              </p>
              <p className="text-xs sm:text-sm text-red-600">
                Truncate Database: Removes ALL words and quiz data. Use this before importing your own words.
              </p>
            </div>
            <Button 
              onClick={handleTruncateDatabase}
              disabled={isLoading}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-sm sm:text-base"
            >
              {isLoading ? 'Processing...' : '🗑️ Truncate Database'}
            </Button>
          </CardContent>
        </Card>

        {/* Add Word Section */}
        <Card className="mb-6 sm:mb-8 shadow-2xl">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl flex items-center">
              <Plus className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
              Add New Word
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)} className="w-full text-sm sm:text-base">
                Add New Word
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="Word"
                      value={newWord.word}
                      onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                      className="text-sm sm:text-base"
                    />
                    <select
                      value={newWord.difficulty}
                      onChange={(e) => setNewWord({...newWord, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Clues (one per line):</label>
                    {newWord.clues.map((clue, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder={`Clue ${index + 1}`}
                          value={clue}
                          onChange={(e) => {
                            const newClues = [...newWord.clues];
                            newClues[index] = e.target.value;
                            setNewWord({...newWord, clues: newClues});
                          }}
                          className="text-sm sm:text-base"
                        />
                        {newWord.clues.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newClues = newWord.clues.filter((_, i) => i !== index);
                              setNewWord({...newWord, clues: newClues});
                            }}
                            className="text-xs sm:text-sm"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewWord({...newWord, clues: [...newWord.clues, '']})}
                      className="text-xs sm:text-sm"
                    >
                      Add Another Clue
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button onClick={handleAddWord} disabled={isLoading} className="text-sm sm:text-base">
                    {isLoading ? 'Adding...' : 'Add Word'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="text-sm sm:text-base">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Words List */}
        <Card className="shadow-2xl">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                Words ({words.length})
              </CardTitle>
              {selectedWords.length > 0 && (
                <Button 
                  onClick={handleBulkDelete}
                  variant="destructive"
                  disabled={isLoading}
                  className="text-xs sm:text-sm"
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  Delete Selected ({selectedWords.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
              {words.map((word) => (
                <div key={word.id}>
                  {editingWord?.id === word.id ? (
                    // Edit Form
                    <div className="p-3 sm:p-4 border rounded-xl bg-yellow-50 border-yellow-300">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            placeholder="Word"
                            value={editWord.word}
                            onChange={(e) => setEditWord({...editWord, word: e.target.value})}
                            className="text-sm sm:text-base"
                          />
                          <select
                            value={editWord.difficulty}
                            onChange={(e) => setEditWord({...editWord, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs sm:text-sm font-medium text-gray-700">Clues (one per line):</label>
                          {editWord.clues.map((clue, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2">
                              <Input
                                placeholder={`Clue ${index + 1}`}
                                value={clue}
                                onChange={(e) => {
                                  const newClues = [...editWord.clues];
                                  newClues[index] = e.target.value;
                                  setEditWord({...editWord, clues: newClues});
                                }}
                                className="text-sm sm:text-base"
                              />
                              {editWord.clues.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newClues = editWord.clues.filter((_, i) => i !== index);
                                    setEditWord({...editWord, clues: newClues});
                                  }}
                                  className="text-xs sm:text-sm"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditWord({...editWord, clues: [...editWord.clues, '']})}
                            className="text-xs sm:text-sm"
                          >
                            Add Another Clue
                          </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button onClick={handleUpdateWord} disabled={isLoading} className="text-sm sm:text-base">
                            {isLoading ? 'Updating...' : 'Update Word'}
                          </Button>
                          <Button variant="outline" onClick={cancelEdit} className="text-sm sm:text-base">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Normal Word Display
                    <div 
                      className={`p-3 sm:p-4 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 ${
                        selectedWords.includes(word.id) ? 'bg-blue-50 border-blue-300' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                        <input
                          type="checkbox"
                          checked={selectedWords.includes(word.id)}
                          onChange={() => toggleWordSelection(word.id)}
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-bold text-base sm:text-lg break-all">{word.word}</span>
                            <Badge className={getDifficultyColor(word.difficulty)} variant="secondary">
                              {word.difficulty}
                            </Badge>
                            {!word.isActive && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <div className="text-gray-600 mb-2">
                            {word.clues.map((clue, index) => (
                              <p key={index} className="text-xs sm:text-sm break-words">
                                {index + 1}. {clue}
                              </p>
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Used {word.timesUsed} times
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 self-end sm:self-auto">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => handleEditWord(word)}
                          disabled={isLoading}
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteWord(word.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}