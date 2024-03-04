/* eslint-disable prettier/prettier */

import { IsNotEmpty, IsString } from "class-validator";
import { CoreOutput } from "src/common/dtos/output.dto";

export class LoginInputDTO {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}


export class LoginOutputDTO extends CoreOutput{
  token?:string;
}

export class MemberRole {
  memberRole: string;
}