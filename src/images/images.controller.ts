import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { IMAGES_STORAGE_PATH } from '../config/storage.config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Image } from './entities/image.entity';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
  ): Promise<Image> {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.imagesService.create(createImageDto, file);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll() {
    return this.imagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const image = await this.imagesService.findOne(id);
    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    return image;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.imagesService.delete(id);
    return { deleted: true };
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(IMAGES_STORAGE_PATH, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: 'File not found' });
    }

    res.sendFile(filename, { root: IMAGES_STORAGE_PATH });
  }
}
