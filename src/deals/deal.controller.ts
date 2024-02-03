/* eslint-disable prettier/prettier */

import { Body, Controller, Post } from "@nestjs/common";
import { DealService } from "./deal.service";
import { Role } from "src/auth/role.decorator";


@Controller('/seller')
export class DealController {
  constructor(private dealService: DealService) {
    this.dealService = dealService;
  }

  @Role(['any'])
  @Post('/make-deal')
  makeADeal(
    @Body() {seller, robot} 
  ){
    return this.dealService.makeADeal(seller, robot)
  }
}