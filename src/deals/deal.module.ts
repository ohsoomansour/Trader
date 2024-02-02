/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { DealController } from './deal.controller';
import { OrderItem } from 'src/orders/entities/order-item.entity';
import { DealService } from './deal.service';
import { Robot } from './entitles/robot.entity';
import { Deal } from './entitles/deal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order,OrderItem,Robot, Deal  ])],
  controllers:[DealController],
  providers: [DealService]
})

export class DealModule {
  static forRoot:any;
}