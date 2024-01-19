/* eslint-disable prettier/prettier */
import { SetMetadata } from "@nestjs/common";
import { MemberRole } from "src/member/entites/member.entity";

/* 🔷SetMetadata 
  📄https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata
  metadata 혹은 role이 any로 설명되어 있으면 너는 그 결과를 실행할 수 있다는 뜻
    export enum MemberRole {
      Client = "Client" ,
      Owner = "Owner"  , 
      Delivery ="Delivery" ,
    }

*/
//*이해: enum의 type의 키 
export type AllowedRoles = keyof typeof MemberRole;
/* #setMetadata의 이해
 key - a value defining the key under which the metadata is stored
 value - metadata to be associated with key
 This metadata can be reflected using the Reflector class.
 Example: @SetMetadata('roles', ['admin'])
*/
export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);