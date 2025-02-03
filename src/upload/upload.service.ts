import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as AWS from 'aws-sdk';
import { DelFileInputDTO } from "./dtos/del-file";
import { ProductService } from "src/product/product.service";


@Injectable()
export class UploadService {
  private readonly s3;
  private logger = new Logger('UploadService');

  constructor(
    private configService: ConfigService,
    private producService: ProductService,
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
    //const url : string = `https://${"d191a2uwhlebxo.cloudfront.net"}/${objectName}`  //클라우드 프론트 url
    return new Promise((resolve, reject) => {
      new AWS.S3().putObject(params, (err, data) => {
        if(err) reject(err);
        resolve(url);  // Promise<string>
      });
    });  
  }
/**
 * @서비스 : 나의 거래 정보에서 이미지 파일 삭제 서비스
 * @param : 각 파일의 이름 배열 
 * @doc참고 : https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/DeleteObjectCommand/ 
 * @blog참고 : https://velog.io/@wndbsgkr/NestJs%EC%97%90%EC%84%9C-S3%EC%97%90-%ED%8C%8C%EC%9D%BC%EC%9D%84-%EC%98%AC%EB%A0%A4%EB%B3%B4%EC%9E%90
 */


  async deleteImage(delFileInputDto:DelFileInputDTO) {
    try {
      this.logger.log('deleteImage');

      //aws에 삭제 
      var s3 = new AWS.S3();
      const arrImgs : string[] = [];
      arrImgs.push(delFileInputDto.imgToDel)
      arrImgs.map(async(file_name) => {
        const objectName = `${file_name}`;
        const params = {
          Bucket: process.env.BUCKET_NAME, 
          Key: objectName,  
        };
        await s3.deleteObject(params, (err, data) => {
          console.log(data, err)
        }).promise();
        
      });
      //DB에서 url 삭제
      //const dbURL = `https://d191a2uwhlebxo.cloudfront.net/${delFileInputDto.imgToDel}`
      if(delFileInputDto.code === 'r'){
        this.logger.log('del representatibve product');
        await this.producService.delRepresImg(delFileInputDto.productId);
      }else if(delFileInputDto.code === 'g'){
        // 대표 사진 제외 상품 사진 삭제 로직
        this.logger.log('del general product')
        await this.producService.delProdImg(delFileInputDto.productId, dbURL)
      }
    } catch (err) {
      console.log(`deleteImage service error!`);
      
    }
  }

}