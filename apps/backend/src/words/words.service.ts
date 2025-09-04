import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word, DifficultyLevel } from '../entities/word.entity';

export interface CreateWordDto {
  word: string;
  clue: string;
  difficulty?: DifficultyLevel;
}

export interface UpdateWordDto {
  word?: string;
  clue?: string;
  difficulty?: DifficultyLevel;
  isActive?: boolean;
}

@Injectable()
export class WordsService {
  constructor(
    @InjectRepository(Word)
    private wordsRepository: Repository<Word>,
  ) {}

  async create(createWordDto: CreateWordDto): Promise<Word> {
    const word = this.wordsRepository.create(createWordDto);
    return await this.wordsRepository.save(word);
  }

  async findAll(activeOnly: boolean = true): Promise<Word[]> {
    const query = this.wordsRepository.createQueryBuilder('word');
    
    if (activeOnly) {
      query.where('word.isActive = :isActive', { isActive: true });
    }
    
    return await query.orderBy('word.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Word> {
    const word = await this.wordsRepository.findOne({ where: { id } });
    if (!word) {
      throw new NotFoundException(`Word with ID ${id} not found`);
    }
    return word;
  }

  async update(id: string, updateWordDto: UpdateWordDto): Promise<Word> {
    const word = await this.findOne(id);
    Object.assign(word, updateWordDto);
    return await this.wordsRepository.save(word);
  }

  async remove(id: string): Promise<void> {
    const word = await this.findOne(id);
    await this.wordsRepository.remove(word);
  }

  async getRandomWord(excludeIds: string[] = []): Promise<Word> {
    const query = this.wordsRepository
      .createQueryBuilder('word')
      .where('word.isActive = :isActive', { isActive: true });

    if (excludeIds.length > 0) {
      query.andWhere('word.id NOT IN (:...excludeIds)', { excludeIds });
    }

    const word = await query
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!word) {
      throw new NotFoundException('No available words found');
    }

    return word;
  }

  scrambleWord(word: string): string {
    const letters = word.split('');
    
    // Fisher-Yates shuffle algorithm
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    const scrambled = letters.join('');
    
    // If the scrambled word is the same as original, try again
    return scrambled === word ? this.scrambleWord(word) : scrambled;
  }

  async incrementUsage(id: string): Promise<void> {
    await this.wordsRepository
      .createQueryBuilder()
      .update(Word)
      .set({ timesUsed: () => 'timesUsed + 1' })
      .where('id = :id', { id })
      .execute();
  }

  async importFromCsv(csvContent: string): Promise<{ message: string; imported: number; errors: string[] }> {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    let imported = 0;

    // Skip header row if it exists
    const dataLines = lines[0].toLowerCase().includes('word') ? lines.slice(1) : lines;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length < 2) {
        errors.push(`Row ${i + 1}: Insufficient columns. Expected: word, clue, difficulty (optional)`);
        continue;
      }

      const [word, clue, difficulty] = columns;
      
      if (!word || !clue) {
        errors.push(`Row ${i + 1}: Word and clue are required`);
        continue;
      }

      try {
        // Check if word already exists
        const existingWord = await this.wordsRepository.findOne({ 
          where: { word: word.toLowerCase() } 
        });

        if (existingWord) {
          errors.push(`Row ${i + 1}: Word "${word}" already exists`);
          continue;
        }

        // Create new word
        const newWord = this.wordsRepository.create({
          word: word.toLowerCase(),
          clue: clue,
          difficulty: difficulty?.toLowerCase() as DifficultyLevel || 'medium',
          isActive: true
        });

        await this.wordsRepository.save(newWord);
        imported++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return {
      message: `Import completed. ${imported} words imported successfully.`,
      imported,
      errors
    };
  }

  async bulkDelete(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    
    const result = await this.wordsRepository
      .createQueryBuilder()
      .delete()
      .where('id IN (:...ids)', { ids })
      .execute();

    return result.affected || 0;
  }
}
