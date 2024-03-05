/* eslint-disable prettier/prettier */
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Repository } from "typeorm";
import { OrderInputDTO, OrderOutputDTO } from "./dtos/order.dto";
import { Member } from "src/member/entites/member.entity";
import { Deal } from "src/deals/entitles/deal.entity";
import { Robot } from "src/deals/entitles/robot.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Store } from "./entities/store.entity";
import { GetOrderOutputDTO } from "./dtos/get-order.dto";
import { TakeOrderOutput } from "./dtos/take-order.dto";
import { StoreGoodsInputDTO } from "./dtos/store-goods.dto";
import { GetStoredGoodsOutputdDTO } from "./dtos/get-storedgoods.dto";

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

  async makeaOrder(orderInput:OrderInputDTO, customer: Member):Promise<OrderOutputDTO>{
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

      const newOrder = this.orders.create({
        deal,
        seller,
        salesManager_mobile_phone:orderInput.salesManager_mobile_phone,
        customer,
        address: orderInput.address,
        status: OrderStatus.Pending, 
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
  //
  async getMyOrder(customer:Member, page:number):Promise<GetOrderOutputDTO> {
    try {
    //나의 주문 정보가 뜬다. 
    const totalSavings = await this.orders.count({
      where:{
        customer:{
          userId:customer.userId
        }
      }
    })
    console.log("totalSavings",totalSavings);
    const myOrders = await this.orders.find({
      where:{
        customer:{
          userId:customer.userId
        }
      },
      relations:{
        seller:true,
        customer:true,
        items:{
          robot:true,
        }
      },
      skip:(page - 1) *  3,
      take:3,
      order:{
        id:'DESC'
      }
    })
    
    return {
      myOrders,
      totalPages: Math.ceil(totalSavings / 3)
    };       

    } catch (e) {
      console.error(e);
      this.logger.error('jwt 확인 또는 로그인 사용자 정보를 확인하세요.');
    }
  }
  //판매자 입장에서 받은 주문 
  async takeOrders(seller:Member, page:number):Promise<TakeOrderOutput> {
    try {
      const totalOrders = await this.orders.count({
        where:{
          seller:{
            userId: seller.userId
          }
        },
      });
      const takingOrders = await this.orders.find({
        where:{
          seller:{
            userId: seller.userId,
          }
        },
        relations:{
          deal:true,
          items:{
            robot: true,
          },
          customer:true
        },
        skip: (page - 1) * 3,
        take: 3,
        order:{
          id: 'DESC',
        },
        cache:true,
      })
      /* findAndCount 메서드로 할경우 
            [
        [
          Order { total: 10100 },
          Order { total: 10000 },
          Order { total: 10000 },
          Order { total: 10000 },
          Order { total: 10100 },
          Order { total: 10100 },
          Order { total: 10000 },
          Order { total: 10000 },
          Order { total: 10000 },
          Order { total: 7000 },
          Order { total: 10000 },
          Order { total: 10000 }
        ],
        12
      ]*/
      this.logger.log('takingOrders:')
      //총 건수
      const salesCount = await this.orders.count({
        where:{
          seller:{
            userId:seller.userId
          }
        },
        select:['total']
      })

      const order = this.orders.createQueryBuilder('order');
      const totalSales = await order
        .select("SUM(order.total)", "total")
        .leftJoin("order.seller", "seller")
        .where("seller.userId = :userId", { userId: seller.userId }) // seller의 userId값으로 필터링
        .getRawOne();
       this.logger.log('salesCount & totalSales:');
       console.log(salesCount, totalSales);
      

      return {
        takingOrders,
        totalPages: Math.ceil(totalOrders / 3),
        salesCount:salesCount,
        totalSales:totalSales.total
        
      };
      
    } catch (e) {
      console.error(e);
      this.logger.error('1.jwt 확인 또는 판매자 정보를 확인하세요.');
      this.logger.error('2.page 파리미터를 확인하세요.')
    }
  }
  
  async storeGoods(savingInput:StoreGoodsInputDTO, me:Member):Promise<void> {
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

  async getStoredGoods(me:Member, page:number):Promise<GetStoredGoodsOutputdDTO> {
    //3. Store 엔티티에 저장된 deal를 join을 통해 참조해서 불러온다. (token만 있으면 담은 물건을 확인이 가능한다! )
    const mySavings = await this.stores.find({
      where:{
        member:{
          userId:me.userId,
        }
      },
      relations:{
        deal:{
          robot:true,
          seller:true,
        },
        member:true
      },
      skip: (page - 1) * 3,
      take:3,
      order:{
        id: 'DESC',
      },
    })
    const totalSavings = await this.stores.count({
      where:{
        member:{
          userId:me.userId
        }
      }
    })
    this.logger.log("storeGoods에서 나의 totalSavings 확인:")
    console.log(totalSavings);
    return {
      mySavings,
      totalPages: Math.ceil(totalSavings / 3),
    };
  }
  
  async deleteStoredGoods(storageId:number):Promise<void> {
    this.stores.delete({
      id:storageId,
    })
  }
}