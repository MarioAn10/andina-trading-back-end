import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { Product } from './entities/product.entity';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { ErrorHandlerService } from 'src/common/error-handler.service';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.errorHandler.handleDBException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    //TODO: Relaciones
    return await this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let productDB: Product;

    if (isUUID(term))
      productDB = await this.productRepository.findOneBy({ id: term });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      productDB = await queryBuilder
        .where(`UPPER(title)=:title or slug=:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .getOne();
    }

    if (!productDB)
      throw new NotFoundException(`Product with term ${term} not found`);

    return productDB;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({ id, ...updateProductDto });

    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.errorHandler.handleDBException(error);
    }
  }

  async remove(id: string) {
    const toDeleteProduct = await this.findOne(id);
    await this.productRepository.remove(toDeleteProduct);
  }
}
