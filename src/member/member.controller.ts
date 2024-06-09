import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  Logger,
  Param,
  Patch,
  UseGuards,
  Body,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { Request, Response } from 'express';
import { Member } from './entities/member.entity';
import { Role } from 'src/auth/role.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { CupdateMemberInfoDTO } from './dtos/updateMember.dto';
import { CreateMemberOutputDTO } from './dtos/regMember.dto';
import { CheckingPwDTO } from './dtos/checkingPw.dto';

//import { LoginOutputDTO } from './dtos/login.dto';
/*#SESSION  COOKIE란? 
 session({secret: 'SESSION_ID_SM' - "This is the secret used to sign the session cookie" })
  [세션의 동작 방식]
 > 클라이언트가 서버에 접속 시 세션 ID를 발급 받음
 > 클라이언트는 세션 ID에 대해 '쿠키를 사용해서 저장'하고 가지고 있음
  Set-Cookie : 	connect.sid=s%3AK6CjethYEn9sKy9BRmCHpG6AinvnrdEV.Gmrbjg77FmBlTJ7bc8hZCbHi7cZgd0fTK5x8akXh56U; 
                Path=/; Expires=Sat, 23 Dec 2023 08:51:23 GMT; 
                HttpOnly
 > 클라리언트는 서버에 요청할 때, 이 쿠키의 세션 ID를 같이 서버에 전달해서 요청
 > 서버는 세션 ID를 전달 받아서 별다른 작업없이 세션 ID로 세션에 있는 클라언트 정보를 가져와서 사용
 > 클라이언트 정보를 가지고 서버 요청을 처리하여 클라이언트에게 응답 
  [세션 구현 방법은 2가지]
  1. middleware를 통한 구현 
  2. Global형태로 구현 -> 
     app.use(
    session({
      secret: 'SESSION_ID_SM',
      resave: false, 
      saveUninitialized: false, 
    }),
  );
  */
@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {
    this.memberService = memberService;
  }
  private logger = new Logger('memberController');

  /**
   * @Author : OSOOMAN
   * @Date : 2023.12.21
   * @Function : 멤버 등록 함수
   * @Parm : CreateMemberInput(DTO)
   * @Return : object
   * @Explain : 클라인트에서 회원가입 POST REQUEST에 대한 처리
   */
  @Post('/join') //, @Res() res: Response
  async signUpForMembership(
    @Req() req: Request,
  ): Promise<CreateMemberOutputDTO> {
    try {
      this.logger.log('member/join:');
      //프론트에서 redirect 여부만 확인, history로 이동 따라서 배포 서버에서는 정상적으로 이동
      return this.memberService.signUpForMembership(req.body);
    } catch {
      console.error();
      this.logger.error('고객님은 회원가입을 할 수 없습니다. ');
      this.logger.debug('1.비즈니스 로직에서 { ok: false } 확인하세요.');
      this.logger.debug('2.아이디와 비밀번호를 확인하세요.');
    }
  }

  /**
  * @Author : OSOOMAN
  * @Date : 2023.12.23
  * @Function : 로그인 후 세션 설정 및 계정 활동 트래킹
  * @Parm : Request의 JSON BODY
  * @Return : 회원의 홈으로 이동 또는 에러
  * @Explain : 로그인 후 '세션 만료 시간 60초'를 확인하고 '계정 활동 상태를 트래킹하는 기능'을 추가한다.
    - 사용법: 
    REST API Tool(Insomnia등)을 통한 예시: 
    JSON  { "userId" : "osoomansour9@naver.com", "password" : "osoomansour9"  }
  */

  //로그인 버튼을 누르면 홈으로 이동
  @Post('/login')
  @Role(['any'])
  @UseGuards(AuthGuard)
  async logIn(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const result = await this.memberService.login(req.body);

      if (result.ok) {
        /*#세션 설정
        const session: any = req.session;
        session.token = result.token;
        session.user = req.body.userId; 
        const memberRole = await this.memberService.getMemberRole(req.body);
        session.memberRole = memberRole;
        session.sessionID = 'osm';
        session.cookie.maxAge = 5 * 1000 * 60; //만료 시간 : 5분
        session.cookie.httpOnly = true;
        session.cookie.secure = true;
        this.logger.log(`${session.user} 회원님이 로그인이 하였습니다.`);
        console.log(session);*/
        //#로그인 후 활동 추적
        await this.memberService.trackUserActivity(req.body.userId);

        res.status(HttpStatus.OK).send(result);
      }
    } catch (e) {
      console.error(e);
      this.logger.error(
        'this.memberService.login의 반환하는 result.ok 값이 true가 아닙니다.',
      );
      this.logger.debug('로그인 아이디와 비밀번호를 확인하세요!');
    }
  }
  /**
   * @Author : OSOOMAN
   * @Date : 2024.1.17
   * @Function : 유저의 정보를 가져온다.
   * @Parm : jwt middleware에서 넘겨 받은 request
   * @Return : jwt토큰을 통해 디코딩된 나의 대한 정보 값을 반환
   * @Explain : Who am i?
   */
  @Role(['any'])
  @Get('/getmyinfo')
  async getMyInfo(@Req() req: Request): Promise<Member> {
    try {
      const member = req['member'];
      return member;
    } catch (e) {
      console.error(e);
      this.logger.error('나의 대한 정보가 업습니다.');
      this.logger.debug('header에 x-jwt 값을 확인하세요!');
    }
  }
  /**
   * @Author : OSOOMAN
   * @Date : 2024.6.9
   * @Function : 비밀번호 중복 확인
   * @Param : 기존 비밀번호
   * @Return : boolean 값 - true 이면 기존 패스워드랑 같고 / 그렇지 않으면 패스워드가 다름
   * @Explain :
   */
  @Role(['any'])
  @Post('/confirmPrevPw')
  async confirmPrevPassword(@Req() req: Request): Promise<CheckingPwDTO> {
    try {
      const result = await this.memberService.confrimPrevPw(req.body);
      return {
        ok: result,
      };
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * @Author : OSOOMAN
   * @Date : 2024.1.17
   * @Function : 사용자 정보 변경하는 함수
   * @Parm : CupdateMemberInfo(email, password, address)
   * @Return : 개인 정보가 변경된 멤버
   * @Explain : 회원가입 후 사용자가 변경을 원하는 아이디, 비밀번호, 주소로 업데이트한다.
   */
  @Role(['any'])
  @Patch('/update/:id')
  async editProfile(
    @Param('id') id: number,
    @Body() editInfo: CupdateMemberInfoDTO,
  ) {
    try {
      const user = await this.memberService.editProfile(id, editInfo);
      return user;
    } catch (e) {
      console.error(e);
      this.logger.error('나의 프로필을 수정할 수 없습니다. ');
      this.logger.debug('파라미터 id 값 또는 수정 값을 확인하세요! ');
    }
  }

  /**
   * @Author : OSOOMAN
   * @Date : 2024.1.6
   * @Function : 계정의 상태를 활성화하는 함수
   * @Parm : 문자열 타입의 사용자 계정
   * @Return : 활성화된 상태의 회원을 반환
   * @Explain : id파라미터를 통해서 비활성화 상태에서 다시 활성화 상태로 업데이트를 한다.     
      - 사용법: 
      [PATCH] http://localhost:3000/member/activate/client@naver.com

   */
  @Patch('activate/:userid')
  async activateUser(@Param('userid') id: string): Promise<Member | undefined> {
    try {
      const activatedUser = await this.memberService.activateUser(id);
      return activatedUser;
    } catch (e) {
      this.logger.error('사용자의 계정을 활성화할 수 없습니다.');
      this.logger.debug('parameter userid 값을 확인하세요.');
    }
  }

  /**
   * @Author : OSOOMAN
   * @Date : 2023.12.23
   * @Function : 세션 확인(개발 용도)
   * @Parm : request, response
   * @Return : 없음(Preview 참조)
   * @Explain : 로그인 후 세션 만료 기간을 테스트하고 세션 유지 확인
   */
  @Get('/checkingSession')
  showSession(@Req() req: Request, @Res() res: Response) {
    const session: any = req.session;
    console.log(session);
    res.status(HttpStatus.OK).send({ Session: session });
  }
}
