/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entites/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm'; 
import * as bcrypt from "bcrypt";
import { InternalServerErrorException } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
//import { Field, registerEnumType } from '@nestjs/graphql';

/**/
export enum MemberRole {
  admin = "admin",
  manager = "manager",
  client = "client",
  any = "any"
}
//#설치 필요: npm i @nestjs/graphql
registerEnumType(MemberRole, { name: 'MemberRole'});

@Entity()
export class Member extends CoreEntity {
  
  @Column()
  userId: string;
  
  @Column({select: false})
  password: string;

  @Column({nullable : true})
  name: string;

  @Column()
  address: string;
  /*🚨컬럼 생성 시 문제 발생: 
    query failed: ALTER TABLE "member" ADD "memberType" character varying NOT NULL
    error: error: "memberType" 열에는 null 값 자료가 있습니다 
    > member 테이블에 컬럼을 추가하는데 값이 없으니까 바로 에러가 발생한다
    > 해결점: 일단 nullable을 허용 > 컬럼 추가 > 값 추가 > null 적용 여부를 생각하면 된다!
  */
  //@Column({nullable : true, type: 'enum', enum: MemberRole}) @Column({nullable : true })
  @Column({nullable : true, type: 'enum', enum: MemberRole}) 
  memberRole: MemberRole;

  @Column({nullable: true})
  lastActivityAt: Date;

  @Column({nullable: true})
  isDormant: boolean;

  @Column({default: false})
  verified: boolean;
  /*#패스워드 일치 문제 정리
    1. 문제: 일단 로그인 후 패스워드가 hashing되어 비번이 바뀜 
             최초 해싱된 entity의 this.password는 변경이 되며 안된다. 
    2. 원인: @Column({select: false}) 
      - 상세 원인 설명: lastActivityAt와 updatedAt컬럼에 값이 변경되면서  @BeforeUpdate() 호출이되는 데 
        ✅@Column({select: true})가 되면 this.password가 DB의 password를 select하게 되고 
            password가 hashingPw메서드가 실행되어 hashing하게 된다!
        ✅로그인 시 this.password가 undefined이 정상이고 if문을 타지 않고 hashing되지 않음

      - @Column({select: false})의 이해
        정의: Defines whether or not to hide this column by default when making queries. 
        (쿼리를 작성할 때 기본적으로 '이 열을 숨길지 여부를 정의'합니다)
        ✅When set to false, the column data will not show with a 🌟standard query. By default column is select    
        *standard query: find();   

      - @BeforeUpdate의 이해: ""
        You can define a method with any name in the entity and mark it with @BeforeUpdate and
        TypeORM will call it before an existing entity is updated ✅using repository/manager save   
        Keep in mind, ✅however, that this will occur only when information is changed in the model.

      - save쿼리의 이해
        Saves a given entity in the database. If entity does not exist in the database then inserts, otherwise updates.


         [코드 순서로 이해]
           -> however, that this will occur only when information is changed in the model.
              lastActivityAt와 updatedAt의 변경으로 update가 발생은 한다. 그러나 password는 변경사항이 없음
              ✅fineOne operation 발생 -> password 컬럼 값 @Column({select: false}) 이면 hide 
              ✅->여기서 🌟members: Repository<Member>가 this에 바인딩 따라서 🌟this.password는 undefined
               
           -> @BeforeUpdate hashingPw(): this.password는 undefined 
           
           ->  member.checkingPw(password); : 🌟this.password 해당 회원의 정상 비번 위 ✅'select에서 password를 명시' 
             예시) osoomansour36@naver.com 해당 member의 entity라면 password의 컬럼값은 findOne의해 기본적으로 선택되지 않는다. 
              async login({ userId, password }: LoginInput): Promise<LoginOutput> {
                try {
                  const 🌟member = await this.members.findOne({
                    where: { userId:userId },
                    select: ['userId', 'password'], ✅password를 가져오라고 명시화
                  });  
                }
              }    
           -> 
           -------------------------------- editProfile의 경우 ---------------------------------------
             멤버 엔티티의 this.password가 변경되어  @BeforeUpdate가 맞음

      
    3. 해결: true  -> false로 변경

     */
  @BeforeInsert() //@explain:최초 삽입 시, (값이 없을 때) 아래의 method를 호출
  @BeforeUpdate() //@explain: 최초 삽입 후 두 번째 Update부터 아래의 method를 호출이다. 
  async hashingPw(): Promise<void> {
    console.log('@BeforeUpdate 핸들러: hashingPw method:')
    console.log(this.password) //로그인 시 undefined 정상(this = <Member> instance 이고 현재 hide상태)
    console.log(this.userId) //osoomansour36@naver.com
    if(this.password){
      try {
    //@Explain: entity에 삽입 또는 업데이트 전에 암호화 saltOrRounds이 높을 수록 암호화🔺 속도 🔻   
        this.password = await bcrypt.hash(this.password, 10)
        console.log(`해싱 후 패스워드:${this.password}`)
      } catch (e) {
        console.log(e)
        throw new InternalServerErrorException()
      }
    }
  }

  async checkingPw(reqPassword : string) : Promise<boolean> {
    try {
      console.log(`로그인 입력 패스워드:${reqPassword}`);
      console.log(`로그인 시 DB 패스워드:${this.password}`)
      const ok = await bcrypt.compare(reqPassword, this.password); //this => member 변수, select로 password를 가져옴
      console.log('checkingPw의 결과 ok값:')
      console.log(ok);
      return ok;
    } catch(e) {

      throw new InternalServerErrorException('The password is wrong!');
    }
  } 



}
