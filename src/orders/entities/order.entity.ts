/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entites/core.entity';
import { Deal } from 'src/deals/entitles/deal.entity';
import { Member } from 'src/member/entites/member.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToOne } from "typeorm";
import { OrderItem } from './order-item.entity';

//택배조회 api, 결제 api(Naver), 
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
  @OneToOne(
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

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending})
  status: OrderStatus;

  @ManyToMany(() => OrderItem)
  items: OrderItem[];
  
}