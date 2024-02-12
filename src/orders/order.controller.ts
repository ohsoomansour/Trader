/* eslint-disable prettier/prettier */
import {  Controller, Get, Logger, Param, Post, Req } from '@nestjs/common';
import { OrderService } from './order.servie';


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

  //고객 입장 
  @Get('/info/:orderId')  //, @Req() req:Request
  getOrder(@Param('orderId') orderId: string, @Req() req:Request) {
    const me = req['member'];
    this.logger.log('/order/info/:id')
    console.log("whoamI");
    console.log(me);

    return this.orderService.getOrder(parseInt(orderId), me); //, me
  }

}