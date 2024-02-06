/* eslint-disable prettier/prettier */
/*#Buffer파일을 glb파일로 변환하는 방법
 1. npm : 
  

*/
import { Injectable } from "@nestjs/common";
import * as fs from 'fs/promises';

@Injectable()
export class GLBService {
  async saveGLBFile(glbDataObject: { type: string, data: number[] }): Promise<void> {
    try {
      const uint8Array = new Uint8Array(glbDataObject.data);
      const glbBuffer = Buffer.from(uint8Array);

      // GLB 파일 비동기적으로 저장
      await fs.writeFile('/public/cuteRobot.glb', glbBuffer, 'binary');
      //return 'GLB 파일이 성공적으로 저장되었습니다.';
    } catch (error) {
      console.error('GLB 파일 저장 중 오류 발생:', error);
      throw new Error('GLB 파일 저장 중 오류 발생');
    }
  }
}