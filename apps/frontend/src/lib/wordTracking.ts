// Global word tracking utilities
const QUIZ_USED_WORDS_KEY = 'quizUsedWords';
const CURRENT_QUIZ_WORD_KEY = 'currentQuizWord';

interface WordData {
  word: {
    id: string;
    word: string;
    clues: string[];
    difficulty: string;
  };
  scrambled: string;
  correctWord: string;
}

export interface WordTracking {
  getUsedWords: () => Set<string>;
  addUsedWord: (wordId: string) => void;
  resetUsedWords: () => void;
  isWordUsed: (wordId: string) => boolean;
  setCurrentQuizWord: (wordData: WordData) => void;
  getCurrentQuizWord: () => WordData | null;
  clearCurrentQuizWord: () => void;
}

// Global word tracking instance
let usedWords: Set<string> = new Set();
let currentQuizWord: WordData | null = null;

// Load used words from localStorage
const loadUsedWords = (): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.log('🔍 Not in browser environment, skipping localStorage load');
    return;
  }
  
  try {
    const savedUsedWords = localStorage.getItem(QUIZ_USED_WORDS_KEY);
    if (savedUsedWords) {
      const wordIds = JSON.parse(savedUsedWords).filter((id: string) => id && id.trim());
      usedWords = new Set(wordIds);
      console.log('🔍 Loaded used words from localStorage:', Array.from(usedWords));
    }
  } catch (error) {
    console.error('Failed to parse used words from localStorage:', error);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(QUIZ_USED_WORDS_KEY);
    }
    usedWords = new Set();
  }
};

// Save used words to localStorage
const saveUsedWords = (): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.log('🔍 Not in browser environment, skipping localStorage save');
    return;
  }
  
  if (usedWords.size > 0) {
    localStorage.setItem(QUIZ_USED_WORDS_KEY, JSON.stringify(Array.from(usedWords)));
    console.log('🔍 Saved used words to localStorage:', Array.from(usedWords));
  }
};

// Load current quiz word from localStorage
const loadCurrentQuizWord = (): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    const savedCurrentWord = localStorage.getItem(CURRENT_QUIZ_WORD_KEY);
    if (savedCurrentWord) {
      currentQuizWord = JSON.parse(savedCurrentWord);
      console.log('🔍 Loaded current quiz word from localStorage:', currentQuizWord);
    }
  } catch (error) {
    console.error('Failed to parse current quiz word from localStorage:', error);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CURRENT_QUIZ_WORD_KEY);
    }
    currentQuizWord = null;
  }
};

// Save current quiz word to localStorage
const saveCurrentQuizWord = (): void => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  if (currentQuizWord) {
    localStorage.setItem(CURRENT_QUIZ_WORD_KEY, JSON.stringify(currentQuizWord));
    console.log('🔍 Saved current quiz word to localStorage:', currentQuizWord);
  }
};

// Initialize on module load
loadUsedWords();
loadCurrentQuizWord();

export const wordTracking: WordTracking = {
  getUsedWords: (): Set<string> => {
    return new Set(usedWords);
  },

  addUsedWord: (wordId: string): void => {
    if (wordId && wordId.trim()) {
      usedWords.add(wordId);
      saveUsedWords();
      console.log('🔍 Added word to global tracking:', wordId, 'Total used:', usedWords.size);
    } else {
      console.warn('🔍 Attempted to add invalid word ID:', wordId);
    }
  },

  resetUsedWords: (): void => {
    usedWords.clear();
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(QUIZ_USED_WORDS_KEY);
    }
    console.log('🔍 Reset all used words globally');
  },

  isWordUsed: (wordId: string): boolean => {
    return usedWords.has(wordId);
  },

  setCurrentQuizWord: (wordData: WordData): void => {
    currentQuizWord = wordData;
    saveCurrentQuizWord();
    console.log('🔍 Set current quiz word:', wordData);
    
    // Dispatch custom event to notify other tabs/pages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('currentQuizWordChanged', { 
        detail: wordData 
      }));
      console.log('🔍 Dispatched currentQuizWordChanged event');
    }
  },

  getCurrentQuizWord: (): WordData | null => {
    return currentQuizWord;
  },

  clearCurrentQuizWord: (): void => {
    currentQuizWord = null;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(CURRENT_QUIZ_WORD_KEY);
    }
    console.log('🔍 Cleared current quiz word');
  }
};

// Export for direct access
export const getUsedWords = wordTracking.getUsedWords;
export const addUsedWord = wordTracking.addUsedWord;
export const resetUsedWords = wordTracking.resetUsedWords;
export const isWordUsed = wordTracking.isWordUsed;
export const setCurrentQuizWord = wordTracking.setCurrentQuizWord;
export const getCurrentQuizWord = wordTracking.getCurrentQuizWord;
export const clearCurrentQuizWord = wordTracking.clearCurrentQuizWord;
