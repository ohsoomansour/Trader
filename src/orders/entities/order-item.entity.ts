/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';

import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/product/entity/product.entity';

export class ProductOption {
  maintenanceYN:boolean;
  maintenance_cost: number;
  option1:string;
  option2:string;
  option3:string;
  option4:string;
}
@Entity()
export class OrderItem extends CoreEntity{
  @ManyToOne(
    () => Product,
    {nullable: true, onDelete: 'CASCADE'}
  )
  
  product: Product;
 
  @Column({type: 'json', nullable: true} )
  options: ProductOption;
  
  @OneToMany(
    () => Order,
    (order) => order.items
  )
  order: Order;
}