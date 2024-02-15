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
import { Store } from "./entities/store.entity";


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
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
   
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
  
  async storeGoods(savingInput, me:Member) {
    console.log("me:")
    console.log(me)
    

    //1. 해당 deal를 찾고 
    const dealId = parseInt(savingInput.dealId);
    const oneDeal = await this.deals.findOne({
      where:{
        id: dealId,
      }
    })
    //2. store 리스트에 deal를 (배열 형태로 ) 저장 

    const newStore = this.stores.create({
      member: me,  
      deal: oneDeal,
      payment: savingInput.payment

    })
    await this.stores.save(newStore);
    
    
    

  }

  async getStoredGoods(me:Member) {
    //3. Store 엔티티에 저장된 deal를 join을 통해 참조해서 불러온다. (token만 있으면 담은 물건을 확인이 가능한다! )
    const mySaving = await this.members.findOne({
      where:{
        userId:me.userId
         
      },
      relations:{
        store:{
          deal:{
            robot:true,
            seller:true
          }
        },
      },
      cache:true,
    })
    this.logger.log("storeGoods에서 나의 mySaving 확인:")
    console.log(mySaving)

    return mySaving;
  }
  
  async deleteStoredGoods(storageId:number) {
    this.stores.delete({
      id:storageId,
      
    })
  }
  
  
}