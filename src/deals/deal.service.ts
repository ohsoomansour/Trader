/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Deal } from "./entitles/deal.entity";
import { Repository } from "typeorm";
import { Member } from "src/member/entites/member.entity";
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

  async makeADeal(makingDealInput:MakeADealInputDTO): Promise<void> {
    try {
    const sellMember = await this.members.findOne({where: {userId: makingDealInput.sellerId}})
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

  async getAllDeal():Promise<Deal[]> {
    try {
      const allDeals = await this.deals.find({
        order: {
          id: 'DESC',
        },
        cache:true,
        relations:{
          robot: true,
          seller:true,
        }
      })
      return allDeals;
    } catch (e) {
    }
  }

}