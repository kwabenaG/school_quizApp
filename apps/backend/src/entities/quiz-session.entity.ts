import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { QuizAttempt } from './quiz-attempt.entity';

export enum QuizStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('quiz_sessions')
export class QuizSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: QuizStatus,
    default: QuizStatus.PENDING,
  })
  status: QuizStatus;

  @Column({ nullable: true })
  currentWordId: string;

  @Column({ default: 0 })
  currentWordIndex: number;

  @Column('simple-array', { nullable: true })
  usedWordIds: string[];

  @Column({ default: 0 })
  totalWords: number;

  @Column({ default: 0 })
  correctAnswers: number;

  @Column({ default: 0 })
  totalAttempts: number;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @OneToMany(() => QuizAttempt, attempt => attempt.quizSession)
  attempts: QuizAttempt[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
