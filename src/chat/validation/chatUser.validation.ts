/* eslint-disable prettier/prettier */

import { validate } from "class-validator";
import { ChatUserDto } from "../dtos/chat-user.dto";
import { Injectable} from "@nestjs/common";


@Injectable()
export class ChatValidation { //userInfo.roomId,
   async validateUserDto(userInfo: ChatUserDto) {
    //# userInfo.roomId의 프로퍼티가 null 또는 undefined의 경우 변수에 대입되지 않음 바로 try ~ catch(e) 캐치에서 에러 확인 가능
    //#닉네임
    if(userInfo.userName == '') {
      throw new Error('닉네임의 값이 없습니다!')
    }

    //#roomId
    await validate(userInfo.roomId,{
      skipNullProperties: false,
      skipUndefinedProperties: false,
      enableDebugMessages: true,
    });
    /*
    if (errors.length > 0) {
      console.log(errors.length);
      console.log(errors);
      const errorMessage = errors.map(error => Object.values(error.constraints).join(', ')).join('; ');
      //Error: Validation failed:
      throw new Error(`Validation failed: ${errorMessage}`);
    }
    */
  }
}
