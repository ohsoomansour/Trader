/* eslint-disable prettier/prettier */

import {  Controller, Post, Req} from '@nestjs/common';
import { GLBService } from './glb.service';
import { Request } from 'express';

//import { FileInterceptor } from '@nestjs/platform-express';
/*
    @UseInterceptors(FileInterceptor('glb'))
  async saveGLBFile(@UploadedFile() glb): Promise<string> {   

  #S3.getObject 
  https://honeystorage.tistory.com/238
*/

@Controller('glb')
export class GLBController {
  constructor(private readonly glbService: GLBService) {}
  
  @Post('save')
  async saveGLBFile(@Req() req: Request) {   
    // 가정: {type: 'Buffer', data: Array(36852336)} 형태의 데이터를 가진 객체
    //const glbDataObject = { type: 'Buffer', data: Array(36852336) };
    console.log('req:')
    console.log(req);
    try {
      //const result = await this.glbService.saveGLBFile(glb);
      //return result;
    } catch (error) {
      console.error('GLB 파일 저장 중 오류 발생:', error);
      //return 'GLB 파일 저장 중 오류 발생';
    }
  }
}