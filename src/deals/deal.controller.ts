/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Logger, Post } from "@nestjs/common";
import { DealService } from "./deal.service";
import { Role } from "src/auth/role.decorator";
import { MakeADealInputDTO } from "./dtos/make-deal.dto";

@Controller('/seller')
export class DealController {
  constructor(private dealService: DealService) {
    this.dealService = dealService;
  }
  private logger =  new Logger("DealController");

  /*@Author: osooman
   *@Function: 공급 회사가 한 개의 거래를 만든다. 
   *@Param: 공급자 회사 및 담당자의 정보 (MakeADealInputDTO 참조)
   *@return: 반환 값은 Promise<void>으로 없다.
   *@Explain: role은 회원의 등급 client 또는 admin에 관계없이 거래가 등록이 가능 하도록 구성하였다. 
   */
  @Role(['any'])
  @Post('/make-deal')
  async makeADeal(
    @Body() makingDealInput:MakeADealInputDTO
  ){
    this.logger.log("DealController requsetBody:")


    return this.dealService.makeADeal(makingDealInput)
  }
  /*@Author: osooman
   *@Function: 현재 거래 가능한 상품 또는 로봇들을 모두 가져온다. 
   *@Param: 없음
   *@return:  Promise<Deal[]>으로 현재 거래 가능한 상품들을 가져온다. 
   *@Explain: role은 회원의 등급 client 또는 admin에 관계없이  거래 가능한 아이템들
   */
  @Role(['any'])
  @Get('/getallDeals')
  getAllDeals() {
    return this.dealService.getAllDeal();
  }

}