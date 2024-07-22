import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ProductService} from 'src/product/product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/product/entity/product.entity';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [UploadController],
  providers: [UploadService, ProductService],
  exports: [UploadService]
})
export class UploadModule {}
