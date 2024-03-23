/* eslint-disable prettier/prettier */
import { SetMetadata } from "@nestjs/common";
import { MemberRole } from "src/member/entites/member.entity";

/* 🔷SetMetadata 
  - doc:📄https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata
  metadata 혹은 role이 any로 설명되어 있으면 너는 그 결과를 실행할 수 있다는 뜻
    export enum MemberRole {
      Client = "Client" ,
      Owner = "Owner"  , 
      Delivery ="Delivery" ,
    }

*/
//*이해: enum의 type의 키 

/* 
 #roles
 - export const Roles = Reflector.createDecorator<string[]>(); 
 - doc: https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata 

 #setMetadata의 이해
 - key: a value defining the key under which the metadata is stored
 - value: metadata to be associated with key
  🌟This metadata can be reflected using the 'Reflector class'. 
 - Example: @SetMetadata('roles', ['admin'])
*/ 
export type AllowedRoles = keyof typeof MemberRole;
//auth.guard.ts의 Reflector에서 쓰임!
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles); 