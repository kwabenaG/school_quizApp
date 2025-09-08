import { DataSource } from 'typeorm';
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

async function truncateDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('📊 Database connected successfully');

    // Clear all data in correct order (respecting foreign key constraints)
    console.log('🗑️ Clearing existing data...');
    
    // Clear quiz attempts first (has foreign key to quiz sessions)
    await AppDataSource.manager.query('TRUNCATE TABLE quiz_attempts CASCADE');
    console.log('✅ Cleared quiz_attempts table');
    
    // Clear quiz sessions (has foreign key to words)
    await AppDataSource.manager.query('TRUNCATE TABLE quiz_sessions CASCADE');
    console.log('✅ Cleared quiz_sessions table');
    
    // Clear words table
    await AppDataSource.manager.query('TRUNCATE TABLE words CASCADE');
    console.log('✅ Cleared words table');
    
    console.log('🎉 Database truncation completed successfully!');
    console.log('📝 You can now import your own words via Excel');
    
  } catch (error) {
    console.error('❌ Error truncating database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

truncateDatabase();
