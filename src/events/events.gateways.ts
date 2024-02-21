/* eslint-disable prettier/prettier */

//import { Server, WebSocket } from 'ws'; VS import { Server, Socket } from 'socket.io';
/* #1.NestJS에서 웹 소켓 서버에 설정 
1. 설치 및 설정 
 [ Gateways ]
 npm i --save @nestjs/websockets @nestjs/platform-socket.io (*nestjs 공식 문서)
 [ Adapters ]
 npm i -s @nestjs/websockets @nestjs/platform-ws
 
2. [main.ts ]에서 'adapter' 추가 필요
 async function bootstrap() {
  const app = await NestFactory.create(AppModule); 
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(3000);
}
bootstrap();

 ########################## 웹소켓 설정 문제 ###############
 샘플 git 참조: https://github.com/nestjs/nest/tree/master/sample/16-gateways-ws/src/events
 1.해결 방법: npm i ws or npm install @types/ws
 [package.json 파일]
   "dependencies": {
    "@nestjs/common": "10.2.10",
    "@nestjs/core": "10.2.10",
    "@nestjs/platform-express": "10.2.10", 
    "@nestjs/platform-ws": "10.2.10", ✅
    "@nestjs/websockets": "10.2.10", ✅
    "class-transformer": "0.5.1",
    "class-validator": "0.14.0",
    "rimraf": "5.0.5",
    "reflect-metadata": "0.1.13",
    "rxjs": "7.8.1",
    "ws": "8.13.0" ✅
  }, 
 
 Q. 웹소켓 각 namespace 어떻게 사용할 것인가 ?
 A. ws library does not support namespaces (communication channels popularised by socket.io).
   However, to somehow mimic this feature, you can mount multiple ws servers on different paths
    (example: @WebSocketGateway({ path: '/users' })).

 🚫지원하지 않는 아래의 예시
  @WebSocketGateway(8080, {
  namespace: 'chat',
  cors: { origin: '*' },
  })
 
 ✅ 현재 기준은 @WebSocketGateway(8080, {path: '/chat'}) 이렇게 써야된다. 
   

 # @SubscribeMessage(키값) 사용법 
   1. 'events' 정의한 키값이 존재한 메시지가 도착하면
      [클라이언트 예시]
      wsProp.current?.send(JSON.stringify({
      "event": "events",
      "data": "12.26 14:03 First Message will arrive at Dev_BackEnd server"
      }))

      [서버]
      @SubscribeMessage('events')
      event키 값은 events라고 인식하고 @MessageBody() data를 수신 
  */
 /*
 #2Lifecycle hooks 활용
 #3채팅 서버 설계 ( 여기에 시간 투자 )
 1. redis활용을 통한  https://velog.io/@1yongs_/Redis-Clustering-NestJS-Chat-App
    - https://github.com/dlfdyd96/nestjs-redis-socketio
    - 설명: 서버2개, 각 서버에서 채팅을 하는 것을 구현 따라서 웹소켓의 정의를 제대로 구현
   Redis를 쓰는 이유? 
    "Key, value 구조의 비정형 데이터를 저장하고 관리하기 위한 오픈 소스 기반의 비관계형 DBMS"
    >  1개의 서버 이상을 사용 할 때 유용 
    >  메모리 기반 데이터 구조의 빠른 응답성을 확보함과 동시에 데이터 불일치 문제를 해결
    > ⭐캐시 서버로 이용할 수 있는 것이 바로 Redis 
       캐시서버란? "데이터를 가까운 곳에 데이터를 임시 저장" (java, HashMap 원리)
   [redis DB 설치 및 설정] 
    > 레디스의 GUI 툴: set d test  "key가 d, value가 test의 값을 생성"
   
  
   [redis와 typeORM과 캐싱 설정]
   방법1. TypeOrm 
   TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '284823', //postgresql은 비번을 묻지 않음
      database: 'NestJS_BackendDev',
      synchronize: true,
      logging: true,
      entities: [Member, Admin],
      cache: {
          type: "redis",
          options: {
              host: "localhost",
              port: 6379
          }
      }
    }),
    
    
    방법2. CacheModule 사용
    *참고: https://show400035.tistory.com/188#google_vignette
    > import { Module, CacheModule } from '@nestjs/common';
    > 
    > class-validator 설치: npm i --save class-validator class-transformer
    > 컨틀로러 > 서비스 > redis
     constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
     const value = await this.cacheManager.get(key);
  */ 
 /*
  * #WebRTC 구현: 
     https://acstory.tistory.com/534#google_vignette 참조
     socket.io - DOCS 참조: https://socket.io/docs/v4/server-api/ 
     room 참가 방식 참조: https://surprisecomputer.tistory.com/9
     + nestjs chatRoom.service.ts : https://blog.ewq.kr/41 참조

  아래의 3가지 경우 참조: https://velog.io/@fejigu/Socket.IO-client 
  1. socket.io WebSocket과 함께 작동하는 library:  브로드캐스팅을 지원
   ✅ 웹 소켓은 socket.io에서 사용하는 to 기능, room기능이 없음  
      > "즉 room을 만들어서 써야되고 그리고 프론트 socket-io-client에서 보낸 socket을 웹소켓 안에서 사용 가능"
        프론트엔드 socket -> BE 웹소켓 연동이 가능하다!
  
   [Public ] : "연결된 모든 클라이언트에게 보냄, 채팅 메시지가 적절"
   <서버 측>
  io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);  // ✅연결된 모든 클라이언트에게 메시지 통신(브로드 캐스트)
  
    });
  });
  <클라이언트 측> 
  socket.on('chat message', (msg) => {
    console.log(`Received message: ${msg}`);
  });

  [Private] : "특정 고객에게 메시지를 보냄, 예를들어 알림"
   <서버 측>
  io.on('connection', (socket) => {
    socket.on('send notification', (msg, ✅recipientId) => {
      io.to(recipientId).emit('notification', msg);  // ✅지정된 수신자에게 메시지 보내기
  
    });
  });
  <클라이언트 측> 
  socket.on('notification', (msg) => {
    console.log(`Received notification: ${msg}`);
  });
  [Broadcasting] : 발신자를 제외한 모든 클라이언트에게 메세지가 전송되는 경우

  #room이란? "여러 소켓들이 참여(join)하고 떠날 수 있는(leave) 채널"
   - socket이 connect 될 때 기본적으로 해당 소켓 id이름의 room에 기본적으로 들어가있다.
*/
import { Body, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';
import { ChatUserDto } from 'src/chat/dtos/chat-user.dto';
import { ProfanityFilterPipe } from 'src/chat/profanity-filter.pipe';
import { ChatValidation } from 'src/chat/validation/chatUser.validation';
import { Server} from 'ws';
//💊해결 한 방: git config --global core.autocrlf true
//parseInt(process.env.PORT) ||
@WebSocketGateway(8080, {
  /*
  cors:{
    origin:"https://main--darling-kulfi-cecca8.netlify.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["authorization", "Authorization"],
    credentials: true,
  },*/
  cors:true,
  path: '/chat',
  transports:['websocket', 'polling'],
  
})
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService : ChatService,
    private readonly chatValidation : ChatValidation
  ) {
    this.logger.log('constructor');
  }
  
  private logger = new Logger('webrtc');
  private conferenceRoomToSockets: { [roomId: string]: Socket[] } = {}; //enum 타입
  private chattingRoomToSockets: { [roomId: string]: Socket[] } = {};
  private roomUsers : { [roomId: string]: string[] } = {};
  private connectedClients: Map<string, { userName: string, room: string }> = new Map();
  private count:number;
  

  @WebSocketServer() 
  server: Server;
  
  /* @Function : gateway가 실행될 때 가장 먼저 실행되는 함수*/
  afterInit() {
    this.logger.log('init');
  }
  /* @Function : 소켓이 연결이 되면 호출되는 함수*/
  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`A socket is connectd with the id: ${client.id}`);   
  }
  /* @Function : 소켓이 연결이 끊어지면 호출되는 함수*/
  handleDisconnect(client: Socket) {
    this.logger.log(`A socket with id:${client.id} is disconnected From the server.  `)
    this.connectedClients.delete(client.id);
  } 

  @SubscribeMessage('join')
  handleEmit(@MessageBody() roomId: any, @ConnectedSocket() client: Socket) {
    this.logger.log('we are receiving a join event');
      //# 방에 대한 소켓 매핑 초기화
      if (!this.conferenceRoomToSockets[roomId]) {
        this.conferenceRoomToSockets[roomId] = [];
      }

      try {
        const numberOfClients = this.conferenceRoomToSockets[roomId].length; 
        if(numberOfClients === 0) { // []
          this.logger.log(`Creating room ${roomId} and emitting room_created socket event`);
        //#Explain: "room1" : [소켓1, 소켓2 ... ] 이렇게 room1에 있는 소켓들에게 room_created 이벤트를 발생  
          this.conferenceRoomToSockets[roomId].push(client);
          if (this.conferenceRoomToSockets[roomId]) {
            this.conferenceRoomToSockets[roomId].forEach((s) => {
              s.emit('room_created', roomId);
            });
          }
          //시그널링 서버, 다른 peer에게 데이터를 전송한다. 
        } else if (numberOfClients >= 1 ){
          this.logger.log(`Joining room ${roomId} and emitting room_joined socket event`);
          this.conferenceRoomToSockets[roomId].push(client);
          if (this.conferenceRoomToSockets[roomId]) {
            this.conferenceRoomToSockets[roomId].forEach((s) => {
              s.emit('room_joined', roomId);
            });
          }
          
        } else if ( numberOfClients > 5 ){ 
          this.logger.log(`Cant't join room ${roomId}, emitting full_room socket event`)
          if (this.conferenceRoomToSockets[roomId]) {
            this.conferenceRoomToSockets[roomId].forEach((s) => {
              s.emit('full_room', roomId);
            });
          }
          return new Error('The room was full of Sockets')
        }
      } catch (e) {
        this.logger.error(`The room was full of Sockets`);
        this.logger.debug(`이 방의 정원은 5입니다. 다른 roomId에 참가 해주세요.`);
        console.error(e)
      }
      
  } 
  /*
   * @Author : OSOOMAN
   * @Date : 24.1.5
   * @Function : 채팅 방에 참가한 사용자들의 메세지를 Subscribe 
   * @Parm : 연결된 소켓, ChatUsertDto(DTO)
   * @Return : -
   * @Explain : 방에 참여한 유저들의 유효성 확인, 그 다음 방에 아이디에 따라 사용자의 이름을 배정 후 참가자들의 리스트를 채팅방에 알림  
      - UI에서 사용법: 첫 번째, roomId를 제출하고 두 번째는 닉네임을 적고 참가 버튼을 누른다.  
      
   */
  //private roomUsers : { [roomId: string]: string[] } = {};  "예시로 room1: osm님, 전지현님 ... "
  //private streamingroomToSockets: { [roomId: string]: Socket[] } = {}; "예시로 room1: 소켓1, 소켓2,..."
  @SubscribeMessage('joinRoom') 
  async joinRoom(@ConnectedSocket() client: Socket, @Body() userInfo: ChatUserDto): Promise<void> { 
    try {
      await this.chatValidation.validateUserDto(userInfo); 
      this.logger.log(`${userInfo.userName} entered the room`);
      console.log(userInfo)
      //# 유저 리스트를 채팅창에 보내기 
      if (!this.roomUsers[userInfo.roomId]) {
        this.roomUsers[userInfo.roomId] = [];  //방의 아이디 값이 없으면 초기화 
      }
      
      if(this.roomUsers[userInfo.roomId].includes(userInfo.userName)) {
        return;
      } else {
        this.roomUsers[userInfo.roomId].push(userInfo.userName);
        this.server.emit('userJoined', {
          userList: this.roomUsers[userInfo.roomId]
        })
      }
      
      //#2. 같은 room에 있는 소켓들에 한 명의 참여자의 알림기능의 메세지를 보내는 기능 
      function formatCurrentTime(): string {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
      
        return `${hours}:${minutes}:${seconds}`;
      }
      const currentTime = formatCurrentTime();
      if (!this.chattingRoomToSockets[userInfo.roomId]) {
        this.chattingRoomToSockets[userInfo.roomId] = [];  //초기화 
      }

      this.chattingRoomToSockets[userInfo.roomId].push(client)
      if(this.chattingRoomToSockets[userInfo.roomId]){
        this.chattingRoomToSockets[userInfo.roomId].forEach((s:Socket) => {
          s.emit('participants', {participant: [`${userInfo.userName} 님이 참가하였습니다. ${currentTime}`, ]});
          
        })
      }
      
    } catch(e) {
      this.logger.error('userId 속성 값이 빈 문자열 또는 roomId의 속성 값이 null 또는 undefined입니다!');
      this.logger.debug('스트리밍에서 채팅창의 닉네임 입력값 및 room의 id값을 확인하세요!');
    } 
  
    
  }
  /*
   * @Author : OSOOMAN
   * @Date : 24.1.11
   * @Function : 채팅 창의 메세지 및 사진을 subscribe
   * @Parm : messages, socket 
   * @Return : -
   * @Explain : 클린봇으로 욕설 및 비방 언어 필터 기능과 채팅창에 욕설 및 비방언어가 3회 이상 부터 부적절 메세지는 메세지 송출 금지
    - 사용법: Streaming UI에서 채팅 참가자 닉네임 기입 후 메세지 및 사진 입력 후 보내기 버튼을 누른다. 
             *주의: 사진은 AWS S3의 (goodgang3)bucket에 저장되고 사진을 전송하고 컨트롤러에서 fetch의 결과가 약 20초 소요됩니다. 
    */
  @SubscribeMessage('message') 
  async handleEvent(@MessageBody() messages,): Promise<void> {
    this.logger.log(`We are receiving a Message: ${messages[0]}`)
    this.logger.log(`We are receiving a Image or Video: ${messages[1]}`)
    this.logger.log(`We are receiving a chattingRoomId: ${messages[2]}`)
    console.log(messages)
    //룸의 user의 소켓에만 보낸다!
    function formatCurrentTime(): string {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`; // 01:01:11 형태 반환 
    }
    const currentTime = formatCurrentTime();
    try {
      const filteredMessage = this.chatService.cleanBotAction(messages[0]);
      //#각 메세지에 '***'를 포함하고 있을 때 카운트 +1 > 3회 이상은 레드카드 주고 얼려버린다!
      if(this.chatService.checkProfanity(filteredMessage)) {
        if(!this.count){
          this.count = 0; 
        }
        this.count += 1;
        if( this.count >= 3 ){
          this.chattingRoomToSockets[messages[2]].forEach((s:Socket) => {
            s.emit('message', new ProfanityFilterPipe().transform(messages[0]));
          })

        }
      }
      const msgObj: object = { msg: filteredMessage, url: messages[1], time: `${currentTime}` };
      
      /* client.emit('message', msgObj );  messages: [ 'osoomansour41@naver.com:  goods', '', 'testtyo' ]   */
      this.chattingRoomToSockets[messages[2]].forEach((s:Socket) => {
        s.emit('message', msgObj);
        
      })
      

    } catch (e) {
      this.logger.error(`messages의 자료 타입을 확인하세요.`);
      console.error(e);
    }
  }
  
  /*# 같은 room에 있는 모든 소켓들에 보내는 
    These events are emitted to all the sockets conneted to the same room except the sender.
  */
  @SubscribeMessage('start_call')
  startToCall(@MessageBody() roomId) {
    this.logger.log(`Broadcasting start_call event to peers in room ${roomId}`);
    //지정된 roomId를 가진 수신자에게만 보냄: roomId 가 어디서? 
    if (this.conferenceRoomToSockets[roomId]) {
      this.conferenceRoomToSockets[roomId].forEach((s) => {
        s.emit('start_call');
      });
    }  
    
  }
  @SubscribeMessage('webrtc_offer')
  async receiveWebRTCOffer(@MessageBody() webrtc_offer) {
    this.logger.log(`Broadcasting webrtc_offer event to peers in room ${webrtc_offer.roomId}`)

    try {
      
      if (this.conferenceRoomToSockets[webrtc_offer.roomId]) {
        this.conferenceRoomToSockets[webrtc_offer.roomId].forEach((s) => {
        /*Testcase1.원래는 로직은 webrtc_offer로 가서 -> createSDPAnswer로 날리는게 맞음
          Testcase2. 그런데 현재는 peer가 하나를 가지고 두개를 가정하는 시험이기 때문에 answer를 받음 */
          s.emit('webrtc_answer', webrtc_offer.sdp);
        });
      }
    } catch (e) {
      console.error(e);
    }
    
  }

  @SubscribeMessage('webrtc_answer')
  receiveWebRTCAnswer(@MessageBody() webrtc_Answer) {
    this.logger.log(`Broadcasting webrtc_Answer event to peers in room ${webrtc_Answer.roomId}`)
    console.log(webrtc_Answer)
  
    if (this.conferenceRoomToSockets[webrtc_Answer.roomId]) {
      this.conferenceRoomToSockets[webrtc_Answer.roomId].forEach((s) => {
        s.emit('webrtc_offer', webrtc_Answer.sdp);
      });
    }
    /*# sdp의 이해 
     sdp: {
      type: 'answer',
      sdp: 'v=0\r\n' +
        'o=- 6881990246827507780 2 IN IP4 127.0.0.1\r\n' +
          🔹    "Session-ID"          "IP4는 Network Type" "127.0.0.1는 Address Type"
        's=-\r\n' +
        't=0 0\r\n' +
        'a=sendrecv\r\n'
          🔹단말은 미디어 송신 및 수신 가능 예) 전화기로 통화가 가능한 채널
        'a=msid-semantic: WMS\r\n'
    }

    */
  }
  @SubscribeMessage('webrtc_ice_candidate')
  receiveWebRTCIceCandidate(@MessageBody() webrtc_ice_candidate) {
    this.logger.log(`Broadcasting webrtc_ice_candidate event to peers in room ${webrtc_ice_candidate.roomId}`)
    //console.log(webrtc_ice_candidate);
    if (this.conferenceRoomToSockets[webrtc_ice_candidate.roomId]) {
      this.conferenceRoomToSockets[webrtc_ice_candidate.roomId].forEach((s) => {
        s.emit('webrtc_ice_candidate', webrtc_ice_candidate);
      });
    }

  }

  

}
