/* eslint-disable prettier/prettier */
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { Repository } from "typeorm";
import { OrderInputDTO, OrderOutputDTO } from "./dtos/order.dto";
import { Member } from "src/member/entities/member.entity";
import { Deal } from "src/deals/entitles/deal.entity";

import {OrderItem } from "./entities/order-item.entity";
import {Store } from "./entities/store.entity";
import {GetOrderOutputDTO } from "./dtos/get-order.dto";
import {TakeOrderOutput } from "./dtos/take-order.dto";
import {StoreGoodsInputDTO } from "./dtos/store-goods.dto";
import {GetStoredGoodsOutputdDTO } from "./dtos/get-storedgoods.dto";
import {Product} from "src/product/entity/product.entity";

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
    @InjectRepository(Product)
    private readonly robots: Repository<Product>,
    @InjectRepository(OrderItem)
    private readonly orderitems: Repository<OrderItem>,
    @InjectRepository(Store)
    private readonly stores: Repository<Store>,
   
  ){}  
  private logger = new Logger('OrderService')

  async makeaOrder(orderInput:OrderInputDTO, customer: Member):Promise<OrderOutputDTO>{
    try{
      const deal = await this.deals.findOne({
        where:{
          id: orderInput.dealId
        }
      })
      const product = await this.robots.findOne({
        where:{
          id: orderInput.items.product.id,
        }
      })
      const orderitem = this.orderitems.create({
        product,
        options: orderInput.items.options
      },)
      await this.orderitems.save(orderitem)

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
          product:true,
        }
      },
      skip:(page - 1) *  3,
      take:3,
      order:{
        id:'DESC'
      },
      cache:true,
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
            product: true,
          },
          customer:true
        },
        skip: (page - 1) * 3,
        take: 3,
        order:{
          id: 'DESC',
        },
        cache:{
          id:'takingOrders_cache',
          milliseconds:6000,
        }
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
        select:['total'],
        cache:true,
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
          product:true,
          seller:true,
        },
        member:true
      },
      skip: (page - 1) * 3,
      take:3,
      order:{
        id: 'DESC',
      },
      cache:{
        id:'getStoredGoods_cache',
        milliseconds:6000,
      }
    })
    const totalSavings = await this.stores.count({
      where:{
        member:{
          userId:me.userId
        }
      }
    })

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

  async updateOrderStatus(orderId:number):Promise<void> {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear(); 
      const month = currentDate.getMonth() + 1; 
      const day = currentDate.getDate(); 
      const hours = currentDate.getHours(); 
      const minutes = currentDate.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const seletedOrder = await this.orders.findOne({
        where:{
          id:orderId
        }
      })
      if(seletedOrder.status === OrderStatus.Pending){
        seletedOrder.status = OrderStatus.ReadyForDelivery;
      } else if(seletedOrder.status === OrderStatus.ReadyForDelivery) {
        seletedOrder.status = OrderStatus.InDelivery;
      } else if(seletedOrder.status === OrderStatus.InDelivery){
        seletedOrder.status = OrderStatus.DeliveryCompleted
        seletedOrder.deliveryCompleted_date = `${month}/${day}/${year} ${ampm} ${hours}:${minutes}`;
        //⭐주문 완료 후 order 기록은 삭제하지 않고 남아있어야 과거 데이터를 확인할 수 있다. 
      } 
      await this.orders.save(seletedOrder);
      
    } catch (e) {
      this.logger.error('해당 주문 상태를 업데이트할 수 없습니다.');
      this.logger.error('주문 id 확인이 필요합니다.')
      console.error(e);
    }
    
  }

  async cancelMyOrder(orderId:number):Promise<void>{
    try{
      await this.orders.delete({
        id:orderId,
      })
    }catch(e){
      console.error(e);
      this.logger.error('해당 주문을 삭제할 수 없습니다.');
      this.logger.error('주문 id 확인이 필요합니다.')
    }
  }
}