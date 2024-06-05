import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { ErrorHandlerService } from 'src/common/error-handler.service';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

    private readonly errorHandler: ErrorHandlerService,
  ) { }

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(url => this.productImageRepository.create({ url })),
        user,
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.errorHandler.handleDBException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 20, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return products.map(({ images, ...productProps }) => ({
      ...productProps,
      images: images.map(image => image.url)
    }));
  }

  private async findOne(term: string) {
    let productDB: Product;

    if (isUUID(term))
      productDB = await this.productRepository.findOneBy({ id: term });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      productDB = await queryBuilder
        .where(`UPPER(title)=:title or slug=:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!productDB)
      throw new NotFoundException(`Product with term ${term} not found`);

    return productDB;
  }

  async findOnePlain(term: string) {
    const { images, ...productProps } = await this.findOne(term);
    return {
      ...productProps,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...productProps } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...productProps });

    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    // Create query Runner
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(url => this.productImageRepository.create({ url }));
      }

      product.user = user;
      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.errorHandler.handleDBException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const toDeleteProduct = await this.findOne(id);
    await this.productRepository.remove(toDeleteProduct);
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.errorHandler.handleDBException(error);
    }
  }
}
