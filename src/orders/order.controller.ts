/* eslint-disable prettier/prettier */
import {  Controller, Delete, Get, Logger, Param, Post, Req } from '@nestjs/common';
import { OrderService } from './order.service';


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
  @Get('/info')  
  getMyOrder(@Req() req:Request) {
    const customer = req['member'];
    this.logger.log('/order/info/ 경로, who am I? ')
    console.log(customer);

    return this.orderService.getMyOrder(customer); 
  }
  //@Explain: 판매자 입장, 고객 주문 확인 
  @Get('/takeorders/:page')
  takeOrders(@Req() req: Request, @Param('page') page:number) {
    this.logger.log('takeorders');
    console.log(page);
    const seller = req['member']
    return this.orderService.takeOrders(seller, page);

  }

  @Post('/storegoods')
  storeGoods(@Req() req: Request){
    const me = req['member'];
    return this.orderService.storeGoods(req.body, me);
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