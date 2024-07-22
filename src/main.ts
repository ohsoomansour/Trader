import { NestFactory } from '@nestjs/core';
//import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import * as session from 'express-session'; //세션
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { urlencoded, json } from 'body-parser';
//import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); //반환: NestApplication instance
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true, // 프로덕트 단계에서 세부 에러 비활성
    }),
  );
  //const redisIoAdapter = new RedisIoAdapter(app);
  //await redisIoAdapter.connectToRedis();
  //app.useWebSocketAdapter(redisIoAdapter); //redis 소켓
  //app.useWebSocketAdapter(new WsAdapter(app)); //웹소켓 어댑터
  app.useWebSocketAdapter(new IoAdapter(app)); // socket.io 어댑터

  app.enableCors();
  //methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //credentials: true, // 인증 정보 전달 허용

  app.use(
    session({
      secret: 'SESSION_ID_SM', //세션아이디
      resave: false, //request 중에 세션이 수정되지 않아도 세션을 세션 저장소에 다시 저장하도록 강제
      saveUninitialized: false, //초기화되지 않는 세션을 저장하게 함
      name: 'session-cookie',
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        maxAge: 5300000,
        secure: true,
      },
    }),
    json({ limit: '50mb' }),
    urlencoded({ limit: '50mb', extended: true }),
    (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
      next();
    },
  );
  //app.use(JwtMiddleware);

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
