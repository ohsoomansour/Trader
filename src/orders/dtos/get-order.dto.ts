/* eslint-disable prettier/prettier */
import { Order } from '../entities/order.entity';


export class getOrderOutputDTO {
  myOrders: Order[];
  totalPages: number;
}