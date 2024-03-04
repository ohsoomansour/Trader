/* eslint-disable prettier/prettier */
import { CoreOutput } from "src/common/dtos/output.dto";
import { OrderItem } from "../entities/order-item.entity";
import { Order } from "../entities/order.entity";

export class OrderInputDTO {
  dealId: number;
  seller:string;
  salesManager_mobile_phone:string;
  customer: string;
  address: string;
  items: OrderItem;
  total:number;
}

export class OrderOutputDTO extends CoreOutput {
  order: Order;

}
