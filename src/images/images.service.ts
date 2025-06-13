import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from './entities/image.entity';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly repo: Repository<Image>,
  ) {}

  async create(
    createImageDto: CreateImageDto,
    file: Express.Multer.File,
  ): Promise<Image> {
    const image = this.repo.create({
      name: createImageDto.name,
      fileName: file.filename,
      fileType: file.mimetype,
      filePath: join('uploads/images', file.filename),
    });
    return this.repo.save(image);
  }

  async findAll(): Promise<Image[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Image | null> {
    return this.repo.findOne({ where: { id: parseInt(id) } });
  }

  async delete(id: string): Promise<void> {
    const image = await this.repo.findOne({ where: { id: parseInt(id, 10) } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'images');
    const filePath = path.join(uploadDir, image.fileName);

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      await fs.promises.unlink(filePath);
    } catch (fsErr: any) {
      if (fsErr.code === 'ENOENT') {
        console.warn(`Fichier déjà supprimé ou inexistant : ${filePath}`);
      } else {
        throw new InternalServerErrorException(
          `Impossible de supprimer le fichier : ${fsErr.message}`,
        );
      }
    }

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Image not found');
    }
  }

  async getRandom(take: number, excludeIds: number[]): Promise<Image[]> {
    const qb = this.repo.createQueryBuilder('image');
    if (excludeIds.length) {
      qb.where('image.id NOT IN (:...excludeIds)', { excludeIds });
    }
    return qb.orderBy('RANDOM()').take(take).getMany();
  }
}
