/* eslint-disable prettier/prettier */
import { CoreEntity } from "src/common/entities/core.entity";
import { Member } from "src/member/entities/member.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Comment extends CoreEntity{
  
  @ManyToOne(
    () => Member,
    member => member.comment
  )
  writer:Member

  @Column()
  content:string;


}