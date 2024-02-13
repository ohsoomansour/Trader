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
      console.log("orderInput.seller:")
      console.log(orderInput.seller)
      const orderitem = this.orderitems.create({
        robot,
        options: orderInput.items.options
      },)
      await this.orderitems.save(orderitem)
      //seller 찾아서 주문을 넣어주자
      const seller = await this.members.findOne({
        where:{
          userId: orderInput.seller,
        }
      })
      console.log("seller:")
      console.log(seller)
      const newOrder = this.orders.create({
        deal,
        seller,
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

  }

  //, orderId:number
  async getMyOrder(customer:Member):Promise<Member> {
    try {
      //나의 주문 정보가 뜬다. 
    const myOrders = await this.members.findOne({
      where:{
        userId: customer.userId,
      },
      relations:{
        order:{
          items:{
            robot:true
          }
        }
      }
    })
    return myOrders;       

    } catch (e) {
      console.error(e);
      this.logger.error('jwt 확인 또는 로그인 사용자 정보를 확인하세요.');
    }

  }
  async takeOrders(seller:Member) {
    try {
      const takingOrders = await this.members.findOne({
        where:{
          userId: seller.userId,
        },
        relations:{
          takingorders:{
            items:{
              robot:true
            },
            customer:true
          },
          
        }
      })
      return takingOrders;
      
    } catch (e) {
      console.error(e);
      this.logger.log('jwt 확인 또는 판매자 정보를 확인하세요.');
    }
  }
  

}