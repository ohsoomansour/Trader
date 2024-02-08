/* eslint-disable prettier/prettier */
/*# 파일 다운로드 로직 
  #S3.getObject 
  - 참고: https://honeystorage.tistory.com/238
  
  */
import * as AWS from 'aws-sdk';
import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

   
   const BUCKET_NAME = 'goodganglabs3';
   
@Controller('download')
export class DownloadController {
  constructor(private configService: ConfigService) {}

  @Post('/glb')
  
  async getObjectFromS3(@Body() {objTest}) {
    console.log(objTest);
    //credentials 설정
    AWS.config.update({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_ACCESS_SECRET_KEY'),
      },
    });
    try {
      //const objectTest = "1706965081463cuteRobot.glb"; 
      const result = 
        await new AWS.S3()
        .getObject({
          Bucket: BUCKET_NAME,
          Key: objTest,
        }, (err, data) => {
          if(err){
            console.error(err);
          } else {
            //data:불러온 데이터는 JSON 형태
            console.log(data);
          }
        })
        .promise();  
    console.log('result:')
    console.log(result) 
      
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

}
   