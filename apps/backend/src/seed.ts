import { DataSource } from 'typeorm';
import { Word, DifficultyLevel } from './entities/word.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.SUPABASE_DB_URL || 
    (process.env.SUPABASE_URL ? 
      `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_URL.replace('https://', '').replace('http://', '')}:5432/postgres` :
      `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'school_quiz'}`),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
  ssl: (process.env.SUPABASE_DB_URL || process.env.SUPABASE_URL) ? { rejectUnauthorized: false } : false,
});

const sampleWords = [
  // Easy words
  { word: 'CAT', clue: 'A small furry pet that meows', difficulty: DifficultyLevel.EASY },
  { word: 'DOG', clue: 'A loyal pet that barks', difficulty: DifficultyLevel.EASY },
  { word: 'SUN', clue: 'The bright star in our sky', difficulty: DifficultyLevel.EASY },
  { word: 'MOON', clue: 'Shines at night in the sky', difficulty: DifficultyLevel.EASY },
  { word: 'TREE', clue: 'A tall plant with leaves and branches', difficulty: DifficultyLevel.EASY },
  { word: 'BIRD', clue: 'An animal that can fly and has feathers', difficulty: DifficultyLevel.EASY },
  { word: 'FISH', clue: 'Lives in water and has gills', difficulty: DifficultyLevel.EASY },
  { word: 'BOOK', clue: 'Something you read with pages', difficulty: DifficultyLevel.EASY },
  { word: 'CAKE', clue: 'A sweet dessert for birthdays', difficulty: DifficultyLevel.EASY },
  { word: 'RAIN', clue: 'Water that falls from clouds', difficulty: DifficultyLevel.EASY },

  // Medium words
  { word: 'ELEPHANT', clue: 'A large animal with a trunk', difficulty: DifficultyLevel.MEDIUM },
  { word: 'BUTTERFLY', clue: 'A colorful insect that flies', difficulty: DifficultyLevel.MEDIUM },
  { word: 'MOUNTAIN', clue: 'A very tall landform', difficulty: DifficultyLevel.MEDIUM },
  { word: 'OCEAN', clue: 'A very large body of salt water', difficulty: DifficultyLevel.MEDIUM },
  { word: 'RAINBOW', clue: 'Colors in the sky after rain', difficulty: DifficultyLevel.MEDIUM },
  { word: 'LIBRARY', clue: 'A place with many books to read', difficulty: DifficultyLevel.MEDIUM },
  { word: 'PICTURE', clue: 'A drawing or photograph', difficulty: DifficultyLevel.MEDIUM },
  { word: 'FRIEND', clue: 'Someone you like to spend time with', difficulty: DifficultyLevel.MEDIUM },
  { word: 'SCHOOL', clue: 'A place where you learn', difficulty: DifficultyLevel.MEDIUM },
  { word: 'FAMILY', clue: 'Your parents, siblings, and relatives', difficulty: DifficultyLevel.MEDIUM },

  // Hard words
  { word: 'ADVENTURE', clue: 'An exciting or unusual experience', difficulty: DifficultyLevel.HARD },
  { word: 'BEAUTIFUL', clue: 'Very pretty or attractive', difficulty: DifficultyLevel.HARD },
  { word: 'CHALLENGE', clue: 'Something difficult that tests your abilities', difficulty: DifficultyLevel.HARD },
  { word: 'DISCOVERY', clue: 'Finding something new or unknown', difficulty: DifficultyLevel.HARD },
  { word: 'EXCELLENT', clue: 'Very good or outstanding', difficulty: DifficultyLevel.HARD },
  { word: 'FANTASTIC', clue: 'Amazing or wonderful', difficulty: DifficultyLevel.HARD },
  { word: 'IMAGINATION', clue: 'The ability to create pictures in your mind', difficulty: DifficultyLevel.HARD },
  { word: 'JOURNEY', clue: 'A long trip or adventure', difficulty: DifficultyLevel.HARD },
  { word: 'KNOWLEDGE', clue: 'Information and understanding', difficulty: DifficultyLevel.HARD },
  { word: 'LEARNING', clue: 'Gaining new skills or information', difficulty: DifficultyLevel.HARD },
];

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('📊 Database connected successfully');

    const wordRepository = AppDataSource.getRepository(Word);

    // Clear existing data (handle foreign key constraints)
    console.log('🗑️ Clearing existing data...');
    await AppDataSource.manager.query('TRUNCATE TABLE quiz_attempts CASCADE');
    await AppDataSource.manager.query('TRUNCATE TABLE quiz_sessions CASCADE');
    await AppDataSource.manager.query('TRUNCATE TABLE words CASCADE');
    console.log('✅ Cleared existing data');

    // Insert sample words
    const words = wordRepository.create(sampleWords);
    await wordRepository.save(words);
    console.log(`✅ Seeded ${words.length} words successfully`);

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase();
