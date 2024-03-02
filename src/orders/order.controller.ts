/* eslint-disable prettier/prettier */
import {  Body, Controller, Delete, Get, Logger, Param, Post, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { StoreGoodsInputDTO } from './dtos/store-goods.dto';


@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}
  private logger = new Logger('OrderController');

  @Post('/make')
  makeAOrder(@Req() req:Request) {
    this.logger.log('/order/make 컨트롤러에 customer, req.body확인:')
    const customer = req['member'];
    console.log(customer);
    console.log(req.body);
    
    return this.orderService.makeaOrder(req.body, customer)
  }

  //@Explain:고객 입장, 나의 주문 확인 
  @Get('/info/:page')  
  getMyOrder(@Req() req:Request, @Param('page') page) {
    const customer = req['member'];

    return this.orderService.getMyOrder(customer, page); 
  }
  //@Explain: 판매자 입장, 고객 주문 확인 
  @Get('/takeorders/:page')
  takeOrders(@Req() req: Request, @Param('page') page:number) {
    this.logger.log('takeorders');
    console.log(page);
    const seller = req['member']
    return this.orderService.takeOrders(seller, page);

  }
  /*@Author: osooman 
   *@Params: StoreGoodsInputDTO 참고
   *@Function: 구입 하기 전 담기의 기능을 한다.  
   *@Explain: F/E에서 보낸 데이터가 JSON 형식이라면 서버에서 해당 JSON을 파싱하여 StoreGoodsInputDTO로 변환이 필요하고 따라서 Body데코리에터가 매핑 기능을 하므로 추가  
  */
  @Post('/storegoods')   
  storeGoods(@Req() req: Request, @Body() storeGoodsInput:StoreGoodsInputDTO){
    this.logger.log('storegoods의 me & storeGoodsInput:');
    const me = req['member'];
    console.log(me, storeGoodsInput);
    
    return this.orderService.storeGoods(storeGoodsInput, me);
  }

  @Get('/getstoredgoods/:page')
  getStoredGoods(@Req() req: Request, @Param('page') page:number){
    const me = req['member'];
    return this.orderService.getStoredGoods(me, page)
  }

  @Delete('/deletestoredgoods/:storageId')
  deleteStoredGoods(@Param('storageId') storageId: number) {
    this.logger.log('/deletestoredgoods:')
    console.log(storageId)
    this.orderService.deleteStoredGoods(storageId);
  }
}