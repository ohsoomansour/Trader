/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Deal } from "./entitles/deal.entity";
import { Repository } from "typeorm";
import { Member } from "src/member/entites/member.entity";
import { Robot } from "./entitles/robot.entity";


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

  async makeADeal(
    //robot entity가 등록이 되어있어야된다. (아래의 경우)
    compa_name, compaBrand_ImgURL, seller, seller_address, name, price, maintenance_cost, description, rbURL
    
  ): Promise<void> {
    try {

    const sellMember = await this.members.findOne({where: {userId: seller}})
    const newRobot = this.robots.create({
      name,
      price,    
      maintenance_cost,    //undefined
      description,
      rbURL
    })

    await this.robots.save(newRobot);

    await this.deals.save(
      this.deals.create({
        compa_name, //undefined
        seller_address,
        compaBrand_ImgURL,
        seller: sellMember,
        robot: newRobot
      })
    )
    } catch (e) {
      console.error(e);
    } 

  }

  async getAllDeal() {
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