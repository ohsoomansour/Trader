import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { MyParamPipe } from './validation/admin-memberParam.pipe';
import { Role } from 'src/auth/role.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { AupdateMemberInfoDTO } from 'src/member/dtos/updateMember.dto';
/* ******************************* 🚨route 주의사항 ********************************* 
  if)요청: http://localhost:3000/admin/search?test 의 경우
  @Get(':id')
  getOne(@Param('id') memberId) {
    return `This will return one member with the id: ${memberId}`;
  }

  @Get('search')
  searchMember() {
    return 'here someone';
  }
  -> 라우트 매핑 에러 인식 과정: NestJS는 id가 search라가 인식한다.
  ->  This will return one member with the id: test  "/search를 타지 않고 /:id를 타버림  "
  -> 해결책: search가 위 :id가 아래로 변경을 하면 정상적으로 
  *********************************************************************************/
@Controller('admin')
export class AdminController {
  //의존성 주입
  constructor(private adminService: AdminService) {
    this.adminService = adminService;
  }
  private logger = new Logger('admin');
  /*
   * @Author : OSOOMAN
   * @Date : 2024.1.5
   * @Function : 멤버 전체를 조회
   * @Parm : -
   * @Return : 회원 전체 리스트
   * @Explain : admin 타입의 관리자가 회원 리스트를 조회
      - 사용법: Headers에 key=x-jwt를 입력하고 로그인 멤버가 memberRole이 'admin' 즉 관리자의 경우에만 회원들의 정보들을 얻을 수 있다. 
      - REST API Tool(Insomnia등)을 통한 예시: 
        Headers: 'x-jwt'='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im9zb29tYW5zb3VyOUBuYXZlci5jb20iLCJpYXQiOjE3MDQ4MDAzNzR9.unlim5FzgbpDFaN1CSkLSeT-u2ccjxta67lrtg4cAlM'
        URL PREVIEW: http://localhost:3000/admin/members
      - 주의사항: 로그인 후 반환한 jwt를 사용해야 하며 refresh 후 사용하면 안된다.
                 다시 로그인 후 새로운 토큰을 발급받고 해야된다.
        */
  @Get('/members')
  @Role(['admin'])
  @UseGuards(AuthGuard)
  async getMembers(@Res() res: Response) {
    //#AuthGuard로 확인하는 방법
    const members = await this.adminService.getAllmembers();
    return res.status(200).send(members);
  }

  /*
   * @Author : OSOOMAN
   * @Date : 2024.1.5
   * @Function : 회원 1명을 검색하는 함수
   * @Parm : '고객의 이름'을 검색
   * @Return : 검색 되기를 원하는 회원을 반환
   * @Explain : 
     - 간단한 사용법: Headers에 key=x-jwt value= jwt 값 입력 후 JSON바디에 아이디/비밀번호 
     - REST API Tool(Insomnia등)을 통한 예시: 
        Headers: 'x-jwt'='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im9zb29tYW5zb3VyOUBuYXZlci5jb20iLCJpYXQiOjE3MDQ3Njg0NzF9.eRXT_JGpNYOV420LkPqBfcAHzvu9qbdaAetj3Flx4MI'
        Query: name = MarkZuckerberg
        URL PREVIEW: http://localhost:3000/admin/members/search?name=MarkZuckerberg
   */
  @Role(['admin'])
  @UseGuards(AuthGuard)
  @Get('/members/search')
  searchMember(@Query('name') name: string) {
    // userId로 검색 >
    return this.adminService.searchAmember(name);
  }

  /*
   * @Author : OSOOMAN
   * @Date : 2024.1.5
   * @Function : 회원의 일부 속성을 업데이트
   * @Parm : 파라미터에 '파이프 필터 패턴'을 사용하요 검증
   * @Return : 회원의 일부 정보가 수정되어 업데이트 된 개인 정보를 반환
   * @Explain : 고객의 요청(전화)에 따라서 주소등 정보 변경
      - 사용법: headers에 jwt값을 보내면 파라미터 id 값에 따라서 update 할 수 있다.
        예시: headers에 key='x-jwt' value='eyJH...' -> http://localhost:3000/update/25 요청
      - @Patch의 의미는 부분 수정을 받을 때 고객의 요청에 의한 수정 또는 임의적 확인
   */
  @Role(['admin'])
  @UseGuards(AuthGuard)
  @Patch('/update/:id')
  updateMemeberInfo(
    @Param('id', MyParamPipe) id: number,
    @Body() memberInfo: AupdateMemberInfoDTO,
  ) {
    return this.adminService.editProfile(id, memberInfo);
  }

  /*
   * @Author : OSOOMAN
   * @Date : 2024.1.6
   * @Function : 고객의 계정을 비활성화하는 기능
   * @Parm : -
   * @Return : -
   * @Explain : 일정시간(1달)을 방문하지 않은 회원들의 계정을 비활성화로 변경
     - 개발에서는 일정시간을 20초로 설정됨(테스트 목적)
   */
  @Role(['admin'])
  @UseGuards(AuthGuard)
  @Patch('/members/inactive')
  async inactivateAccount() {
    await this.adminService.setUsersToDormant();
    this.logger.log('비활성화 하였습니다.');
  }
}
