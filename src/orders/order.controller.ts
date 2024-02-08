/* eslint-disable prettier/prettier */
import {  Controller, Logger, Post, Req } from '@nestjs/common';
//import { OrderInput } from './dtos/order.dto';
import { OrderService } from './order.servie';


@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}
  private logger = new Logger('OrderController');
  //  @Body() orderInput: OrderInput
  @Post('/make')
  makeAOrder(@Req() req:Request) {
    this.logger.log('/order/make 컨트롤러에 customer, req.body확인:')
    const customer = req['member'];
    console.log(customer);
    console.log(req.body);
    
    return this.orderService.makeaOrder(req.body, customer)
  }
}