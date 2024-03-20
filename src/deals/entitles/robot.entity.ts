/* eslint-disable prettier/prettier */
import { CoreEntity } from "src/common/entites/core.entity";
import { Column, Entity} from "typeorm";

@Entity()
export class Robot extends CoreEntity{
  @Column({nullable:true})
  name:string;

  @Column({nullable:true})
  price: number;

  @Column({nullable: true})
  maintenance_cost: number;

  @Column({nullable:true})
  description:string;
  /*
  @Column({nullable:true, type: 'bytea'})
  rb3D_glb : Buffer;  
  */
  @Column({nullable:true})
  rbURL : string;

  
  
  

  

  
    
}