/* eslint-disable prettier/prettier */

import { CoreEntity } from "src/common/entites/core.entity";
import { Deal } from "src/deals/entitles/deal.entity";
import { Member } from "src/member/entites/member.entity";
import {Column, Entity, ManyToOne} from "typeorm";

class Payment {
  price:number;
  maintenanceYN:boolean;
  maintenance_cost: number;
  total:number;
}

@Entity()
export class Store extends CoreEntity{

  @ManyToOne(
    () => Member,
    member => member.store
  )
  member:Member;

  @ManyToOne(
    () => Deal,
    (deal) => deal.store
  )
  deal: Deal;
 
  @Column({type:'json', nullable:true})
  payment: Payment;
  
}