/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Deal } from 'src/deals/entitles/deal.entity';
import { Member } from 'src/member/entities/member.entity';
import { OrderService } from './order.service';
import { OrderItem } from './entities/order-item.entity';
import { Store } from './entities/store.entity';
import { Product } from 'src/product/entity/product.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product, Deal, Member, Store])],
  controllers:[OrderController],
  providers:[OrderService]
})

export class OrderModule {}
