/* eslint-disable prettier/prettier */
import { Field, ObjectType } from "@nestjs/graphql";
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

@ObjectType()
export class LoginOutput extends CoreOutput{
  @Field(type => String, { nullable: true })
  token?:string;
}

export class MemberRole {
  memberRole: string;
}