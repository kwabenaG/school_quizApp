import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WordsService, CreateWordDto, UpdateWordDto } from './words.service';
import { Word } from '../entities/word.entity';

@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post()
  async create(@Body() createWordDto: CreateWordDto): Promise<Word> {
    return await this.wordsService.create(createWordDto);
  }

  @Get()
  async findAll(@Query('activeOnly') activeOnly: string = 'true'): Promise<Word[]> {
    return await this.wordsService.findAll(activeOnly === 'true');
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Word> {
    return await this.wordsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateWordDto: UpdateWordDto): Promise<Word> {
    return await this.wordsService.update(id, updateWordDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.wordsService.remove(id);
    return { message: 'Word deleted successfully' };
  }

  @Get('random/word')
  async getRandomWord(@Query('excludeIds') excludeIds: string): Promise<{
    word: Word;
    scrambled: string;
  }> {
    const excludeIdsArray = excludeIds ? excludeIds.split(',') : [];
    const word = await this.wordsService.getRandomWord(excludeIdsArray);
    const scrambled = this.wordsService.scrambleWord(word.word);
    
    return { word, scrambled };
  }

  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File): Promise<{ message: string; imported: number; errors: string[] }> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const result = await this.wordsService.importFromCsv(file.buffer.toString());
    return result;
  }

  @Post('bulk-delete')
  async bulkDelete(@Body() body: { ids: string[] }): Promise<{ message: string; deleted: number }> {
    const deleted = await this.wordsService.bulkDelete(body.ids);
    return { message: `${deleted} words deleted successfully`, deleted };
  }
}
