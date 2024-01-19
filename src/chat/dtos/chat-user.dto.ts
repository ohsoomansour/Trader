/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
//적용 위치는 라우터나 클래스에 도달하기전 'JSON body를 변환한 후' 검증이 이뤄지기에 미리 검증을 해볼 수 있습니다.
export class ChatUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;
  
  @IsUUID()
  @IsNotEmpty()
  roomId: string;
}