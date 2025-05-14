import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../entities/image.entity';
import { ImageFixtures } from './image-fixtures';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  providers: [ImageFixtures],
  exports: [ImageFixtures],
})
export class FixturesModule {}
