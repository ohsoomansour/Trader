/* eslint-disable prettier/prettier */

import { CoreOutput } from "src/common/dtos/output.dto";

export class UpdateCommentInputDTO{
  id:number;
  content:string;
}

export class UpdateCommentOutputDTO extends CoreOutput{}