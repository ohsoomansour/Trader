/* eslint-disable prettier/prettier */
import { Body, Controller,  Logger, Post } from '@nestjs/common';
import { PhoneValidationService } from './mobilePhone-validation.service';
import { PhoneNumberFormat } from 'google-libphonenumber';
import { MobilePhoneValidationInputDTO, MobilePhoneValidationOutputDTO } from './mobilePhone-validation.dto';


@Controller('phones')
export class PhonesController {
  constructor(private readonly phoneValidationService: PhoneValidationService) {}
  private logger = new Logger();
  

  @Post('/validation')
  formatPhoneNumber(@Body() phoneInput:MobilePhoneValidationInputDTO ):MobilePhoneValidationOutputDTO {
    this.logger.log('m_phones Validation');
    const isValid = this.phoneValidationService.validatePhoneNumber(phoneInput.mobilePhone_number);
    const formattedNumber = this.phoneValidationService.formatPhoneNumber(phoneInput.mobilePhone_number, PhoneNumberFormat.NATIONAL, phoneInput.regionCode);
    this.logger.log('formattedNumber', formattedNumber)
    return { isValid, formattedNumber };
  }
  
}