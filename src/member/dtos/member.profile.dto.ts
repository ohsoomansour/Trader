/* eslint-disable prettier/prettier */
import { CoreOutput } from "src/common/dtos/output.dto";
import { Member } from "../entities/member.entity";

export class MemberProfileInput {
  userId: number;
}

export class MemberProfileOutput extends CoreOutput {
  member?: Member; 
}