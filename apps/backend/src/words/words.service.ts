import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Word, DifficultyLevel } from '../entities/word.entity';
import * as XLSX from 'xlsx';

export interface CreateWordDto {
  word: string;
  clues: string[];
  difficulty?: DifficultyLevel;
}

export interface UpdateWordDto {
  word?: string;
  clues?: string[];
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
      
      if (columns.length < 1) {
        errors.push(`Row ${i + 1}: Insufficient columns. Expected: word, clues (semicolon-separated), difficulty (optional)`);
        continue;
      }

      const [word, clueString, difficulty] = columns;
      
      if (!word) {
        errors.push(`Row ${i + 1}: Word is required`);
        continue;
      }

      if (!clueString) {
        errors.push(`Row ${i + 1}: Clues are required`);
        continue;
      }

      // Parse clues separated by semicolons
      const clues = clueString.split(';').map(clue => clue.trim()).filter(clue => clue.length > 0);
      
      if (clues.length === 0) {
        errors.push(`Row ${i + 1}: At least one clue is required`);
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
          clues: clues,
          difficulty: difficulty?.toLowerCase() as DifficultyLevel || DifficultyLevel.MEDIUM,
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

  async importFromExcel(fileBuffer: Buffer): Promise<{ message: string; imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length < 2) {
        errors.push('Excel file must have at least a header row and one data row');
        return { message: 'Import failed', imported: 0, errors };
      }

      // Skip header row
      const dataRows = data.slice(1) as any[][];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (!row || row.length === 0) continue;

        const [word, clueString, difficulty] = row.map(cell => 
          cell ? String(cell).trim() : ''
        );
        
        if (!word) {
          errors.push(`Row ${i + 2}: Word is required`);
          continue;
        }

        if (!clueString) {
          errors.push(`Row ${i + 2}: Clues are required`);
          continue;
        }

        // Parse clues separated by semicolons
        const clues = clueString.split(';').map(clue => clue.trim()).filter(clue => clue.length > 0);
        
        if (clues.length === 0) {
          errors.push(`Row ${i + 2}: At least one clue is required`);
          continue;
        }

        try {
          // Check if word already exists
          const existingWord = await this.wordsRepository.findOne({ 
            where: { word: word.toLowerCase() } 
          });

          if (existingWord) {
            errors.push(`Row ${i + 2}: Word "${word}" already exists`);
            continue;
          }

          // Create new word
          const newWord = this.wordsRepository.create({
            word: word.toLowerCase(),
            clues: clues,
            difficulty: difficulty?.toLowerCase() as DifficultyLevel || DifficultyLevel.MEDIUM,
            isActive: true
          });

          await this.wordsRepository.save(newWord);
          imported++;
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      return {
        message: `Excel import completed. ${imported} words imported successfully.`,
        imported,
        errors
      };
    } catch (error) {
      errors.push(`Failed to parse Excel file: ${error.message}`);
      return {
        message: 'Excel import failed',
        imported: 0,
        errors
      };
    }
  }

  async truncateDatabase(): Promise<{ message: string }> {
    try {
      // Clear all data in correct order (respecting foreign key constraints)
      await this.wordsRepository.manager.query('TRUNCATE TABLE quiz_attempts CASCADE');
      await this.wordsRepository.manager.query('TRUNCATE TABLE quiz_sessions CASCADE');
      await this.wordsRepository.manager.query('TRUNCATE TABLE words CASCADE');
      
      return {
        message: 'Database truncated successfully. All words and related data have been cleared.'
      };
    } catch (error) {
      throw new Error(`Failed to truncate database: ${error.message}`);
    }
  }
}
