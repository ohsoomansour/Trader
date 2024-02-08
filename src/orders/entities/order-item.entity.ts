/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entites/core.entity';
import { Robot } from 'src/deals/entitles/robot.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export class RobotOption {
  maintenanceYN:boolean;
  maintenance_cost: number;
}

@Entity()
export class OrderItem extends CoreEntity{
  @ManyToOne(
    () => Robot,
    {nullable: true, onDelete: 'CASCADE'}
  )
  robot: Robot;

  @Column({type: 'json', nullable: true} )
  options: RobotOption;
}