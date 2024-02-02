/* eslint-disable prettier/prettier */

import { CoreOutput } from "src/common/dtos/output.dto";
import { Robot } from "../entitles/robot.entity";
import { Member } from "src/member/entites/member.entity";

export class MakeADealInput  {
  seller:Member;
  deal_name: string;
  description:string;
  robot:Robot;
}

export class MakeADealOutput extends CoreOutput {

} 