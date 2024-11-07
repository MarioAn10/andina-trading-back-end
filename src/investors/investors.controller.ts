import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvestorsService } from './investors.service';
import { CreateInvestorDto } from './dto/create-investor.dto';
import { UpdateInvestorDto } from './dto/update-investor.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('investors')
export class InvestorsController {
  constructor(private readonly investorsService: InvestorsService) { }

  @Post()
  @Auth()
  create(
    @Body() createInvestorDto: CreateInvestorDto,
    @GetUser() user: User,
  ) {
    return this.investorsService.create(createInvestorDto, user);
  }

  @Auth()
  @Get(':userId')
  findOne(
    @Param('userId') id: string,
    @GetUser() user: User,
  ) {
    return this.investorsService.findOne(id, user);
  }

  @Auth()
  @Patch(':userId')
  update(
    @Param('userId') id: string, 
    @Body() updateInvestorDto: UpdateInvestorDto,
    @GetUser() user: User,
  ) {
    return this.investorsService.update(id, updateInvestorDto, user);
  }
}
