/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Robot } from 'src/deals/entitles/robot.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Order } from './order.entity';

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
  
  @OneToMany(
    () => Order,
    (order) => order.items
  )
  order: Order;
}