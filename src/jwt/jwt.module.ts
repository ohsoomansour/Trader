import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interface';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MemberService } from 'src/member/member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/member/entites/member.entity';
import { Verification } from 'src/member/entites/verification.entity';
/*#Dynmic Module
 1. jwt모듈을 @Global로 만들어줘서 전역으로 설정  
 2. options: PRIVATE_KEY는 어디서? 
    > secret key generator: https://randomkeygen.com/
    >  256-bit key requirement.: f9UI7jGjBXcTtuuJMuBDxejFxLHMaEwa
    > npm i dotenv > process.env.PRIVATE_KEY
*/
@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      imports: [TypeOrmModule.forFeature([Member, Verification])],
      module: JwtModule,
      exports: [JwtService], //#MemberService에서 사용
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },

        JwtService,
        MemberService,
      ],
    };
  }
}
