/*#AWS S3 사용법
1. 설치 및 사용 의미 : 📃npm install aws-sdk
   > import * as AWS from "aws-sdk";   - 자체적으로 typescript definition이 함께 재공된다 
   > S3는 AWS의 storage service  
   > SDK: Software Development Kit

2. AWS 계정 및 키 생성과 설정 
  > 루트 계정/비번 > 별칭: ohsoomansour > 사용자 추가 > 사용자 이름: nestUpload 
  > ✅액세스 키 – 프로그래밍 방식 액세스     
    *AWS API, SDK에 대해 'access key' 및 'secret access key'를 활성화 = "AWS와 통신하는 서버를 연결 "
  > 기존 정책 직접 연결: 'S3검색' >  AmazonS3FullAccess > 권한 경계 없이 user 생성 
    ● 사용자 이름: nestUpload,
    ● AWS 엑세스 유형: 프로그래밍 방식 엑세스(엑세스 키 사용)
    ● 권한경계: 설정X 
  > ✅AWS_ACCESS_KEY  ✅AWS_ACCESS_SECRET_KEY (주의! 잊어버리면 새로 만들어 한다!)  

  3. 글로벌 구성 객체 사용하기
  📃글로벌 구성 설정:https://docs.aws.amazon.com/ko_kr/sdk-for-javascript/v2/developer-guide/global-config-object.html
  - AWS 전역 변수를 사용하여 'SDK의 클래스에 액세스'하고 개별 서비스와 상호 작용할 수 있습니다
    ● credentials:(필수) 서비스 및 리소스에 대한 액세스 권한을 결정하는 데 사용되는 인증 자격 증명을 지정
    ● region: (필수)서비스에 대한 요청이 이루어질 리전을 지정합니다. 
  📃https://docs.aws.amazon.com/ko_kr/sdk-for-javascript/v2/developer-guide/setting-region.html

  버킷 생성: 
   > 아시아 태평양(서울): ap-northeast-2
   > Amazon S3 관리형 키(SSE-S3)를 사용한 서버 측 암호화 선택
  */
/** 
 @ConfigService설명 : Get a configuration value (either custom configuration or process environment variable)
 @Multer : NestJS에서 파일 업로드를 처리하기 위해서 multer 미들웨어를 사용, 주로 파일 업로드에 사용되는 multipart/form-data를 처리하기 위한 
           middleware

*/
import * as AWS from 'aws-sdk';
import {
  Body,
  Controller,
  Delete,
  Logger,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { DelFileInputDTO } from './dtos/del-file';

const BUCKET_NAME = 'goodganglabs3';

@Controller('upload')
export class UploadController {
  private logger = new Logger('UploadController');

  constructor(
    private configService: ConfigService,
    private uploadService: UploadService,
  ) {}
 /** 
   * @Author osooman
   * @Param 인터셉터를 통해서 '파일'을 가져온다.
   * @Function AWS S3 bucket에 업로드하고 url을 생성한다. 그리고 cloudfront를 사용하여 origin server 
   * @return: url
   * @Explain 회사 이미지 및 로봇 상품 동영상 파일을 업로드할 때 uploadFile 함수가 실행된다.
   */
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    console.log(file);
    AWS.config.update({
      region: 'ap-northeast-2',
      credentials: {
        // get an environment variable
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_ACCESS_SECRET_KEY'),
      },
    });
    try {
      //원래는 file.originalname 
      const objectName = `${'_'  + file.originalname}`; // ex) _appleLOGO.png
      const regionName = 'ap-northeast-2';
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read', //허용 범위
        })
        .promise(); //aws-sdk  사용하는 방법 정도라고 생각
      // 오리진 서버 -> const url = `https://${BUCKET_NAME}.s3.${regionName}.amazonaws.com/${objectName}`;
      const url = `https://${"d191a2uwhlebxo.cloudfront.net"}/${objectName}`  //클라우드 프론트 
    
      return { url };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  /** 
   * @Author osooman
   * @Param 인터셉터를 통해서 '파일들'을 가져온다.
   * @Function AWS S3 bucket에 업로드하고 url을 생성한다. 그리고 cloudfront를 사용하여 origin server 
   * @return: 다수의 cloudfront url들  
   * @Explain 회사 이미지 및 로봇 상품 동영상 파일을 업로드할 때 uploadFile 함수가 실행된다.
   * @추가지식 : FilesInterceptor('files', 10),  @UploadedFiles()
   */
  @Post('/multi_files')
  @UseInterceptors(FilesInterceptor('files', 10))  // 최대 파일 수:10
  async uploadFiles(@UploadedFiles() files : Express.Multer.File[]): Promise<string[]> {
    console.log('/multi_files files', files);
    const imgsUrl:string[] = [];
    
    await Promise.all(
      files.map(async( file : Express.Multer.File ) => {
      const url = await this.uploadService.uploadImages(file);
      imgsUrl.push(url);
      })

    )
    return imgsUrl;

  }

  /** 
   * @Author osooman
   * @Param : Bucket 이름과 key (object 이름)
   *  - 프론트 : [파일의 name1, 파일의 name2 ... ] -> _기준으로 잘라서 -> key / BUCKET : 이 핸들러에서 지정 
   * @Function : 넘겨 받은 해당 파일의 오브젝트를 삭제한다. 
   * @return: 
   * @Explain : 자기 상품 관리 페이지, mydeal : 서버 delImgs 핸들러 -> aws s3 버킷에서 삭제 
   * @추가지식 : FilesInterceptor('files', 10),  @UploadedFiles()
   */

  @Post('/del')
  async deleteFile(@Body() delFileInputDto : DelFileInputDTO)  {
    try {
      this.logger.log(delFileInputDto.file_names)
      return await this.uploadService.deleteImage(delFileInputDto.file_names);
      
      
    } catch (err){
      console.error(err);
    }
    
  }

}
