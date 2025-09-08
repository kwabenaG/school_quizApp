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
console.log('🔍 Using direct Supabase connection (not Pooler)');
console.log('🔍 Host: db.kdwhvsrzcgujuqswmhbt.supabase.co');
console.log('🔍 Port: 5432');
console.log('🔍 Username: postgres');
console.log('🔍 Database: postgres');
console.log('🔍 Forcing IPv4 connection to avoid IPv6 issues');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db.kdwhvsrzcgujuqswmhbt.supabase.co',
      port: 5432,
      username: 'postgres',
      password: process.env.SUPABASE_DB_PASSWORD || 'password',
      database: 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development
      logging: process.env.NODE_ENV !== 'production',
      ssl: { rejectUnauthorized: false },
      retryAttempts: 3,
      retryDelay: 3000,
      autoLoadEntities: true,
      // Force IPv4 connection
      extra: {
        family: 4, // Force IPv4
      },
    }),
    QuizModule,
    WordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
