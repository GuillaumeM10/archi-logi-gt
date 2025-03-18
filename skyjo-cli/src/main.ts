import {NestFactory} from '@nestjs/core';
import * as readlineSync from 'readline-sync';
import {CliModule} from "./infrastructure/cli/cli.module";
import {GameService} from "./application/services/game.service";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(CliModule, {logger: false});
    const gameService = app.get(GameService);

    console.clear();
    console.log('🎲 Bienvenue dans Skyjo CLI !');

    while (true) {
        console.clear();
        const {started, isCardFromDiscardPile, discardTop, drawnCard, isGameTerminated} = gameService.getGameState();
        const currentPlayer = gameService.getCurrentPlayer();

        if (isGameTerminated){
            console.log('👋 Bravo, la partie était fun.');
            process.exit(0);
        }
        if (!started) {
            console.log('Liste des joueurs : ' + gameService.getPlayersList().map(player => player.name));
            const actions = ['Ajouter un joueur'];

            if (gameService.getPlayersList().length > 1) {
                actions.push('Lancer la partie');
            }
            actions.push('Quitter');

            const index = readlineSync.keyInSelect(actions, 'Que voulez-vous faire ?', {cancel: false});

            if (actions[index] === 'Quitter') {
                console.log('👋 Fin du jeu.');
                process.exit(0);
            } else if (actions[index] === 'Lancer la partie') {
                gameService.startGame();
            } else {
                gameService.addPlayer(readlineSync.question('Nom du joueur : '));
            }
            continue;
        }
        let actions: Array<string> = [];
        console.log(`\n🕐 Tour de ${currentPlayer.name}`);
        if (drawnCard) {
            console.log("Carte en main : ", drawnCard.value);
            if (isCardFromDiscardPile) {
                actions = ['Jouer la carte piochée', 'Quitter'];
            } else {
                actions = ['Jouer la carte piochée', 'Défausser la carte piochée', 'Quitter'];
            }
        } else {
            console.log(`📤 Carte visible sur la défausse : ${discardTop}`);
            actions = ['Piocher la carte cachée', 'Piocher la carte de la défausse', 'Quitter'];
        }
        currentPlayer.displayGrid();

        const index = readlineSync.keyInSelect(actions, 'Que voulez-vous faire ?', {cancel: false});
        let row = -1;
        let col = -1;

        switch (actions[index]) {
            case 'Piocher la carte cachée':
                gameService.drawCard(false);
                break;
            case 'Piocher la carte de la défausse':
                gameService.drawCard(true);
                break;
            case 'Jouer la carte piochée':
                row = readlineSync.questionInt('Ligne (1-3) : ') - 1;
                col = readlineSync.questionInt('Colonne (1-4) : ') - 1;
                gameService.playDrawnCard(row, col);
                readlineSync.prompt('Appuez sur "entrée" pour passer au tour suivant');
                console.clear();

                break;
            case 'Défausser la carte piochée':
                gameService.discardDrawnCard();
                console.log('👋 Carte à retourner.');
                row = readlineSync.questionInt('Ligne (1-3) : ') - 1;
                col = readlineSync.questionInt('Colonne (1-4) : ') - 1;
                gameService.revealCard(row, col);
                readlineSync.prompt('Appuez sur "entrée" pour passer au tour suivant');
                console.clear();

                break;
            case 'Quitter':
                console.log('👋 Fin du jeu.');
                process.exit(0);
        }

    }
}

bootstrap();
