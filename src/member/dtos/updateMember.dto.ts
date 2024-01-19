/* eslint-disable prettier/prettier */
import { IsString } from "class-validator";
import { MemberRole } from "../entites/member.entity";
import { CoreOutput } from "src/common/dtos/output.dto";

//Admin이 프로필을 수정하는 경우
export class AupdateMemberInfo
{
  @IsString()
  address: string;
  @IsString()
  memberRole: MemberRole;
}
//일반 client가 프로필을 수정하는 경우
export class CupdateMemberInfo {
  userId:string;
  password:string;
  address:string;
}

export class CupdateMemberOutput extends CoreOutput{}
