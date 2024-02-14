import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entites/member.entity';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { Verification } from './entites/verification.entity';

//import { JwtService } from 'src/jwt/jwt.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Verification])],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [TypeOrmModule.forFeature([Member, Verification]), MemberService],
})
export class MemberModule {
  static forRoot: any;
}
