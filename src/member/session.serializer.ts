/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
/* #1.설치:npm install @nestjs/passport passport passport-local express-session
   > 클라이언트가 서버에 요청할 자격이 있는지 인증할 때에 passport 미들웨어를 사용하는 것
   > 구글, 페이스북, 카카오 같은 기존의 SNS 서비스 계정을 이용하여 로그인
  
  #2.직렬화란?
  객체의 직렬화는 객체의 내용을 '바이트 단위'로 변환하여 파일 또는 네트워크를 통해서 스트림(송수신)이 가능하도록 하는 것을 의미
  > serializeUser는 사용자 객체를 문자열로 직렬화하고, deserializeUser는 문자열을 다시 사용자 객체로 역직렬화
*/
@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user);
  }

  deserializeUser(payload: any, done: (err: Error, payload: string) => void): any {
    done(null, payload);
  }
}
