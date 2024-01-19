/* eslint-disable prettier/prettier */
import { Query, Resolver } from '@nestjs/graphql';

@Resolver(of => String)
export class HomeResolver {
  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }
}
