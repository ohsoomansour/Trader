import { Module } from '@nestjs/common';
import { EventGateway } from './events.gateways';
import { ChatService } from 'src/chat/chat.service';
import { ChatValidation } from 'src/chat/validation/chatUser.validation';

@Module({
  providers: [EventGateway, ChatService, ChatValidation],
})
export class EventsModule {}
