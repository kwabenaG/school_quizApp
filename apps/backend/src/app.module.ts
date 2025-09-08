import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizModule } from './quiz/quiz.module';
import { WordsModule } from './words/words.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: (() => {
        // Debug logging
        console.log('🔍 Environment variables:');
        console.log('SUPABASE_DB_URL:', process.env.SUPABASE_DB_URL ? 'SET' : 'NOT SET');
        console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
        console.log('NODE_ENV:', process.env.NODE_ENV);
        
        const supabaseUrl = process.env.SUPABASE_DB_URL;
        if (supabaseUrl) {
          console.log('🔍 Using SUPABASE_DB_URL');
          console.log('🔍 URL value:', supabaseUrl.substring(0, 50) + '...'); // Show first 50 chars
          return supabaseUrl;
        }
        
        if (process.env.SUPABASE_URL) {
          console.log('🔍 Using SUPABASE_URL fallback');
          return `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_URL.replace('https://', '').replace('http://', '')}:5432/postgres`;
        }
        
        console.log('🔍 Using local database fallback');
        return `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'school_quiz'}`;
      })(),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development
      logging: process.env.NODE_ENV !== 'production',
      ssl: (process.env.SUPABASE_DB_URL || process.env.SUPABASE_URL) ? { rejectUnauthorized: false } : false,
    }),
    QuizModule,
    WordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
