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
  Header,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { Request, Response } from 'express';
import { Member } from './entites/member.entity';
import { Role } from 'src/auth/role.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { CupdateMemberInfo } from './dtos/updateMember.dto';
import { LoginOutput } from './dtos/login.dto';
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

  /*
   * @Author : OSOOMAN
   * @Date : 2024.1.7
   * @Function :
   * @Parm :
   * @Return :
   * @Explain :
   */
  @Get('/home')
  goHome() {
    return 'Welcom back to Member Home';
  }
  /*
   * @Author : OSOOMAN
   * @Date : 2023.12.21
   * @Function : 멤버 등록 함수
   * @Parm : CreateMemberInput(DTO)
   * @Return : object
   * @Explain : 클라인트에서 회원가입 POST REQUEST에 대한 처리
   */
  @Post('/join')
  signUpForMembership(@Req() req: Request, @Res() res: Response) {
    try {
      console.log('join에 들어오나');
      this.memberService.signUpForMembership(req.body);
      return res.redirect('http://localhost:3001/');
    } catch {
      console.error();
    }
  }

  /*
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
  @Header('Access-Control-Allow-Origin', '*')
  @UseGuards(AuthGuard)
  async logIn(
    //#주의 사항: @Body 또는 아래 @Req req 둘 중 하나만 써야된다
    //@Body() loginInfo,
    @Req() req: Request,
    //@Res() res: Response,
  ): Promise<LoginOutput> {
    try {
      console.log(req.body); // {} & 다른 아이디가 남아있어 member entity 업데이트가 안되는 것으로 보임
      const result = await this.memberService.login(req.body);
      this.logger.log(`login reuslt token`);
      console.log(result);
      if (result.ok) {
        //#세션 설정
        const session: any = req.session;
        session.token = result.token;
        session.user = req.body.userId; //사용자가 정의한 임의의 지정 값2
        const memberRole = await this.memberService.getMemberRole(req.body);
        session.memberRole = memberRole;
        this.logger.log(`유저의 Role은 ${session.memberRole.memberRole}`);
        session.cookie.maxAge = 5 * 1000 * 60; //만료 시간 : 5분
        this.logger.log(`${session.user} 회원님이 로그인이 하였습니다.`);
        this.logger.log(`logIn에서 세션을 확인:`);
        //#로그인 후 활동 추적
        await this.memberService.trackUserActivity(req.body.userId);
        //res.redirect('http://localhost:3001/');
        return result;
      }
    } catch (e) {
      console.error(e);
      this.logger.error(
        `this.memberService.login의 반환하는 result.ok 값이 true가 아닙니다.`,
      );
      this.logger.debug(`로그인 아이디와 비밀번호를 확인하세요!`);
    }
  }

  @Role(['any'])
  @Get('/getmyinfo')
  @Header('Access-Control-Allow-Origin', '*')
  async getMyInfo(@Req() req: Request): Promise<Member> {
    try {
      const member = req['member'];
      this.logger.log('getMyInfo 경로의 member값:');
      console.log(member);
      return member;
    } catch (e) {
      console.error(e);
    }
  }

  /*
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
    @Body() editInfo: CupdateMemberInfo,
  ) {
    this.logger.log('update/id에 id는 뭐지?');
    console.log(id);
    try {
      const user = await this.memberService.editProfile(id, editInfo);
      this.logger.log('Client의 editInfo:');
      console.log(user);
      return user;
    } catch (e) {
      console.error(e);
    }
  }

  /*
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
    const activatedUser = await this.memberService.activateUser(id);
    return activatedUser;
  }

  /*
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
