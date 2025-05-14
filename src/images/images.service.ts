import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async create(createImageDto: Partial<Image>): Promise<Image> {
    const image = this.imageRepository.create(createImageDto);
    return this.imageRepository.save(image);
  }

  async findAll(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  async findOne(id: number): Promise<Image> {
    const image = await this.imageRepository.findOneBy({ id });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  async update(id: number, updateImageDto: Partial<Image>): Promise<Image> {
    await this.imageRepository.update(id, updateImageDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.imageRepository.delete(id);
  }

  /**
   * Get random images
   * @param count Number of random images to retrieve
   */
  async findRandom(count: number = 3): Promise<Image[]> {
    // Get all images
    const allImages = await this.imageRepository.find();

    // If we have fewer images than requested, return all images
    if (allImages.length <= count) {
      return allImages;
    }

    // Shuffle the array using Fisher-Yates algorithm
    for (let i = allImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
    }

    // Return the first 'count' images
    return allImages.slice(0, count);
  }
}