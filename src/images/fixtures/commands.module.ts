import { Module } from '@nestjs/common';
import { FixturesModule } from './fixtures.module';
import { LoadFixturesCommand } from './load-fixtures.command';
import { AppModule } from '../../app.module';

@Module({
  imports: [FixturesModule, AppModule],
  providers: [LoadFixturesCommand],
  exports: [LoadFixturesCommand],
})
export class CommandsModule {}
