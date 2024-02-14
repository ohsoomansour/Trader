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
    //2. deal를 (배열 형태로 ) 저장 

    const newStore = this.stores.create({
      member: me,  
      deal: oneDeal   
    })
    await this.stores.save(newStore);
    
    const saving = await this.members.findOne({
      where:{
        userId:me.userId
      },
      /**/
      relations:{
        store:{
          deal:true
        }
      }
    })
    //3. 1차적으로 나의 store.deals 값을 출력이 가능 한 지 확인 
    this.logger.log("storeGoods에서 나의 saving 확인:")
    console.log(saving)
  /*
  Member {
  id: 39,
  createdAt: 2024-01-19T06:22:27.916Z,
  updatedAt: 2024-02-14T08:52:22.894Z,
  userId: 'osoomansour37@naver.com',
  name: '오수만',
  address: 'sinsadong',
  memberRole: 'client',
  lastActivityAt: 2024-02-14T08:52:22.886Z,
  isDormant: null,
  verified: false,
  store: [
    Store {
      id: 30,
      createdAt: 2024-02-14T12:41:38.405Z,
      updatedAt: 2024-02-14T12:41:38.405Z,
      deal: null
    },
    Store {
      id: 31,
      createdAt: 2024-02-14T12:53:24.584Z,
      updatedAt: 2024-02-14T12:53:24.584Z,
      deal: [Deal]
    },
    Store {
      id: 32,
      createdAt: 2024-02-14T12:56:12.116Z,
      updatedAt: 2024-02-14T12:56:12.116Z,
      deal: [Deal]
    },
    Store {
      id: 33,
      createdAt: 2024-02-14T13:00:51.203Z,
      updatedAt: 2024-02-14T13:00:51.203Z,
      deal: [Deal]
    },
    Store {
      id: 34,
      createdAt: 2024-02-14T13:01:08.229Z,
      updatedAt: 2024-02-14T13:01:08.229Z,
      deal: [Deal]
    },
    Store {
      id: 35,
      createdAt: 2024-02-14T13:01:15.364Z,
      updatedAt: 2024-02-14T13:01:15.364Z,
      deal: [Deal]
    }
  ]
}
    
    */

  }

  async getStoredGoods(customer:Member) {
    //2.Save  makeaOrder 쿼리를 탄다. 
    //로그인 유저의 아이디를 바탕으로 member엔티티를 찾아와서 ㅇ
  }
  
}