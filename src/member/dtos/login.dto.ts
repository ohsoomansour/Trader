/* eslint-disable prettier/prettier */

import { IsNotEmpty, IsString } from "class-validator";
import { CoreOutput } from "src/common/dtos/output.dto";

export class LoginInput {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}


export class LoginOutput extends CoreOutput{
  token?:string;
}

export class MemberRole {
  memberRole: string;
}