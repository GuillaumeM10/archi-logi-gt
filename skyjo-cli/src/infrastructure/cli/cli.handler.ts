import {GameCommand} from "./commands/game.command";
import * as readlineSync from 'readline-sync';

export class CliHandler{
    constructor(private readonly gameCommand: GameCommand) {}

    async start() : Promise<void> {
        console.clear();
        console.log('Bienvenue !');

        while (true) {
            console.clear();
            const {started, isCardFromDiscardPile, discardTop, drawnCard, isGameTerminated} = this.gameCommand.getGameState();
            const currentPlayer = this.gameCommand.getCurrentPlayer();

            if (isGameTerminated){
                console.log('Partie terminée, bien joué à tou.te.s les participant.e.s');
                process.exit(0);
            }
            if (!started) {
                console.log('Liste des joueurs : ' + this.gameCommand.getPlayersList().map(player => player.name));
                const actions = ['Ajouter un joueur'];

                if (this.gameCommand.getPlayersList().length > 1) {
                    actions.push('Lancer la partie');
                }
                actions.push('Quitter');

                const index = readlineSync.keyInSelect(actions, 'Que voulez-vous faire ?', {cancel: false});

                if (actions[index] === 'Quitter') {
                    console.log('Fin du jeu.');
                    process.exit(0);
                } else if (actions[index] === 'Lancer la partie') {
                    this.gameCommand.startGame();
                } else {
                    this.gameCommand.addPlayer(readlineSync.question('Nom du joueur : '));
                }
                continue;
            }
            let actions: Array<string> = [];
            console.log(`\nTour de ${currentPlayer.name}`);
            if (drawnCard) {
                console.log("Carte en main : ", drawnCard.value);
                if (isCardFromDiscardPile) {
                    actions = ['Jouer la carte piochée', 'Quitter'];
                } else {
                    actions = ['Jouer la carte piochée', 'Défausser la carte piochée', 'Quitter'];
                }
            } else {
                console.log(`Carte visible sur la défausse : ${discardTop}`);
                actions = ['Piocher la carte cachée', 'Piocher la carte de la défausse', 'Quitter'];
            }
            currentPlayer.displayGrid();

            const index = readlineSync.keyInSelect(actions, 'Que voulez-vous faire ?', {cancel: false});
            let row = -1;
            let col = -1;

            switch (actions[index]) {
                case 'Piocher la carte cachée':
                    this.gameCommand.drawCard(false);
                    break;
                case 'Piocher la carte de la défausse':
                    this.gameCommand.drawCard(true);
                    break;
                case 'Jouer la carte piochée':
                    row = readlineSync.questionInt('Ligne (1-3) : ') - 1;
                    col = readlineSync.questionInt('Colonne (1-4) : ') - 1;
                    this.gameCommand.playDrawnCard(row, col);
                    readlineSync.prompt('Appuez sur "entrée" pour passer au tour suivant');
                    console.clear();

                    break;
                case 'Défausser la carte piochée':
                    this.gameCommand.discardDrawnCard();
                    console.log('Carte à retourner.');
                    row = readlineSync.questionInt('Ligne (1-3) : ') - 1;
                    col = readlineSync.questionInt('Colonne (1-4) : ') - 1;
                    this.gameCommand.revealCard(row, col);
                    readlineSync.prompt('Appuez sur "entrée" pour passer au tour suivant');
                    console.clear();

                    break;
                case 'Quitter':
                    console.log('Fin du jeu.');
                    process.exit(0);
            }

        }

    }
}
