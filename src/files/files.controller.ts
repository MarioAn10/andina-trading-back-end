import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { FilesService } from './files.service';
import { fileFilter, fileNamer, validExtensions } from './helpers';
import { Response } from 'express';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }

  @Get('product/:filename')
  findFile(@Param('filename') fileName: string, @Res() response: Response) {
    const path = this.filesService.getStaticFile(fileName);
    response.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileNamer,
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException(`File not send or has invalid extension (${validExtensions})`);

    const secureUrl = `${this.configService.get('API_HOST')}files/product/${file.filename}`;

    return {
      secureUrl
    };
  }
}
