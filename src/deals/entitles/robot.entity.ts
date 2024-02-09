/* eslint-disable prettier/prettier */

import { CoreEntity } from "src/common/entites/core.entity";
import { Column, Entity} from "typeorm";

/*#glb파일을 어디에 저장?
1. s3? rb.glb url을 useLoader에서 사용이 가능한 지 확인이 필요하다. 
 > const gltf = useLoader(GLTFLoader, 'Robot_MODEL_URL');

*/
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