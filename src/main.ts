import { NestFactory } from '@nestjs/core';
//import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import * as session from 'express-session'; //세션
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { urlencoded, json } from 'body-parser';
/*#git 명령어   🌟
 git remote remove origin (기존 원격 저장소 삭제)
 git remote -v (원격 저장소 확인)
 git remote remove origin (리모트 저장소 삭제)
 git remote init () "Reinitialized existing Git repository in C:/Users/내컴퓨터/Desktop/Nest_JS/Dev_Backend/.git/"
 git status (로컬 저장소 올리기 전 staging area의 목록 )
 git add 파일이름 vs git add .
 만약) warning: in the working copy of '.eslintrc.js', LF will be replaced by CRLF the next time Git touches it 에러의 경우
 > git config --global core.autocrlf true
 git commit -m "12.18 First Commit" (로컬 저장소에 커밋)
 git remote add origin https://github.com/ohsoomansour/chatting_frontend.git
 - "원격이 없는 경우 새로운 깃 리파지토리를 만들어서 내 로컬저장소에 원격을 지정하는데,
    이 원격(목적 url)의 이름은 origin으로 한다."

 git branch [이름] master(분기해서 나올 브랜치, 만약에 파일 복사 후 거기서 master로 브랜치를 변경해야된다면 다시 똑같이 git branch master 하면)
 git branch (브랜치가 main 또는 master에 위치하고 있는 지 확인: *master 초록색이 현재 브랜치를 가리키고 있음)
 git push origin master (origin 원격 저장소 이름을 가지고 있는 master 브랜치에 업데이트 하겠다. )
[🌟잔디가 심겨지는 경우🌟]
1. github 이메일 계정과 로컬의 이메일 정보가 같아야 함.
2. branch는 main 혹은 gh-pages 둘 중 하나여야 함.
 - In the repository's default branch
 - In the gh-pages branch (for repositories with project sites)


 Promise: ES6에서 비동기 처리를 위한 패턴으로 '프로미스'를 도입
 - 장점: 비동기 처리 시점을 명확하게 표현 할 수 있음
 - 인스턴스화 방법: 생성자 함수를 통해 인스턴스화 
   const promise = new Promise((resolve, reject) => {
    if(//"비동기 작업 수행 성공"){
      resolve('result')
    } else { // "비동기 작업 수행 실패"
      reject('failure reason')
    }
   })
  
 */

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
  //app.useWebSocketAdapter(new WsAdapter(app));  //웹소켓 어댑터
  app.useWebSocketAdapter(new IoAdapter(app)); // socket.io 어댑터
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(
    session({
      secret: 'SESSION_ID_SM', //세션아이디
      resave: false, //request 중에 세션이 수정되지 않아도 세션을 세션 저장소에 다시 저장하도록 강제
      saveUninitialized: false, //초기화되지 않는 세션을 저장하게 함
    }),
    json({ limit: '50mb' }),
    urlencoded({ limit: '50mb', extended: true }),
  );
  //app.use(JwtMiddleware);

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
