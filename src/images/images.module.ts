import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { Image } from './entities/image.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const name = `${Date.now()}${extname(file.originalname)}`;
          cb(null, name);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
