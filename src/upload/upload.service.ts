import { Body, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from 'aws-sdk';
import { DeleteObjectCommand, S3, S3Client } from "@aws-sdk/client-s3";




@Injectable()
export class UploadService {
  private readonly s3;
  private logger = new Logger('UploadService');

  constructor(
    private configService: ConfigService
  ) {
    /**/
    AWS.config.update({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'), 
        secretAccessKey: this.configService.get('AWS_ACCESS_SECRET_KEY')
      },
    });
    
    this.s3 = new AWS.S3();
  }
  async uploadImages(file : Express.Multer.File): Promise<string> {
    const objectName = `_${Date.now()}${file.originalname}`;
    const params={
      Bucket: process.env.BUCKET_NAME,
      ACL : 'public-read', 
      Key: objectName,
      Body: file.buffer
    };
    


    const url : string = `https://${"d191a2uwhlebxo.cloudfront.net"}/${objectName}`  //클라우드 프론트 url
    return new Promise((resolve, reject) => {
      new AWS.S3().putObject(params, (err, data) => {
        if(err) reject(err);
        resolve(url);  // Promise<string>
      });
    });  
  }
/**
 * @서비스 : 파일 삭제 서비스
 * @param : 각 파일의 이름 배열 
 * @doc참고 : https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/DeleteObjectCommand/ 
 * @blog참고 : https://velog.io/@wndbsgkr/NestJs%EC%97%90%EC%84%9C-S3%EC%97%90-%ED%8C%8C%EC%9D%BC%EC%9D%84-%EC%98%AC%EB%A0%A4%EB%B3%B4%EC%9E%90
 */

  /*
    var params = {
        Bucket : bucket,
        Key : video
    };
    try {
        await s3.deleteObject(params,function(err,data){
            if (err)    console.log(err,err.stack);
            else        console.log("Response:",data);
        }).promise();
    } catch (e) {}
  */

  async deleteImage(file_names:string[])  {
    try {
      this.logger.log('deleteImage')
      this.logger.log(file_names)  //undefined 
      //대책 방법 : new AWS.S3().deleteObject()

      
      var s3 = new AWS.S3();
      
      file_names.map(async(file_name) => {
        const objectName = `_${file_name}`;
        const params = {
          Bucket: process.env.BUCKET_NAME, 
          Key: objectName,  
        };
        await s3.deleteObject(params, (err, data) => {
          console.log(data, err)
        }).promise();
        
      })

      /*
      const deletePromises = file_names.map(async(file_name) => {
        const key = `${'_'+ file_name}`
        const res = await new S3Client({
          region: 'ap-northeast-2',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
          },
          
        }).send( new DeleteObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key }))
        this.logger.log(res);
      })
     return Promise.all(deletePromises);
    */
    } catch (err) {
      console.log(`deleteImage service error!`);
      
    }
  }

}