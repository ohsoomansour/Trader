/* eslint-disable prettier/prettier */

import { Body, Controller, Post } from "@nestjs/common";
import { DealService } from "./deal.service";
import { Role } from "src/auth/role.decorator";

@Controller('/deal')
export class DealController {
  constructor(private dealService: DealService) {
    this.dealService = dealService;
  }

  @Role(['any'])
  @Post()
  makeADeal(
    @Body() dealInfo
  ){
    return this.dealService.makeADeal(dealInfo)
  }
}