/* eslint-disable prettier/prettier */
import { Order } from '../entities/order.entity';

export class GetOrderOutputDTO {
  myOrders: Order[];
  totalPages: number;
}