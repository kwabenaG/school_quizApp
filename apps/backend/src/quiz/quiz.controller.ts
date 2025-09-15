import { Controller, Get, Post, Put, Body, Param, BadRequestException } from '@nestjs/common';
import { QuizService, CreateQuizSessionDto, SubmitAnswerDto } from './quiz.service';
import { WordsService } from '../words/words.service';
import { QuizStatus } from '../entities/quiz-session.entity';

@Controller('quiz')
export class QuizController {
  constructor(
    private readonly quizService: QuizService,
    private readonly wordsService: WordsService
  ) {}

  @Post('sessions')
  async createSession(@Body() createQuizSessionDto: CreateQuizSessionDto) {
    return await this.quizService.createSession(createQuizSessionDto);
  }

  @Get('sessions')
  async findAllSessions() {
    return await this.quizService.findAllSessions();
  }

  @Get('sessions/:id')
  async findSession(@Param('id') id: string) {
    return await this.quizService.findSession(id);
  }

  @Post('sessions/:id/start')
  async startSession(@Param('id') id: string) {
    return await this.quizService.startSession(id);
  }

  @Get('sessions/:id/current-word')
  async getCurrentWordForSession(@Param('id') id: string) {
    const session = await this.quizService.findSession(id);
    
    if (session.status !== QuizStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    if (!session.currentWordId) {
      throw new BadRequestException('No current word in session');
    }

    const word = await this.wordsService.findOne(session.currentWordId);
    const scrambled = this.wordsService.scrambleWord(word.word);

    return { word, scrambled, session };
  }

  @Get('sessions/:id/current-word/admin')
  async getCurrentWordForAdmin(@Param('id') id: string) {
    return await this.quizService.getCurrentWordForAdmin(id);
  }

  @Get('current-word')
  async getCurrentWord() {
    const result = await this.quizService.getCurrentWord();
    if (!result) {
      return { message: 'No active quiz session found' };
    }
    return result;
  }

  @Put('sessions/:id/current-word')
  async updateCurrentWord(@Param('id') id: string, @Body() body: { wordId: string }) {
    return await this.quizService.updateCurrentWord(id, body.wordId);
  }

  @Post('sessions/:id/submit-answer')
  async submitAnswer(
    @Param('id') sessionId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return await this.quizService.submitAnswer(sessionId, submitAnswerDto);
  }

  @Put('sessions/:id/end')
  async endSession(@Param('id') id: string) {
    return await this.quizService.endSession(id);
  }

  @Get('sessions/:id/stats')
  async getSessionStats(@Param('id') id: string) {
    return await this.quizService.getSessionStats(id);
  }
}
