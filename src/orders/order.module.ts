/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Deal } from 'src/deals/entitles/deal.entity';
import { Member } from 'src/member/entites/member.entity';
import { OrderService } from './order.service';
import { Robot } from 'src/deals/entitles/robot.entity';
import { OrderItem } from './entities/order-item.entity';
import { Store } from './entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Robot, Deal, Member, Store])],
  controllers:[OrderController],
  providers:[OrderService]
})

export class OrderModule {}
