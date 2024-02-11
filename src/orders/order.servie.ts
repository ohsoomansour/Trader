/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
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
  //orderInput: OrderInput
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

}