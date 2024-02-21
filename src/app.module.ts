/* eslint-disable prettier/prettier */
/*
  Controllers and Providers are scoped by the module
  > 컨트롤러 및 공급자의 범위는 모듈에 따라 결정됩니다.
  @Moddule: "클래스 위의 함수이고 클래스를 위해 움직인다고 생각"
  1. main, service, module, controller만 남아있다.  
  2. 커맨드 - npm run start:dev "Nest application successfully started">  localhost:3000  
  3. 아래의 bootstrap 함수 해석
    3.1) booststrap 함수는 기본적으로 async로 선언되어 만들어진다 
    3.2) 🔹AppModule이라는 인수를 받아서 Nest 어플리케이션 🔹인스턴스를 생성
      - Object.create메서드를 호출하여 '새로운 객체'를 만들 수 있음  
      - app의 prototype는 AppModule이고 
    3.3)Node.js ※https://iamdaeyun.tistory.com/entry/Nodejs%EB%A1%9C-%EA%B0%84%EB%8B%A8%ED%95%9C-%EC%9B%B9-%EC%84%9C%EB%B2%84-%EB%A7%8C%EB%93%A4%EA%B8%B0
        > listen(port, [hostname], [backlog] [callback])
         예시) const http = require('http') "http 모듈을 불러옴"
               const server = http.createServer(); "웹 서버 객체를 만들고"
               const port = 3000
               const host = '192.168.05'
               server.listen(port, host, '50000', () => {
                console.log('Running : %d', host, post )
               })  
        > listen메서드를 사용하여 '3000번 포트'를 사용하여 웹서비스를 구동 
        > 성공적으로 구동하면 listen메서드가 Promise를 반환하기 때문에 await를 사용한 것  
        > 
    4. 모듈은 '앱'처럼 쓸 수 있다. 예를들어 instagram에서 photo 모듈, video 모듈 
*/
/* #️⃣3.0 TypeORM and PostgreSQL
  1. 🛸TypeScript & NesJS에서 DataBase와 통신하기 위해서 > ⭐ORM 사용
  2. typeorm.io/#/ > TYPE ORM을 쓰면 타입스크립트의 좋은 점을 모두 이용
  3. TypeORM: Object Relational Mapping 객체 관계 매핑 
   > SQL문을 쓰는 대신에 코드를 써서 상호작용을 할 수 있다
   > 타입스크립트 코드 > TYPE ORM <--🛸--> DB와 상호작용 

  4.PostgreSQL setUp: 홈피는 여기 https://www.postgresql.org/ 
  📄 4-1)설치
   > C:\Program Files\PostgreSQL\11 > pw:2848 > port:3000 
   > postgresql-12.12-1-windows-x64.exe --install_runtimes 0
   > 원래는 여기 https://www.postgresql.org/download/ 그러나! 에러 발생 시 아래의 방법으로 다운로드 
   >⭐PostgreSQL 11.2 설치방법 https://source-factory.tistory.com/22
   >⭐PostgreSQL 11.2  https://get.enterprisedb.com/postgresql/postgresql-11.2-1-windows-x64.exe
    ⭐https://www.pgadmin.org/download/에서 pgAdmin 또는 postico(Mac OS)를 설치: "DB의 UI로 쉽게 사용" 
   > 설치경로: C:\Program Files\PostgreSQL\11\data
   > port:5432 (default)

  📄 4-2)서버에 연결 방법 : *2023.12.20 기록  
   > pgAdmin 열기 >  > [Add New server] 또는 상위 Object 탭 > create > server
      - [General 탭] : 
      - ⭐[connection]탭 > hostname: localhost > port:5432 > Maintenanace database: postgres
      - Username: postgres(default)  
      - password: 284823 
   > Database우클릭, Create > Database: 🔹nuber-eats > Owner: ohsoomansour  "여기서 사용자를 변경 할 수있다. "
   > ⭐SQL: Create DATABASE "nuber-eats", OWNER = ohsoomansour  
   > 실행된다는 것만 알고 넘어감
    
    db : test -> NestJS_BackendDev / Owner: postgresql -> ohsoomansour로 변경함  /23.12.20 수정

  5. TypeORM setUp : npm을 참조
   - 의미: TypeScript로 작성된 관계형 매퍼 
   > NestJS 공홈: docs.nestjs.com/techniques/database
   > npm > https://www.npmjs.com/package/typeorm
   > npm install typeorm --save (install the npm package.)
   > ⭐npm install reflect-metadata --save
   > npm install @types/node --save-dev
   > npm install pg --save  (install a database driver)
   > ⭐npm install --save @nestjs/typeorm typeorm pg (*DOCS 기준 이것만 mysql -> pg로 변경해서 설치 필요)
   > npm install typeorm --save
   > Install a database driver: npm install pg --save */

/*#️⃣26.0 Heroku Setup
<git 처리 과정> - ※https://jforj.tistory.com/119
  1.> Working Directory: 개발자의 현재시점으로 소스코드를 수정하며 개발하는 공간을 의미
    > Staging Area: Working Directory에서 작업한 파일을 Local Repository에 전달하기 위해 파일들을 분류하는 공간
    > Local Repository: 로컬 저장소이며 작업한 파일들을 저장해두는 내부 저장소(.git 폴더)
    > Remote Repository: 원격 저장소이며 인터넷으로 연결되어 있어 있는 외부 저장소
    *Branch: Remote Repository의 현재 상태를 복사하며 master 브랜치와 별개의 작업을 진행할 수 있는 공간
             보통 브랜치를 생성하여 개발을 진행하고 개발을 완료하면 master 브랜치에 병합하여 개발 완료된 소스코드를 합침
    *Head: 현재 작업중인 브랜치의 최근 커밋된 위치
    *index: Staging Area를 의미           

  git init
  git add README.md  
    - git add: 어떤 파일을 깃에 올릴지 함 보쟈, git add . 프로젝트 모든 파일을 추가 하겠다  
    - 🔧🚀"수정된 소스코드들을 > Staging Area로 전달"🚀
    - git add index.html (index.html만 올리겠다)
  git status : 📜📄내가 올릴려고 하는 파일들 나열📃  
    -  WorkingDirectory에서 📂수정이 발생된 파일들📂을 확인
  git commit -m "first commit" 
    - 최종본이라고 볼 수있음
    - (add된 모든 소코드들을)🚀Staging Area > Local Repositiory로 이동🚀   
  git branch -M main
    - main branch는 '배포 가능한 상태'만 관리 
    - 생성되어 있는 브랜치를 확인
  git remote add origin https://github.com/ohsoomansour/eats-backend.git(리포리토리주소) 
   - origin은 git이 가져온 '원격 저장소'를 가리킴
     > 🚀 원격 저장소를 연결 🪐🌍
  git remote -v
   -  내가 설정해둔 원격저장소 이름과 URL을 확인 할 수 있음 
  git push -u origin main : "master - > master 성공" 
   - orgin:원격저장소 별칭 d
   - master: 현재브랜치 이름 
   - 🚀'로컬 저장소'에서 파일을 업로드하면서🚀 병합시키는 명령어가 push🚩 

  
  ★수정발생: 
    git add . (전체하는게 편함 )
    git commit -m "second commit" 
    git remote -v : 내가 설정해둔 원격저장소 이름과 URL을 확인 할 수 있음 
    git remote add origin https://github.com/ohsoomansour/CodeChallenge5_revised1.git > error: remote origin already exists.
    > git remote rm origin: "🚧연결이 잘못되었으면 연결을 해제함🚧"
    git push -u origin main
    > 수정커밋하고 나서 재배포 해야함 npm run deploy
    > 변한 게 없다 싶으면 Ctrl + Shift + R로 캐쉬를 무시하는 '새로고침'을 하면 됩니다.
    ❗if) "first commit" 최종본을 해버린 상태면 local repository로 보내버린 상태, 즉 1차 준비 끝이라는 뜻임
        따라서 'push'로 보내버리고  수정 "second commit"으로 처리하면 됨  

  ★gh-pages
  ⓵npm install gh-pages --save-dev
  ⓶"scripts": {"deploy": "gh-pages -d build", "predeploy": "npm run build" }
    "homepage": "https://ohsoomansour.github.io/CodeChallenge1/" 
  ⓷npm run build > npm run deploy (published 성공!)
  🚨에러 발생 대처🚨
  1.warning: LF will be replaced by CRLF in src/App.tsx.
  The file will have its original line endings in your working directory
  ocrlf true
  *LF:줄을 바꾸려는 동작 
  *CRLF:줄 바꿈
  > 💊해결 한 방: git config --global core.autocrlf true

  🔥github.com/search?q=user%3Asoo-sin   



  1. 📄Heroku Home:https://dashboard.heroku.com/new-app id:osoomansour@naver.com /pw: dhtnaksen@34
      >  npm install -g heroku
  2. 📄The Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli
     > npx heroku --version > ⚡heroku/8.9.0 win32-x64 node-v18.12.1
                                (heroku/7.66.4 win32-x64 node-v17.6.0)
     > npx heroku login
     🚨Create new Git repository
     > git init
     > npx heroku git:remote -a trade
     재시작
     > npx heroku restart
     > npx heroku login
     > npx heroku logs --tail 
  3. 커밋  
    git add .
    > 💊해결 한 방: git config --global core.autocrlf true
    git commit -am "make it better"
    git push heroku main(master)
          
  🔹Git Bash: window의 cmd, linux와 mac의 terminal과 같은 역할   
*/

   
import { MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './member/entites/member.entity';
import { MemberModule } from './member/member.module';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { ChatModule } from './chat/chat.module';
import { APP_PIPE } from '@nestjs/core';
//import { GraphQLModule } from '@nestjs/graphql';
//import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as Joi from 'joi';
import { JwtModule } from './jwt/jwt.module';
import { ConfigModule } from '@nestjs/config';
import { JwtMiddleware } from './jwt/jwt.middleware';
//import { JwtModule } from '@nestjs/jwt';
import { UploadModule } from './upload/upload.module';
import { Verification } from './member/entites/verification.entity';
import { Deal } from './deals/entitles/deal.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { DealModule } from './deals/deal.module';
import { Robot } from './deals/entitles/robot.entity';
import { DownloadModule } from './download/download.module';
import { OrderModule } from './orders/order.module';
import { Store } from './orders/entities/store.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      //joi는 변수의 schema, type 등을 런타임에서 체킹하도록 도와주는 패키지이
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
        .valid('dev','production', 'test' )
        .required(),
        DB_HOST:Joi.string(), //heroku는 url외  더 이상 찾을 수 없어 required 삭제 (local에서만 사용)  
        DB_PORT:Joi.string(), 
        DB_PASSWORD:Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_NAME: Joi.string(),
        JWT_SECRET: Joi.string().required(),
        AWS_ACCESS_KEY: Joi.string().required(),
        AWS_ACCESS_SECRET_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL}
        : { 
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,         //postgresql은 비번을 묻지 않음
            database: process.env.DB_NAME,
          }),
      synchronize: true,
      logging: true,
      entities: [Member, Verification, Deal, Order, OrderItem, Robot, Store], //[join(__dirname, '/**/*.entity.ts')]
    }),
    MemberModule,
    AdminModule,
    EventsModule,
    ChatModule,
    JwtModule.forRoot({
      privateKey: process.env.JWT_SECRET,
    }),
    UploadModule,
    DownloadModule,
    OrderModule,
    DealModule
    /*#JwtModule등록 방법2.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION_TIME')}s`,
        },
      }),
    }),
    */
    /*#GraphqlModule으로 ws과 context 사용법
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      //🚨주의사항1:playground에서 graphql-ws를 지원하지 않음 따라서 subscription이 안됨
      
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: Context<any>) => {
            //🚨주의사항2: 위 'subscriptions-transport-ws'를 참고하여 해석 할 것❗
            const { connectionParams, extra } = context;
            //console.log(context)
            extra.token = connectionParams['x-jwt'];
          },
        },
      },
      context: ({ req, extra }) => {
        console.log(req); //현재 로그인된 '고객'의 x-jwt가 들어옴
        if (extra) {
          return { token: extra.token };
        } else {
          return { token: req.headers['x-jwt'] };  //jwt 
        }
      },
      introspection: true,
      playground: true,
    }),*/
    
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
      /*
      useValue: new ValidationPipe({
        disableErrorMessages: true,
      }),*/
    },

  ], //기본적으로 제공되는 ValidationPipe
})

/* NestJS는 "Express와 같은 원리" 
  #MiddlewareConsumer  
   @param {...(Type | Function)} middleware middleware class/function or array of classes/functions


   export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '*',  
      method: RequestMethod.ALL,
    });
  }
}
   

*/
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(
    {path: '*', method: RequestMethod.ALL });
    //이를 통해 WebSocket 연결의 HTTP 핸드셰이크 요청을 허용할 수 있습니다.
  }
}
