/* eslint-disable prettier/prettier */
import { Length } from "class-validator";
import { CoreEntity } from "src/common/entites/core.entity";
import { Member } from "src/member/entites/member.entity";
import { Order } from "src/orders/entities/order.entity";
import {Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Robot } from "./robot.entity";


/* 두 가지 경우
 1. 판매자가 deal를 만들 것이냐
   예) 중고거래 느낌이냐 
   판매자 - 고객 one to one 관계
   
 2. 운영자가 제품을 만들것이냐 ㅇ
   예) 크림 

  name:string;
  price: number;
  description: string;
  rb_glbURL: string;

*/

@Entity()
export class Deal extends CoreEntity {
  @Column({nullable:true})
  compa_name:string;

  @Column({nullable: true})
  compaBrand_ImgURL:string;

  @Length(3)
  @ManyToOne(
    () => Member,
    member => member.deal,
    
  )
  seller: Member;
  @RelationId((deal:Deal) => deal.seller)
  sellerId: number;
  //Robot가 삭제될 때 관련된 자식 엔티티(여기서는 Deal)도 함께 삭제
  @ManyToOne(() => Robot, {onDelete: 'CASCADE'})
  robot: Robot;
  @RelationId((deal: Deal) => deal.robot)
  robotId: number;
  
  @OneToMany(
    () => Order,
    order => order.deal,
    
  )
  order:Order;
  
  
}
