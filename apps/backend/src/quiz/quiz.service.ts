import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizSession, QuizStatus } from '../entities/quiz-session.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { Word } from '../entities/word.entity';
import { WordsService } from '../words/words.service';

export interface CreateQuizSessionDto {
  name: string;
  totalWords?: number;
}

export interface SubmitAnswerDto {
  contestantName: string;
  answer: string;
  timeSpent?: number;
}

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizSession)
    private quizSessionRepository: Repository<QuizSession>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
    @InjectRepository(Word)
    private wordRepository: Repository<Word>,
    private wordsService: WordsService,
  ) {}

  async createSession(createQuizSessionDto: CreateQuizSessionDto): Promise<QuizSession> {
    const session = this.quizSessionRepository.create({
      ...createQuizSessionDto,
      totalWords: createQuizSessionDto.totalWords || 10,
      usedWordIds: [],
    });
    return await this.quizSessionRepository.save(session);
  }

  async findAllSessions(): Promise<QuizSession[]> {
    return await this.quizSessionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findSession(id: string): Promise<QuizSession> {
    const session = await this.quizSessionRepository.findOne({
      where: { id },
      relations: ['attempts', 'attempts.word'],
    });
    if (!session) {
      throw new NotFoundException(`Quiz session with ID ${id} not found`);
    }
    return session;
  }

  async startSession(id: string): Promise<QuizSession> {
    const session = await this.findSession(id);
    
    if (session.status !== QuizStatus.PENDING) {
      throw new BadRequestException('Session can only be started from PENDING status');
    }

    // Get first word
    const word = await this.wordsService.getRandomWord();
    const scrambled = this.wordsService.scrambleWord(word.word);

    session.status = QuizStatus.ACTIVE;
    session.currentWordId = word.id;
    session.currentWordIndex = 0;
    session.usedWordIds = [word.id];
    session.startedAt = new Date();

    await this.quizSessionRepository.save(session);
    await this.wordsService.incrementUsage(word.id);

    return session;
  }


  async getCurrentWordForAdmin(id: string): Promise<{
    word: Word;
    scrambled: string;
    correctWord: string;
    session: QuizSession;
  }> {
    const session = await this.findSession(id);
    
    if (session.status !== QuizStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    if (!session.currentWordId) {
      throw new BadRequestException('No current word in session');
    }

    const word = await this.wordsService.findOne(session.currentWordId);
    const scrambled = this.wordsService.scrambleWord(word.word);

    return { 
      word, 
      scrambled, 
      correctWord: word.word,
      session 
    };
  }

  async getCurrentWord(): Promise<{
    word: Word;
    scrambled: string;
    correctWord: string;
    session: QuizSession;
  } | null> {
    // Find the most recent active session
    const activeSession = await this.quizSessionRepository.findOne({
      where: { status: QuizStatus.ACTIVE },
      order: { createdAt: 'DESC' }
    });

    if (!activeSession || !activeSession.currentWordId) {
      return null;
    }

    const word = await this.wordsService.findOne(activeSession.currentWordId);
    const scrambled = this.wordsService.scrambleWord(word.word);

    return { 
      word, 
      scrambled, 
      correctWord: word.word,
      session: activeSession 
    };
  }

  async updateCurrentWord(sessionId: string, wordId: string): Promise<QuizSession> {
    const session = await this.findSession(sessionId);
    
    if (session.status !== QuizStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    // Update the current word ID
    session.currentWordId = wordId;
    return await this.quizSessionRepository.save(session);
  }

  async submitAnswer(
    sessionId: string,
    submitAnswerDto: SubmitAnswerDto,
  ): Promise<{
    isCorrect: boolean;
    correctAnswer: string;
    nextWord?: { word: Word; scrambled: string };
    sessionComplete: boolean;
  }> {
    const session = await this.findSession(sessionId);
    
    if (session.status !== QuizStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    if (!session.currentWordId) {
      throw new BadRequestException('No current word in session');
    }

    const currentWord = await this.wordsService.findOne(session.currentWordId);
    const isCorrect = submitAnswerDto.answer.toLowerCase().trim() === currentWord.word.toLowerCase().trim();

    // Save attempt
    const attempt = this.quizAttemptRepository.create({
      quizSessionId: sessionId,
      wordId: session.currentWordId,
      contestantName: submitAnswerDto.contestantName,
      answer: submitAnswerDto.answer,
      isCorrect,
      timeSpent: submitAnswerDto.timeSpent,
    });
    await this.quizAttemptRepository.save(attempt);

    // Update session stats
    session.totalAttempts++;
    if (isCorrect) {
      session.correctAnswers++;
    }

    let nextWord = null;
    let sessionComplete = false;

    if (isCorrect || session.currentWordIndex >= session.totalWords - 1) {
      // Move to next word or end session
      if (session.currentWordIndex >= session.totalWords - 1) {
        // End session
        session.status = QuizStatus.COMPLETED;
        session.endedAt = new Date();
        sessionComplete = true;
      } else {
        // Get next word
        const nextWordEntity = await this.wordsService.getRandomWord(session.usedWordIds);
        const nextScrambled = this.wordsService.scrambleWord(nextWordEntity.word);
        
        session.currentWordId = nextWordEntity.id;
        session.currentWordIndex++;
        session.usedWordIds.push(nextWordEntity.id);
        
        await this.wordsService.incrementUsage(nextWordEntity.id);
        
        nextWord = { word: nextWordEntity, scrambled: nextScrambled };
      }
    }

    await this.quizSessionRepository.save(session);

    return {
      isCorrect,
      correctAnswer: currentWord.word,
      nextWord,
      sessionComplete,
    };
  }

  async endSession(id: string): Promise<QuizSession> {
    const session = await this.findSession(id);
    
    if (session.status === QuizStatus.COMPLETED) {
      throw new BadRequestException('Session is already completed');
    }

    session.status = QuizStatus.COMPLETED;
    session.endedAt = new Date();
    
    return await this.quizSessionRepository.save(session);
  }

  async getSessionStats(id: string): Promise<{
    session: QuizSession;
    accuracy: number;
    averageTime: number;
  }> {
    const session = await this.findSession(id);
    
    const accuracy = session.totalAttempts > 0 
      ? (session.correctAnswers / session.totalAttempts) * 100 
      : 0;

    const attempts = await this.quizAttemptRepository.find({
      where: { quizSessionId: id },
      select: ['timeSpent'],
    });

    const totalTime = attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);
    const averageTime = attempts.length > 0 ? totalTime / attempts.length : 0;

    return {
      session,
      accuracy: Math.round(accuracy * 100) / 100,
      averageTime: Math.round(averageTime * 100) / 100,
    };
  }
}
