import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizModule } from './quiz/quiz.module';
import { WordsModule } from './words/words.module';

// Debug logging
console.log('🔍 Environment variables:');
console.log('SUPABASE_DB_PASSWORD:', process.env.SUPABASE_DB_PASSWORD ? 'SET' : 'NOT SET');
console.log('SUPABASE_DB_URL:', process.env.SUPABASE_DB_URL ? 'SET' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 Using Supabase Pooler URL for connection');
if (process.env.SUPABASE_DB_URL) {
  console.log('🔍 Pooler URL:', process.env.SUPABASE_DB_URL.replace(/:[^:@]+@/, ':***@'));
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.SUPABASE_DB_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development
      logging: process.env.NODE_ENV !== 'production',
      ssl: { rejectUnauthorized: false },
      retryAttempts: 3,
      retryDelay: 3000,
      autoLoadEntities: true,
    }),
    QuizModule,
    WordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
