import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { ImagesService } from './images.service';
import { Image } from './entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import * as fs from 'fs';
import * as path from 'path';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '../../images',
        filename: (req, file, cb) => {
          // Generate a unique filename
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async create(
    @Body() createImageDto: CreateImageDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Image> {
    // Extract name from file name if not provided
    const name = createImageDto.name || file.originalname.split('.')[0];
    
    // Create image entity
    return this.imagesService.create({
      name,
      fileType: file.mimetype,
      fileName: file.filename,
    });
  }

  @Get()
  async findAll(): Promise<Image[]> {
    return this.imagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Image> {
    return this.imagesService.findOne(+id);
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join('../../images', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: 'File not found' });
    }
    
    // Send file
    res.sendFile(filename, { root: '../../images' });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateImageDto: Partial<Image>): Promise<Image> {
    return this.imagesService.update(+id, updateImageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    // Get image to delete file
    const image = await this.imagesService.findOne(+id);
    
    // Delete file
    const filePath = path.join('../../images', image.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    return this.imagesService.remove(+id);
  }
}
