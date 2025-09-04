import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🎓 School Quiz Backend is running!';
  }
}
