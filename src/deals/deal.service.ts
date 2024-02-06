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
    seller, name, price, description, rb3dURL
    
  ): Promise<void> {
    //seller는 회원의 정보에서 가져와서 기입 해줘야된다고 추정
    const sellMember = await this.members.findOne({where: {userId: seller}})
    //로봇 바로 save => findOne  
    const newRobot = this.robots.create({
      name: name,
      price: price,
      description: description,
      rb3dURL: rb3dURL
    })
    //const newRobot = this.robots.create(robot);
    await this.robots.save(newRobot);

    await this.deals.save(
      this.deals.create({
        seller: sellMember,
        robot: newRobot
      })
    ) 

  }

  async getAllDeal() {
    const allDeals = await this.deals.find({
      order: {
        id: 'DESC',
      },
      cache:true,
      relations:{
        robot: true,
      }
    })
    return allDeals;
  }
  /*
  async getGlbModel(){
    const RBmodel = await this.robots.findOne({
      where: {
        id: 1
      }
    })
  }
 */
}