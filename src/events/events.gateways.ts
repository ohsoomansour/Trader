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
import 'moment-timezone';


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
  @SubscribeMessage('join_room')
  rtc_joinRoom(@MessageBody() roomId, @ConnectedSocket() socket: Socket){
    //private conferenceRoomToSockets: { [roomId: string]: Socket[] } = {};
    console.log(roomId);
    this.logger.log('join_room');  
    socket.join(roomId);
    socket.to(roomId).emit("welcome", "new Peer Join!")
  }

  @SubscribeMessage('offer')
  rtc_receiveOffer(@MessageBody() offerInfo, @ConnectedSocket() socket: Socket) {
    this.logger.log('offer');
    socket.to(offerInfo[1]).emit("offer", offerInfo[0]);

  }
  @SubscribeMessage('answer')
  rtc_receiveAnswer(@MessageBody() answerInfo, @ConnectedSocket() socket: Socket) {
    this.logger.log('answer');
    socket.to(answerInfo[1]).emit("answer", answerInfo[0])
  
  }
  @SubscribeMessage("ice")
  rtc_receiveICEcandidate(@MessageBody() ICEinfo, @ConnectedSocket() socket: Socket) {
    socket.to(ICEinfo[1]).emit("ice", ICEinfo[0]);

  }
  @SubscribeMessage("chat")
  rtc_chat(@MessageBody() ICEinfo, @ConnectedSocket() socket: Socket) {
    socket.to(ICEinfo[1]).emit("ice", ICEinfo[0]);

  }
  //===========================  ============================================================
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
  //=======================================================================================================
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
      
      //userInfo.roomId 
      
      
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
      
    
      //#2. 같은 room에 있는 소켓들에 한 명의 참여자의 알림기능의 메세지를 보내는 기능 
      // 예비: 
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
  @SubscribeMessage('exit')
  exitChatRoom(@ConnectedSocket() mySocket: Socket, @MessageBody() userInfo){
    this.logger.log('chat exit');
    console.log(userInfo);
    try {
      function Time () {
        
        /**/
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
  async handleEvent(@MessageBody() messages): Promise<void> {
    this.logger.log(`We are receiving a Message: ${messages[0]}`)
    this.logger.log(`We are receiving a Image or Video: ${messages[1]}`)
    this.logger.log(`We are receiving a chattingRoomId: ${messages[2]}`)
    this.logger.log(`We are receiving a isMe: ${messages[3]}`);
    console.log(messages)
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
