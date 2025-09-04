import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizSession } from '../entities/quiz-session.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { Word } from '../entities/word.entity';
import { WordsService } from '../words/words.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuizSession, QuizAttempt, Word])],
  controllers: [QuizController],
  providers: [QuizService, WordsService],
  exports: [QuizService],
})
export class QuizModule {}
