/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import { DealService } from "./deal.service";
import { Role } from "src/auth/role.decorator";

@Controller('/seller')
export class DealController {
  constructor(private dealService: DealService) {
    this.dealService = dealService;
  }
  private logger =  new Logger("DealController");

  @Role(['any'])
  @Post('/make-deal')

  async makeADeal(
    @Body() {compa_name, compaBrand_ImgURL, seller, name, price, maintenance_cost, description, rbURL}
  ){
    this.logger.log("DealController requsetBody:")
    const numPrice = parseFloat(price)
    const numMaintenance_cost = parseFloat(maintenance_cost)
    console.log(compa_name, compaBrand_ImgURL, seller, name, numPrice, description, numMaintenance_cost, rbURL);
    return this.dealService.makeADeal(compa_name, compaBrand_ImgURL, seller, name, numPrice,numMaintenance_cost, description ,rbURL)
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