/* eslint-disable prettier/prettier */

import { Store } from "../entities/store.entity";

export class GetStoredGoodsOutputdDTO{
  mySavings: Store[];
  totalPages:number;
}