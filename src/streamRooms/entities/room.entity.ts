/* eslint-disable prettier/prettier */
import { CoreEntity } from "src/common/entites/core.entity";
import { Column, Entity } from "typeorm";

/* # 방주인이 촬영한 부분 동영상 업로드 & 영상 리스트  
  1. S3 사용  
   > AWS S3에 동영상 업로드 API  -> 업로드 컨트롤러, uploadVideo 함수 


  2. s3에 별도의 버킷을 만들고 mp4URL을 별도로 만들어서 관리
   > __ 버킷 -> recvMp4URL 
   <ReactPlayer
    className="react-player"
    url={recvMp4URL}
    >

*/



@Entity()
export class StreamingRoom extends CoreEntity {
  @Column()
  roomId: string;
  @Column()
  category: string;
  @Column()
  name:string;
  @Column()
  roomImg: string;


}
