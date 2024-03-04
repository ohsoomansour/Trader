/* eslint-disable prettier/prettier */

import { IsEmail, IsString } from "class-validator";
import { CoreOutput } from "src/common/dtos/output.dto";
import { MemberRole } from "../entites/member.entity";
//import { MemberRole } from "../entites/member.entity";

/*
  + -------------------------------------------DTO란?-----------------------------------------------+ 
  |- DTO(Data Transfer Object)                                                                      |
  |- 계층간의 이동: Controller에서 보낸 (Body의 값: DTO형식)을 Service에 넘겨주고 데이터를 가공해서 반환 |            |
  + ------------------------------------------------------------------------------------------------+
  
  <자동으로 컬럼의 값들이 생성 되기 위해> 
    1.레퍼지토리.create(dto) > .save > DB에 저장
    2.테스트 : insomnia에서 POST REQUEST BODY에 담아서 보내면 컨트롤러(BODY) -> 비즈니스 로직 처리 및 반환 
  */
export class CreateMemberInputDTO
{
  @IsString()
  @IsEmail() 
  userId: string;
  password: string;
  address: string;
  memberRole: MemberRole;
  name:string;
  mobile_phone:string;
}

export class CreateMemberOutputDTO extends CoreOutput{}
