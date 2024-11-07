import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Investor } from './entities/investor.entity';
import { User } from 'src/auth/entities/user.entity';

import { CreateInvestorDto } from './dto/create-investor.dto';
import { UpdateInvestorDto } from './dto/update-investor.dto';
import { ErrorHandlerService } from 'src/common/error-handler.service';


@Injectable()
export class InvestorsService {
  constructor(
    @InjectRepository(Investor)
    private readonly investorRepository: Repository<Investor>,

    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async create(createInvestorDto: CreateInvestorDto, user: User) {
    try {
      const { address, country, city, bank_account } = createInvestorDto;
      const { id, fullName, email } = user;

      const investor = this.investorRepository.create({
        address,
        country,
        city,
        bank_account,
        user
      });

      await this.investorRepository.save(investor);
      return { id, fullName, email, address, country, city, bank_account };
    } catch (error) {
      this.errorHandler.handleDBException(error);
    }
  }

  async findOne(userId: string, user: User) {
    return this.findOneBD(userId, user);
  }

  async update(userId: string, updateInvestorDto: UpdateInvestorDto, user: User) {
    const { ...investorData } = updateInvestorDto;
    const { id, fullName, email } = user;

    const identity = (await this.findOneBD(userId, user)).identity;
    const investor = await this.investorRepository.preload({ id: identity, ...investorData, user });

    const qb = this.investorRepository.createQueryBuilder('investor');

    try {
      await qb.update(investor).execute();
      return { id, fullName, email, ...investorData };
    } catch (error) {
      this.errorHandler.handleDBException(error);
    }
  }

  private async findOneBD(userId: string, user: User) {
    const { id, fullName, email } = user;
    let investorDB: Investor;

    if (userId !== id)
      throw new BadRequestException(`Id from request (${userId}) does not match id from user (${id}).`);

    investorDB = await this.investorRepository.findOne({
      where: { user }
    });

    if (!investorDB)
      throw new NotFoundException(`Investor with id ${id} not found`);

    const { id: identity, address, country, city, bank_account } = investorDB;

    return { id, fullName, email, bank_account, address, country, city, identity };
  }
}
