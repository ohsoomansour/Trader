/* eslint-disable prettier/prettier */

export class optionParts{
  optPart_idx: string;
  part_name:string;
  price: number;
};

export class options{
  option_index : number;
  option_title : string;
  option_parts : optionParts[];
};

export class MakeADealInputDTO  {
  compa_name : string;
  compaBrand_ImgURL : string;
  mobile_phone : string;
  sellerId : string;
  salesManager_mobilephone : string;
  seller_address : string;
  name : string; 
  price : number;
  options : options[];
  maintOpYN: boolean;
  maintenance_cost : number;
  description : string;
  representative_prodURL : string;
  prod_URLS: string[];
}

