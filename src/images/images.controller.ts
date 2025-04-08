import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ImagesService } from './images.service';
import { Image } from './entities/image.entity';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  async create(@Body() createImageDto: Partial<Image>): Promise<Image> {
    return this.imagesService.create(createImageDto);
  }

  @Get()
  async findAll(): Promise<Image[]> {
    return this.imagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Image> {
    return this.imagesService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateImageDto: Partial<Image>): Promise<Image> {
    return this.imagesService.update(+id, updateImageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.imagesService.remove(+id);
  }
}