/* eslint-disable prettier/prettier */
import { v4 as uuidv4 } from 'uuid';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Member } from './member.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
@Entity()
export class Verification extends CoreEntity {
  @Column()
  code:string;

  @OneToOne(() => Member, {onDelete:"CASCADE" })
  @JoinColumn()
  member:Member
  
  @BeforeInsert()
  createCode():void {
    this.code = uuidv4();
  }
}