import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AupdateMemberInfo } from 'src/member/dtos/updateMember.dto';
import { Member } from 'src/member/entites/member.entity';
import { Repository } from 'typeorm';
/*constructor(private readonly usersService: UsersService ) {}
 [소프트웨어 설계 SOLID ]
  - Injectable 데코레이터를 통해 Singleton 의 Dependency가 생기게 되는데
  *singleton: 객체의 인스턴스가 오직 1개만 생성되는 패턴을 의미
*/
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Member)
    private readonly members: Repository<Member>,
  ) {}
  async getAllmembers(): Promise<Member[]> {
    try {
      const members = await this.members.find({
        order: {
          id: 'DESC',
        },
        cache: true,
      });
      return members;
    } catch (e) {
      console.error(e);
    }
  }
  // 이름으로 검색하여 목표는 1명이나 결과는 동명이인의 사람이 나올 가능성이 있음
  async searchAmember(name: string): Promise<Member> {
    try {
      //findOneBy({ name: name });
      const searchedMember = await this.members.findOneOrFail({
        where: { name: name },
        select: [
          'name',
          'userId',
          'memberRole',
          'address',
          'updatedAt',
          'lastActivityAt',
          'isDormant',
        ],
        cache: true,
      });

      return searchedMember;
    } catch (e) {
      console.error(e);
    }
  }

  //#admin이 회원의 정보를 변경 할 수 있는 권한 기능
  async editProfile(
    memberId: number,
    { address, memberRole }: AupdateMemberInfo,
  ): Promise<Member> {
    try {
      const member = await this.members.findOne({
        where: { id: memberId },
        cache: true,
      });
      if (member) {
        member.address = address;
        member.memberRole = memberRole;
        await this.members.save(member);
      }
      return member;
    } catch (e) {
      console.error(e);
    }
  }

  async setUsersToDormant(): Promise<void> {
    // 설정된 시간 이상 활동이 없는 사용자 확인
    const inactiveUsers = await this.members
      .createQueryBuilder('user')
      .where('user.lastActivityAt < :threshold', {
        threshold: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), //24시간 이상 활동이 없는 경우
      })
      .getMany();

    inactiveUsers.forEach(async (user) => {
      user.isDormant = true;
      await this.members.save(user);
    });
  }
}
