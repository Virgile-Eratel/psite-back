import { Command, CommandRunner } from 'nest-commander';
import { ImageFixtures } from './image-fixtures';

@Command({ name: 'load:fixtures', description: 'Load fixtures data' })
export class LoadFixturesCommand extends CommandRunner {
  constructor(private readonly imageFixtures: ImageFixtures) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('Loading fixtures...');
      await this.imageFixtures.load();
      console.log('Fixtures loaded successfully');
    } catch (error) {
      console.error('Failed to load fixtures:', error);
    }
  }
}
