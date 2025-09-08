import { DataSource } from 'typeorm';
import { Word } from './entities/word.entity';

// This script migrates existing words from single clue to multiple clues
async function migrateCluesComprehensive() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'schoolquiz',
    entities: [Word],
    synchronize: false, // Don't auto-sync during migration
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // First, check if there's an old 'clue' column
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Check if the old clue column exists
      const tableExists = await queryRunner.hasTable('words');
      if (tableExists) {
        const columns = await queryRunner.getTable('words');
        const hasOldClueColumn = columns?.columns.some(col => col.name === 'clue');
        
        if (hasOldClueColumn) {
          console.log('Found old clue column, migrating data...');
          
          // Get all words with the old clue column
          const wordsWithOldClue = await queryRunner.query(`
            SELECT id, word, clue, difficulty, "timesUsed", "isActive", "createdAt", "updatedAt" 
            FROM words 
            WHERE clue IS NOT NULL
          `);

          console.log(`Found ${wordsWithOldClue.length} words with old clue data`);

          // Update each word to convert single clue to clues array
          for (const word of wordsWithOldClue) {
            await queryRunner.query(`
              UPDATE words 
              SET clues = ARRAY[$1] 
              WHERE id = $2
            `, [word.clue, word.id]);
            console.log(`Migrated word: ${word.word} - "${word.clue}"`);
          }

          // Drop the old clue column
          await queryRunner.dropColumn('words', 'clue');
          console.log('Dropped old clue column');
        }
      }
    } finally {
      await queryRunner.release();
    }

    // Now handle any remaining null clues
    const wordRepository = dataSource.getRepository(Word);
    const wordsWithNullClues = await wordRepository.find({
      where: { clues: null }
    });

    console.log(`Found ${wordsWithNullClues.length} words with null clues`);

    for (const word of wordsWithNullClues) {
      word.clues = ['No clue provided'];
      await wordRepository.save(word);
      console.log(`Set default clue for word: ${word.word}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await dataSource.destroy();
  }
}

migrateCluesComprehensive();
