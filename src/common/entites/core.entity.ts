/* eslint-disable prettier/prettier */
import { CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class CoreEntity {
  //자동으로 컬럼의 값들이 생성 되기 위해: 레퍼지토리.create(dto) > .save > DB에 저장
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}