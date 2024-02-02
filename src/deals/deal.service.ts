/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Deal } from "./entitles/deal.entity";
import { Repository } from "typeorm";
import { MakeADealInput, MakeADealOutput } from "./dtos/make-deal.dto";

@Injectable()
export class DealService {
  constructor(
    @InjectRepository(Deal)
    private readonly deals: Repository<Deal>
    
  ) {}

  async makeADeal(
    makeADealInput: MakeADealInput
  ): Promise<MakeADealOutput> {
    await this.deals.save(makeADealInput)
    return {
      ok: true,
      error: "error"
    }
  }

}