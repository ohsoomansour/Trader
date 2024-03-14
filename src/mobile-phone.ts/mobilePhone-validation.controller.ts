/* eslint-disable prettier/prettier */
import { Body, Controller,  Logger, Post } from '@nestjs/common';
import { PhoneValidationService } from './mobilePhone-validation.service';
import { PhoneNumberFormat } from 'google-libphonenumber';
import { MobilePhoneValidationInputDTO, MobilePhoneValidationOutputDTO } from './mobilePhone-validation.dto';


@Controller('phones')
export class PhonesController {
  constructor(private readonly phoneValidationService: PhoneValidationService) {}
  private logger = new Logger();
  
  /*@Author: osooman 
  *@Param: 휴대폰 번호와 국가 코드 (MobilePhoneValidationInputDTO 참조)
  *@Function: 폰 번호의 유효성 확인과 010-xxxx-xxxx 포맷 값 생성 
  *@return: isValid, formattedNumber 
  *@Explain: '국가코드'와 '휴대폰 번호'를 입력하면 국가 코드에 맞는 휴대폰 번호의 '유효성 확인 결과'와 선택한 국가에 적합한 형식의 번호 값을 반환
  */
  @Post('/validation')
  formatPhoneNumber(@Body() phoneInput:MobilePhoneValidationInputDTO ):MobilePhoneValidationOutputDTO {
    this.logger.log('m_phones Validation');
    const isValid = this.phoneValidationService.validatePhoneNumber(phoneInput.mobilePhone_number);
    const formattedNumber = this.phoneValidationService.formatPhoneNumber(phoneInput.mobilePhone_number, PhoneNumberFormat.NATIONAL, phoneInput.regionCode);
    this.logger.log('formattedNumber', formattedNumber)
    return { isValid, formattedNumber };
  }
  
}