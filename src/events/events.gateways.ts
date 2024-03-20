/* eslint-disable prettier/prettier */
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

const PORT = process.env.NODE_ENV ==="dev" ? 8080 : undefined;
@WebSocketGateway(PORT, 
{
  cors:"*",
  //path: '/chat',
  transports:['websocket'],   //, 'websocket'
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
  /*
   * @Author : OSOOMAN
   * @Date : 24.3.18
   * @Function : join_room 이벤트가 발생하면 함수가 실행된다. 
   * @Parm: 방 이름, (연결된) 소켓
   * @Return:  -
   * @Explain: 상대방(peer)가 참가했다고 타겟 방에 참여되어 있는 사용자들에게 브로드캐스팅한다. 
   */
  @SubscribeMessage('join_room')
  rtc_joinRoom(@MessageBody() roomId, @ConnectedSocket() socket: Socket){
    this.logger.log('join_room');  
    socket.join(roomId);
    socket.to(roomId).emit("welcome", "new Peer Join!")
  }
  /*
   * @Author : OSOOMAN
   * @Date : 24.3.18
   * @Function :peer가 offer를 생성하고 offer를  이벤트가 발생하면 함수가 실행된다. 
   * @Parm: RTCSessionDescriptionInit의 offer와 room 이름과 (연결된)소켓
   * @Return: -
   * @Explain: 피어 간 통신을 설정하는 데 필요한 정보가 포함되어있는 'PeerConnection 객체의 로컬 설명' 생성을 받는다. (SDP 형식) 
               그리고 상대 피어에게 offer를 전달한다. 
   */
  @SubscribeMessage('offer')
  rtc_receiveOffer(@MessageBody() offerInfo, @ConnectedSocket() socket: Socket) {
    this.logger.log('offer');
    socket.to(offerInfo[1]).emit("offer", offerInfo[0]);
  }
  /*
   * @Author : OSOOMAN
   * @Date : 24.3.18
   * @Function : 상대 피어가 'answer'이벤트를 발생시키면 실행되는 함수이다. 
   * @Parm: answerInfo 객체에는 SDP 형식의 answer 변수, 방이름 그리고 (연결된)소켓
   * @Return: -
   * @Explain: 상대(원격) 피어가 'offer'를 받고 설정 후 응답을 생성해 보내서 받는 함수이다. 
   */
  @SubscribeMessage('answer')
  rtc_receiveAnswer(@MessageBody() answerInfo, @ConnectedSocket() socket: Socket) {
    this.logger.log('answer');
    socket.to(answerInfo[1]).emit("answer", answerInfo[0])
  }
  /*
   * @Author : OSOOMAN
   * @Date : 24.3.18
   * @Function : icecandidate 이벤트가 발생했을 때(offer를 보낸 피어가 answer를 받을 때) 함수가 동작한다. 
                 이 candidate를 다시 상대 피어(브라우저)에게 보내야한다. 
   * @Parm: ICEinfo는 candidate (2780721361 1  tcp... 이런 형태)와 소켓
   * @Return: -
   * @Explain: ICE candidate란? SDP가 외부 NAT(ip주소와 port 제한 처리 방법)을 인식하기 위한 기술
   * - 
   */
  @SubscribeMessage("ice")
  rtc_receiveICEcandidate(@MessageBody() ICEinfo, @ConnectedSocket() socket: Socket) {
    socket.to(ICEinfo[1]).emit("ice", ICEinfo[0]);
  }
  
  /*
   * @Author : OSOOMAN
   * @Date : 24.3.18
   * @Function : 사용자가 채팅방을 참가한다. 
   * @Parm: roomId와 연결된 소켓 
   * @Return: -
   * @Explain: 사용자가 room의 이름을 입력하고 join 버튼을 누르면 join 이벤트가 실행되고 hanleEmit 함수가 실행된다. 
   */
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
        //참여 기록 삭제 후 다시 재 참여 
         this.roomUsers[userInfo.roomId] = this.roomUsers[userInfo.roomId].filter(user => user !== userInfo.userName);
         this.roomUsers[userInfo.roomId].push(userInfo.userName);
         this.server.emit('userJoined', {
          userList: this.roomUsers[userInfo.roomId]
         })
      } else {
        this.roomUsers[userInfo.roomId].push(userInfo.userName);
        this.server.emit('userJoined', {
          userList: this.roomUsers[userInfo.roomId]
        })
      } 
    
      function Time ():string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        const Hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        return `${year}년 ${month+1}월 ${date}일 ${Hours+9}시 ${minutes}분 ${seconds }초 `;
      }
      const currentTime = Time();

      if (!this.chattingRoomToSockets[userInfo.roomId]) {
        this.chattingRoomToSockets[userInfo.roomId] = [];  //초기화 
      }

      this.chattingRoomToSockets[userInfo.roomId].push(client)
      if(this.chattingRoomToSockets[userInfo.roomId]){
        this.chattingRoomToSockets[userInfo.roomId].forEach((s:Socket) => {
          s.emit('participants', {participant:`${userInfo.userName} 님이 참가하였습니다.`, time: `${currentTime}` } );
          
        })
      }
      
    } catch(e) {
      this.logger.error('userId 속성 값이 빈 문자열 또는 roomId의 속성 값이 null 또는 undefined입니다!');
      this.logger.debug('스트리밍에서 채팅창의 닉네임 입력값 및 room의 id값을 확인하세요!');
    } 
  
  }
  /*
   * @Author : OSOOMAN
   * @Date : 24.3.18
   * @Function : 사용자가 채티방을 나간다. 
   * @Parm : 연결된 소켓과 유저의 정보(방 이름과 아이디 )
   * @Return : -
   */

  @SubscribeMessage('exit')
  exitChatRoom(@ConnectedSocket() mySocket: Socket, @MessageBody() userInfo){
    this.logger.log('chat exit');
    console.log(userInfo);
    try {
      function Time () {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const date = now.getDate();
        const Hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        return `${year}년 ${month+1}월 ${date}일 ${Hours+9}시 ${minutes}분 ${seconds }초 `;
      }
      const currentTime = Time();
    
      //1. exit 소켓 제거 
      this.chattingRoomToSockets[userInfo.roomId] = this.chattingRoomToSockets[userInfo.roomId].filter((joinedSocket) => joinedSocket !== mySocket)
      //2. 방에서 유저 삭제!
      this.roomUsers[userInfo.roomId] = this.roomUsers[userInfo.roomId].filter((joinedUser) => joinedUser !== userInfo.userId)
      if(!this.roomUsers[userInfo.roomId].includes(userInfo.userId)) {
        this.chattingRoomToSockets[userInfo.roomId].forEach((s:Socket) => {
          s.emit("exit", { userList: this.roomUsers[userInfo.roomId], userId: userInfo.userId, time: `${currentTime}`});
        })
      } else {
        return;
      }

    } catch (e){
      this.logger.error('')
      console.error(e);
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
  async messageFunction(@MessageBody() messages): Promise<void> {
    this.logger.log(`We are receiving a Message: ${messages[0]}`)
    this.logger.log(`We are receiving a Image or Video: ${messages[1]}`)
    this.logger.log(`We are receiving a chattingRoomId: ${messages[2]}`)
    this.logger.log(`We are receiving a isMe: ${messages[3]}`);

    //룸의 user의 소켓에만 보낸다!
    function formatCurrentTime(): string {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${hours+9}:${minutes}:${seconds}`; // 01:01:11 형태 반환 
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
      const msgObj: object = { msg: filteredMessage, url: messages[1], time: `${currentTime}`, myEmaiId: messages[3] };
      this.chattingRoomToSockets[messages[2]].forEach((s:Socket) => {
        s.emit('message', msgObj);
      })
    } catch (e) {
      this.logger.error(`messages의 자료 타입을 확인하세요.`);
      this.logger.debug('사용자의 아이디가 ');
      console.error(e);
    }
  }
  
}
