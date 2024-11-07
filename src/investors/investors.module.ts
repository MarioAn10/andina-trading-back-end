import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Investor } from './entities/investor.entity';
import { InvestorsService } from './investors.service';
import { InvestorsController } from './investors.controller';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [InvestorsController],
  providers: [InvestorsService],
  imports: [
    TypeOrmModule.forFeature([Investor]),
    CommonModule,
    AuthModule,
  ]
})
export class InvestorsModule {}
