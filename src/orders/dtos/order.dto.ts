/* eslint-disable prettier/prettier */
import { CoreOutput } from "src/common/dtos/output.dto";
import { OrderItem } from "../entities/order-item.entity";

export class OrderInputDTO {
  dealId: number;
  customer: string;
  address: string;
  description:string;
  items: OrderItem;
}

export class OrderOutputDTO extends CoreOutput {}
