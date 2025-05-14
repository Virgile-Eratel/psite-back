import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class ImageFixtures {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  /**
   * Load fixtures
   */
  async load(): Promise<void> {
    // Check if we already have images
    const count = await this.imageRepository.count();
    if (count > 0) {
      console.log(`Skipping image fixtures: ${count} images already exist`);
      return;
    }

    // Sample images to download
    const sampleImages = [
      {
        name: 'Mountain Landscape',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fileType: 'image/jpeg',
      },
      {
        name: 'Beach Sunset',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fileType: 'image/jpeg',
      },
      {
        name: 'Forest Path',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fileType: 'image/jpeg',
      },
      {
        name: 'City Skyline',
        url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fileType: 'image/jpeg',
      },
      {
        name: 'Desert Dunes',
        url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        fileType: 'image/jpeg',
      },
    ];

    // Create images directory if it doesn't exist
    const imagesDir = path.join(__dirname, '../../../../images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Download and save each image
    for (const sampleImage of sampleImages) {
      try {
        const fileName = await this.downloadImage(sampleImage.url, imagesDir);
        
        // Create image entity
        const image = this.imageRepository.create({
          name: sampleImage.name,
          fileType: sampleImage.fileType,
          fileName: fileName,
        });
        
        await this.imageRepository.save(image);
        console.log(`Created fixture image: ${sampleImage.name}`);
      } catch (error) {
        console.error(`Failed to create fixture image ${sampleImage.name}:`, error);
      }
    }

    console.log('Image fixtures loaded successfully');
  }

  /**
   * Download an image from a URL
   * @param url URL of the image to download
   * @param directory Directory to save the image to
   * @returns The filename of the downloaded image
   */
  private async downloadImage(url: string, directory: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate a unique filename
      const fileName = `fixture-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const filePath = path.join(directory, fileName);
      const file = fs.createWriteStream(filePath);

      // Choose http or https based on the URL
      const client = url.startsWith('https') ? https : http;

      client.get(url, (response) => {
        // Check if the request was successful
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode} ${response.statusMessage}`));
          return;
        }

        // Pipe the response to the file
        response.pipe(file);

        // Handle errors
        file.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject(err);
        });

        // Close the file when the download is complete
        file.on('finish', () => {
          file.close();
          resolve(fileName);
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file on error
        reject(err);
      });
    });
  }
}
