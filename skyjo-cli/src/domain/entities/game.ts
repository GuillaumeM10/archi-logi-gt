import {Player} from './player';
import {Card} from './card';

export class Game {
    players: Player[];
    deck: Card[];
    discardPile: Card[];
    currentPlayerIndex: number;
    gameOver: boolean;
    started: boolean;
    mustPlayDrawnCard: boolean;
    drawnCard?: Card;
    lastRound: boolean;
    isCardFromDiscardPile: boolean;
    userIndexTerminatingGameFirst: number;

    constructor() {
        this.players = [];
        this.deck = this.createDeck();
        this.discardPile = [];
        this.currentPlayerIndex = 0;
        this.gameOver = false;
        this.started = false;
        this.mustPlayDrawnCard = false;
        this.lastRound = false;
        this.isCardFromDiscardPile = false;
    }

    shuffleDeck(): void {
        this.deck.sort(() => Math.random() - 0.5);
    }

    startGame(): void {
        if (this.players.length < 2) {
            console.log('❌ Il faut au moins 2 joueurs pour commencer.');
            return;
        }
        this.shuffleDeck();
        this.players.forEach(player => player.initializeGrid(this.deck));
        this.discardPile.push(this.deck.pop() as Card);
        this.started = true;
        console.log(`🎲 La partie commence ! ${this.getCurrentPlayer().name} joue en premier.`);
    }

    drawCard(fromDiscard: boolean): void {
        if (this.mustPlayDrawnCard) {
            console.log('❌ Vous devez d’abord jouer la carte que vous avez déjà piochée.');
            return;
        }

        this.isCardFromDiscardPile = fromDiscard;
        this.drawnCard = fromDiscard ? this.discardPile.pop() : this.deck.pop();
        if (this.drawnCard) this.drawnCard.isVisible = true;
        this.mustPlayDrawnCard = true;
        console.log(`🃏 ${this.getCurrentPlayer().name} a pioché une carte de valeur ${this.drawnCard?.value}`);
    }

    playDrawnCard(row: number, col: number): void {
        if (!this.mustPlayDrawnCard || !this.drawnCard) {
            console.log('❌ Vous devez d’abord piocher une carte.');
            return;
        }

        const player = this.getCurrentPlayer();
        this.discardPile.push(player.grid[row][col]);
        player.replaceCard(row, col, this.drawnCard);
        player.checkAndRemoveColumn(this.discardPile);

        this.mustPlayDrawnCard = false;
        this.drawnCard = undefined;

        console.log(`✅ Grille mise à jour pour ${player.name}`);
        player.displayGrid();

        this.trackFirstPlayerToFinish()

        this.nextTurn();

    }

    discardDrawnCard(): void {
        if (!this.mustPlayDrawnCard || !this.drawnCard) {
            console.log('❌ Vous devez d’abord piocher une carte.');
            return;
        }

        console.log(`🗑️ ${this.getCurrentPlayer().name} a défaussé une carte de valeur ${this.drawnCard.value}`);
        this.discardPile.push(this.drawnCard);
        this.mustPlayDrawnCard = false;
        this.drawnCard = undefined;
    }

    getGameState(): {
        started: boolean;
        isCardFromDiscardPile: boolean;
        discardTop: number;
        drawnCard: Card | undefined;
        isGameTerminated: boolean;
    } {
        return {
            started: this.started,
            isCardFromDiscardPile: this.isCardFromDiscardPile,
            discardTop: this.discardPile.length > 0 ? this.discardPile[this.discardPile.length - 1].value : 0,
            drawnCard: this.drawnCard,
            isGameTerminated: this.gameOver,
        };
    }

    createDeck(): Card[] {
        let values = [-1, ...Array.from({length: 12}, (_, i) => i + 1)];
        let deck = values.flatMap(value => Array.from({length: 10}, () => new Card(value)));
        deck = deck.concat(Array.from({length: 15}, () => new Card(0)));
        deck = deck.concat(Array.from({length: 5}, () => new Card(-2)));

        return deck;
    }

    addPlayer(player: Player): void {
        if (this.started) {
            console.log('❌ Impossible d’ajouter un joueur : la partie a déjà commencé.');
            return;
        }
        if (!player.name.trim()) {
            console.log("Veuillez renseinger un nom du joueur")
            return;
        }
        this.players.push(player);
    }


    revealCard(row: number, col: number): void {
        if (this.mustPlayDrawnCard) {
            console.log('❌ Vous devez d’abord jouer la carte que vous avez déjà piochée.');
            return;
        }

        const player = this.getCurrentPlayer();
        player.revealCard(row, col);
        player.checkAndRemoveColumn(this.discardPile);

        player.displayGrid();

        this.trackFirstPlayerToFinish()
        this.nextTurn();

    }

    getCurrentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    nextTurn(): void {
        if (this.gameOver) return;

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

        if (this.currentPlayerIndex === this.userIndexTerminatingGameFirst) {
            this.endGame()
        }
    }

    trackFirstPlayerToFinish(): void {
        if (!this.userIndexTerminatingGameFirst) {
            const firstFinishingPlayerIndex = this.players.findIndex(player => player.allCardsRevealed());

            if (firstFinishingPlayerIndex !== -1) {
                this.userIndexTerminatingGameFirst = firstFinishingPlayerIndex;
                console.log(`🏁 ${this.players[firstFinishingPlayerIndex].name} a terminé ses cartes en premier !`);
            }
        }
    }


    endGame(): void {
        console.log('\n🎉 Fin de la partie !');
        this.gameOver = true;

        this.displayScore();
    }

    getPlayers(): Player[] {
        return this.players;
    }

    displayScore(): void {
        console.log("Tableau des scores de la manche :\n",this.players.map(player => {
            player.calculateScore()
            return player.name + ' - ' + player.score;
        }).join("\n"));
    }
}
