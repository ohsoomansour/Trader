/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { PhonesController } from "./mobilePhone-validation.controller";
import { PhoneValidationService } from "./mobilePhone-validation.service";
@Module({
  imports: [],
  controllers:[PhonesController],
  providers:[PhoneValidationService]
})

export class PhoneValidationModule {}