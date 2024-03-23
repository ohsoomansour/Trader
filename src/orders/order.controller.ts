/* eslint-disable prettier/prettier */
import {  Body, Controller, Delete, Get, Logger, Param, Patch, Post, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { StoreGoodsInputDTO } from './dtos/store-goods.dto';
import { OrderInputDTO } from './dtos/order.dto';
import { Member } from 'src/member/entites/member.entity';


@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}
  private logger = new Logger('OrderController');

 /*@Author: osooman 
  *@Param: 주문 정보 입력( OrderInputDTO 참고 )
  *@Function: 원하는 상품을 주문하는 기능
  *@Explain: 고객이 누구인지는 jwt middleware에서 확인하고 '주문 입력 정보'를 클라이언트에게 받아서 주문을 할 수 있다. 
  */
  @Post('/make')
  makeAOrder(@Req() req:Request, @Body() orderInput:OrderInputDTO ) {
    this.logger.log('/order/make 컨트롤러에 customer, req.body확인:')
    const customer:Member = req['member'];
    return this.orderService.makeaOrder(orderInput, customer)
  }
 /*@Author: osooman 
  *@Param: page
  *@Function: 나의 주문 확인 
  *@Explain: 고객 입장, 클라이언트에서 page 파라미터를 받고 페이지 해당 구간별로 나의 주문 확인이 가능하다.  
  */
  @Get('/info/:page')  
  getMyOrder(@Req() req:Request, @Param('page') page:number) {
    const customer:Member = req['member'];
    return this.orderService.getMyOrder(customer, page); 
  }

 /*@Author: osooman 
  *@Param: page
  *@Function: 매출확인  
  *@Explain: 판매자 입장, 클라이언트에서 page 파라미터를 받고 고객 주문 확인  
  */
  @Get('/takeorders/:page')
  takeOrders(@Req() req: Request, @Param('page') page:number) {
    this.logger.log('takeorders');
    const seller:Member = req['member']
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
    const me:Member = req['member'];

    return this.orderService.storeGoods(storeGoodsInput, me);
  }
 /*@Author: osooman 
  *@Param: page
  *@Function: 사용자가 담은 상품을 볼 수 있다. 
  *@return: 담은 상품의 정보( GetStoredGoodsOutputdDTO 참조 )
  *@Explain: page 파라미터를 받고 페이지 별 미리 담기 목록 확인이 가능하다.   
  */
  @Get('/getstoredgoods/:page')
  getStoredGoods(@Req() req: Request, @Param('page') page:number){
    const me:Member = req['member'];
    return this.orderService.getStoredGoods(me, page)
  }
  /*@Author: osooman 
  *@Param: storage id  
  *@Function: 사용자가 미리 담은 상품을 삭제할 수 있다. 
  *@return: -
  *@Explain: 클라이언트에서 사용자가 store엔티티의 id를 받고 해당 id, 미리 담은 상품을 삭제한다.      
  */
  @Delete('/deletestoredgoods/:storageId')
  deleteStoredGoods(@Param('storageId') storageId: number) {
    this.logger.log('/deletestoredgoods:')
    this.orderService.deleteStoredGoods(storageId);
  }

 /*@Author: osooman 
  *@Param: 주문 id  
  *@Function: 상품의 주문 상태를 변경한다. 
  *@return: -
  *@Explain: 클라이언트(공급자)가 주문 id를 넘겨주고 해당 주문 건의 상태변경을 실행한다.       
  */
 @Patch('/update_orderstatus/:orderId')
 updateOrderStatus(@Param('orderId') orderId:number){
  return this.orderService.updateOrderStatus(orderId);
 }

 /*@Author: osooman 
  *@Param: 주문 id  
  *@Function: 고객 자신의 주문을 취소한다. 
  *@return: -
  *@Explain: 고객의 주문 id를 파라미터로 받고 해당 주문 건을 취소한다. 
  */
 @Delete('/cancel_myorder/:orderId')
 cancelMyOrder(@Param('orderId') orderId:number ){
  return this.orderService.cancelMyOrder(orderId);
 }
}