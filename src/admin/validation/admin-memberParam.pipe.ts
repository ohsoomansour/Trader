/* eslint-disable prettier/prettier */
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/* 
 * @param metadata :  Indicates whether argument is a body, query, param, or custom parameter
 * @param value :  argument before it is received by route handler method
*/
@Injectable()
export class MyParamPipe implements PipeTransform<number, number> {
  transform(value: number, metadata: ArgumentMetadata): number {
    // 여기에서 원하는 필터링 로직을 적용합니다.
    if (!value || value < 0 ) {
      throw new BadRequestException('파라미터는 0 이상이어야 합니다.');
    }
    return value;
  }
}