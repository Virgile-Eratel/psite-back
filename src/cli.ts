import { CommandFactory } from 'nest-commander';
import { CommandsModule } from './images/fixtures/commands.module';

async function bootstrap() {
  await CommandFactory.run(CommandsModule);
}

bootstrap();
