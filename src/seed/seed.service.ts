import * as encrypt from "bcrypt";

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';

import { ProductsService } from 'src/products/products.service';
import { ErrorHandlerService } from 'src/common/error-handler.service';

import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly errorHandler: ErrorHandlerService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async runSeed() {
    try {
      await this.deleteTables();
      const admin = await this.insertSeedUsers();
      await this.insertSeedProducts(admin);
      return 'SEED executed';
    } catch (error) {
      this.errorHandler.handleDBException(error);
    }
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertSeedUsers() {
    const seedUsers = initialData.users;
    const users: User[] = []

    seedUsers.forEach(user => {
      user.password = encrypt.hashSync(user.password, 10);
      users.push(this.userRepository.create(user));
    });

    await this.userRepository.save(users);

    return users[0];
  }

  private async insertSeedProducts(user: User) {
    const seedProducts = initialData.products;
    const insertPromises = [];

    seedProducts.forEach(product => insertPromises.push(this.productsService.create(product, user)));

    await Promise.all(insertPromises);

    return true;
  }
}
