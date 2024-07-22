import { Body, Controller, Logger, Post } from "@nestjs/common";
import { ProductService } from "./product.service";
import { updateProdInputDTO } from "./dtos/update-product.dto";
import { UploadService } from "src/upload/upload.service";

@Controller('prod')
export class ProductController {
  private logger = new Logger('productController');
  
  constructor(
    private productService: ProductService,
    private uploadService: UploadService,
  ) {}

  @Post('/update_img')
  async updateProductImg(@Body() update_prod_input:updateProdInputDTO){
    this.logger.log('updateProductImg', update_prod_input);
    // AWS에서 url 

    this.productService.updateProductImg(update_prod_input.productId, update_prod_input.urlImgToUpadate, update_prod_input.code); 

  }  

}