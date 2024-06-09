/* eslint-disable prettier/prettier */

/* priavate only members: Repository<member> "member엔티티를 타입"
  1.Repository 만들어서 생성자 함수에 주입 시켜줘야됨
  2. const newMember = members.create(CreateMemberInput) 
     > 비즈니스 로직을 통해 Creates a new newMember entity instance
     > await this.members.save(newMember)
     > 성공하면 return "멤버가 만들어 짐"
     > 실패하면 return "멤버 생성 실패" 
  +------------------------------------------------ TypeORM --------------------------------------------+
  | 1.create 메서드: Creates a new entity instance and                                                   |            
  |    copies all entity properties from this object into a new entity.                                  |
  |    Note that it copies only properties that are present in entity schema.                            | 
  |  이해: this object는 this.members를 가리키는 것으로 추정, 모든 엔티티 프로퍼티를 새 인티티로 복사를 한다.  |       
  |       entity properties는 entity 스키마의 즉, DB의 테이블 컬럼들과 일치한다.                            |
  +-----------------------------------------------------------------------------------------------------+

  3. 패스워드 어떻게 할 지
    
    #Hashing Passwords
    3-1)What is an Entity Listener? 📄https://typeorm.io/listeners-and-subscribers
      - Any of your entities can have methods with custom logic that listen to specific entity events.
    
    3-2)@BeforeInsert: You can define a method with any name in entity and mark it with @BeforeInsert 
    and TypeORM will call it before the entity is inserted using repository/manager save.
    (※Entity 안의 내용 참고)

    3-3) bcrypt 📄https://www.npmjs.com/package/bcrypt 
      > 설치: npm i bcrypt > npm i @types/bcrypt --dev-only
      > 임포트: import * as bcrypt from "bcrypt"; 
      > 에러 해결 : stack overflow 참조
      npm install node-gyp -g
      npm install bcrypt -g
      npm install bcrypt --save

    - 개념: hash하고 & hash확인에 활용
    - npm > To hash a password: (중요부분)
      🔹saltOrRound: salt를 몇 번 돌릴거냐는 뜻. default: 10, 놆을 수록 암호화가 강력해지지만 속도는 느려짐
    - [users.service.ts]에서 await this.users.save(this.users.create({email, password, role}))
      > this.users.create({email, password, role}) (인스턴스를 이미 가지고 있음) 
      > await bcrypt.hash(this.password, 10);
      🔹InternalServerErrorException(): service파일 내부에서 catch한다
        >의미해석: (DB 저장하기 전에 서버에서 에러 발생 ) > 🚨{ok:false, error: "Couldn't create account" }
  
  5.jwt 또는 
  
  6.session확인 : https://lts0606.tistory.com/623 참고
    npm i express-session
    npm i -D @types/express-session
    @All 데코레이터 의미: 
*/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { CreateMemberInputDTO, CreateMemberOutputDTO } from './dtos/regMember.dto';
import { LoginInputDTO, MemberRole } from './dtos/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { MemberProfileOutput } from './dtos/member.profile.dto';
import { CupdateMemberInfoDTO, CupdateMemberOutputDTO } from './dtos/updateMember.dto';
import { Verification } from './entities/verification.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly members: Repository<Member>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    
  ) {}
  private readonly logger  = new Logger();
  /*
   * @Author : OSOOMAN
   * @Date : 2023.12.21
   * @Function : 회원가입
   * @Parm : CreateMemberInput (DTO)
   * @Return : object
   * @Explain : 고객이 아이디, 비밀번호, 주소를 입력하여 회원가입을 신청
   */
  async signUpForMembership({
    userId,
    password,
    name,
    address,
    mobile_phone,
    memberRole,
  }: CreateMemberInputDTO): Promise<CreateMemberOutputDTO> {
    try {
      //이 아이디가 존재 하는 지 검사 필요
      const idExist = await this.members.findOne({ where: { userId } });
      if (idExist) {
        return { ok: false, error: 'The ID already exists' };
      }

      const user = await this.members.save(
        this.members.create({
          userId,
          password,
          name,
          address,
          mobile_phone,
          memberRole,
        }),
      );
      await this.verification.save(
        this.verification.create({
          member: user,
        }),
      );
      return { ok: true };
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'You coud not sign up for Membership',
      };
    }
  }
  /*
   * @Author : OSOOMAN
   * @Date : 2023.12.23
   * @Function : 회원 로그인
   * @Parm : LoginInput(DTO)
   * @Return : ok:true 또는 false와 error를 담은 object
   * @Explain : 세션을 가지고 로그인을 한다.
   * @개선 필요🔺: 불필요한 세션을 줄이기 위한 방법은 ?
   */
  //: Promise<LoginOutputDTO>
  async login({ userId, password }: LoginInputDTO) {
    try {
      /*#DOC: findOne(id) signature was dropped. Use following syntax instead:
        findOne, findOneOrFail, find, count, findAndCount methods now only accept FindOptions as parameter, e.g.: 
         
      */
      const member = await this.members.findOne({
        where: { userId:userId },
        select: ['userId', 'password'], //password를 가져오라고 명시
      });
      this.logger.log('logIn');

      if (!member) {
        return {
          ok: false,
          error: 'Member do not exist',
        };
      }

      const confirmPw = await member.checkingPw(password);
      if (!confirmPw) {
        return {
          ok: false,
          error: 'The password is wrong',
        };
      }
      const token = this.jwtService.sign(member.userId);
      return {
        ok: true,
        token,
      };
    } catch (e) {
      console.error(e);
    }
  }
  //주의: 리턴 타입 Promise<memberType>에서 memberType(DTO)로 하면 계속 Promise { <pending> }
  async getMemberRole({ userId }: LoginInputDTO): Promise<MemberRole> {
    try {
      const member = await this.members.findOne({
        where: { userId },
      });
      //console.log(member);
      if (member) {
        return {
          memberRole: member.memberRole,
        };
      } else {
        return {
          memberRole: '멤버 타입을 알 수 없습니다',
        };
      }
    } catch (e) {
      console.error(e);
    }
  }

  async findById(userId: string): Promise<MemberProfileOutput> {
    try {
      const user = await this.members.findOne({
        where: { userId: userId },
        cache: true,
      });

      return {
        ok: true,
        member: user,
      };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }
  async editProfile(
    id: number,
    { userId, password, address, mobile_phone }: CupdateMemberInfoDTO,
  ): Promise<CupdateMemberOutputDTO> {

    //pw, address 경우의 수 pw / address / pw+address의 경우 
    try {
      const user = await this.members.findOne({
        where: { id },
      });
      
      if (userId) {
        user.userId = userId;
        user.verified = false;
      /*@Explain: member를 삭제, 그러나! OneToOne 관계의 Member entity의 해당 id를 삭제하지 않는다 "a primitive operation without cascades"
         - 이해: 🌟해당 id의 member는 Update라고 인지된다. 따라서 pass  
      */
        await this.verification.delete({ member: { id: user.id } });
        await this.verification.save(
          this.verification.create({ member: user }),
        );
      }
      this.logger.log('editProfile user의 패스워드')
      console.log(user.password);
      
      if(password){
        const member = await this.members.findOne({
          where: { userId:userId },
          select: ['userId', 'password'], //password를 가져오라고 명시
        });
        const isSamePw = await member.checkingPw(password);
        if(isSamePw){
          return {
            ok:false,
            error: '기존 패스워드와 같습니다!'
          }
        } else {
          user.password = password;
        }

      }
      if(address){
        user.address = address;
      }
      if(mobile_phone){
        user.mobile_phone = mobile_phone;
      }
      await this.members.save(user)
      return {
        ok:true,
      }
    } catch (e) {
      console.error(e);
    }
  }

  /***
   * @Author : OSOOMAN
   * @Date : 2024.1.6
   * @Function : (마지막 로그인 시점부터?) 휴면 상태 추적 및 설정
   * @Parm : user의 email 아이디 
   * @Return : -
   * @Explain : 일정 시간 이상이 지나면 휴면 계정으로 전환하는 비즈니스 로직
     - createBuilder 사용
  */
  async trackUserActivity(userId: string): Promise<void> {
    // 사용자의 활동을 추적하고 필요에 따라 휴면 상태로 설정
    const user = await this.members.findOne({ where: { userId: userId } });
    const now  = new Date();
    const years = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const secs = now.getSeconds();
    if (user) {
      
      user.lastActivityAt = `${years}년 ${month+1}월 ${day}일 ${hours+9}:${minutes}:${secs}`;
      await this.members.save(user);
    }
  }

  async confrimPrevPw({userId, password}: CupdateMemberInfoDTO): Promise<boolean>{
    // 비번 푼 것이 같다면ㅇ
    try {
      const member = await this.members.findOne({
        where: { userId:userId },
        select: ['userId', 'password']
      });
      const result = await member.checkingPw(password)
      this.logger.log("checkingResult:"+result)
      return result;
    } catch(e){
      console.error(e);
    }

  }

  async activateUser(userId: string): Promise<Member | undefined> {
    const dormantMember = await this.members.findOneBy({
      userId: userId,
      isDormant: true, //휴면 상태
    });
    if (dormantMember) {
      dormantMember.isDormant = false; //휴면상태 -> 활성화
      await this.members.save(dormantMember);
    }

    return dormantMember;
  }
}