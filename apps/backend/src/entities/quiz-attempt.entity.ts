import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuizSession } from './quiz-session.entity';
import { Word } from './word.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quizSessionId: string;

  @Column()
  wordId: string;

  @Column()
  contestantName: string;

  @Column()
  answer: string;

  @Column()
  isCorrect: boolean;

  @Column({ default: 1 })
  attemptNumber: number;

  @Column({ nullable: true })
  timeSpent: number; // in seconds

  @ManyToOne(() => QuizSession, session => session.attempts)
  @JoinColumn({ name: 'quizSessionId' })
  quizSession: QuizSession;

  @ManyToOne(() => Word)
  @JoinColumn({ name: 'wordId' })
  word: Word;

  @CreateDateColumn()
  createdAt: Date;
}
