// Global word tracking utilities
const QUIZ_USED_WORDS_KEY = 'quizUsedWords';

export interface WordTracking {
  getUsedWords: () => Set<string>;
  addUsedWord: (wordId: string) => void;
  resetUsedWords: () => void;
  isWordUsed: (wordId: string) => boolean;
}

// Global word tracking instance
let usedWords: Set<string> = new Set();

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
      const wordIds = JSON.parse(savedUsedWords).filter(id => id && id.trim());
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

// Initialize on module load
loadUsedWords();

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
  }
};

// Export for direct access
export const getUsedWords = wordTracking.getUsedWords;
export const addUsedWord = wordTracking.addUsedWord;
export const resetUsedWords = wordTracking.resetUsedWords;
export const isWordUsed = wordTracking.isWordUsed;
