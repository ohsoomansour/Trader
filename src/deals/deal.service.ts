/* eslint-disable prettier/prettier */

import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Deal } from "./entitles/deal.entity";
import { Repository } from "typeorm";
import { Member } from "src/member/entities/member.entity";
import { Robot } from "./entitles/robot.entity";
import { MakeADealInputDTO } from "./dtos/make-deal.dto";

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(Deal)
    private readonly deals: Repository<Deal>,
    @InjectRepository(Member)
    private readonly members: Repository<Member>,
    @InjectRepository(Robot)
    private readonly robots: Repository<Robot>
  ) {}
  private logger = new Logger('DealService')

  async makeADeal(makingDealInput:MakeADealInputDTO): Promise<void> {
    try {
    this.logger.log('makeADeal') //undefined
    console.log("makingDealInput.sellerId", makingDealInput.sellerId)
    const sellMember = await this.members.findOne({where: {userId: makingDealInput.sellerId}})
    console.log("sellMember",sellMember);
    const newRobot = this.robots.create({
      name:makingDealInput.name,
      price:makingDealInput.price,    
      maintenance_cost:makingDealInput.maintenance_cost,    
      description:makingDealInput.description,
      rbURL:makingDealInput.rbURL
    })

    await this.robots.save(newRobot);
    await this.deals.save(
      this.deals.create({
        compa_name:makingDealInput.compa_name, 
        seller_address:makingDealInput.seller_address,
        compaBrand_ImgURL:makingDealInput.compaBrand_ImgURL,
        seller:sellMember,
        salesManager_mobilephone: makingDealInput.salesManager_mobilephone,
        robot: newRobot
      })
    )
    } catch (e) {
      console.error(e);
    } 
  }

  async getAllDeals():Promise<Deal[]> {
    try {
      const allDeals = await this.deals.find({
        order: {
          id: 'DESC',
        },
        relations:{
          robot: true,
          seller:true,
        },
        cache:{
          id:'getAllDeal_cache',
          milliseconds:6000,
        }
      })
      return allDeals;
    } catch (e) {
    }
  }
  
  async getMyDeals(me:Member):Promise<Deal[]>{
    try{
      const myDeals = await this.deals.find({
        where:{
          seller:{
            userId:me.userId
          }
        },
        relations:{
          robot:true
        },
        order:{
          id:'DESC'
        }
      })
      return myDeals;
    } catch(e){
      console.error(e);
    }
  }
  async delMyDeal(dealId:number):Promise<void>{
    try{
      this.logger.log('delMyDeal');
      console.log(dealId)
      await this.deals.delete({
        id:dealId,
      })
    } catch (e) {
      console.error(e);
      this.logger.error('선택된 거래가 삭제되지 않았습니다. ');
      this.logger.debug("어떤 고객님이 '주문'을 하였거나 '미리 담기'를 진행 중입니다. order 테이블 또는 store 테이블에서 참조하고 있습니다.");
    }
  }
}