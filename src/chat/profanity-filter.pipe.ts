/* eslint-disable prettier/prettier */
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ProfanityFilterPipe implements PipeTransform<string> {
  private readonly profanityList: string[] = ['씨발','씨발년', '개새끼','개새','개세', '십새','씹새', 'fuck', '뻑큐' ] 
  
  transform(value: string): string {
    // 감지된 욕설이 있다면 얼리기
    if (this.containsProfanity(value)) {
      throw new BadRequestException('Your message contains profanity and cannot be sent.');
    }
    
    return value;
  }
  private containsProfanity(value: string): boolean {
    const lowercasedValue = value.toLowerCase();
    return this.profanityList.some(badWord => lowercasedValue.includes(badWord));
  }

}
