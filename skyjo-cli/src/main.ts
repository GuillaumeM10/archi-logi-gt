import {NestFactory} from '@nestjs/core';
import {CliModule} from "./infrastructure/cli/cli.module";
import {GameCommand} from "./infrastructure/cli/commands/game.command";
import {CliHandler} from "./infrastructure/cli/cli.handler";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(CliModule, {logger: false});
    const gameCommand = app.get(GameCommand);

    const cliHandler = new CliHandler(gameCommand);

    await cliHandler.start();
}

bootstrap();
