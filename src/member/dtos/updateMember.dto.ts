/* eslint-disable prettier/prettier */
import { IsString } from "class-validator";
import { MemberRole } from "../entities/member.entity";
import { CoreOutput } from "src/common/dtos/output.dto";

//Admin이 프로필을 수정하는 경우
export class AupdateMemberInfoDTO
{
  @IsString()
  address: string;
  @IsString()
  memberRole: MemberRole;
}
//일반 client가 프로필을 수정하는 경우
export class CupdateMemberInfoDTO {
  userId:string;
  password:string;
  address:string;
}

export class CupdateMemberOutputDTO extends CoreOutput{}
