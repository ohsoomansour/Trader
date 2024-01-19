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
import * as AWS from 'aws-sdk';
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

const BUCKET_NAME = 'goodganglabs3';

@Controller('upload')
export class UploadController {
  constructor(private configService: ConfigService) {}

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
      const objectName = `${Date.now() + file.originalname}`;
      const regionName = 'ap-northeast-2';
      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read', //허용 범위
        })
        .promise(); //aws-sdk  사용하는 방법 정도라고 생각
      const url = `https://${BUCKET_NAME}.s3.${regionName}.amazonaws.com/${objectName}`;
      return { url };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
