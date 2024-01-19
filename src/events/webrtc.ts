/* eslint-disable prettier/prettier */

import { WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


export class WebRTC {
  @WebSocketServer() server: Server
  
  join() {
    this.server.on('join', () => {
      
    })
  }
  

}