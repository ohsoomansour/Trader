/* eslint-disable prettier/prettier */
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
/* #redis-websocekt과 redis 
  레디스와 통신하기 위해 사용하는 Adapter 는 Socket.IO 공식 레포에 있는 socket.io-redis-adpater 를 사용했습니다.
  - 이해: https://socket.io/docs/v4/redis-adapter/ 
  - 설치: npm i --save redis socket.io @socket.io/redis-adapter
   > 🚨에러:  변수를 참조하는 데 스플랫(splat) 연산자 '@'를 사용할 수 없습니다
   > 해결: npm i --save redis socket.io "@socket.io/redis-adapter" 
   
*/
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://localhost:6379` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
