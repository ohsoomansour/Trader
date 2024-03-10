/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

@Injectable()
export class PhoneValidationService {
  private readonly phoneUtil: PhoneNumberUtil;
  private logger = new Logger();
  constructor() {
    this.phoneUtil = PhoneNumberUtil.getInstance();
  }

  validatePhoneNumber(phoneNumber: string, regionCode: string = 'KR'): boolean {
    try {
      const number = this.phoneUtil.parseAndKeepRawInput(phoneNumber, regionCode);
      return this.phoneUtil.isValidNumber(number);
    } catch (error) {
      console.error('전화번호를 처리하는 중 오류가 발생했습니다.', error);
      return false;
    }
  }

  formatPhoneNumber(phoneNumber: string, format: PhoneNumberFormat, regionCode: string = 'KR'): string {
    try {
      const number = this.phoneUtil.parseAndKeepRawInput(phoneNumber, regionCode);
      return this.phoneUtil.format(number, format);
    } catch (error) {
      console.error('전화번호를 처리하는 중 오류가 발생했습니다.', error);
      return phoneNumber;
    }
  }
}