/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entites/core.entity';
import { Deal } from 'src/deals/entitles/deal.entity';
import { Member } from 'src/member/entites/member.entity';
import { Column, Entity, ManyToOne} from "typeorm";
import { OrderItem } from './order-item.entity';


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

@Entity()
export class Order extends CoreEntity {
  @ManyToOne(
    () => Deal,
    deal => deal.order
  )
  deal: Deal;
  
  @ManyToOne(
    () => Member,
    member => member.orders
  )
  customer: Member;
  
  @Column()  
  address: string;

  @ManyToOne(
    () => Member,
    
  )
  seller:Member;

  @Column({nullable:true})
  salesManager_mobile_phone:string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending})
  status: OrderStatus;
  //id를 가지고있는데 foreign key로 가지고 있음 -> find할 때 ! relations 조인이된다. 
  @ManyToOne(
    () => OrderItem,
    (order_item) => order_item.order
  )

  items: OrderItem;
  
  @Column({nullable:true})
  total: number;

  @Column({nullable:true})
  deliveryCompleted_date:string;
}