/* eslint-disable prettier/prettier */
import { booleanValue } from "aws-sdk/clients/finspace";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity} from "typeorm";

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

/**  
  * @Explain1 TypeORM은 '객체'에 대한 정의를 명확히 해줘야 한다.  options 객체, optionParts객체 
  *           즉, object[] 이런 타입의 정의는 적절하지 않다. 
  * @Explain2 *typeorm정의:  NodeJS에서 Object relational mapping
  **/
@Entity()
export class Product extends CoreEntity{
  @Column({nullable:true})
  name:string;

  @Column({nullable:true})
  price: number;

  @Column({nullable:true, type:'json'})
  options:options[];
  
  @Column({nullable: false})
  maintOpYN: boolean;

  @Column({nullable: true})
  maintenance_cost: number;

  @Column({nullable:true})
  description:string;
  /*
  @Column({nullable:true, type: 'bytea'})
  rb3D_glb : Buffer;  
  */
  @Column({nullable:true})
  productURL : string;

  
  
  

  

  
    
}