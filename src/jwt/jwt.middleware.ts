/* eslint-disable prettier/prettier */
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from './jwt.service';
import { MemberService } from 'src/member/member.service';
//import { InjectRepository } from '@nestjs/typeorm';
//import { Member } from 'src/member/entites/member.entity';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  //dependency Injection
  constructor(
    private readonly jwtService: JwtService,
    private readonly memberService: MemberService
    ){}
  private logger = new Logger('jwtMiddleware'); 
  
  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`MiddlewWare의 req.headers:`)
    console.log(req.headers);
    
    if('x-jwt' in req.headers){
    const token = req.headers['x-jwt']; 
    
    try {
      const decoded = this.jwtService.verify(token.toString())
      this.logger.log(`JWT MiddlewWare의 token의 decoded:`)
      console.log(decoded);// 예시: { id: 'osoomansour9@naver.com', iat: 1704768471 }
      
      if( typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
      const { member, ok } = await this.memberService.findById(decoded['id']); 
      this.logger.log(`JWT MiddlewWare의 token의 member 정보:`)
      console.log(member);
      //⭐미들웨어가 원하는 object를 바꿀수있다 >> request object를 모든  resolver에서 사용 할 수 있다 
       if(ok) {
        req['member'] = member;
       }
      }

    } catch (e) {}
    
    } 
    
    next();
  }
}
