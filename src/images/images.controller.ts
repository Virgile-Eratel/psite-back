import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, Res, NotFoundException, Query, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response, Request } from 'express';
import { ImagesService } from './images.service';
import { Image } from './entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import * as fs from 'fs';
import * as path from 'path';
import { IMAGES_STORAGE_PATH } from '../config/storage.config';
import { v4 as uuidv4 } from 'uuid';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: IMAGES_STORAGE_PATH,
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

  @Get('random')
  async findRandom(): Promise<Image[]> {
    return this.imagesService.findRandom(3);
  }

  @Get('random-non-repeating')
  async findRandomNonRepeating(
    @Query('sessionId') sessionId: string,
    @Query('count') count: string,
    @Req() req: Request,
  ): Promise<Image[]> {
    // Si aucun sessionId n'est fourni, en générer un nouveau
    const session = sessionId || uuidv4();
    
    // Utiliser l'IP du client comme partie du sessionId pour plus de sécurité
    const clientIp = req.ip || 'unknown';
    const fullSessionId = `${session}-${clientIp}`;
    
    return this.imagesService.findRandomNonRepeating(
      fullSessionId,
      count ? parseInt(count, 10) : 3,
    );
  }

  @Get('next-batch')
  async getNextRandomBatch(
    @Query('sessionId') sessionId: string,
    @Query('count') count: string,
    @Req() req: Request,
  ): Promise<{ sessionId: string; images: Image[] }> {
    // Si aucun sessionId n'est fourni, en générer un nouveau
    const session = sessionId || uuidv4();
    
    // Utiliser l'IP du client comme partie du sessionId pour plus de sécurité
    const clientIp = req.ip || 'unknown';
    const fullSessionId = `${session}-${clientIp}`;
    
    const images = await this.imagesService.getNextRandomBatch(
      fullSessionId,
      count ? parseInt(count, 10) : 3,
    );
    
    return {
      sessionId: session, // Retourner le sessionId pour les prochaines requêtes
      images,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Image> {
    return this.imagesService.findOne(+id);
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = path.join(IMAGES_STORAGE_PATH, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: 'File not found' });
    }

    // Send file
    res.sendFile(filename, { root: IMAGES_STORAGE_PATH });
  }

  @Get('view/:id')
  async viewImage(@Param('id') id: string, @Res() res: Response) {
    try {
      // Récupérer l'image par son ID
      const image = await this.imagesService.findOne(+id);

      // Construire le chemin du fichier
      const filePath = path.join(IMAGES_STORAGE_PATH, image.fileName);

      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).send({ message: 'Image file not found' });
      }

      // Envoyer le fichier
      res.sendFile(image.fileName, { root: IMAGES_STORAGE_PATH });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(404).send({ message: 'Image not found' });
      }
      return res.status(500).send({ message: 'Internal server error' });
    }
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
    const filePath = path.join(IMAGES_STORAGE_PATH, image.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    return this.imagesService.remove(+id);
  }
}
