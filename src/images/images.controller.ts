import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { IMAGES_STORAGE_PATH } from '../config/storage.config';
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
    return this.imagesService.create(createImageDto, file);
  }

  @Get()
  async findAll(): Promise<Image[]> {
    return this.imagesService.findAll();
  }

  @Get('next')
  async next(
    @Query('size') size = '1',
    @Req() req: Request & { session: { seenIds?: number[] } },
  ): Promise<Image[]> {
    const take = Math.max(1, parseInt(size, 10));
    if (!req.session.seenIds) {
      req.session.seenIds = [];
    }
    const images = await this.imagesService.getRandom(
      take,
      req.session.seenIds,
    );
    if (images.length === 0) {
      throw new NotFoundException('No more images available');
    }
    req.session.seenIds.push(...images.map((i) => i.id));
    return images;
  }

  @Get('reset')
  reset(@Req() req: Request & { session: { seenIds?: number[] } }) {
    req.session.seenIds = [];
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(IMAGES_STORAGE_PATH, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: 'File not found' });
    }
    res.sendFile(filename, { root: IMAGES_STORAGE_PATH });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Image> {
    const image = await this.imagesService.findOne(id.toString());
    if (!image) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
    return image;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.imagesService.delete(id.toString());
    return { deleted: true };
  }
}
