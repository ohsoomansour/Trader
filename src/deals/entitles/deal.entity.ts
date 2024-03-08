/* eslint-disable prettier/prettier */
import { Length } from "class-validator";
import { CoreEntity } from "src/common/entites/core.entity";
import { Member } from "src/member/entites/member.entity";
import { Order } from "src/orders/entities/order.entity";
import {Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Robot } from "./robot.entity";
import { Store } from "src/orders/entities/store.entity";


@Entity()
export class Deal extends CoreEntity {

  @Column({nullable:true})
  compa_name:string;

  @Column({nullable: true})
  compaBrand_ImgURL:string;

  @Column({nullable:true})
  salesManager_mobilephone:string;

  @Length(3)
  @ManyToOne(
    () => Member,
    member => member.deal,
  )
  seller: Member;
  @RelationId((deal:Deal) => deal.seller)
  sellerId: number;

  @Column({nullable: true})
  seller_address:string;
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
  
  @OneToMany(
    () => Store,
    store => store.deal
  )
  store:Store;
  


}
