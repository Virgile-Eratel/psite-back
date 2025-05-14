import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Image } from './entities/image.entity';

@Injectable()
export class ImagesService {
  // Map pour stocker les sessions et les images déjà vues
  private readonly viewedImagesMap: Map<string, Set<number>> = new Map();

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

  /**
   * Get random images without repetition
   * @param sessionId Session ID to track viewed images
   * @param count Number of random images to retrieve
   */
  async findRandomNonRepeating(sessionId: string, count: number = 3): Promise<Image[]> {
    // Get the set of viewed image IDs for this session
    let viewedImageIds = this.viewedImagesMap.get(sessionId);
    
    // If no session exists, create a new one
    if (!viewedImageIds) {
      viewedImageIds = new Set<number>();
      this.viewedImagesMap.set(sessionId, viewedImageIds);
    }

    // Get all images
    const allImages = await this.imageRepository.find();
    
    // If all images have been viewed, reset the viewed images for this session
    if (viewedImageIds.size >= allImages.length) {
      viewedImageIds.clear();
      this.viewedImagesMap.set(sessionId, viewedImageIds);
    }

    // Filter out already viewed images
    const nonViewedImages = allImages.filter(image => !viewedImageIds.has(image.id));

    // If we have fewer non-viewed images than requested, return all non-viewed images
    if (nonViewedImages.length <= count) {
      // Add these images to the viewed set
      nonViewedImages.forEach(image => viewedImageIds.add(image.id));
      return nonViewedImages;
    }

    // Shuffle the array using Fisher-Yates algorithm
    for (let i = nonViewedImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nonViewedImages[i], nonViewedImages[j]] = [nonViewedImages[j], nonViewedImages[i]];
    }

    // Get the first 'count' images
    const selectedImages = nonViewedImages.slice(0, count);
    
    // Add these images to the viewed set
    selectedImages.forEach(image => viewedImageIds.add(image.id));
    
    return selectedImages;
  }

  /**
   * Get the next batch of random images
   * @param sessionId Session ID to track viewed images
   * @param count Number of random images to retrieve
   */
  async getNextRandomBatch(sessionId: string, count: number = 3): Promise<Image[]> {
    return this.findRandomNonRepeating(sessionId, count);
  }
}
