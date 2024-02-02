/* eslint-disable prettier/prettier */
import { Length } from "class-validator";
import { CoreEntity } from "src/common/entites/core.entity";
import { Member } from "src/member/entites/member.entity";
import { Order } from "src/orders/entities/order.entity";

import { Column, Entity, ManyToOne, OneToOne, RelationId } from "typeorm";

/* 두 가지 경우
 1. 판매자가 deal를 만들 것이냐
   예) 중고거래 느낌이냐 
   판매자 - 고객 one to one 관계
   
 2. 운영자가 제품을 만들것이냐 ㅇ
   예) 크림 

*/

@Entity()
export class Deal extends CoreEntity {
  @Column()
  deal_id: string;
  @Column()
  category: string;
  @Column()
  product_name:string;
  
  
  @Length(3)
  @ManyToOne(
    () => Member,
    member => member.deal
  )
  seller: Member;
  @RelationId((deal:Deal) => deal.seller)
  sellerId: number;
  
  @OneToOne(
    () => Order,
    order => order.deal
  )
  order:Order;
  
  
}
