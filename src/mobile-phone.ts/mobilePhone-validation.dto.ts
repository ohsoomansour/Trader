/* eslint-disable prettier/prettier */
export class MobilePhoneValidationInputDTO{
 mobilePhone_number:string;
 regionCode:string;
}

export class MobilePhoneValidationOutputDTO{
  isValid:boolean;
  formattedNumber:string;
}