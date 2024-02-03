/* eslint-disable prettier/prettier */

import { CoreOutput } from "src/common/dtos/output.dto";

/*
export class Robot {
  name:string;
  price: number;
  description: string;
  rb_glbURL: string;
}
*/

export class MakeADealInput  {
  seller:string;
  name:string;
  price: number;
  description: string;
  rb_glbURL: string;
}

export class MakeADealOutput extends CoreOutput {

} 