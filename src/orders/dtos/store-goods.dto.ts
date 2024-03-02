/* eslint-disable prettier/prettier */
export class Payment{
  price:number;   
  maintenanceYN:boolean;
  maintenance_cost:number;
  total:number; 
  
}
export class StoreGoodsInputDTO {
  dealId: string;
  customer:string;
  payment:Payment;
  
}

