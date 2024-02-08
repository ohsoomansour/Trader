/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Post } from "@nestjs/common";
import { DealService } from "./deal.service";
import { Role } from "src/auth/role.decorator";



@Controller('/seller')
export class DealController {
  constructor(private dealService: DealService) {
    this.dealService = dealService;
  }

  @Role(['any'])
  @Post('/make-deal')

  async makeADeal(
    @Body() {seller, name, price, description, maintenance_cost, rbURL}
  ){
    
    //console.log(seller, name, price, description);
    return this.dealService.makeADeal(seller, name, price, maintenance_cost, description, rbURL)
  }

  @Get('/getallDeals')
  getAllDeals() {
    return this.dealService.getAllDeal();
  }
  /*
  @Get('/getRBmodel/:id')
  getGlbModel(@Param() id){
    
    return;
  }
  */
}