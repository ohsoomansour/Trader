
# 프로젝트 소개 
 **미래에는 ROBOT가 산업 현장의 노동뿐만 아니라 가사 노동을 지원하고 몇 년 내에 로봇 친화적인 환경으로 변화될 것으로 예상됩니다. 로봇 시장의 규모가 커지고 거래가 B to B에서 확장하여 B to C 또는 C to C 거래도 활성화되는 사업을 구상해서 만든 'ROBOT Trader 플랫폼'입니다.**
 <img src="https://github.com/ohsoomansour/Trader/assets/98678172/d4ad738d-3674-48fd-96f6-df99aad75ebe">

### ⏲️프로젝트 개발 기간
 2023년 12월 18일 ~ 2024년 3월 21일

### ⚙️개발 환경
 + Typescript 4.7.1
 + Node.js 18.12.1
 + **library**:React 18.2.0
 + **Framework**:Nestjs 10.2.10
 + **ORM**: TypeORM 
 + **Database**: Postgresql

### 아키텍쳐
 + SOLID 설계 원칙 적용

## Skill 숙련도 
Skill        | Experiences | Careers  | Note
-------------|-------------|--------- |-------
TypeScript   | 1 년        | 0 년      | 
javascript   | 1 년 6개월   | 5개월    | 
DB/SQL       | 1년         | 5개월     | 

## 사용 경험 아이디 / 비번 
- 판매자 역할: osoomansour2@naver.com / osoomansour2 (구매도 가능)
- 구매자 역할: osoomansour1@naver.com / osoomansour1 (판매도 가능)

# 📌주요 기능 

## 회원가입
 - (서버)엔드 포인트 경로: /member/join
 - (클라이언트)라우트 경로: /create-account
 - **아이디/비밀번호 및 휴대 전화의 유효성 확인등 을 통해 아이디/비밀번호 생성**  
 - **Admin으로 가입 시(일정 기간 제한적 가입)관리자의 '회원 관리' 기능 사용이 가능하다.**   

## 로그인 
 - (서버)엔드 포인트 경로: member/login
 - (클라이언트)라우트 경로: /login
 - **DB에서 id 및 password 값 검증**
 - **로그인 시 jwt 발급: Session storage에 저장하고 이용**
   **Token의 값은 있지만 isDormant 속성 값이 true의 경우 '활성화 페이지'로 이동** 
 - **'로그아웃' 또는 브라우저 창을 닫으면 Sessiong storage에서 제거된다.** 

## 회원관리

  <img src="https://github.com/ohsoomansour/Trader/assets/98678172/bdaa72f1-d7c7-4c06-b746-0b1dc2bf1cfe">
 
 - (서버)엔드 포인트 경로: /admin/members/
 - (클라이언트)라우트 경로: /admin  
 - **admin(관리자) 회원 인증 방법: 'UseGuards 데코레이터'(Nesgjs 제공)와 'AuthGuard 클래스'를 사용하여 'Reflector 인터페이스'를 통해 현재 요청 핸들러에서 'roles'키의 메타데이터 즉, 인증이 필요한 값(Role['admin']에서 'admin')을 불러오고 이 'admin'값이 jwt Middleware에서 입력한 '로그인 사용자의 정보'를 ⭐현재 request pipe⭐를 기술한 'ExecutionContext Interface'를 통해 사용자의 memberRole 속성 값이 'admin' 인지 확인한다.** 
  
  >*admin 핸들러의 참조 파일: src/admin/admin.controller.ts
  
  >*현재 request pipe의 참조 파일: src/auth/auth.guard.ts 파일에서 
   const request = context.switchToHttp().getRequest() ✅request.member.memberRole
  
  >*로그인 사용자의 정보의 참조 파일: src/jwt/jwt.middleware.ts파일에서 req['member'] = member;  
                     
 - **회원가입 시 admin으로 가입했다면 특정 회원을 '전체 검색' 또는 '회원 이름'을 통해 검색이 가능하다.** 
 - **Edit '회원 정보' 중 주소 또는 member Role을 변경할 수 있다.**   

## 📷화상 채팅 기능 & 🙇‍♀️1:1 메세지 가능  
  #### **camera 설정: 구글 크롬에서 카메라 연결 설정이 필요하다.** 
  <img src="https://github.com/ohsoomansour/Trader/assets/98678172/40c2a096-9775-4099-88f2-c33b4c124ac9"> 

 ### WebRTC (F/E: conference.tsx, B/E: events.gateway.ts 파일을 참조)
 <img src="https://github.com/ohsoomansour/Trader/assets/98678172/0df07dcf-9f38-4e71-8991-caec61728a36 ">

 - (웹소켓 서버)엔드 포인트 경로: /
 - (클라이언트)라우트 경로: /conference  
 - **socket을 통해 room에 참가할 수 있도록 설정** 
 - **초기 방을 참가할 때 누구나 myStream (MediaStream인터페이스)에 접촉할 수 있도록 양쪽 peer에 PeerConnection인스턴스를 생성 후 offer/answer를 통해 sdp를 설정한다.**    
 - **본인(peer B)이 room에 참가하고 상대 peer(peer A)가 참가하면 'addstream'이벤트가 발생되어 상대의 stream이 추가되고 상대 cam을 추가한다.**
 - **ICE candidate(실제 연결): offer를 보낸 상대방(peer A)이 answer를 받는 시점에 icecandidate이벤트가 발생하고 상대의 IP 주소와 port를 인식하기 위해 STUN 서버를 사용한다.**  
 - **DataChannel를 통한 대화 기능: 상대방 peer에게 메세지 전달이 가능하고 '카메라'를 보면서 '채팅'도 가능하다.**   
   
   >*droid cam(window/Mac os 가능)을 검색해서 다운로드 후 보조 캠 용도로 사용이 가능   
 

## 👩‍💼고객센터 (채팅창)

   <img src="https://github.com/ohsoomansour/Trader/assets/98678172/6a6dcbd5-34d4-4a6a-bff5-b085c7afc644"> 

 - (웹소켓 서버)엔드 포인트 경로: /
 - (클라이언트)라우트 경로: /cc
 - **'웹 소켓'과 '소켓'을 사용하여 채팅 기능 구현** 
 - **우선 채팅방의 이름을 입력(숫자, 문자 가능) 하고 입장한다.** 
 - **메세지뿐만 아니라 AWS S3에 업로드하고 URL을 사용하여 '사진 및 동영상'도 메시지를 보낼 때 같이 사용이 가능하다.**
 - **채팅창에서 욕설 내용은 필터 Trader(B/E) 프로젝트의 event.gateways.ts파일 'messageFunction 함수' 참조**
 - **대화 참가자가 채팅방을 Exit 버튼을 누르고 퇴장하면 Home으로 이동하고 (아이디)님이 퇴장하였습니다 메세지가 나옵니다.**


## 🤖로봇 판매/구매 매칭 기능 

### 공급자가 거래할 상품을 등록 
---------------------------------------------------------------------------------------------------------
 - (서버)엔드 포인트 경로: /seller/make-deal
 - (클라이언트)라우트 경로: /seller
 - **r3f를 사용하여 로봇 3d파일 로드** 
 - **REST API 개인 또는 회사가 거래를 등록하고 누구나(수요자)는 판매되고 있는 리스트에서 선택하여 '주문' 또는 '미리 담기'를 할 수 있습니다.** 
 - **우선 판매자(공급자, 누구나 가능)가 회사 로고 사진 및 판매 가능한 로봇의 사진 및 동영상 파일 또는 glb 파일을 등록한다.**
   
  >*주의: dogRobot.glb 파일 로드가 가능하기 위해 프로젝트 경로 /models/dogRobot.glb 해당 파일이 존재해야 가능하다. 
    
  <img src="https://github.com/ohsoomansour/Trader/assets/98678172/d92172ed-71a3-45c4-b906-be26039f8c06">

---------------------------------------------------------------------------------------------------------

### 등록한 거래 삭제 기능
---------------------------------------------------------------------------------------------------------
  - (서버)엔드 포인트 경로: /myInfo/myDeals
  - (클라이언트)라우트 경로: /seller/delMydeal
  - **거래 등록의 주체가 로봇 상품을 삭제하는 기능이다.**
  - **주의사항은 고객이 '주문'을 했거나 '미리 담기'에 기록이 있으면 삭제할 수 없다.** 
  <img src="https://github.com/ohsoomansour/Trader/assets/98678172/fa073cea-add8-4bbf-a9ae-69a0a4ba9821">

--------------------------------------------------------------------------------------------------------- 

### 주문 및 미리담기
--------------------------------------------------------------------------------------------------------- 
 - (서버)엔드 포인트 경로: '주문'은 /order/make '미리 담기'는 /order/storegoods
 - (클라이언트)라우트 경로: '미리 담기 페이지'는 /order/getstoredgoods 또는 '상품 리스트 페이지'는 /trade
 - **고객이 상품 거래 리스트에서 (메뉴 바에서 로봇 이미지 클릭) 거래 가능한 상품을 '미리 담기' 또는 '바로 주문'이 가능하다.**
 - **미리 담기(메뉴 바에서 카트 모양 )에서 본인이 담은 상품 목록을 확인할 수 있고 여기에서 주문이 바로 가능하다.**
  <img src="https://github.com/ohsoomansour/Trader/assets/98678172/0a410eeb-0963-488d-8a35-dc76090f51e4">

---------------------------------------------------------------------------------------------------------

### 배송상태 변경 
--------------------------------------------------------------------------------------------------------- 
 - (서버)엔드 포인트 경로:  /order/takeorders/:page
 - (클라이언트)라우트 경로: /order/takeOrders
 - **판매자가 등록한 '판매 영수증'과 '배송 상태'를 변경할 수 있다.**
 - **결제 상품 보기(메뉴 바에서 카드 모양)에서 본인이 결제했던 전자 영수증 확인이 가능하다.**
  <img src ="https://github.com/ohsoomansour/Trader/assets/98678172/5754ff41-aedd-420b-b80e-999f5acbcd7c">

--------------------------------------------------------------------------------------------------------- 

 ### 주문 상태 확인 
--------------------------------------------------------------------------------------------------------- 
 - (서버)엔드 포인트 경로: /order/info/:page
 - (클라이언트)라우트 경로: /order/info
 - **고객이 '전자 영수증'을 통해 '구매자와 판매자 정보' 및 '배송 상태' 확인이 가능하다.**
  <img src ="https://github.com/ohsoomansour/Trader/assets/98678172/c9e2ace5-00c5-4274-8442-35a20ea7b217">

---------------------------------------------------------------------------------------------------------

## 배포
 > **ROBOT Trader App**: https://main--darling-kulfi-cecca8.netlify.app/
 - **Front End:** Netlify  
 - **Back End:** Heroku 

## 개발 시작 가이드

### Backend 
npm run start:dev

### Frontend
npm run start