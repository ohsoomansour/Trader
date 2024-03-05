/* eslint-disable prettier/prettier */
import { Order } from "../entities/order.entity";

export class TakeOrderOutput {
  takingOrders: Order[];
  totalPages: number;
  salesCount:number;
  totalSales:number;
}