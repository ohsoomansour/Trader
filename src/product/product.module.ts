import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { UploadService } from 'src/upload/upload.service';
import { UploadModule } from 'src/upload/upload.module';



@Module({
  imports: [TypeOrmModule.forFeature([Product]), UploadModule],
  controllers: [ProductController],
  providers: [ProductService]
})

export class ProductModule {}