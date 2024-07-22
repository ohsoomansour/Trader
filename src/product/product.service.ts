import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entity/product.entity";
import { Repository } from "typeorm";
import { UploadService } from "src/upload/upload.service";


@Injectable()
export class ProductService {
  private logger = new Logger('ProductService');
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ){}
  
  async delRepresImg(productId:number){
    await this.products.update({id: productId}, {representative_prodURL: ''})
  }
  async delProdImg(productId:number, db_product_URL: string) {
    this.logger.log('ProductService-delProdImg params:', productId, db_product_URL);
    const prodToDel = await this.products.findOneBy({
      id: productId
    })

    const prod_URLS = prodToDel.prod_URLS.filter(imgURL => imgURL !== db_product_URL);
    prodToDel.prod_URLS = prod_URLS;
    await this.products.save(prodToDel);
  }
  async updateProductImg(productId:number, urlToUpadate: string | string[], code:string) {
    /* # 1. x 버튼 누른 경우 : state 값에서 삭제 실제 db 삭제 x
         2. save 버튼 누르면 update 되는 로직으로 
    */
    this.logger.log('updateProductImg')
    console.log(productId, urlToUpadate, code)
    if(code === 'r'){
      if(typeof urlToUpadate === 'string'){
        await this.products.update({id: productId}, {representative_prodURL: urlToUpadate})
      }
    } else if(code === 'g'){
      if(Array.isArray(urlToUpadate)){
        const prodToUpdate = await this.products.findOneBy({id:productId});
        prodToUpdate.prod_URLS.push(...urlToUpadate);
        await this.products.update({id: productId}, {prod_URLS:prodToUpdate.prod_URLS });
      }
    }
   
    
    // db에서 해당 제품의 대표 사진을 변경
  }
}