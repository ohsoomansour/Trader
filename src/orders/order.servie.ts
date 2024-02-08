/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Repository } from "typeorm";
import { OrderOutputDTO } from "./dtos/order.dto";
import { Member } from "src/member/entites/member.entity";
import { Deal } from "src/deals/entitles/deal.entity";

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
  ){}
  //orderInput: OrderInput
  async makeaOrder(orderInput, customer: Member):Promise<OrderOutputDTO>{
    try{
      const deal = await this.deals.findOne({
        where:{
          id: orderInput.dealId
        }
      })
      /*2. member는
      const customer = await this.members.findOne({
        where:{
          userId: orderInput.customer
        }
      })
      */
  
      const newOrder = this.orders.create({
        deal,
        customer,
        address: orderInput.address,
        status: OrderStatus.Pending, //서버에서 준비중 기본값 
        items:{
          robot: orderInput.items.robot,
          options:{
            maintenanceYN: orderInput.items.maintenanceYN,
            maintenance_cost: orderInput.items.maintenance_const,
          }
        },
        total: orderInput.total
      })
      await this.orders.save(newOrder);
      
      return {
        ok: true,
      }
    } catch (e) {
      console.error(e);
      
    }
    //1. 관계deal  찾아오고
  }

}