import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ProfanityFilterPipe } from './profanity-filter.pipe';
import { ChatValidation } from './validation/chatUser.validation';

@Module({
  providers: [ChatService, ProfanityFilterPipe, ChatValidation],
})
export class ChatModule {}
