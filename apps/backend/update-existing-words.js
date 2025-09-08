// Simple script to update existing words with default clues
const words = [
  { word: "CAT", clues: ["A small furry pet", "Says meow", "Likes to climb trees"] },
  { word: "DOG", clues: ["Man's best friend", "Says woof", "Likes to play fetch"] },
  { word: "SUN", clues: ["Bright star in sky", "Gives us light", "Rises in the east"] },
  { word: "MOON", clues: ["Shines at night", "Changes shape", "Orbits Earth"] },
  { word: "FISH", clues: ["Lives in water", "Has gills", "Swims in schools"] },
  { word: "BOOK", clues: ["Has pages", "You read it", "Found in library"] },
  { word: "CAKE", clues: ["Sweet dessert", "Has candles", "Eaten on birthdays"] },
  { word: "RAIN", clues: ["Falls from clouds", "Makes puddles", "Needed for plants"] },
  { word: "ELEPHANT", clues: ["Large animal with trunk", "Has big ears", "Lives in Africa"] },
  { word: "BUTTERFLY", clues: ["Colorful insect", "Starts as caterpillar", "Has beautiful wings"] },
  { word: "MOUNTAIN", clues: ["Very tall landform", "Has peaks", "Hard to climb"] },
  { word: "OCEAN", clues: ["Large body of water", "Where fish live", "Blue and vast"] },
  { word: "RAINBOW", clues: ["Colorful arc in sky", "Appears after rain", "Has seven colors"] },
  { word: "LIBRARY", clues: ["Place with books", "Quiet place to read", "Has many shelves"] },
  { word: "PICTURE", clues: ["Visual image", "Hangs on wall", "Shows memories"] },
  { word: "FRIEND", clues: ["Someone you like", "Spends time with you", "Cares about you"] },
  { word: "SCHOOL", clues: ["Place to learn", "Has teachers", "Students go here"] },
  { word: "FAMILY", clues: ["People related to you", "Parents and siblings", "Lives together"] },
  { word: "ADVENTURE", clues: ["Exciting journey", "Something new", "Full of surprises"] },
  { word: "BEAUTIFUL", clues: ["Very pretty", "Pleasant to look at", "Attractive"] },
  { word: "CHALLENGE", clues: ["Something difficult", "Tests your ability", "Hard to do"] },
  { word: "DISCOVERY", clues: ["Finding something new", "Learning something", "Making a find"] },
  { word: "EXCELLENT", clues: ["Very good", "Outstanding", "Top quality"] },
  { word: "IMAGINATION", clues: ["Creative thinking", "Making up stories", "Using your mind"] },
  { word: "JOURNEY", clues: ["A trip", "Going somewhere", "Travel adventure"] },
  { word: "KNOWLEDGE", clues: ["What you know", "Information learned", "Understanding"] },
  { word: "TREE", clues: ["Tall plant", "Has leaves", "Grows in forest"] },
  { word: "FANTASTIC", clues: ["Amazing", "Wonderful", "Really great"] },
  { word: "LEARNING", clues: ["Gaining knowledge", "Studying", "Getting smarter"] },
  { word: "BIRD", clues: ["Flying animal", "Has feathers", "Lays eggs"] }
];

async function updateWords() {
  for (const wordData of words) {
    try {
      // First, get the word ID
      const response = await fetch(`http://localhost:3001/words?activeOnly=false`);
      const allWords = await response.json();
      const word = allWords.find(w => w.word.toLowerCase() === wordData.word.toLowerCase());
      
      if (word) {
        // Update the word with clues
        const updateResponse = await fetch(`http://localhost:3001/words/${word.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clues: wordData.clues
          })
        });
        
        if (updateResponse.ok) {
          console.log(`Updated ${wordData.word} with clues`);
        } else {
          console.log(`Failed to update ${wordData.word}`);
        }
      } else {
        console.log(`Word ${wordData.word} not found`);
      }
    } catch (error) {
      console.error(`Error updating ${wordData.word}:`, error);
    }
  }
}

updateWords();
