import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { QuizService, CreateQuizSessionDto, SubmitAnswerDto } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

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
  async getCurrentWord(@Param('id') id: string) {
    return await this.quizService.getCurrentWord(id);
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
