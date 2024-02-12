/* eslint-disable prettier/prettier */
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Repository } from "typeorm";
import { OrderOutputDTO } from "./dtos/order.dto";
import { Member } from "src/member/entites/member.entity";
import { Deal } from "src/deals/entitles/deal.entity";
import { Robot } from "src/deals/entitles/robot.entity";
import { OrderItem } from "./entities/order-item.entity";

export enum OrderStatus  {
  Pending = "Pending",
  OrderCompleted = "OrderComplete",
  OrderApproval = "OrderApproval",
  PaymentApproval = "PaymentApproval",
  ReadyForDelivery = "ReadyForDelivery",
  InDelivery = "InDelivery", 
  DeliveryCompleted = "DeliveryCompleted",
  TransactionCompleted = "TransactionCompleted"
}
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Deal)
    private readonly deals: Repository<Deal>,
    @InjectRepository(Member)
    private readonly members: Repository<Member>,
    @InjectRepository(Robot)
    private readonly robots: Repository<Robot>,
    @InjectRepository(OrderItem)
    private readonly orderitems: Repository<OrderItem>,
   
  ){}  
  private logger = new Logger('OrderService')
  async makeaOrder(orderInput, customer: Member):Promise<OrderOutputDTO>{
    try{
      //entity 
      const deal = await this.deals.findOne({
        where:{
          id: orderInput.dealId
        }
      })
      //아래는 엔티티가 아니다 따라서 
      const robot = await this.robots.findOne({
        where:{
          id: orderInput.items.robot.id,
        }
      })
      //order_item도 새로운 entity를 만들어줘야지 
      const orderitem = this.orderitems.create({
        robot,
        options: orderInput.items.options
      },)
      await this.orderitems.save(orderitem)

      const newOrder = this.orders.create({
        deal,
        customer,
        address: orderInput.address,
        status: OrderStatus.Pending, //서버에서 준비중 기본값 
        items:orderitem,
        total: orderInput.total
      })
      await this.orders.save(newOrder);
      
      return {
        ok: true,
        order: newOrder
      }
    } catch (e) {
      console.error(e);
      
    }
    /*order 가져올 때는 relation
     async getAllDeal() {
    try {
      const allDeals = await this.deals.find({
        order: {
          id: 'DESC',
        },
        cache:true,
        relations:{
            robot: true,
          }
        })
        return allDeals;
      } catch (e) {
      }
    }
    
    */
  }
  //, me:Member
  async getOrder(orderId:number, me):Promise<Order> {
    try {
      const myOrder = await this.orders.findOne({
        where:{
          id: orderId
        },
        relations:{
          customer: true,
          deal: true,
        }
      })

      
      //고객의 주문정보와 로그인한 사람의 정보가 일치하지 않으면 
      /*myOrder.customer.userId! != me.userId  */
      console.log('myOrder.customer.userId:')
      console.log(myOrder.customer.userId) //osoomansour37@naver.com    me.userId == undefined 
      console.log('me.userId:')
      console.log(me.userId)
      //http://localhost:3001/order/info/19
      if(myOrder.customer.userId != me.userId){
        throw new Error('userId PROBLEM!')
        //에러 날려주면
      } else {
        return myOrder;
      }
      
    } catch (e) {
      console.error(e);
      this.logger.error('1. 주문 id가 올바르지 않거나')
      this.logger.error('2. myOrder.cutomer.userId가 undefined 또는 me(로그인 사용자)의 userId값이 undefiend 입니다.');
    }
  }

}